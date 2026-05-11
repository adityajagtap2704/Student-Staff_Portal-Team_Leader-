import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import AuditLogsClient from "./AuditLogsClient";

export const metadata = {
  title: "Audit Logs | KALNET",
  description: "View system activity and audit trail",
};

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const user = session.user as any;

  // Only HOD can view audit logs
  if (user.role !== "HOD") {
    redirect("/dashboard");
  }

  return (
    <PageLayout session={session} title="Audit Logs">
      <AuditLogsClient />
    </PageLayout>
  );
}
