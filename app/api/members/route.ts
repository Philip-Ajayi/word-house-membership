import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;

    // Build conditional filtration rules based on user role
    const whereClause = role === "SUPERADMIN" 
      ? {} // Superadmin sees everyone
      : { familyId: familyId || undefined }; // Family admin filtered strictly to their family scope

    const members = await prisma.member.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        occupation: true,
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