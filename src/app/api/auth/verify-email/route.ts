import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyOTP } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP required" },
        { status: 400 }
      );
    }

    // Use the proper OTP verification from otp.ts
    const otpVerification = await verifyOTP(email.trim(), otp.trim());
    if (!otpVerification.success) {
      return NextResponse.json(
        { error: otpVerification.message },
        { status: 422 }
      );
    }

    // Verify student exists and is in PRE_APPLICANT status
    const student = await db.student.findUnique({
      where: { email },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (student.status !== "PRE_APPLICANT") {
      return NextResponse.json(
        { error: "Invalid student status for verification" },
        { status: 400 }
      );
    }

    // Update student status to APPLICANT
    const updatedStudent = await db.student.update({
      where: { email },
      data: { status: "APPLICANT" },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      student: {
        id: student.id,
        email: student.email,
        status: updatedStudent.status,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
