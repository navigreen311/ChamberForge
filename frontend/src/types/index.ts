// ─── Core Entities ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'advisor' | 'analyst' | 'viewer';
  workspace_id: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'professional' | 'enterprise';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// ─── Discover Layer ──────────────────────────────────────────────────────────

export interface Problem {
  id: string;
  title: string;
  description: string;
  wealth_tier: 'HNW' | 'UHNW' | 'Institutional';
  pain_category: string;
  urgency_score: number;
  lifecycle_stage: string;
  source_evidence_ids: string[];
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  problem_id: string;
  source_url: string;
  source_type: 'academic' | 'regulatory' | 'market_data' | 'interview' | 'survey';
  credibility_score: number;
  summary: string;
  raw_content?: string;
  workspace_id: string;
  created_at: string;
}

export interface Trend {
  id: string;
  title: string;
  category: string;
  momentum_score: number;
  related_problem_ids: string[];
  workspace_id: string;
  created_at: string;
}

// ─── Build Layer ─────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  name: string;
  description: string;
  value_stack: ValueStackItem[];
  pricing_model: PricingModel;
  status: 'draft' | 'active' | 'archived';
  target_buyer: string;
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ValueStackItem {
  id: string;
  label: string;
  description: string;
  perceived_value: number;
  delivery_cost: number;
  order: number;
}

export interface PricingModel {
  type: 'fixed' | 'tiered' | 'value_based' | 'retainer';
  base_price: number;
  currency: string;
  tiers?: PricingTier[];
}

export interface PricingTier {
  label: string;
  min_value: number;
  max_value: number;
  price: number;
}

export interface Playbook {
  id: string;
  slug: string;
  name: string;
  description: string;
  target_buyer: string;
  price_range_min: number;
  price_range_max: number;
  core_pain: string;
  steps: PlaybookStep[];
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface PlaybookStep {
  id: string;
  order: number;
  title: string;
  description: string;
  action_type: string;
  template_id?: string;
}

// ─── Client & Lifecycle ──────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  health_score: number;
  status: 'prospect' | 'active' | 'at_risk' | 'churned' | 'alumni';
  wealth_tier: string;
  lifecycle_stage: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdGraph {
  id: string;
  client_id: string;
  members: HouseholdMember[];
  relationships: HouseholdRelationship[];
  total_aum: number;
  workspace_id: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  role: string;
  age?: number;
  net_worth_estimate?: number;
}

export interface HouseholdRelationship {
  from_member_id: string;
  to_member_id: string;
  relationship_type: string;
}

// ─── Notifications & Audit ───────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'action_required';
  title: string;
  body: string;
  is_read: boolean;
  action_url?: string;
  user_id: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user_name: string;
  details: Record<string, unknown>;
  ip_address?: string;
  workspace_id: string;
  created_at: string;
}

// ─── Compliance ──────────────────────────────────────────────────────────────

export interface ConsentRecord {
  id: string;
  client_id: string;
  consent_type: string;
  granted: boolean;
  granted_at?: string;
  revoked_at?: string;
  workspace_id: string;
}

export interface QualityCheck {
  id: string;
  entity_type: string;
  entity_id: string;
  check_type: string;
  passed: boolean;
  score: number;
  details: Record<string, unknown>;
  workspace_id: string;
  created_at: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  workspace_name?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
  errors?: Record<string, string[]>;
}
