//api/auth/login/route.ts
import { rateLimit, getIP } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/model/user.model';
import { connectDB } from '@/lib/db';
import { setAccessToken, setRefreshToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const ip = getIP(request);
const { allowed, remaining } = rateLimit(ip, 'login', { limit: 5, windowMs: 15 * 60 * 1000 });
if (!allowed) {
  return NextResponse.json(
    { success: false, message: 'Too many login attempts. Try again in 15 minutes.', code: 'RATE_LIMITED' },
    { status: 429, headers: { 'Retry-After': '900', 'X-RateLimit-Remaining': String(remaining) } }
  );
}
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required', code: 'MISSING_CREDENTIALS' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated', code: 'ACCOUNT_DEACTIVATED' },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    user.lastLogin = new Date();
    await user.save();

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
       id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        schoolId: user.schoolId,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });

    setAccessToken(response, user);
    await setRefreshToken(response, user);

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error', code: 'LOGIN_FAILED' },
      { status: 500 }
    );
  }
}