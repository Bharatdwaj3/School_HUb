// app/admin/layout.tsx
'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, GraduationCap, BookOpen, Users, LogOut, Library } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/avatarSlice';
import { useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: GraduationCap },
  { href: '/admin/faculty', label: 'Faculty', icon: BookOpen },
  { href: '/admin/parents', label: 'Parents', icon: Users },
  { href: '/admin/subjects', label: 'Subjects', icon: Library },
];

function AdminSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    dispatch(clearUser());
    router.replace('/features/auth/login');
  };

  return (
    <aside className="w-60 shrink-0 bg-bg-alt border-r border-border flex flex-col min-h-screen">
      <div className="px-6 py-6 border-b border-border">
        <p className="text-[9px] font-black uppercase tracking-widest text-cta mb-1">SchoolHub</p>
        <h1 className="text-xl font-black text-primary uppercase tracking-tight">Admin</h1>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                active
                  ? 'bg-primary text-bg'
                  : 'text-text-muted hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-bg">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}