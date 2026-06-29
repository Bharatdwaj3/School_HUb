// components/EmptyState.tsx
import Link from "next/link";
import { Users, BookOpen, Calendar, School } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onSecondary?: () => void;
  secondaryLabel?: string;
  icon?: React.ReactNode; // Allow custom icon override
}

export const EmptyState = ({
  title = "No Records Found",
  message = "We couldn't find any matching records. Try adjusting your filters or check back later.",
  ctaLabel = "Go to Dashboard",
  ctaHref = "/",
  onSecondary,
  secondaryLabel = "Clear Filters",
  icon,
}: EmptyStateProps) => (
  <div className="text-center py-24 px-6">
    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg border border-border flex items-center justify-center">
      {icon || <Users className="w-10 h-10 text-text-muted" />}
    </div>

    <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-2">
      {title}
    </h2>

    <p className="text-text-muted max-w-md mx-auto mb-8">
      {message}
    </p>

    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-2 bg-primary text-accent text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
      >
        {ctaLabel} →
      </Link>

      {onSecondary && (
        <button
          onClick={onSecondary}
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors border border-border px-6 py-3 rounded-xl hover:border-primary/40"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  </div>
);