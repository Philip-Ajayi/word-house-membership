import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { memberIds, date, present } = await req.json();

    if (!Array.isArray(memberIds) || !date) {
      return NextResponse.json({ error: 'Invalid parameters given' }, { status: 400 });
    }

    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    if (present) {
      // Batch execute structural upserts
      await Promise.all(
        memberIds.map(async (id) => {
          await prisma.attendance.upsert({
            where: { memberId_date: { memberId: id, date: baseDate } },
            update: {},
            create: { memberId: id, date: baseDate }
          });
          
          await prisma.member.update({
            where: { id },
            data: { lastAttendance: baseDate }
          });
        })
      );
    } else {
      // Purge database parameters matching current range
      await prisma.attendance.deleteMany({
        where: {
          date: baseDate,
          memberId: { in: memberIds }
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Bulk processing error:', err);
    return NextResponse.json({ error: 'Batch processing execution failure' }, { status: 500 });
  }
}