//app/api/workers/attendance/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { memberIds, date, present } = await req.json();

    if (!Array.isArray(memberIds) || !date) {
      return NextResponse.json(
        { error: 'Invalid parameters: memberIds (array) and date are required.' },
        { status: 400 }
      );
    }

    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    if (present) {
      // Mark training attendance & update lastTrainingAttendance if newer
      await Promise.all(
        memberIds.map(async (id) => {
          await prisma.workerTrainingAttendance.upsert({
            where: { memberId_date: { memberId: id, date: baseDate } },
            update: {},
            create: { memberId: id, date: baseDate },
          });

          await prisma.member.updateMany({
            where: {
              id,
              OR: [
                { lastTrainingAttendance: null },
                { lastTrainingAttendance: { lt: baseDate } },
              ],
            },
            data: { lastTrainingAttendance: baseDate },
          });
        })
      );
    } else {
      // Remove training attendance for these members on this date
      await prisma.workerTrainingAttendance.deleteMany({
        where: {
          date: baseDate,
          memberId: { in: memberIds },
        },
      });

      // Recalculate the most recent training date for each affected member
      const maxDates = await prisma.workerTrainingAttendance.groupBy({
        by: ['memberId'],
        where: { memberId: { in: memberIds } },
        _max: { date: true },
      });

      const latestDateMap = new Map<string, Date | null>();
      maxDates.forEach((item) => {
        latestDateMap.set(item.memberId, item._max.date);
      });

      await Promise.all(
        memberIds.map((id) =>
          prisma.member.update({
            where: { id },
            data: { lastTrainingAttendance: latestDateMap.get(id) ?? null },
          })
        )
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Bulk training attendance processing error:', err);
    return NextResponse.json(
      { error: 'Failed to process training attendance batch.' },
      { status: 500 }
    );
  }
}