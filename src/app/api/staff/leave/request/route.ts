import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const LEAVE_TYPES = [
  "Medical / Health",
  "Family Function",
  "Personal Work",
  "Bereavement",
  "Academic Event",
  "Other",
];

// GET — staff views their own leave requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "CLASS_TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const staffId = parseInt(user.id);

    const requests = await db.leaveRequest.findMany({
      where:   { staffId },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Staff Leave GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — staff submits a new leave request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "CLASS_TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const staffId = parseInt(user.id);
    const body    = await req.json();
    const { type, from, to, reason } = body;

    // Validate
    const errors: Record<string, string> = {};
    if (!type)   errors.type   = "Leave type is required";
    if (!from)   errors.from   = "Start date is required";
    if (!to)     errors.to     = "End date is required";
    if (!reason) errors.reason = "Reason is required";
    if (from && to && new Date(from) > new Date(to))
      errors.to = "End date must be after start date";
    if (Object.keys(errors).length)
      return NextResponse.json({ errors }, { status: 422 });

    const fromDate = new Date(from);
    const toDate   = new Date(to);

    // Block if already has a PENDING request overlapping these dates
    const overlap = await db.leaveRequest.findFirst({
      where: {
        staffId,
        status: "PENDING",
        fromDate: { lte: toDate },
        toDate:   { gte: fromDate },
      },
    });
    if (overlap) {
      return NextResponse.json(
        { error: "You already have a pending leave request for these dates." },
        { status: 409 }
      );
    }

    const leaveRequest = await db.leaveRequest.create({
      data: {
        staffId,
        leaveType: type,
        fromDate,
        toDate,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("Staff Leave POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
