import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const announcement = await db.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Announcement Detail API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Fix #15 — HOD can edit announcements
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id   = parseInt(params.id);
    const body = await req.json();
    const { title, category, description, author, date, imageUrl } = body;

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        ...(title       && { title:       title.trim()       }),
        ...(category    && { category                        }),
        ...(description && { description: description.trim() }),
        ...(author      && { author:      author.trim()      }),
        ...(date        && { date:        new Date(date)     }),
        imageUrl: imageUrl?.trim() || null,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Announcement PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Fix #15 — HOD can delete announcements
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = parseInt(params.id);
    await db.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Announcement DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
