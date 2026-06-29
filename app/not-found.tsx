// app/not-found.tsx
import Link from 'next/link';
import { School, Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex">
      <div className="hidden lg:flex w-[45%] bg-primary flex-col justify-between px-16 py-14 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.75 bg-accent" />
        <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center overflow-hidden pointer-events-none">
          <span className="text-[8rem] font-black text-text-inverse/4 uppercase select-none whitespace-nowrap" style={{ writingMode: 'vertical-rl', letterSpacing: '-0.05em' }}>404</span>
        </div>
        <div className="flex items-center gap-2">
          <School className="w-5 h-5 text-accent" />
          <span className="text-text-inverse font-black text-xl uppercase italic tracking-tight">SchoolHub</span>
        </div>
        <div>
          <div className="w-12 h-0.5 mb-6" style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)' }} />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/50 mb-4">Error 404</p>
          <h1 className="text-6xl font-black text-text-inverse uppercase leading-none tracking-tight mb-4">Page<br />Not<br />Found</h1>
          <p className="text-sm text-text-inverse/40 leading-relaxed max-w-xs">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        </div>
        <div className="flex gap-8">
          {[['404', 'Error Code'], ['🗺️', 'Not Found'], ['←', 'Go Back']].map(([num, label]) => (
            <div key={label}>
              <p className="text-xl font-black text-accent">{num}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-text-inverse/30">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-8">
          <Compass className="w-8 h-8 text-primary/40" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cta mb-3">Not Found</p>
        <h2 className="text-3xl font-black text-primary uppercase tracking-tight mb-2">Lost in SchoolHub</h2>
        <div className="w-12 h-0.5 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }} />
        <p className="text-sm text-text-muted leading-relaxed max-w-sm mx-auto mb-10">The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 bg-primary text-accent text-[11px] font-black uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors">
            <Home size={16} />Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}