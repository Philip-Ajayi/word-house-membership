//app/api/workers/insights/absentees/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;

    const whereClause: any = {
      unit: { isEmpty: false }, // only members with at least one unit
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
        lastTrainingAttendance: true,  // training-specific denormalised field
        phoneNumbers: true,
        family: { select: { name: true } },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const absentees = members
      .map((m) => {
        let missedCount: number;

        if (!m.lastTrainingAttendance) {
          // Never attended any training → extremely high missed count
          missedCount = 9999;
        } else {
          const last = new Date(m.lastTrainingAttendance);
          last.setHours(0, 0, 0, 0);
          const diffTime = today.getTime() - last.getTime();
          missedCount = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          family: m.family,
          phoneNumbers: m.phoneNumbers || [],
          missedCount,
        };
      })
      .filter((m) => m.missedCount > 7)
      .sort((a, b) => b.missedCount - a.missedCount);

    return NextResponse.json(absentees, { status: 200 });
  } catch (err) {
    console.error('Failed to compute training absentee insights:', err);
    return NextResponse.json(
      { error: 'Failed to compile training absentee metrics' },
      { status: 500 }
    );
  }
});