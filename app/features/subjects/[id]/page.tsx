// app/features/subjects/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, BookOpen, ArrowLeft, GraduationCap, Award } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  credits?: number;
  isElective?: boolean;
  schedule?: { day?: string; time?: string };
  teacherId: {
    _id: string;
    fullName: string;
    userName: string;
    avatar?: string;
  };
}

export default function SubjectDetail() {
  const params = useParams();
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch(`/api/subject/details/${params.id}`);
        const data = await res.json();
        if (data.success) setSubject(data.subject);
        else router.push("/features/subjects");
      } catch {
        router.push("/features/subjects");
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [params.id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  if (!subject) return null;

  return (
    <ProtectedRoute allowedRoles={["teacher", "student", "parent"]}>
      <div className="min-h-screen bg-bg">

        <div className="bg-primary py-16 px-6 relative overflow-hidden">
          <span
            className="text-[8rem] font-black text-white/5 uppercase select-none whitespace-nowrap absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ writingMode: 'vertical-rl' }}
          >
            {subject.code}
          </span>

          <div className="max-w-5xl mx-auto relative">
            <Link href="/features/subjects"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white/60 hover:text-white mb-8 transition-colors">
              <ArrowLeft size={14} /> All Subjects
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-accent">{subject.code}</p>
              {subject.isElective && (
                <span className="text-[8px] font-black uppercase tracking-widest bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                  Elective
                </span>
              )}
            </div>

            <h1 className="text-5xl font-black text-white uppercase tracking-tight mb-4">{subject.name}</h1>
            <p className="text-white/60 text-lg max-w-xl leading-relaxed">
              {subject.description || 'No description available.'}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            <div className="bg-bg-alt border border-border rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Award size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Credits</p>
                <p className="text-2xl font-black text-primary">{subject.credits ?? 3}</p>
              </div>
            </div>

            <div className="bg-bg-alt border border-border rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Type</p>
                <p className="text-sm font-black text-primary uppercase tracking-tight">
                  {subject.isElective ? 'Elective' : 'Core Subject'}
                </p>
              </div>
            </div>

            {subject.schedule?.day ? (
              <div className="bg-bg-alt border border-border rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Schedule</p>
                  <p className="text-sm font-black text-primary uppercase tracking-tight">
                    {subject.schedule.day}{subject.schedule.time ? ` · ${subject.schedule.time}` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-bg-alt border border-border rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Code</p>
                  <p className="text-sm font-black text-primary uppercase tracking-tight">{subject.code}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-4">Taught By</p>
            <Link href={`/features/faculty/${subject.teacherId._id}`}
              className="inline-flex items-center gap-4 bg-bg-alt border border-border rounded-2xl px-6 py-5 hover:border-primary/40 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-black text-primary uppercase tracking-tight group-hover:text-cta transition-colors">
                  {subject.teacherId.fullName}
                </p>
                <p className="text-[10px] text-text-muted">@{subject.teacherId.userName}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}