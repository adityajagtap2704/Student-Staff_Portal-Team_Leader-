import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

const announcements = [
  { id: "1", title: "Annual Sports Day – 30 April 2026", body: "All students are requested to participate in the Annual Sports Day event. Registration closes on 25 April. Prizes for top performers in each category.\n\nThe event will be held at the school grounds from 8 AM to 4 PM. Students are requested to wear their house colours. Parents are welcome to attend.\n\nFor registration, visit the sports office or fill the online form on the portal.", date: "21 Apr 2026", tag: "Event", tagVariant: "info" as const, emoji: "🎉" },
  { id: "2", title: "Term 2 Fee Payment Reminder", body: "Term 2 fees of ₹8,500 are due by 15 April 2026. Please ensure timely payment to avoid late charges and account suspension.\n\nPayment can be made online via the Fees section of this portal, or at the accounts office between 9 AM and 3 PM on weekdays.\n\nFor any queries, contact fees@kalnet.edu.", date: "18 Apr 2026", tag: "Finance", tagVariant: "warning" as const, emoji: "💰" },
  { id: "3", title: "Summer Vacation Schedule 2026", body: "School will remain closed from 1 May to 15 June 2026 for summer vacation. Online classes will continue for Grades 9–12.", date: "15 Apr 2026", tag: "Holiday", tagVariant: "success" as const, emoji: "🌴" },
  { id: "4", title: "Parent-Teacher Meeting – 28 April", body: "PTM is scheduled for 28 April 2026. Parents are requested to attend between 9 AM and 1 PM. Slot booking opens on 22 April.", date: "10 Apr 2026", tag: "Meeting", tagVariant: "primary" as const, emoji: "📋" },
  { id: "5", title: "Board Exam Timetable Released", body: "The board examination timetable for Grade 10 and 12 has been released. Students can download it from the academic portal.", date: "05 Apr 2026", tag: "Academic", tagVariant: "purple" as const, emoji: "📚" },
  { id: "6", title: "Library Timings Updated", body: "The school library will now be open from 8 AM to 6 PM on weekdays. Weekend access requires prior permission from the librarian.", date: "01 Apr 2026", tag: "General", tagVariant: "neutral" as const, emoji: "📢" },
];

export default async function AnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const announcement = announcements.find((a) => a.id === params.id);
  if (!announcement) notFound();

  const related = announcements.filter((a) => a.id !== params.id).slice(0, 3);

  return (
    <PageLayout session={session} title="Announcement">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* Back */}
        <Link
          href="/dashboard/announcements"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Announcements
        </Link>

        {/* Article */}
        <article className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={announcement.tagVariant}>
                {announcement.emoji} {announcement.tag}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#444] leading-snug">
              {announcement.title}
            </h1>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {announcement.date}
              </span>
              <span className="flex items-center gap-1">
                <Tag size={12} />
                {announcement.tag}
              </span>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-50">
              {announcement.body.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              More Announcements
            </p>
            <div className="space-y-2">
              {related.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/announcements/${a.id}`}
                  className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-card p-4 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="text-lg">{a.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#444] group-hover:text-primary transition-colors truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-400">{a.date}</p>
                  </div>
                  <ArrowLeft size={14} className="text-gray-300 group-hover:text-primary rotate-180 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
