import type { ReactNode } from 'react';

interface SectionProps {
  children:  ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Section({ children, className = '', noPadding = false }: SectionProps) {
  return (
    <section
      className={`
        w-full
        max-w-7xl
        mx-auto
        px-6
        ${noPadding ? '' : 'py-16'}
        ${className}
      `.trim()}
    >
      {children}
    </section>
  );
}