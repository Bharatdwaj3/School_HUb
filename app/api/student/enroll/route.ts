// app/api/student/enroll/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/currentUser';
import Student from '@/model/student.model';
import Subject from '@/model/subject.model';

export async function POST(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Only admin can enroll students' }, { status: 403 });
  }

  try {
    const { studentUserId, subjectId } = await req.json();

    if (!studentUserId || !subjectId) {
      return NextResponse.json({ success: false, message: 'studentUserId and subjectId are required' }, { status: 400 });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    }

    const student = await Student.findOneAndUpdate(
      { userId: studentUserId },
      { $addToSet: { enrollmentHistory: subjectId } },
      { new: true }
    ).populate('enrollmentHistory', 'name credits isElective');

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Student enrolled successfully', student });
  } catch (error) {
    console.error('Enroll error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Only admin can unenroll students' }, { status: 403 });
  }

  try {
    const { studentUserId, subjectId } = await req.json();

    if (!studentUserId || !subjectId) {
      return NextResponse.json({ success: false, message: 'studentUserId and subjectId are required' }, { status: 400 });
    }

    await Student.findOneAndUpdate(
      { userId: studentUserId },
      { $pull: { enrollmentHistory: subjectId } }
    );

    return NextResponse.json({ success: true, message: 'Student unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}