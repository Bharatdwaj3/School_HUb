// app/api/parents/profile/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Parent from '@/model/parent.model';
import '@/model/student.model';
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
    const parent = await Parent.findOne({ userId: id })
      .populate('userId', 'userName fullName email role avatar').populate({ path: 'children', populate: { path: 'userId', select: 'fullName userName avatar' } });

    if (!parent) {
      return NextResponse.json({ success: false, message: 'Parent profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, parent });
  } catch (error: any) {
    console.error('Get parent error:', error);
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

  if (!['parent', 'admin'].includes(user.role || '')) {
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

    const updated = await Parent.findOneAndUpdate(
      { userId: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Parent profile updated successfully',
      parent: updated 
    });
  } catch (error: any) {
    console.error('Update parent error:', error);
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
    await Parent.findOneAndDelete({ userId: id });
    return NextResponse.json({ success: true, message: 'Parent account deleted successfully' });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}