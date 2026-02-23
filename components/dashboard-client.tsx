'use client';

import { formatDistanceToNow } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

type Monitor = {
  id: string;
  name: string | null;
  url: string;
  isPaused: boolean;
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  lastCheckedAt: string | null;
  lastResponseTimeMs: number | null;
  lastError: string | null;
};

const statusStyles: Record<Monitor['status'], string> = {
  UP: 'bg-emerald-500/20 text-emerald-300',
  DOWN: 'bg-red-500/20 text-red-300',
  UNKNOWN: 'bg-slate-600/40 text-slate-200'
};

export function DashboardClient({ email }: { email: string }) {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [alertRecovered, setAlertRecovered] = useState(true);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = async () => {
    const response = await fetch('/api/monitors');
    if (!response.ok) return;
    const data = await response.json();
    setMonitors(data.monitors);
    setAlertRecovered(data.alertRecovered);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15000);
    return () => clearInterval(interval);
  }, []);

  const countLabel = useMemo(() => `${monitors.length}/25 monitors`, [monitors.length]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-slate-300">Signed in as {email}</p>
        </div>
        <p className="text-sm text-slate-400">{lastUpdated ? `Last updated ${formatDistanceToNow(lastUpdated)} ago` : 'Loading...'}</p>
      </header>

      <section className="rounded-xl border border-slate-800 p-4">
        <div className="mb-2 text-sm text-slate-300">{countLabel}</div>
        <form
          className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={async (e) => {
            e.preventDefault();
            setMessage('');
            const response = await fetch('/api/monitors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, name: name || undefined })
            });
            const data = await response.json();
            if (!response.ok) {
              setMessage(data.error || 'Could not add monitor');
              return;
            }
            setUrl('');
            setName('');
            await refresh();
          }}
        >
          <input className="rounded bg-slate-900 p-3" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
          <input className="rounded bg-slate-900 p-3" placeholder="Friendly name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="rounded bg-emerald-500 px-4 py-3 font-semibold text-slate-950">Add monitor</button>
        </form>
        {message ? <p className="mt-2 text-sm text-red-300">{message}</p> : null}
      </section>

      <section className="mt-4 rounded-xl border border-slate-800 p-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={alertRecovered}
            onChange={async (e) => {
              const next = e.target.checked;
              setAlertRecovered(next);
              await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertRecovered: next })
              });
            }}
          />
          Email me when a site recovers
        </label>
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-3 text-left">Name / URL</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Last checked</th><th className="p-3 text-left">Response</th><th className="p-3 text-left">Error</th><th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {monitors.map((monitor) => (
              <tr key={monitor.id} className="border-t border-slate-800">
                <td className="p-3"><div className="font-medium">{monitor.name || 'Untitled'}</div><div className="text-slate-400">{monitor.url}</div></td>
                <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[monitor.status]}`}>{monitor.status === 'UP' ? 'Online' : monitor.status === 'DOWN' ? 'Offline' : 'Unknown'}</span></td>
                <td className="p-3" title={monitor.lastCheckedAt ?? ''}>{monitor.lastCheckedAt ? formatDistanceToNow(new Date(monitor.lastCheckedAt)) + ' ago' : 'Never'}</td>
                <td className="p-3">{monitor.lastResponseTimeMs ? `${monitor.lastResponseTimeMs} ms` : '--'}</td>
                <td className="p-3 text-red-300">{monitor.lastError ?? '--'}</td>
                <td className="space-x-2 p-3">
                  <button className="rounded border border-slate-700 px-2 py-1" onClick={async () => { await fetch('/api/monitors', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: monitor.id, isPaused: !monitor.isPaused }) }); await refresh(); }}>{monitor.isPaused ? 'Resume' : 'Pause'}</button>
                  <button className="rounded border border-slate-700 px-2 py-1" onClick={async () => { const renamed = prompt('New name', monitor.name ?? ''); if (renamed === null) return; await fetch('/api/monitors', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: monitor.id, name: renamed }) }); await refresh(); }}>Edit</button>
                  <button className="rounded border border-red-700 px-2 py-1 text-red-300" onClick={async () => { await fetch(`/api/monitors?id=${monitor.id}`, { method: 'DELETE' }); await refresh(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
