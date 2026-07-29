//app/api/workers/attendance/toggle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { memberId, date, present } = await req.json();

    if (!memberId || !date) {
      return NextResponse.json({ error: 'Incomplete parameters supplied' }, { status: 400 });
    }

    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    if (present) {
      // Create or confirm training attendance
      await prisma.workerTrainingAttendance.upsert({
        where: {
          memberId_date: { memberId, date: baseDate },
        },
        update: {},
        create: { memberId, date: baseDate },
      });

      // Update the denormalised field only if this date is more recent
      await prisma.member.updateMany({
        where: {
          id: memberId,
          OR: [
            { lastTrainingAttendance: null },
            { lastTrainingAttendance: { lt: baseDate } },
          ],
        },
        data: { lastTrainingAttendance: baseDate },
      });
    } else {
      // Remove the record
      await prisma.workerTrainingAttendance.deleteMany({
        where: {
          memberId,
          date: baseDate,
        },
      });

      // Recalculate the last training date
      const latest = await prisma.workerTrainingAttendance.findFirst({
        where: { memberId },
        orderBy: { date: 'desc' },
        select: { date: true },
      });

      await prisma.member.update({
        where: { id: memberId },
        data: { lastTrainingAttendance: latest?.date ?? null },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Toggle training attendance error:', err);
    return NextResponse.json({ error: 'Processing write target exception' }, { status: 500 });
  }
}