import db from "@/lib/db";

export const MONTHLY_LIMIT = 2;
export const YEARLY_LIMIT  = MONTHLY_LIMIT * 12; // 24 days per year (2 days × 12 months)

/** Count days inclusive between two dates */
export function countDays(from: Date | string, to: Date | string): number {
  // Convert to Date objects
  let fromDate = typeof from === 'string' ? new Date(from) : new Date(from);
  let toDate = typeof to === 'string' ? new Date(to) : new Date(to);
  
  // Reset time to midnight UTC to avoid timezone issues
  fromDate = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate()));
  toDate = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate()));
  
  // Calculate difference in milliseconds
  const diff = toDate.getTime() - fromDate.getTime();
  
  // Convert to days and add 1 to make it inclusive
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.max(1, days); // At least 1 day
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
  const year  = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-indexed

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

  // Monthly breakdown Jan–Dec
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
