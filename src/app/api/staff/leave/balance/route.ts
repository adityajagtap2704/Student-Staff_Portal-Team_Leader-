import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { YEARLY_LIMIT, MONTHLY_LIMIT, countDays } from "@/lib/leaveBalance";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "CLASS_TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const staffId = parseInt(user.id as string, 10);

    // Get staff's leave balance (using the same logic as students)
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

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
