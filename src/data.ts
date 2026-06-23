import { Client, CalculatedMetrics, DashboardSummary } from './types';

export const sampleClients: Client[] = [
  {
    id: '1',
    name: 'Oddes',
    offer: 'Installatörer',
    platform: 'meta_ads',
    currency: 'kr',
    cpl: { prev30d: 211.81, current30d: 205.13, prev7d: 204.55, current7d: 206.34 },
    spend: { prev30d: 15000, current30d: 16500, prev7d: 3500, current7d: 4000 },
    winningCreative: { name: '26/4/15 - IMG - INSTALLATÖRER - INGET BATTERI - FRÅN 18 000', period: 'Last 30D' },
    killCandidates: [
      { name: 'IMG - Installatörer - Old Hook V1', reason: 'CTR below 0.5% for 14 days' },
    ],
    analysis: 'The image creatives performed well in this account, however we don\'t have many new pieces running. We can produce at least 2 or 3 new image creatives and launch.',
    status: 'active',
    history: [
      { date: '2026-02', cpl30d: 225.50, cpl7d: 220.30 },
      { date: '2026-03', cpl30d: 218.40, cpl7d: 215.60 },
      { date: '2026-04', cpl30d: 211.81, cpl7d: 204.55 },
      { date: '2026-05', cpl30d: 205.13, cpl7d: 206.34 },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-05-30',
  },
  {
    id: '2',
    name: 'Obo Hus',
    offer: 'Design',
    platform: 'meta_ads',
    currency: 'kr',
    cpl: { prev30d: 77.91, current30d: 87.87, prev7d: 87.13, current7d: 110.62 },
    spend: { prev30d: 8000, current30d: 12000, prev7d: 2000, current7d: 3500 },
    winningCreative: { name: '50 kvm | May Design #5', period: 'Last 30D' },
    killCandidates: [
      { name: 'Carousel - Hus Design - Old', reason: 'CPL 3x above average' },
    ],
    analysis: 'Scaling Adset (Learning Limited and 3x CPL). This ad set has increased the cost per lead in recent days.',
    status: 'scaling',
    history: [
      { date: '2026-02', cpl30d: 65.20, cpl7d: 62.40 },
      { date: '2026-03', cpl30d: 70.15, cpl7d: 68.90 },
      { date: '2026-04', cpl30d: 77.91, cpl7d: 87.13 },
      { date: '2026-05', cpl30d: 87.87, cpl7d: 110.62 },
    ],
    createdAt: '2026-01-20',
    updatedAt: '2026-05-30',
  },
  {
    id: '3',
    name: 'Capillos',
    offer: 'Hair Treatment',
    platform: 'both',
    currency: 'SEK',
    cpl: { prev30d: 253, current30d: 308, prev7d: 447, current7d: 263 },
    spend: { prev30d: 25000, current30d: 28000, prev7d: 6000, current7d: 7000 },
    metaData: {
      cpl: { prev30d: 220, current30d: 270, prev7d: 400, current7d: 230 },
      spend: { prev30d: 15000, current30d: 16000, prev7d: 3500, current7d: 4000 },
      winningCreative: { name: '[50%] Design 01 (Apr/26) | PT01-05 | H01-04', period: 'Last 30D' },
      killCandidates: [
        { name: 'Static - Hair Before/After V2', reason: 'No conversions in 7 days' },
      ],
      analysis: 'Meta side: new creatives launched this week, monitoring performance.',
    },
    googleData: {
      cpl: { prev30d: 290, current30d: 350, prev7d: 500, current7d: 300 },
      spend: { prev30d: 10000, current30d: 12000, prev7d: 2500, current7d: 3000 },
      winningCreative: { name: 'Search - Hair Treatment Exact Match', period: 'Last 30D' },
      killCandidates: [
        { name: 'Display - Generic Hair Ads', reason: 'High spend, zero conversions' },
      ],
      analysis: 'Google side: Search campaigns performing, Display needs review.',
    },
    winningCreative: { name: '[50%] Design 01 (Apr/26) | PT01-05 | H01-04', period: 'Last 30D' },
    killCandidates: [
      { name: 'Static - Hair Before/After V2', reason: 'No conversions in 7 days' },
      { name: 'Display - Generic Hair Ads', reason: 'High spend, zero conversions' },
    ],
    analysis: 'This week we launched new creatives, we need to see how they perform. Review the document on customer service automation to see if we can make adjustments and improve AI conversion.\n\nLanding Page: The page background is white and the letters are too, making it a little difficult to read. New exam campaign launched (paused) for review.',
    status: 'attention',
    history: [
      { date: '2026-02', cpl30d: 195.00, cpl7d: 180.00 },
      { date: '2026-03', cpl30d: 220.00, cpl7d: 310.00 },
      { date: '2026-04', cpl30d: 253.00, cpl7d: 447.00 },
      { date: '2026-05', cpl30d: 308.00, cpl7d: 263.00 },
    ],
    createdAt: '2026-02-01',
    updatedAt: '2026-05-30',
  },
  {
    id: '4',
    name: 'Kumla Dental',
    offer: 'Dental',
    platform: 'both',
    currency: 'SEK',
    cpl: { prev30d: 180, current30d: 165, prev7d: 195, current7d: 155 },
    spend: { prev30d: 18000, current30d: 17500, prev7d: 4200, current7d: 4000 },
    metaData: {
      cpl: { prev30d: 160, current30d: 145, prev7d: 170, current7d: 130 },
      spend: { prev30d: 8000, current30d: 7500, prev7d: 1800, current7d: 1500 },
      winningCreative: { name: 'Video - Dental Exam Testimonial', period: 'Last 30D' },
      killCandidates: [],
      analysis: 'Meta performing well. Video creatives outperforming images.',
    },
    googleData: {
      cpl: { prev30d: 200, current30d: 185, prev7d: 220, current7d: 180 },
      spend: { prev30d: 10000, current30d: 10000, prev7d: 2400, current7d: 2500 },
      winningCreative: { name: 'Search - Tandläkare Kumla', period: 'Last 30D' },
      killCandidates: [
        { name: 'Search - Generic Dental Broad', reason: 'High CPC, low quality score' },
      ],
      analysis: 'Google Search trending down nicely. Consider increasing budget.',
    },
    winningCreative: { name: 'Video - Dental Exam Testimonial', period: 'Last 30D' },
    killCandidates: [
      { name: 'Search - Generic Dental Broad', reason: 'High CPC, low quality score' },
    ],
    analysis: 'Landing Page: The page background is white and the letters are too, making it a little difficult to read. New exam campaign launched (paused) for review.\n\nVideo creatives doing well on Meta, consider launching more.',
    status: 'active',
    history: [
      { date: '2026-02', cpl30d: 210.00, cpl7d: 220.00 },
      { date: '2026-03', cpl30d: 195.00, cpl7d: 200.00 },
      { date: '2026-04', cpl30d: 180.00, cpl7d: 195.00 },
      { date: '2026-05', cpl30d: 165.00, cpl7d: 155.00 },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-05-30',
  },
  {
    id: '5',
    name: 'Naprapatmästarna',
    offer: 'Naprapat',
    platform: 'meta_ads',
    currency: 'SEK',
    cpl: { prev30d: 45, current30d: 42, prev7d: 33, current7d: 43 },
    spend: { prev30d: 4500, current30d: 5000, prev7d: 1000, current7d: 1200 },
    winningCreative: { name: 'Video 02 Apr26 | PT01-05 | H01-05', period: 'Last 30D' },
    killCandidates: [],
    analysis: 'I know the problem here isn\'t leads, but conversion. We can talk to the client, create a special offer in June, and align with the sales team to try to win this client back.\n\nWe launched new creatives in May; I\'m waiting for more data so I can develop new ideas and angles.',
    status: 'active',
    history: [
      { date: '2026-02', cpl30d: 52.00, cpl7d: 48.00 },
      { date: '2026-03', cpl30d: 48.00, cpl7d: 42.00 },
      { date: '2026-04', cpl30d: 45.00, cpl7d: 33.00 },
      { date: '2026-05', cpl30d: 42.00, cpl7d: 43.00 },
    ],
    createdAt: '2026-03-01',
    updatedAt: '2026-05-30',
  },
  {
    id: '6',
    name: 'Nordiska',
    offer: 'Services',
    platform: 'meta_ads',
    currency: 'SEK',
    cpl: { prev30d: 135, current30d: 120, prev7d: 140, current7d: 115 },
    spend: { prev30d: 12000, current30d: 15000, prev7d: 2800, current7d: 3500 },
    winningCreative: { name: 'UGC Video - Customer Review May', period: 'Last 30D' },
    killCandidates: [
      { name: 'Static - Old Brand Campaign', reason: 'Low engagement, high CPL' },
    ],
    analysis: 'Good progress this month. CPL trending down consistently. Need to test more angles for the summer campaign.',
    status: 'active',
    history: [
      { date: '2026-02', cpl30d: 165.00, cpl7d: 170.00 },
      { date: '2026-03', cpl30d: 150.00, cpl7d: 155.00 },
      { date: '2026-04', cpl30d: 135.00, cpl7d: 140.00 },
      { date: '2026-05', cpl30d: 120.00, cpl7d: 115.00 },
    ],
    createdAt: '2026-02-15',
    updatedAt: '2026-05-30',
  },
  {
    id: '7',
    name: 'Valdemarsviks tandläkare',
    offer: 'Dental',
    platform: 'google_ads',
    currency: 'SEK',
    cpl: { prev30d: 310, current30d: 280, prev7d: 290, current7d: 260 },
    spend: { prev30d: 6200, current30d: 8400, prev7d: 1400, current7d: 2000 },
    winningCreative: { name: 'Search - Tandläkare Valdemarsvik Exact', period: 'Last 30D' },
    killCandidates: [
      { name: 'Search - Broad Match Dental', reason: 'Irrelevant search terms, wasting budget' },
    ],
    analysis: 'Search campaigns performing well. Need to add negative keywords to reduce wasted spend. Consider launching a new campaign for implant services.',
    status: 'needs_creatives',
    history: [
      { date: '2026-02', cpl30d: 380.00, cpl7d: 390.00 },
      { date: '2026-03', cpl30d: 350.00, cpl7d: 340.00 },
      { date: '2026-04', cpl30d: 310.00, cpl7d: 290.00 },
      { date: '2026-05', cpl30d: 280.00, cpl7d: 260.00 },
    ],
    createdAt: '2026-03-10',
    updatedAt: '2026-05-30',
  },
];

// === CALCULATION HELPERS ===

export function calculateMetrics(cpl: {
  prev30d: number;
  current30d: number;
  prev7d: number;
  current7d: number;
}): CalculatedMetrics {
  const delta30d =
    cpl.prev30d !== 0
      ? ((cpl.current30d - cpl.prev30d) / cpl.prev30d) * 100
      : 0;
  const delta7d =
    cpl.prev7d !== 0
      ? ((cpl.current7d - cpl.prev7d) / cpl.prev7d) * 100
      : 0;

  const getTrend = (delta: number): 'up' | 'down' | 'stable' => {
    if (Math.abs(delta) < 0.5) return 'stable';
    return delta > 0 ? 'up' : 'down';
  };

  return {
    delta30dPercent: Math.round(delta30d * 100) / 100,
    delta7dPercent: Math.round(delta7d * 100) / 100,
    trend30d: getTrend(delta30d),
    trend7d: getTrend(delta7d),
  };
}

export function getDashboardSummary(clients: Client[]): DashboardSummary {
  const activeClients = clients.filter((c) => c.status !== 'paused');
  // Only consider non-paused clients for best/worst
  const activeMetrics = activeClients.map((c) => ({
    name: c.name,
    ...calculateMetrics(c.cpl),
  }));

  // Use 7D data for best/worst performer
  const sorted = [...activeMetrics].sort(
    (a, b) => a.delta7dPercent - b.delta7dPercent
  );

  const totalSpend = clients.reduce((sum, c) => sum + (c.spend?.current30d || 0), 0);

  return {
    totalClients: clients.length,
    activeClients: activeClients.length,
    avgCPL30d:
      clients.length > 0
        ? Math.round(
            (clients.reduce((sum, c) => sum + c.cpl.current30d, 0) /
              clients.length) *
              100
          ) / 100
        : 0,
    totalSpend30d: totalSpend,
    bestPerformer:
      sorted.length > 0
        ? { name: sorted[0].name, delta: sorted[0].delta7dPercent }
        : null,
    worstPerformer:
      sorted.length > 0
        ? {
            name: sorted[sorted.length - 1].name,
            delta: sorted[sorted.length - 1].delta7dPercent,
          }
        : null,
  };
}

export function formatCurrency(value: number, currency: string): string {
  return `${currency} ${value.toLocaleString('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// === EXPORT HELPERS ===

export function exportWeeklyReport(clients: Client[]): string {
  const report = {
    id: generateId(),
    weekDate: new Date().toISOString().split('T')[0],
    exportedAt: new Date().toISOString(),
    clients: clients,
  };
  return JSON.stringify(report, null, 2);
}

export function downloadReport(clients: Client[]) {
  const data = exportWeeklyReport(clients);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const weekDate = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `weekly-report-${weekDate}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
