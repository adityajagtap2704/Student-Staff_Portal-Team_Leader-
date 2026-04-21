"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, User, Mail, Phone, BookOpen, MessageSquare, ArrowRight, CheckCircle2, Copy, Check, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";

function generateRef() {
  return "KN-ENQ-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function AdmissionEnquiryPage() {
  const [form, setForm] = useState({
    studentName: "",
    parentName: "",
    email: "",
    phone: "",
    grade: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [copied, setCopied]       = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.studentName.trim()) e.studentName = "Student name is required";
    if (!form.parentName.trim())  e.parentName  = "Parent/guardian name is required";
    if (!form.email.trim())       e.email       = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.phone.trim())       e.phone       = "Phone number is required";
    if (!form.grade)              e.grade       = "Please select a grade";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const ref = generateRef();
    setRefNumber(ref);
    setLoading(false);
    setSubmitted(true);
  };

  const copyRef = async () => {
    await navigator.clipboard.writeText(refNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-100/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-100/30 blur-3xl" />
        </div>
        <div className="relative w-full max-w-md animate-scale-in">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-soft p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5 animate-bounce-in">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#444]">Enquiry Submitted!</h2>
            <p className="mt-2 text-sm text-gray-400 max-w-xs mx-auto">
              Thank you for your interest in KALNET. Our admissions team will contact you within 2 business days.
            </p>

            {/* Reference number */}
            <div className="mt-6 p-4 bg-primary-50 rounded-2xl border border-primary-100">
              <p className="text-xs font-medium text-primary-600 mb-2">Your Reference Number</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-primary tracking-wider font-mono">{refNumber}</span>
                <button
                  onClick={copyRef}
                  className="h-7 w-7 rounded-lg bg-white border border-primary-200 flex items-center justify-center text-primary hover:bg-primary-50 transition-colors"
                  aria-label="Copy reference number"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
              <p className="text-xs text-primary-500 mt-2">Save this number for future reference</p>
            </div>

            <div className="mt-6 space-y-2">
              <Link href="/login">
                <Button fullWidth variant="primary">
                  Go to Student Portal
                </Button>
              </Link>
              <Link href="/">
                <Button fullWidth variant="ghost" size="sm">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col p-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      {/* Top nav bar */}
      <div className="relative w-full max-w-lg mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors font-medium group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
          <Link href="/login" className="text-sm text-primary hover:text-primary-600 font-medium transition-colors">
            Student Login →
          </Link>
        </div>
      </div>

      <div className="relative w-full max-w-lg mx-auto animate-fade-in flex-1">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-primary items-center justify-center shadow-glow-lg mb-4">
            <GraduationCap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#444] tracking-tight">Admission Enquiry</h1>
          <p className="mt-1 text-sm text-gray-400">
            Fill in the form below and we&apos;ll get back to you within 2 business days.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student Name"
                placeholder="Full name"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                error={errors.studentName}
                icon={<User size={15} />}
              />
              <Input
                label="Parent / Guardian"
                placeholder="Full name"
                value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                error={errors.parentName}
                icon={<User size={15} />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                icon={<Mail size={15} />}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
                icon={<Phone size={15} />}
              />
            </div>

            {/* Grade select */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#444]">Applying for Grade</label>
              <div className="relative">
                <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className={`
                    w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-[#444]
                    transition-all duration-200 appearance-none
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    shadow-inner-sm
                    ${errors.grade ? "border-red-300" : "border-gray-200 hover:border-gray-300"}
                  `}
                >
                  <option value="">Select grade...</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>
              {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
            </div>

            <Textarea
              label="Message (Optional)"
              placeholder="Any specific questions or requirements..."
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              icon={<MessageSquare size={15} />}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              iconRight={!loading ? <ArrowRight size={16} /> : undefined}
            >
              {loading ? "Submitting..." : "Submit Enquiry"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Already a student?{" "}
          <Link href="/login" className="text-primary hover:text-primary-600 font-medium transition-colors">
            Sign in to your portal
          </Link>
        </p>
      </div>
    </div>
  );
}
