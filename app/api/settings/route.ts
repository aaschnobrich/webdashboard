import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth-helpers';

const schema = z.object({
  alertRecovered: z.boolean()
});

export async function PATCH(req: Request) {
  const session = await requireSession();
  const payload = schema.safeParse(await req.json());

  if (!payload.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { alertRecovered: payload.data.alertRecovered }
  });

  return NextResponse.json({ ok: true });
}
