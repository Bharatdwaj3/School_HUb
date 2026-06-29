import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = [
  '//checkout',
];

const GUEST_ONLY = [
  '/features/auth/login',
  '/features/auth/register',
];

const AUTH_ROUTES = [
  '/api/auth/refresh',
  '/api/auth/login',
];

const REFRESH_TIMEOUT_MS = 8000;

function getLoginUrl(request: NextRequest, pathname: string) {
  const url = new URL('/features/auth/login', request.url);
  url.searchParams.set('redirect', pathname);
  return url;
}

function isProtectedRoute(pathname: string) {
  return PROTECTED.some((p) => pathname.startsWith(p));
}

function isGuestOnlyRoute(pathname: string) {
  return GUEST_ONLY.some((p) => pathname.startsWith(p));
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((r) => pathname.startsWith(r));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken  = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  if (!accessToken && !refreshToken) {
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(getLoginUrl(request, pathname));
    }
    return NextResponse.next();
  }

  if (accessToken) {
    if (isGuestOnlyRoute(pathname)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

    const refreshRes = await fetch(
      new URL('/api/auth/refresh', request.url).toString(),
      {
        method:  'POST',
        headers: { cookie: `refreshToken=${refreshToken}` },
        signal:  controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (refreshRes.ok) {
      const response  = NextResponse.next();
      const setCookie = refreshRes.headers.get('set-cookie');
      if (setCookie) {
        response.headers.set('set-cookie', setCookie);
      }
      if (isGuestOnlyRoute(pathname)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return response;
    }

    if (isProtectedRoute(pathname)) {
      const res = NextResponse.redirect(getLoginUrl(request, pathname));
      res.cookies.delete('accessToken');
      res.cookies.delete('refreshToken');
      return res;
    }

    return NextResponse.next();
  } catch {
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(getLoginUrl(request, pathname));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/features/:path*',
    '/((?!api|_next|favicon|public).*)',
  ],
};