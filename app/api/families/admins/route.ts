import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST Node - Append an overseer row configuration to the targeted structure item 
export async function POST(req: NextRequest) {
  try {
    const { familyId, memberId } = await req.json();

    if (!familyId || !memberId) {
      return NextResponse.json({ error: 'Missing core target model variables.' }, { status: 400 });
    }

    // Upsert relationship parameter logic matching uniquely compound index constraints
    const administrationAssignment = await prisma.familyAdmin.upsert({
      where: {
        familyId_memberId: { familyId, memberId }
      },
      update: {},
      create: { familyId, memberId }
    });

    return NextResponse.json(administrationAssignment, { status: 201 });
  } catch (err) {
    console.error('Error establishing database role record:', err);
    return NextResponse.json({ error: 'Failed initializing leadership role mapping.' }, { status: 500 });
  }
}

// DELETE Node - Remove authorized status without affecting primary membership rows
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing row key parameter.' }, { status: 400 });
    }

    await prisma.familyAdmin.delete({
      where: { id }
    });

    return NextResponse.json({ stripped: true }, { status: 200 });
  } catch (err) {
    console.error('Error stripping administrator authorization:', err);
    return NextResponse.json({ error: 'Role strip operation execution failure.' }, { status: 500 });
  }
}