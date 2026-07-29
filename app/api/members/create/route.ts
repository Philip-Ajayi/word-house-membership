// app/api/members/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/auth-guard';

export const POST = withAdminAuth(async (req, context, sessionData) => {
  try {
    const { role, familyId: adminFamilyId } = sessionData;

    const formData = await req.formData();

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const targetFamilyId = formData.get('familyId') as string;

    if (!firstName || !targetFamilyId) {
      return NextResponse.json(
        { error: 'Missing core parameters: firstName and familyId are required fields.' },
        { status: 400 }
      );
    }

    if (role !== 'SUPERADMIN' && targetFamilyId !== adminFamilyId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to insert members into this family structure.' },
        { status: 403 }
      );
    }

    const rawBirthMonth = formData.get('birthMonth') as string | null;
    const rawBirthDay = formData.get('birthDay') as string | null;
    const birthMonth = rawBirthMonth ? parseInt(rawBirthMonth, 10) : null;
    const birthDay = rawBirthDay ? parseInt(rawBirthDay, 10) : null;
    const finalBirthMonth = isNaN(birthMonth as any) ? null : birthMonth;
    const finalBirthDay = isNaN(birthDay as any) ? null : birthDay;

    // All array fields, now including unit
    const occupation = formData.get('occupation') ? JSON.parse(formData.get('occupation') as string) : [];
    const address = formData.get('address') ? JSON.parse(formData.get('address') as string) : [];
    const unit = formData.get('unit') ? JSON.parse(formData.get('unit') as string) : [];
    const phoneNumbers = formData.get('phoneNumbers') ? JSON.parse(formData.get('phoneNumbers') as string) : [];
    const emails = formData.get('emails') ? JSON.parse(formData.get('emails') as string) : [];

    const imageFile = formData.get('image') as File | null;
    let imgUrl = '';

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `members/${fileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from('avatars')
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: true
        });

      if (error) throw new Error(`Supabase upload failed: ${error.message}`);

      const { data: { publicUrl } } = supabaseAdmin.storage.from('avatars').getPublicUrl(filePath);
      imgUrl = publicUrl;
    }

    const newMember = await prisma.member.create({
      data: {
        firstName,
        lastName: lastName || null,
        birthMonth: finalBirthMonth,
        birthDay: finalBirthDay,
        occupation,
        address,        // persisted
        unit,           // persisted
        phoneNumbers,
        emails,
        img: imgUrl || null,
        familyId: targetFamilyId,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (err) {
    console.error('Core Congregation Write Interception Error:', err);
    return NextResponse.json(
      { error: 'Failed to write structural records to database platform.' },
      { status: 500 }
    );
  }
});