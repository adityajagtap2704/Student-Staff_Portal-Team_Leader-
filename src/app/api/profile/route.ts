import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Fix #8 — students can update their phone and parent name
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user      = session.user as any;
    if (user.role !== "STUDENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const studentId = parseInt(user.id);
    const body      = await req.json();
    const { phone, parentName } = body;

    const errors: Record<string, string> = {};
    if (!phone?.trim())      errors.phone      = "Phone is required";
    if (!parentName?.trim()) errors.parentName = "Parent name is required";
    if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

    const updated = await db.student.update({
      where: { id: studentId },
      data: {
        phone:      phone.trim(),
        parentName: parentName.trim(),
      },
    });

    return NextResponse.json({ phone: updated.phone, parentName: updated.parentName });
  } catch (error) {
    console.error("Profile PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
