// app/api/students/profile/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Student from '@/model/student.model';
import '@/model/subject.model';
import User from '@/model/user.model';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { connectDB } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const student = await Student.findOne({ userId: id })
      .populate('userId', 'userName fullName email role avatar').populate('enrollmentHistory', 'name description credits isElective img');

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    console.error('Get student error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (!['student', 'admin', 'teacher'].includes(user.role || '')) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  if (user.id !== id && user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'You can only update your own profile' }, { status: 403 });
  }

  const updateData: Record<string, any> = {};

  try {
    const body = await req.json();
    Object.assign(updateData, body);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'No data provided to update' }, { status: 400 });
    }

    const updated = await Student.findOneAndUpdate(
      { userId: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Student profile updated successfully',
      student: updated 
    });
  } catch (error: any) {
    console.error('Update student error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (currentUser.id !== id && currentUser.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    await User.findByIdAndDelete(id);
    await Student.findOneAndDelete({ userId: id });
    return NextResponse.json({ success: true, message: 'Student account deleted successfully' });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}