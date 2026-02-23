import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    await createUser(parsed.data.email, parsed.data.password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 400 });
  }
}
