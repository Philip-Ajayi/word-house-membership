//app/api/insights/birthdays/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;
    const today = new Date();
    
    const computeTargetDay = (offset: number) => {
      const target = new Date(today);
      target.setDate(today.getDate() + offset);
      return { month: target.getMonth() + 1, day: target.getDate() };
    };

    const t = computeTargetDay(1);  // Tomorrow
    const dat = computeTargetDay(2); // Day after tomorrow
    const it3 = computeTargetDay(3); // In 3 days

    // Scaffold where-clause parameters depending on role permissions
    const scopeClause = role === 'SUPERADMIN'
      ? {}
      : { familyId: familyId || undefined };

    const selectFields = {
      id: true,
      firstName: true,
      lastName: true,
      birthDay: true,
      family: { select: { name: true } }
    };

    const [tomorrowMembers, datMembers, it3Members] = await Promise.all([
      prisma.member.findMany({ 
        where: { ...scopeClause, birthMonth: t.month, birthDay: t.day }, 
        select: selectFields 
      }),
      prisma.member.findMany({ 
        where: { ...scopeClause, birthMonth: dat.month, birthDay: dat.day }, 
        select: selectFields 
      }),
      prisma.member.findMany({ 
        where: { ...scopeClause, birthMonth: it3.month, birthDay: it3.day }, 
        select: selectFields 
      })
    ]);

    return NextResponse.json({
      tomorrow: tomorrowMembers,
      dayAfterTomorrow: datMembers,
      inThreeDays: it3Members
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to query dynamic birthday segments' }, { status: 500 });
  }
});