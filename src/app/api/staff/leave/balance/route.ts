import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { YEARLY_LIMIT, MONTHLY_LIMIT, countDays } from "@/lib/leaveBalance";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || (user?.role !== "CLASS_TEACHER" && user?.role !== "HOD")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const staffId = parseInt(user.id as string, 10);

    // Get staff's leave balance (using the same logic as students)
    const now   = new Date();
    const year  = now.getUTCFullYear();
    const month = now.getUTCMonth(); // 0-indexed

    // Fetch only APPROVED requests for balance display
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

    return NextResponse.json({
      yearlyUsed,
      yearlyLimit:      YEARLY_LIMIT,
      yearlyRemaining:  yearlyRemainingFromMonthly,
      monthlyUsed,
      monthlyLimit:     MONTHLY_LIMIT,
      monthlyRemaining: Math.max(0, MONTHLY_LIMIT - monthlyUsed),
      monthlyBreakdown,
    });
  } catch (error) {
    console.error("Staff Leave Balance Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
