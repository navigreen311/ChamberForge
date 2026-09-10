// P-11 removed useAuthStore. It was a second, unused auth path that kept the
// access token in localStorage and mirrored it into a non-httpOnly cookie -
// the exact vulnerability this package closed in useAuth. Nothing imported
// it, so it was a liability with no offsetting benefit. Session state comes
// from useAuth()/useSession().
export { useProblemsStore } from './problems-store';
export { useEvidenceStore } from './evidence-store';
export { useOffersStore } from './offers-store';
export { useClientsStore } from './clients-store';
export { usePlaybooksStore } from './playbooks-store';
export { useDashboardStore } from './dashboard-store';
export { useNotificationsStore } from './notifications-store';
export { useBillingStore } from './billing-store';
