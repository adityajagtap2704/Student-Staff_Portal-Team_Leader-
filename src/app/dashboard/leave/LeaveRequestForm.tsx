"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input, { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CheckCircle2, Send, CalendarDays, FileText, Tag } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { easeOut, staggerContainer, staggerItem } from "@/components/motion/MotionConfig";

const leaveTypes = ["Medical / Health", "Family Function", "Personal Work", "Bereavement", "Academic Event", "Other"];

export default function LeaveRequestForm() {
  const toast = useToast();
  const [form, setForm] = useState({ type: "", from: "", to: "", reason: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.type)   e.type   = "Please select a leave type";
    if (!form.from)   e.from   = "Start date is required";
    if (!form.to)     e.to     = "End date is required";
    if (!form.reason) e.reason = "Please provide a reason";
    if (form.from && form.to && form.from > form.to) e.to = "End date must be after start date";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    
    try {
      const response = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to submit leave request");
      }

      const data = await response.json();
      setLoading(false);
      
      // Use the real ID from the database (e.g., id 1, 2, 3) 
      // or format it as LR-0001
      const formattedId = `LR-${data.id.toString().padStart(4, '0')}`;
      setRequestId(formattedId);
      setSubmitted(true);
      toast.success("Leave request submitted!", `Ref ID: ${formattedId}`);
    } catch (error) {
      console.error(error);
      setErrors({ submit: "Failed to submit request. Please try again." });
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center"
        >
          <motion.div
            className="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            >
              <CheckCircle2 size={32} className="text-emerald-500" />
            </motion.div>
          </motion.div>
          <motion.h3
            className="text-lg font-semibold text-[#444]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...easeOut, delay: 0.2 }}
          >
            Request Submitted!
          </motion.h3>
          <motion.p
            className="mt-2 text-sm text-gray-400 max-w-sm mx-auto"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...easeOut, delay: 0.25 }}
          >
            Your leave request has been submitted with ID <span className="font-mono font-bold text-primary">{requestId}</span>. The approval chain has been triggered automatically.
          </motion.p>
          <motion.div
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-sm text-emerald-700 font-medium"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...easeOut, delay: 0.3 }}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Awaiting approval
          </motion.div>
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...easeOut, delay: 0.35 }}
          >
            <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setForm({ type: "", from: "", to: "", reason: "" }); }}>
              Submit another request
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={easeOut}
          className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-[#444]">New Leave Request</h3>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details below to submit your request</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Leave type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#444]">Leave Type</label>
              <div className="relative">
                <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-[#444] transition-all duration-200 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.type ? "border-red-300" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <option value="">Select leave type...</option>
                  {leaveTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <AnimatePresence>
                {errors.type && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-500"
                  >{errors.type}</motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="From Date" type="date" value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
                error={errors.from} icon={<CalendarDays size={15} />} />
              <Input label="To Date" type="date" value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                error={errors.to} icon={<CalendarDays size={15} />} />
            </div>

            <Textarea label="Reason" placeholder="Briefly describe the reason for your leave..."
              rows={3} value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              error={errors.reason} />

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-400">Requests are reviewed within 24 hours</p>
              <Button type="submit" loading={loading} icon={<Send size={14} />}>
                Submit Request
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
