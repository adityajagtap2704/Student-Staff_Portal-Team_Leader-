import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    // Only HOD can verify documents
    if (user.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const docId = parseInt((await params).docId);
    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!status || !["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be VERIFIED or REJECTED" },
        { status: 400 }
      );
    }

    const document = await db.studentDocument.update({
      where: { id: docId },
      data: {
        status,
        verifiedBy: parseInt(user.id),
        verifiedAt: new Date(),
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Document Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
