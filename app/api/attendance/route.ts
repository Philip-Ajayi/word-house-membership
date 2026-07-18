//app/api/attendance/toggle/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;
    const { searchParams } = new URL(req.url);
    const dateString = searchParams.get('date');

    if (!dateString) {
      return NextResponse.json(
        { error: 'Missing required parameter: date.' },
        { status: 400 }
      );
    }

    const targetDate = new Date(dateString);

    // Build member filter based on user role (SUPERADMIN sees all, others are scoped to their family)
    const memberFilter =
      role === 'SUPERADMIN'
        ? {}
        : { familyId: familyId || undefined };

    const records = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
        member: memberFilter,
      },
      select: {
        memberId: true,
      },
    });

    return NextResponse.json(records, { status: 200 });
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve attendance data.' },
      { status: 500 }
    );
  }
});