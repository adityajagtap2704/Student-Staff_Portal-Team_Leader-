import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyOTP, isEmailVerified } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentName, parentName, email, phone, grade, startDate, otp } = body;

    // ── Field validation ──────────────────────────────────────────────────────
    const errors: Record<string, string> = {};

    if (!studentName?.trim() || studentName.trim().length < 3)
      errors.studentName = "Student name must be at least 3 characters";

    if (!parentName?.trim() || parentName.trim().length < 3)
      errors.parentName = "Parent name must be at least 3 characters";

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = "Valid email is required";

    if (!phone?.trim())
      errors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(phone.trim()))
      errors.phone = "Phone number must be exactly 10 digits";

    if (!grade)
      errors.grade = "Class is required";

    if (!startDate)
      errors.startDate = "Preferred start date is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    // ── OTP Verification ──────────────────────────────────────────────────────
    if (!otp) {
      return NextResponse.json(
        { message: "OTP is required" },
        { status: 400 }
      );
    }

    const otpVerification = await verifyOTP(email.trim(), otp);
    if (!otpVerification.success) {
      return NextResponse.json(
        { message: otpVerification.message },
        { status: 400 }
      );
    }

    // ── Duplicate check ───────────────────────────────────────────────────────
    // Block if same phone already has a PENDING enquiry
    const phoneExists = await db.admission.findFirst({
      where: { phone: phone.trim(), status: "PENDING" },
    });
    if (phoneExists) {
      return NextResponse.json(
        { error: "An enquiry already exists for this student", code: "DUPLICATE_PHONE" },
        { status: 409 }
      );
    }

    // Block if same studentName + parentName already has a PENDING enquiry
    const nameExists = await db.admission.findFirst({
      where: {
        studentName: { equals: studentName.trim() },
        parentName:  { equals: parentName.trim() },
        status:      "PENDING",
      },
    });
    if (nameExists) {
      return NextResponse.json(
        { error: "An enquiry already exists for this student", code: "DUPLICATE_NAME" },
        { status: 409 }
      );
    }

    // ── Create ────────────────────────────────────────────────────────────────
    const date      = new Date();
    const dateStr   = date.toISOString().slice(0, 7).replace("-", "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceNumber = `ENQ-${dateStr}-${randomStr}`;

    const admission = await db.admission.create({
      data: {
        referenceNumber,
        studentName: studentName.trim(),
        parentName:  parentName.trim(),
        email:       email.trim(),
        phone:       phone.trim(),
        classApplied: grade,
        status: "PENDING",
      },
    });

    return NextResponse.json(admission);
  } catch (error) {
    console.error("Admission API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Protect — only HOD can list all admissions
    const { getServerSession } = await import("next-auth");
    const { authOptions }      = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admissions = await db.admission.findMany({
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json(admissions);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
