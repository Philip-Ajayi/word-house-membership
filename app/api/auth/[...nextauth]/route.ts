//app/api/auth/[...nextauth]\route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// --- Helpers to parse env email lists ---
const getSuperAdminEmails = (): string[] =>
  (process.env.SUPERADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

const getWorkEmails = (): string[] =>
  (process.env.WORK_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 4 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user && user.email) {
        const userEmail = user.email.toLowerCase();
        const superAdmins = getSuperAdminEmails();
        const workEmails = getWorkEmails();

        const isSuperAdmin = superAdmins.includes(userEmail);
        const isWorker = workEmails.includes(userEmail);

        // 1. Superadmin logic
        if (isSuperAdmin) {
          token.role = "SUPERADMIN";
          token.familyId = null;
          token.canAccessWorkers = true;
          token.canAccessFamilyAdmin = true;
          return token;
        }

        // 2. DB Family Admin lookup (only for non-superadmins)
        const familyAdminRecord = await prisma.familyAdmin.findFirst({
          where: {
            member: {
              emails: { has: userEmail },
            },
          },
          select: { familyId: true },
        });

        if (familyAdminRecord) {
          token.role = "FAMILY_ADMIN";
          token.familyId = familyAdminRecord.familyId;
        } else {
          token.role = "USER";
          token.familyId = null;
        }

        // 3. Permission flags based on env lists (apply to any role)
        token.canAccessWorkers = isWorker;
        token.canAccessFamilyAdmin = isWorker;   // workers also get family admin pages
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.familyId = token.familyId as string | null;
        session.user.canAccessWorkers = token.canAccessWorkers as boolean;
        session.user.canAccessFamilyAdmin = token.canAccessFamilyAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
