//app/api/auth/[...nextauth]\route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma"; // Adjust this path to your actual prisma export

// Parse superadmin emails safely
const getSuperAdminEmails = (): string[] => {
  const envEmails = process.env.SUPERADMIN_EMAILS || "";
  return envEmails.split(",").map((email) => email.trim().toLowerCase());
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day in seconds
    updateAge: 4 * 60 * 60, // Refresh the token age every 4 hours if active
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // "user" is only available on initial sign-in
      if (account && user && user.email) {
        const userEmail = user.email.toLowerCase();
        const superadmins = getSuperAdminEmails();

        // 1. Check Superadmin Status
        if (superadmins.includes(userEmail)) {
          token.role = "SUPERADMIN";
          token.familyId = null;
          return token;
        }

        // 2. Check Family Admin Status
        // Look up if this email exists inside any Member record that is registered as a FamilyAdmin
        const familyAdminRecord = await prisma.familyAdmin.findFirst({
          where: {
            member: {
              emails: {
                has: userEmail, // Checks if email exists in your PG text[] array
              },
            },
          },
          select: {
            familyId: true,
          },
        });

        if (familyAdminRecord) {
          token.role = "FAMILY_ADMIN";
          token.familyId = familyAdminRecord.familyId;
        } else {
          token.role = "USER"; // Default fall-through fallback
          token.familyId = null;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Explicitly bind variables from JWT token into the client-facing session
      if (session.user) {
        session.user.role = token.role as string;
        session.user.familyId = token.familyId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Optional custom fallback
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
