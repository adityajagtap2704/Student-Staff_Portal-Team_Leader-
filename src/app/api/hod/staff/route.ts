import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const staff = await db.staff.findMany({
      where:   { role: "CLASS_TEACHER" },
      orderBy: { assignedClass: "asc" },
      select:  { id: true, name: true, email: true, assignedClass: true, isActive: true },
    });

    // Attach student count and pending leave count per staff
    const result = await Promise.all(
      staff.map(async (s) => {
        const studentCount = s.assignedClass
          ? await db.student.count({ where: { classEnrolled: s.assignedClass } })
          : 0;
        const pendingLeaveCount = await db.leaveRequest.count({
          where: { staffId: s.id, status: "PENDING" },
        });
        return { ...s, studentCount, pendingLeaveCount };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("HOD Staff Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
