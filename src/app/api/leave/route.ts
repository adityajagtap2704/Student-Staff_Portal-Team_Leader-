import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id: string };
    const studentId = parseInt(user.id);

    const leaveRequests = await db.leaveRequest.findMany({
      where: { studentId },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Leave API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id: string; name?: string; email?: string };
    const studentId = parseInt(user.id);
    const body = await req.json();
    const { type, from, to, reason } = body;

    // Validate
    if (!type || !from || !to || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const leaveRequest = await db.leaveRequest.create({
      data: {
        studentId,
        leaveType: type,
        fromDate: new Date(from),
        toDate: new Date(to),
        reason,
        status: "PENDING",
      },
    });

    // Trigger FS-1 approval chain (as requested in Gharke's task)
    try {
      await fetch("http://localhost:3001/api/approvals", { // Assuming FS-1 runs on 3001
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceSystem: "FS-2",
          type: "LEAVE_REQUEST",
          requestId: leaveRequest.id,
          studentName: user.name,
          details: reason,
        }),
      });
    } catch (e) {
      console.warn("FS-1 Approval trigger failed (is System 1 running?):", e);
      // We don't fail the request here, just log it.
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("Leave API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
