import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth-helpers';
import { normalizeUrl } from '@/lib/url';

const createSchema = z.object({
  name: z.string().max(120).optional(),
  url: z.string().min(3)
});

const updateSchema = z.object({
  id: z.string(),
  name: z.string().max(120).optional(),
  url: z.string().min(3).optional(),
  isPaused: z.boolean().optional()
});

export async function GET() {
  const session = await requireSession();
  const monitors = await prisma.monitor.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { alertRecovered: true } });
  return NextResponse.json({ monitors, alertRecovered: user?.alertRecovered ?? true, now: new Date().toISOString() });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const payload = createSchema.safeParse(await req.json());
  if (!payload.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });

  const count = await prisma.monitor.count({ where: { userId: session.user.id } });
  if (count >= 25) return NextResponse.json({ error: 'Monitor limit reached (25).' }, { status: 400 });

  const url = normalizeUrl(payload.data.url);
  const monitor = await prisma.monitor.create({
    data: {
      userId: session.user.id,
      name: payload.data.name,
      url
    }
  });

  return NextResponse.json({ monitor });
}

export async function PATCH(req: Request) {
  const session = await requireSession();
  const payload = updateSchema.safeParse(await req.json());
  if (!payload.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });

  const monitor = await prisma.monitor.findFirst({ where: { id: payload.data.id, userId: session.user.id } });
  if (!monitor) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const updated = await prisma.monitor.update({
    where: { id: monitor.id },
    data: {
      name: payload.data.name,
      url: payload.data.url ? normalizeUrl(payload.data.url) : undefined,
      isPaused: payload.data.isPaused
    }
  });

  return NextResponse.json({ monitor: updated });
}

export async function DELETE(req: Request) {
  const session = await requireSession();
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });

  const monitor = await prisma.monitor.findFirst({ where: { id, userId: session.user.id } });
  if (!monitor) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  await prisma.monitor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
