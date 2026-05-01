import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fees = await db.fee.findMany({
      include: { student: { select: { name: true, classEnrolled: true, rollNumber: true } } },
    });

    const summary = {
      PAID:    { count: 0, total: 0 },
      PENDING: { count: 0, total: 0 },
      OVERDUE: { count: 0, total: 0 },
    } as Record<string, { count: number; total: number }>;

    for (const fee of fees) {
      summary[fee.status].count++;
      summary[fee.status].total += Number(fee.amount);
    }

    return NextResponse.json({ fees, summary });
  } catch (error) {
    console.error("HOD Fees Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
