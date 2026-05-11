import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import EmailLogsClient from "./EmailLogsClient";

export const metadata = {
  title: "Email Logs | KALNET",
  description: "View system email audit trail",
};

export default async function EmailLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const user = session.user as any;

  // Only HOD can view email logs
  if (user.role !== "HOD") {
    redirect("/dashboard");
  }

  return (
    <PageLayout session={session} title="Email Logs">
      <EmailLogsClient />
    </PageLayout>
  );
}
