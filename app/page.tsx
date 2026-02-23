import Link from 'next/link';

const features = [
  {
    title: 'Clean status overview',
    description: 'A polished hero section that explains exactly what Uptime Globe does in seconds.'
  },
  {
    title: 'Zero backend setup',
    description: 'No database, auth, cron jobs, or API routes needed for this deploy-ready MVP.'
  },
  {
    title: 'Vercel friendly',
    description: 'Static front page only, so deployment is fast and works out of the box.'
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-20">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl shadow-emerald-900/20 backdrop-blur">
          <p className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1 text-sm font-medium text-emerald-300">
            MVP Front Page
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Uptime Globe</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Monitor your websites with confidence. This MVP is intentionally front-end only so you can deploy to Vercel without backend configuration.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#features"
              className="rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Explore Features
            </Link>
            <Link
              href="https://vercel.com/new"
              className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500"
            >
              Deploy on Vercel
            </Link>
          </div>
        </header>

        <section id="features" className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="mt-3 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
