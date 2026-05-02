import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verify user is HOD
    if (!session?.user || (session.user as any).role !== "HOD") {
      return NextResponse.json(
        { error: "Unauthorized. Only HOD can reassign classes." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { newClass } = body;
    const staffId = parseInt(params.id);

    // Get the staff member
    const staff = await db.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Check if new class is already assigned to another teacher
    if (newClass) {
      const existingTeacher = await db.staff.findFirst({
        where: {
          assignedClass: newClass,
          id: { not: staffId },
          isActive: true,
        },
      });

      if (existingTeacher) {
        return NextResponse.json(
          {
            error: `Class ${newClass} is already assigned to ${existingTeacher.name}. Please reassign that teacher first.`,
          },
          { status: 409 }
        );
      }
    }

    // Reassign the teacher to new class
    // NOTE: Students in the old class stay in their class (no automatic reassignment)
    const updatedStaff = await db.staff.update({
      where: { id: staffId },
      data: {
        assignedClass: newClass || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${staff.name} reassigned to ${newClass || "no class"}`,
      staff: updatedStaff,
    });
  } catch (error) {
    console.error("Error reassigning class:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
