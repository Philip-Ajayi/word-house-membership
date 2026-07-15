import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// 1. Make the handler type generic.
// Next.js 15+ wraps route params in a Promise, so we allow Promise<any> or any.
type AuthenticatedHandler<TParams = any> = (
  req: NextRequest,
  context: { params: TParams },
  sessionData: { role: string; familyId: string | null }
) => Promise<NextResponse>;

// 2. Make the guard function generic.
export function withAdminAuth<TParams = any>(handler: AuthenticatedHandler<TParams>) {
  return async (req: NextRequest, context: { params: TParams }) => {
    try {
      // Fetch NextAuth session server-side
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }

      const { role, familyId } = session.user;

      // Short-circuit if Superadmin
      if (role === "SUPERADMIN") {
        return handler(req, context, { role, familyId });
      }

      // Evaluate Family Admin Constraints
      if (role === "FAMILY_ADMIN" && familyId) {
        // Safe check for dynamic route params (Next.js 15+ requires awaiting params)
        const resolvedParams = context.params instanceof Promise 
          ? await context.params 
          : (context.params as any);

        const id = resolvedParams?.id;

        if (id) {
          // Verify member belongs to this admin's family
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

      // Fallback denial
      return NextResponse.json({ error: "Forbidden: Insufficient clear privileges" }, { status: 403 });
    } catch (error) {
      console.error("Auth Guard Interception Error:", error);
      return NextResponse.json({ error: "Internal Auth Processing Failure" }, { status: 500 });
    }
  };
}
