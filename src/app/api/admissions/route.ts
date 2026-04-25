import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentName, parentName, email, phone, grade, startDate } = body;

    // Validate
    if (!studentName || !parentName || !phone || !grade || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate Reference Number ENQ-YYYYMM-XXXX (as requested in the original task)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 7).replace("-", ""); // YYYYMM
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceNumber = `ENQ-${dateStr}-${randomStr}`;

    // Map "Class X" to "Class X" (grade in the form is "Class 6-12")
    const admission = await db.admission.create({
      data: {
        referenceNumber,
        studentName,
        parentName,
        phone,
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
