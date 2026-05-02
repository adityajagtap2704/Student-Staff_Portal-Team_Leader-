import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@/lib/db";
import { comparePassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. Try Staff (CLASS_TEACHER / HOD) first
        const staff = await db.staff.findUnique({
          where: { email: credentials.email },
        });

        if (staff && staff.isActive) {
          const passwordMatch = await comparePassword(credentials.password, staff.password);
          if (passwordMatch) {
            return {
              id:           staff.id.toString(),
              name:         staff.name,
              email:        staff.email,
              role:         staff.role,          // "CLASS_TEACHER" | "HOD"
              assignedClass: staff.assignedClass ?? undefined,
            };
          }
        }

        // 2. Try Student - Login with Email + Password (set during account setup)
        const student = await db.student.findUnique({
          where: { email: credentials.email },
        });

        if (student && student.isActive && student.password) {
          const passwordMatch = await comparePassword(credentials.password, student.password);
          console.log(`[AUTH] Student login attempt: ${credentials.email}, Password match: ${passwordMatch}`);
          if (passwordMatch) {
            return {
              id:    student.id.toString(),
              name:  student.name,
              email: student.email,
              role:  "STUDENT",
            };
          }
        } else {
          console.log(`[AUTH] Student not found or inactive: ${credentials.email}, Found: ${!!student}, Active: ${student?.isActive}, Has password: ${!!student?.password}`);
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id           = user.id;
        token.role         = (user as any).role;
        token.assignedClass = (user as any).assignedClass;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id           = token.id;
        (session.user as any).role         = token.role;
        (session.user as any).assignedClass = token.assignedClass;
      }
      return session;
    },
  },
};
