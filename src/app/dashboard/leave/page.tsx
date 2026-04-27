import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import LeaveClient from "./LeaveClient";
import db from "@/lib/db";

export default async function LeavePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as { id: string };
  const studentId = parseInt(user.id);

  const leaveRequests = await db.leaveRequest.findMany({
    where: { studentId },
    orderBy: { submittedAt: "desc" },
  });

  const stats = {
    total: leaveRequests.length,
    approved: leaveRequests.filter(r => r.status === "APPROVED").length,
    pending: leaveRequests.filter(r => r.status === "PENDING").length,
    daysTaken: leaveRequests.filter(r => r.status === "APPROVED").reduce((acc, r) => {
      const diff = new Date(r.toDate).getTime() - new Date(r.fromDate).getTime();
      return acc + Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }, 0)
  };

  return (
    <PageLayout session={session} title="Leave">
      <LeaveClient initialData={leaveRequests} stats={stats} />
    </PageLayout>
  );
}
