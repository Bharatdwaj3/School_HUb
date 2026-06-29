/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/faculty/profile/route.ts

import { NextResponse } from 'next/server';
import Faculty from '@/model/faculty.model';
import { connectDB } from '@/lib/db';
import '@/model/subject.model';
import { getCurrentUser } from '@/lib/auth/currentUser';

export async function GET() {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const faculty = await Faculty.find({})
      .populate('userId', 'userName fullName email role avatar isActive').populate('subjects', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: faculty.length,
      faculty,
    });
  } catch (error: any) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch faculty members'
      },
      { status: 500 }
    );
  }
}