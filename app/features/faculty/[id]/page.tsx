// app/features/faculty/[id]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Loader2, LogOut, Edit, GraduationCap,
  BookOpen, CheckCircle, XCircle, Clock, Plus, Save, ChevronDown, ChevronRight
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser } from '@/store/avatarSlice';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Subject {
  _id: string;
  name: string;
  description: string;
  credits?: number;
  isElective?: boolean;
  img?: string;
}

interface FacultyProfile {
  _id: string;
  bio?: string;
  qualifications?: string[];
  department?: string;
  subjects?: Subject[];
  mediaUrl?: string;
  employeeId?: string;
  userId: {
    _id: string;
    userName: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

interface AttendanceRecord {
  studentId: { _id: string; userName: string; fullName: string };
  status: 'present' | 'absent' | 'late';
}

interface AttendanceSheet {
  _id: string;
  date: string;
  records: AttendanceRecord[];
}

interface MarksEntry {
  _id: string;
  studentId: { _id: string; userName: string; fullName: string };
  examType: 'midterm' | 'final' | 'quiz' | 'assignment';
  marks: number;
  totalMarks: number;
  remarks?: string;
}

const EXAM_TYPES = ['midterm', 'final', 'quiz', 'assignment'] as const;

const statusIcon = (status: string) => {
  if (status === 'present') return <CheckCircle size={16} className="text-green-400" />;
  if (status === 'absent') return <XCircle size={16} className="text-red-400" />;
  return <Clock size={16} className="text-yellow-400" />;
};

function SubjectAttendance({ subject }: { subject: Subject }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [records, setRecords] = useState<{ studentId: string; fullName: string; status: 'present' | 'absent' | 'late' }[]>([]);

  const fetchAttendance = async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/faculty/attendance?subjectId=${subject._id}&date=${d}`);
      const data = await res.json();
      if (data.success && data.attendance?.length > 0) {
        const sheet: AttendanceSheet = data.attendance[0];
        setRecords(sheet.records.map((r) => ({
          studentId: r.studentId._id,
          fullName: r.studentId.fullName,
          status: r.status,
        })));
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(date); }, [subject._id, date]);

  const toggleStatus = (idx: number) => {
    setRecords((prev) => {
      const next = [...prev];
      const cycle: ('present' | 'absent' | 'late')[] = ['present', 'absent', 'late'];
      const cur = cycle.indexOf(next[idx].status);
      next[idx] = { ...next[idx], status: cycle[(cur + 1) % 3] };
      return next;
    });
  };

  const saveAttendance = async () => {
    if (!records.length) return;
    setSaving(true);
    setSavedMsg('');
    try {
      const res = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subject._id,
          date,
          records: records.map((r) => ({ studentId: r.studentId, status: r.status })),
        }),
      });
      const data = await res.json();
      if (data.success) { setSavedMsg('Saved'); setTimeout(() => setSavedMsg(''), 2000); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Attendance</p>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent" />
        {savedMsg && <span className="text-xs font-black text-green-400">{savedMsg}</span>}
      </div>
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-white/30" /></div>
      ) : records.length === 0 ? (
        <p className="text-sm text-white/40 mb-3">No students enrolled yet.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {records.map((r, i) => (
            <div key={r.studentId} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <p className="text-sm font-black text-white">{r.fullName}</p>
              <button onClick={() => toggleStatus(i)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-black uppercase tracking-widest">
                {statusIcon(r.status)}
                <span className={r.status === 'present' ? 'text-green-400' : r.status === 'absent' ? 'text-red-400' : 'text-yellow-400'}>{r.status}</span>
              </button>
            </div>
          ))}
        </div>
      )}
      {records.length > 0 && (
        <button onClick={saveAttendance} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Attendance
        </button>
      )}
    </div>
  );
}

// ── Marks Section ───────────────────────────────────────────────────────────
function SubjectMarks({ subject }: { subject: Subject }) {
  const [marks, setMarks] = useState<MarksEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState<typeof EXAM_TYPES[number]>('midterm');
  const [form, setForm] = useState({ studentId: '', marks: '', totalMarks: '100', remarks: '' });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/faculty/marks?subjectId=${subject._id}`);
      const data = await res.json();
      if (data.success) setMarks(data.marks);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchMarks(); }, [subject._id]);

  const saveMarks = async () => {
    setError('');
    if (!form.studentId || !form.marks || !form.totalMarks) { setError('Student ID, marks, and total marks are required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/faculty/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subject._id, studentId: form.studentId, examType,
          marks: Number(form.marks), totalMarks: Number(form.totalMarks), remarks: form.remarks,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSavedMsg('Saved'); setTimeout(() => setSavedMsg(''), 2000);
      setForm({ studentId: '', marks: '', totalMarks: '100', remarks: '' });
      fetchMarks();
    } catch (err) { console.error(err); setError('Network error'); } finally { setSaving(false); }
  };

  const grouped = EXAM_TYPES.reduce((acc, et) => {
    acc[et] = marks.filter((m) => m.examType === et);
    return acc;
  }, {} as Record<string, MarksEntry[]>);

  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Marks</p>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
        <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-4">Enter Marks</p>
        {error && <p className="text-xs text-red-400 font-bold mb-3">{error}</p>}
        {savedMsg && <p className="text-xs text-green-400 font-bold mb-3">{savedMsg}</p>}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">Student ID</label>
            <input type="text" placeholder="MongoDB _id" value={form.studentId}
              onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">Exam Type</label>
            <select value={examType} onChange={(e) => setExamType(e.target.value as typeof EXAM_TYPES[number])}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
              {EXAM_TYPES.map((et) => <option key={et} value={et} className="bg-bg text-primary">{et}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">Marks</label>
            <input type="number" placeholder="e.g. 85" value={form.marks}
              onChange={(e) => setForm((p) => ({ ...p, marks: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">Total Marks</label>
            <input type="number" placeholder="e.g. 100" value={form.totalMarks}
              onChange={(e) => setForm((p) => ({ ...p, totalMarks: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent" />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">Remarks (optional)</label>
          <input type="text" placeholder="e.g. Good performance" value={form.remarks}
            onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent" />
        </div>
        <button onClick={saveMarks} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save Marks
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-white/30" /></div>
      ) : marks.length === 0 ? (
        <p className="text-sm text-white/40">No marks entered yet.</p>
      ) : (
        <div className="space-y-4">
          {EXAM_TYPES.filter((et) => grouped[et].length > 0).map((et) => (
            <div key={et}>
              <p className="text-[9px] font-black uppercase tracking-widest text-accent/60 mb-2">{et}</p>
              <div className="space-y-2">
                {grouped[et].map((m) => (
                  <div key={m._id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-sm font-black text-white">{m.studentId.fullName}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-accent">{m.marks}</span>
                      <span className="text-white/40 text-sm">/ {m.totalMarks}</span>
                      {m.remarks && <span className="text-[10px] text-white/30">{m.remarks}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectAccordion({ subject }: { subject: Subject }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen size={16} className="text-accent" />
          <span className="font-black text-white uppercase tracking-tight">{subject.name}</span>
          {subject.credits && <span className="text-[10px] text-white/40">{subject.credits} Credits</span>}
          {subject.isElective && (
            <span className="text-[8px] font-black uppercase tracking-widest bg-accent/20 text-accent px-2 py-0.5 rounded-full">Elective</span>
          )}
        </div>
        {open ? <ChevronDown size={16} className="text-white/40" /> : <ChevronRight size={16} className="text-white/40" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-8 border-t border-white/10 pt-6">
          <SubjectAttendance subject={subject} />
          <div className="border-t border-white/10 pt-6">
            <SubjectMarks subject={subject} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacultyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.avatar.user);

  const [id, setId] = useState('');
  const [faculty, setFaculty] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects'>('overview');

  const isOwner = currentUser?.id?.toString() === id;

  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    const loadFaculty = async () => {
      try {
        const res = await fetch(`/api/faculty/profile/${id}`);
        const data = await res.json();
        if (res.status === 401) { router.push('/features/auth/login'); return; }
        if (res.status === 403) { router.push('/unauthorized'); return; }
        if (!data.success) { setFaculty(null); return; }
        setFaculty(data.faculty);
      } catch (err) { console.error(err); setFaculty(null); } finally { setLoading(false); }
    };
    loadFaculty();
  }, [id, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(clearUser());
      router.push('/features/auth/login');
    } catch (err) { console.error(err); } finally { setLoggingOut(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  if (!faculty) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="text-2xl font-black">Faculty not found</p>
      <Link href="/features/faculty" className="mt-4 text-primary hover:underline">← Back to Faculty</Link>
    </div>
  );

  const { userId, department, bio, qualifications, mediaUrl } = faculty;
  const fullName = userId.fullName;
  const userName = userId.userName;
  const avatar = userId.avatar || mediaUrl;
  const subjects = faculty.subjects ?? [];

  return (
    <ProtectedRoute allowedRoles={['teacher', 'student', 'parent']}>
      <div className="bg-primary min-h-screen">

        <div className="py-16 px-6 relative">
          <Link href="/features/faculty" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-black text-white/70 hover:text-white">
            <ArrowLeft size={16} /> All Faculty
          </Link>
          {isOwner && (
            <button onClick={handleLogout} disabled={loggingOut} className="absolute top-6 right-6 flex items-center gap-2 px-5 py-2 text-sm font-black border border-white/30 rounded-xl hover:bg-white/10 text-white">
              {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} Sign Out
            </button>
          )}
          <div className="max-w-6xl mx-auto">
            <p className="text-accent text-sm font-black tracking-widest">FACULTY PROFILE</p>
            <h1 className="text-5xl font-black text-white mt-2">{fullName}</h1>
            {department && <p className="text-2xl text-accent mt-1">{department}</p>}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-16 space-y-12">

          <div className="flex gap-8">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl shrink-0">
              {avatar ? (
                <Image src={avatar} alt={fullName} width={128} height={128} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <GraduationCap size={48} className="text-white/30" />
                </div>
              )}
            </div>
            <div>
              <p className="text-accent font-black">@{userName}</p>
              <p className="text-white/80">{userId.email}</p>
              {isOwner && (
                <Link href={`/features/faculty/${id}/edit`} className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-black text-sm hover:bg-white/90">
                  <Edit size={16} /> Edit Profile
                </Link>
              )}
            </div>
          </div>

          <section>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-4">About</p>
            <p className="text-lg text-white/90 leading-relaxed">{bio || 'No biography available.'}</p>
            {(qualifications ?? []).length > 0 && (
              <div className="mt-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Qualifications</p>
                <div className="flex flex-wrap gap-3">
                  {(qualifications ?? []).map((q, i) => (
                    <span key={i} className="px-5 py-2 bg-white/10 text-white rounded-full text-sm">{q}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {subjects.length > 0 && (
            <section>
              <div className="flex gap-8 border-b border-white/20 mb-8">
                {(['overview', 'subjects'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`pb-4 font-black uppercase tracking-widest text-sm transition-all border-b-2 ${
                      activeTab === tab ? 'border-accent text-white' : 'border-transparent text-white/50 hover:text-white'
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <Link key={subject._id} href={`/features/subjects/${subject._id}`}
                      className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-accent/40 hover:bg-white/10 transition-all group">
                      <h3 className="font-black text-white uppercase tracking-tight text-sm line-clamp-1 group-hover:text-accent transition-colors">{subject.name}</h3>
                      {subject.credits && <p className="text-[10px] text-white/40 mt-1">{subject.credits} Credits</p>}
                      {subject.isElective && (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-accent/20 text-accent px-2 py-0.5 rounded-full mt-2 inline-block">Elective</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {activeTab === 'subjects' && (
                isOwner ? (
                  <div className="space-y-3">
                    {subjects.map((subject) => (
                      <SubjectAccordion key={subject._id} subject={subject} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <BookOpen size={40} className="text-white/20" />
                    <p className="text-white/40 font-black uppercase tracking-widest text-sm">Only visible to the teacher</p>
                  </div>
                )
              )}
            </section>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}