// app/api/members/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';
import { supabaseAdmin } from '@/lib/supabase';

function getStoragePathFromUrl(url: string, bucketName: string): string | null {
  if (!url) return null;
  const parts = url.split(`/${bucketName}/`);
  return parts.length > 1 ? parts[1] : null;
}

// GET – unchanged but now returns address & unit automatically (they're part of the model)
export const GET = withAdminAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Identification value parameter node missing' }, { status: 400 });

    const member = await prisma.member.findUnique({
      where: { id },
      include: { family: { select: { name: true } } }
    });

    if (!member) return NextResponse.json({ error: 'No profile found inside ledger parameters' }, { status: 404 });
    return NextResponse.json(member, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal failure processing relation lookups' }, { status: 500 });
  }
});

// PUT – now extracts address and unit
export const PUT = withAdminAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Identification value parameter node missing' }, { status: 400 });

    const formData = await req.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    const rawBirthMonth = formData.get('birthMonth') as string | null;
    const rawBirthDay = formData.get('birthDay') as string | null;

    const birthMonth = rawBirthMonth && rawBirthMonth.trim() !== ''
      ? parseInt(rawBirthMonth, 10)
      : null;
    const birthDay = rawBirthDay && rawBirthDay.trim() !== ''
      ? parseInt(rawBirthDay, 10)
      : null;

    if ((birthMonth !== null && isNaN(birthMonth)) || (birthDay !== null && isNaN(birthDay))) {
      return NextResponse.json({ error: 'Birth month and day must be valid numbers' }, { status: 400 });
    }

    const familyId = formData.get('familyId') as string;

    // Parse array fields – now includes address and unit
    const occupation = formData.get('occupation') ? JSON.parse(formData.get('occupation') as string) : [];
    const address = formData.get('address') ? JSON.parse(formData.get('address') as string) : [];
    const unit = formData.get('unit') ? JSON.parse(formData.get('unit') as string) : [];
    const phoneNumbers = formData.get('phoneNumbers') ? JSON.parse(formData.get('phoneNumbers') as string) : [];
    const emails = formData.get('emails') ? JSON.parse(formData.get('emails') as string) : [];

    const imageFile = formData.get('image') as File | null;

    if (!firstName || !familyId) {
      return NextResponse.json({ error: 'Primal identity requirements (firstName, familyId) unfulfilled' }, { status: 400 });
    }

    const currentMember = await prisma.member.findUnique({
      where: { id },
      select: { img: true }
    });

    let imgUrl = currentMember?.img || '';

    if (imageFile && imageFile.size > 0) {
      const bucket = 'avatars';
      if (currentMember?.img) {
        const oldPath = getStoragePathFromUrl(currentMember.img, bucket);
        if (oldPath) {
          await supabaseAdmin.storage.from(bucket).remove([oldPath]);
        }
      }
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `members/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, imageFile, { contentType: imageFile.type, upsert: true });

      if (uploadError) throw new Error(`Supabase upload failed: ${uploadError.message}`);
      const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
      imgUrl = publicUrl;
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        firstName,
        lastName: lastName || null,
        birthMonth,
        birthDay,
        occupation,
        address,      // added
        unit,         // added
        phoneNumbers,
        emails,
        img: imgUrl || null,
        familyId
      }
    });

    return NextResponse.json(updatedMember, { status: 200 });
  } catch (err) {
    console.error('Preservation Submission Interception Write Error:', err);
    return NextResponse.json({ error: 'Failed to persist congregant profile revisions' }, { status: 500 });
  }
});

// DELETE – unchanged (no array fields involved)
export const DELETE = withAdminAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing required identifier node parameter" }, { status: 400 });

    const member = await prisma.member.findUnique({
      where: { id },
      select: { img: true }
    });

    if (member?.img) {
      const bucket = 'avatars';
      const storagePath = getStoragePathFromUrl(member.img, bucket);
      if (storagePath) {
        await supabaseAdmin.storage.from(bucket).remove([storagePath]);
      }
    }

    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ message: "Congregant metadata and assets cleanly removed" }, { status: 200 });
  } catch (err) {
    console.error("Administrative Deletion Exception Intercepted:", err);
    return NextResponse.json({ error: "Failed to finalize structural ledger adjustment" }, { status: 500 });
  }
});