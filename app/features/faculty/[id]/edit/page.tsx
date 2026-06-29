// app/features/faculty/[id]/edit/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, X, Save } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import ProtectedRoute from '@/components/ProtectedRoute';

const inputClass =
  'w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors';

export default function EditFacultyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.avatar.user);

  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    department: '',
    designation: '',
    bio: '',
    employeeId: '',
    address: '',
  });
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [qualInput, setQualInput] = useState('');

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/faculty/profile/${id}`);
        const data = await res.json();
        if (res.status === 401) { router.push('/features/auth/login'); return; }
        if (!data.success) return;
        const f = data.faculty;
        setForm({
          department: f.department || '',
          designation: f.designation || '',
          bio: f.bio || '',
          employeeId: f.employeeId || '',
          address: f.location?.address || '',
        });
        setQualifications(f.qualifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  useEffect(() => {
    if (!loading && currentUser && currentUser.id !== id && currentUser.role !== 'admin') {
      router.replace('/unauthorized');
    }
  }, [loading, currentUser, id, router]);

  const addQualification = () => {
    const q = qualInput.trim();
    if (q && !qualifications.includes(q)) {
      setQualifications((prev) => [...prev, q]);
      setQualInput('');
    }
  };

  const removeQualification = (q: string) => {
    setQualifications((prev) => prev.filter((x) => x !== q));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/faculty/profile/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: form.department,
          designation: form.designation,
          bio: form.bio,
          employeeId: form.employeeId,
          qualifications,
          location: { address: form.address },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Update failed');
        return;
      }
      setSuccess('Profile updated successfully');
      setTimeout(() => router.push(`/features/faculty/${id}`), 1000);
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <div className="min-h-screen bg-bg">
        <div className="bg-primary py-12 px-6">
          <div className="max-w-2xl mx-auto relative">
            <Link
              href={`/features/faculty/${id}`}
              className="absolute -top-4 left-0 flex items-center gap-2 text-sm font-black text-white/70 hover:text-white"
            >
              <ArrowLeft size={16} /> Back to Profile
            </Link>
            <p className="text-[9px] font-black uppercase tracking-widest text-accent/60 mb-1 mt-4">Faculty</p>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Edit Profile</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-sm font-bold text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6 text-sm font-bold text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-bg-alt border border-border rounded-2xl p-6 space-y-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Professional Info</p>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={form.department}
                  onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Lecturer"
                  value={form.designation}
                  onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Employee ID</label>
                <input
                  type="text"
                  placeholder="e.g. EMP-001"
                  value={form.employeeId}
                  onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="bg-bg-alt border border-border rounded-2xl p-6 space-y-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">About</p>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Bio</label>
                <textarea
                  placeholder="Write a short bio..."
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Qualifications</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. M.Sc Mathematics"
                    value={qualInput}
                    onChange={(e) => setQualInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addQualification}
                    className="px-4 py-2 bg-primary text-bg rounded-xl font-black text-sm hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {qualifications.map((q) => (
                    <span key={q} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                      {q}
                      <button type="button" onClick={() => removeQualification(q)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-bg-alt border border-border rounded-2xl p-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-5">Location</p>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Block A, Room 12"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-bg py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}