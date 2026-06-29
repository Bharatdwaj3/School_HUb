// app/admin/parents/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Search, Trash2, GraduationCap, Plus, X, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

interface Student {
  _id: string;
  userId: { _id: string; fullName: string; userName: string };
}

interface Parent {
  _id: string;
  children?: { _id: string; userId: { _id: string; fullName: string; userName: string } }[];
  userId: { _id: string; fullName: string; userName: string; email: string };
}

function ParentCard({
  parent,
  students,
  onDelete,
  onLinkChild,
  onUnlinkChild,
}: {
  parent: Parent;
  students: Student[];
  onDelete: (userId: string) => void;
  onLinkChild: (parentId: string, studentId: string) => Promise<void>;
  onUnlinkChild: (parentId: string, studentId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [linking, setLinking] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState('');

  const linkedIds = parent.children?.map((c) => c._id) ?? [];
  const availableStudents = students.filter((s) => !linkedIds.includes(s._id));

  const handleLink = async () => {
    if (!selectedStudent) return;
    setLinking(true);
    await onLinkChild(parent._id, selectedStudent);
    setSelectedStudent('');
    setLinking(false);
  };

  const handleUnlink = async (studentId: string) => {
    setUnlinkingId(studentId);
    await onUnlinkChild(parent._id, studentId);
    setUnlinkingId('');
  };

  return (
    <div className="bg-bg-alt border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-black text-primary uppercase tracking-tight text-sm">{parent.userId.fullName}</p>
              <p className="text-[10px] text-text-muted">@{parent.userId.userName}</p>
            </div>
          </div>
          <button onClick={() => onDelete(parent.userId._id)} className="text-text-muted hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
        <p className="text-[10px] text-text-muted mt-2">{parent.userId.email}</p>
      </div>

      <div className="border-t border-border">
        <button onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-primary/5 transition-colors">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
            Children ({parent.children?.length ?? 0})
          </span>
          {open ? <ChevronDown size={12} className="text-text-muted" /> : <ChevronRight size={12} className="text-text-muted" />}
        </button>

        {open && (
          <div className="px-5 pb-4 space-y-2">
            {(parent.children?.length ?? 0) === 0 ? (
              <p className="text-xs text-text-muted py-2">No children linked</p>
            ) : (
              parent.children?.map((child) => (
                <div key={child._id} className="flex items-center justify-between bg-bg border border-border rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={12} className="text-text-muted" />
                    <span className="text-xs font-bold text-primary">{child.userId?.fullName ?? child._id}</span>
                  </div>
                  <button onClick={() => handleUnlink(child._id)}
                    disabled={unlinkingId === child._id}
                    className="text-text-muted hover:text-red-400 transition-colors disabled:opacity-40">
                    {unlinkingId === child._id ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                  </button>
                </div>
              ))
            )}

            {availableStudents.length > 0 && (
              <div className="flex gap-2 mt-2">
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                  className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary">
                  <option value="">Link a child...</option>
                  {availableStudents.map((s) => (
                    <option key={s._id} value={s._id}>{s.userId.fullName}</option>
                  ))}
                </select>
                <button onClick={handleLink} disabled={linking || !selectedStudent}
                  className="flex items-center gap-1 px-3 py-2 bg-primary text-bg rounded-xl text-xs font-black hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {linking ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [parentsData, studentsData] = await Promise.all([
        api.get('/parent/profile'),
        api.get('/student/profile'),
      ]);
      const list = parentsData.parents ?? [];
      setParents(list);
      setFiltered(list);
      setStudents(studentsData.students ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(parents.filter((p) =>
      p.userId.fullName.toLowerCase().includes(q) ||
      p.userId.userName.toLowerCase().includes(q) ||
      p.userId.email.toLowerCase().includes(q)
    ));
  }, [search, parents]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this parent?')) return;
    try {
      await fetch(`/api/parent/profile/${userId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleLinkChild = async (parentId: string, studentId: string) => {
    await fetch('/api/parent/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentId, studentId }),
    });
    await fetchData();
  };

  const handleUnlinkChild = async (parentId: string, studentId: string) => {
    await fetch('/api/parent/children', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentId, studentId }),
    });
    await fetchData();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-cta mb-1">School</p>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Parents</h2>
          <p className="text-text-muted text-sm mt-1">{parents.length} registered</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search parents..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-bg-alt border border-border rounded-xl text-sm text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 w-64" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-bg-alt border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Users size={48} className="text-primary/20" />
          <p className="text-2xl font-black text-primary/20 uppercase">{search ? 'No results' : 'No Parents Yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ParentCard key={p._id} parent={p} students={students}
              onDelete={handleDelete} onLinkChild={handleLinkChild} onUnlinkChild={handleUnlinkChild} />
          ))}
        </div>
      )}
    </div>
  );
}