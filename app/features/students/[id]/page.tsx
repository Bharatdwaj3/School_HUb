// features/students/[id]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, LogOut, GraduationCap, BookOpen, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser } from '@/store/avatarSlice';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Subject {
  _id: string;
  name: string;
  credits?: number;
  isElective?: boolean;
}

interface StudentProfile {
  _id: string;
  rollNumber?: string;
  class?: string;
  section?: string;
  enrollmentHistory?: Subject[];
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
  studentId: { _id: string };
  status: 'present' | 'absent' | 'late';
}

interface MarksEntry {
  _id: string;
  examType: string;
  marks: number;
  totalMarks: number;
  remarks?: string;
}

const statusIcon = (status: string) => {
  if (status === 'present') return <CheckCircle size={14} className="text-green-400" />;
  if (status === 'absent') return <XCircle size={14} className="text-red-400" />;
  return <Clock size={14} className="text-yellow-400" />;
};

function SubjectResults({ subject, studentUserId }: { subject: Subject; studentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [attendance, setAttendance] = useState<{ date: string; status: string }[]>([]);
  const [marks, setMarks] = useState<MarksEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, marksRes] = await Promise.all([
        fetch(`/api/faculty/attendance?subjectId=${subject._id}`),
        fetch(`/api/faculty/marks?subjectId=${subject._id}&studentId=${studentUserId}`),
      ]);
      const attData = await attRes.json();
      const marksData = await marksRes.json();

      if (attData.success) {
        const myRecords = attData.attendance.flatMap((sheet: { date: string; records: AttendanceRecord[] }) =>
          sheet.records
            .filter((r) => r.studentId._id === studentUserId)
            .map((r) => ({ date: new Date(sheet.date).toLocaleDateString(), status: r.status }))
        );
        setAttendance(myRecords);
      }
      if (marksData.success) setMarks(marksData.marks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!open) fetchData();
    setOpen((p) => !p);
  };

  const present = attendance.filter((a) => a.status === 'present').length;
  const pct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : null;

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button onClick={handleOpen} className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <BookOpen size={15} className="text-accent" />
          <span className="font-black text-white uppercase tracking-tight text-sm">{subject.name}</span>
          {subject.credits && <span className="text-[10px] text-white/40">{subject.credits} Credits</span>}
          {subject.isElective && <span className="text-[8px] font-black uppercase tracking-widest bg-accent/20 text-accent px-2 py-0.5 rounded-full">Elective</span>}
        </div>
        <div className="flex items-center gap-3">
          {pct !== null && (
            <span className={`text-xs font-black ${pct >= 75 ? 'text-green-400' : 'text-red-400'}`}>{pct}% Attendance</span>
          )}
          {open ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10 px-6 py-5 space-y-6">
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-white/30" /></div>
          ) : (
            <>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Attendance</p>
                {attendance.length === 0 ? (
                  <p className="text-sm text-white/40">No attendance records yet.</p>
                ) : (
                  <div className="space-y-2">
                    {attendance.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                        <span className="text-sm text-white/70">{a.date}</span>
                        <div className="flex items-center gap-2">
                          {statusIcon(a.status)}
                          <span className={`text-xs font-black uppercase ${a.status === 'present' ? 'text-green-400' : a.status === 'absent' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {a.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Marks</p>
                {marks.length === 0 ? (
                  <p className="text-sm text-white/40">No marks entered yet.</p>
                ) : (
                  <div className="space-y-2">
                    {marks.map((m) => (
                      <div key={m._id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <span className="text-xs font-black uppercase tracking-widest text-white/60">{m.examType}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-accent">{m.marks}</span>
                          <span className="text-white/40 text-sm">/ {m.totalMarks}</span>
                          {m.remarks && <span className="text-[10px] text-white/30">{m.remarks}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.avatar.user);

  const [id, setId] = useState('');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects'>('overview');

  const isOwner = currentUser?.id?.toString() === id;

  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    const loadStudent = async () => {
      try {
        const res = await fetch(`/api/student/profile/${id}`);
        const data = await res.json();
        if (res.status === 401) { router.push('/features/auth/login'); return; }
        if (res.status === 403) { router.push('/unauthorized'); return; }
        if (!data.success || !data.student) { setStudent(null); return; }
        setStudent(data.student);
      } catch (err) {
        console.error(err);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };
    loadStudent();
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
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  if (!student) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-text-inverse">
      <p className="text-3xl font-black mb-4">Student not found</p>
      <Link href="/features/students" className="flex items-center gap-2 text-accent hover:underline">
        <ArrowLeft size={18} /> Back to All Students
      </Link>
    </div>
  );

  const { userId, rollNumber, class: studentClass, section } = student;
  const fullName = userId.fullName;
  const userName = userId.userName;
  const avatar = userId.avatar;
  const subjects = student.enrollmentHistory ?? [];

  return (
    <ProtectedRoute allowedRoles={['teacher', 'student', 'parent']}>
      <div className="bg-primary min-h-screen">

        <div className="py-16 px-6 relative overflow-hidden">
          <span className="text-[8rem] font-black text-text-inverse/10 uppercase select-none whitespace-nowrap absolute right-8 top-1/2 -translate-y-1/2"
            style={{ writingMode: 'vertical-rl' }}>{userName}</span>
          <Link href="/features/students" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-inverse/70 hover:text-white">
            <ArrowLeft size={16} /> All Students
          </Link>
          {isOwner && (
            <button onClick={handleLogout} disabled={loggingOut}
              className="absolute top-6 right-6 flex items-center gap-2 px-5 py-2 text-sm font-black uppercase tracking-widest border border-white/30 rounded-xl hover:bg-white/10 text-white disabled:opacity-50">
              {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} Sign Out
            </button>
          )}
          <div className="max-w-6xl mx-auto relative">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-2">STUDENT PROFILE</p>
            <h1 className="text-5xl font-black text-white uppercase tracking-tight">{fullName}</h1>
            {studentClass && (
              <p className="text-xl text-accent/80 mt-1 font-black uppercase tracking-widest">Class {studentClass}{section}</p>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-16 space-y-12">

          <div className="flex flex-col md:flex-row gap-8">
            <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shrink-0">
              {avatar ? (
                <Image src={avatar} alt={fullName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <GraduationCap size={48} className="text-white/30" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-widest text-accent">@{userName}</p>
              <p className="text-white/80 mt-1">{userId.email}</p>
              {rollNumber && <p className="text-white/60 text-sm mt-1">Roll No: <span className="text-white font-black">{rollNumber}</span></p>}
            </div>
          </div>

          <section>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-6">About</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: fullName },
                { label: 'Username', value: `@${userName}` },
                { label: 'Email', value: userId.email },
                { label: 'Class', value: studentClass ? `${studentClass}${section ?? ''}` : '—' },
                { label: 'Roll Number', value: rollNumber ?? '—' },
                { label: 'Role', value: userId.role },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent/70 mb-1">{label}</p>
                  <p className="text-white font-black">{value}</p>
                </div>
              ))}
            </div>
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
                      <BookOpen size={18} className="text-accent/60 mb-3" />
                      <h3 className="font-black text-white uppercase tracking-tight text-sm line-clamp-1 group-hover:text-accent transition-colors">{subject.name}</h3>
                      {subject.credits && <p className="text-[10px] text-white/40 mt-1">{subject.credits} Credits</p>}
                      {subject.isElective && <span className="text-[8px] font-black uppercase tracking-widest bg-accent/20 text-accent px-2 py-0.5 rounded-full mt-2 inline-block">Elective</span>}
                    </Link>
                  ))}
                </div>
              )}

              {activeTab === 'subjects' && (
                isOwner ? (
                  <div className="space-y-3">
                    {subjects.map((subject) => (
                      <SubjectResults key={subject._id} subject={subject} studentUserId={id} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <BookOpen size={40} className="text-white/20" />
                    <p className="text-white/40 font-black uppercase tracking-widest text-sm">Only visible to the student</p>
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