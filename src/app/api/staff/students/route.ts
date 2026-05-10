import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // Filter students by assigned class only
    const students = await db.student.findMany({
      where: { classEnrolled: assignedClass },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        rollNumber: true,
        classEnrolled: true,
        status: true,
      },
      orderBy: { name: "asc" },
    });

    console.log("[STAFF STUDENTS] Found students:", students.length);
    return NextResponse.json(students);
  } catch (error) {
    console.error("Staff Students Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
