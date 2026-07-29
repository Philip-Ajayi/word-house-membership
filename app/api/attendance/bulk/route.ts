//app/api/attendance/bulk/route.ts
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
      // Mark attendance and update lastAttendance only if this date is more recent
      await Promise.all(
        memberIds.map(async (id) => {
          // Upsert attendance record
          await prisma.attendance.upsert({
            where: { memberId_date: { memberId: id, date: baseDate } },
            update: {},
            create: { memberId: id, date: baseDate },
          });

          // Conditionally update lastAttendance: only when new date > existing lastAttendance
          await prisma.member.updateMany({
            where: {
              id,
              OR: [
                { lastAttendance: null },
                { lastAttendance: { lt: baseDate } },
              ],
            },
            data: { lastAttendance: baseDate },
          });
        })
      );
    } else {
      // Remove attendance for the given members on this date
      await prisma.attendance.deleteMany({
        where: {
          date: baseDate,
          memberId: { in: memberIds },
        },
      });

      // Recalculate the most recent attendance date for each affected member
      const maxDates = await prisma.attendance.groupBy({
        by: ['memberId'],
        where: { memberId: { in: memberIds } },
        _max: { date: true },
      });

      // Map each memberId to its most recent attendance date (or null if none remain)
      const latestDateMap = new Map<string, Date | null>();
      maxDates.forEach((item) => {
        latestDateMap.set(item.memberId, item._max.date);
      });

      // Update each member's lastAttendance to the recalculated value
      await Promise.all(
        memberIds.map((id) =>
          prisma.member.update({
            where: { id },
            data: { lastAttendance: latestDateMap.get(id) ?? null },
          })
        )
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Bulk attendance processing error:', err);
    return NextResponse.json(
      { error: 'Failed to process attendance batch.' },
      { status: 500 }
    );
  }
}