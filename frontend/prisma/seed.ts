import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ChamberForge database...')

  // ── User ──────────────────────────────────────────
  const ivan = await prisma.user.upsert({
    where: { email: 'ivan@greencompanies.com' },
    update: {},
    create: {
      name: 'Ivan',
      email: 'ivan@greencompanies.com',
      password: await bcrypt.hash('demo123', 10),
      role: 'owner',
      mode: 'expert',
      theme: 'dark',
      onboardedAt: new Date(),
    },
  })
  console.log(`  ✓ User: ${ivan.name}`)

  // ── Clients ───────────────────────────────────────
  const sarah = await prisma.client.upsert({
    where: { id: 'cl-sarah' },
    update: {},
    create: { id: 'cl-sarah', userId: ivan.id, name: 'Sarah Chen', company: 'Chen Family Office', tier: 'HNW', status: 'active', healthScore: 87, healthTrend: 3, monthlyRetainer: 22000, renewalDate: new Date('2026-09-12'), trustChannel: 'private_banker', painCategories: ['Coordination'], lastContactAt: new Date(Date.now() - 86400000), lastContactType: 'call' },
  })
  const wellington = await prisma.client.upsert({
    where: { id: 'cl-wellington' },
    update: {},
    create: { id: 'cl-wellington', userId: ivan.id, name: 'Wellington Trust', company: 'Wellington Family Trust', tier: 'UHNW', status: 'active', healthScore: 62, healthTrend: -9, monthlyRetainer: 18000, renewalDate: new Date('2026-06-01'), trustChannel: 'estate_attorney', painCategories: ['Security'], lastContactAt: new Date(Date.now() - 12 * 86400000), lastContactType: 'email' },
  })
  const harrington = await prisma.client.upsert({
    where: { id: 'cl-harrington' },
    update: {},
    create: { id: 'cl-harrington', userId: ivan.id, name: 'Harrington Dynasty', company: 'Harrington Holdings', tier: 'UHNW', status: 'active', healthScore: 94, healthTrend: 2, monthlyRetainer: 35000, renewalDate: new Date('2026-12-01'), trustChannel: 'wealth_manager', painCategories: ['Coordination', 'Privacy'], lastContactAt: new Date(Date.now() - 3 * 86400000), lastContactType: 'review' },
  })
  console.log(`  ✓ Clients: 3 created`)

  // ── Problems (8 covering all categories) ──────────
  const problems = [
    { id: 'pr-1', title: 'AI Voice Cloning Wire Fraud', painCategory: 'Security', wealthTier: 'UHNW', lifecycleStage: 'Emerging', urgencyScore: 9.2, credibilityScore: 8.7, wtpSignal: 8.4, compositeScore: 8.9, wtpRange: '$10-25K/mo', citations: 7 },
    { id: 'pr-2', title: 'Coordination Overload for Post-Exit Founders', painCategory: 'Coordination', wealthTier: 'HNW', lifecycleStage: 'Accelerating', urgencyScore: 8.1, credibilityScore: 7.9, wtpSignal: 7.2, compositeScore: 7.4, wtpRange: '$15-30K/mo', citations: 5 },
    { id: 'pr-3', title: 'Data Broker Exposure of UHNW Families', painCategory: 'Privacy', wealthTier: 'UHNW', lifecycleStage: 'Proven', urgencyScore: 7.5, credibilityScore: 8.2, wtpSignal: 6.8, compositeScore: 7.1, wtpRange: '$8-18K/mo', citations: 8 },
    { id: 'pr-4', title: 'Non-Investment Risk Governance Gaps', painCategory: 'Governance', wealthTier: 'FamilyOffice', lifecycleStage: 'Accelerating', urgencyScore: 7.8, credibilityScore: 7.1, wtpSignal: 6.2, compositeScore: 6.8, wtpRange: '$15-35K/qtr', citations: 4 },
    { id: 'pr-5', title: 'Healthcare Navigation Fragmentation', painCategory: 'Medical', wealthTier: 'HNW', lifecycleStage: 'Emerging', urgencyScore: 6.9, credibilityScore: 6.5, wtpSignal: 5.5, compositeScore: 5.8, wtpRange: '$8-20K/mo', citations: 3 },
    { id: 'pr-6', title: 'Succession Conflict in Dynastic Wealth', painCategory: 'Governance', wealthTier: 'UHNW', lifecycleStage: 'Accelerating', urgencyScore: 8.0, credibilityScore: 7.5, wtpSignal: 7.0, compositeScore: 7.2, wtpRange: '$25-60K project', citations: 6 },
    { id: 'pr-7', title: 'Insurance Market Hardening for Luxury Properties', painCategory: 'Property', wealthTier: 'HNW', lifecycleStage: 'Proven', urgencyScore: 6.5, credibilityScore: 7.2, wtpSignal: 6.0, compositeScore: 6.1, wtpRange: '$10-20K/yr', citations: 4 },
    { id: 'pr-8', title: 'Multi-Generational Travel Logistics Failures', painCategory: 'Travel', wealthTier: 'HNW', lifecycleStage: 'Accelerating', urgencyScore: 6.2, credibilityScore: 6.0, wtpSignal: 5.8, compositeScore: 5.5, wtpRange: '$6-15K/mo', citations: 3 },
  ]
  for (const p of problems) {
    await prisma.problem.upsert({ where: { id: p.id }, update: {}, create: { ...p, userId: ivan.id, status: 'active' } })
  }
  console.log(`  ✓ Problems: ${problems.length} created`)

  // ── Offers ────────────────────────────────────────
  const offers = [
    { id: 'of-1', name: 'Private Ops Office — Chen', clientId: sarah.id, problemId: 'pr-2', status: 'active', priceMin: 15000, priceMax: 30000, deliveryModel: 'orchestrated', healthScore: 87, healthTrend: 3, renewalDate: new Date('2026-09-12') },
    { id: 'of-2', name: 'Family Cyber Command — Wellington', clientId: wellington.id, problemId: 'pr-1', status: 'draft', priceMin: 10000, priceMax: 25000, deliveryModel: 'team', healthScore: null, healthTrend: null },
    { id: 'of-3', name: 'Ecosystem Orchestrator — Harrington', clientId: harrington.id, problemId: 'pr-2', status: 'active', priceMin: 20000, priceMax: 40000, deliveryModel: 'orchestrated', healthScore: 94, healthTrend: 2, renewalDate: new Date('2026-12-01') },
    { id: 'of-4', name: 'Footprint Reduction — Reid', problemId: 'pr-3', status: 'draft', priceMin: 8000, priceMax: 18000, deliveryModel: 'tech_assisted' },
    { id: 'of-5', name: 'Medical Navigation — Thornton', problemId: 'pr-5', status: 'sunset', priceMin: 8000, priceMax: 20000, deliveryModel: 'solo', healthScore: 45, healthTrend: -8 },
  ]
  for (const o of offers) {
    await prisma.offer.upsert({ where: { id: o.id }, update: {}, create: { ...o, userId: ivan.id } })
  }
  console.log(`  ✓ Offers: ${offers.length} created`)

  // ── Deliverables ──────────────────────────────────
  const deliverables = [
    { id: 'dl-1', name: 'Q1 Scorecard', type: 'scorecard', clientId: sarah.id, status: 'delivered', priority: 'medium', slaDate: new Date('2026-03-28'), deliveredAt: new Date('2026-03-27'), qaScore: 4 },
    { id: 'dl-2', name: 'Incident Response Plan', type: 'ir_plan', clientId: wellington.id, status: 'overdue', priority: 'critical', slaDate: new Date('2026-04-01'), qaScore: 1 },
    { id: 'dl-3', name: 'Household Risk Audit', type: 'audit', clientId: harrington.id, status: 'delivered', priority: 'high', slaDate: new Date('2026-03-15'), deliveredAt: new Date('2026-03-14'), qaScore: 4 },
    { id: 'dl-4', name: 'Monthly Ops Report', type: 'report', clientId: sarah.id, status: 'delivered', priority: 'medium', slaDate: new Date('2026-03-01'), deliveredAt: new Date('2026-02-28'), qaScore: 4 },
    { id: 'dl-5', name: 'Vendor Compliance Review', type: 'audit', clientId: harrington.id, status: 'under_review', priority: 'high', slaDate: new Date('2026-04-05'), qaScore: 2 },
    { id: 'dl-6', name: 'Cybersecurity Assessment', type: 'assessment', clientId: wellington.id, status: 'in_progress', priority: 'critical', slaDate: new Date('2026-04-08'), qaScore: 0 },
  ]
  for (const d of deliverables) {
    await prisma.deliverable.upsert({ where: { id: d.id }, update: {}, create: { ...d, userId: ivan.id } })
  }
  console.log(`  ✓ Deliverables: ${deliverables.length} created`)

  // ── Tasks ─────────────────────────────────────────
  const tasks = [
    { id: 'tk-1', name: 'Wellington IR Plan follow-up', clientId: wellington.id, priority: 'critical', dueAt: new Date(Date.now() - 2 * 86400000) },
    { id: 'tk-2', name: 'VoiceForge Training — Harrington', clientId: harrington.id, priority: 'high', dueAt: new Date(Date.now() + 86400000) },
    { id: 'tk-3', name: 'Monthly Review — Chen', clientId: sarah.id, priority: 'medium', dueAt: new Date(Date.now() + 5 * 86400000) },
    { id: 'tk-4', name: 'Vendor audit followup', priority: 'medium', dueAt: new Date(Date.now() + 7 * 86400000) },
    { id: 'tk-5', name: 'Reid onboarding week 2', priority: 'medium', dueAt: new Date(Date.now() + 9 * 86400000) },
    { id: 'tk-6', name: 'Quarterly review prep — Harrington', clientId: harrington.id, priority: 'medium', dueAt: new Date(Date.now() + 14 * 86400000) },
    { id: 'tk-7', name: 'Update evidence graph with FBI alert', priority: 'high', dueAt: new Date(Date.now() + 2 * 86400000) },
    { id: 'tk-8', name: 'Renewal prep — Wellington', clientId: wellington.id, priority: 'high', dueAt: new Date(Date.now() + 30 * 86400000), completedAt: null },
  ]
  for (const t of tasks) {
    await prisma.task.upsert({ where: { id: t.id }, update: {}, create: { ...t, userId: ivan.id } })
  }
  console.log(`  ✓ Tasks: ${tasks.length} created`)

  // ── Wealth Events ─────────────────────────────────
  const events = [
    { id: 'we-1', type: 'exit', description: 'Marcus Reid completed Series C exit ($120M)', personName: 'Marcus Reid', detectedAt: new Date(Date.now() - 2 * 3600000) },
    { id: 'we-2', type: 'inheritance', description: 'Thornton estate transfer initiated ($45M)', personName: 'Elizabeth Thornton', detectedAt: new Date(Date.now() - 5 * 3600000) },
    { id: 'we-3', type: 'board', description: 'Diana Walsh appointed to Meridian Capital board', personName: 'Diana Walsh', clientId: harrington.id, detectedAt: new Date(Date.now() - 2 * 86400000) },
  ]
  for (const e of events) {
    await prisma.wealthEvent.upsert({ where: { id: e.id }, update: {}, create: { ...e, userId: ivan.id } })
  }
  console.log(`  ✓ Wealth Events: ${events.length} created`)

  // ── Risk Review Items ─────────────────────────────
  const risks = [
    { id: 'rr-1', title: 'Medical navigation offer references licensed care', description: 'Offer copy suggests direct medical advice. Guardrails Engine flagged regulated domain.', type: 'guardrails', sourceModule: 'Guardrails Engine', riskLevel: 'critical' },
    { id: 'rr-2', title: 'Guarantee language in Ecosystem Orchestrator', description: 'AI Explainability Layer flagged specific outcome promises that need review.', type: 'compliance', sourceModule: 'AI Explainability', riskLevel: 'high' },
  ]
  for (const r of risks) {
    await prisma.riskReviewItem.upsert({ where: { id: r.id }, update: {}, create: { ...r, userId: ivan.id, status: 'pending' } })
  }
  console.log(`  ✓ Risk Review Items: ${risks.length} created`)

  // ── Notifications ─────────────────────────────────
  const notifs = [
    { id: 'nt-1', type: 'wealth_event', title: 'New wealth event', body: 'Marcus Reid completed Series C exit ($120M)', read: false },
    { id: 'nt-2', type: 'sla', title: 'SLA breach', body: 'Wellington Trust IR Plan is 2 days overdue', read: false },
    { id: 'nt-3', type: 'health', title: 'Health score change', body: 'Harrington Dynasty health score improved to 94 (+2)', read: true },
    { id: 'nt-4', type: 'command_ai', title: 'New recommendation', body: 'Activate Family Cyber Command for Wellington Trust', read: false },
    { id: 'nt-5', type: 'compliance', title: 'Guardrails flag', body: 'Medical offer copy flagged — regulated domain', read: false },
    { id: 'nt-6', type: 'wealth_event', title: 'Inheritance detected', body: 'Thornton estate transfer initiated ($45M)', read: true },
    { id: 'nt-7', type: 'health', title: 'Client at risk', body: 'Wellington Trust health dropped to 62 (-9)', read: false },
    { id: 'nt-8', type: 'system', title: 'Evidence updated', body: 'FBI AI impersonation alert added (credibility 9.2)', read: true },
    { id: 'nt-9', type: 'sla', title: 'SLA approaching', body: 'Vendor Compliance Review due in 1 day', read: true },
    { id: 'nt-10', type: 'command_ai', title: 'Pipeline opportunity', body: 'Data Broker Exposure problem score increased to 7.1', read: true },
    { id: 'nt-11', type: 'system', title: 'Playbook activated', body: 'Private Ops Office template activated for Chen Family', read: true },
    { id: 'nt-12', type: 'wealth_event', title: 'Board appointment', body: 'Diana Walsh appointed to Meridian Capital board', read: false },
  ]
  for (const n of notifs) {
    await prisma.notification.upsert({ where: { id: n.id }, update: {}, create: { ...n, userId: ivan.id } })
  }
  console.log(`  ✓ Notifications: ${notifs.length} created`)

  // ── Playbooks (10 standard templates) ─────────────
  const playbooks = [
    { id: 'pb-1', slug: 'private-ops-office', name: 'Private Ops Office', category: 'Coordination', targetBuyer: 'Newly wealthy founders', corePain: 'Coordination overload across multi-entity life', wealthTier: ['HNW'], deliveryModel: 'orchestrated', pricingModel: 'retainer', priceMin: 15000, priceMax: 30000, lifecycleStage: 'Accelerating', evidenceScore: 8.2, wtpScore: 7.9, activationMins: 38, readinessPct: 95, voiceforgeReady: true, visionAudioReady: true, dealDeskReady: true, trustPackReady: true, kpiCount: 4, redTeamStatus: 'passed', activeDeployments: 3 },
    { id: 'pb-2', slug: 'ecosystem-orchestrator', name: 'Ecosystem Orchestrator', category: 'Coordination', targetBuyer: 'Multi-residence UHNW families', corePain: 'Fragmented vendor stack with no accountable point', wealthTier: ['UHNW'], deliveryModel: 'orchestrated', pricingModel: 'retainer', priceMin: 20000, priceMax: 40000, lifecycleStage: 'Proven', evidenceScore: 8.5, wtpScore: 8.1, activationMins: 45, readinessPct: 100, voiceforgeReady: true, visionAudioReady: true, dealDeskReady: true, trustPackReady: true, kpiCount: 4, redTeamStatus: 'passed', activeDeployments: 2 },
    { id: 'pb-3', slug: 'family-cyber-command', name: 'Family Cyber Command', category: 'Security', targetBuyer: 'Family offices', corePain: 'AI impersonation, wire fraud, household exposure', wealthTier: ['UHNW'], deliveryModel: 'team', pricingModel: 'retainer', priceMin: 10000, priceMax: 25000, lifecycleStage: 'Emerging', evidenceScore: 9.0, wtpScore: 8.7, activationMins: 52, readinessPct: 72, voiceforgeReady: true, visionAudioReady: false, dealDeskReady: true, trustPackReady: false, kpiCount: 3, redTeamStatus: 'failed', activeDeployments: 1 },
    { id: 'pb-4', slug: 'footprint-reduction', name: 'Footprint Reduction', category: 'Privacy', targetBuyer: 'Public-facing executives', corePain: 'Data broker exposure and physical safety risk', wealthTier: ['UHNW'], deliveryModel: 'tech_assisted', pricingModel: 'retainer', priceMin: 8000, priceMax: 18000, lifecycleStage: 'Proven', evidenceScore: 7.8, wtpScore: 7.2, activationMins: 30, readinessPct: 88, voiceforgeReady: false, visionAudioReady: true, dealDeskReady: true, trustPackReady: true, kpiCount: 4, redTeamStatus: 'passed', activeDeployments: 0 },
    { id: 'pb-5', slug: 'household-workforce', name: 'Household Workforce', category: 'Coordination', targetBuyer: 'Principals with large staff', corePain: 'Insider risk, vetting gaps, sloppy offboarding', wealthTier: ['HNW'], deliveryModel: 'team', pricingModel: 'retainer', priceMin: 12000, priceMax: 22000, lifecycleStage: 'Accelerating', evidenceScore: 7.1, wtpScore: 6.8, activationMins: 40, readinessPct: 65, kpiCount: 2, redTeamStatus: 'not_run' },
    { id: 'pb-6', slug: 'family-risk-council', name: 'Family Risk Council', category: 'Governance', targetBuyer: 'Investment-focused family offices', corePain: 'Non-investment risk completely underbuilt', wealthTier: ['UHNW'], deliveryModel: 'orchestrated', pricingModel: 'quarterly', priceMin: 15000, priceMax: 35000, lifecycleStage: 'Accelerating', evidenceScore: 8.0, wtpScore: 7.5, activationMins: 55, readinessPct: 90, voiceforgeReady: true, visionAudioReady: true, dealDeskReady: true, trustPackReady: true, kpiCount: 4, redTeamStatus: 'passed', activeDeployments: 1 },
    { id: 'pb-7', slug: 'next-gen-studio', name: 'Next-Gen Studio', category: 'Governance', targetBuyer: 'Multigenerational dynastic wealth', corePain: 'Succession conflict, heir disengagement', wealthTier: ['UHNW'], deliveryModel: 'orchestrated', pricingModel: 'project', priceMin: 25000, priceMax: 60000, lifecycleStage: 'Emerging', evidenceScore: 7.5, wtpScore: 7.0, activationMins: 60, readinessPct: 55, kpiCount: 1, redTeamStatus: 'not_run' },
    { id: 'pb-8', slug: 'medical-navigation', name: 'Medical Navigation', category: 'Medical', targetBuyer: 'UHNW health-focused executives', corePain: 'Fragmented records, access delays, travel gaps', wealthTier: ['HNW'], deliveryModel: 'solo', pricingModel: 'retainer', priceMin: 8000, priceMax: 20000, lifecycleStage: 'Emerging', evidenceScore: 6.5, wtpScore: 6.2, activationMins: 25, readinessPct: 80, dealDeskReady: true, trustPackReady: true, kpiCount: 3, redTeamStatus: 'passed', complianceRisk: 'high' },
    { id: 'pb-9', slug: 'property-resilience', name: 'Property Resilience', category: 'Property', targetBuyer: 'High-value property owners', corePain: 'Insurance gaps, underinsurance, claims chaos', wealthTier: ['HNW'], deliveryModel: 'solo', pricingModel: 'subscription', priceMin: 10000, priceMax: 20000, lifecycleStage: 'Proven', evidenceScore: 7.2, wtpScore: 6.8, activationMins: 20, readinessPct: 92, dealDeskReady: true, trustPackReady: true, kpiCount: 4, redTeamStatus: 'passed', activeDeployments: 1 },
    { id: 'pb-10', slug: 'travel-reliability', name: 'Travel Reliability Desk', category: 'Travel', targetBuyer: 'Frequent multi-gen travelers', corePain: 'Disruption, rebooking authority, logistics gaps', wealthTier: ['HNW'], deliveryModel: 'solo', pricingModel: 'retainer', priceMin: 6000, priceMax: 15000, lifecycleStage: 'Accelerating', evidenceScore: 6.8, wtpScore: 6.5, activationMins: 22, readinessPct: 60, kpiCount: 2, redTeamStatus: 'failed' },
  ]
  for (const pb of playbooks) {
    await prisma.playbook.upsert({ where: { id: pb.id }, update: {}, create: pb })
  }
  console.log(`  ✓ Playbooks: ${playbooks.length} created`)

  console.log('\n✅ Seed complete — 3 clients, 8 problems, 5 offers, 6 deliverables, 8 tasks, 3 events, 2 risk items, 12 notifications, 10 playbooks')
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
