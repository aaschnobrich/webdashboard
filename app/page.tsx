import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-5xl font-bold tracking-tight">Uptime Globe</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Monitor up to 25 websites, get instant down/recovery emails, and track uptime from one simple dashboard.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/signup" className="rounded bg-emerald-500 px-5 py-3 font-semibold text-slate-950">
            Start Monitoring
          </Link>
          <Link href="/login" className="rounded border border-slate-700 px-5 py-3 font-semibold">
            Login
          </Link>
        </div>
        <div className="relative mt-16 h-72 overflow-hidden rounded-2xl border border-slate-800">
          <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_48%,rgba(148,163,184,0.2)_50%,transparent_52%)] bg-[length:40px_40px]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_48%,rgba(148,163,184,0.2)_50%,transparent_52%)] bg-[length:40px_40px]" />
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/30" />
        </div>
      </div>
    </main>
  );
}
