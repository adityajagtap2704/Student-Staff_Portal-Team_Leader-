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
        { error: "Unauthorized. Only HOD can approve staff." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { assignedClass } = body;
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

    // Check if class is already assigned to another teacher
    if (assignedClass) {
      const existingTeacher = await db.staff.findFirst({
        where: {
          assignedClass,
          id: { not: staffId },
          isActive: true,
        },
      });

      if (existingTeacher) {
        return NextResponse.json(
          {
            error: `Class ${assignedClass} is already assigned to ${existingTeacher.name}. Please reassign that teacher first.`,
          },
          { status: 409 }
        );
      }
    }

    // Approve staff (activate account)
    const updatedStaff = await db.staff.update({
      where: { id: staffId },
      data: {
        isActive: true,
        assignedClass: assignedClass || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Staff approved successfully",
      staff: updatedStaff,
    });
  } catch (error) {
    console.error("Error approving staff:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
