// app/api/faculty/marks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/currentUser';
import Marks from '@/model/marks.model';
import Subject from '@/model/subject.model';

export async function GET(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId');
  const studentId = searchParams.get('studentId');

  if (!subjectId) {
    return NextResponse.json({ success: false, message: 'subjectId is required' }, { status: 400 });
  }

  try {
    const query: Record<string, unknown> = { subjectId };
    if (studentId) query.studentId = studentId;

    const marks = await Marks.find(query)
      .populate('studentId', 'userName fullName')
      .sort({ examType: 1 });

    return NextResponse.json({ success: true, marks });
  } catch (error) {
    console.error('Get marks error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST /api/faculty/marks — only teachers can enter marks
export async function POST(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (currentUser.role !== 'teacher') {
    return NextResponse.json({ success: false, message: 'Only teachers can enter marks' }, { status: 403 });
  }

  try {
    const { subjectId, studentId, examType, marks, totalMarks, remarks } = await req.json();

    if (!subjectId || !studentId || !examType || marks == null || !totalMarks) {
      return NextResponse.json(
        { success: false, message: 'subjectId, studentId, examType, marks, and totalMarks are required' },
        { status: 400 }
      );
    }

    if (marks > totalMarks) {
      return NextResponse.json(
        { success: false, message: 'Marks cannot exceed total marks' },
        { status: 400 }
      );
    }

    const subject = await Subject.findById(subjectId);
    if (!subject || subject.teacherId.toString() !== currentUser.id) {
      return NextResponse.json(
        { success: false, message: 'You are not assigned to this subject' },
        { status: 403 }
      );
    }

    const entry = await Marks.findOneAndUpdate(
      { subjectId, studentId, examType },
      {
        subjectId,
        studentId,
        examType,
        marks,
        totalMarks,
        remarks: remarks || '',
        markedBy: currentUser.id,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'Marks saved', marks: entry });
  } catch (error) {
    console.error('Post marks error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}