export default function UpcomingFeature() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-cta">Coming Soon</p>
      <h1 className="text-5xl font-black text-primary uppercase tracking-tight">Work in Progress</h1>
      <p className="text-text-muted text-sm max-w-sm text-center">This feature is being built. Check back soon.</p>
      <a href="/" className="mt-6 text-[11px] font-black uppercase tracking-widest text-primary hover:text-cta transition-colors">← Back Home</a>
    </div>
  );
}
