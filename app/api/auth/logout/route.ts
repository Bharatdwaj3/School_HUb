//api/auth/logout/route.ts

import { NextResponse } from 'next/server';
import { clearAuthCookies, revokeRefreshToken } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth/currentUser';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user?.id) {
      await revokeRefreshToken(user.id);
    }

    const response = NextResponse.json({
      success: true,
      message: 'User logged out successfully',
      code: 'LOGOUT_SUCCESS',
    });

    clearAuthCookies(response);
    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Logout failed', 
        code: 'LOGOUT_FAILED' 
      },
      { status: 500 }
    );
  }
}