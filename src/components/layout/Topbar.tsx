"use client";

import { Menu, Bell, Search, LogOut, X, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "./../../components/ui/Toast";

interface TopbarProps {
  session: Session | null;
  onMenuClick: () => void;
  title?: string;
}

export default function Topbar({ session, onMenuClick, title }: TopbarProps) {
  const [signingOut,   setSigningOut]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [notifications,setNotifications]= useState<any[]>([]);
  const toast = useToast();

  const user = session?.user as any;
  const isStudent = user?.role === "STUDENT" || !user?.role;

  useEffect(() => {
    const el = document.querySelector("main");
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Fix #13 — fetch real unread count for students only
  useEffect(() => {
    if (!isStudent) return;
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => {
        setUnreadCount(d.unreadCount ?? 0);
        setNotifications((d.notifications ?? []).slice(0, 5));
      })
      .catch(() => {});
  }, [isStudent]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  const handleDeleteNotification = async (id: number) => {
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success("Notification deleted", "");
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    const res = await fetch("/api/notifications", { method: "DELETE" });
    if (res.ok) {
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared", "");
    }
  };

  const initials = session?.user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  return (
    <motion.header
      animate={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.8)",
        boxShadow: scrolled
          ? "0 1px 12px rgba(0,0,0,0.06)"
          : "0 1px 0 rgba(0,0,0,0.04)",
      }}
      transition={{ duration: 0.2 }}
      className="h-16 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 shrink-0"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </motion.button>
        <AnimatePresence mode="wait">
          {title && (
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:block text-sm font-semibold text-[#444]"
            >
              {title}
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <motion.button
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border border-gray-200 text-xs text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search size={14} className="group-hover:text-gray-500 transition-colors" />
          <span>Search...</span>
          <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-gray-100 rounded font-mono">⌘K</kbd>
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            className="relative h-9 w-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotif(!showNotif)}
            aria-label="Notifications"
          >
            <Bell size={17} />
            {/* Fix #13 — real unread badge, only for students */}
            {isStudent && unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
            {/* Pulse dot for staff/HOD (no real count) */}
            {!isStudent && (
              <motion.span
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gray-300 ring-2 ring-white"
              />
            )}
          </motion.button>

          <AnimatePresence>
            {showNotif && (
              <>
                <motion.div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotif(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-gray-100 shadow-soft z-20 overflow-hidden flex flex-col max-h-96"
                >
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between shrink-0">
                    <p className="text-sm font-semibold text-[#444]">Notifications</p>
                    {notifications.length > 0 && (
                      <motion.button
                        onClick={handleClearAll}
                        className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Clear all notifications"
                      >
                        <Trash2 size={12} />
                        Clear All
                      </motion.button>
                    )}
                  </div>
                  <ul className="divide-y divide-gray-50 overflow-y-auto flex-1">
                    {notifications.map((n, i) => (
                      <motion.li
                        key={n.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${!n.isRead ? "bg-primary-50/30" : ""}`}
                      >
                        <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? "bg-primary" : "bg-gray-200"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#444] leading-snug">{n.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => handleDeleteNotification(n.id)}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete notification"
                        >
                          <X size={14} />
                        </motion.button>
                      </motion.li>
                    ))}
                    {notifications.length === 0 && (
                      <li className="px-4 py-8 text-center">
                        <Bell size={24} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-xs text-gray-400">No notifications yet</p>
                      </li>
                    )}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <motion.div
            className="h-8 w-8 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-glow select-none cursor-default"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {initials}
          </motion.div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-[#444] leading-tight">{session?.user?.name ?? "User"}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{session?.user?.email}</p>
          </div>
        </div>

        {/* Sign out */}
        <motion.button
          onClick={handleSignOut}
          disabled={signingOut}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Sign out"
          title="Sign out"
        >
          {signingOut ? (
            <motion.svg
              className="h-4 w-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              fill="none" viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </motion.svg>
          ) : (
            <LogOut size={16} />
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
