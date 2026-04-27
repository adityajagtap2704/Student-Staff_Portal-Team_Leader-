# KALNET FS-2 — Student & Staff Portal

**System 1 · Full Stack · April 2026**

KALNET FS-2 is the premier student-facing portal designed to provide a seamless digital experience for students and parents. From instant fee tracking to automated leave approvals and admission enquiries, this portal serves as the primary touchpoint for the KALNET ecosystem.

## 🚀 Key Features

### 👨‍🎓 Student Dashboard
- **Real-time Statistics**: Instant visibility of Total Fees, Paid Amount, and Outstanding Balances.
- **Dynamic Activity Feed**: A unified timeline of fee payments, leave status updates, and new announcements.
- **Quick Actions**: Fast-access links for essential tasks.

### 💰 Fee Management
- **Detailed History**: Complete breakdown of Tuition, Transport, and Activity fees across all terms.
- **Smart Highlighting**: Automatic detection and highlighting of overdue payments (`#FEF2F2`).
- **Receipts**: (Ready for integration) Downloadable proof of payments.

### 📅 Leave Requests
- **Easy Submission**: Submit leave requests with custom types and reasons.
- **Approval Chain**: Integrated with the FS-1 Staff Portal to trigger automatic approval workflows.
- **History Tracking**: Monitor the status of current and past requests (Approved/Pending/Rejected).

### 📢 Announcements Board
- **Categorized Notices**: Filter through Events, Exams, Holidays, and General updates.
- **Detail Pages**: In-depth view of notices with related announcements and featured images.

### 📝 Admission Enquiry
- **Public Access**: No login required for new parents to submit enquiries.
- **Auto-Generation**: Instant generation of unique reference numbers (`ENQ-YYYYMM-XXXX`).

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Database**: [MySQL 8](https://www.mysql.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- MySQL Server

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/adityajagtap2704/FS-2-Student-Staff-Portal.git
   cd FS-2-Student-Staff-Portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://root:PASSWORD@localhost:3306/kalnet_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-generated-secret"
   ```

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 System Integration (FS-1)

This portal connects to the **FS-1 Staff Portal** for leave approvals.
- **Endpoint**: `POST http://[FS-1-IP]:3001/api/approvals`
- **Trigger**: Submission of a leave request in FS-2 sends a payload to FS-1.
- **Status Sync**: FS-1 updates the shared `leave_requests` table to reflect approval status in the student portal.

## 👥 Team Members

| Name | Role | Focus |
| :--- | :--- | :--- |
| **Aditya B. Jagtap** | Team Lead | Architecture, NextAuth, Layouts |
| **K. V. Madham Mohan** | UI Developer 1 | Admissions, Announcements Board |
| **Gharke Ram Prasad** | API Developer | Fees API, Admissions POST, FS-1 Sync |
| **Aravind Kurra** | DB Developer | MySQL Schema, Prisma, Indian Seed Data |
| **Tanoor Kiran** | UI Developer 2 | Fees UI, Leave Request UI, Loading States |
| **Billola Abhinay Goud** | QA + Integration | Mobile Testing, Documentation, Cross-System QA |

---
**Issued by: Rishav Raj, CTO & Co-Founder | KALNET**
