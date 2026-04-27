"use client";

import { motion } from "framer-motion";
import { Session } from "next-auth";
import { Mail, Phone, MapPin, Calendar, Hash, BookOpen, Edit3, User } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { staggerContainer, staggerItem, easeOut } from "@/components/motion/MotionConfig";
import { useToast } from "@/components/ui/Toast";

interface Props {
  student: any;
}

export default function ProfileClient({ student }: Props) {
  const toast = useToast();
  const initials = student.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  const details = [
    { icon: Hash,      label: "Roll Number",    value: student.rollNumber          },
    { icon: BookOpen,  label: "Class",          value: student.classEnrolled       },
    { icon: User,      label: "Parent Name",    value: student.parentName          },
    { icon: Phone,     label: "Contact",        value: student.phone               },
    { icon: Mail,      label: "Email",          value: student.email               },
    { icon: Calendar,  label: "Admission Date", value: new Date(student.admissionDate).toLocaleDateString() },
  ];

  const approvedLeave = student.leaveRequests.filter((r: any) => r.status === "APPROVED");
  const attendance = "N/A"; // Not tracked in current schema
  const totalFees = student.fees.reduce((acc: number, f: any) => acc + Number(f.amount), 0);
  const paidFees = student.fees.reduce((acc: number, f: any) => acc + Number(f.paidAmount), 0);

  const stats = [
    { label: "Attendance", value: attendance, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Leaves",     value: approvedLeave.length.toString(), color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Fee Status", value: totalFees === paidFees ? "Cleared" : "Pending", color: totalFees === paidFees ? "text-emerald-600" : "text-red-600", bg: totalFees === paidFees ? "bg-emerald-50" : "bg-red-50" },
    { label: "Status",     value: student.isActive ? "Active" : "Inactive", color: student.isActive ? "text-primary" : "text-gray-600", bg: "bg-gray-50" },
  ];

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
            {student.isActive && (
              <motion.div
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="h-2 w-2 rounded-full bg-white" />
              </motion.div>
            )}
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#444]">{student.name}</h2>
              <Badge variant={student.isActive ? "success" : "neutral"} dot>{student.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-400">
              <Mail size={13} />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {["Student", student.classEnrolled, `Roll: ${student.rollNumber}`].map((tag) => (
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
