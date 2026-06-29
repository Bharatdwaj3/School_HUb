// components/UserCard.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Eye, GraduationCap, Users, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BaseUser {
  _id: string;
  userId: {
    _id: string;
    userName: string;
    fullName: string;
    avatar?: string;
  };
  location?: { address?: string };
}

interface StudentUser extends BaseUser {
  type: 'student';
  class?: string;
  section?: string;
  rollNumber?: string;
}

interface ParentUser extends BaseUser {
  type: 'parent';
  children?: string[];
}

interface FacultyUser extends BaseUser {
  type: 'faculty';
  department?: string;
  subjects?: string[] | { _id: string; name: string }[];
}

type UserCardProps = {
  user: StudentUser | ParentUser | FacultyUser;
  href: string;
};

function AvatarFallback({ type }: { type: 'student' | 'parent' | 'faculty' }) {
  if (type === 'student') return <GraduationCap size={48} className="text-primary/20" />;
  if (type === 'parent') return <Users size={48} className="text-primary/20" />;
  return <BookOpen size={48} className="text-primary/20" />;
}

function CardMeta({ user }: { user: StudentUser | ParentUser | FacultyUser }) {
  if (user.type === 'student') {
    return (
      <>
        {(user.class || user.section) && (
          <p className="text-[10px] text-text-muted mb-1">
            Class {user.class}{user.section}
          </p>
        )}
        {user.rollNumber && (
          <p className="text-[10px] text-text-muted">Roll No: {user.rollNumber}</p>
        )}
      </>
    );
  }

  if (user.type === 'parent') {
    return (
      <>
        {user.children && user.children.length > 0 && (
          <p className="text-sm text-primary/80 mb-2">
            {user.children.length} {user.children.length === 1 ? 'Child' : 'Children'}
          </p>
        )}
      </>
    );
  }

  // faculty
  return (
    <>
      {user.department && (
        <p className="text-sm text-primary/80 mb-2">{user.department}</p>
      )}
      {user.subjects && user.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {
            user.subjects.slice(0, 2).map((sub, i) => 
              { const name = typeof sub === 'string' ? sub : sub.name; 
              return (
                <span key={i} className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  {name}  
                </span>
              )})
          }
        </div>
      )}
    </>
  );
}

export function UserCard({ user, href }: UserCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const name = user.userId?.fullName || 'Unknown User';
  const userName = user.userId?.userName || '';
  const avatar = user.userId?.avatar || '';
  const location = user.location?.address || '';

  return (
    <Link href={href}>
      <motion.div
        className="bg-bg-alt border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
      >
        <div className="relative h-48 bg-bg overflow-hidden">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <AvatarFallback type={user.type} />
            </div>
          )}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 right-3"
              >
                <div className="bg-bg-alt/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                  <Eye size={14} className="text-primary" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5">
          <p className="text-[9px] font-black uppercase tracking-widest text-cta mb-1">@{userName}</p>
          <h3 className="text-lg font-black text-primary uppercase tracking-tight mb-2 line-clamp-1">{name}</h3>

          <CardMeta user={user} />

          {location && (
            <div className="flex items-center gap-1 text-[10px] text-text-muted mt-2">
              <MapPin size={11} /> {location}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export type { StudentUser, ParentUser, FacultyUser };