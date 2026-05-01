import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Fix #10 — accept optional rejectionReason from teacher
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;

    if (!session || !["CLASS_TEACHER", "HOD"].includes(user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id     = parseInt(params.id);
    const body   = await req.json();
    const { status, rejectionReason } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const leave = await db.leaveRequest.findUnique({ where: { id } });
    if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // CLASS_TEACHER can only manage their class's students
    if (user.role === "CLASS_TEACHER" && user.assignedClass) {
      if (!leave.studentId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const student = await db.student.findUnique({ where: { id: leave.studentId } });
      if (!student || student.classEnrolled !== user.assignedClass) {
        return NextResponse.json({ error: "Forbidden — not your class" }, { status: 403 });
      }
    }

    const updated = await db.leaveRequest.update({
      where: { id },
      data:  { status },
    });

    // Only create notification for student leaves (not staff leaves)
    if (leave.studentId) {
      const isApproved = status === "APPROVED";
      const fromStr    = new Date(leave.fromDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const toStr      = new Date(leave.toDate).toLocaleDateString("en-IN",   { day: "numeric", month: "short", year: "numeric" });

      await db.notification.create({
        data: {
          studentId: leave.studentId,
          type:      isApproved ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
          title:     isApproved ? "Leave Request Approved" : "Leave Request Rejected",
          message:   isApproved
            ? `Your leave request from ${fromStr} to ${toStr} (${leave.leaveType}) has been approved.`
            : `Your leave request from ${fromStr} to ${toStr} (${leave.leaveType}) has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Leave PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Fix #14 — students can cancel their own PENDING leave requests
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user      = session.user as any;
    const studentId = parseInt(user.id);

    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id    = parseInt(params.id);
    const leave = await db.leaveRequest.findUnique({ where: { id } });

    if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (leave.studentId !== studentId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (leave.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only PENDING requests can be cancelled" },
        { status: 422 }
      );
    }

    await db.leaveRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
