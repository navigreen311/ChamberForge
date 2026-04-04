'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const DELIVERABLES = [
  { id: '1', client: 'Sarah Chen', type: 'Quarterly Scorecard', status: 'delivered', date: 'Mar 28, 2026', portal: true },
  { id: '2', client: 'Wellington Trust', type: 'Incident Response Plan', status: 'in_progress', date: 'Apr 2, 2026', portal: false },
  { id: '3', client: 'Harrington Dynasty', type: 'Household Risk Audit', status: 'delivered', date: 'Mar 15, 2026', portal: true },
  { id: '4', client: 'Sarah Chen', type: 'Monthly Operations Report', status: 'delivered', date: 'Mar 1, 2026', portal: true },
  { id: '5', client: 'Harrington Dynasty', type: 'Vendor Compliance Review', status: 'review', date: 'Apr 1, 2026', portal: false },
  { id: '6', client: 'Wellington Trust', type: 'Cybersecurity Assessment', status: 'in_progress', date: 'Apr 3, 2026', portal: false },
]

const statusColors: Record<string,string> = { delivered:'bg-emerald-900/50 text-emerald-400', in_progress:'bg-blue-900/50 text-blue-400', review:'bg-amber-900/50 text-amber-400' }
const statusLabels: Record<string,string> = { delivered:'Delivered', in_progress:'In Progress', review:'Under Review' }

const UPCOMING = [
  { client: 'Sarah Chen', task: 'Weekly Ops Review', due: 'Tomorrow, 10:00 AM', priority: 'high' },
  { client: 'Wellington Trust', task: 'Cyber Training Session', due: 'Apr 5, 2:00 PM', priority: 'critical' },
  { client: 'Harrington Dynasty', task: 'Quarterly Review Prep', due: 'Apr 8', priority: 'medium' },
]

export default function DeliverPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <header className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#C9A84C] font-bold tracking-widest text-lg">CHAMBERFORGE</Link>
          <nav className="flex gap-1">
            {[['Dashboard','/dashboard'],['Discover','/discover'],['Offers','/offers'],['Clients','/clients'],['Playbooks','/playbooks'],['Deliver','/deliver']].map(([t,h]) => (
              <Link key={t} href={h} className={`px-3 py-4 text-sm ${t==='Deliver'?'text-[#C9A84C] border-b-2 border-[#C9A84C]':'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>{t}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold">Delivery Hub</h1>
            <p className="text-xs text-gray-500 mt-1">Fulfillment OS · Client deliverables · Portal management</p>
          </div>
          <button onClick={() => router.push('/build/portal')} className="bg-[#C9A84C] text-[#0D1117] font-semibold px-4 py-2 rounded-lg text-sm">Manage Client Portals</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{l:'Total Deliverables',v:'6',c:'text-white'},{l:'Delivered',v:'3',c:'text-emerald-400'},{l:'In Progress',v:'2',c:'text-blue-400'},{l:'Under Review',v:'1',c:'text-amber-400'}].map(m => (
            <div key={m.l} className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">{m.l}</div>
              <div className={`text-xl font-semibold mt-1 ${m.c}`}>{m.v}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">RECENT DELIVERABLES</h2>
            <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-[#0D1117]">
                  {['Client','Deliverable','Status','Date','Portal',''].map(h => (
                    <th key={h} className="text-[10px] uppercase tracking-wider text-gray-500 px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {DELIVERABLES.map(d => (
                    <tr key={d.id} className="border-t border-[#1e2a3a] hover:bg-[#1e2a3a]/50">
                      <td className="px-4 py-3 text-sm font-medium">{d.client}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{d.type}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[d.status]}`}>{statusLabels[d.status]}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{d.date}</td>
                      <td className="px-4 py-3">{d.portal ? <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" /> : <span className="text-gray-600">—</span>}</td>
                      <td className="px-4 py-3"><span className="text-[11px] text-[#C9A84C] hover:underline cursor-pointer">View →</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-[300px] flex-shrink-0 space-y-4">
            <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
              <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">UPCOMING TASKS</h3>
              {UPCOMING.map((u,i) => (
                <div key={i} className={`py-3 border-b border-[#1e2a3a] last:border-0 border-l-2 pl-3 ${u.priority==='critical'?'border-l-red-500':u.priority==='high'?'border-l-amber-500':'border-l-gray-600'}`}>
                  <div className="text-sm font-medium">{u.task}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{u.client}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{u.due}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
              <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">CLIENT PORTALS</h3>
              {['Sarah Chen','Harrington Dynasty'].map(n => (
                <div key={n} className="flex items-center justify-between py-2 border-b border-[#1e2a3a] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <span className="text-sm">{n}</span>
                  </div>
                  <span className="text-[11px] text-[#C9A84C] hover:underline cursor-pointer">Open →</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span className="text-sm text-gray-500">Wellington Trust</span>
                </div>
                <span className="text-[11px] text-gray-500">Not activated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
