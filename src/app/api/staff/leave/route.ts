import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || (user?.role !== "CLASS_TEACHER" && user?.role !== "HOD")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const staffId = parseInt(user.id);

    // Get the staff member's own leave requests
    const leaveRequests = await db.leaveRequest.findMany({
      where:   { staffId },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Staff Leave Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
