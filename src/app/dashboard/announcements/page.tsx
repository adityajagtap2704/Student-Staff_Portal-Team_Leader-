import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import AnnouncementsClient from "./AnnouncementsClient";
import db from "@/lib/db";

export default async function AnnouncementsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const announcements = await db.announcement.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <PageLayout session={session} title="Announcements">
      <AnnouncementsClient announcements={announcements} />
    </PageLayout>
  );
}
