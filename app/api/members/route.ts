// app/api/members/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;

    const whereClause = role === "SUPERADMIN"
      ? {}
      : { familyId: familyId || undefined };

    const members = await prisma.member.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        occupation: true,
        address: true,     // now included
        unit: true,        // now included
        phoneNumbers: true,
        emails: true,
        img: true,
        familyId: true,
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json(members, { status: 200 });
  } catch (err) {
    console.error("Critical Registry Read Error:", err);
    return NextResponse.json({ error: "System failed to read congregation records" }, { status: 500 });
  }
});