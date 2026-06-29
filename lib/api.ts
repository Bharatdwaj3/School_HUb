/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api.ts
import { getCookie, deleteCookie } from 'cookies-next';

const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_PROD_URL || 'http://localhost:5001'
  : process.env.NEXT_PUBLIC_DEV_URL || 'http://localhost:3000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? getCookie('accessToken') : null;

  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    const error: any = new Error(`API ${res.status}`);
    error.status = res.status;
    error.data = data;
    error.config = { url: endpoint, _retry: (options as any)._retry };
    throw error;
  }

  return data;
}

async function request(endpoint: string, options: RequestInit = {}) {
  try {
    return await fetchAPI(endpoint, options);
  } catch (error: any) {
    const isAuthRoute = endpoint.includes('/auth/refresh') || endpoint.includes('/auth/login');

    if (error.status === 401 && !error.config?._retry && !isAuthRoute) {
      error.config._retry = true;

      try {
       await fetchAPI('/auth/refresh', { method: 'POST' });
return fetchAPI(endpoint, options);
      } catch {
        if (typeof window !== 'undefined') {
          deleteCookie('accessToken', { path: '/' });
          deleteCookie('refreshToken', { path: '/' });

          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            window.location.href = '/features/auth/login';
          }
        }
        throw error;
      }
    }
    throw error;
  }
}

export const api = {
  get: (url: string) => request(url),
  post: (url: string, body?: any) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body?: any) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url: string) => request(url, { method: 'DELETE' }),
};

export default api;