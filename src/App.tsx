import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import PatientDashboard from "./pages/PatientDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { getUser, initializeStorage } from "./lib/api";

const Protected: React.FC<{ role?: "patient" | "hospital" | "admin"; children: React.ReactNode }> = ({ role, children }) => {
  const u = getUser();
  if (!u) return <Navigate to="/auth" replace />;
  if (role && u.role !== role) return <Navigate to="/" replace />;
  if (u.role === "patient" && !u.onboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

export default function App() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <div className="App min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/patient/*" element={<Protected role="patient"><PatientDashboard /></Protected>} />
          <Route path="/hospital/*" element={<Protected role="hospital"><HospitalDashboard /></Protected>} />
          <Route path="/admin/*" element={<Protected role="admin"><AdminDashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
