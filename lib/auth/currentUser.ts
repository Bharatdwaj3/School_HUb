// lib/auth/currentUser.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/model/user.model';
import { JWT_ACC_SECRET } from '@/config/env';
import { connectDB } from '@/lib/db';

interface JWTPayload {
  user: {
    id: string;
    role?: string;
  };
  iat?: number;
  exp?: number;
}

interface CurrentUser {
  id: string;
  userName?: string;
  email?: string;
  role?: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  try {
    await connectDB();

    const payload = jwt.verify(token, JWT_ACC_SECRET!) as JWTPayload;

    const user = await User.findById(payload.user.id)
      .select('isActive role userName email');

    if (!user || !user.isActive) return null;

    return {
      id: payload.user.id,
      role: user.role,
      userName: user.userName,
      email: user.email,
    };
  } catch (err) {
    console.warn('JWT verification failed:', (err as Error).message);
    return null;
  }
}