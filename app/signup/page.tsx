'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          if (!response.ok) {
            setError('Could not create account.');
            return;
          }

          await signIn('credentials', { email, password, redirect: false });
          router.push('/app');
        }}
      >
        <input className="w-full rounded bg-slate-900 p-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded bg-slate-900 p-3" type="password" placeholder="Password (8+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="text-red-400">{error}</p> : null}
        <button className="w-full rounded bg-emerald-500 px-4 py-3 font-semibold text-slate-950">Sign up</button>
      </form>
    </main>
  );
}
