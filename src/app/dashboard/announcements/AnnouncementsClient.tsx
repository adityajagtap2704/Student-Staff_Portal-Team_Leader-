"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { ArrowRight, Megaphone } from "lucide-react";
import { staggerContainer, staggerItem, easeOut } from "@/components/motion/MotionConfig";

type Tag = "Event" | "Finance" | "Holiday" | "Meeting" | "Academic" | "General";

const announcements: { id: string; title: string; body: string; date: string; tag: Tag; pinned?: boolean }[] = [
  { id: "1", title: "Annual Sports Day – 30 April 2026",  body: "All students are requested to participate in the Annual Sports Day event. Registration closes on 25 April.",  date: "21 Apr 2026", tag: "Event",    pinned: true },
  { id: "2", title: "Term 2 Fee Payment Reminder",        body: "Term 2 fees of ₹8,500 are due by 15 April 2026. Please ensure timely payment to avoid late charges.",          date: "18 Apr 2026", tag: "Finance",  pinned: true },
  { id: "3", title: "Summer Vacation Schedule 2026",      body: "School will remain closed from 1 May to 15 June 2026 for summer vacation.",                                     date: "15 Apr 2026", tag: "Holiday"  },
  { id: "4", title: "Parent-Teacher Meeting – 28 April",  body: "PTM is scheduled for 28 April 2026. Parents are requested to attend between 9 AM and 1 PM.",                   date: "10 Apr 2026", tag: "Meeting"  },
  { id: "5", title: "Board Exam Timetable Released",      body: "The board examination timetable for Grade 10 and 12 has been released. Students can download it from the portal.", date: "05 Apr 2026", tag: "Academic" },
  { id: "6", title: "Library Timings Updated",            body: "The school library will now be open from 8 AM to 6 PM on weekdays.",                                             date: "01 Apr 2026", tag: "General"  },
];

const tagConfig: Record<Tag, { variant: "info"|"warning"|"success"|"primary"|"purple"|"neutral"; emoji: string }> = {
  Event:    { variant: "info",    emoji: "🎉" },
  Finance:  { variant: "warning", emoji: "💰" },
  Holiday:  { variant: "success", emoji: "🌴" },
  Meeting:  { variant: "primary", emoji: "📋" },
  Academic: { variant: "purple",  emoji: "📚" },
  General:  { variant: "neutral", emoji: "📢" },
};

const allTags: Tag[] = ["Event", "Finance", "Holiday", "Meeting", "Academic", "General"];

export default function AnnouncementsClient() {
  const [activeTag, setActiveTag] = useState<Tag | null>(null);

  const filtered = activeTag
    ? announcements.filter((a) => a.tag === activeTag)
    : announcements;

  const pinned = filtered.filter((a) => a.pinned);
  const rest   = filtered.filter((a) => !a.pinned);

  return (
    <div className="space-y-5">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={easeOut}
      >
        <div>
          <h1 className="text-2xl font-bold text-[#444] tracking-tight">Announcements</h1>
          <p className="mt-1 text-sm text-gray-400">Stay up to date with the latest school notices.</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <motion.button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${!activeTag ? "bg-primary text-white shadow-glow" : "bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary"}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            All
          </motion.button>
          {allTags.map((tag) => {
            const cfg = tagConfig[tag];
            const isActive = activeTag === tag;
            return (
              <motion.button
                key={tag}
                onClick={() => setActiveTag(isActive ? null : tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${isActive ? "bg-primary text-white shadow-glow" : "bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary-50"}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {cfg.emoji} {tag}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTag ?? "all"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={easeOut}
          className="space-y-5"
        >
          {/* Pinned */}
          {pinned.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Pinned
              </p>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {pinned.map((a, i) => {
                  const cfg = tagConfig[a.tag];
                  return (
                    <motion.div key={a.id} variants={staggerItem} transition={{ ...easeOut, delay: i * 0.06 }}>
                      <Link href={`/dashboard/announcements/${a.id}`}>
                        <motion.div
                          className="group block bg-white rounded-2xl border border-primary-100 shadow-glow p-5 cursor-pointer"
                          whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(29,158,117,0.15)" }}
                          whileTap={{ scale: 0.99 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <Badge variant={cfg.variant}>{cfg.emoji} {a.tag}</Badge>
                            <span className="text-[10px] text-gray-300 shrink-0">{a.date}</span>
                          </div>
                          <h3 className="font-semibold text-[#444] text-sm leading-snug group-hover:text-primary transition-colors">
                            {a.title}
                          </h3>
                          <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">{a.body}</p>
                          <motion.div
                            className="mt-3 flex items-center gap-1 text-xs text-primary font-medium"
                            initial={{ opacity: 0, x: -4 }}
                            whileHover={{ opacity: 1, x: 0 }}
                          >
                            Read more <ArrowRight size={12} />
                          </motion.div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                All Announcements
              </p>
              <motion.div
                className="space-y-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {rest.map((a, i) => {
                  const cfg = tagConfig[a.tag];
                  return (
                    <motion.div key={a.id} variants={staggerItem} transition={{ ...easeOut, delay: i * 0.05 }}>
                      <Link href={`/dashboard/announcements/${a.id}`}>
                        <motion.div
                          className="group flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-card p-4 cursor-pointer"
                          whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
                          whileTap={{ scale: 0.99 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <motion.div
                            className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          >
                            {cfg.emoji}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Badge variant={cfg.variant} size="sm">{a.tag}</Badge>
                              <span className="text-[10px] text-gray-300">{a.date}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-[#444] group-hover:text-primary transition-colors truncate">{a.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.body}</p>
                          </div>
                          <motion.div
                            className="text-gray-300 group-hover:text-primary shrink-0 mt-1 transition-colors"
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          >
                            <ArrowRight size={16} />
                          </motion.div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <Megaphone size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No announcements in this category</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
