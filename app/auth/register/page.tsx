'use client';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const params = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', referralCode: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const ref = params.get('ref');
    if (ref) setForm((f) => ({ ...f, referralCode: ref }));
  }, [params]);

  const mutation = useMutation({
    mutationFn: (d: { email: string; password: string; referralCode?: string }) => api.post('/auth/register', d),
    onSuccess: () => setSuccess(true),
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    mutation.mutate({ email: form.email, password: form.password, referralCode: form.referralCode || undefined });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full text-center space-y-4 p-8">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold">Registration Successful!</h2>
          <p className="text-gray-400">Please check your email to verify your account before logging in.</p>
          <Link href="/auth/login" className="btn-primary block">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">💎 YieldPlatform</h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat password" />
          </div>
          <div>
            <label className="label">Referral Code <span className="text-gray-600">(optional)</span></label>
            <input className="input font-mono uppercase" value={form.referralCode} onChange={(e) => setForm((f) => ({ ...f, referralCode: e.target.value.toUpperCase() }))} placeholder="XXXXXXXXXX" maxLength={10} />
          </div>
          <button onClick={handleSubmit} disabled={mutation.isPending} className="btn-primary w-full py-3">
            {mutation.isPending ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
