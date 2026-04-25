import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // In a real KALNET system, you'd call FS-1 API here as per Gharke's task
    // console.log("Triggering FS-1 approval chain...");

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("Leave API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
