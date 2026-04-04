'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CLIENTS = [
  { id: '1', name: 'Sarah Chen', company: 'Chen Family Office', tier: 'HNW', status: 'active', health: 87, offers: 1, retainer: 22000, since: 'Jan 2026' },
  { id: '2', name: 'Wellington Trust', company: 'Wellington Family Trust', tier: 'UHNW', status: 'active', health: 62, offers: 1, retainer: 18000, since: 'Feb 2026' },
  { id: '3', name: 'Harrington Dynasty', company: 'Harrington Holdings', tier: 'UHNW', status: 'active', health: 94, offers: 2, retainer: 35000, since: 'Dec 2025' },
  { id: '4', name: 'Marcus Reid', company: 'Reid Ventures', tier: 'HNW', status: 'prospect', health: 0, offers: 0, retainer: 0, since: '—' },
  { id: '5', name: 'Elizabeth Thornton', company: 'Thornton Estate', tier: 'HNW', status: 'alumni', health: 45, offers: 0, retainer: 0, since: 'Mar 2025' },
  { id: '6', name: 'Diana Walsh', company: 'Walsh Capital', tier: 'UHNW', status: 'prospect', health: 0, offers: 0, retainer: 0, since: '—' },
]

const statusColors: Record<string,string> = { active:'bg-emerald-900/50 text-emerald-400', prospect:'bg-blue-900/50 text-blue-400', alumni:'bg-gray-800 text-gray-400' }
const tierColors: Record<string,string> = { UHNW:'border-[#C9A84C] text-[#C9A84C]', HNW:'border-blue-400 text-blue-400' }

export default function ClientsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? CLIENTS : CLIENTS.filter(c => c.status === filter)
  const totalRetainer = CLIENTS.filter(c=>c.status==='active').reduce((s,c)=>s+c.retainer,0)

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <header className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#C9A84C] font-bold tracking-widest text-lg">CHAMBERFORGE</Link>
          <nav className="flex gap-1">
            {[['Dashboard','/dashboard'],['Discover','/discover'],['Offers','/offers'],['Clients','/clients'],['Playbooks','/playbooks'],['Deliver','/deliver']].map(([t,h]) => (
              <Link key={t} href={h} className={`px-3 py-4 text-sm ${t==='Clients'?'text-[#C9A84C] border-b-2 border-[#C9A84C]':'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>{t}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold">Clients</h1>
            <p className="text-xs text-gray-500 mt-1">{CLIENTS.filter(c=>c.status==='active').length} active · ${(totalRetainer/1000).toFixed(0)}K/mo total retainer</p>
          </div>
          <button onClick={() => router.push('/clients/new')} className="bg-[#C9A84C] text-[#0D1117] font-semibold px-4 py-2 rounded-lg text-sm">+ Add Client</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{l:'Active Clients',v:CLIENTS.filter(c=>c.status==='active').length,c:'text-emerald-400'},{l:'Prospects',v:CLIENTS.filter(c=>c.status==='prospect').length,c:'text-blue-400'},{l:'Avg Health Score',v:Math.round(CLIENTS.filter(c=>c.health>0).reduce((s,c)=>s+c.health,0)/CLIENTS.filter(c=>c.health>0).length),c:'text-white'},{l:'Monthly Retainer',v:`$${(totalRetainer/1000).toFixed(0)}K`,c:'text-[#C9A84C]'}].map(m => (
            <div key={m.l} className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">{m.l}</div>
              <div className={`text-xl font-semibold mt-1 ${m.c}`}>{m.v}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {['all','active','prospect','alumni'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg capitalize ${filter===s?'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]':'bg-[#111827] text-gray-400 border border-[#1e2a3a]'}`}>{s === 'all' ? `All (${CLIENTS.length})` : `${s} (${CLIENTS.filter(c=>c.status===s).length})`}</button>
          ))}
        </div>

        <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#0D1117]">
              {['Client','Company','Tier','Status','Health','Active Offers','Retainer','Since',''].map(h => (
                <th key={h} className="text-[10px] uppercase tracking-wider text-gray-500 px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t border-[#1e2a3a] hover:bg-[#1e2a3a]/50 cursor-pointer" onClick={() => router.push(`/clients/${c.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{c.company}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${tierColors[c.tier]}`}>{c.tier}</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium ${c.health>70?'text-emerald-400':c.health>50?'text-amber-400':c.health>0?'text-red-400':'text-gray-500'}`}>{c.health||'—'}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-300">{c.offers}</td>
                  <td className="px-4 py-3 text-sm">{c.retainer?`$${(c.retainer/1000).toFixed(0)}K/mo`:'—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.since}</td>
                  <td className="px-4 py-3"><span className="text-[11px] text-[#C9A84C] hover:underline">View →</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
