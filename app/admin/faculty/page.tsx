// app/admin/faculty/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UserGrid } from '@/components/UserGrid';
import type { FacultyUser } from '@/components/UserCard';
import { Search } from 'lucide-react';

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyUser[]>([]);
  const [filtered, setFiltered] = useState<FacultyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.get('/faculty/profile');
        const list = data?.faculty ?? data?.data ?? [];
        setFaculty(list);
        setFiltered(list);
      } catch (err) {
        console.error('Failed to fetch faculty', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      faculty.filter(
        (f) =>
          f.userId?.fullName?.toLowerCase().includes(q) ||
          f.userId?.userName?.toLowerCase().includes(q) ||
          f.department?.toLowerCase().includes(q)
      )
    );
  }, [search, faculty]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-cta mb-1">School</p>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Faculty</h2>
          <p className="text-text-muted text-sm mt-1">{faculty.length} members</p>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-bg-alt border border-border rounded-xl text-sm text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-bg-alt border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <UserGrid
          users={filtered}
          hrefBuilder={(u) => `/features/faculty/${u._id}`}
          emptyMessage={search ? 'No faculty match your search' : 'No faculty yet'}
        />
      )}
    </div>
  );
}