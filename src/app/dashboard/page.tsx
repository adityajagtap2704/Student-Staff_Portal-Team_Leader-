import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import DashboardClient from "./DashboardClient";
import db from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as { id: string };
  const studentId = parseInt(user.id);

  // 1. Fetch Fees for Stats
  const fees = await db.fee.findMany({
    where: { studentId },
    orderBy: { dueDate: "asc" },
  });

  const totalDue = fees.reduce((acc, f) => acc + Number(f.amount), 0);
  const totalPaid = fees.reduce((acc, f) => acc + Number(f.paidAmount), 0);
  const outstanding = totalDue - totalPaid;

  // 2. Fetch Recent Activities
  // Announcements
  const recentAnnouncements = await db.announcement.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // Leave Requests
  const recentLeave = await db.leaveRequest.findMany({
    where: { studentId },
    take: 3,
    orderBy: { submittedAt: "desc" },
  });

  // Recent Fee Payments (mocked by filtering paid fees for now, or just showing latest fee records)
  const recentFees = fees.slice(-2);

  // Combine and format activity
  const activityData = [
    ...recentAnnouncements.map(a => ({
      icon: "megaphone",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
      title: "New announcement posted",
      sub: a.title,
      time: formatDate(a.createdAt),
      badge: "info" as const,
      badgeLabel: "New"
    })),
    ...recentLeave.map(l => ({
      icon: "clock",
      iconColor: l.status === "APPROVED" ? "text-emerald-500" : l.status === "REJECTED" ? "text-red-500" : "text-amber-500",
      iconBg: l.status === "APPROVED" ? "bg-emerald-50" : l.status === "REJECTED" ? "bg-red-50" : "bg-amber-50",
      title: "Leave request " + l.status.toLowerCase(),
      sub: l.reason,
      time: formatDate(l.submittedAt),
      badge: (l.status === "APPROVED" ? "success" : l.status === "REJECTED" ? "danger" : "warning") as any,
      badgeLabel: l.status.charAt(0) + l.status.slice(1).toLowerCase()
    })),
    ...fees.filter(f => f.status === "PAID").slice(-2).map(f => ({
      icon: "check",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
      title: "Fee payment received",
      sub: `${f.term} – ₹${Number(f.paidAmount).toLocaleString()} cleared`,
      time: "Recent", // Fees table doesn't have a paidAt yet, using term/status
      badge: "success" as const,
      badgeLabel: "Paid"
    }))
  ].sort((a, b) => 0); // Simplified sort

  const stats = {
    totalFees: `₹${totalDue.toLocaleString()}`,
    paid: `₹${totalPaid.toLocaleString()}`,
    outstanding: `₹${outstanding.toLocaleString()}`,
    paidPercent: totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0,
    termCount: fees.length,
    academicYear: new Date().getFullYear(),
  };

  const quickLinks = [
    { href: "/dashboard/fees",          label: "Pay Fees",      icon: "credit",   color: "text-primary",   bg: "bg-primary-50" },
    { href: "/dashboard/leave",         label: "Leave",         icon: "calendar", color: "text-amber-600", bg: "bg-amber-50"   },
    { href: "/dashboard/announcements", label: "Notices",       icon: "megaphone",color: "text-blue-600",  bg: "bg-blue-50"    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageLayout session={session} title="Dashboard">
      <DashboardClient
        session={session}
        greeting={greeting}
        activity={activityData.slice(0, 4)}
        quickLinks={quickLinks}
        stats={stats}
      />
    </PageLayout>
  );
}

function formatDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
