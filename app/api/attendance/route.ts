//app/api/attendance/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;
    const { searchParams } = new URL(req.url);
    const dateString = searchParams.get('date');

    if (!dateString) {
      return NextResponse.json({ error: 'Missing required date parameter parameter.' }, { status: 400 });
    }

    const targetDate = new Date(dateString);

    // Apply the structural filter deep inside the relational query
    const memberFilter = role === 'SUPERADMIN'
      ? {}
      : { familyId: familyId || undefined };

    const records = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999))
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