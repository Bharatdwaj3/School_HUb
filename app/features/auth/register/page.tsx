// features/auth/register/page.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, GraduationCap, BookOpen, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const inputClass = 'w-full bg-bg-alt border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-50';

const ERROR_CODES: Record<string, string> = {
  EMAIL_EXISTS: 'An account with this email already exists.',
  VALIDATION_ERROR: 'Please fill in all required fields.',
  REGISTRATION_ERROR: 'Server error. Please try again.',
};

type UserRole = 'student' | 'teacher' | 'parent';

const ROLE_OPTIONS: { value: UserRole; label: string; icon: LucideIcon }[] = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'teacher', label: 'Teacher', icon: BookOpen },
  { value: 'parent', label: 'Parent', icon: Users },
];

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>('student');
  const [form, setForm] = useState({
    userName: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(ERROR_CODES[data.code] ?? data.message ?? 'Registration failed');
        return;
      }

      router.push('/features/auth/login');
    } catch (err) {
      console.error(err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-[45%] bg-primary flex-col justify-between px-16 py-14 relative overflow-hidden"
      >
        <span
          className="text-[8rem] font-black text-text-inverse/4 uppercase select-none whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', letterSpacing: '-0.05em' }}
        >
          SCHOOLHUB
        </span>

        <div>
          <div className="w-12 h-0.5 mb-6" style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)' }} />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/50 mb-4">
            Join the Community
          </p>
          <h1 className="text-4xl font-black text-text-inverse uppercase leading-none tracking-tight mb-6">
            Become part of<br />SchoolHub
          </h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 flex items-center justify-center px-8 py-14 overflow-y-auto"
      >
        <div className="w-full max-w-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cta mb-2">Get Started</p>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tight mb-1">Create Account</h1>
          <div className="w-8 h-0.5 mb-8" style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)' }} />

          <div className="flex gap-1.5 mb-6 bg-bg-alt border border-border rounded-xl p-1">
           {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  role === value
                    ? 'bg-primary text-accent shadow'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                 <Icon size={12} className="inline mr-1" /> {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-cta/10 border border-cta/30 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={15} className="text-cta shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-cta">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Username</label>
              <input
                type="text"
                placeholder="your_handle"
                value={form.userName}
                onChange={(e) => update('userName', e.target.value)}
                className={inputClass}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className={inputClass}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@school.edu"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className={`${inputClass} pr-10`}
                  required
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-accent text-[11px] font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-text-muted mt-8">
            Already have an account?{' '}
            <Link href="/features/auth/login" className="font-black text-primary hover:text-cta transition-colors uppercase tracking-widest">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}