'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', totp: '' });
  const [need2FA, setNeed2FA] = useState(false);

  const mutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/auth/login', d),
    onSuccess: (data: any) => {
      setAuth(data.user, data.token);
      window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
    },
    onError: (e: any) => {
      if (e.message.includes('2FA')) setNeed2FA(true);
      else toast.error(e.message);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">💎 YieldPlatform</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {need2FA && (
            <div>
              <label className="label">2FA Code</label>
              <input className="input text-center text-2xl tracking-widest" type="text" value={form.totp} onChange={(e) => setForm((f) => ({ ...f, totp: e.target.value }))} placeholder="000000" maxLength={6} />
            </div>
          )}
          <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary w-full py-3">
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
