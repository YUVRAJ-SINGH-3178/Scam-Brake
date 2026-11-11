'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function fillDemo() {
    setEmail('admin@scambrake.local');
    setPassword('DemoAdminPass2026!');
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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

        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded p-3 text-xs text-[#166534] space-y-1.5">
          <div className="flex items-center justify-between font-medium">
            <span>Local Demo Credentials</span>
            <button
              type="button"
              onClick={fillDemo}
              className="text-[#15803D] hover:underline font-semibold cursor-pointer"
            >
              Autofill
            </button>
          </div>
          <div className="font-mono text-[11px] text-[#14532D]">
            Email: <span className="select-all">admin@scambrake.local</span>
          </div>
          <div className="font-mono text-[11px] text-[#14532D]">
            Password: <span className="select-all">DemoAdminPass2026!</span>
          </div>
        </div>

        <label className="block text-sm space-y-1">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            maxLength={254}
            className="w-full border border-[#DFE2DF] rounded px-3 py-2"
          />
        </label>
        <label className="block text-sm space-y-1">
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            maxLength={256}
            className="w-full border border-[#DFE2DF] rounded px-3 py-2"
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-[#171A1F] text-white py-2.5 disabled:opacity-60 cursor-pointer">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

