/**
 * Shared rules for the client handlers.
 *
 * P-20. This exists because Next.js route modules may only export HTTP
 * methods and a fixed set of config keys — exporting a constant from
 * `route.ts` is a type error — and `/api/clients/at-risk` and
 * `/api/clients/kpis` must agree on what "at risk" means. Two copies of that
 * rule drifting apart is how a screen ends up reading "1 at risk" above a
 * list of three.
 *
 * The leading underscore keeps this out of the App Router's route table; only
 * `route.ts` defines a route.
 */

/** Below this health score, a client counts as at risk. */
export const HEALTH_FLOOR = 65

/** Silence longer than this counts as at risk. */
export const STALE_CONTACT_DAYS = 30

/** A renewal closer than this, with a declining trend, counts as at risk. */
export const RENEWAL_WINDOW_DAYS = 45

export type HealthTrend = 'improving' | 'declining' | 'stable' | null

/**
 * `Client.healthTrend` is a signed integer of points moved. The UI reads a
 * word. Both are returned by the handlers — the label for display, the points
 * for anything that needs the magnitude — so neither reader has to infer the
 * other.
 */
export function trendLabel(trend: number | null): HealthTrend {
  if (trend === null) return null
  if (trend > 0) return 'improving'
  if (trend < 0) return 'declining'
  return 'stable'
}

export function daysSince(date: Date | null): number | null {
  if (!date) return null
  return Math.floor((Date.now() - date.getTime()) / 86_400_000)
}

export function daysUntil(date: Date | null): number | null {
  if (!date) return null
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000)
}
