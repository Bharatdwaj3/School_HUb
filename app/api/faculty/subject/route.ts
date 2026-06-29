// app/api/faculty/subjects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/currentUser';
import Faculty from '@/model/faculty.model';
import Subject from '@/model/subject.model';

export async function POST(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (currentUser.role !== 'teacher') {
    return NextResponse.json({ success: false, message: 'Only teachers can assign subjects to themselves' }, { status: 403 });
  }

  try {
    const { subjectId } = await req.json();

    if (!subjectId) {
      return NextResponse.json({ success: false, message: 'subjectId is required' }, { status: 400 });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    }

    // Update subject's teacherId to this teacher
    await Subject.findByIdAndUpdate(subjectId, { teacherId: currentUser.id });

    // Add to faculty's subjects array
    const faculty = await Faculty.findOneAndUpdate(
      { userId: currentUser.id },
      { $addToSet: { subjects: subjectId } },
      { new: true }
    ).populate('subjects', 'name credits isElective');

    return NextResponse.json({ success: true, message: 'Subject assigned', faculty });
  } catch (error) {
    console.error('Assign subject error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE — teacher removes a subject from themselves
export async function DELETE(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (currentUser.role !== 'teacher') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { subjectId } = await req.json();

    if (!subjectId) {
      return NextResponse.json({ success: false, message: 'subjectId is required' }, { status: 400 });
    }

    await Faculty.findOneAndUpdate(
      { userId: currentUser.id },
      { $pull: { subjects: subjectId } }
    );

    return NextResponse.json({ success: true, message: 'Subject removed' });
  } catch (error) {
    console.error('Remove subject error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}