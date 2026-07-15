//app/api/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

// We drop the unused context argument completely since /api/attendance has no dynamic params
export const GET = withAdminAuth(async (req: NextRequest, _context: any, sessionData) => {
  try {
    const { role, familyId } = sessionData;
    const { searchParams } = new URL(req.url);
    const dateString = searchParams.get('date');

    if (!dateString) {
      return NextResponse.json({ error: 'Missing required date parameter.' }, { status: 400 });
    }

    const targetDate = new Date(dateString);

    // Apply the structural filter deep inside the relational query
    const memberFilter = role === 'SUPERADMIN'
      ? {}
      : { familyId: familyId || undefined };

    // Avoid mutating targetDate directly if calculating ranges to prevent time-shift side-effects
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        member: memberFilter // Scopes records to members of the administrator's family
      },
      select: {
        memberId: true
      }
    });

    return NextResponse.json(records, { status: 200 });
  } catch (err) {
    console.error('Attendance Layer Scan Exception:', err);
    return NextResponse.json({ error: 'Failed mapping core identity indexes.' }, { status: 500 });
  }
});
