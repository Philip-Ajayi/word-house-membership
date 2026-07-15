// app/api/insights/absentees/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;

    const whereClause = role === 'SUPERADMIN'
      ? {}
      : { familyId: familyId || undefined };

    // Pull members only within permitted scope
    const members = await prisma.member.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        family: { select: { name: true } },
        _count: {
          select: { attendances: true }
        }
      }
    });

    const TOTAL_SERVICES_BENCHMARK = 30;

    const absenteesData = members
      .map(m => {
        const missedCount = TOTAL_SERVICES_BENCHMARK - m._count.attendances;
        return {
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          family: m.family,
          missedCount: missedCount > 0 ? missedCount : 0
        };
      })
      .filter(m => m.missedCount > 6)
      .sort((a, b) => b.missedCount - a.missedCount);

    return NextResponse.json(absenteesData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to compile shepherding attention metric' }, { status: 500 });
  }
});