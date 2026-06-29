// app/api/parents/profile/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Parent from '@/model/parent.model';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/currentUser';

export async function GET() {
  try {
    await connectDB();
     const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const parents = await Parent.find({})
      .populate('userId', 'userName fullName email role avatar isActive').populate({ path: 'children', populate: { path: 'userId', select: 'fullName userName' } })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: parents.length,
      parents,
    });
  } catch (error: any) {
    console.error('Error fetching parents:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch parents'
      },
      { status: 500 }
    );
  }
}