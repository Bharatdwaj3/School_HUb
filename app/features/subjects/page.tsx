// app/features/subjects/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Loader2, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Subject {
  _id: string;
  name: string;
  description: string;
  credits?: number;
  teacherId: { fullName: string };
  img?: string;
  isElective?: boolean;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await api.get("/subject/details");
        if (data.success) {
          setSubjects(data.subjects || []);
        }
      } catch (err) {
        console.error("Error fetching subjects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["teacher", "student", "parent"]}>
      <div className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cta mb-2">
              Curriculum
            </p>
            <h1 className="text-4xl font-black text-primary uppercase tracking-tight">
              All Subjects
            </h1>
          </div>
          {subjects.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl font-black text-primary/20 uppercase">
                No Subjects Found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Link
                  key={subject._id}
                  href={`/features/subjects/${subject._id}`}
                >
                  <div className="bg-bg-alt border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 group">
                    <div className="relative h-48 bg-bg overflow-hidden">
                      {subject.img ? (
                        <Image
                          src={subject.img}
                          alt={subject.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={48} className="text-primary/20" />
                        </div>
                      )}
                      {subject.isElective && (
                        <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest bg-primary text-accent px-2 py-1 rounded-full">
                          Elective
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-black text-primary uppercase tracking-tight mb-1 line-clamp-1">
                        {subject.name}
                      </h3>
                      <p className="text-[10px] text-text-muted mb-2">
                        by {subject.teacherId.fullName}
                      </p>
                      {subject.credits && (
                        <p className="text-[10px] text-text-muted">
                          {subject.credits} Credits
                        </p>
                      )}
                      <p className="text-sm text-primary/70 leading-relaxed mt-2 line-clamp-2">
                        {subject.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
