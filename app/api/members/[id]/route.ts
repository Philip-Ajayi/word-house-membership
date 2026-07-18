// app/api/members/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-guard';
import { supabaseAdmin } from '@/lib/supabase';

// Helper function to extract relative file paths from a Supabase Public URL
function getStoragePathFromUrl(url: string, bucketName: string): string | null {
  if (!url) return null;
  const parts = url.split(`/${bucketName}/`);
  return parts.length > 1 ? parts[1] : null;
}

// GET Node - Unchanged
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

// PUT Node - Modify structural properties safely and swap files
export const PUT = withAdminAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Identification value parameter node missing' }, { status: 400 });

    const formData = await req.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    
    // 1. Retrieve the raw form values
    const rawBirthMonth = formData.get('birthMonth') as string | null;
    const rawBirthDay = formData.get('birthDay') as string | null;

    // 2. Safely parse string values into integers (or null if empty/invalid)
    const birthMonth = rawBirthMonth && rawBirthMonth.trim() !== '' 
      ? parseInt(rawBirthMonth, 10) 
      : null;
      
    const birthDay = rawBirthDay && rawBirthDay.trim() !== '' 
      ? parseInt(rawBirthDay, 10) 
      : null;

    // Optional: Validate the numbers are valid if parsed
    if ((birthMonth !== null && isNaN(birthMonth)) || (birthDay !== null && isNaN(birthDay))) {
      return NextResponse.json({ error: 'Birth month and day must be valid numbers' }, { status: 400 });
    }

    const familyId = formData.get('familyId') as string;
    
    const occupation = formData.get('occupation') ? JSON.parse(formData.get('occupation') as string) : [];
    const phoneNumbers = formData.get('phoneNumbers') ? JSON.parse(formData.get('phoneNumbers') as string) : [];
    const emails = formData.get('emails') ? JSON.parse(formData.get('emails') as string) : [];
    
    const imageFile = formData.get('image') as File | null;

    if (!firstName || !familyId) {
      return NextResponse.json({ error: 'Primal identity requirements (firstName, familyId) unfulfilled' }, { status: 400 });
    }

    // Fetch existing member state to see if there is an old image to purge
    const currentMember = await prisma.member.findUnique({
      where: { id },
      select: { img: true }
    });

    let imgUrl = currentMember?.img || '';

    // If a new image file is supplied, delete the old file and upload the new one
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
        lastName: lastName || null, // Ensure empty strings fallback to null in DB
        birthMonth,                // Now passed as "number | null"
        birthDay,                  // Now passed as "number | null"
        occupation,
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

// DELETE Node - Remove metadata and remote storage assets cleanly
export const DELETE = withAdminAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing required identifier node parameter" }, { status: 400 });

    const member = await prisma.member.findUnique({
      where: { id },
      select: { img: true }
    });

    // Remove file asset from Supabase if it exists
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