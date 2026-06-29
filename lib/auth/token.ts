// lib/auth/token.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/model/user.model';
import {
  JWT_ACC_SECRET,
  JWT_ACC_EXPIRES_IN,
  JWT_REF_SECRET,
  JWT_REF_EXPIRES_IN
} from '@/config/env';
import { NextResponse } from 'next/server';

interface AuthUser {
  _id: string | { toString(): string };
  role?: string;
}

interface AccessPayload {
  user: { id: string; role?: string };
}

interface RefreshPayload {
  user: { id: string };
}

export const cookieOpts = (maxAge: number, path = '/') => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path,
  maxAge: maxAge * 1000,
} as const);

export const setAccessToken = (response: NextResponse, user: AuthUser) => {
  const payload: AccessPayload = {
    user: { 
      id: user._id.toString(), 
      role: user.role 
    }
  };

  const signOptions: SignOptions = {
    expiresIn: JWT_ACC_EXPIRES_IN as SignOptions['expiresIn']
  };

  const token = jwt.sign(payload, JWT_ACC_SECRET!, signOptions);

  response.cookies.set('accessToken', token, cookieOpts(15 * 60));
  return token;
};

export const setRefreshToken = async (response: NextResponse, user: AuthUser) => {
  const payload: RefreshPayload = { user: { id: user._id.toString() } };

  const signOptions: SignOptions = {
    expiresIn: JWT_REF_EXPIRES_IN as SignOptions['expiresIn']
  };

  const token = jwt.sign(payload, JWT_REF_SECRET!, signOptions);

  await User.findByIdAndUpdate(user._id, {
    refreshToken: token,
    lastLogin: new Date()
  });

 const refreshExpiry = 3600;

  response.cookies.set('refreshToken', token, cookieOpts(refreshExpiry, '/'));

  return token;
};

export const clearAuthCookies = (response: NextResponse) => {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
};

export const revokeRefreshToken = async (userID: string) => {
  if (!userID) return;
  await User.findByIdAndUpdate(userID, {
    refreshToken: null,
    lastLogin: new Date()
  });
};

export const refreshTokenHandler = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('refreshToken')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'No refresh token provided', code: 'REFRESH_TOKEN_MISSING' },
      { status: 401 }
    );
  }

  try {
    const payload = jwt.verify(token, JWT_REF_SECRET!) as RefreshPayload;

    const user = await User.findOne({
      _id: payload.user.id,
      refreshToken: token,
      isActive: true
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or revoked token', code: 'REFRESH_TOKEN_INVALID' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      expiresIn: JWT_ACC_EXPIRES_IN,
    });

    setAccessToken(response, user);
    await setRefreshToken(response, user);

    return response;
  } catch (err) {
    console.error('Refresh token error:', (err as Error).message);
    return NextResponse.json(
      { success: false, message: 'Refresh token expired or invalid', code: 'REFRESH_TOKEN_EXPIRED' },
      { status: 401 }
    );
  }
};