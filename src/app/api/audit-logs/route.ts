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

    // Only HOD can view audit logs
    if (user.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const action = url.searchParams.get("action");
    const entityType = url.searchParams.get("entityType");

    const auditLogs = await db.auditLog.findMany({
      where: {
        ...(action && { action }),
        ...(entityType && { entityType }),
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error("Audit Logs GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      entityType,
      entityId,
      userId,
      userRole,
      oldValue,
      newValue,
      details,
    } = body;

    if (!action || !entityType || !entityId || !userRole) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const auditLog = await db.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        userRole,
        oldValue,
        newValue,
        details,
      },
    });

    return NextResponse.json(auditLog);
  } catch (error) {
    console.error("Audit Logs POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
