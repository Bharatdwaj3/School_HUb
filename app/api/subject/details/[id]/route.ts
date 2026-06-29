/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/subject/details/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Subject from '@/model/subject.model';
import Faculty from '@/model/faculty.model';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { connectDB } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    const subject = await Subject.findById(id).populate('teacherId', 'userName fullName email role avatar');
    if (!subject) return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    return NextResponse.json({ success: true, subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    const existing = await Subject.findById(id);
    if (!existing) return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    const body = await req.json();
    const updateData: Record<string, any> = {};
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.code) updateData.code = body.code;
    if (body.credits !== undefined) updateData.credits = parseInt(body.credits);
    if (body.isElective !== undefined) updateData.isElective = body.isElective;
    if (body.teacherId) updateData.teacherId = body.teacherId;
    if (Object.keys(updateData).length === 0) return NextResponse.json({ success: false, message: 'No data provided' }, { status: 400 });
    const updated = await Subject.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    return NextResponse.json({ success: true, message: 'Subject updated', subject: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    const existing = await Subject.findById(id);
    if (!existing) return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    await Faculty.findOneAndUpdate({ userId: existing.teacherId }, { $pull: { subjects: id } });
    await Subject.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Subject deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}