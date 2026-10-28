import { Hospital, PatientRecord, Medicine, AwarenessArticle, Doctor, Ambulance, PharmacyItem, BloodDonor, BloodRequest, AdminAuditLog, NotificationItem, ScamReport, FeedbackItem, GuardianAlert } from '../types';

export interface VideoAwarenessGuide {
  id: string;
  title: string;
  category: string;
  duration: string;
  language: string; // 'en' | 'hi' | 'te' | 'ta' | 'bn' | 'es'
  videoThumbnail: string;
  description: string;
  emergencySteps: string[];
  keyDoAndDont: { do: string[]; dont: string[] };
  visualPhases?: Array<{ time: string; title: string; instruction: string; visualType: 'metronome' | 'airway' | 'warning_sign' | 'aed' | 'triage_flag' }>;
}

const CITIES = [
  "Hyderabad", "Bengaluru", "Mumbai", "Delhi NCR", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Chandigarh", "Kochi", "Coimbatore", "Visakhapatnam", "Indore",
  "Bhopal", "Nagpur", "Patna", "Surat", "Vadodara"
];

const HOSPITAL_PREFIXES = [
  "Apollo", "Fortis", "Manipal", "Max Super Specialty", "Care",
  "KIMS", "Rainbow Children's", "Medanta", "Ruby Hall Clinic", "Narayana Health",
  "Aster Prime", "Global Gleneagles", "Columbia Asia", "Yashoda", "Sunshine",
  "LifeLine", "Citizen's", "Continental", "SevenHills", "Lilavati",
  "Hinduja", "Amrita", "SIMS", "Peerless", "Apex Emergency"
];

// Procedural generator for 520+ Hospitals across major cities and districts
export function generate500Hospitals(): Hospital[] {
  const specialtiesList = [
    ["Cardiology", "Trauma", "Emergency Care", "Critical Care"],
    ["Pediatrics", "Neonatology", "Emergency Care"],
    ["Neurology", "Neurosurgery", "Stroke Care", "Emergency Care"],
    ["Orthopedics", "Joint Replacement", "Trauma & Fracture"],
    ["Oncology", "Hematology", "Palliative Care"],
    ["Gastroenterology", "Hepatology", "Emergency Endoscopy"],
    ["Pulmonology", "Respiratory ICU", "Critical Care"],
    ["General Medicine", "Infectious Diseases", "Dialysis", "Emergency Care"],
    ["Obstetrics & Gynecology", "Maternal ICU", "Neonatal Emergency"],
  ];

  const hospitals: Hospital[] = [];

  for (let i = 1; i <= 520; i++) {
    const city = CITIES[(i - 1) % CITIES.length];
    const prefix = HOSPITAL_PREFIXES[(i - 1) % HOSPITAL_PREFIXES.length];
    const branchNo = Math.floor((i - 1) / HOSPITAL_PREFIXES.length) + 1;
    const name = `${prefix} Hospital & Research Center (Branch ${branchNo})`;
    const specs = specialtiesList[(i - 1) % specialtiesList.length];
    const isPending = i % 8 === 0;

    const availableBeds = 10 + ((i * 13) % 85);
    const icuAvailable = 1 + ((i * 7) % 15);
    const erAvailable = 2 + ((i * 5) % 12);
    const ventAvailable = ((i * 3) % 8);

    hospitals.push({
      id: `hosp-${i}`,
      name: isPending ? `${name} [Pending Audit]` : name,
      city,
      address: `Sector ${(i % 45) + 1}, Metro Road, ${city}`,
      phone: `+91 ${70 + (i % 25)} ${(1000 + i * 7).toString().padStart(4, '0')} ${(2000 + i * 3).toString().padStart(4, '0')}`,
      specialties: specs,
      verified: !isPending,
      rating: Number((4.1 + ((i % 9) * 0.1)).toFixed(1)),
      available_beds: availableBeds,
      icu_available: icuAvailable,
      er_available: erAvailable,
      ventilator_available: ventAvailable,
      emergency_open: true,
    });
  }

  return hospitals;
}

// Procedural generator for 550+ Patient Records in hospital intake queue
export function generate550Patients(): PatientRecord[] {
  const firstNamesM = ["Ramesh", "Suresh", "Vikram", "Arjun", "Aditya", "Rajesh", "Kiran", "Deepak", "Amit", "Girish", "Manish", "Sunil", "Pradeep", "Naveen", "Raghav", "Farooq", "Zafar", "Irfan", "Gurpreet", "Harpreet"];
  const firstNamesF = ["Sunita", "Ananya", "Pooja", "Kavitha", "Sneha", "Lakshmi", "Fatima", "Priyanka", "Deepa", "Divya", "Swathi", "Meenakshi", "Aarthi", "Ritu", "Neha", "Shalini", "Tanvi", "Zoya", "Ayesha", "Kalyani"];
  const lastNames = ["Sharma", "Verma", "Patel", "Reddy", "Rao", "Nair", "Iyer", "Malhotra", "Choudhary", "Mukherjee", "Singh", "Kulkarni", "Khan", "Ahmed", "Bansal", "Sen", "Bose", "Menon", "Joshi", "Deshmukh"];

  const issuesWithSeverity: Array<{ issue: string; severity: 'critical' | 'high' | 'medium' | 'low'; dept: string }> = [
    { issue: "Severe crushing chest pain radiating to jaw and diaphoresis", severity: "critical", dept: "Cardiology" },
    { issue: "Acute ischemic stroke with right-sided hemiparesis & aphasia", severity: "critical", dept: "Neurology" },
    { issue: "Multi-trauma blunt abdominal injury following vehicular collision", severity: "critical", dept: "Trauma" },
    { issue: "Massive upper gastrointestinal bleeding with hypovolemic shock", severity: "critical", dept: "Gastroenterology" },
    { issue: "Acute severe asthma exacerbation unresponsive to nebulization", severity: "high", dept: "Pulmonology" },
    { issue: "High grade febrile convulsions in pediatric patient", severity: "high", dept: "Pediatrics" },
    { issue: "Acute appendicitis with localized peritoneal guarding", severity: "high", dept: "General Surgery" },
    { issue: "Third-degree thermal burn over lower extremities (18% TBSA)", severity: "high", dept: "Burn ICU" },
    { issue: "Severe allergic anaphylactic angioedema post medication", severity: "high", dept: "Emergency Medicine" },
    { issue: "Closed fracture of right tibia and fibula following fall", severity: "medium", dept: "Orthopedics" },
    { issue: "Intractable migraine attack with photophobia and persistent emesis", severity: "medium", dept: "Neurology" },
    { issue: "Severe acute gastroenteritis with moderate dehydration", severity: "medium", dept: "Internal Medicine" },
    { issue: "Deep laceration on left forearm requiring layered suturing", severity: "medium", dept: "Emergency Medicine" },
    { issue: "Acute lumbar disc herniation with unilateral radiculopathy", severity: "medium", dept: "Orthopedics" },
    { issue: "Mild respiratory tract infection with low-grade pyrexia", severity: "low", dept: "General Medicine" },
    { issue: "Chronic superficial gastritis exacerbation", severity: "low", dept: "Gastroenterology" },
    { issue: "Minor sprain of left lateral ankle ligament", severity: "low", dept: "Physiotherapy" },
    { issue: "Localized contact dermatitis rash with pruritus", severity: "low", dept: "Dermatology" },
  ];

  const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const locations = ["Jubilee Hills", "Banjara Hills", "Gachibowli", "Madhapur", "Kondapur", "Kukatpally", "Begumpet", "Somajiguda", "Hitech City", "Charminar", "Secunderabad", "Ameerpet"];

  const patients: PatientRecord[] = [];

  for (let i = 1; i <= 550; i++) {
    const isMale = i % 2 === 0;
    const fList = isMale ? firstNamesM : firstNamesF;
    const fName = fList[(i - 1) % fList.length];
    const lName = lastNames[Math.floor((i - 1) / 2) % lastNames.length];
    const fullName = `${fName} ${lName}`;
    const issueObj = issuesWithSeverity[(i - 1) % issuesWithSeverity.length];
    const age = 5 + ((i * 17) % 78);
    const bg = bloodGroups[(i - 1) % bloodGroups.length];
    const loc = locations[(i - 1) % locations.length];
    const isAdmitted = issueObj.severity === 'critical' || (issueObj.severity === 'high' && i % 2 === 0);

    patients.push({
      id: `pat-${i}`,
      name: fullName,
      age,
      gender: isMale ? "Male" : "Female",
      issue: issueObj.issue,
      severity: issueObj.severity,
      location: loc,
      blood_group: bg,
      assigned_doctor: `Dr. ${lastNames[(i + 3) % lastNames.length]} (${issueObj.dept})`,
      admitted: isAdmitted,
      admission_time: `${(i % 12) + 1} hours ago`,
    });
  }

  return patients;
}

// Procedural generator for 520+ Ambulances (ACLS, BLS, Neonatal, Rapid Bike Units)
export function generate500Ambulances(): Ambulance[] {
  const ambulanceTypes = [
    "ACLS (Cardiac Life Support)",
    "BLS (Basic Life Support)",
    "Neonatal Emergency ICU",
    "Trauma Mobile Unit",
    "First-Response Rapid Bike"
  ];

  const driverFirstNames = ["Ramesh", "Suresh", "Naresh", "Venkatesh", "Ghouse", "Sudhakar", "Manjit", "Balwinder", "Prabhu", "Murugan", "Anand", "Dinesh", "Yogesh", "Imran", "Farhan", "Rakesh", "Vijay", "Satish"];
  const driverLastNames = ["Reddy", "Basha", "Varma", "Yadav", "Singh", "Pillai", "Patil", "Gowda", "Kumar", "Sharma", "Nair", "Iyer", "Rathore", "Chauhan"];

  const statuses: Array<'available' | 'out' | 'maintenance'> = ['available', 'available', 'out', 'available', 'out', 'maintenance'];

  const equipmentSets: Record<string, string[]> = {
    "ACLS (Cardiac Life Support)": ["Biphasic Defibrillator", "Transport Ventilator", "Syringe Infusion Pump", "12-Lead ECG", "Emergency Cardiac Med Kit", "Oxygen Pipeline"],
    "BLS (Basic Life Support)": ["Stretcher Trolley", "Oxygen Cylinder", "Automated External Defibrillator (AED)", "Trauma Splint Kit", "Bag-Valve Mask"],
    "Neonatal Emergency ICU": ["Transport Incubator", "Pediatric Syringe Pump", "Neo-Ventilator", "Heated Mattress", "Pediatric Resuscitation Kit"],
    "Trauma Mobile Unit": ["Spinal Immobilization Board", "Head Immobilizers", "Pneumatic Splints", "Blood Warming Unit", "Emergency Surgical Cut-Down Kit"],
    "First-Response Rapid Bike": ["AED Compact", "Emergency Drug Injector Kit", "Pocket Oxygen Resuscitator", "Tourniquet Bandages", "Vitals Monitor"]
  };

  const stateCodes = ["TS 09", "KA 01", "DL 04", "MH 12", "TN 02", "WB 01", "GJ 01", "UP 32", "RJ 14", "AP 39"];
  const localities = ["Jubilee Hills Checkpost", "Banjara Hills Rd 12", "Hitech City Flyover", "Gachibowli Outer Ring", "Secunderabad Station", "Kukatpally Y Junction", "Begumpet Airport Rd", "Madhapur Durgam Cheruvu", "Charminar South", "Ameerpet Metro"];

  const ambulances: Ambulance[] = [];

  for (let i = 1; i <= 520; i++) {
    const type = ambulanceTypes[(i - 1) % ambulanceTypes.length];
    const stateCode = stateCodes[(i - 1) % stateCodes.length];
    const series = String.fromCharCode(65 + ((i * 3) % 26)) + String.fromCharCode(65 + ((i * 7) % 26));
    const regNum = (1000 + i * 3).toString().padStart(4, '0');
    const vehicle_no = `${stateCode} ${series} ${regNum}`;

    const driverName = `${driverFirstNames[(i - 1) % driverFirstNames.length]} ${driverLastNames[(i * 2) % driverLastNames.length]}`;
    const status = statuses[(i - 1) % statuses.length];
    const city = CITIES[(i - 1) % CITIES.length];
    const loc = status === 'out' 
      ? `Dispatched: En route via ${localities[(i - 1) % localities.length]}`
      : status === 'maintenance'
      ? `Fleet Service Bay - ${city} Central`
      : `Stationed at ${HOSPITAL_PREFIXES[(i - 1) % HOSPITAL_PREFIXES.length]} ER Bay`;

    ambulances.push({
      id: `amb-${i}`,
      vehicle_no,
      driver_name: driverName,
      driver_phone: `+91 ${90 + (i % 9)} ${(1000 + i * 5).toString().padStart(4, '0')} ${(2000 + i * 7).toString().padStart(4, '0')}`,
      status,
      location: loc,
      current_call: status === 'out' ? (i % 2 === 0 ? "Acute STEMI heart attack transit" : "Multi-trauma highway rescue") : undefined,
      type,
      equipment: equipmentSets[type] || equipmentSets["BLS (Basic Life Support)"],
      hospital_affiliation: `${HOSPITAL_PREFIXES[(i - 1) % HOSPITAL_PREFIXES.length]} Multispecialty`,
      eta_minutes: status === 'available' ? 4 + (i % 8) : 14 + (i % 18),
      city,
    });
  }

  return ambulances;
}

// Procedural generator for 520+ Doctors and Medical Staff
export function generate500Doctors(): Doctor[] {
  const specialties = [
    { title: "Interventional Cardiology", dept: "Cardiac Sciences & Cath Lab", degrees: "MBBS, MD (Gen Med), DM (Cardiology), FACC", prefix: "Dr. (Cardio)" },
    { title: "Neurology & Acute Stroke Care", dept: "Neuro Sciences & Stroke Unit", degrees: "MBBS, MD (Medicine), DM (Neurology), FINR", prefix: "Dr. (Neuro)" },
    { title: "Trauma & Orthopedic Surgery", dept: "Trauma & Joint Replacement Center", degrees: "MBBS, MS (Orthopedics), MCh (Ortho, UK)", prefix: "Dr. (Ortho)" },
    { title: "Pediatric Critical Care & NICU", dept: "Pediatric Emergency & NICU", degrees: "MBBS, MD (Pediatrics), Fellowship in Neonatology", prefix: "Dr. (Peds)" },
    { title: "Pulmonology & ECMO Intensive Care", dept: "Respiratory Critical Care & ECMO", degrees: "MBBS, DNB (Respiratory Med), FCCP, EDIC", prefix: "Dr. (Pulmo)" },
    { title: "Emergency Medicine & Resuscitation", dept: "Emergency Triage & Resuscitation", degrees: "MBBS, MD (Emergency Medicine), MRCEM (UK)", prefix: "Dr. (ER)" },
    { title: "Surgical Oncology & Gastrointestinal", dept: "Comprehensive Cancer Institute", degrees: "MBBS, MS (Gen Surgery), MCh (Surgical Oncology)", prefix: "Dr. (Onco)" },
    { title: "High-Risk Obstetrics & Maternal ICU", dept: "Obstetrics & Maternal Critical Care", degrees: "MBBS, MS (OBG), FRCS, Dip. Pelvic Endoscopy", prefix: "Dr. (OBG)" },
    { title: "Nephrology & Renal Dialysis", dept: "Nephrology & Organ Transplant", degrees: "MBBS, MD (Medicine), DM (Nephrology), FISN", prefix: "Dr. (Nephro)" },
    { title: "Endocrinology & Diabetology", dept: "Endocrinology & Metabolic Center", degrees: "MBBS, MD (Medicine), DM (Endo), FACE", prefix: "Dr. (Endo)" }
  ];

  const firstNamesM = ["Srinivas", "Arvind", "Vikram", "Rajesh", "Zafar", "Naveen", "Deepak", "Alok", "Devendra", "Girish", "Manish", "Sunil", "Pradeep", "Raghav", "Farooq", "Aditya", "Sameer", "Harsh"];
  const firstNamesF = ["Preeti", "Nalini", "Meenakshi", "Sunita", "Ananya", "Kavitha", "Sneha", "Lakshmi", "Fatima", "Priyanka", "Deepa", "Divya", "Swathi", "Aarthi", "Ritu", "Neha", "Elena", "Tanya"];
  const lastNames = ["Rao", "Verma", "Srinivas", "Sundaram", "Ali", "Jain", "Gomez", "Sharma", "Patel", "Reddy", "Nair", "Iyer", "Malhotra", "Choudhary", "Mukherjee", "Singh", "Kulkarni", "Bansal", "Sen", "Menon"];

  const councilCodes = ["TSMC", "DMC", "KMC", "MMC", "TNMC", "WBMC", "GMC", "UPMC", "RMC", "INT"];
  const shifts = ["Morning (08:00 - 16:00)", "Day (10:00 - 18:00)", "Afternoon (14:00 - 22:00)", "Night (20:00 - 08:00)"];
  const statuses: Array<'available' | 'in_surgery' | 'rounds' | 'off'> = ['available', 'available', 'in_surgery', 'rounds', 'available', 'rounds'];

  const doctorPhotosM = [
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80"
  ];

  const doctorPhotosF = [
    "https://images.unsplash.com/photo-1594824813626-d66838a3962b?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80"
  ];

  const doctors: Doctor[] = [];

  for (let i = 1; i <= 520; i++) {
    const isMale = i % 2 !== 0;
    const fNames = isMale ? firstNamesM : firstNamesF;
    const photos = isMale ? doctorPhotosM : doctorPhotosF;
    const fName = fNames[(i - 1) % fNames.length];
    const lName = lastNames[Math.floor((i - 1) / 2) % lastNames.length];
    const spec = specialties[(i - 1) % specialties.length];

    const city = CITIES[(i - 1) % CITIES.length];
    const hospPrefix = HOSPITAL_PREFIXES[(i - 1) % HOSPITAL_PREFIXES.length];
    const hospitalName = `${hospPrefix} Multispecialty, ${city}`;

    const exp = 7 + ((i * 3) % 25);
    const councilCode = councilCodes[(i - 1) % councilCodes.length];
    const council_reg_no = `${councilCode}-${(30000 + i * 19).toString()}`;
    const rating = Number((4.5 + ((i % 6) * 0.1)).toFixed(1));
    const status = statuses[(i - 1) % statuses.length];
    const shift = shifts[(i - 1) % shifts.length];

    const opdStart = 8 + (i % 5);
    const opdEnd = opdStart + 4;
    const opd_hours = `${opdStart.toString().padStart(2, '0')}:00 - ${opdEnd.toString().padStart(2, '0')}:00`;

    doctors.push({
      id: `doc-${i}`,
      name: `Dr. ${fName} ${lName}, ${spec.degrees.split(',')[1]?.trim() || 'MD'}`,
      specialty: spec.title,
      degrees: spec.degrees,
      council_reg_no,
      experience_years: exp,
      hospital_name: hospitalName,
      hospital: hospitalName,
      city,
      opd_hours,
      available_days: i % 2 === 0 ? "Mon, Wed, Fri, Sat" : "Tue, Thu, Fri",
      languages: ["English", isMale ? "Hindi" : "Telugu", "Tamil"],
      rating,
      shift,
      status,
      department: spec.dept,
      photo_url: photos[(i - 1) % photos.length],
    });
  }

  return doctors;
}

// Procedural generator for 520+ Pharmacy Stock Items
export function generate500Pharmacy(): PharmacyItem[] {
  const pharmacyCategories = [
    { cat: "Emergency Injectable", units: "Ampoules", reorderBase: 40, roots: ["Epinephrine 1mg/ml", "Norepinephrine 4mg/4ml", "Dopamine 200mg/5ml", "Vasopressin 20 units/ml", "Hydrocortisone 100mg", "Dexamethasone 8mg/2ml", "Furosemide 20mg/2ml"] },
    { cat: "Emergency Cardiac & Antidote", units: "Vials", reorderBase: 35, roots: ["Atropine Sulfate 0.6mg", "Amiodarone 150mg/3ml", "Adenosine 6mg/2ml", "Naloxone HCl 0.4mg/ml", "Calcium Gluconate 10%", "Magnesium Sulfate 50%", "Flumazenil 0.5mg/5ml"] },
    { cat: "Critical Care Antibiotic", units: "Vials", reorderBase: 60, roots: ["Meropenem 1g IV", "Piperacillin-Tazobactam 4.5g", "Vancomycin 1g", "Colistin 1 Million IU", "Ceftriaxone 1g IV", "Linezolid 600mg IV", "Amikacin 500mg/2ml"] },
    { cat: "IV Fluids & Volume Expanders", units: "Bags", reorderBase: 120, roots: ["Normal Saline 0.9% 500ml", "Ringer Lactate (RL) 500ml", "Dextrose Normal Saline 500ml", "Hydroxyethyl Starch 6% 500ml", "Mannitol 20% 100ml", "Dextrose 25% 100ml", "Sodium Bicarbonate 7.5% 25ml"] },
    { cat: "Antiplatelet & Anticoagulant", units: "Tablets/Vials", reorderBase: 150, roots: ["Aspirin Dispersible 300mg", "Clopidogrel 75mg", "Enoxaparin 40mg Prefilled Syringe", "Enoxaparin 60mg Prefilled Syringe", "Heparin Sodium 25000 IU", "Ticagrelor 90mg", "Warfarin 5mg"] },
    { cat: "Emergency Analgesic & Sedative", units: "Ampoules/Bottles", reorderBase: 50, roots: ["Paracetamol IV Infusion 100ml", "Tramadol 100mg/2ml", "Ketorolac Tromethamine 30mg", "Midazolam 5mg/5ml", "Propofol 1% 20ml", "Fentanyl Citrate 100mcg/2ml", "Diclofenac Sodium 75mg/1ml"] },
    { cat: "Respiratory & Bronchodilator", units: "Respules/Puffs", reorderBase: 80, roots: ["Levosalbutamol Respules 1.25mg", "Ipratropium Bromide Respules", "Budesonide Respules 0.5mg", "Theophylline Injection 250mg", "Salbutamol Inhaler 100mcg", "Fluticasone Inhaler 125mcg", "Beclomethasone Rotacaps"] }
  ];

  const items: PharmacyItem[] = [];

  for (let i = 1; i <= 520; i++) {
    const catObj = pharmacyCategories[(i - 1) % pharmacyCategories.length];
    const root = catObj.roots[(i - 1) % catObj.roots.length];
    const batchSuffix = (i % 8) + 1;
    const name = `${root} (Batch B-${1000 + i * 2}-${batchSuffix})`;
    const reorder_level = catObj.reorderBase + (i % 20);
    // Let ~15% have low or critical stock for realistic alerts
    const isCritical = i % 7 === 0;
    const isLow = i % 5 === 0;
    const stock = isCritical ? Math.floor(reorder_level * 0.4) : isLow ? Math.floor(reorder_level * 0.9) : reorder_level + (i * 11) % 400;

    const expYear = 2026 + (i % 4);
    const expMonth = ((i * 2) % 12 + 1).toString().padStart(2, '0');

    items.push({
      id: `ph-${i}`,
      name,
      category: catObj.cat,
      stock,
      reorder_level,
      unit: catObj.units,
      expiry: `${expYear}-${expMonth}`,
    });
  }

  return items;
}

// Procedural generator for 520+ Verified Blood Donors across cities and blood groups
export function generate500BloodDonors(): BloodDonor[] {
  const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const firstNamesM = ["Ramesh", "Suresh", "Vikram", "Arjun", "Aditya", "Rajesh", "Kiran", "Deepak", "Amit", "Girish", "Manish", "Sunil", "Pradeep", "Naveen", "Raghav", "Farooq", "Zafar", "Irfan", "Gurpreet", "Harpreet"];
  const firstNamesF = ["Sunita", "Ananya", "Pooja", "Kavitha", "Sneha", "Lakshmi", "Fatima", "Priyanka", "Deepa", "Divya", "Swathi", "Meenakshi", "Aarthi", "Ritu", "Neha", "Shalini", "Tanvi", "Zoya", "Ayesha", "Kalyani"];
  const lastNames = ["Sharma", "Verma", "Patel", "Reddy", "Rao", "Nair", "Iyer", "Malhotra", "Choudhary", "Mukherjee", "Singh", "Kulkarni", "Khan", "Ahmed", "Bansal", "Sen", "Bose", "Menon", "Joshi", "Deshmukh"];
  const localities = ["Jubilee Hills", "Banjara Hills", "Koramangala", "Indiranagar", "Andheri West", "Bandra", "Connaught Place", "South Extension", "T Nagar", "Anna Nagar", "Salt Lake", "Park Street", "Aundh", "Kothrud"];

  const donors: BloodDonor[] = [];

  for (let i = 1; i <= 520; i++) {
    const isMale = i % 2 !== 0;
    const fNames = isMale ? firstNamesM : firstNamesF;
    const name = `${fNames[(i - 1) % fNames.length]} ${lastNames[(i * 3) % lastNames.length]}`;
    const blood_group = bloodGroups[(i - 1) % bloodGroups.length];
    const city = CITIES[(i - 1) % CITIES.length];
    const location = `${localities[(i - 1) % localities.length]}, ${city}`;
    const donations_count = 1 + (i % 14);
    const monthsAgo = (i % 9) + 1;
    const eligible = monthsAgo >= 3;

    donors.push({
      id: `donor-${i}`,
      name,
      blood_group,
      city,
      location,
      phone: `+91 ${91 + (i % 8)} ${(1000 + i * 9).toString().padStart(4, '0')} ${(2000 + i * 2).toString().padStart(4, '0')}`,
      last_donated: `${monthsAgo} months ago`,
      eligible,
      verified_donor: i % 11 !== 0,
      donations_count,
    });
  }

  return donors;
}

// Procedural generator for 120+ Active Urgent Blood Requests across hospitals
export function generate120BloodRequests(): BloodRequest[] {
  const bloodGroups = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
  const urgencies: Array<'Immediate' | 'Within 6 hrs' | 'Within 24 hrs'> = ['Immediate', 'Immediate', 'Within 6 hrs', 'Within 24 hrs'];
  const patientTypes = [
    "Severe Obstetric Postpartum Hemorrhage",
    "Multi-Trauma Blunt Splenic Rupture",
    "Acute Leukemia Platelet Depletion",
    "Emergency Coronary Bypass Grafting",
    "Emergency Neonatal Exchange Transfusion",
    "Major Gastrointestinal Ulcer Bleed",
    "Emergency Craniotomy Hematoma",
    "Orthopedic Complex Pelvic Fixation"
  ];

  const requests: BloodRequest[] = [];

  for (let i = 1; i <= 120; i++) {
    const bg = bloodGroups[(i - 1) % bloodGroups.length];
    const urgency = urgencies[(i - 1) % urgencies.length];
    const pType = patientTypes[(i - 1) % patientTypes.length];
    const city = CITIES[(i - 1) % CITIES.length];
    const hosp = `${HOSPITAL_PREFIXES[(i - 1) % HOSPITAL_PREFIXES.length]} Emergency Care`;

    requests.push({
      id: `br-${i}`,
      patient_name: `${pType} (Pt ID #${4000 + i})`,
      blood_group: bg,
      units: 1 + (i % 5),
      hospital: hosp,
      city,
      urgency,
      contact: `+91 ${80 + (i % 15)} 2${(3000 + i * 4).toString().padStart(4, '0')} ext ${100 + (i % 40)}`,
      created_at: `${(i % 18) * 15 + 10} mins ago`,
    });
  }

  return requests;
}

// Procedural generator for 520+ Medicines with Efficacy Ratings and Clinical Indications
export function generate510Medicines(): Medicine[] {
  const baseClasses = [
    {
      cat: "Antibiotic & Antimicrobial",
      nameRoots: ["Amoxicillin-Clavulanate", "Azithromycin", "Ciprofloxacin", "Cefixime", "Doxycycline", "Levofloxacin", "Clindamycin", "Metronidazole"],
      goodFor: "Acute bacterial throat and lung infections, severe dental abscesses, urinary tract infections, and otitis media.",
      warning: "Complete full antibiotic course. Never self-prescribe for viral colds. Notify doctor immediately if severe diarrhea or hives emerge."
    },
    {
      cat: "Cardiovascular & Antihypertensive",
      nameRoots: ["Amlodipine", "Telmisartan", "Atorvastatin", "Metoprolol Succinate", "Ramipril", "Losartan Potassium", "Rosuvastatin", "Enalapril"],
      goodFor: "Essential hypertension blood pressure reduction, stroke risk mitigation, and post-myocardial infarction arterial protection.",
      warning: "Do not stop abruptly without tapering. Regular blood pressure and renal function electrolyte monitoring required."
    },
    {
      cat: "Analgesic & Antipyretic",
      nameRoots: ["Paracetamol (Acetaminophen)", "Ibuprofen", "Diclofenac Sodium", "Aceclofenac", "Tramadol HCl", "Naproxen Sodium", "Ketorolac", "Mefenamic Acid"],
      goodFor: "High-grade pyrexia fever reduction, acute tension headache, musculoskeletal joint sprains, and inflammatory pain.",
      warning: "Adhere strictly to daily dosage caps to protect liver and gastric mucosa. Take with or after food."
    },
    {
      cat: "Gastrointestinal & Acid Suppressant",
      nameRoots: ["Pantoprazole", "Omeprazole", "Rabeprazole Sodium", "Ranitidine HCl", "Domperidone Sustained Release", "Ondansetron", "Sucralfate Gel", "Lactulose Solution"],
      goodFor: "Acid peptic GERD heartburn relief, gastric erosion protection during NSAID use, and acute nausea control.",
      warning: "Best consumed 30-45 minutes before morning breakfast with plain water. Do not crush enteric coatings."
    },
    {
      cat: "Antidiabetic Glycemic Regulator",
      nameRoots: ["Metformin HCl Extended Release", "Glimepiride", "Teneligliptin", "Dapagliflozin", "Sitagliptin Phosphate", "Vildagliptin", "Gliclazide Modified Release", "Empagliflozin"],
      goodFor: "Type 2 diabetes glycemic control, HbA1c stabilization, and renal-cardiovascular protection.",
      warning: "Carry fast-acting glucose tablets. Monitor blood sugars regularly. Withhold before IV radiocontrast procedures."
    },
    {
      cat: "Respiratory & Antiallergic",
      nameRoots: ["Montelukast Sodium", "Levocetirizine Dihydrochloride", "Salbutamol Sulfate", "Budesonide Inhalant", "Formoterol Fumarate", "Fexofenadine HCl", "Bilastine", "Fluticasone Propionate"],
      goodFor: "Bronchial asthma wheezing prevention, acute seasonal allergic rhinitis, chronic urticaria skin welts.",
      warning: "Rinse mouth thoroughly with water after steroid inhalers. Use bronchodilators with spacer for optimal lung delivery."
    },
    {
      cat: "Neurological & Neuropathic Pain",
      nameRoots: ["Pregabalin", "Gabapentin", "Clonazepam", "Sertraline HCl", "Escitalopram Oxalate", "Amitriptyline", "Methylcobalamin Forte", "Baclofen"],
      goodFor: "Diabetic peripheral neuropathy tingling, chronic radiculopathy nerve pain, post-herpetic neuralgia, and spasm relief.",
      warning: "May cause initial drowsiness. Avoid alcohol. Never adjust dosage without neurologist consultation."
    },
  ];

  const dosages = ["5mg", "10mg", "20mg", "25mg", "40mg", "50mg", "100mg", "250mg", "500mg", "625mg"];
  const forms = ["Tablet", "Capsule", "Suspension", "Delayed-Release", "Dispersible"];

  const medicines: Medicine[] = [];

  for (let i = 1; i <= 520; i++) {
    const cls = baseClasses[(i - 1) % baseClasses.length];
    const root = cls.nameRoots[(i - 1) % cls.nameRoots.length];
    const dosage = dosages[(i * 3) % dosages.length];
    const form = forms[(i * 2) % forms.length];
    const name = `${root} ${dosage} (${form})`;
    const isRx = cls.cat.includes("Antibiotic") || cls.cat.includes("Cardiovascular") || cls.cat.includes("Antidiabetic") || cls.cat.includes("Neurological");

    const rating = Number((4.3 + ((i % 7) * 0.1)).toFixed(1));
    const efficacy_percent = 88 + (i % 11);

    const indicationTags: string[] = [];
    if (cls.cat.includes("Analgesic")) {
      indicationTags.push("fever", "headache", "body pain", "pyrexia", "flu", "temperature", "chills", "viral");
    } else if (cls.cat.includes("Respiratory")) {
      indicationTags.push("allergy", "rash", "skin allergy", "hives", "itching", "sneezing", "cough", "cold", "asthma", "wheezing");
    } else if (cls.cat.includes("Gastrointestinal")) {
      indicationTags.push("acidity", "stomach pain", "gas", "gerd", "heartburn", "indigestion", "nausea", "vomiting", "cramp");
    } else if (cls.cat.includes("Antibiotic")) {
      indicationTags.push("infection", "bacterial", "sore throat", "wound", "dental", "fever", "urinary");
    } else if (cls.cat.includes("Cardiovascular")) {
      indicationTags.push("blood pressure", "hypertension", "heart", "cholesterol", "cardiac");
    } else if (cls.cat.includes("Antidiabetic")) {
      indicationTags.push("diabetes", "blood sugar", "glucose", "glycemic");
    } else if (cls.cat.includes("Neurological")) {
      indicationTags.push("nerve pain", "migraine", "neuropathy", "headache", "spasm", "tingling");
    }

    const basePriceNum = 35 + ((i * 11) % 220);
    const onlineApps = [
      {
        name: "Apollo 24|7 Pharmacy",
        app_id: "apollo" as const,
        in_stock: true,
        price: `₹${basePriceNum}`,
        discount_percent: 18 + (i % 12),
        delivery_eta: "⚡ 15-30 min hyper-local",
        buy_url: `https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(root)}`,
        logo_color: "emerald"
      },
      {
        name: "Tata 1mg",
        app_id: "1mg" as const,
        in_stock: true,
        price: `₹${Math.max(25, basePriceNum - 8)}`,
        discount_percent: 22,
        delivery_eta: "Today, within 2 hrs",
        buy_url: `https://www.1mg.com/search/all?name=${encodeURIComponent(root)}`,
        logo_color: "red"
      },
      {
        name: "PharmEasy",
        app_id: "pharmeasy" as const,
        in_stock: i % 8 !== 0,
        price: `₹${Math.max(20, basePriceNum - 12)}`,
        discount_percent: 25,
        delivery_eta: "Express (45 mins)",
        buy_url: `https://pharmeasy.in/search/all?name=${encodeURIComponent(root)}`,
        logo_color: "teal"
      },
      {
        name: "Netmeds",
        app_id: "netmeds" as const,
        in_stock: true,
        price: `₹${basePriceNum - 4}`,
        discount_percent: 20,
        delivery_eta: "Same-Day Delivery",
        buy_url: `https://www.netmeds.com/catalogsearch/result?q=${encodeURIComponent(root)}`,
        logo_color: "cyan"
      },
      {
        name: "MedPlus Mart",
        app_id: "medplus" as const,
        in_stock: true,
        price: `₹${basePriceNum - 6}`,
        discount_percent: 20,
        delivery_eta: "⚡ 20 min store pickup",
        buy_url: `https://www.medplusmart.com/search/${encodeURIComponent(root)}`,
        logo_color: "blue"
      }
    ];

    medicines.push({
      id: `med-${i}`,
      name,
      category: cls.cat,
      uses: `Indicated for clinical management of conditions requiring ${cls.cat.toLowerCase()} therapy. Helps maintain physiological balance under physician supervision.`,
      dosage: `Standard adult dosage: Take 1 ${form.toLowerCase()} ${i % 2 === 0 ? "once daily after principal meal" : "twice daily with water"} or as prescribed.`,
      side_effects: `Common: Mild gastrointestinal discomfort, headache, or dry mouth. Discontinue and consult physician if skin eruption occurs.`,
      precautions: `Review hepatic and renal panels periodically. Do not exceed prescribed timeframe. Keep stored below 25°C in a dry location.`,
      prescription_required: isRx,
      rating,
      efficacy_percent,
      good_for: cls.goodFor,
      warnings: cls.warning,
      indication_tags: indicationTags,
      online_apps: onlineApps,
    });
  }

  return medicines;
}

// Multilingual Interactive Medical Video Guides with Subtitles, Audio Pacing & Step-by-Step Emergency Checklists
export const MULTILINGUAL_VIDEO_GUIDES: VideoAwarenessGuide[] = [
  {
    id: "vid-cpr-en",
    title: "Hands-Only CPR & Cardiac Arrest Emergency Simulator",
    category: "Cardiac Emergency",
    duration: "3:45",
    language: "en",
    videoThumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    description: "Learn how to deliver continuous, high-quality chest compressions to a person whose heart has suddenly stopped beating. Compression rate: 100-120 BPM.",
    emergencySteps: [
      "Step 1: Verify scene safety and firmly tap collarbones. Shout 'Can you hear me? Are you okay?'",
      "Step 2: If unresponsive and not breathing normally or only gasping, immediately instruct someone to call 108 / 911 and fetch an AED.",
      "Step 3: Place the heel of one hand in the center of the chest (lower sternum). Interlock your other hand on top.",
      "Step 4: Lock elbows straight. Push down hard and fast at 100 to 120 compressions per minute (at least 2 inches / 5 cm deep). Allow full chest recoil between every push.",
      "Step 5: Do not interrupt compressions for more than 10 seconds until paramedics take over or the person shows signs of life."
    ],
    keyDoAndDont: {
      do: [
        "Lock elbows straight and use your upper body weight to drive compressions",
        "Maintain 100-120 BPM pacing (the tempo of 'Stayin Alive')",
        "Swap with another bystander every 2 minutes to avoid exhaustion"
      ],
      dont: [
        "Do not stop compressions to check for pulse unless breathing resumes",
        "Do not bend elbows while pushing down",
        "Do not hesitate—hands-only CPR doubles or triples cardiac arrest survival"
      ]
    },
    visualPhases: [
      { time: "0:00", title: "Scene Evaluation & Unresponsiveness Check", instruction: "Assess safety and check responsiveness.", visualType: "airway" },
      { time: "0:45", title: "Hand Positioning on Sternum", instruction: "Place heel of hand on center of lower chest.", visualType: "metronome" },
      { time: "1:20", title: "Continuous 100-120 BPM Compressions", instruction: "Push hard & fast at least 2 inches deep.", visualType: "metronome" },
      { time: "2:30", title: "AED Pad Attachment & Shock Delivery", instruction: "Follow AED voice prompts while continuing CPR.", visualType: "aed" },
    ]
  },
  {
    id: "vid-early-symptoms-en",
    title: "Don't Ignore The Signs: The Danger of Neglecting Early Minor Symptoms",
    category: "Early Health Awareness",
    duration: "4:15",
    language: "en",
    videoThumbnail: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80",
    description: "Dismissing subtle warning signs like transient chest tightness, sudden mild numbness, persistent breathlessness, or subtle blood in stools often turns treatable conditions into catastrophic medical emergencies.",
    emergencySteps: [
      "Warning 1: Unexplained chest heaviness or heartburn that radiates to jaw, neck, or left arm—Never assume it is just gas or acidity.",
      "Warning 2: Transient facial droop, slurred speech, or arm clumsiness lasting even 2 minutes (TIA mini-stroke) requires urgent CT neuro-imaging.",
      "Warning 3: Shortness of breath climbing a single flight of stairs or waking gasping at night (early heart failure or pulmonary embolism).",
      "Warning 4: Unexplained weight loss, dark tarry stools, or persistent low-grade fever with night sweats (silent infection or malignancy).",
      "Action Protocol: Use AI Triage immediately to evaluate clinical urgency and visit the nearest equipped OPD or Emergency Room."
    ],
    keyDoAndDont: {
      do: [
        "Act immediately if symptoms come on suddenly or steadily worsen over 48 hours",
        "Document when the sensation first occurred and any triggers",
        "Have family members escort you rather than driving yourself"
      ],
      dont: [
        "Never ignore chest heaviness because you are young or 'healthy'",
        "Do not self-medicate with heavy antacids for more than 24 hours without clinical review",
        "Never delay emergency care hoping symptoms will vanish by tomorrow morning"
      ]
    },
    visualPhases: [
      { time: "0:00", title: "The Hidden Cost of Delayed Triage", instruction: "Recognizing how early symptoms escalate into ICU admissions.", visualType: "warning_sign" },
      { time: "1:00", title: "Subtle Cardiac Ischemia vs Common Acidity", instruction: "Differentiating jaw/arm radiate pressure from gastritis.", visualType: "triage_flag" },
      { time: "2:15", title: "Transient Ischemic Attacks (Mini-Stroke Aura)", instruction: "Temporary slurred speech indicates pending stroke.", visualType: "warning_sign" },
      { time: "3:30", title: "When to Visit OPD vs Rush to ER", instruction: "Silent Guardian red-flag protocol for immediate hospital transport.", visualType: "triage_flag" }
    ]
  },
  {
    id: "vid-cpr-hi",
    title: "वयस्कों के लिए हैंड्स-ओनली सीपीआर (CPR) जीवन रक्षक गाइड",
    category: "हृदय आपातकाल",
    duration: "4:10",
    language: "hi",
    videoThumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    description: "यदि कोई व्यक्ति अचानक बेहोश हो जाए और सांस न ले रहा हो, तो तुरंत सीपीआर देकर आप उसकी जान बचा सकते हैं। प्रति मिनट 100-120 बार छाती दबाएं।",
    emergencySteps: [
      "चरण 1: कंधे को थपथपाएं और ज़ोर से पूछें 'क्या आप मुझे सुन पा रहे हैं? क्या आप ठीक हैं?'",
      "चरण 2: यदि कोई प्रतिक्रिया न मिले, तो तुरंत 108 नंबर पर एम्बुलेंस बुलवाएं और डिफिब्रिलेटर (AED) मंगवाएं।",
      "चरण 3: दोनों हाथों की उंगलियों को फंसाकर हथेली को छाती के बीचो-बीच (स्टर्नम पर) रखें।",
      "चरण 4: कोहनी सीधी रखते हुए तेजी से और ज़ोर से दबाएं (प्रति मिनट 100-120 बार)। छाती को कम से कम 2 इंच (5 सेमी) नीचे दबाएं।",
      "चरण 5: जब तक डॉक्टर या एम्बुलेंस न आ जाए, छाती दबाना 10 सेकंड से अधिक बंद न करें।"
    ],
    keyDoAndDont: {
      do: ["कोहनी को बिल्कुल सीधा रखें और शरीर के ऊपरी भार का उपयोग करें", "रोगी को किसी सख्त और समतल सतह पर ही लिटाएं", "थकने पर दूसरे व्यक्ति से मदद लें"],
      dont: ["मुंह से सांस देने में समय बर्बाद न करें यदि आपने औपचारिक प्रशिक्षण नहीं लिया है", "छाती दबाने में 10 सेकंड से अधिक का विराम न लें"]
    }
  },
  {
    id: "vid-early-symptoms-hi",
    title: "शुरुआती स्वास्थ्य लक्षणों को नज़रअंदाज़ करने का गंभीर ख़तरा",
    category: "स्वास्थ्य जागरूकता",
    duration: "4:00",
    language: "hi",
    videoThumbnail: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80",
    description: "छाती में हल्का भारीपन, अचानक कमजोरी या बार-बार सांस फूलने जैसे शुरुआती लक्षणों को गैस मानकर टालना जानलेवा हो सकता है। समय पर जांच जीवन बचाती है।",
    emergencySteps: [
      "संकेत 1: छाती के बीच में भारीपन या जलन जो बाएं हाथ या जबड़े तक फैले - इसे कभी सामान्य एसिडिटी न समझें।",
      "संकेत 2: चेहरे का एक तरफ झुकना, बोलने में लड़खड़ाहट या हाथ का सुन्न पड़ना (मिनी-स्ट्रोक का लक्षण)।",
      "संकेत 3: सीढ़ियां चढ़ते समय असामान्य रूप से सांस फूलना या रात में घबराहट के साथ उठना।",
      "संकेत 4: बिना वजह वजन कम होना या मल में खून आना - तुरंत चिकित्सक से संपर्क करें।",
      "कार्रवाई: साइलेंट गार्जियन AI ट्राइएज का उपयोग करें और तुरंत अस्पताल पहुंचें।"
    ],
    keyDoAndDont: {
      do: ["लक्षण शुरू होने का सही समय नोट करें", "खुद गाड़ी चलाने के बजाय तुरंत एम्बुलेंस या परिवार की मदद लें"],
      dont: ["'कल सुबह दिखाएंगे' सोचकर रात में कभी इंतज़ार न करें", "लगातार एसिडिटी की गोलियां खाकर दर्द को दबाने की कोशिश न करें"]
    }
  },
  {
    id: "vid-cpr-te",
    title: "గుండె ఆగిపోయినప్పుడు చేసే సిపిఆర్ (CPR) ప్రాణరక్షక విధానం",
    category: "అత్యవసర చికిత్స",
    duration: "3:30",
    language: "te",
    videoThumbnail: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&auto=format&fit=crop&q=80",
    description: "వ్యక్తి అకస్మాత్తుగా స్పృహతప్పి పడిపోతే ఛాతీ మధ్యలో బలంగా ఒత్తడం (CPR) ద్వారా ప్రాణాలను ఎలా కాపాడవచ్చో తెలుసుకోండి. నిమిషానికి 100-120 సార్లు ఒత్తాలి.",
    emergencySteps: [
      "దశ 1: వ్యక్తిని తట్టి గట్టిగా పిలవండి. స్పందన లేకపోతే వెంటనే 108 అంబులెన్స్‌కు ఫోన్ చేయండి.",
      "దశ 2: రోగిని గట్టి నేలపై వెల్లకిలా పడుకోబెట్టండి.",
      "దశ 3: మీ చేతి మడమను ఛాతీ మధ్యలో ఉంచి వేళ్లను కలపండి.",
      "దశ 4: నిమిషానికి 100 నుండి 120 సార్లు వేగంగా, బలంగా ఛాతీని 2 అంగుళాలు కిందకు అదిమిపట్టండి.",
      "దశ 5: వైద్య సహాయం అందే వరకు ఎటువంటి విరామం లేకుండా కొనసాగించండి."
    ],
    keyDoAndDont: {
      do: ["మోచేతులు వంచకుండా నేరుగా ఉంచండి", "శరీరం బరువుతో ఒత్తిడి ఇవ్వండి", "ప్రతి 2 నిమిషాలకు మరొకరి సహాయం తీసుకోండి"],
      dont: ["స్పృహ తప్పిన వ్యక్తి నోట్లో నీళ్లు పోయకూడదు", "ఒత్తడం మధ్యలో ఎక్కువ సమయం ఆపకూడదు"]
    }
  },
  {
    id: "vid-early-symptoms-te",
    title: "చిన్న ఆరోగ్య సమస్యలను నిర్లక్ష్యం చేయడం వల్ల వచ్చే ప్రమాదాలు",
    category: "ఆరోగ్య స్పృహ",
    duration: "3:50",
    language: "te",
    videoThumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&auto=format&fit=crop&q=80",
    description: "ఛాతీలో అసౌకర్యం, చేతులు తిమ్మిర్లు రావడం లేదా అలసట వంటి సాధారణ లక్షణాలను గ్యాస్ లేదా అలసటగా భావించి నిర్లక్ష్యం చేయడం వల్ల ప్రాణాలకే ముప్పు రావచ్చు.",
    emergencySteps: [
      "లక్షణం 1: ఛాతీ మధ్యలో బరువు లేదా మంట ఎడమ చేతికి పాకడం - ఇది గ్యాస్ నొప్పి మాత్రమే కాకపోవచ్చు.",
      "లక్షణం 2: ముఖం ఒకవైపు వాలడం లేదా మాట తడబడటం (పక్షవాతం ప్రారంభ సూచన).",
      "లక్షణం 3: కొద్ది దూరం నడిచినా తీవ్రమైన ఆయాసం రావడం.",
      "లక్షణం 4: తగ్గని జ్వరం మరియు ఆకస్మిక బరువు తగ్గడం.",
      "తక్షణ కర్తవ్యం: ఆలస్యం చేయకుండా నిపుణులైన వైద్యుడిని లేదా అత్యవసర విభాగాన్ని సంప్రదించండి."
    ],
    keyDoAndDont: {
      do: ["లక్షణాలు మొదలైన సమయాన్ని గుర్తుంచుకోండి", "వెంటనే ఆసుపత్రికి వెళ్లండి"],
      dont: ["స్వయంగా మందులు వేసుకుని కాలయాపన చేయవద్దు", "స్వయంగా వాహనం నడుపుతూ ఆసుపత్రికి వెళ్లవద్దు"]
    }
  },
  {
    id: "vid-cpr-ta",
    title: "அவசர காலத்தில் உயிர்காக்கும் CPR முதலுதவி முறை",
    category: "அவசர சிகிச்சை",
    duration: "3:50",
    language: "ta",
    videoThumbnail: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
    description: "திடீரென சுயநினைவை இழந்த நபருக்கு நெஞ்சுப் பகுதியில் கை வைத்து அழுத்துவதன் மூலம் மூளைக்கு செல்லும் இரத்த ஓட்டத்தை பராமரிக்கலாம்.",
    emergencySteps: [
      "படி 1: நபரை கூப்பிட்டு பார்க்கவும். சுவாசம் இல்லை என்றால் உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும்.",
      "படி 2: நபரை தட்டையான கடினமான தரையில் படுக்க வைக்கவும்.",
      "படி 3: உங்கள் இரு கைகளையும் இணைத்து நெஞ்சின் மையப்பகுதியில் வைக்கவும்.",
      "படி 4: முழங்கையை மடக்காமல் நிமிடத்திற்கு 100-120 முறை வேகமாக நெஞ்சை அழுத்தவும்.",
      "படி 5: ஆம்புலன்ஸ் வரும் வரை அழுத்தத்தை நிறுத்தாமல் தொடரவும்."
    ],
    keyDoAndDont: {
      do: ["தோள்களை நேராக வைத்து அழுத்தவும்", "நெஞ்சை 5 செ.மீ ஆழத்திற்கு அழுத்தவும்"],
      dont: ["மயக்கமடைந்தவருக்கு தண்ணீர் புகட்ட வேண்டாம்", "அழுத்துவதை 10 வினாடிகளுக்கு மேல் நிறுத்தக்கூடாது"]
    }
  },
  {
    id: "vid-early-symptoms-bn",
    title: "ছোটখাটো স্বাস্থ্য সমস্যা অবহেলা করার মারাত্মক বিপদ",
    category: "স্বাস্থ্য সচেতনতা",
    duration: "4:05",
    language: "bn",
    videoThumbnail: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80",
    description: "বুকে হালকা চাপ, হঠাৎ হাত-পা অবশ লাগা বা একটু পরিশ্রমেই শ্বাসকষ্টের মতো লক্ষণকে গ্যাসের সমস্যা ভেবে উড়িয়ে দেওয়া জীবনের জন্য বিপজ্জনক হতে পারে।",
    emergencySteps: [
      "লক্ষণ ১: বুকের মাঝে চাপ বা জ্বালা যা চোয়াল বা বাম হাতে ছড়িয়ে পড়ে — এটি কখনোই অবহেলা করবেন না।",
      "লক্ষণ ২: মুখের এক পাশ বেঁকে যাওয়া বা কথা জড়িয়ে যাওয়া (স্ট্রোকের সতর্কবার্তা)।",
      "লক্ষণ ৩: স্বাভাবিক হাঁটাচলাতেই অস্বাভাবিক শ্বাসকষ্ট বা রাতে দম আটকে ঘুম ভাঙা।",
      "করণীয়: দ্রুত নিকটস্থ হাসপাতালে যান এবং চিকিৎসকের পরামর্শ নিন।"
    ],
    keyDoAndDont: {
      do: ["লক্ষণ প্রকাশের সঠিক সময় লিখে রাখুন", "রোগীকে শান্ত ও আরামদায়ক অবস্থায় রাখুন"],
      dont: ["নিজেকে বা রোগীকে নিজে গাড়ি চালিয়ে হাসপাতালে পাঠাবেন না", "অ্যান্টাসিড খেয়ে সময় নষ্ট করবেন না"]
    }
  },
  {
    id: "vid-cpr-es",
    title: "Guía de Reanimación Cardiopulmonar (RCP) Solo con las Manos",
    category: "Emergencias Cardíacas",
    duration: "3:30",
    language: "es",
    videoThumbnail: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80",
    description: "Cómo realizar compresiones torácicas continuas y efectivas a una víctima en paro cardíaco. Ritmo vital: 100 a 120 compresiones por minuto.",
    emergencySteps: [
      "Paso 1: Evalúe el estado de conciencia tocando los hombros y preguntando en voz alta: '¿Se encuentra bien?'",
      "Paso 2: Si no responde ni respira normalmente, llame inmediatamente a emergencias (112 / 911) y pida un desfibrilador (DEA).",
      "Paso 3: Coloque el talón de una mano en el centro del pecho y entrelace la otra mano encima.",
      "Paso 4: Mantenga los brazos rectos y comprima fuertemente al ritmo de 100 a 120 por minuto (al menos 5 cm de profundidad).",
      "Paso 5: Continúe sin pausas mayores a 10 segundos hasta que llegue el personal médico."
    ],
    keyDoAndDont: {
      do: ["Use el peso de su torso para presionar", "Permita que el tórax se expanda por completo tras cada compresión"],
      dont: ["No doble los codos durante el empuje", "No suministre respiraciones de rescate si no está capacitado formalmente"]
    }
  }
];

export function generate150AuditLogs(): AdminAuditLog[] {
  const actors = [
    { email: "cso.officer@silentguardian.org", role: "Chief Security Officer", ip: "10.240.18.92" },
    { email: "compliance.director@silentguardian.org", role: "DPDP Compliance Officer", ip: "10.240.19.14" },
    { email: "dr.v.sharma.cmo@apollo.med", role: "Chief Medical Officer", ip: "172.16.4.11" },
    { email: "dispatch.supervisor@108ems.gov", role: "State EMS Dispatch Lead", ip: "103.21.244.7" },
    { email: "admin@silentguardian.com", role: "Platform System Administrator", ip: "192.168.1.104" },
    { email: "pharmacy.audit@medanta.org", role: "Central Pharmacy Inspector", ip: "172.20.10.55" },
    { email: "secops.bot@silentguardian.internal", role: "Automated Sentinel Guard", ip: "127.0.0.1" },
    { email: "external.evaluator@nabh.gov.in", role: "Accreditation Auditor", ip: "49.207.180.22" }
  ];

  const categories: Array<{
    cat: 'Authentication' | 'Patient Records' | 'Dispatch & Fleet' | 'Hospital Facility' | 'Security Policy' | 'Compliance Audit' | 'Pharmacy & Supplies';
    actionTemplates: Array<{
      action: string;
      targetPrefix: string;
      details: string;
      severity: 'info' | 'warning' | 'critical' | 'compliance';
      statusWeight: 'authorized' | 'flagged' | 'blocked';
    }>;
  }> = [
    {
      cat: 'Authentication',
      actionTemplates: [
        { action: 'Admin 2FA Challenge Verified', targetPrefix: 'AdminSession/SES-', details: 'TOTP cryptographic response verified with zero latency skew.', severity: 'info', statusWeight: 'authorized' },
        { action: 'Privilege Elevation to SuperAdmin', targetPrefix: 'RolePerms/ROLE-', details: 'Dual-officer signature quorum satisfied for system maintenance access.', severity: 'critical', statusWeight: 'authorized' },
        { action: 'Multiple Failed PIN Attempts Detected', targetPrefix: 'AuthGateway/IP-', details: '3 consecutive invalid 2FA tokens entered from unregistered subnet.', severity: 'warning', statusWeight: 'flagged' },
        { action: 'Unauthorized IP Brute-Force Blocked', targetPrefix: 'WAFGateway/EXT-', details: 'Geofenced IP blacklisted after 15 suspicious auth header requests.', severity: 'critical', statusWeight: 'blocked' },
        { action: 'OAuth Token Rotated', targetPrefix: 'TokenStore/TKN-', details: 'Short-lived JWT rotated per NIST 800-63B standard.', severity: 'info', statusWeight: 'authorized' }
      ]
    },
    {
      cat: 'Patient Records',
      actionTemplates: [
        { action: 'Emergency Break-Glass EHR Access', targetPrefix: 'PatientRecord/PTR-', details: 'Attending ER Physician bypassed standard consent under Code Red protocol.', severity: 'critical', statusWeight: 'authorized' },
        { action: 'HIPAA Export Request Sealed', targetPrefix: 'EHRArchive/EXP-', details: 'Patient medical history encrypted with AES-256 for cross-hospital transfer.', severity: 'compliance', statusWeight: 'authorized' },
        { action: 'Blood Group Discrepancy Flagged', targetPrefix: 'LabSync/LAB-', details: 'Manual record edit conflicted with automated blood bank barcoded typing.', severity: 'warning', statusWeight: 'flagged' },
        { action: 'Pediatric Vaccine Record Synced', targetPrefix: 'Immunization/IMM-', details: 'National Immunization Registry bidirectional sync completed.', severity: 'info', statusWeight: 'authorized' },
        { action: 'Patient Data De-Identification Check', targetPrefix: 'DataSanitizer/DST-', details: 'Anonymized dataset passed HIPAA Safe Harbor k-anonymity validation.', severity: 'compliance', statusWeight: 'authorized' }
      ]
    },
    {
      cat: 'Dispatch & Fleet',
      actionTemplates: [
        { action: 'Advanced Cardiac ALS Unit Dispatched', targetPrefix: 'FleetDispatch/AMB-', details: 'ALS Ambulance allocated with Lucas CPR & defibrillator telemetry synced.', severity: 'info', statusWeight: 'authorized' },
        { action: 'Ambulance GPS Geofence Deviation Flagged', targetPrefix: 'Telemetry/GPS-', details: 'Transit route diverged >2km from AI traffic-cleared emergency corridor.', severity: 'warning', statusWeight: 'flagged' },
        { action: 'Hospital Trauma Bay Pre-Alert Transmitted', targetPrefix: 'TraumaRoom/BAY-', details: 'ETA 6 mins: Patient vitals, 12-lead ECG and SpO2 live-streamed to trauma lead.', severity: 'info', statusWeight: 'authorized' },
        { action: 'Medical Drone Blood Delivery Cleared', targetPrefix: 'DroneAirway/DRN-', details: 'B-Positive rare unit cleared for autonomous 14km cold-chain flight.', severity: 'info', statusWeight: 'authorized' }
      ]
    },
    {
      cat: 'Hospital Facility',
      actionTemplates: [
        { action: 'ICU Critical Capacity Alert Triggered', targetPrefix: 'FacilityBeds/ICU-', details: 'Occupancy exceeded 95%. Automated diversion protocol activated for non-trauma.', severity: 'warning', statusWeight: 'authorized' },
        { action: 'Ventilator Fleet Maintenance Verified', targetPrefix: 'Biomedical/VNT-', details: 'NABH certified biomedical engineer completed 90-day pressure sensor calibration.', severity: 'compliance', statusWeight: 'authorized' },
        { action: 'Liquid Medical Oxygen Pressure Inspected', targetPrefix: 'CryoTank/LMO-', details: 'Primary manifold pressure verified at 4.2 bar; backup cylinder bank online.', severity: 'info', statusWeight: 'authorized' },
        { action: 'Hospital Accreditation Status Renewed', targetPrefix: 'NABHAudit/HSP-', details: 'Annual quality inspection rating 98.4/100 awarded by state clinical council.', severity: 'compliance', statusWeight: 'authorized' }
      ]
    },
    {
      cat: 'Security Policy',
      actionTemplates: [
        { action: 'Zero-Trust WAF Rule Set Updated', targetPrefix: 'FirewallRule/SEC-', details: 'Mitigated CVE-2026-8891 vulnerability signature in upstream reverse proxy.', severity: 'critical', statusWeight: 'authorized' },
        { action: 'Database Column-Level Encryption Verified', targetPrefix: 'CryptoStore/DB-', details: 'Encrypted at rest with KMS envelope keys; zero plaintext leaks found.', severity: 'compliance', statusWeight: 'authorized' },
        { action: 'Revoked Stale Clinical API Key', targetPrefix: 'APIKeyPool/KEY-', details: 'Access key inactive for 45 days automatically terminated by sentinel bot.', severity: 'warning', statusWeight: 'authorized' },
        { action: 'Penetration Testing Run Concluded', targetPrefix: 'SecAudit/PEN-', details: 'Simulated SQL injection & privilege escalations repelled with 0 breaches.', severity: 'info', statusWeight: 'authorized' }
      ]
    },
    {
      cat: 'Compliance Audit',
      actionTemplates: [
        { action: 'DPDP Act India Sec-9 Compliance Log', targetPrefix: 'PrivacyGov/DPDP-', details: 'User consent ledger validated against biometric retention time limits.', severity: 'compliance', statusWeight: 'authorized' },
        { action: 'Cryptographic Tamper-Evident Chain Sealed', targetPrefix: 'MerkleTree/MRK-', details: 'Audit block 84920 hashed with SHA-256 and committed to immutable ledger.', severity: 'compliance', statusWeight: 'authorized' },
        { action: 'Quarterly Disaster Recovery Simulation', targetPrefix: 'DRScenario/SIM-', details: 'Full database failover to secondary hot-standby region completed in 8.2 seconds.', severity: 'info', statusWeight: 'authorized' }
      ]
    },
    {
      cat: 'Pharmacy & Supplies',
      actionTemplates: [
        { action: 'Schedule X Emergency Drug Audit', targetPrefix: 'NarcoticsLocker/SCH-', details: 'Biometric fingerprint release recorded for 4x Fentanyl ampoules in OT-3.', severity: 'critical', statusWeight: 'authorized' },
        { action: 'Cold Chain Vaccine Temperature Alert', targetPrefix: 'CryoLogger/FRG-', details: 'Fridge #4 spiked to 8.2°C for 4 mins. Auxiliary compressor engaged; vaccines safe.', severity: 'warning', statusWeight: 'authorized' },
        { action: 'Mass Reorder Threshold Auto-Triggered', targetPrefix: 'StockReplenish/ORD-', details: 'Atropine & Norepinephrine stocks ordered from central government depot.', severity: 'info', statusWeight: 'authorized' }
      ]
    }
  ];

  const logs: AdminAuditLog[] = [];
  const baseTime = Date.now();

  for (let i = 1; i <= 165; i++) {
    const actor = actors[(i * 3 + 1) % actors.length];
    const catObj = categories[i % categories.length];
    const template = catObj.actionTemplates[i % catObj.actionTemplates.length];
    
    // Spread timestamps across the last 12 days
    const minutesAgo = Math.floor(i * 105 + (i % 7) * 13);
    const logDate = new Date(baseTime - minutesAgo * 60 * 1000);
    
    // Pseudo random hash for tamper-evident blockchain/merkle proof
    const hashSeed = `LOG-${i}-${actor.email}-${minutesAgo}`;
    const tamperHash = Math.abs(hashSeed.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(16).padStart(12, 'a7e0');

    // Occasional status variance
    let status: 'authorized' | 'flagged' | 'blocked' = template.statusWeight;
    if (i % 17 === 0 && template.severity === 'critical') status = 'blocked';
    else if (i % 11 === 0 && template.severity === 'warning') status = 'flagged';

    logs.push({
      id: `AUD-2026-${String(i).padStart(4, '0')}`,
      timestamp: logDate.toISOString(),
      admin_email: actor.email,
      actor_email: actor.email,
      action_type: template.action.toUpperCase().replace(/\s+/g, '_').slice(0, 24),
      action: template.action,
      category: catObj.cat,
      severity: template.severity,
      target_resource: `${template.targetPrefix}${1000 + i}`,
      target: `${template.targetPrefix}${1000 + i}`,
      details: template.details,
      ip_address: actor.ip,
      two_factor_verified: status === 'authorized',
      status: status,
      tamper_hash: `0x${tamperHash}`
    });
  }

  // Sort newest first
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateSeedNotifications(): NotificationItem[] {
  const now = Date.now();
  return [
    {
      id: "notif-01",
      title: "Cardiac ALS Ambulance Dispatched",
      message: "Unit #AMB-108 is en route to Gachibowli Circle. ETA: 4 minutes. Lucas CPR telemetry stream connected.",
      category: "emergency",
      priority: "urgent",
      timestamp: new Date(now - 3 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/hospital",
      action_label: "Track Unit"
    },
    {
      id: "notif-02",
      title: "Urgent O-Negative Blood Request",
      message: "Apollo Jubilee Hills Trauma ICU urgently requires 2 units of O-Negative blood for acute emergency trauma surgery.",
      category: "blood",
      priority: "urgent",
      timestamp: new Date(now - 14 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/blood-finder",
      action_label: "View Request"
    },
    {
      id: "notif-03",
      title: "Two-Factor Authentication Verified",
      message: "High-security administrator session signed in from authorized IP (10.240.18.92). Zero-Trust token active.",
      category: "security",
      priority: "normal",
      timestamp: new Date(now - 42 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/admin",
      action_label: "Audit Trail"
    },
    {
      id: "notif-04",
      title: "Pharmacy Reorder Threshold: Epinephrine",
      message: "Central Emergency stock for Epinephrine 1mg/ml ampoules has dropped below 15 units. Auto-reorder triggered.",
      category: "system",
      priority: "high",
      timestamp: new Date(now - 90 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/pharmacy",
      action_label: "Check Stock"
    },
    {
      id: "notif-05",
      title: "New AI Awareness Simulator Video Available",
      message: "Watch Dr. Maya explain 'Cardiopulmonary Resuscitation (CPR)' and 'Early Neglected Symptoms' in 6 languages.",
      category: "clinical",
      priority: "normal",
      timestamp: new Date(now - 180 * 60 * 1000).toISOString(),
      read: true,
      action_url: "/dashboard",
      action_label: "Watch Video"
    },
    {
      id: "notif-06",
      title: "NABH Compliance Annual Review Notice",
      message: "Biomedical ventilator calibration and cryogenic oxygen tank pressures certified at 100% compliance.",
      category: "security",
      priority: "normal",
      timestamp: new Date(now - 360 * 60 * 1000).toISOString(),
      read: true,
      action_url: "/admin",
      action_label: "View Report"
    },
    {
      id: "notif-07",
      title: "Rare AB-Negative Donor Available in Your City",
      message: "Verified donor Rajesh K. is active and available within 3.5 km radius of Care Hospital Banjara Hills.",
      category: "blood",
      priority: "normal",
      timestamp: new Date(now - 540 * 60 * 1000).toISOString(),
      read: true,
      action_url: "/blood-finder",
      action_label: "Contact Donor",
      target_role: "patient"
    }
  ];
}

// Role-tailored notifications generator delivering distinctive operational alerts per persona
export function generateRoleSpecificNotifications(role: 'patient' | 'hospital' | 'admin' = 'patient'): NotificationItem[] {
  const now = Date.now();

  const patientNotifs: NotificationItem[] = [
    {
      id: "pt-notif-01",
      title: "🚨 Urgent Blood Donor Match Needed (O+)",
      message: "Care Hospital Banjara Hills has an emergency post-accident surgery requiring O+ blood within 2 hours. Your profile is an eligible match.",
      category: "blood",
      priority: "urgent",
      timestamp: new Date(now - 8 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/patient/blood",
      action_label: "View Request",
      target_role: "patient"
    },
    {
      id: "pt-notif-02",
      title: "💊 Prescription Refill Reminder",
      message: "Your Cetirizine 10mg and Paracetamol stock is due for refill. Click to order with 15-30 min hyper-local delivery on Apollo 24/7 or Tata 1mg.",
      category: "clinical",
      priority: "normal",
      timestamp: new Date(now - 35 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/patient/medicine",
      action_label: "Order Online",
      target_role: "patient"
    },
    {
      id: "pt-notif-03",
      title: "🩺 Upcoming OPD Teleconsultation",
      message: "Confirmed appointment with Dr. Priya Sharma (Neurologist, Apollo Hospitals) today at 4:30 PM. Voice room will open 10 mins prior.",
      category: "clinical",
      priority: "high",
      timestamp: new Date(now - 65 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/patient/doctors",
      action_label: "View Doctor",
      target_role: "patient"
    },
    {
      id: "pt-notif-04",
      title: "📹 New Action First-Aid Simulator Published",
      message: "Dr. Maya published a step-by-step CPR & Choking Heimlich interactive video with animated actions in 6 languages.",
      category: "system",
      priority: "normal",
      timestamp: new Date(now - 140 * 60 * 1000).toISOString(),
      read: true,
      action_url: "/patient/awareness",
      action_label: "Watch Simulation",
      target_role: "patient"
    },
    {
      id: "pt-notif-05",
      title: "☀️ Seasonal Heat Index Health Bulletin",
      message: "State Health Dept issued a high temperature alert (41°C). Drink electrolyte fluids and review heat stroke prevention steps.",
      category: "emergency",
      priority: "high",
      timestamp: new Date(now - 280 * 60 * 1000).toISOString(),
      read: true,
      action_url: "/patient/awareness",
      action_label: "Read Advisory",
      target_role: "patient"
    }
  ];

  const hospitalNotifs: NotificationItem[] = [
    {
      id: "hosp-notif-01",
      title: "🚨 Inbound ALS Ambulance (Critical Cardiac)",
      message: "Unit #AMB-108 en route to Trauma Bay with 58-year-old male with acute STEMI. Lucas CPR active, telemetry streaming. ETA 4 mins.",
      category: "emergency",
      priority: "urgent",
      timestamp: new Date(now - 4 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/hospital/intake",
      action_label: "Prep Trauma Bay",
      target_role: "hospital"
    },
    {
      id: "hosp-notif-02",
      title: "⚠️ Neonatal ICU Bed Capacity Warning",
      message: "NICU bed occupancy reached 92% (11 of 12 occupied). Consider redirecting elective transfers to KIMS or Rainbow Children's.",
      category: "system",
      priority: "high",
      timestamp: new Date(now - 22 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/hospital/beds",
      action_label: "View Bed Matrix",
      target_role: "hospital"
    },
    {
      id: "hosp-notif-03",
      title: "🩸 Urgent Blood Bank Deficit: O-Negative",
      message: "Emergency blood bank inventory for O-Negative packed red blood cells has dropped below critical minimum (2 units remaining).",
      category: "blood",
      priority: "urgent",
      timestamp: new Date(now - 55 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/hospital/overview",
      action_label: "Request Supply",
      target_role: "hospital"
    },
    {
      id: "hosp-notif-04",
      title: "👨‍⚕️ Emergency Department Shift Handover",
      message: "Night Chief Medical Officer Dr. Vikram K. has signed in. 14 patients currently undergoing active triage in ER observation.",
      category: "clinical",
      priority: "normal",
      timestamp: new Date(now - 110 * 60 * 1000).toISOString(),
      read: true,
      action_url: "/hospital/doctors",
      action_label: "Duty Roster",
      target_role: "hospital"
    },
    {
      id: "hosp-notif-05",
      title: "⚙️ Ventilator Maintenance Scheduled",
      message: "Routine pneumatic calibration for Draeger Evita V800 (ICU Bed 04) scheduled for 06:00 AM by biomedical engineering.",
      category: "system",
      priority: "normal",
      timestamp: new Date(now - 240 * 60 * 1000).toISOString(),
      read: true,
      action_url: "/hospital/beds",
      action_label: "Equipment Log",
      target_role: "hospital"
    }
  ];

  const adminNotifs: NotificationItem[] = [
    {
      id: "adm-notif-01",
      title: "🛡️ New Hospital Credential Application (2FA Req)",
      message: "Metro Trauma & Heart Institute (Sector 12) submitted accreditation licenses and NABH clearance for verification.",
      category: "security",
      priority: "urgent",
      timestamp: new Date(now - 6 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/admin/verify",
      action_label: "Verify Queue",
      target_role: "admin"
    },
    {
      id: "adm-notif-02",
      title: "⚠️ Spike in Medical Fraud Reports Detected",
      message: "7 coordinated reports flagged regarding unauthorized WhatsApp accounts soliciting advance fees for fake blood deliveries.",
      category: "emergency",
      priority: "urgent",
      timestamp: new Date(now - 19 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/admin/scams",
      action_label: "Investigate Scams",
      target_role: "admin"
    },
    {
      id: "adm-notif-03",
      title: "🔐 Zero-Trust Admin 2FA Token Validated",
      message: "Session authenticated from secure subnet (10.240.18.92). Cryptographic hardware token verified with zero skew.",
      category: "security",
      priority: "normal",
      timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
      read: false,
      action_url: "/admin/audit",
      action_label: "Audit Trail",
      target_role: "admin"
    },
    {
      id: "adm-notif-04",
      title: "📊 Regional Network Telemetry: Delhi NCR Load +34%",
      message: "Emergency dispatch routing algorithm auto-balanced 18 ambulances across North & Central Delhi corridors.",
      category: "system",
      priority: "high",
      timestamp: new Date(now - 80 * 60 * 1000).toISOString(),
      read: true,
      action_url: "/admin",
      action_label: "Network Metrics",
      target_role: "admin"
    },
    {
      id: "adm-notif-05",
      title: "📜 Annual HIPAA / DPDP Compliance Attestation",
      message: "Automated penetration testing passed with 0 critical findings. Ready for CSO cryptographic sign-off.",
      category: "security",
      priority: "normal",
      timestamp: new Date(now - 300 * 60 * 1000).toISOString(),
      read: true,
      action_url: "/admin/security",
      action_label: "Security Console",
      target_role: "admin"
    }
  ];

  if (role === 'hospital') return hospitalNotifs;
  if (role === 'admin') return adminNotifs;
  return patientNotifs;
}

// Procedural generator for 50+ Realistic Medical Scams & Fraud Reports with full investigation notes
export function generate50ScamReports(): ScamReport[] {
  const categories = [
    "Fraudulent Blood Service",
    "Fake ICU Bed Reservation",
    "Counterfeit Medication Racket",
    "Impersonation & Phony Hotline",
    "Bogus Crowdfunding & QR Scam",
    "Organ Transplant Queue Scheme",
    "Black-Market Medical Oxygen",
    "Unlicensed Teleconsultation Fraud"
  ];

  const scamTemplates = [
    {
      title: "Unauthorized WhatsApp Advance Fee for Bombay O-Blood",
      cat: "Fraudulent Blood Service",
      sev: "critical" as const,
      details: "WhatsApp group soliciting ₹7,500 advance payment via fraudulent UPI for 'rare Bombay O blood group supply' with fake Apollo stamp.",
      notes: "Cybercrime cell notified; UPI VPA frozen; phone number +91 98490-XXXXX blacklisted across state telecom gateways.",
      action: "UPI Account Frozen & Police Complaint Filed",
      status: "verified_scam" as const
    },
    {
      title: "Phony ICU Bed Allocation Brokerage at Government Hospitals",
      cat: "Fake ICU Bed Reservation",
      sev: "critical" as const,
      details: "Touts demanding ₹25,000 cash promising guaranteed ventilator bed reservations inside public district emergency wards.",
      notes: "On-site hospital vigilance team apprehended 2 middle-men near Gate 3; zero administrative staff compromised.",
      action: "Criminal FIR Lodged under IPC 420",
      status: "verified_scam" as const
    },
    {
      title: "Counterfeit Liposomal Amphotericin-B & Remdesivir Vials",
      cat: "Counterfeit Medication Racket",
      sev: "critical" as const,
      details: "Batches of counterfeit antifungal vials containing saline and starch distributed via Telegram emergency channels.",
      notes: "Drug Controller raid confiscated 140 fake cartons from an unlicensed warehouse in Old Suburb.",
      action: "Warehouse Sealed by State Drug Inspector",
      status: "resolved" as const
    },
    {
      title: "Imposter 108 Emergency Ambulance Dispatch Dispatcher",
      cat: "Impersonation & Phony Hotline",
      sev: "high" as const,
      details: "Google Maps listing showing altered dispatch number charging ₹12,000 flat advance for government free emergency transport.",
      notes: "Google Maps malicious business pin removed via official legal escalation; domain redirected.",
      action: "Fake Google Business Listing Removed",
      status: "resolved" as const
    },
    {
      title: "Phishing SMS for Ayushman Bharat Card Renewal",
      cat: "Bogus Crowdfunding & QR Scam",
      sev: "high" as const,
      details: "Mass SMS campaign prompting low-income families to enter Aadhaar details and pay ₹499 to 'renew free emergency health cards'.",
      notes: "CERT-In alert issued; malicious hosting server terminated within 4 hours.",
      action: "Phishing Domain Takedown Completed",
      status: "resolved" as const
    },
    {
      title: "Organ Transplant Priority List Advancement Extortion",
      cat: "Organ Transplant Queue Scheme",
      sev: "critical" as const,
      details: "Email solicitation promising to bump patients to the top of NOTTO renal organ waitlist for ₹3,00,000 cryptocurrency deposit.",
      notes: "NOTTO central registry verified safe and unbreached; fraudulent cryptographic wallet flagged to Financial Intelligence Unit.",
      action: "FIU Watchlist Escalation",
      status: "verified_scam" as const
    },
    {
      title: "Unlicensed Ayurvedic Cancer Miracle Cure Clinic",
      cat: "Unlicensed Teleconsultation Fraud",
      sev: "high" as const,
      details: "Unregistered clinic advertising 100% cure for stage-4 malignancies using untested herbal concoctions, advising patients to stop chemotherapy.",
      notes: "State Medical Council issued cease-and-desist order; clinical premises sealed for unlicensed medical practice.",
      action: "Medical Council Cease-and-Desist Enforced",
      status: "verified_scam" as const
    },
    {
      title: "Fake Cryogenic Oxygen Cylinder Refill Token",
      cat: "Black-Market Medical Oxygen",
      sev: "high" as const,
      details: "Scammer generating fake QR tokens for oxygen refill queues outside civic hospitals charging ₹2,000 per token.",
      notes: "Reported by hospital security; suspect identified on CCTV and handed over to local station.",
      action: "Suspect Detained by Law Enforcement",
      status: "resolved" as const
    },
    {
      title: "Impersonated Senior Cardiologist OPD Video Consult",
      cat: "Unlicensed Teleconsultation Fraud",
      sev: "medium" as const,
      details: "Deepfake audio clone of Dr. K. Srinivas attempting to conduct remote consultations and prescribe scheduled drugs.",
      notes: "Medical council registry warned; deepfake video accounts taken down from social media.",
      action: "Social Media Platform Takedown Notice",
      status: "flagged" as const
    },
    {
      title: "Counterfeit Emergency Cardiac Stent Serial Labels",
      cat: "Counterfeit Medication Racket",
      sev: "critical" as const,
      details: "Unverified supplier offering expired drug-eluting stents with relabeled manufacturer expiry dates.",
      notes: "Internal quality control audit trapped shipment at receiving dock. CDSCO notified for manufacturer inspection.",
      action: "Consignment Quarantined & CDSCO Alerted",
      status: "verified_scam" as const
    }
  ];

  const scams: ScamReport[] = [];

  for (let i = 1; i <= 52; i++) {
    const t = scamTemplates[(i - 1) % scamTemplates.length];
    const city = CITIES[(i - 1) % CITIES.length];
    const daysAgo = (i % 25) + 1;
    const isResolved = i % 3 === 0;
    const isFlagged = i % 4 === 0 && !isResolved;
    const status: 'flagged' | 'verified_scam' | 'resolved' = isResolved ? 'resolved' : (isFlagged ? 'flagged' : 'verified_scam');

    scams.push({
      id: `scam-${i}`,
      title: `${t.title} [${city} Region]`,
      category: t.cat,
      severity: t.sev,
      location: city,
      reported_details: `${t.details} First detected in ${city} metropolitan healthcare perimeter affecting emergency seekers.`,
      investigation_notes: `${t.notes} Lead Investigator: Silent Guardian Cyber Fraud Unit #${100 + (i % 8)}.`,
      action_taken: t.action,
      status,
      created_at: `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
    });
  }

  return scams;
}

// Procedural generator for 60+ Realistic User & Clinician Feedback Records
export function generate60FeedbackItems(): FeedbackItem[] {
  const templates = [
    {
      source: "patient" as const,
      author: "Sita Sharma",
      role: "Verified Patient",
      rating: 5,
      cat: "AI Triage Accuracy" as const,
      sent: "positive" as const,
      msg: "The AI Triage picked up my mother's acute cardiac symptoms within 30 seconds and urged us to rush to Apollo Emergency. The doctors confirmed that the fast response prevented major heart damage.",
      resp: "Thank you for trusting Silent Guardian. We are deeply relieved your mother received timely emergency care."
    },
    {
      source: "hospital" as const,
      author: "Dr. Vikram K.",
      role: "Chief of Emergency Care, Care Hospital",
      rating: 5,
      cat: "Emergency Dispatch" as const,
      sent: "positive" as const,
      msg: "The live trauma queue and Lucas CPR telemetry streaming on inbound ambulances gives our resuscitation teams 5 crucial minutes of advance preparation. Zero downtime observed.",
      resp: "We are honored to support your critical trauma ward."
    },
    {
      source: "patient" as const,
      author: "Rajeshwar Rao",
      role: "Elderly Care Guardian",
      rating: 5,
      cat: "Language Accessibility" as const,
      sent: "positive" as const,
      msg: "My 72-year-old father was able to listen to the Telugu CPR and heat stroke awareness video without any difficulty. The voice narration is exceptionally clear and natural.",
      resp: "Providing culturally and linguistically inclusive safety information is at the core of our mission."
    },
    {
      source: "responder" as const,
      author: "Arjun Mehta",
      role: "Certified Community First Responder",
      rating: 5,
      cat: "Emergency Dispatch" as const,
      sent: "positive" as const,
      msg: "Received an instant SOS notification for a choking child at Hitech City metro station. The Heimlich visual simulator guided bystanders until our team reached within 4 minutes.",
      resp: "Incredible bravery, Arjun! Your rapid response exemplifies community safety net."
    },
    {
      source: "hospital" as const,
      author: "Sunita Verma",
      role: "Blood Bank Director, KIMS",
      rating: 4,
      cat: "Bed Availability" as const,
      sent: "positive" as const,
      msg: "The automated donor matching network helped us fulfill 18 critical O-negative and AB-negative blood requests this month without frantic phone calls.",
      resp: "Thank you for the update. We have expanded donor geolocation radius to further enhance supply."
    },
    {
      source: "doctor" as const,
      author: "Dr. Ananya Sen",
      role: "Pediatric Intensivist",
      rating: 5,
      cat: "AI Triage Accuracy" as const,
      sent: "positive" as const,
      msg: "The skin rash lesion analyzer correctly identified pediatric urticaria and advised the mother against applying home irritants. Very safe, evidence-based guardrails.",
      resp: "Our clinical dermatology AI is trained on rigorous clinical pediatric protocols."
    },
    {
      source: "patient" as const,
      author: "Kavitha Reddy",
      role: "Verified Patient",
      rating: 4,
      cat: "General Care" as const,
      sent: "constructive" as const,
      msg: "The direct online pharmacy links for fever medicines on Apollo and Tata 1mg were super convenient during my high fever when I could not step out of bed.",
      resp: "Glad you felt supported. We continue to add more fast-delivery pharmacy partners."
    },
    {
      source: "hospital" as const,
      author: "Staff Nurse Preeti",
      role: "ICU Charge Nurse",
      rating: 5,
      cat: "Bed Availability" as const,
      sent: "positive" as const,
      msg: "Managing bed turnover is now seamless. Updating ICU and ventilator capacity reflects instantly for transferring ambulances across the city.",
      resp: "Thank you Preeti for keeping telemetry accurate 24/7."
    },
    {
      source: "patient" as const,
      author: "Mohammed Farooq",
      role: "Blood Donor Volunteer",
      rating: 5,
      cat: "Language Accessibility" as const,
      sent: "positive" as const,
      msg: "Hands-free voice triage worked like magic even in Hindi! Spoke my symptoms while driving and it drafted everything cleanly.",
      resp: "Safety first! Please always pull over when using voice triage in vehicles."
    },
    {
      source: "responder" as const,
      author: "Deepak Choudhary",
      role: "Paramedic Dispatcher",
      rating: 4,
      cat: "Emergency Dispatch" as const,
      sent: "constructive" as const,
      msg: "Would love to see even more traffic corridor integrations for ambulance green lanes during peak rush hours.",
      resp: "Our engineering team is actively working with traffic police sensors for automated corridor clearing."
    }
  ];

  const feedback: FeedbackItem[] = [];

  for (let i = 1; i <= 60; i++) {
    const t = templates[(i - 1) % templates.length];
    const daysAgo = ((i * 3) % 28) + 1;

    feedback.push({
      id: `fb-${i}`,
      source: t.source,
      author_name: `${t.author} (${CITIES[(i - 1) % CITIES.length]})`,
      role_tag: t.role,
      rating: t.rating,
      category: t.cat,
      sentiment: t.sent,
      message: t.msg,
      response: t.resp,
      created_at: `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
    });
  }

  return feedback;
}

export function generate10GuardianAlerts(): GuardianAlert[] {
  return [
    {
      id: "grd-1",
      user_name: "Sunita Verma",
      relation: "Mother",
      age: 58,
      guardian_name: "Ananya Verma (Daughter)",
      guardian_phone: "+91 98490 12841",
      condition: "Acute chest heaviness with left arm numbness & cold sweats",
      severity: "critical",
      vitals: { bp: "168/104 mmHg", pulse: 114, temp: "98.6°F", spo2: "94%" },
      trigger_source: "AI Triage Emergency Detection",
      location: "Banjara Hills, Road No 12, Hyderabad",
      timestamp: "3 mins ago",
      action_taken: "Daughter Ananya acknowledged via Priority Voice Chime. 108 Emergency Ambulance dispatched with Cath Lab pre-alert to Apollo Jubilee Hills.",
      status: "Dispatched & En Route"
    },
    {
      id: "grd-2",
      user_name: "Rajesh Patel",
      relation: "Father",
      age: 66,
      guardian_name: "Kunal Patel (Son)",
      guardian_phone: "+91 98112 34910",
      condition: "Sudden slurred speech, right arm weakness, facial droop (FAST Stroke Code)",
      severity: "critical",
      vitals: { bp: "178/110 mmHg", pulse: 92, temp: "98.8°F", spo2: "96%" },
      trigger_source: "Speech Analysis & Triage Diagnostic",
      location: "Koramangala 4th Block, Bengaluru",
      timestamp: "14 mins ago",
      action_taken: "Son Kunal confirmed beacon. Max Super Speciality Neuro ER activated thrombolysis protocol. Patient in ambulance.",
      status: "Under Care in Neuro ER"
    },
    {
      id: "grd-3",
      user_name: "Aarav Sharma",
      relation: "Child (Son)",
      age: 4,
      guardian_name: "Priya Sharma (Mother)",
      guardian_phone: "+91 97011 48291",
      condition: "High spiking fever (103.4°F) with lethargy and febrile convulsion risk",
      severity: "high",
      vitals: { temp: "103.4°F", pulse: 138, spo2: "98%" },
      trigger_source: "AI Triage Pediatric Urgent Protocol",
      location: "Indirapuram, Sector 4, Delhi NCR",
      timestamp: "28 mins ago",
      action_taken: "Mother Priya initiated lukewarm sponge compress. Video tele-consult with Pediatrician Dr. Anjali initiated; Crocin drops administered.",
      status: "Stabilized & Monitored"
    },
    {
      id: "grd-4",
      user_name: "Lakshmi Devi",
      relation: "Mother",
      age: 74,
      guardian_name: "Karthik Sundaram (Son)",
      guardian_phone: "+91 94401 92831",
      condition: "Acute respiratory distress: SpO2 dropped to 88% on room air",
      severity: "critical",
      vitals: { spo2: "88%", pulse: 122, bp: "142/88 mmHg" },
      trigger_source: "Pulse Oximeter Continuous IoT Telemetry",
      location: "Anna Nagar West, Chennai",
      timestamp: "45 mins ago",
      action_taken: "Son Karthik activated 2L/min home oxygen concentrator. Oxygenated paramedic ambulance arriving in 4 minutes.",
      status: "Oxygen Administered · In Transit"
    },
    {
      id: "grd-5",
      user_name: "Dr. Subhash Chandra",
      relation: "Father",
      age: 71,
      guardian_name: "Dr. Neha Chandra (Daughter)",
      guardian_phone: "+91 98220 54192",
      condition: "Fall in bathroom, unable to bear weight, suspected left femoral neck fracture",
      severity: "high",
      vitals: { bp: "150/94 mmHg", pulse: 88, temp: "98.4°F" },
      trigger_source: "Smart Home Impact / Fall Beacon",
      location: "Aundh, Near Medipoint, Pune",
      timestamp: "1 hour ago",
      action_taken: "Daughter Dr. Neha mobilized orthopedic trauma stretcher team. X-ray scheduled at Sancheti Orthopedic Hospital.",
      status: "Arrived at Ortho Bay"
    },
    {
      id: "grd-6",
      user_name: "Rohan Sengupta",
      relation: "Husband / Spouse",
      age: 38,
      guardian_name: "Meera Sengupta (Wife)",
      guardian_phone: "+91 99302 48102",
      condition: "Acute anaphylactic reaction: lip swelling, diffuse hives & inspiratory stridor",
      severity: "critical",
      vitals: { bp: "102/65 mmHg", pulse: 128, spo2: "92%" },
      trigger_source: "AI Photo Lesion & Airway Triage",
      location: "Lokhandwala Complex, Andheri West, Mumbai",
      timestamp: "2 hours ago",
      action_taken: "Wife Meera administered home emergency EpiPen autoinjector. Dispatched to Kokilaben Hospital ER for IV hydrocortisone.",
      status: "Airway Cleared · Under Observation"
    },
    {
      id: "grd-7",
      user_name: "Diya Sharma",
      relation: "Daughter",
      age: 15,
      guardian_name: "Sanjay Sharma (Father)",
      guardian_phone: "+91 98450 19283",
      condition: "Severe acute right lower quadrant abdominal rebound pain (Appendicitis risk)",
      severity: "high",
      vitals: { temp: "101.8°F", pulse: 104, bp: "115/75 mmHg" },
      trigger_source: "AI Triage Abdominal Urgency Match",
      location: "Salt Lake Sector V, Kolkata",
      timestamp: "3 hours ago",
      action_taken: "Father Sanjay picked up Diya from school clinic and transferred to Apollo Children's Hospital for urgent abdominal ultrasound.",
      status: "Under Ultrasound Scan"
    },
    {
      id: "grd-8",
      user_name: "Kamala Bai",
      relation: "Grandmother",
      age: 82,
      guardian_name: "Vikram Rathi (Grandson)",
      guardian_phone: "+91 94140 28192",
      condition: "Severe acute hypoglycemia: Blood sugar 46 mg/dL, diaphoresis & confusion",
      severity: "high",
      vitals: { glucose: "46 mg/dL", pulse: 98, bp: "128/82 mmHg" },
      trigger_source: "Continuous Glucose Sensor Telemetry",
      location: "Navrangpura, Ahmedabad",
      timestamp: "5 hours ago",
      action_taken: "Grandson Vikram applied oral glucose paste onto buccal mucosa. Re-check verified blood glucose normalized to 112 mg/dL.",
      status: "Glucose Normalized"
    },
    {
      id: "grd-9",
      user_name: "Deepika Rao",
      relation: "Sister",
      age: 29,
      guardian_name: "Rahul Rao (Brother / Contact)",
      guardian_phone: "+91 98840 19284",
      condition: "34 weeks pregnant with severe headache, visual scotoma & BP 166/106 mmHg",
      severity: "critical",
      vitals: { bp: "166/106 mmHg", pulse: 96, temp: "98.6°F" },
      trigger_source: "AI Triage Obstetric Emergency Rule",
      location: "Gachibowli Financial District, Hyderabad",
      timestamp: "Yesterday",
      action_taken: "Brother Rahul rushed Deepika to Rainbow Children's Hospital OB-GYN emergency; Magnesium Sulfate infusion initiated for preeclampsia.",
      status: "Admitted to Maternity HDU"
    },
    {
      id: "grd-10",
      user_name: "Baby Reyan",
      relation: "Infant (Son)",
      age: 1,
      guardian_name: "Kavita Nair (Mother)",
      guardian_phone: "+91 98200 48291",
      condition: "Airway obstruction: Choking on small plastic bead with silent cough",
      severity: "critical",
      vitals: { pulse: 146, spo2: "91%" },
      trigger_source: "AI Video Heimlich Maneuver Action Prompt",
      location: "Pali Hill, Bandra West, Mumbai",
      timestamp: "Yesterday",
      action_taken: "Mother Kavita performed 5 back blows & 5 chest thrusts as shown on Silent Guardian Video Simulator. Bead expelled cleanly; infant breathing normally.",
      status: "Airway Cleared · Routine Pediatric Check"
    }
  ];
}



