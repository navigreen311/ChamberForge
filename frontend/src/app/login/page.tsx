'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@chamberforge.dev')
  const [password, setPassword] = useState('Admin123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || data.detail || 'Login failed'); setLoading(false); return }
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      document.cookie = `auth_token=${data.access_token}; path=/; max-age=${60*60*24*7}; SameSite=Lax`
      window.location.href = '/dashboard'
    } catch { setError('Connection error — is the backend running?') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#C9A84C] mb-2">CHAMBERFORGE</h1>
          <p className="text-gray-500 text-sm">Premium-service operating system</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#111827] rounded-lg p-8 border border-[#1e2a3a]">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>
          {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">{error}</div>}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-[#0D1117] border border-[#1e2a3a] rounded-lg text-white focus:outline-none focus:border-[#C9A84C]" required />
          </div>
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-[#0D1117] border border-[#1e2a3a] rounded-lg text-white focus:outline-none focus:border-[#C9A84C]" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D1117] font-semibold rounded-lg transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="mt-4 text-center text-sm text-gray-500">
            Don&apos;t have an account? <Link href="/register" className="text-[#C9A84C] hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
