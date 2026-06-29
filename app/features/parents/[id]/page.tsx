// features/parents/[id]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, LogOut, Users, GraduationCap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser } from '@/store/avatarSlice';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Child {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    userName: string;
    avatar?: string;
  };
  class?: string;
  section?: string;
  rollNumber?: string;
}

interface ParentProfile {
  _id: string;
  children?: Child[];
  mediaUrl?: string;
  userId: {
    _id: string;
    userName: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export default function ParentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.avatar.user);

  const [id, setId] = useState('');
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const isOwner = currentUser?.id?.toString() === id;

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const loadParent = async () => {
      try {
        const res = await fetch(`/api/parent/profile/${id}`);
        const data = await res.json();
        if (res.status === 401) { router.push('/features/auth/login'); return; }
        if (res.status === 403) { router.push('/unauthorized'); return; }
        if (!data.success || !data.parent) { setParent(null); return; }
        setParent(data.parent);
      } catch (err) {
        console.error(err);
        setParent(null);
      } finally {
        setLoading(false);
      }
    };
    loadParent();
  }, [id, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(clearUser());
      router.push('/features/auth/login');
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  if (!parent) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-text-inverse">
      <p className="text-3xl font-black mb-4">Parent not found</p>
      <Link href="/features/parents" className="flex items-center gap-2 text-accent hover:underline">
        <ArrowLeft size={18} /> Back to All Parents
      </Link>
    </div>
  );

  const { userId, children, mediaUrl } = parent;
  const fullName = userId.fullName;
  const userName = userId.userName;
  const avatar = userId.avatar || mediaUrl;

  return (
    <ProtectedRoute allowedRoles={['teacher', 'parent']}>
      <div className="bg-primary min-h-screen">

        <div className="py-16 px-6 relative overflow-hidden">
          <span
            className="text-[8rem] font-black text-text-inverse/10 uppercase select-none whitespace-nowrap absolute right-8 top-1/2 -translate-y-1/2"
            style={{ writingMode: 'vertical-rl' }}
          >
            {userName}
          </span>

          <Link href="/features/parents" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-inverse/70 hover:text-white">
            <ArrowLeft size={16} /> All Parents
          </Link>

          {isOwner && (
            <button onClick={handleLogout} disabled={loggingOut} className="absolute top-6 right-6 flex items-center gap-2 px-5 py-2 text-sm font-black uppercase tracking-widest border border-white/30 rounded-xl hover:bg-white/10 text-white disabled:opacity-50">
              {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              Sign Out
            </button>
          )}

          <div className="max-w-6xl mx-auto relative">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-2">PARENT PROFILE</p>
            <h1 className="text-5xl font-black text-white uppercase tracking-tight">{fullName}</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-16 space-y-16">

          <div className="flex flex-col md:flex-row gap-8">
            <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shrink-0">
              {avatar ? (
                <Image src={avatar} alt={fullName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <Users size={48} className="text-white/30" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-widest text-accent">@{userName}</p>
              <p className="text-white/80 mt-1">{userId.email}</p>
              {children && children.length > 0 && (
                <p className="mt-3 text-lg text-accent">
                  Parent of {children.length} {children.length === 1 ? 'child' : 'children'}
                </p>
              )}
            </div>
          </div>

          <section>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-6">About</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: fullName },
                { label: 'Username', value: `@${userName}` },
                { label: 'Email', value: userId.email },
                { label: 'Role', value: userId.role },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent/70 mb-1">{label}</p>
                  <p className="text-white font-black">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-6">Children</p>
            {children && children.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {children.map((child) => (
                  <Link key={child._id} href={`/features/students/${child.userId._id}`}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-accent/40 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        <GraduationCap size={24} className="text-white/30" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase tracking-tight group-hover:text-accent transition-colors">{child.userId.fullName}</p>
                        <p className="text-[10px] text-white/50 mt-0.5">@{child.userId.userName}</p>
                        {child.rollNumber && <p className="text-[10px] text-accent/70 mt-1">Roll No: {child.rollNumber}</p>}
                        {child.class && <p className="text-[10px] text-white/40 mt-0.5">Class {child.class}{child.section}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users size={40} className="text-white/20" />
                <p className="text-white/40 font-black uppercase tracking-widest text-sm">No Children Linked</p>
                <p className="text-white/30 text-sm text-center max-w-xs">Contact the school administrator to link your child&apos;s profile.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </ProtectedRoute>
  );
}