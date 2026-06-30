// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'SchoolHub',
    });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed' },
      { status: 503 }
    );
  }
}