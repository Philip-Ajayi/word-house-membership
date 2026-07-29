//app/api/workers/members/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;

    const whereClause: any = {
      unit: { isEmpty: false }, // only members that have at least one unit
    };

    if (role !== 'SUPERADMIN') {
      whereClause.familyId = familyId || undefined;
    }

    const members = await prisma.member.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        img: true,
        family: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json(members, { status: 200 });
  } catch (err) {
    console.error('Worker members fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve workers list' },
      { status: 500 }
    );
  }
});