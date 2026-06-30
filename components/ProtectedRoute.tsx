/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ProtectedRoute.tsx'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface Props {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student' | 'parent')[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/features/auth/login' 
}: Props) {
  const router = useRouter();
  const { user, loading } = useAppSelector((s) => s.avatar);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as any)) {
      router.replace('/unauthorized');
    }
  }, [user, loading, allowedRoles, router, redirectTo]);

  //if (loading || !user) return <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>Loading...</div>;
  if (loading || !user) return <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>Loading...</div>;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as any)) return null;

  return <>{children}</>;
}