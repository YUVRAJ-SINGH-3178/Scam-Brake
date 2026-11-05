'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setError(result.error || 'Unable to sign in.');
        return;
      }
      router.replace('/merchant');
    } catch {
      setError('Authentication service is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-[#DFE2DF] rounded-md p-7 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#525860]">Scam Brake</p>
          <h1 className="text-2xl font-semibold mt-2">Merchant sign in</h1>
        </div>
        <label className="block text-sm space-y-1">
          <span>Email</span>
          <input name="email" type="email" autoComplete="username" required maxLength={254} className="w-full border border-[#DFE2DF] rounded px-3 py-2" />
        </label>
        <label className="block text-sm space-y-1">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required maxLength={256} className="w-full border border-[#DFE2DF] rounded px-3 py-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-[#171A1F] text-white py-2.5 disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-xs text-[#525860]">Sign-in requires an account in the configured PostgreSQL database.</p>
      </form>
    </main>
  );
}
