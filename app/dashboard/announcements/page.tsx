import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import AnnouncementsClient from "./AnnouncementsClient";

export default async function AnnouncementsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <PageLayout session={session} title="Announcements">
      <AnnouncementsClient />
    </PageLayout>
  );
}
