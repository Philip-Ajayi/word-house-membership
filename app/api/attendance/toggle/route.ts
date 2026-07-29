//app/api/attendance/toggle/route.ts
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
      // Upsert entry directly into transaction schema
      await prisma.attendance.upsert({
        where: {
          memberId_date: { memberId, date: baseDate }
        },
        update: {},
        create: { memberId, date: baseDate }
      });

      // Maintain internal tracking consistency
      await prisma.member.update({
        where: { id: memberId },
        data: { lastAttendance: baseDate }
      });
    } else {
      // Safely delete unselected registry targets
      await prisma.attendance.deleteMany({
        where: {
          memberId,
          date: baseDate
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Transactional error writing status toggle updates:', err);
    return NextResponse.json({ error: 'Processing write target exception' }, { status: 500 });
  }
}