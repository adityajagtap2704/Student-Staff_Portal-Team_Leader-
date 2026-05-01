import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaveBalance, countDays, YEARLY_LIMIT, MONTHLY_LIMIT } from "@/lib/leaveBalance";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user      = session.user as any;
    const studentId = parseInt(user.id);

    const leaveRequests = await db.leaveRequest.findMany({
      where: { studentId },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Leave GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user      = session.user as any;
    const studentId = parseInt(user.id);
    const body      = await req.json();
    const { type, from, to, reason } = body;

    if (!type || !from || !to || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate   = new Date(to);

    if (fromDate > toDate) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    const requestedDays = countDays(fromDate, toDate);
    const balance       = await getLeaveBalance(studentId);

    // Fix #3 — check monthly limit for ALL months the leave spans, not just start month
    const now = new Date();
    const currentYear  = now.getFullYear();
    const currentMonth = now.getMonth();

    // Build a set of year-month pairs this request spans
    const spannedMonths = new Set<string>();
    const cursor = new Date(fromDate);
    while (cursor <= toDate) {
      spannedMonths.add(`${cursor.getFullYear()}-${cursor.getMonth()}`);
      cursor.setMonth(cursor.getMonth() + 1);
      cursor.setDate(1);
    }

    // Check monthly limit for current month if it's spanned
    if (spannedMonths.has(`${currentYear}-${currentMonth}`)) {
      if (balance.monthlyUsed + requestedDays > MONTHLY_LIMIT) {
        return NextResponse.json(
          {
            error: `Monthly leave limit exceeded. You have ${balance.monthlyRemaining} day(s) remaining this month (limit: ${MONTHLY_LIMIT}/month).`,
            code:  "MONTHLY_LIMIT_EXCEEDED",
            remaining: balance.monthlyRemaining,
          },
          { status: 422 }
        );
      }
    }

    // Check yearly limit
    if (balance.yearlyUsed + requestedDays > YEARLY_LIMIT) {
      return NextResponse.json(
        {
          error: `Yearly leave limit exceeded. You have ${balance.yearlyRemaining} day(s) remaining this year (limit: ${YEARLY_LIMIT}/year).`,
          code:  "YEARLY_LIMIT_EXCEEDED",
          remaining: balance.yearlyRemaining,
        },
        { status: 422 }
      );
    }

    const leaveRequest = await db.leaveRequest.create({
      data: {
        studentId,
        leaveType: type,
        fromDate,
        toDate,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("Leave POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
