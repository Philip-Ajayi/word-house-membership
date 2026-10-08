import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // 1. Verify Vercel Cron Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const results = {
    prisma: 'pending',
    supabase: 'pending',
    timestamp: new Date().toISOString(),
  };

  // 2. Ping Prisma (Database query)
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.prisma = 'ok';
  } catch (error: any) {
    console.error('Prisma keep-alive failed:', error);
    results.prisma = `error: ${error.message}`;
  }

  // 3. Ping Supabase Services (Storage bucket check)
  try {
    const { error } = await supabaseAdmin.storage.listBuckets();
    if (error) throw error;
    results.supabase = 'ok';
  } catch (error: any) {
    console.error('Supabase keep-alive failed:', error);
    results.supabase = `error: ${error.message}`;
  }

  const hasError = results.prisma.startsWith('error') || results.supabase.startsWith('error');

  return NextResponse.json(results, { status: hasError ? 500 : 200 });
}
