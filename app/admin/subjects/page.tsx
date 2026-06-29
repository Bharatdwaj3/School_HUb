// app/admin/subjects/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, BookOpen, Loader2, X, Trash2, GraduationCap } from 'lucide-react';

interface Subject {
  _id: string;
  name: string;
  code: string;
  credits?: number;
  isElective?: boolean;
  teacherId: { _id: string; fullName: string; userName: string } | null;
}

interface FacultyOption {
  _id: string;
  userId: { _id: string; fullName: string; userName: string };
}

interface Student {
  _id: string;
  userId: { _id: string; fullName: string; userName: string };
  enrollmentHistory?: { _id: string }[];
}

const inputClass =
  'w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<FacultyOption[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '', code: '', description: '', credits: '3', teacherId: '', isElective: false,
  });

  const fetchData = async () => {
    try {
      const [subjectsData, facultyData, studentsData] = await Promise.all([
        api.get('/subject/details'),
        api.get('/faculty/profile'),
        api.get('/student/profile'),
      ]);
      setSubjects(subjectsData.subjects || []);
      setFaculty(facultyData.faculty || []);
      setStudents(studentsData.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      const res = await fetch('/api/subject/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, code: form.code, description: form.description,
          credits: Number(form.credits), teacherId: form.teacherId, isElective: form.isElective,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSuccess('Subject created');
      setForm({ name: '', code: '', description: '', credits: '3', teacherId: '', isElective: false });
      setShowForm(false);
      fetchData();
    } catch { setError('Network error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try {
      const res = await fetch(`/api/subject/details/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (err) { console.error(err); }
  };

  const getEnrolledStudents = (subjectId: string) =>
    students.filter((s) =>
      s.enrollmentHistory?.some((e) => (typeof e === 'string' ? e === subjectId : e._id === subjectId))
    );

  return (
    <div className="p-8">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-cta mb-1">Curriculum</p>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Subjects</h2>
          <p className="text-text-muted text-sm mt-1">{subjects.length} subjects</p>
        </div>
        <button onClick={() => { setShowForm((p) => !p); setError(''); setSuccess(''); }}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-bg rounded-xl text-sm font-black uppercase tracking-wide hover:bg-primary/90 transition-colors">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Subject'}
        </button>
      </div>

      {showForm && (
        <div className="bg-bg-alt border border-border rounded-2xl p-6 mb-8">
          <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-5">Create Subject</p>
          {error && <p className="text-sm font-bold text-red-400 mb-4">{error}</p>}
          {success && <p className="text-sm font-bold text-green-400 mb-4">{success}</p>}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Subject Name *</label>
              <input type="text" placeholder="e.g. Mathematics" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Subject Code *</label>
              <input type="text" placeholder="e.g. MATH101" value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} className={inputClass} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Description</label>
              <textarea placeholder="Brief description..." value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Credits</label>
              <input type="number" min="1" value={form.credits}
                onChange={(e) => setForm((p) => ({ ...p, credits: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Assign Teacher *</label>
              <select value={form.teacherId} onChange={(e) => setForm((p) => ({ ...p, teacherId: e.target.value }))}
                className={inputClass} required>
                <option value="">Select a teacher</option>
                {faculty.map((f) => (
                  <option key={f._id} value={f.userId._id}>{f.userId.fullName} (@{f.userId.userName})</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="isElective" checked={form.isElective}
                onChange={(e) => setForm((p) => ({ ...p, isElective: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <label htmlFor="isElective" className="text-sm font-bold text-text-muted">Mark as Elective</label>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-bg rounded-xl text-sm font-black uppercase tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><Plus size={14} /> Create Subject</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-bg-alt border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <BookOpen size={48} className="text-primary/20" />
          <p className="text-2xl font-black text-primary/20 uppercase">No Subjects Yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => {
            const enrolled = getEnrolledStudents(s._id);
            return (
              <div key={s._id} className="bg-bg-alt border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-cta mb-0.5">{s.code}</p>
                      <h3 className="font-black text-primary uppercase tracking-tight">{s.name}</h3>
                    </div>
                    {s.isElective && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">Elective</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">{s.credits} Credits · {s.teacherId?.fullName ?? 'Unassigned'}</p>
                </div>

                {/* Enrolled students — read only */}
                <div className="p-5 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3">
                    Students ({enrolled.length})
                  </p>
                  {enrolled.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-4 gap-2">
                      <GraduationCap size={24} className="text-primary/20" />
                      <p className="text-xs text-text-muted">No students enrolled</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {enrolled.map((st) => (
                        <div key={st._id} className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2">
                          <GraduationCap size={12} className="text-text-muted shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-primary">{st.userId.fullName}</p>
                            <p className="text-[9px] text-text-muted">@{st.userId.userName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border">
                  <button onClick={() => handleDelete(s._id)}
                    className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-text-muted hover:text-red-400 transition-colors">
                    <Trash2 size={12} /> Delete Subject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}