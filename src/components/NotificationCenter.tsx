import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, CheckCheck, Volume2, VolumeX, ShieldAlert, 
  Siren, Droplet, Shield, Sparkles, AlertCircle, X, ChevronRight, PlusCircle 
} from "lucide-react";
import { api } from "../lib/api";
import { NotificationItem } from "../types";

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'emergency' | 'blood' | 'security'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("sg_notif_sound") !== "false";
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Play pleasant acoustic synthesis chime using Web Audio API
  const playAudioChime = (type: 'urgent' | 'normal' = 'normal') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'urgent') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.46);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.38);
      }
    } catch (e) {
      console.warn("Audio chime prevented or unsupported", e);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get<NotificationItem[]>('/notifications');
      if (res?.data) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("sg_notif_sound", String(next));
    if (next) {
      playAudioChime('normal');
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await api.post('/notifications/read', { id });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await api.post('/notifications/read-all', {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAction = async (notif: NotificationItem) => {
    await handleMarkAsRead(notif.id);
    setIsOpen(false);
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  const simulateUrgentAlert = async () => {
    const alertsPool = [
      {
        title: "Cardiac ALS Ambulance #AMB-204 Dispatched",
        message: "En-route to Hitech City accident intersection. Continuous automated CPR telemetry streaming.",
        category: "emergency" as const,
        priority: "urgent" as const,
        action_url: "/hospital",
        action_label: "Track Unit"
      },
      {
        title: "Immediate O-Negative Donors Needed",
        message: "Emergency trauma unit at Fortis Hospital flagged acute shortage. 3 verified donors notified.",
        category: "blood" as const,
        priority: "urgent" as const,
        action_url: "/blood-finder",
        action_label: "View Request"
      },
      {
        title: "Zero-Trust 2FA Administrative Elevation",
        message: "Critical audit: Session signed in with biometric quorum verification from IP 10.240.18.92.",
        category: "security" as const,
        priority: "high" as const,
        action_url: "/admin",
        action_label: "Inspect Log"
      }
    ];

    const chosen = alertsPool[Math.floor(Math.random() * alertsPool.length)];
    const res = await api.post('/notifications/add', chosen);
    if (res?.data) {
      setNotifications(prev => [res.data, ...prev]);
      playAudioChime('urgent');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'emergency') return item.category === 'emergency';
    if (activeFilter === 'blood') return item.category === 'blood';
    if (activeFilter === 'security') return item.category === 'security';
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'emergency':
        return <Siren className="text-red-600" size={17} />;
      case 'blood':
        return <Droplet className="text-rose-600" size={17} />;
      case 'security':
        return <Shield className="text-amber-600" size={17} />;
      default:
        return <Sparkles className="text-teal-600" size={17} />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button with Badge */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            playAudioChime('normal');
          }
        }}
        className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600/30"
        title="Live Emergency & System Notifications"
        aria-label="Open notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center px-1 rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Flyout */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden sg-fade-in flex flex-col">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                <Bell size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight text-white flex items-center gap-2">
                  Notification Center
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-500/30 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-400/40">
                      {unreadCount} unread
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-300">Live clinical & fleet telemetry</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title={soundEnabled ? "Audio Chime: Active (Click to mute)" : "Audio Chime: Muted (Click to enable)"}
              >
                {soundEnabled ? <Volume2 size={16} className="text-teal-400" /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Pills & Actions */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('emergency')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeFilter === 'emergency'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Emergency
              </button>
              <button
                onClick={() => setActiveFilter('blood')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeFilter === 'blood'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Blood
              </button>
              <button
                onClick={() => setActiveFilter('security')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeFilter === 'security'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Security
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 shrink-0 px-2 py-1"
                title="Mark all notifications as read"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <ShieldAlert size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No notifications in this category</p>
                <p className="text-[11px] text-slate-500 mt-0.5">All monitored channels are quiet and operational.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isUrgent = notif.priority === 'urgent';
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleAction(notif)}
                    className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 relative flex gap-3 items-start ${
                      !notif.read ? 'bg-teal-50/30' : ''
                    } ${isUrgent && !notif.read ? 'border-l-4 border-l-red-600' : ''}`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1 mb-1">
                        <h4 className={`text-xs font-semibold truncate ${
                          !notif.read ? 'text-slate-900 font-bold' : 'text-slate-700'
                        }`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        {notif.action_url && (
                          <span className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-0.5">
                            {notif.action_label || 'Take Action'}
                            <ChevronRight size={12} />
                          </span>
                        )}

                        {!notif.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-[10px] text-slate-600 hover:text-slate-800 underline ml-auto"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Simulation / Test Bar in Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={simulateUrgentAlert}
              className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors"
            >
              <PlusCircle size={13} className="text-red-600" />
              Simulate Live Alert
            </button>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Audio Chimes: {soundEnabled ? "Enabled" : "Muted"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
