// app/api/faculty/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/currentUser';
import Attendance from '@/model/attendance.model';
import Subject from '@/model/subject.model';

export async function GET(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId');
  const date = searchParams.get('date');

  if (!subjectId) {
    return NextResponse.json({ success: false, message: 'subjectId is required' }, { status: 400 });
  }

  try {
    const query: Record<string, unknown> = { subjectId };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query)
      .populate('records.studentId', 'userName fullName')
      .sort({ date: -1 });

    return NextResponse.json({ success: true, attendance: records });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (currentUser.role !== 'teacher') {
    return NextResponse.json({ success: false, message: 'Only teachers can mark attendance' }, { status: 403 });
  }

  try {
    const { subjectId, date, records } = await req.json();

    if (!subjectId || !date || !records?.length) {
      return NextResponse.json(
        { success: false, message: 'subjectId, date, and records are required' },
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

    const attendanceDate = new Date(date);
    attendanceDate.setHours(12, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
        subjectId,
        date: { $gte: new Date(date + 'T00:00:00'), $lte: new Date(date + 'T23:59:59') },
      },
      { subjectId, markedBy: currentUser.id, date: attendanceDate, records },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'Attendance saved', attendance });
  } catch (error) {
    console.error('Post attendance error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}