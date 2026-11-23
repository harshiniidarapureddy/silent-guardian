import React, {
  Component,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  googleAuthProvider,
} from "../lib/firebase";
import { ensureUserDocumentExists } from "../lib/firestoreSync";
import { saveAuth } from "../lib/api";
import type { User as AppUser } from "../types";

interface FirebaseContextValue {
  firebaseUser: FirebaseUser | null;
  authReady: boolean;
  isBootstrappedAdmin: boolean;
  signInWithGoogle: (
    preferredRole: "patient" | "hospital" | "admin"
  ) => Promise<AppUser>;
  signOutFirebase: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isBootstrappedAdmin = useMemo(() => {
    return Boolean(
      firebaseUser?.emailVerified &&
        firebaseUser.email?.toLowerCase() ===
          BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
    );
  }, [firebaseUser]);

  const signInWithGoogle = useCallback(
    async (preferredRole: "patient" | "hospital" | "admin"): Promise<AppUser> => {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = credential.user;
      const email = (fbUser.email || "").toLowerCase().trim();
      const isAdminEmail =
        fbUser.emailVerified &&
        email === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

      const resolvedRole: "patient" | "hospital" | "admin" =
        preferredRole === "admin" && isAdminEmail
          ? "admin"
          : preferredRole === "hospital"
          ? "hospital"
          : "patient";

      const displayName =
        fbUser.displayName?.trim() || email.split("@")[0] || "Care Preempt Member";

      const appUser: AppUser = {
        id: fbUser.uid,
        email,
        role: resolvedRole,
        created_at: new Date().toISOString(),
        onboarded: true,
        preferred_name: displayName,
      };

      const idToken = await fbUser.getIdToken();
      saveAuth(idToken, appUser);

      // Persist root user profile & isolated private record to Firestore
      if (fbUser.emailVerified) {
        await ensureUserDocumentExists({
          uid: fbUser.uid,
          email,
          displayName,
          role: resolvedRole,
          onboarded: true,
        });
      }

      window.dispatchEvent(new Event("profile-updated"));
      return appUser;
    },
    []
  );

  const signOutFirebase = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore sign-out errors if no active Firebase session
    }
  }, []);

  const value: FirebaseContextValue = {
    firebaseUser,
    authReady,
    isBootstrappedAdmin,
    signInWithGoogle,
    signOutFirebase,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error("useFirebase must be used within FirebaseProvider");
  }
  return ctx;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class FirebaseErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable =
      "We ran into an unexpected data synchronization issue. Please reload to restore your session.";
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === "string") {
        readable = `Access or sync error (${parsed.operationType || "operation"}): ${parsed.error}`;
      }
    } catch {
      if (error.message) readable = error.message;
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error) {
    console.error("Care Preempt ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h1 className="font-display text-lg font-bold text-slate-900">
              Care Preempt Session Recovery
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold cursor-pointer"
            >
              Reload Care Preempt
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
