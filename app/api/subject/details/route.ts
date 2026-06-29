/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/subjects/details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Faculty from '@/model/faculty.model';
import Subject from '@/model/subject.model';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/currentUser';

export async function GET() {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const subjects = await Subject.find({})
      .populate('teacherId', 'userName fullName email role avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: subjects.length,
      subjects,
    });
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Only admins can create subjects' }, { status: 403 });
    }

    const { name, description, code, credits, teacherId, isElective, schedule } = await req.json();

    if (!name || !code || !teacherId) {
      return NextResponse.json(
        { success: false, message: 'name, code, and teacherId are required' },
        { status: 400 }
      );
    }

    const subject = await Subject.create({
      name,
      description: description || '',
      code,
      credits: credits ?? 3,
      teacherId,
      isElective: isElective ?? false,
      schedule: schedule || {},
    });

    await Faculty.findOneAndUpdate(
      { userId: teacherId },
      { $addToSet: { subjects: subject._id } }
    );

    return NextResponse.json({ success: true, message: 'Subject created', subject }, { status: 201 });
  } catch (error: any) {
    console.error('Create subject error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
