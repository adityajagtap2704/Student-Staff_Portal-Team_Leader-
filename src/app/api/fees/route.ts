import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id: string };
    const studentId = parseInt(user.id);

    const fees = await db.fee.findMany({
      where: { studentId },
      orderBy: { dueDate: "asc" },
    });

    // Compute totals
    const totalDue = fees.reduce((acc, f) => acc + Number(f.amount), 0);
    const totalPaid = fees.reduce((acc, f) => acc + Number(f.paidAmount), 0);
    const outstanding = totalDue - totalPaid;

    return NextResponse.json({
      records: fees,
      summary: {
        totalDue,
        totalPaid,
        outstanding
      }
    });
  } catch (error) {
    console.error("Fees API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
