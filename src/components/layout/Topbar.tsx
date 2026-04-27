"use client";

import { Menu, Bell, Search, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
  session: Session | null;
  onMenuClick: () => void;
  title?: string;
}

export default function Topbar({ session, onMenuClick, title }: TopbarProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const el = document.querySelector("main");
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  const initials = session?.user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  const notifications: any[] = [];

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
            <motion.span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
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
                  className="absolute right-0 top-11 w-72 bg-white rounded-2xl border border-gray-100 shadow-soft z-20 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-[#444]">Notifications</p>
                  </div>
                  <ul className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <motion.li
                        key={n.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className={`h-2 w-2 rounded-full ${n.dot} mt-1.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#444] leading-relaxed">{n.text}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      </motion.li>
                    ))}
                    {notifications.length === 0 && (
                      <li className="px-4 py-8 text-center">
                        <p className="text-xs text-gray-400">No new notifications</p>
                      </li>
                    )}
                  </ul>
                  <div className="px-4 py-2.5 border-t border-gray-50">
                    <button className="text-xs text-primary hover:text-primary-600 font-medium transition-colors">
                      View all notifications
                    </button>
                  </div>
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
