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
        { error: "Unauthorized. Only HOD can reject staff." },
        { status: 403 }
      );
    }

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

    // Delete the staff member (reject registration)
    await db.staff.delete({
      where: { id: staffId },
    });

    return NextResponse.json({
      success: true,
      message: "Staff registration rejected",
    });
  } catch (error) {
    console.error("Error rejecting staff:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
