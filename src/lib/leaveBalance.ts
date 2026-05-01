import db from "@/lib/db";

export const MONTHLY_LIMIT = 2;
export const YEARLY_LIMIT  = MONTHLY_LIMIT * 12; // 24 days per year (2 days × 12 months)

/** Count days inclusive between two dates */
export function countDays(from: Date, to: Date): number {
  // Ensure we're working with dates at midnight to avoid time zone issues
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  
  const diff = toDate.getTime() - fromDate.getTime();
  // Add 1 to make it inclusive (e.g., same day = 1 day)
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export interface LeaveBalance {
  yearlyUsed:    number;
  yearlyLimit:   number;
  yearlyRemaining: number;
  monthlyUsed:   number;
  monthlyLimit:  number;
  monthlyRemaining: number;
  monthlyBreakdown: { month: string; used: number; remaining: number }[];
}

export async function getLeaveBalance(studentId: number): Promise<LeaveBalance> {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Fetch only APPROVED requests for balance display
  // PENDING requests are NOT counted — student should not be blocked while awaiting approval
  const requests = await db.leaveRequest.findMany({
    where: {
      studentId,
      status: "APPROVED",
      fromDate: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
  });

  // Yearly total
  const yearlyUsed = requests.reduce(
    (acc, r) => acc + countDays(r.fromDate, r.toDate),
    0
  );

  // Monthly total (current month)
  const monthlyRequests = requests.filter((r) => {
    const d = new Date(r.fromDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const monthlyUsed = monthlyRequests.reduce(
    (acc, r) => acc + countDays(r.fromDate, r.toDate),
    0
  );

  // Monthly breakdown Jan–Dec
  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const monthlyBreakdown = monthNames.map((name, idx) => {
    const monthReqs = requests.filter((r) => {
      const d = new Date(r.fromDate);
      return d.getFullYear() === year && d.getMonth() === idx;
    });
    const used = monthReqs.reduce(
      (acc, r) => acc + countDays(r.fromDate, r.toDate),
      0
    );
    return { month: name, used, remaining: Math.max(0, MONTHLY_LIMIT - used) };
  });

  // Yearly remaining = sum of all monthly remaining days
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
