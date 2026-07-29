import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      familyId: string | null;
      canAccessWorkers: boolean;
      canAccessFamilyAdmin: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    familyId?: string | null;
    canAccessWorkers?: boolean;
    canAccessFamilyAdmin?: boolean;
  }
}