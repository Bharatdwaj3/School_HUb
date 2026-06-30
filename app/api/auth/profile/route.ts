// app/api/auth/profile/route.ts
import { NextResponse } from 'next/server';
import User from '@/model/user.model';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/currentUser';

export async function GET() {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const profile = await User.findById(currentUser.id)
      .select('-password -refreshToken');

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome to your SchoolHub dashboard!',
      user: {
        id: profile._id,
        userName: profile.userName,
        fullName: profile.fullName,
        email: profile.email,
        role: currentUser.role,           // Updated
        avatar: profile.avatar,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        lastLogin: profile.lastLogin,
        schoolId: profile.schoolId,
      },
    });
  } catch (err) {
    console.error('Profile error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error', code: 'PROFILE_FAILED' },
      { status: 500 }
    );
  }
}