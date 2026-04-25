export type AnnouncementCategory = "All" | "Events" | "Exams" | "Holidays" | "General";

export interface Announcement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  shortDescription: string;
  description: string;
  date: string;
  author: string;
  imageUrl?: string;
}

export const announcements: Announcement[] = [
  {
    id: "ann-001",
    title: "Annual Sports Meet 2026",
    category: "Events",
    shortDescription: "Join us for the Annual Sports Meet with games and prizes.",
    description: "We are excited to announce the KALNET Annual Sports Meet 2026! It will be a week-long event starting next Monday. Students from all grades are encouraged to participate in track and field, team sports, and recreational activities. Parents are welcome to attend the opening ceremony. Please register with your sports instructor by Friday.",
    date: "2026-05-10",
    author: "Sports Department",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "ann-002",
    title: "Mid-Term Examination Schedule",
    category: "Exams",
    shortDescription: "The mid-term exam schedule for classes 6 to 12 is out.",
    description: "The mid-term examinations for classes 6 through 12 will commence on June 15th, 2026. The detailed date sheet has been sent to your registered email addresses and is also available on the student portal. Please ensure you clear all dues before collecting your admit cards. We wish all students the very best for their preparations.",
    date: "2026-05-12",
    author: "Academic Coordinator",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "ann-003",
    title: "Summer Vacation Announcement",
    category: "Holidays",
    shortDescription: "School will be closed for summer vacation from July 1st.",
    description: "Please be informed that KALNET will observe summer vacation starting from July 1st, 2026. The school will reopen for regular classes on August 15th, 2026. Holiday homework and project assignments will be distributed in the last week of June. We hope all our students and staff have a restful and enjoyable summer break.",
    date: "2026-05-15",
    author: "Principal's Office",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "ann-004",
    title: "🧠 Science Fair 2026 Registrations",
    category: "Events",
    shortDescription: "Register your projects for the upcoming Science Fair.",
    description: "The Annual Science Fair is scheduled for August 20th, 2026. Students interested in showcasing their working models or research projects must submit their abstracts by the end of this month. Top three projects will represent the school at the State Level Science Exhibition. Contact your science teachers for guidance and registration details.",
    date: "2026-05-18",
    author: "Science Club",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "ann-005",
    title: "New Bus Routes Added",
    category: "General",
    shortDescription: "We have added 3 new bus routes for student convenience.",
    description: "To accommodate the growing number of students from suburban areas, we have introduced three new bus routes starting next month. The new routes will cover Northville, Eastgate, and Westside neighborhoods. Parents interested in opting for the transport service can fill out the updated transport request form on the portal.",
    date: "2026-05-20",
    author: "Transport Admin",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000",
  },
];
