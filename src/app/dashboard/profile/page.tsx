import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import ProfileClient from "./ProfileClient";
import db from "@/lib/db";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as { id: string };
  const studentId = parseInt(user.id);

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      fees: true,
      leaveRequests: true,
    }
  });

  if (!student) redirect("/login");

  return (
    <PageLayout session={session} title="My Profile">
      <ProfileClient student={student} />
    </PageLayout>
  );
}
