// app/features/faculty/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { UserCard } from "@/components/UserCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchQuery } from "@/store/contentSlice";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Faculty {
  _id: string;
  userId: {
    _id: string;
    userName: string;
    fullName: string;
    avatar?: string;
  };
  subjects?: string[];
  department?: string;
  location?: { address?: string };
}

export default function FacultyPage() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((s) => s.content.searchQuery);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch("/api/faculty/profile");
        const data = await res.json();
        if (data.success) {
          setFaculty(data.faculty || []);
        }
      } catch (err) {
        console.error(err);
        setFaculty([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const filtered = faculty.filter((f) => {
    const name = f.userId?.fullName?.toLowerCase() || "";
    const userName = f.userId?.userName?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || userName.includes(query);
  });

  return (
    <ProtectedRoute allowedRoles={["teacher", "student", "parent"]}>
      <div className="bg-primary min-h-screen py-16 px-6 relative">
        <div className="max-w-6xl mx-auto relative">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-2">
            Our Faculty
          </p>
          <h1 className="text-5xl font-black text-text-inverse uppercase tracking-tight mb-4">
            All Teachers & Staff
          </h1>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 bg-bg-alt border border-border rounded-xl px-4 py-3 mb-10 max-w-md">
            <input
              type="text"
              placeholder="Search teachers..."
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
                No Faculty Found
              </p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((f) => (
                <UserCard
                  key={f._id}
                  user={{ ...f, type: "faculty" as const }}
                  href={`/features/faculty/${f.userId?._id || f._id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
