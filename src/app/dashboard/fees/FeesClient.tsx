"use client";

import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, AlertCircle, Clock, Download, ArrowUpRight } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { staggerContainer, staggerItem, easeOut } from "@/components/motion/MotionConfig";
import { useToast } from "@/components/ui/Toast";

import { useState, useEffect } from "react";

type FeeRecord = {
  id: number;
  term: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
};

const statusConfig: Record<string, { variant: "success"|"danger"|"neutral"; label: string }> = {
  PAID:     { variant: "success", label: "Paid"     },
  OVERDUE:  { variant: "danger",  label: "Overdue"  },
  PENDING:  { variant: "neutral", label: "Upcoming" },
};

export default function FeesClient() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ records: FeeRecord[], summary: any } | null>(null);

  useEffect(() => {
    fetch("/api/fees")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading your fee details...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Failed to load fee information.</div>;

  const { records, summary } = data;

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={easeOut}>
        <h1 className="text-2xl font-bold text-[#444] tracking-tight">Fee Management</h1>
        <p className="mt-1 text-sm text-gray-400">Track your payments and outstanding balances.</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard label="Total Fees" value={`₹${summary.totalDue.toLocaleString()}`} sub="Academic year 2026"
          icon={<CreditCard size={18} className="text-primary" />} iconBg="bg-primary-50" delay={0.05} />
        <StatCard label="Amount Paid" value={`₹${summary.totalPaid.toLocaleString()}`} sub="Paid to date"
          icon={<CheckCircle2 size={18} className="text-emerald-600" />} iconBg="bg-emerald-50"
          badge="Updated" badgeVariant="success" delay={0.1} />
        <StatCard label="Outstanding" value={`₹${summary.outstanding.toLocaleString()}`} sub="Balance due"
          icon={<AlertCircle size={18} className="text-red-500" />} iconBg="bg-red-50"
          badge={summary.outstanding > 0 ? "Action needed" : "Cleared"} badgeVariant={summary.outstanding > 0 ? "danger" : "success"} delay={0.15} />
      </motion.div>

      {summary.outstanding > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...easeOut, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <motion.div
                className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertCircle size={18} className="text-red-500" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-red-700">Outstanding payment detected</p>
                <p className="text-xs text-red-500 mt-0.5">₹{summary.outstanding.toLocaleString()} is remaining. Please pay immediately to avoid penalties.</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<ArrowUpRight size={14} />}
              className="shrink-0"
              onClick={() => toast.success("Redirecting to payment gateway...", "You will be redirected shortly.")}
            >
              Pay Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Fee table */}
      <Card title="Payment Schedule" subtitle="All terms for academic year 2026" noPadding delay={0.25}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {["Term", "Amount", "Due Date", "Paid On", "Status", "Action"].map((h, i) => (
                  <th key={h} className={`px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide ${i === 5 ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((row, i) => {
                const cfg = statusConfig[row.status];
                const isOverdue = row.status === "OVERDUE";
                const isPaid = row.status === "PAID";
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...easeOut, delay: 0.3 + i * 0.07 }}
                    whileHover={{ backgroundColor: isOverdue ? "rgba(254,242,242,0.8)" : "rgba(249,250,251,0.8)" }}
                    className={`transition-colors ${isOverdue ? "bg-red-50/40" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className={`h-2 w-2 rounded-full shrink-0 ${isPaid ? "bg-emerald-400" : isOverdue ? "bg-red-400" : "bg-gray-300"}`}
                          animate={isOverdue ? { scale: [1, 1.4, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="font-medium text-[#444]">{row.term}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#444]">₹{Number(row.amount).toLocaleString()}</td>
                    <td className={`px-6 py-4 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>{new Date(row.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-400">{isPaid ? "Received" : "—"}</td>
                    <td className="px-6 py-4"><Badge variant={cfg.variant} dot>{cfg.label}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      {isPaid ? (
                        <motion.button
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
                          whileHover={{ scale: 1.05 }}
                          onClick={() => toast.info("Downloading receipt...", "Receipt will download shortly.")}
                        >
                          <Download size={12} /> Receipt
                        </motion.button>
                      ) : isOverdue ? (
                        <Button variant="danger" size="xs" onClick={() => toast.error("Payment gateway", "Please contact the accounts office.")}>Pay Now</Button>
                      ) : (
                        <span className="text-xs text-gray-300">Not due yet</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...easeOut, delay: 0.5 }}
        className="text-xs text-gray-400 text-center"
      >
        For payment issues, contact{" "}
        <a href="mailto:fees@kalnet.edu" className="text-primary hover:underline">fees@kalnet.edu</a>
      </motion.p>
    </div>
  );
}
