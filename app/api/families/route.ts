//app/api/families/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;

    // Build where clause properly
    let whereClause = {};
    
    if (role === 'SUPERADMIN') {
      // Superadmin sees all families
      whereClause = {};
    } else if (role === 'FAMILY_ADMIN' && familyId) {
      // Family admin only sees their own family
      whereClause = { id: familyId };
    } else {
      // If no valid familyId for family admin, return empty array
      return NextResponse.json([], { status: 200 });
    }

    const families = await prisma.family.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(families, { status: 200 });
  } catch (err) {
    console.error("Structural Read Failure:", err);
    return NextResponse.json({ error: "Failed to pull down structural organizational tracks" }, { status: 500 });
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Family name is required' },
        { status: 400 }
      );
    }

    const newFamily = await prisma.family.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(newFamily, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create family', details: error.message },
      { status: 500 }
    );
  }
}
