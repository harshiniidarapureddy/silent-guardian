from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import bcrypt
import random
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'silent_guardian_db')
JWT_SECRET = os.environ.get('JWT_SECRET', 'secret')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Silent Guardian API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("silent_guardian")

# ============== MODELS ==============
class SignupIn(BaseModel):
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: str = "patient"  # patient | hospital | admin

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileIn(BaseModel):
    preferred_name: str
    age_bracket: str  # under5 | teen | adult | married | graduate | senior
    language: str  # en | hi | te | ta | es
    location: str
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None
    managed_by_guardian: bool = False
    first_aid_cpr: bool = False
    blood_group: str
    willing_to_donate: bool = False

class TriageIn(BaseModel):
    message: str
    session_id: str

class SOSAlertIn(BaseModel):
    kind: str  # medical | blood | first_aid
    severity: str  # critical | high | medium | low
    note: str
    location: Optional[str] = None

class FeedbackIn(BaseModel):
    source: str  # patient | hospital
    rating: int
    message: str

class AwarenessIn(BaseModel):
    title: str
    body: str
    language: str
    category: str

class VerifyHospitalIn(BaseModel):
    hospital_id: str
    approve: bool

# ============== AUTH HELPERS ==============
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, h: str) -> bool:
    return bcrypt.checkpw(pw.encode(), h.encode())

def make_token(user_id: str, role: str) -> str:
    payload = {"sub": user_id, "role": role, "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing auth")
    try:
        data = jwt.decode(authorization.split(" ", 1)[1], JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": data["sub"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user

# ============== AUTH ROUTES ==============
@api.post("/auth/signup")
async def signup(body: SignupIn):
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(400, "Email already exists")
    role = body.role if body.role in ("patient", "hospital", "admin") else "patient"
    if role == "admin" and await db.users.find_one({"role": "admin"}):
        raise HTTPException(400, "Admin already exists")
    user = {
        "id": str(uuid.uuid4()),
        "email": body.email,
        "phone": body.phone,
        "role": role,
        "password": hash_pw(body.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "onboarded": False,
    }
    await db.users.insert_one(user)
    return {"token": make_token(user["id"], role), "user": {k: v for k, v in user.items() if k not in ("_id", "password")}}

@api.post("/auth/login")
async def login(body: LoginIn):
    u = await db.users.find_one({"email": body.email})
    if not u or not verify_pw(body.password, u["password"]):
        raise HTTPException(401, "Invalid credentials")
    return {"token": make_token(u["id"], u["role"]), "user": {k: v for k, v in u.items() if k not in ("_id", "password")}}

@api.get("/auth/me")
async def me(user=Depends(current_user)):
    return user

# ============== ONBOARDING / PROFILE ==============
@api.post("/profile")
async def set_profile(body: ProfileIn, user=Depends(current_user)):
    doc = body.model_dump()
    doc["user_id"] = user["id"]
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.profiles.update_one({"user_id": user["id"]}, {"$set": doc}, upsert=True)
    await db.users.update_one({"id": user["id"]}, {"$set": {"onboarded": True, "preferred_name": body.preferred_name}})
    return {"ok": True}

@api.get("/profile")
async def get_profile(user=Depends(current_user)):
    p = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    return p or {}

# ============== AI TRIAGE (Gemini 3 Flash, streaming) ==============
TRIAGE_SYSTEM = (
    "You are 'Silent Guardian', a cautious, warm AI health triage assistant. "
    "You NEVER give a definitive diagnosis. You ask 1-2 clarifying questions when needed, "
    "then suggest (a) likely severity level (low/medium/high/critical), "
    "(b) the correct type of medical specialist to consult (e.g., Cardiologist, Pediatrician, ENT), "
    "(c) safe home-care steps if minor, (d) when to seek emergency care. "
    "Keep responses concise, non-alarming, under 180 words. "
    "If the user describes life-threatening symptoms (chest pain + sweating, stroke signs, severe bleeding, "
    "unconsciousness), say 'SEEK EMERGENCY CARE NOW' at the top and recommend calling local emergency services. "
    "Always end with: 'This is guidance, not a diagnosis.'"
)

@api.post("/triage/chat")
async def triage_chat(body: TriageIn, user=Depends(current_user)):
    async def gen():
        try:
            chat = (LlmChat(api_key=EMERGENT_LLM_KEY, session_id=body.session_id, system_message=TRIAGE_SYSTEM)
                    .with_model("gemini", "gemini-3-flash-preview"))
            full = ""
            async for ev in chat.stream_message(UserMessage(text=body.message)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield ev.content
                elif isinstance(ev, StreamDone):
                    break
            # Persist turn
            await db.triage_messages.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "session_id": body.session_id,
                "user_msg": body.message,
                "assistant_msg": full,
                "ts": datetime.now(timezone.utc).isoformat(),
            })
        except Exception as e:
            log.exception("triage error")
            yield f"\n\n[Assistant temporarily unavailable: {str(e)[:80]}]"
    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

@api.get("/triage/history")
async def triage_history(user=Depends(current_user)):
    items = await db.triage_messages.find({"user_id": user["id"]}, {"_id": 0}).sort("ts", -1).to_list(50)
    return items

# ============== HOSPITALS ==============
@api.get("/hospitals")
async def list_hospitals(specialty: Optional[str] = None, q: Optional[str] = None):
    query = {}
    if specialty and specialty != "all":
        query["specialties"] = specialty
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    items = await db.hospitals.find(query, {"_id": 0}).to_list(100)
    return items

@api.get("/hospitals/{hid}")
async def hospital_detail(hid: str):
    h = await db.hospitals.find_one({"id": hid}, {"_id": 0})
    if not h:
        raise HTTPException(404, "Not found")
    return h

# ============== PATIENTS (hospital portal) ==============
@api.get("/patients")
async def list_patients(gender: Optional[str] = None, severity: Optional[str] = None,
                        issue: Optional[str] = None, location: Optional[str] = None,
                        q: Optional[str] = None, page: int = 1, per_page: int = 20):
    query = {}
    if gender and gender != "all": query["gender"] = gender
    if severity and severity != "all": query["severity"] = severity
    if issue and issue != "all": query["issue"] = {"$regex": issue, "$options": "i"}
    if location and location != "all": query["location"] = {"$regex": location, "$options": "i"}
    if q: query["name"] = {"$regex": q, "$options": "i"}
    total = await db.patients.count_documents(query)
    items = await db.patients.find(query, {"_id": 0}).skip((page-1)*per_page).limit(per_page).to_list(per_page)
    return {"total": total, "page": page, "per_page": per_page, "items": items}

@api.get("/patients/stats")
async def patient_stats():
    sev = {}
    for s in ("critical", "high", "medium", "low"):
        sev[s] = await db.patients.count_documents({"severity": s})
    total = await db.patients.count_documents({})
    admitted = await db.patients.count_documents({"admitted": True})
    return {"total": total, "admitted": admitted, "severity": sev}

# ============== ALERTS / SOS / BLOOD ==============
@api.post("/alerts")
async def create_alert(body: SOSAlertIn, user=Depends(current_user)):
    doc = body.model_dump()
    doc.update({"id": str(uuid.uuid4()), "user_id": user["id"],
                "created_at": datetime.now(timezone.utc).isoformat(), "status": "open"})
    await db.alerts.insert_one(doc)
    return {"ok": True, "id": doc["id"]}

@api.get("/alerts")
async def list_alerts(kind: Optional[str] = None):
    q = {}
    if kind and kind != "all": q["kind"] = kind
    items = await db.alerts.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api.get("/blood/requests")
async def blood_requests():
    items = await db.blood_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

# ============== AWARENESS FEED ==============
@api.get("/awareness")
async def awareness(language: str = "en"):
    items = await db.awareness.find({"language": language}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@api.post("/awareness")
async def create_awareness(body: AwarenessIn, user=Depends(current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    doc = body.model_dump()
    doc.update({"id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat(), "author": user["email"]})
    await db.awareness.insert_one(doc)
    return {"ok": True, "id": doc["id"]}

# ============== MEDICINE GUIDE ==============
@api.get("/medicines")
async def medicines():
    items = await db.medicines.find({}, {"_id": 0}).to_list(100)
    return items

# ============== HOSPITAL DASHBOARD DATA ==============
@api.get("/hospital/overview")
async def hospital_overview(user=Depends(current_user)):
    stats = await patient_stats()
    beds = await db.beds.find_one({"id": "main"}, {"_id": 0}) or {
        "total": 240, "available": 58, "icu_total": 30, "icu_available": 4,
        "er_total": 20, "er_available": 7, "ventilator_total": 15, "ventilator_available": 3,
    }
    amb = {
        "total": await db.ambulances.count_documents({}),
        "out": await db.ambulances.count_documents({"status": "out"}),
        "available": await db.ambulances.count_documents({"status": "available"}),
    }
    return {"patients": stats, "beds": beds, "ambulances": amb}

@api.get("/ambulances")
async def ambulances():
    return await db.ambulances.find({}, {"_id": 0}).to_list(100)

@api.get("/doctors")
async def doctors():
    return await db.doctors.find({}, {"_id": 0}).to_list(100)

@api.get("/pharmacy")
async def pharmacy():
    return await db.pharmacy.find({}, {"_id": 0}).to_list(100)

# ============== ADMIN ==============
@api.get("/admin/network")
async def admin_network(user=Depends(current_user)):
    if user["role"] != "admin": raise HTTPException(403, "Admin only")
    return {
        "patients": await db.users.count_documents({"role": "patient"}),
        "hospitals_active": await db.hospitals.count_documents({"verified": True}),
        "hospitals_pending": await db.hospitals.count_documents({"verified": False}),
        "guardians": await db.profiles.count_documents({"managed_by_guardian": False, "guardian_name": {"$ne": None}}),
        "first_aid_responders": await db.profiles.count_documents({"first_aid_cpr": True}),
        "blood_donors": await db.profiles.count_documents({"willing_to_donate": True}),
        "total_triages": await db.triage_messages.count_documents({}),
        "open_alerts": await db.alerts.count_documents({"status": "open"}),
    }

@api.get("/admin/verification-queue")
async def verification_queue(user=Depends(current_user)):
    if user["role"] != "admin": raise HTTPException(403, "Admin only")
    return await db.hospitals.find({"verified": False}, {"_id": 0}).to_list(50)

@api.post("/admin/verify")
async def verify_hospital(body: VerifyHospitalIn, user=Depends(current_user)):
    if user["role"] != "admin": raise HTTPException(403, "Admin only")
    if body.approve:
        await db.hospitals.update_one({"id": body.hospital_id}, {"$set": {"verified": True}})
    else:
        await db.hospitals.delete_one({"id": body.hospital_id})
    return {"ok": True}

@api.get("/feedback")
async def list_feedback():
    return await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

@api.post("/feedback")
async def post_feedback(body: FeedbackIn, user=Depends(current_user)):
    doc = body.model_dump()
    doc.update({"id": str(uuid.uuid4()), "user_id": user["id"],
                "created_at": datetime.now(timezone.utc).isoformat()})
    await db.feedback.insert_one(doc)
    return {"ok": True}

@api.get("/admin/scams")
async def scams(user=Depends(current_user)):
    if user["role"] != "admin": raise HTTPException(403, "Admin only")
    return await db.scams.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

@api.get("/")
async def root():
    return {"service": "Silent Guardian API", "status": "ok"}

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
