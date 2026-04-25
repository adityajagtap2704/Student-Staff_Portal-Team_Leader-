"use client";

import { motion } from "framer-motion";
import { Session } from "next-auth";
import { Mail, Phone, MapPin, Calendar, Hash, BookOpen, Edit3 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { staggerContainer, staggerItem, easeOut } from "@/components/motion/MotionConfig";
import { useToast } from "@/components/ui/Toast";

const details = [
  { icon: Hash,      label: "Roll Number",    value: "KN-2026-001"          },
  { icon: BookOpen,  label: "Class",          value: "Grade 10 – Section A" },
  { icon: Calendar,  label: "Date of Birth",  value: "01 January 2010"      },
  { icon: Phone,     label: "Contact",        value: "+91 98765 43210"      },
  { icon: MapPin,    label: "Address",        value: "123, MG Road, Pune"   },
  { icon: Calendar,  label: "Admission Year", value: "2021"                 },
];

const stats = [
  { label: "Attendance", value: "92%", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg. Grade", value: "A",   color: "text-primary",     bg: "bg-primary-50" },
  { label: "Rank",       value: "#5",  color: "text-purple-600",  bg: "bg-purple-50"  },
  { label: "Subjects",   value: "8",   color: "text-blue-600",    bg: "bg-blue-50"    },
];

export default function ProfileClient({ session }: { session: Session }) {
  const toast = useToast();
  const user = session.user;
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  return (
    <div className="space-y-5 max-w-3xl">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={easeOut}
      >
        <div>
          <h1 className="text-2xl font-bold text-[#444] tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-gray-400">Your personal and academic information.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<Edit3 size={14} />}
          onClick={() => toast.info("Edit profile", "Profile editing coming soon.")}
        >
          Edit Profile
        </Button>
      </motion.div>

      {/* Profile hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...easeOut, delay: 0.05 }}
        className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-card p-6"
      >
        <div className="absolute inset-0 bg-gradient-subtle opacity-40" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div className="h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-glow-lg select-none">
              {initials}
            </div>
            <motion.div
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="h-2 w-2 rounded-full bg-white" />
            </motion.div>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#444]">{user?.name ?? "Student"}</h2>
              <Badge variant="primary" dot>Active</Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-400">
              <Mail size={13} />
              <span>{user?.email ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {["Student", "Grade 10 – A", "Roll: KN-2026-001"].map((tag) => (
                <motion.span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium"
                  whileHover={{ scale: 1.03, backgroundColor: "#e8f8f3", color: "#1D9E75" }}
                  transition={{ duration: 0.15 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details */}
      <Card title="Personal Details" subtitle="Academic and contact information" delay={0.1}>
        <motion.dl
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {details.map(({ icon: Icon, label, value }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              transition={{ ...easeOut }}
              whileHover={{ backgroundColor: "rgba(249,250,251,1)", x: 2 }}
              className="flex items-start gap-3 p-3 rounded-xl transition-colors group cursor-default"
            >
              <motion.div
                className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"
                whileHover={{ backgroundColor: "#e8f8f3", scale: 1.05 }}
                transition={{ duration: 0.15 }}
              >
                <Icon size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
              </motion.div>
              <div>
                <dt className="text-xs text-gray-400 font-medium">{label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#444]">{value}</dd>
              </div>
            </motion.div>
          ))}
        </motion.dl>
      </Card>

      {/* Academic summary */}
      <Card title="Academic Summary" subtitle="Current year performance" delay={0.2}>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {stats.map(({ label, value, color, bg }, i) => (
            <motion.div
              key={label}
              variants={staggerItem}
              transition={{ ...easeOut, delay: i * 0.05 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className={`${bg} rounded-xl p-4 text-center cursor-default`}
            >
              <motion.p
                className={`text-2xl font-bold ${color}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 + i * 0.05 }}
              >
                {value}
              </motion.p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </Card>
    </div>
  );
}
