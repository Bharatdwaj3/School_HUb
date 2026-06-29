// hooks/useProfile.ts
'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { SchoolUser } from '@/store/avatarSlice';
import { api } from '@/lib/api';

export function useProfile() {
  const storeUser = useAppSelector((state) => state.avatar.user);
  const [profile, setProfile] = useState<SchoolUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
   const loadProfile = async () => {
      if (storeUser) {
        setProfile(storeUser);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await api.get('/auth/profile');
        
        if (data.success) {
          setProfile(data.user);
        }else {
          setError('Failed to load profile');
        }
      } catch(err) {
        console.error('Failed to fetch profile',err);
        setError('Network error while fetching profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [storeUser]);

  return { profile, 
    loading, 
    error,
    user: storeUser,
    isAuthenticated: !!storeUser || !!profile };
}