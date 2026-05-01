import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaveBalance } from "@/lib/leaveBalance";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "CLASS_TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const assignedClass = user.assignedClass as string;

    // Get all students in this class
    const students = await db.student.findMany({
      where: { classEnrolled: assignedClass },
      select: { id: true },
    });
    const studentIds = students.map((s) => s.id);

    const leaveRequests = await db.leaveRequest.findMany({
      where:   { studentId: { in: studentIds } },
      include: { student: { select: { name: true, rollNumber: true, classEnrolled: true } } },
      orderBy: { submittedAt: "desc" },
    });

    // Attach leave balance per request's student
    const result = await Promise.all(
      leaveRequests.map(async (lr) => {
        const balance = lr.studentId ? await getLeaveBalance(lr.studentId) : null;
        return { ...lr, leaveBalance: balance };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Staff Leave Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
