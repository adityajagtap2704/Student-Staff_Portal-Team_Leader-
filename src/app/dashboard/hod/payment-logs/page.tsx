import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import PaymentLogsClient from "./PaymentLogsClient";

export const metadata = {
  title: "Payment Webhook Logs | KALNET",
  description: "View payment webhook events and debug payment issues",
};

export default async function PaymentLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const user = session.user as any;

  // Only HOD can view payment logs
  if (user.role !== "HOD") {
    redirect("/dashboard");
  }

  return (
    <PageLayout session={session} title="Payment Webhook Logs">
      <PaymentLogsClient />
    </PageLayout>
  );
}
