// app/api/students/profile/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Student from '@/model/student.model';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/currentUser';

export async function GET() {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();

    if (!currentUser ) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const students = await Student.find({})
      .populate('userId', 'userName fullName email role avatar isActive').populate('enrollmentHistory', 'name code credits isElective')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch students'
      },
      { status: 500 }
    );
  }
}