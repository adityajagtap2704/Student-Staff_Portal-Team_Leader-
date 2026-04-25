import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const announcements = await db.announcement.findMany({
      where: category && category !== "All" ? { category: category as any } : {},
      orderBy: { date: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Announcements API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
