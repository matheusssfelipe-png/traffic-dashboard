export type ClientStatus = 'active' | 'paused' | 'review' | 'scaling' | 'new' | 'needs_creatives' | 'attention';

export type Platform = 'google_ads' | 'meta_ads' | 'both';

export interface CPLMetrics {
  prev30d: number;
  current30d: number;
  prev7d: number;
  current7d: number;
}

export interface SpendMetrics {
  prev30d: number;
  current30d: number;
  prev7d: number;
  current7d: number;
}

export interface PlatformData {
  cpl: CPLMetrics;
  spend?: SpendMetrics;
  winningCreative: WinningCreative;
  killCandidates: KillCandidate[];
  analysis: string;
}

export interface WinningCreative {
  name: string;
  period: string;
  details?: string;
  imageUrl?: string; // screenshot/print of creative
}

export interface KillCandidate {
  name: string;
  reason: string;
  imageUrl?: string; // screenshot/print of ad
}

export interface HistoryEntry {
  date: string; // YYYY-MM
  cpl30d: number;
  cpl7d: number;
}

export interface WeeklyReport {
  id: string;
  weekDate: string; // ISO date of the report
  clients: Client[];
  exportedAt: string;
}

export interface Client {
  id: string;
  name: string;
  offer: string;
  platform: Platform;
  currency: string;
  // Global CPL and Spend
  cpl: CPLMetrics;
  spend?: SpendMetrics;
  // Per-platform data (separate Meta and Google)
  metaData?: PlatformData;
  googleData?: PlatformData;
  // Global fields (for clients with single platform)
  winningCreative: WinningCreative;
  killCandidates: KillCandidate[];
  analysis: string;
  status: ClientStatus;
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// Calculated metrics (not stored, computed on the fly)
export interface CalculatedMetrics {
  delta30dPercent: number;
  delta7dPercent: number;
  trend30d: 'up' | 'down' | 'stable';
  trend7d: 'up' | 'down' | 'stable';
}

export interface DashboardSummary {
  totalClients: number;
  activeClients: number;
  avgCPL30d: number;
  totalSpend30d: number;
  bestPerformer: { name: string; delta: number } | null;
  worstPerformer: { name: string; delta: number } | null;
}
