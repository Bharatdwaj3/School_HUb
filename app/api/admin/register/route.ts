// app/api/admin/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/model/user.model';
import { connectDB } from '@/lib/db';
import { setAccessToken, setRefreshToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();

    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userName, fullName, email, password } = body;

    if (!userName || !fullName || !email || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      userName,
      fullName,
      email,
      role: 'admin',
      password: hashedPassword,
      isActive: true,
    });

    await user.save();

    const response = NextResponse.json({
      success: true,
      message: 'Admin created.',
      user: {
        id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });

    setAccessToken(response, user);
    await setRefreshToken(response, user);
    return response;

  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}