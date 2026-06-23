'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import { calculateMetrics, formatCurrency, formatPercent } from '@/data';
import StatusBadge from './StatusBadge';
import styles from './ClientTable.module.css';
import { ArrowUpDown, ExternalLink, TrendingDown, TrendingUp, Minus, Search, Monitor, Target, Globe } from 'lucide-react';
import { Client, ClientStatus } from '@/types';

type SortField = 'name' | 'cpl30d' | 'delta30d' | 'cpl7d' | 'delta7d' | 'status' | 'spend30d' | 'spend7d';
type SortDir = 'asc' | 'desc';

/* ── Sparkline SVG ─────────────────────────────────────────── */
function Sparkline({ data, color = '#84B2DB' }: { data: number[]; color?: string }) {
  if (data.length < 2) return <span className={styles.noKill}>—</span>;

  const width = 64;
  const height = 24;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  // Determine color based on trend (last vs first)
  const trendColor = data[data.length - 1] <= data[0] ? '#10b981' : '#ef4444';

  return (
    <svg width={width} height={height} className={styles.sparkline} aria-label="CPL trend">
      <polyline
        fill="none"
        stroke={trendColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(' ')}
      />
      {/* Dot on last point */}
      <circle
        cx={points[points.length - 1].split(',')[0]}
        cy={points[points.length - 1].split(',')[1]}
        r="2.5"
        fill={trendColor}
      />
    </svg>
  );
}

/* ── Platform Badge ────────────────────────────────────────── */
function PlatformBadge({ platform }: { platform: Client['platform'] }) {
  if (platform === 'meta_ads') {
    return (
      <span className={`${styles.platformBadge} ${styles.platformMeta}`} title="Meta Ads">
        <Monitor size={11} /> Meta
      </span>
    );
  }
  if (platform === 'google_ads') {
    return (
      <span className={`${styles.platformBadge} ${styles.platformGoogle}`} title="Google Ads">
        <Target size={11} /> Google
      </span>
    );
  }
  return (
    <span className={`${styles.platformBadge} ${styles.platformBoth}`} title="Meta + Google">
      <Globe size={11} /> Both
    </span>
  );
}

/* ── Trend Icon ────────────────────────────────────────────── */
const TrendIcon = ({ value }: { value: number }) => {
  if (Math.abs(value) < 0.5) return <Minus size={14} className={styles.trendStable} />;
  if (value < 0) return <TrendingDown size={14} className={styles.trendGood} />;
  return <TrendingUp size={14} className={styles.trendBad} />;
};

/* ── Delta Cell ────────────────────────────────────────────── */
const DeltaCell = ({ value }: { value: number }) => {
  const cls = Math.abs(value) < 0.5
    ? styles.deltaNeutral
    : value < 0
      ? styles.deltaGood
      : styles.deltaBad;

  return (
    <span className={`${styles.deltaValue} ${cls}`}>
      <TrendIcon value={value} />
      {formatPercent(value)}
    </span>
  );
};

/* ── Sort Header ───────────────────────────────────────────── */
const SortHeader = ({ field, sortField, sortDir, onSort, children }: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) => (
  <th className={styles.th} onClick={() => onSort(field)}>
    <span className={styles.thContent}>
      {children}
      <ArrowUpDown size={12} className={`${styles.sortIcon} ${sortField === field ? styles.sortActive : ''}`} />
    </span>
  </th>
);

export default function ClientTable() {
  const { state } = useStore();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let result = state.clients;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        c => c.name.toLowerCase().includes(q) || c.offer.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(c => c.status === filterStatus);
    }

    return result;
  }, [state.clients, searchQuery, filterStatus]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const metricsA = calculateMetrics(a.cpl);
      const metricsB = calculateMetrics(b.cpl);
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'cpl30d':
          cmp = a.cpl.current30d - b.cpl.current30d;
          break;
        case 'delta30d':
          cmp = metricsA.delta30dPercent - metricsB.delta30dPercent;
          break;
        case 'cpl7d':
          cmp = a.cpl.current7d - b.cpl.current7d;
          break;
        case 'delta7d':
          cmp = metricsA.delta7dPercent - metricsB.delta7dPercent;
          break;
        case 'spend30d':
          cmp = (a.spend?.current30d || 0) - (b.spend?.current30d || 0);
          break;
        case 'spend7d':
          cmp = (a.spend?.current7d || 0) - (b.spend?.current7d || 0);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  if (!state.isLoaded) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <h2 className={styles.tableTitle}>Client Performance</h2>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search clients..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search clients"
          />
        </div>
        <div className={styles.filters}>
          {([
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'scaling', label: 'Scaling' },
            { key: 'review', label: 'Review' },
            { key: 'attention', label: 'Attention' },
            { key: 'needs_creatives', label: 'Needs Creatives' },
            { key: 'paused', label: 'Paused' },
            { key: 'new', label: 'New' },
          ] as const).map(s => (
            <button
              key={s.key}
              className={`${styles.filterBtn} ${filterStatus === s.key ? styles.filterActive : ''}`}
              onClick={() => setFilterStatus(s.key as ClientStatus | 'all')}
            >
              {s.label}
              <span className={styles.count}>
                {s.key === 'all'
                  ? state.clients.length
                  : state.clients.filter(c => c.status === s.key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <SortHeader field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Client</SortHeader>
              <SortHeader field="spend30d" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Spend 30D</SortHeader>
              <SortHeader field="spend7d" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Spend 7D</SortHeader>
              <SortHeader field="cpl30d" sortField={sortField} sortDir={sortDir} onSort={handleSort}>CPL 30D</SortHeader>
              <SortHeader field="delta30d" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Δ 30D</SortHeader>
              <SortHeader field="cpl7d" sortField={sortField} sortDir={sortDir} onSort={handleSort}>CPL 7D</SortHeader>
              <SortHeader field="delta7d" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Δ 7D</SortHeader>
              <th className={styles.th}>Trend</th>
              <th className={styles.th}>☠️ Kill</th>
              <SortHeader field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Status</SortHeader>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((client, idx) => {
              const metrics = calculateMetrics(client.cpl);
              const sparkData = client.history.map(h => h.cpl30d);
              return (
                <tr
                  key={client.id}
                  className={styles.row}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className={styles.td}>
                    <div className={styles.clientName}>
                      <div className={styles.avatar}>
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <span className={styles.name}>{client.name}</span>
                        <div className={styles.offerRow}>
                          <span className={styles.offer}>{client.offer}</span>
                          <PlatformBadge platform={client.platform} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.cplCell}>
                      <span className={styles.cplCurrent}>
                        {formatCurrency(client.spend?.current30d || 0, client.currency)}
                      </span>
                      <span className={styles.cplPrev}>
                        prev: {formatCurrency(client.spend?.prev30d || 0, client.currency)}
                      </span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.cplCell}>
                      <span className={styles.cplCurrent}>
                        {formatCurrency(client.spend?.current7d || 0, client.currency)}
                      </span>
                      <span className={styles.cplPrev}>
                        prev: {formatCurrency(client.spend?.prev7d || 0, client.currency)}
                      </span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.cplCell}>
                      <span className={styles.cplCurrent}>
                        {formatCurrency(client.cpl.current30d, client.currency)}
                      </span>
                      <span className={styles.cplPrev}>
                        prev: {formatCurrency(client.cpl.prev30d, client.currency)}
                      </span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <DeltaCell value={metrics.delta30dPercent} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.cplCell}>
                      <span className={styles.cplCurrent}>
                        {formatCurrency(client.cpl.current7d, client.currency)}
                      </span>
                      <span className={styles.cplPrev}>
                        prev: {formatCurrency(client.cpl.prev7d, client.currency)}
                      </span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <DeltaCell value={metrics.delta7dPercent} />
                  </td>
                  <td className={styles.td}>
                    <Sparkline data={sparkData} />
                  </td>
                  <td className={styles.td}>
                    {(client.killCandidates?.length || 0) > 0 ? (
                      <span className={styles.killBadge}>
                        {client.killCandidates.length}
                      </span>
                    ) : (
                      <span className={styles.noKill}>—</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    <StatusBadge status={client.status} />
                  </td>
                  <td className={styles.td}>
                    <Link href={`/client/${client.id}`} className={styles.viewLink}>
                      <ExternalLink size={16} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔍</span>
          <span className={styles.emptyTitle}>
            {searchQuery ? 'No clients match your search' : 'No clients match the selected filter'}
          </span>
          <span className={styles.emptySubtitle}>
            {searchQuery ? `Try a different search term` : 'Select a different status filter'}
          </span>
        </div>
      )}
    </div>
  );
}
