import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const studentId = parseInt((await params).id);

    // Students can only view their own documents
    // HOD can view any student's documents
    if (user.role === "STUDENT" && parseInt(user.id) !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const documents = await db.studentDocument.findMany({
      where: { studentId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Student Documents GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const studentId = parseInt((await params).id);

    // Only students can upload their own documents
    if (user.role !== "STUDENT" || parseInt(user.id) !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { documentType, fileName, fileUrl, fileSize } = body;

    if (!documentType || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const document = await db.studentDocument.create({
      data: {
        studentId,
        documentType,
        fileName,
        fileUrl,
        fileSize: fileSize || 0,
        status: "PENDING",
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Student Documents POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
