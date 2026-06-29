'use client';
import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg">
      <ShieldOff size={48} className="text-primary/20" />
      <p className="text-[9px] font-black uppercase tracking-widest text-cta">Access Denied</p>
      <h1 className="text-4xl font-black text-primary uppercase tracking-tight">Unauthorized</h1>
      <p className="text-text-muted text-sm">You don&apos;t have permission to view this page.</p>
      <Link href="/" className="mt-4 text-[11px] font-black uppercase tracking-widest text-primary hover:text-cta transition-colors">
        Go Home
      </Link>
    </div>
  );
}
