// app/features/parents/page.tsx
"use client";
import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { UserCard } from "@/components/UserCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchQuery } from "@/store/contentSlice";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Parent {
  _id: string;
  userId: {
    _id: string;
    userName: string;
    fullName: string;
    avatar?: string;
  };
  children?: string[];
  location?: { address?: string };
}

export default function ParentsPage() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((s) => s.content.searchQuery);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await fetch("/api/parent/profile");
        const data = await res.json();
        if (data.success) {
          setParents(data.parents || []);
        }
      } catch (err) {
        console.error(err);
        setParents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchParents();
  }, []);

  const filtered = parents.filter((p) => {
    const name = p.userId?.fullName?.toLowerCase() || "";
    const userName = p.userId?.userName?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || userName.includes(query);
  });

  return (
    <ProtectedRoute allowedRoles={["teacher", "parent"]}>
      <div className="bg-primary py-16 px-6 relative">
        <div className="max-w-6xl mx-auto relative">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-2">
            Our Community
          </p>
          <h1 className="text-5xl font-black text-text-inverse uppercase tracking-tight mb-4">
            All Parents
          </h1>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 bg-bg-alt border border-border rounded-xl px-4 py-3 mb-10 max-w-md">
            <input
              type="text"
              placeholder="Search parents..."
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
                No Parents Found
              </p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <UserCard
                  key={p._id}
                  user={{ ...p, type: "parent" as const }}
                  href={`/features/parents/${p.userId?._id || p._id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
