//app/api/families/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';

export const GET = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId } = sessionData;

    // Debug logging to see what's coming from the session
    console.log('=== Family API Debug ===');
    console.log('Role:', role);
    console.log('FamilyId:', familyId);
    console.log('Full session data:', sessionData);

    // Build where clause properly based on role
    let whereClause = {};
    
    if (role === 'SUPERADMIN') {
      // Superadmin sees all families
      whereClause = {};
      console.log('Superadmin: fetching all families');
    } else if (role === 'FAMILY_ADMIN' && familyId) {
      // Family admin only sees their own family
      whereClause = { 
        id: familyId 
      };
      console.log('Family Admin: fetching family with ID:', familyId);
    } else {
      // No valid familyId for family admin or unknown role
      console.log('No valid familyId for role:', role, '- returning empty array');
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

    console.log('Families found:', families.length);
    console.log('Families data:', families);
    console.log('=== End Family API Debug ===');

    return NextResponse.json(families, { status: 200 });
  } catch (err) {
    console.error("Structural Read Failure:", err);
    console.error("Error details:", {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ 
      error: "Failed to pull down structural organizational tracks",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
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
    console.error('Family creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create family', details: error.message },
      { status: 500 }
    );
  }
}
