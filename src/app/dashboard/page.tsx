import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";
import { CreditCard, CalendarOff, Megaphone, ArrowRight, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import DashboardClient from "./DashboardClient";

const activity = [
  { icon: "check",   iconColor: "text-emerald-500", iconBg: "bg-emerald-50", title: "Fee payment received",   sub: "Term 1 – ₹8,500 cleared",       time: "2 hours ago", badge: "success" as const, badgeLabel: "Paid"    },
  { icon: "clock",   iconColor: "text-amber-500",   iconBg: "bg-amber-50",   title: "Leave request submitted", sub: "Medical appointment – 10 Jan",  time: "Yesterday",   badge: "warning" as const, badgeLabel: "Pending" },
  { icon: "megaphone",iconColor: "text-blue-500",   iconBg: "bg-blue-50",    title: "New announcement posted", sub: "Annual Sports Day – 30 April",  time: "2 days ago",  badge: "info"    as const, badgeLabel: "New"     },
  { icon: "alert",   iconColor: "text-red-500",     iconBg: "bg-red-50",     title: "Fee payment overdue",     sub: "Term 2 – ₹8,500 due 15 Apr",   time: "3 days ago",  badge: "danger"  as const, badgeLabel: "Overdue" },
];

const quickLinks = [
  { href: "/dashboard/fees",          label: "Pay Fees",      icon: "credit",   color: "text-primary",   bg: "bg-primary-50" },
  { href: "/dashboard/leave",         label: "Leave",         icon: "calendar", color: "text-amber-600", bg: "bg-amber-50"   },
  { href: "/dashboard/announcements", label: "Notices",       icon: "megaphone",color: "text-blue-600",  bg: "bg-blue-50"    },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageLayout session={session} title="Dashboard">
      <DashboardClient
        session={session}
        greeting={greeting}
        activity={activity}
        quickLinks={quickLinks}
      />
    </PageLayout>
  );
}
