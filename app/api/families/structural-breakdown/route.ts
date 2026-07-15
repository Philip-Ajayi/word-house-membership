import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const structures = await prisma.family.findMany({
      include: {
        admins: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                emails: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(structures, { status: 200 });
  } catch (err) {
    console.error('Failure mapping structural database columns:', err);
    return NextResponse.json({ error: 'Failed structural breakdown hydration sequence.' }, { status: 500 });
  }
}