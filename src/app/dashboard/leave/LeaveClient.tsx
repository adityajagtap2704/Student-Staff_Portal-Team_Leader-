"use client";

import { motion } from "framer-motion";
import { CalendarOff, CheckCircle2, Clock } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LeaveRequestForm from "./LeaveRequestForm";
import { staggerContainer, easeOut } from "@/components/motion/MotionConfig";

interface Props {
  initialData: any[];
  stats: {
    total: number;
    approved: number;
    pending: number;
    daysTaken: number;
  };
}

export default function LeaveClient({ initialData, stats }: Props) {
  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={easeOut}>
        <h1 className="text-2xl font-bold text-[#444] tracking-tight">Leave Requests</h1>
        <p className="mt-1 text-sm text-gray-400">Submit and track your leave requests. Approvals are processed automatically.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard label="Total Requests" value={stats.total.toString()} sub="This academic year"
          icon={<CalendarOff size={18} className="text-primary" />} iconBg="bg-primary-50" delay={0.05} />
        <StatCard label="Approved" value={stats.approved.toString()} sub={`${stats.daysTaken} days taken`}
          icon={<CheckCircle2 size={18} className="text-emerald-600" />} iconBg="bg-emerald-50"
          badge="Cleared" badgeVariant="success" delay={0.1} />
        <StatCard label="Pending" value={stats.pending.toString()} sub="Awaiting review"
          icon={<Clock size={18} className="text-amber-500" />} iconBg="bg-amber-50"
          badge="In review" badgeVariant="warning" delay={0.15} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...easeOut, delay: 0.2 }}>
        <LeaveRequestForm />
      </motion.div>

      <Card title="Leave History" subtitle="All your previous requests" noPadding delay={0.3}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {["Reason", "From", "To", "Days", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialData.map((row, i) => {
                const diff = new Date(row.toDate).getTime() - new Date(row.fromDate).getTime();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
                const statusVariant = row.status === "APPROVED" ? "success" : row.status === "REJECTED" ? "danger" : "warning";
                
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...easeOut, delay: 0.35 + i * 0.07 }}
                    whileHover={{ backgroundColor: "rgba(249,250,251,0.8)" }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#444]">{row.reason}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(row.fromDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(row.toDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-400">{days}d</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant} dot>{row.status.charAt(0) + row.status.slice(1).toLowerCase()}</Badge></td>
                  </motion.tr>
                );
              })}
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
