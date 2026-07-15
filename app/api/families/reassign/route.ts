import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { memberId, newFamilyId } = await req.json();

    if (!memberId || !newFamilyId) {
      return NextResponse.json({ error: 'Target identifiers missing form payload inputs.' }, { status: 400 });
    }

    const updatedMemberNode = await prisma.member.update({
      where: { id: memberId },
      data: { familyId: newFamilyId }
    });

    return NextResponse.json(updatedMemberNode, { status: 200 });
  } catch (err) {
    console.error('Error moving structural congregant references:', err);
    return NextResponse.json({ error: 'Reassignment process unexpected data loop termination.' }, { status: 500 });
  }
}