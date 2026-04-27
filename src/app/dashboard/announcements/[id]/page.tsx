import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import db from "@/lib/db";

type Category = "Events" | "Exams" | "Holidays" | "General";

const categoryConfig: Record<Category, { variant: "info" | "warning" | "success" | "neutral"; emoji: string }> = {
  Events:   { variant: "info",    emoji: "🎉" },
  Exams:    { variant: "warning", emoji: "📝" },
  Holidays: { variant: "success", emoji: "🌴" },
  General:  { variant: "neutral", emoji: "📢" },
};

export default async function AnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const annId = parseInt(params.id);
  if (isNaN(annId)) notFound();

  const announcement = await db.announcement.findUnique({
    where: { id: annId },
  });

  if (!announcement) notFound();

  // Related: same category, excluding current, latest 3
  const related = await db.announcement.findMany({
    where: {
      category: announcement.category,
      id: { not: announcement.id },
    },
    orderBy: { date: "desc" },
    take: 3,
  });

  const cfg = categoryConfig[announcement.category as Category];

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

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
          {/* Featured image if present */}
          {announcement.imageUrl && (
            <div className="w-full h-48 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={announcement.imageUrl}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={cfg.variant}>
                {cfg.emoji} {announcement.category}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#444] leading-snug">
              {announcement.title}
            </h1>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(announcement.date)}
              </span>
              <span className="flex items-center gap-1">
                <User size={12} />
                {announcement.author}
              </span>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-50">
              {announcement.description.split("\n").map((para, i) => (
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
              {related.map((a) => {
                const relCfg = categoryConfig[a.category as Category];
                return (
                  <Link
                    key={a.id}
                    href={`/dashboard/announcements/${a.id}`}
                    className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-card p-4 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className="text-lg">{relCfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#444] group-hover:text-primary transition-colors truncate">
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(a.date)}</p>
                    </div>
                    <ArrowLeft size={14} className="text-gray-300 group-hover:text-primary rotate-180 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
