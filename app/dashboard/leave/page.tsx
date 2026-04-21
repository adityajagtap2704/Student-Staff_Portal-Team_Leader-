import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import LeaveClient from "./LeaveClient";

export default async function LeavePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <PageLayout session={session} title="Leave">
      <LeaveClient />
    </PageLayout>
  );
}
