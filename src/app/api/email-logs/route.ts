import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    // Only HOD can view email logs
    if (user.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const emailType = url.searchParams.get("emailType");

    const emailLogs = await db.emailLog.findMany({
      where: emailType ? { emailType } : {},
      orderBy: { sentAt: "desc" },
      take: limit,
    });

    return NextResponse.json(emailLogs);
  } catch (error) {
    console.error("Email Logs GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientEmail,
      subject,
      emailType,
      relatedEntityType,
      relatedEntityId,
      status,
      errorMessage,
    } = body;

    if (!recipientEmail || !subject || !emailType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailLog = await db.emailLog.create({
      data: {
        recipientEmail,
        subject,
        emailType,
        relatedEntityType,
        relatedEntityId,
        status: status || "SENT",
        errorMessage,
      },
    });

    return NextResponse.json(emailLog);
  } catch (error) {
    console.error("Email Logs POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
