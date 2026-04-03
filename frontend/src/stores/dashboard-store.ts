import { create } from 'zustand';
import api from '@/lib/api';

interface NextAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_url?: string;
  due_at?: string;
}

interface DashboardMetrics {
  total_clients: number;
  active_offers: number;
  problems_discovered: number;
  revenue_mtd: number;
  pipeline_value: number;
}

interface AgentStatus {
  name: string;
  status: 'running' | 'idle' | 'error';
  last_run: string;
  next_run?: string;
}

interface DailyBrief {
  summary: string;
  highlights: string[];
  alerts: string[];
  generated_at: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  estimated_value: number;
  confidence: number;
  source: string;
}

interface DashboardStore {
  nextAction: NextAction | null;
  metrics: DashboardMetrics | null;
  agentStatus: AgentStatus[];
  dailyBrief: DailyBrief | null;
  opportunities: Opportunity[];
  isLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  nextAction: null,
  metrics: null,
  agentStatus: [],
  dailyBrief: null,
  opportunities: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const [
        nextActionRes,
        metricsRes,
        agentStatusRes,
        dailyBriefRes,
        opportunitiesRes,
      ] = await Promise.allSettled([
        api.get<NextAction>('/api/v1/command/next-action'),
        api.get<DashboardMetrics>('/api/v1/command/metrics'),
        api.get<AgentStatus[]>('/api/v1/command/agent-status'),
        api.get<DailyBrief>('/api/v1/command/daily-brief'),
        api.get<Opportunity[]>('/api/v1/command/opportunities'),
      ]);

      set({
        nextAction:
          nextActionRes.status === 'fulfilled'
            ? nextActionRes.value.data
            : null,
        metrics:
          metricsRes.status === 'fulfilled' ? metricsRes.value.data : null,
        agentStatus:
          agentStatusRes.status === 'fulfilled'
            ? agentStatusRes.value.data
            : [],
        dailyBrief:
          dailyBriefRes.status === 'fulfilled'
            ? dailyBriefRes.value.data
            : null,
        opportunities:
          opportunitiesRes.status === 'fulfilled'
            ? opportunitiesRes.value.data
            : [],
      });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch dashboard';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
