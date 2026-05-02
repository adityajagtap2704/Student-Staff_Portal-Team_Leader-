import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import LeaveClient from "./LeaveClient";
import db from "@/lib/db";
import { getLeaveBalance } from "@/lib/leaveBalance";

export default async function LeavePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  const userId = parseInt(user.id);
  const isStaff = user.role === "CLASS_TEACHER" || user.role === "HOD";

  // Fetch leave requests based on user type
  const leaveRequests = await db.leaveRequest.findMany({
    where: isStaff ? { staffId: userId } : { studentId: userId },
    orderBy: { submittedAt: "desc" },
  });

  // Get balance based on user type
  const balance = isStaff 
    ? await getStaffLeaveBalance(userId)
    : await getLeaveBalance(userId);

  const stats = {
    total:     leaveRequests.length,
    approved:  leaveRequests.filter((r) => r.status === "APPROVED").length,
    pending:   leaveRequests.filter((r) => r.status === "PENDING").length,
    daysTaken: leaveRequests
      .filter((r) => r.status === "APPROVED")
      .reduce((acc, r) => {
        const diff = new Date(r.toDate).getTime() - new Date(r.fromDate).getTime();
        return acc + Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
      }, 0),
  };

  return (
    <PageLayout session={session} title="Leave">
      <LeaveClient initialData={leaveRequests} stats={stats} balance={balance} />
    </PageLayout>
  );
}

// Helper function to get staff leave balance
async function getStaffLeaveBalance(staffId: number) {
  const { YEARLY_LIMIT, MONTHLY_LIMIT, countDays } = await import("@/lib/leaveBalance");
  
  const now   = new Date();
  const year  = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const requests = await db.leaveRequest.findMany({
    where: {
      staffId,
      status: "APPROVED",
      fromDate: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
  });

  const yearlyUsed = requests.reduce(
    (acc, r) => acc + countDays(r.fromDate, r.toDate),
    0
  );

  // Helper to get month boundaries in UTC
  const getMonthBoundaries = (y: number, m: number) => {
    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
    return { start, end };
  };

  // Monthly total (current month) - only count days that fall in current month
  const { start: monthStart, end: monthEnd } = getMonthBoundaries(year, month);
  
  const monthlyRequests = requests.filter((r) => {
    const fromDate = new Date(r.fromDate);
    const toDate = new Date(r.toDate);
    return fromDate <= monthEnd && toDate >= monthStart;
  });
  
  const monthlyUsed = monthlyRequests.reduce((acc, r) => {
    const fromDate = new Date(r.fromDate);
    const toDate = new Date(r.toDate);
    
    const effectiveFrom = fromDate > monthStart ? fromDate : monthStart;
    const effectiveTo = toDate < monthEnd ? toDate : monthEnd;
    
    return acc + countDays(effectiveFrom, effectiveTo);
  }, 0);

  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const monthlyBreakdown = monthNames.map((name, idx) => {
    const { start: mStart, end: mEnd } = getMonthBoundaries(year, idx);
    
    const monthReqs = requests.filter((r) => {
      const fromDate = new Date(r.fromDate);
      const toDate = new Date(r.toDate);
      return fromDate <= mEnd && toDate >= mStart;
    });
    
    const used = monthReqs.reduce((acc, r) => {
      const fromDate = new Date(r.fromDate);
      const toDate = new Date(r.toDate);
      
      const effectiveFrom = fromDate > mStart ? fromDate : mStart;
      const effectiveTo = toDate < mEnd ? toDate : mEnd;
      
      return acc + countDays(effectiveFrom, effectiveTo);
    }, 0);
    
    return { month: name, used, remaining: Math.max(0, MONTHLY_LIMIT - used) };
  });

  const yearlyRemainingFromMonthly = monthlyBreakdown.reduce(
    (acc, m) => acc + m.remaining,
    0
  );

  return {
    yearlyUsed,
    yearlyLimit:      YEARLY_LIMIT,
    yearlyRemaining:  yearlyRemainingFromMonthly,
    monthlyUsed,
    monthlyLimit:     MONTHLY_LIMIT,
    monthlyRemaining: Math.max(0, MONTHLY_LIMIT - monthlyUsed),
    monthlyBreakdown,
  };
}
