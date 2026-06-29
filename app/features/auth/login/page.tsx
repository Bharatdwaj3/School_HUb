// features/auth/login/page.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion'; // ← Added missing import
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/avatarSlice';
import { rehydrate } from '@/store/contentSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const inputClass = 'w-full bg-bg-alt border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-50';

const ERROR_CODES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email or password is incorrect',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Contact administrator.',
  MISSING_CREDENTIALS: 'Please enter both email and password',
  LOGIN_FAILED: 'Server error. Please try again.',
};

const getRedirect = (role: string, id: string) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'teacher': return `/features/faculty/${id}`;
    case 'student': return `/features/students/${id}`;
    case 'parent': return `/features/parents/${id}`;
    default: return '/login';
  }
};

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(ERROR_CODES[data.code] ?? data.message ?? 'Something went wrong');
        return;
      }

      localStorage.setItem('currentUserId', data.user.id);
      dispatch(setUser(data.user));
      dispatch(rehydrate());

      router.push(getRedirect(data.user.role, data.user.id));
    } catch (err) {
      console.error(err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
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
            Welcome Back
          </p>
          <h1 className="text-4xl font-black text-text-inverse uppercase leading-none tracking-tight mb-6">
            Sign in to<br />manage your<br />school
          </h1>
        </div>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 flex items-center justify-center px-8"
      >
        <div className="w-full max-w-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cta mb-2">Welcome Back</p>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tight mb-1">Sign In</h1>
          <div className="w-8 h-0.5 mb-8" style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)' }} />

          {error && (
            <div className="flex items-start gap-3 bg-cta/10 border border-cta/30 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={15} className="text-cta shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-cta">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  required
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
                <><Loader2 size={14} className="animate-spin" /> Signing In...</>
              ) : (
                <>Sign In <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-text-muted mt-8">
            No account?{' '}
            <Link href="/features/auth/register" className="font-black text-primary hover:text-cta transition-colors uppercase tracking-widest">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}