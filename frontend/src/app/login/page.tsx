'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useFormValidation } from '@/hooks/useFormValidation';
import { loginSchema } from '@/lib/validations';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { validate, getError, clearErrors } = useFormValidation(loginSchema);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    clearErrors();

    if (!validate({ email, password })) return;

    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-chamber-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-gold-400">
            ChamberForge
          </h1>
          <p className="mt-2 text-sm text-chamber-400">
            Premium-service operating system for HNW/UHNW markets
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-chamber-800 bg-chamber-900 p-6"
        >
          <h2 className="text-lg font-semibold text-white">Sign in</h2>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {getError('email') && (
              <p className="mt-1 text-xs text-red-400">{getError('email')}</p>
            )}
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {getError('password') && (
              <p className="mt-1 text-xs text-red-400">{getError('password')}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full"
          >
            Sign in
          </Button>

          <p className="text-center text-sm text-chamber-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-gold-400 hover:text-gold-300"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
