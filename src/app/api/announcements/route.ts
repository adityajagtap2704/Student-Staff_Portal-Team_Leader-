import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, description, author, date, imageUrl } = body;

    if (!title?.trim() || !category || !description?.trim() || !author?.trim() || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const announcement = await db.announcement.create({
      data: {
        title:       title.trim(),
        category,
        description: description.trim(),
        author:      author.trim(),
        date:        new Date(date),
        imageUrl:    imageUrl?.trim() || null,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Announcement POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
