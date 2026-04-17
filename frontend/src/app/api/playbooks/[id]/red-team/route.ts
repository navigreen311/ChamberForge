import { NextRequest, NextResponse } from 'next/server';

type Severity = 'critical' | 'warning';

interface AuditIssue {
  category: string;
  severity: Severity;
  description: string;
  recommendation: string;
}

interface AuditResult {
  passed: boolean;
  score: number;
  issues: AuditIssue[];
  ranAt: string;
  playbookId: string;
}

// Simulate a red-team audit across 5 dimensions:
// 1. Compliance risk
// 2. Delivery fragility
// 3. Margin stress
// 4. Competitive vulnerability
// 5. Reputation risk
const DIMENSION_PROFILES: Record<
  string,
  { category: string; severity: Severity; description: string; recommendation: string }
> = {
  compliance: {
    category: 'Compliance risk',
    severity: 'critical',
    description:
      'Scope references client data processing and regulated activities without a named license holder or jurisdiction matrix. In 2 of the 4 target markets (Singapore, UAE) this activity may require a licensed intermediary.',
    recommendation:
      'Add a jurisdiction matrix to the Trust Pack and either secure a partnered license holder or narrow scope in those markets before activation.',
  },
  delivery: {
    category: 'Delivery fragility',
    severity: 'warning',
    description:
      'Delivery assumes a single senior operator plus two partner vendors, none of whom are contractually backstopped. Illness, vendor failure, or partner churn would create a 72-hour SLA gap.',
    recommendation:
      'Secure LOIs from one backup operator and one alternate vendor per critical deliverable. Add failover language to the SLA.',
  },
  margin: {
    category: 'Margin stress',
    severity: 'warning',
    description:
      'At the low end of the price band the playbook is only gross-margin positive up to ~4 clients due to fixed tool + partner costs. The 5th client triggers unit-margin compression below 45%.',
    recommendation:
      'Either lift the floor price by 12-15%, renegotiate per-seat tool costs, or cap the cohort at 4 clients until a new capacity tier is built.',
  },
  competitive: {
    category: 'Competitive vulnerability',
    severity: 'critical',
    description:
      'Two well-capitalized incumbents could replicate 80% of this stack at a 30-40% discount within 6 months. The defensible moat (proprietary evidence chain, named operator relationships) is not visible in the buyer-facing assets.',
    recommendation:
      'Lead the value stack and pitch deck with the proprietary evidence chain and named-operator relationships. Remove commoditized deliverables from the headline scope.',
  },
  reputation: {
    category: 'Reputation risk',
    severity: 'warning',
    description:
      'Outcome language in the deal desk copy implies guaranteed results ("ensure", "eliminate"). A single public failure — especially a household-security incident — would be picked up by trade press and damage other client relationships.',
    recommendation:
      'Replace guarantee language with best-effort commitments, add explicit disclaimers, and prepare a 1-page incident comms playbook for the deal desk.',
  },
};

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  // Support both sync (legacy) and async (Next 15+) params shapes.
  const resolved = await Promise.resolve(params as { id: string } | Promise<{ id: string }>);
  const id = resolved.id;

  // Light delay so the UI spinner is visible.
  await new Promise(r => setTimeout(r, 1800));

  const seed = hashSlug(id);
  const dimensions = Object.keys(DIMENSION_PROFILES);

  // Deterministic per-slug: choose which dimensions fail this run.
  const issues: AuditIssue[] = [];
  dimensions.forEach((dim, i) => {
    // Fail a dimension when its parity bit is set in the slug hash.
    const fails = ((seed >> i) & 1) === 1;
    if (fails) issues.push(DIMENSION_PROFILES[dim]);
  });

  // Score: start at 100, subtract 18 per critical and 10 per warning.
  const score = Math.max(
    0,
    100 -
      issues.reduce(
        (acc, x) => acc + (x.severity === 'critical' ? 18 : 10),
        0
      )
  );

  // Pass threshold: no critical issues and score ≥ 75.
  const hasCritical = issues.some(i => i.severity === 'critical');
  const passed = !hasCritical && score >= 75;

  const result: AuditResult = {
    playbookId: id,
    passed,
    score,
    issues,
    ranAt: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
