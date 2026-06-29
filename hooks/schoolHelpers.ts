// hooks/schoolHelpers.ts
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: diffDays > 365 ? 'numeric' : undefined,
  });
};

export const formatFee = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatAttendance = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

export const attendanceLabel = (percentage: number): string => {
  if (percentage >= 95) return 'Excellent';
  if (percentage >= 90) return 'Very Good';
  if (percentage >= 85) return 'Good';
  if (percentage >= 75) return 'Average';
  if (percentage >= 60) return 'Needs Improvement';
  return 'Poor';
};

export const gradeLabel = (grade: string): string => {
  const labels: Record<string, string> = {
    'A+': 'Outstanding',
    'A': 'Excellent',
    'B+': 'Very Good',
    'B': 'Good',
    'C': 'Satisfactory',
    'D': 'Needs Improvement',
    'F': 'Fail',
  };
  return labels[grade] || grade;
};

export const parseRating = (rating: number) => ({
  filled: Math.round(rating),
  empty: 5 - Math.round(rating),
});

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const isRecent = (dateString: string, days = 7): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= days;
};