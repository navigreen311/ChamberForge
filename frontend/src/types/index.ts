export type ConsentStatus = 'active' | 'expired' | 'expiring' | 'pending' | 'revoked';

export interface ConsentRecord {
  id: string;
  client: string;
  client_id: string;
  type: string;
  jurisdiction: string;
  granted: string | null;
  expires: string | null;
  status: ConsentStatus;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  body?: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface Evidence {
  id: string;
  source_url: string;
  source_type: string;
  publication_date: string;
  credibility_score: number;
  recency_decay_score: number;
  extracted_claims: Array<{ text: string; confidence: number; [key: string]: unknown }>;
  contradiction_flags: Array<{ claim_a: string; claim_b: string; explanation: string }>;
  problem_id: string | null;
  workspace_id: string;
  [key: string]: unknown;
}

export interface Offer {
  id: string;
  name: string;
  status: string;
  mrr: number;
  clients: number;
  description?: string;
  [key: string]: unknown;
}

export interface PricingModel {
  id: string;
  offer_id: string;
  model_type: string;
  base_price: number;
  tiers?: Array<{ name: string; price: number; features: string[] }>;
  [key: string]: unknown;
}

export interface Playbook {
  slug: string;
  name: string;
  desc?: string;
  description?: string;
  category: string;
  uses: number;
  steps: number;
  status: string;
  [key: string]: unknown;
}

export interface Problem {
  id: string;
  title: string;
  category: string;
  lifecycle: string;
  urgency: string;
  score: number;
  evidence_count?: number;
  evidence?: number;
  description?: string;
  desc?: string;
  [key: string]: unknown;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  status: 'active' | 'inactive' | 'prospect' | 'churned';
  wealth_tier?: string;
  workspace_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  workspace_id: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  workspace_name: string;
}
