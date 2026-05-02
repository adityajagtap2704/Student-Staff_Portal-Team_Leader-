import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verify user is HOD
    if (!session?.user || (session.user as any).role !== "HOD") {
      return NextResponse.json(
        { error: "Unauthorized. Only HOD can access this." },
        { status: 403 }
      );
    }

    // Get all staff with approval status
    const staff = await db.staff.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedClass: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Add approval status based on isActive
    // PENDING = not active, APPROVED = active
    const staffWithStatus = await Promise.all(
      staff.map(async (s) => {
        let studentCount = 0;
        if (s.assignedClass) {
          studentCount = await db.student.count({
            where: { classEnrolled: s.assignedClass },
          });
        }

        return {
          ...s,
          approvalStatus: s.isActive ? "APPROVED" : "PENDING",
          studentCount,
          pendingLeaveCount: 0, // Placeholder for now
        };
      })
    );

    // Return as array directly (not wrapped in object)
    return NextResponse.json(staffWithStatus);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
