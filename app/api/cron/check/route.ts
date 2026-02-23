import { NextResponse } from 'next/server';
import { appEnv } from '@/lib/env';
import { runMonitorChecks } from '@/lib/cron';

const isAuthorized = (req: Request): boolean => {
  const url = new URL(req.url);
  const querySecret = url.searchParams.get('secret');
  const headerSecret = req.headers.get('x-cron-secret');
  return Boolean(appEnv.cronSecret && (querySecret === appEnv.cronSecret || headerSecret === appEnv.cronSecret));
};

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runMonitorChecks();
  return NextResponse.json({ ok: true, ...result });
}
