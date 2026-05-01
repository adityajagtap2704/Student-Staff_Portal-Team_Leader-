import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, ChevronRight, Share2 } from "lucide-react";
import db from "@/lib/db";

type Category = "Events" | "Exams" | "Holidays" | "General";

const categoryMeta: Record<Category, { bg: string; text: string; placeholder: string; emoji: string }> = {
  Events:   { bg: "bg-amber-100",  text: "text-amber-700",   placeholder: "bg-amber-50",   emoji: "🎉" },
  Exams:    { bg: "bg-red-100",    text: "text-red-700",     placeholder: "bg-red-50",     emoji: "📝" },
  Holidays: { bg: "bg-emerald-100",text: "text-emerald-700", placeholder: "bg-emerald-50", emoji: "🌴" },
  General:  { bg: "bg-blue-100",   text: "text-blue-700",    placeholder: "bg-blue-50",    emoji: "📢" },
};

export default async function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  const annId = parseInt(params.id);
  if (isNaN(annId)) notFound();

  const announcement = await db.announcement.findUnique({ where: { id: annId } });
  if (!announcement) notFound();

  const related = await db.announcement.findMany({
    where: { category: announcement.category as any, id: { not: announcement.id } },
    take: 3,
    orderBy: { date: "desc" },
  });

  const meta = categoryMeta[announcement.category as Category] ?? categoryMeta["General"];

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const formatDateShort = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">

      {/* ── Sticky nav ── */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 pt-6 pb-4 px-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors font-medium group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Announcements
          </Link>
          <button
            className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Share"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* ── Hero image (full-bleed) ── */}
          <div className="relative w-full h-56 sm:h-80 overflow-hidden">
            {announcement.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={announcement.imageUrl}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full ${meta.placeholder} flex items-center justify-center`}>
                <span className="text-8xl opacity-20">{meta.emoji}</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            {/* Category badge on image */}
            <span className={`absolute bottom-4 left-6 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${meta.bg} ${meta.text}`}>
              {meta.emoji} {announcement.category}
            </span>
          </div>

          {/* ── Article body ── */}
          <div className="p-6 sm:p-10">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              {announcement.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center">
                  <Calendar size={14} className="text-primary-600" />
                </div>
                {formatDate(announcement.date)}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <User size={14} className="text-gray-500" />
                </div>
                {announcement.author}
              </div>
            </div>

            <div className="space-y-4 text-gray-600 leading-relaxed">
              {announcement.description.split("\n").map((para, i) => (
                para.trim() ? (
                  <p key={i} className="text-base leading-relaxed">{para}</p>
                ) : null
              ))}
            </div>
          </div>
        </article>

        {/* ── Related announcements ── */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Related Announcements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((item) => {
                const relMeta = categoryMeta[item.category as Category] ?? categoryMeta["General"];
                return (
                  <Link
                    href={`/announcements/${item.id}`}
                    key={item.id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full h-32 overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full ${relMeta.placeholder} flex items-center justify-center`}>
                          <span className="text-4xl opacity-20">{relMeta.emoji}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${relMeta.bg} ${relMeta.text}`}>
                          {item.category}
                        </span>
                        <span className="text-[10px] text-gray-400">{formatDateShort(item.date)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center text-xs font-semibold text-primary mt-3">
                        Read more <ChevronRight size={13} className="ml-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
