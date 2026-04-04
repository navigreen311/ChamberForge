'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PLAYBOOKS = [
  { slug: 'private-ops-office', name: 'Private Ops Office', buyer: 'Newly wealthy founders', price: '$15-30K/mo', pain: 'Coordination overload', color: 'border-[#C9A84C]' },
  { slug: 'ecosystem-orchestrator', name: 'Ecosystem Orchestrator', buyer: 'Multi-residence UHNW', price: '$20-40K/mo', pain: 'Fragmented vendor stack', color: 'border-purple-400' },
  { slug: 'family-cyber-command', name: 'Family Cyber Command', buyer: 'Family offices', price: '$10-25K/mo', pain: 'AI impersonation, wire fraud', color: 'border-red-400' },
  { slug: 'footprint-reduction', name: 'Footprint Reduction', buyer: 'Public-facing executives', price: '$8-18K/mo', pain: 'Data broker exposure', color: 'border-blue-400' },
  { slug: 'household-workforce', name: 'Household Workforce', buyer: 'Principals with large staff', price: '$12-22K/mo', pain: 'Insider risk, vetting gaps', color: 'border-amber-400' },
  { slug: 'family-risk-council', name: 'Family Risk Council', buyer: 'Investment-focused FOs', price: '$15-35K/qtr', pain: 'Non-investment risk underbuilt', color: 'border-emerald-400' },
  { slug: 'next-gen-studio', name: 'Next-Gen Studio', buyer: 'Multigenerational wealth', price: '$25-60K project', pain: 'Succession conflict', color: 'border-pink-400' },
  { slug: 'medical-navigation', name: 'Medical Navigation', buyer: 'UHNW health-focused', price: '$8-20K/mo', pain: 'Fragmented records', color: 'border-teal-400' },
  { slug: 'property-resilience', name: 'Property Resilience', buyer: 'High-value property owners', price: '$10-20K/yr', pain: 'Insurance gaps', color: 'border-orange-400' },
  { slug: 'travel-reliability', name: 'Travel Reliability Desk', buyer: 'Frequent multi-gen travelers', price: '$6-15K/mo', pain: 'Disruption, logistics gaps', color: 'border-cyan-400' },
]

export default function PlaybooksPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <header className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#C9A84C] font-bold tracking-widest text-lg">CHAMBERFORGE</Link>
          <nav className="flex gap-1">
            {[['Dashboard','/dashboard'],['Discover','/discover'],['Offers','/offers'],['Clients','/clients'],['Playbooks','/playbooks'],['Deliver','/deliver']].map(([t,h]) => (
              <Link key={t} href={h} className={`px-3 py-4 text-sm ${t==='Playbooks'?'text-[#C9A84C] border-b-2 border-[#C9A84C]':'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>{t}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold">Vertical Playbooks</h1>
            <p className="text-xs text-gray-500 mt-1">10 prebuilt premium offer templates · Activate-to-offer in under 60 minutes</p>
          </div>
          <Link href="/build/composer" className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm hover:border-[#C9A84C] hover:text-white">Cross-Playbook Composer</Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {PLAYBOOKS.map(p => (
            <div key={p.slug} onClick={() => router.push(`/build/playbooks/${p.slug}`)} className={`bg-[#111827] rounded-lg border-l-4 ${p.color} border border-[#1e2a3a] p-5 cursor-pointer hover:bg-[#111827]/80 transition group`}>
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold group-hover:text-[#C9A84C] transition">{p.name}</h3>
                <span className="text-sm font-semibold text-[#C9A84C]">{p.price}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Target: {p.buyer}</p>
              <p className="text-xs text-gray-400 mt-2">Core pain: {p.pain}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={e => { e.stopPropagation(); router.push(`/build/playbooks/${p.slug}/activate`) }} className="text-[11px] bg-[#C9A84C] text-[#0D1117] font-medium px-3 py-1.5 rounded hover:bg-[#C9A84C]/90">Activate</button>
                <button onClick={e => { e.stopPropagation(); router.push(`/build/playbooks/${p.slug}`) }} className="text-[11px] border border-gray-600 text-gray-300 px-3 py-1.5 rounded hover:border-gray-400">View details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
