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

    const students = await db.student.findMany({
      where:   { classEnrolled: assignedClass },
      orderBy: { name: "asc" },
    });

    // Attach leave balance for each student
    const result = await Promise.all(
      students.map(async (s) => {
        const balance = await getLeaveBalance(s.id);
        return { ...s, leaveBalance: balance };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Staff Students Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
