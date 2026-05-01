import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaveBalance } from "@/lib/leaveBalance";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user      = session.user as any;
    const studentId = parseInt(user.id);

    const balance = await getLeaveBalance(studentId);
    return NextResponse.json(balance);
  } catch (error) {
    console.error("Leave Balance Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
