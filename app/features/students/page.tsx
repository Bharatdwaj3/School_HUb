// app/features/students/page.tsx
'use client';
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchQuery } from "@/store/contentSlice";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserCard } from "@/components/UserCard";
import { Loader2 } from "lucide-react";

interface Student {
  _id: string;
  userId: {
    _id: string;
    userName: string;
    fullName: string;
    avatar: string;
  };
  class?: string;
  section?: string;
  rollNumber?: string;
  attendance?: number;
}



export default function StudentsPage() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((s) => s.content.searchQuery);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/student/profile');
        const data = await res.json();
        if (data.success) setStudents(data.students || []);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    const name = s.userId?.fullName?.toLowerCase() || '';
    const userName = s.userId?.userName?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || userName.includes(query);
  });

  return (
     <ProtectedRoute allowedRoles={['teacher', 'student', 'parent']}>
    <div className="bg-primary min-h-screen py-16 px-6 relative">
      <div className="max-w-6xl mx-auto relative">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-2">Our Students</p>
        <h1 className="text-5xl font-black text-text-inverse uppercase tracking-tight mb-4">All Students</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 bg-bg-alt border border-border rounded-xl px-4 py-3 mb-10 max-w-md">
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="bg-transparent text-sm text-primary placeholder:text-text-muted focus:outline-none flex-1"
          />
        </div>

        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl font-black text-primary/20 uppercase">
              {searchQuery ? 'No Students Found' : 'No Students Yet'}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {filtered.map((s) => (
    <UserCard
      key={s._id}
      user={{ ...s, type: 'student' as const }}
      href={`/features/students/${s.userId?._id || s._id}`}
    />
  ))}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
