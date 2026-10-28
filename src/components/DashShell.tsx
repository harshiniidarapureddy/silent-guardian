import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Shield, LogOut, Bell, Menu, X, User } from "lucide-react";
import { getUser, logout } from "../lib/api";
import NotificationCenter from "./NotificationCenter";


export interface NavItem {
  key: string;
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
}

export interface DashShellProps {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
  accent?: "teal" | "amber" | "slate";
}

export default function DashShell({ title, nav, children, accent = "teal" }: DashShellProps) {
  const loc = useLocation();
  const navigate = useNavigate();
  const u = getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(() => {
    if (!u) return null;
    try {
      const prof = localStorage.getItem(`sg_profile_${u.id}`);
      if (prof) {
        const parsed = JSON.parse(prof);
        return parsed.photo_url || null;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (u) {
        try {
          const prof = localStorage.getItem(`sg_profile_${u.id}`);
          if (prof) {
            const parsed = JSON.parse(prof);
            setPhotoUrl(parsed.photo_url || null);
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleProfileUpdate);
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("storage", handleProfileUpdate);
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [u?.id]);

  const doLogout = () => {
    logout();
    navigate("/auth");
  };

  const accentColor = {
    teal: "bg-teal-700",
    amber: "bg-amber-600",
    slate: "bg-slate-900",
  }[accent];

  const accentPill = {
    teal: "bg-teal-50 text-teal-800 border-teal-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    slate: "bg-slate-100 text-slate-800 border-slate-200",
  }[accent];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
          <div className={`w-9 h-9 rounded-xl ${accentColor} flex items-center justify-center`}>
            <Shield className="text-white" size={18} />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 leading-tight">Silent Guardian</div>
            <div className={`text-[10px] uppercase tracking-[0.18em] font-bold ${
              accent === 'teal' ? 'text-teal-700' : accent === 'amber' ? 'text-amber-700' : 'text-slate-700'
            }`}>
              {title}
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto sg-scrollbar">
          {nav.map((n) => {
            const active = loc.pathname === n.to || (!n.exact && loc.pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-slate-900 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} />
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card with Photo Avatar */}
        <div className="p-3 border-t border-slate-200">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-3">
            <div className="flex items-center gap-3">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={u?.preferred_name || "Profile"}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className={`w-10 h-10 rounded-xl ${accentColor} text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0`}>
                  {(u?.preferred_name || u?.email || "U")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 capitalize">
                  {u?.role || "User"}
                </div>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {u?.preferred_name || u?.email || "User"}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{u?.email}</div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={doLogout}
              className="w-full justify-center h-8 text-xs font-semibold text-slate-700 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
            >
              <LogOut size={13} className="mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-white h-full flex flex-col p-4 shadow-xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="font-display font-bold text-slate-900">{title}</div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X size={18} />
              </Button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {nav.map((n) => {
                const active = loc.pathname === n.to || (!n.exact && loc.pathname.startsWith(n.to));
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={17} />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={doLogout} className="w-full justify-start text-red-600">
                <LogOut size={16} className="mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={18} />
            </Button>
            <div className="font-display font-bold text-slate-900 text-lg">{title}</div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${accentPill}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              Live Network
            </span>
            <NotificationCenter />
            <Button variant="ghost" onClick={doLogout} className="rounded-full lg:hidden" title="Logout">

              <LogOut size={16} />
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-8 sg-fade-in flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
