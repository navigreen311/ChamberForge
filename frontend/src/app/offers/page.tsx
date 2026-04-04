'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const OFFERS = [
  { id: '1', name: 'Private Ops Office — Chen Family', status: 'active', client: 'Sarah Chen', monthly: 22000, delivery: 'Orchestrated', health: 87, playbook: 'Private Ops Office', created: '2 weeks ago' },
  { id: '2', name: 'Family Cyber Command — Wellington', status: 'draft', client: 'Wellington Trust', monthly: 18000, delivery: 'Team', health: 62, playbook: 'Family Cyber Command', created: '3 days ago' },
  { id: '3', name: 'Ecosystem Orchestrator — Harrington', status: 'active', client: 'Harrington Dynasty', monthly: 35000, delivery: 'Orchestrated', health: 94, playbook: 'Ecosystem Orchestrator', created: '1 month ago' },
  { id: '4', name: 'Footprint Reduction — Reid Family', status: 'draft', client: 'Marcus Reid', monthly: 12000, delivery: 'Tech-Assisted', health: 0, playbook: 'Footprint Reduction', created: '1 day ago' },
  { id: '5', name: 'Medical Navigation — Thornton', status: 'sunset', client: 'Elizabeth Thornton', monthly: 15000, delivery: 'Solo', health: 45, playbook: 'Medical Navigation', created: '3 months ago' },
]

const statusColors: Record<string, string> = { active: 'bg-emerald-900/50 text-emerald-400', draft: 'bg-blue-900/50 text-blue-400', sunset: 'bg-gray-800 text-gray-400' }

export default function OffersPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? OFFERS : OFFERS.filter(o => o.status === filter)

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <header className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#C9A84C] font-bold tracking-widest text-lg">CHAMBERFORGE</Link>
          <nav className="flex gap-1">
            {[['Dashboard','/dashboard'],['Discover','/discover'],['Offers','/offers'],['Clients','/clients'],['Playbooks','/playbooks'],['Deliver','/deliver']].map(([t,h]) => (
              <Link key={t} href={h} className={`px-3 py-4 text-sm ${t==='Offers'?'text-[#C9A84C] border-b-2 border-[#C9A84C]':'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>{t}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold">Offers</h1>
            <p className="text-xs text-gray-500 mt-1">Manage your premium service offers · {OFFERS.length} total</p>
          </div>
          <button onClick={() => router.push('/build/offer/new')} className="bg-[#C9A84C] text-[#0D1117] font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#C9A84C]/90">+ New Offer</button>
        </div>

        <div className="flex gap-2 mb-4">
          {['all','active','draft','sunset'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg capitalize ${filter===s?'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]':'bg-[#111827] text-gray-400 border border-[#1e2a3a] hover:text-white'}`}>{s === 'all' ? `All (${OFFERS.length})` : `${s} (${OFFERS.filter(o=>o.status===s).length})`}</button>
          ))}
        </div>

        <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#0D1117]">
              {['Offer','Client','Status','Monthly','Delivery','Health','Playbook','Actions'].map(h => (
                <th key={h} className="text-[10px] uppercase tracking-wider text-gray-500 px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-t border-[#1e2a3a] hover:bg-[#1e2a3a]/50 cursor-pointer" onClick={() => router.push(`/build/offer/${o.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium">{o.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{o.client}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-sm">${(o.monthly/1000).toFixed(0)}K/mo</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{o.delivery}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium ${o.health>70?'text-emerald-400':o.health>50?'text-amber-400':o.health>0?'text-red-400':'text-gray-500'}`}>{o.health || '—'}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-400">{o.playbook}</td>
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
