// /app/api/families/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 1. CHANGE FAMILY NAME (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Updated family name is required' },
        { status: 400 }
      );
    }

    // Verify family exists first
    const existingFamily = await prisma.family.findUnique({
      where: { id },
    });

    if (!existingFamily) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    const updatedFamily = await prisma.family.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(updatedFamily);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update family name', details: error.message },
      { status: 500 }
    );
  }
}

// 2. DELETE A FAMILY (DELETE)
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // 1. Find family and check for existing member associations
    const familyWithMembers = await prisma.family.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!familyWithMembers) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // 2. Prevent deletion if members still belong to the family
    if (familyWithMembers._count.members > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete family',
          details: `This family still contains ${familyWithMembers._count.members} active member(s). Move or delete the members first.`,
        },
        { status: 400 }
      );
    }

    // 3. Perform the deletion (Cascade will automatically clean up associated FamilyAdmin rows)
    await prisma.family.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Family successfully deleted.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete family', details: error.message },
      { status: 500 }
    );
  }
}