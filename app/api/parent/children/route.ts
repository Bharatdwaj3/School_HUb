// app/api/parent/children/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/currentUser';
import Parent from '@/model/parent.model';
import Student from '@/model/student.model';

// POST /api/parent/children — admin links a student to a parent
export async function POST(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Only admin can link children' }, { status: 403 });
  }

  try {
    const { parentId, studentId } = await req.json();

    if (!parentId || !studentId) {
      return NextResponse.json({ success: false, message: 'parentId and studentId are required' }, { status: 400 });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    // Link student to parent
    const parent = await Parent.findByIdAndUpdate(
      parentId,
      { $addToSet: { children: studentId } },
      { new: true }
    ).populate({ path: 'children', populate: { path: 'userId', select: 'fullName userName' } });

    if (!parent) {
      return NextResponse.json({ success: false, message: 'Parent not found' }, { status: 404 });
    }

    // Also set parentId on student
    await Student.findByIdAndUpdate(studentId, { parentId });

    return NextResponse.json({ success: true, message: 'Child linked successfully', parent });
  } catch (error) {
    console.error('Link child error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/parent/children — admin unlinks a student from a parent
export async function DELETE(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Only admin can unlink children' }, { status: 403 });
  }

  try {
    const { parentId, studentId } = await req.json();

    if (!parentId || !studentId) {
      return NextResponse.json({ success: false, message: 'parentId and studentId are required' }, { status: 400 });
    }

    await Parent.findByIdAndUpdate(parentId, { $pull: { children: studentId } });
    await Student.findByIdAndUpdate(studentId, { $unset: { parentId: 1 } });

    return NextResponse.json({ success: true, message: 'Child unlinked successfully' });
  } catch (error) {
    console.error('Unlink child error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}