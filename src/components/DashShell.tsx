import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Shield,
  LogOut,
  Menu,
  X,
  Accessibility,
  Mic,
  Ear,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { getUser, logout } from "../lib/api";
import NotificationCenter from "./NotificationCenter";
import { useAccessibility } from "../context/AccessibilityContext";
import { useFirebase } from "../context/FirebaseContext";
import { AccessibilityOnboardingModal } from "./accessibility/AccessibilityOnboardingModal";
import { AdaptiveAssistOverlay, VisualFirstAlertBanner } from "./accessibility/AdaptiveAssistOverlay";


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
  const {
    preferences,
    toggleVoiceMode,
    toggleVisualFirstMode,
    openOnboardingPrompt,
  } = useAccessibility();
  const { signOutFirebase } = useFirebase();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [a11yMenuOpen, setA11yMenuOpen] = useState(false);
  const a11yMenuRef = useRef<HTMLDivElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(() => {
    if (!u) return null;
    try {
      const prof = localStorage.getItem(`sg_profile_${u.id}`);
      if (prof) {
        const parsed = JSON.parse(prof);
        const url = parsed.photo_url;
        if (url && url.includes("unsplash.com")) {
          return "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04";
        }
        return url || "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04";
      }
    } catch {}
    return "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04";
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (u) {
        try {
          const prof = localStorage.getItem(`sg_profile_${u.id}`);
          if (prof) {
            const parsed = JSON.parse(prof);
            const url = parsed.photo_url;
            if (url && url.includes("unsplash.com")) {
              setPhotoUrl("https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04");
            } else {
              setPhotoUrl(url || "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04");
            }
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

  useEffect(() => {
    if (!a11yMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (a11yMenuRef.current && !a11yMenuRef.current.contains(e.target as Node)) {
        setA11yMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setA11yMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [a11yMenuOpen]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [loc.pathname]);

  const doLogout = () => {
    void signOutFirebase();
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

  const isPatientRole = u?.role === "patient";
  const activeA11yModesCount =
    (preferences.handsFreeVoice ? 1 : 0) + (preferences.visualFirst ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* WCAG 2.1 AA Skip to Main Content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-slate-900 focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white sticky top-0 h-screen no-print">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
          <div className={`w-9 h-9 rounded-xl ${accentColor} flex items-center justify-center`}>
            <Shield className="text-white" size={18} aria-hidden="true" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 leading-tight">Care Preempt</div>
            <div className={`text-[10px] uppercase tracking-[0.18em] font-bold ${
              accent === 'teal' ? 'text-teal-700' : accent === 'amber' ? 'text-amber-700' : 'text-slate-700'
            }`}>
              {title}
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav aria-label="Portal Navigation" className="flex-1 p-3 space-y-1 overflow-y-auto sg-scrollbar">
          {nav.map((n) => {
            const active = loc.pathname === n.to || (!n.exact && loc.pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  active ? "bg-slate-900 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} aria-hidden="true" />
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
                  {u?.role === "patient" ? "User" : (u?.role || "User")}
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
              <LogOut size={13} className="mr-1.5" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-white h-full flex flex-col p-4 shadow-xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="font-display font-bold text-slate-900">{title}</div>
              <Button variant="ghost" size="icon" aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)}>
                <X size={18} aria-hidden="true" />
              </Button>
            </div>
            <nav aria-label="Mobile Navigation" className="flex-1 py-4 space-y-1 overflow-y-auto">
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
                    <Icon size={17} aria-hidden="true" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={doLogout} className="w-full justify-start text-red-600">
                <LogOut size={16} className="mr-2" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main id="main-content" className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={18} aria-hidden="true" />
            </Button>
            <div className="font-display font-bold text-slate-900 text-lg truncate">{title}</div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick-Access Accessibility Button & Popover (Patient Portal Only) */}
            {isPatientRole && (
            <div className="relative" ref={a11yMenuRef}>
              <button
                type="button"
                onClick={() => setA11yMenuOpen((o) => !o)}
                aria-expanded={a11yMenuOpen}
                aria-haspopup="menu"
                data-testid="header-accessibility-btn"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  activeA11yModesCount > 0
                    ? "bg-teal-700 text-white border-teal-700 hover:bg-teal-800"
                    : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Accessibility size={15} aria-hidden="true" />
                <span>Accessibility</span>
                {activeA11yModesCount > 0 && (
                  <span className="font-mono text-[11px] bg-white/20 px-1.5 py-0.2 rounded">
                    {activeA11yModesCount}
                  </span>
                )}
              </button>

              {a11yMenuOpen && (
                <div
                  role="menu"
                  aria-label="Quick Accessibility Controls"
                  data-testid="header-accessibility-menu"
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 space-y-2 z-50"
                >
                  <div className="px-2 py-1 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">
                      Quick Accessibility Controls
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Adapt Care Preempt to your sensory or motor needs
                    </div>
                  </div>

                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={preferences.handsFreeVoice}
                    onClick={toggleVoiceMode}
                    data-testid="quick-toggle-voice"
                    className={`w-full text-left p-2.5 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                      preferences.handsFreeVoice
                        ? "bg-teal-50 border-teal-300 text-teal-950"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Mic size={16} className="text-teal-700 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <div className="text-xs font-bold">Hands-Free Voice Mode</div>
                        <div className="text-[11px] text-slate-500">Voice nav & audio readouts</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold">
                      {preferences.handsFreeVoice ? "ON" : "OFF"}
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={preferences.visualFirst}
                    onClick={toggleVisualFirstMode}
                    data-testid="quick-toggle-visual"
                    className={`w-full text-left p-2.5 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                      preferences.visualFirst
                        ? "bg-teal-50 border-teal-300 text-teal-950"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Ear size={16} className="text-teal-700 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <div className="text-xs font-bold">Visual-First Mode</div>
                        <div className="text-[11px] text-slate-500">Live captions & visual alerts</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold">
                      {preferences.visualFirst ? "ON" : "OFF"}
                    </span>
                  </button>

                  <div className="pt-1 border-t border-slate-100 flex flex-col gap-1">
                    {u?.role === "patient" && (
                      <button
                        type="button"
                        role="menuitem"
                        data-testid="quick-open-profile-a11y"
                        onClick={() => {
                          setA11yMenuOpen(false);
                          navigate("/patient/profile#accessibility-settings");
                        }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 text-left"
                      >
                        <SlidersHorizontal size={14} className="text-teal-700" aria-hidden="true" />
                        Profile & Accessibility Settings
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setA11yMenuOpen(false);
                        openOnboardingPrompt();
                      }}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 text-left"
                    >
                      <Sparkles size={14} className="text-teal-700" aria-hidden="true" />
                      Personalize Care Experience Wizard
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${accentPill}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              Live Network
            </span>
            <NotificationCenter />
            <Button variant="ghost" onClick={doLogout} className="rounded-full lg:hidden" aria-label="Sign out">
              <LogOut size={16} aria-hidden="true" />
            </Button>
          </div>
        </header>

        <div
          className={`p-4 lg:p-8 sg-fade-in flex-1 ${
            isPatientRole && (preferences.handsFreeVoice || preferences.visualFirst) ? "pb-28 lg:pb-28" : ""
          }`}
        >
          {isPatientRole && <VisualFirstAlertBanner />}
          {children}
        </div>
      </main>

      {/* Patient-Only Inclusive Onboarding & Adaptive Overlays */}
      {isPatientRole && (
        <>
          <AccessibilityOnboardingModal />
          <AdaptiveAssistOverlay />
        </>
      )}
    </div>
  );
}

