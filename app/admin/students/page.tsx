// app/admin/students/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { GraduationCap, Loader2, Search, Trash2, BookOpen, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Student {
  _id: string;
  rollNumber?: string;
  section?: string;
  enrollmentHistory?: { _id: string; name: string; code?: string }[];
  userId: { _id: string; fullName: string; userName: string; email: string; avatar?: string };
}

function StudentCard({
  student,
  subjects,
  onDelete,
  onEnroll,
  onUnenroll,
}: {
  student: Student;
  subjects: Subject[];
  onDelete: (userId: string) => void;
  onEnroll: (studentUserId: string, subjectId: string) => Promise<void>;
  onUnenroll: (studentUserId: string, subjectId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [unenrollingId, setUnenrollingId] = useState('');

  const enrolledIds = student.enrollmentHistory?.map((e) => (typeof e === 'string' ? e : e._id)) ?? [];
  const enrolledSubjects = student.enrollmentHistory ?? [];
  const availableSubjects = subjects.filter((s) => !enrolledIds.includes(s._id));

  const handleEnroll = async () => {
    if (!selectedSubject) return;
    setEnrolling(true);
    await onEnroll(student.userId._id, selectedSubject);
    setSelectedSubject('');
    setEnrolling(false);
  };

  const handleUnenroll = async (subjectId: string) => {
    setUnenrollingId(subjectId);
    await onUnenroll(student.userId._id, subjectId);
    setUnenrollingId('');
  };

  return (
    <div className="bg-bg-alt border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-black text-primary uppercase tracking-tight text-sm">{student.userId.fullName}</p>
              <p className="text-[10px] text-text-muted">@{student.userId.userName}</p>
            </div>
          </div>
          <button onClick={() => onDelete(student.userId._id)}
            className="text-text-muted hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
        <p className="text-[10px] text-text-muted mt-2">{student.userId.email}</p>
        {student.rollNumber && <p className="text-[10px] text-text-muted">Roll: {student.rollNumber}</p>}
      </div>

      {/* Subjects accordion */}
      <div className="border-t border-border">
        <button onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-primary/5 transition-colors">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
            Subjects ({enrolledSubjects.length})
          </span>
          {open ? <ChevronDown size={12} className="text-text-muted" /> : <ChevronRight size={12} className="text-text-muted" />}
        </button>

        {open && (
          <div className="px-5 pb-4 space-y-2">
            {enrolledSubjects.length === 0 ? (
              <p className="text-xs text-text-muted py-2">No subjects enrolled</p>
            ) : (
              enrolledSubjects.map((s) => {
                const subjectId = typeof s === 'string' ? s : s._id;
                const subjectName = typeof s === 'string' ? s : s.name;
                return (
                  <div key={subjectId} className="flex items-center justify-between bg-bg border border-border rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <BookOpen size={12} className="text-text-muted" />
                      <span className="text-xs font-bold text-primary">{subjectName}</span>
                    </div>
                    <button onClick={() => handleUnenroll(subjectId)}
                      disabled={unenrollingId === subjectId}
                      className="text-[10px] font-black text-text-muted hover:text-red-400 transition-colors disabled:opacity-40">
                      {unenrollingId === subjectId ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                    </button>
                  </div>
                );
              })
            )}

            {availableSubjects.length > 0 && (
              <div className="flex gap-2 mt-2">
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                  className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary">
                  <option value="">Enroll in subject...</option>
                  {availableSubjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <button onClick={handleEnroll} disabled={enrolling || !selectedSubject}
                  className="flex items-center gap-1 px-3 py-2 bg-primary text-bg rounded-xl text-xs font-black hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {enrolling ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [studentsData, subjectsData] = await Promise.all([
        api.get('/student/profile'),
        api.get('/subject/details'),
      ]);
      const list = studentsData.students ?? [];
      setStudents(list);
      setFiltered(list);
      setSubjects(subjectsData.subjects ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(students.filter((s) =>
      s.userId.fullName.toLowerCase().includes(q) ||
      s.userId.userName.toLowerCase().includes(q) ||
      s.userId.email.toLowerCase().includes(q)
    ));
  }, [search, students]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this student?')) return;
    try {
      await fetch(`/api/student/profile/${userId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEnroll = async (studentUserId: string, subjectId: string) => {
    await fetch('/api/student/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentUserId, subjectId }),
    });
    await fetchData();
  };

  const handleUnenroll = async (studentUserId: string, subjectId: string) => {
    await fetch('/api/student/enroll', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentUserId, subjectId }),
    });
    await fetchData();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-cta mb-1">School</p>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Students</h2>
          <p className="text-text-muted text-sm mt-1">{students.length} enrolled</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search students..." value={search}
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
          <GraduationCap size={48} className="text-primary/20" />
          <p className="text-2xl font-black text-primary/20 uppercase">{search ? 'No results' : 'No Students Yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <StudentCard key={s._id} student={s} subjects={subjects}
              onDelete={handleDelete} onEnroll={handleEnroll} onUnenroll={handleUnenroll} />
          ))}
        </div>
      )}
    </div>
  );
}