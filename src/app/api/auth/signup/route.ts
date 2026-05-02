import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { sendEmail, getSignUpVerificationTemplate } from "@/lib/email";
import { generateEnquiryNumber } from "@/lib/enquiry";
import { sendOTP } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return NextResponse.json(
        { error: "Password must contain uppercase, lowercase, and numbers" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingStudent = await db.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate unique enquiry number
    const enquiryNumber = await generateEnquiryNumber();

    // Create student account with PRE_APPLICANT status (Stage 1: Initial Entry)
    // Student cannot login until email is verified
    const student = await db.student.create({
      data: {
        email,
        password: hashedPassword,
        status: "PRE_APPLICANT", // Stage 1: Cannot login yet
        isActive: true,
        enquiryNumber,
      },
    });

    // Send OTP for email verification
    const otpResult = await sendOTP(email);

    if (!otpResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account created. Check your email for verification code.",
      studentId: student.id,
      enquiryNumber: student.enquiryNumber,
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
