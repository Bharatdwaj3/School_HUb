// app/admin/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, Users, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useProfile } from '@/hooks/useProfile';

interface Stats {
  students: number;
  faculty: number;
  parents: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="bg-bg-alt border border-border rounded-2xl p-6 flex items-center gap-5 hover:border-primary/40 hover:shadow-xl transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon size={22} className="text-primary" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-primary/10 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-black text-primary">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useProfile();
  const [stats, setStats] = useState<Stats>({ students: 0, faculty: 0, parents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, faculty, parents] = await Promise.all([
          api.get('/student/profile'),
          api.get('/faculty/profile'),
          api.get('/parent/profile'),
        ]);
        setStats({
          students: students?.data?.length ?? students?.students?.length ?? 0,
          faculty: faculty?.data?.length ?? faculty?.faculty?.length ?? 0,
          parents: parents?.data?.length ?? parents?.parents?.length ?? 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const total = stats.students + stats.faculty + stats.parents;

  return (
    <div className="p-8">=
      <div className="mb-10">
        <p className="text-[9px] font-black uppercase tracking-widest text-cta mb-1">Overview</p>
        <h2 className="text-4xl font-black text-primary uppercase tracking-tight">
          Welcome, {user?.fullName?.split(' ')[0] ?? 'Admin'}
        </h2>
        <p className="text-text-muted text-sm mt-1">Here&apos;s what&apos;s happening at your school today.</p>
      </div>
=
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        <StatCard label="Students" value={stats.students} icon={GraduationCap} loading={loading} />
        <StatCard label="Faculty" value={stats.faculty} icon={BookOpen} loading={loading} />
        <StatCard label="Parents" value={stats.parents} icon={Users} loading={loading} />
        <StatCard label="Total Users" value={total} icon={TrendingUp} loading={loading} />
      </div>

      {/* Quick Links */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-4">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/admin/students', label: 'Manage Students', icon: GraduationCap },
            { href: '/admin/faculty', label: 'Manage Faculty', icon: BookOpen },
            { href: '/admin/parents', label: 'Manage Parents', icon: Users },
          ].map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-4 border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
            >
              <Icon size={18} className="text-text-muted group-hover:text-primary transition-colors" />
              <span className="text-sm font-bold uppercase tracking-wide text-text-muted group-hover:text-primary transition-colors">
                {label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}