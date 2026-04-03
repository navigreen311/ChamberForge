'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useFormValidation } from '@/hooks/useFormValidation';
import { loginSchema } from '@/lib/validations';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { validate, getError, clearErrors } = useFormValidation(loginSchema);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MFA challenge state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    clearErrors();

    if (!validate({ email, password })) return;

    setLoading(true);

    try {
      // Call login API directly to detect MFA challenge
      const { data } = await api.post('/api/v1/auth/login', { email, password });

      if (data.requires_mfa) {
        setMfaRequired(true);
        setMfaToken(data.mfa_token);
        setLoading(false);
        return;
      }

      // No MFA — complete login normally
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      document.cookie = `auth_token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/v1/auth/mfa-verify', {
        mfa_token: mfaToken,
        totp_code: totpCode,
      });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      document.cookie = `auth_token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch {
      setError('Invalid verification code. Please try again.');
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

        {/* MFA verification step */}
        {mfaRequired ? (
          <form
            onSubmit={handleMfaSubmit}
            className="space-y-5 rounded-xl border border-chamber-800 bg-chamber-900 p-6"
          >
            <h2 className="text-lg font-semibold text-white">
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-chamber-400">
              Enter the 6-digit code from your authenticator app, or use a
              backup code.
            </p>

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Verification code"
                type="text"
                placeholder="Enter 6-digit code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                maxLength={8}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full"
            >
              Verify
            </Button>

            <button
              type="button"
              onClick={() => {
                setMfaRequired(false);
                setMfaToken('');
                setTotpCode('');
                setError('');
              }}
              className="w-full text-center text-sm text-chamber-400 hover:text-chamber-300"
            >
              Back to sign in
            </button>
          </form>
        ) : (
          /* Standard login form */
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
                <p className="mt-1 text-xs text-red-400">
                  {getError('password')}
                </p>
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
        )}
      </div>
    </div>
  );
}
