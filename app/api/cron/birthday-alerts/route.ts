// app/api/cron/birthday-alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';

export async function GET(request: NextRequest) {
  // 1. Verify Vercel Cron Header / Token Security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 2. Compute Tomorrow's Month and Day
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const targetMonth = tomorrow.getMonth() + 1;
    const targetDay = tomorrow.getDate();

    // 3. Fetch Tomorrow's Birthday Celebrants
    const celebrants = await prisma.member.findMany({
      where: {
        birthMonth: targetMonth,
        birthDay: targetDay,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        family: {
          select: {
            name: true,
          },
        },
      },
    });

    // 4. Handle "No Birthdays" Case (Nothing gets sent)
    if (celebrants.length === 0) {
      return NextResponse.json({ 
        message: 'No birthdays tomorrow. No email sent.' 
      });
    }

    // 5. Parse Superadmin Emails from Environment
    const superadminEmailsString = process.env.SUPERADMIN_EMAILS || '';
    const toEmails = superadminEmailsString
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (toEmails.length === 0) {
      console.warn('CRON WARNING: No superadmin emails found in SUPERADMIN_EMAILS.');
      return NextResponse.json({ error: 'No recipients configured' }, { status: 500 });
    }

    // 6. Format Email Content
    const dateFormatted = tomorrow.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const celebrantListHtml = celebrants
      .map(
        (c) =>
          `<li><strong>${c.firstName} ${c.lastName}</strong> ${
            c.family?.name ? `(${c.family.name})` : ''
          }</li>`
      )
      .join('');

    const emailSubject = `🎂 Birthday Alert for Tomorrow (${dateFormatted})`;
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Tomorrow's Birthdays</h2>
        <p>The following members are celebrating their birthday tomorrow, <strong>${dateFormatted}</strong>:</p>
        <ul style="font-size: 16px; line-height: 1.6;">
          ${celebrantListHtml}
        </ul>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
        <p style="font-size: 12px; color: #666;">This is an automated administrative notification sent by your application scheduler.</p>
      </div>
    `;

    // 7. Send Single Email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Mail <alerts@mail.mivwordhouse.com>', // Replace with your verified domain
      to: toEmails,
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: `Email alert successfully sent to ${toEmails.length} admin(s).`,
      celebrantCount: celebrants.length,
      resendId: data?.id,
    });
  } catch (error: any) {
    console.error('Cron birthday job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
