// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/model/user.model';
import Student from '@/model/student.model';
import Faculty from '@/model/faculty.model';
import Parent from '@/model/parent.model';
import { connectDB } from '@/lib/db';
import { setAccessToken, setRefreshToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { userName, fullName, email, role, password } = body;

    if (!userName || !fullName || !email || !role || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const validRoles = ['teacher', 'student', 'parent'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists', code: 'EMAIL_EXISTS' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      userName,
      fullName,
      email,
      role,                   
      password: hashedPassword,
      isActive: true,
    });

    await user.save();

    if (role === 'student') {
      await new Student({ userId: user._id }).save();
    } else if (role === 'teacher') {
      await new Faculty({ userId: user._id }).save();
    } else if (role === 'parent') {
      await new Parent({ userId: user._id }).save();
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Welcome to SchoolHub.',
        user: {
          id: user._id,
          userName: user.userName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    setAccessToken(response, user);
    await setRefreshToken(response, user);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during registration', code: 'REGISTRATION_ERROR' },
      { status: 500 }
    );
  }
}