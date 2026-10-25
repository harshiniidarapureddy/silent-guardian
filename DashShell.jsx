import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Shield, LogOut, Bell } from "lucide-react";
import { getUser, logout } from "../lib/api";

export default function DashShell({ title, nav, children, accent = "teal" }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const u = getUser();
  const doLogout = () => { logout(); navigate("/"); };
  
  const accentColor = { teal: "bg-teal-700", amber: "bg-amber-600", slate: "bg-slate-900" }[accent];
  const accentPill = { teal: "bg-teal-50 text-teal-800 border-teal-200", amber: "bg-amber-50 text-amber-800 border-amber-200", slate: "bg-slate-100 text-slate-800 border-slate-200" }[accent];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
          <div className={`w-9 h-9 rounded-xl ${accentColor} flex items-center justify-center`}><Shield className="text-white" size={18} /></div>
          <div>
            <div className="font-display font-bold text-slate-900 leading-tight">Silent Guardian</div>
            <div className={`text-[10px] uppercase tracking-[0.18em] font-bold ${accent === 'teal' ? 'text-teal-700' : accent === 'amber' ? 'text-amber-700' : 'text-slate-700'}`}>{title}</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = loc.pathname === n.to || (n.exact ? false : loc.pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                <Icon size={17} />{n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Signed in</div>
            <div className="text-sm font-semibold text-slate-900 truncate">{u?.email}</div>
            <Button variant="ghost" onClick={doLogout} className="w-full mt-2 justify-start h-8 text-slate-600"><LogOut size={14} className="mr-2" />Logout</Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
          <div className="font-display font-bold text-slate-900 text-lg">{title}</div>
          <div className="flex items-center gap-2">
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${accentPill}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>Live
            </span>
            <Button variant="ghost" size="icon" className="rounded-full"><Bell size={18} /></Button>
            <Button variant="ghost" onClick={doLogout} className="rounded-full lg:hidden"><LogOut size={16} /></Button>
          </div>
        </header>
        <div className="p-4 lg:p-8 sg-fade-in">{children}</div>
      </main>
    </div>
  );
}
