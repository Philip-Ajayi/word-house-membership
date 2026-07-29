//app/api/workers/attendance/route.ts
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

    // Only members with units (workers)
    const memberFilter: any = {
      unit: { isEmpty: false },
    };

    if (role !== 'SUPERADMIN') {
      memberFilter.familyId = familyId || undefined;
    }

    const records = await prisma.workerTrainingAttendance.findMany({
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
    console.error('Error fetching training attendance records:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve training attendance data.' },
      { status: 500 }
    );
  }
});