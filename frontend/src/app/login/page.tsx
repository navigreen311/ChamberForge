'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('ivan@greencompanies.com')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        setError('Invalid email or password')
      } else {
        window.location.href = '/dashboard'
      }
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#C9A84C] mb-2">CHAMBERFORGE</h1>
          <p className="text-gray-500 text-sm">Premium-service operating system</p>
        </div>

        <div className="bg-[#111827] rounded-lg p-8 border border-[#1e2a3a]">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full py-2.5 border border-[#C9A84C]/40 text-[#C9A84C] font-medium rounded-lg hover:bg-[#C9A84C]/10 transition mb-4 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign in with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#1e2a3a]" />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-[#1e2a3a]" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">{error}</div>
          )}

          <form onSubmit={handleCredentials}>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1117] border border-[#1e2a3a] rounded-lg text-white focus:outline-none focus:border-[#C9A84C]"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1117] border border-[#1e2a3a] rounded-lg text-white focus:outline-none focus:border-[#C9A84C]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#C9A84C] hover:bg-[#B8973B] text-[#0D1117] font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#C9A84C] hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
