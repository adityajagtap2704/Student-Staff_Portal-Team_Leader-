import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaveBalance } from "@/lib/leaveBalance";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    
    console.log("[STAFF STUDENTS] Session user:", { id: user?.id, role: user?.role, assignedClass: user?.assignedClass });
    
    if (!session || user?.role !== "CLASS_TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const assignedClass = user.assignedClass as string;
    
    if (!assignedClass) {
      console.log("[STAFF STUDENTS] ERROR: assignedClass is null/undefined");
      return NextResponse.json({ error: "Teacher has no assigned class" }, { status: 400 });
    }
    
    console.log("[STAFF STUDENTS] Looking for students in class:", assignedClass);

    // First, check if any students exist with this class
    const allStudents = await db.student.findMany({
      select: { id: true, name: true, classEnrolled: true },
    });
    
    console.log("[STAFF STUDENTS] Total students in DB:", allStudents.length);
    console.log("[STAFF STUDENTS] Sample students:", allStudents.slice(0, 5));

    const students = await db.student.findMany({
      where:   { classEnrolled: assignedClass },
      orderBy: { name: "asc" },
    });

    console.log("[STAFF STUDENTS] Found students in", assignedClass + ":", students.length);

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
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
