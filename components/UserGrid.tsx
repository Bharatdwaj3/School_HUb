// AFTER
// components/UserGrid.tsx
'use client';
import { UserCard, type StudentUser, type ParentUser, type FacultyUser } from './UserCard';

type GridUser = StudentUser | ParentUser | FacultyUser;

interface UserGridProps {
  users: GridUser[];
  hrefBuilder: (user: GridUser) => string;
  emptyMessage?: string;
}

export const UserGrid = ({ users, hrefBuilder, emptyMessage = 'No Results Found' }: UserGridProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl font-black text-primary/20 uppercase mb-2">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {users.map((user) => (
        <UserCard
          key={user._id}
          user={user}
          href={hrefBuilder(user)}
        />
      ))}
    </div>
  );
};