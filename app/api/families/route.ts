//app/api/families/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, _context: { params: { id: string } }, sessionData) => {
  try {
    const { role, familyId } = sessionData;

    // Filter families down to only their own family unless they are a SUPERADMIN
    const whereClause = role === 'SUPERADMIN' 
      ? {} 
      : { id: familyId || undefined };

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