import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type AuthenticatedHandler = (
  req: NextRequest,
  context: { params: { id: string } },
  sessionData: { role: string; familyId: string | null }
) => Promise<NextResponse>;

export function withAdminAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, context: { params: { id: string } }) => {
    try {
      // 1. Fetch NextAuth session server-side
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }

      const { role, familyId } = session.user;

      // 2. Short-circuit if Superadmin (They bypass all data multi-tenancy limits)
      if (role === "SUPERADMIN") {
        return handler(req, context, { role, familyId });
      }

      // 3. Evaluate Family Admin Constraints
      if (role === "FAMILY_ADMIN" && familyId) {
        const { id } = context.params;

        if (id) {
          // If a specific member ID is being accessed, verify they belong to this admin's family
          const targetMember = await prisma.member.findUnique({
            where: { id },
            select: { familyId: true },
          });

          if (!targetMember || targetMember.familyId !== familyId) {
            return NextResponse.json(
              { error: "Forbidden: You do not have permission to manage this member" },
              { status: 403 }
            );
          }
        }

        // If a request payload body contains a familyId variation (e.g., PUT), verify it aligns
        if (["POST", "PUT"].includes(req.method)) {
          // Clone the request to read body without breaking downstream processing streams
          const clonedReq = req.clone();
          const body = await clonedReq.json().catch(() => ({}));
          
          if (body.familyId && body.familyId !== familyId) {
            return NextResponse.json(
              { error: "Forbidden: Cannot assign members to another family structural scope" },
              { status: 403 }
            );
          }
        }

        return handler(req, context, { role, familyId });
      }

      // 4. Fallback denial if role unrecognized or default user
      return NextResponse.json({ error: "Forbidden: Insufficient clear privileges" }, { status: 403 });
    } catch (error) {
      console.error("Auth Guard Interception Error:", error);
      return NextResponse.json({ error: "Internal Auth Processing Failure" }, { status: 500 });
    }
  };
}