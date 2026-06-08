'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import { calculateMetrics, formatCurrency, formatPercent } from '@/data';
import StatusBadge from './StatusBadge';
import styles from './ClientTable.module.css';
import { ArrowUpDown, ExternalLink, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Client, ClientStatus } from '@/types';

type SortField = 'name' | 'cpl30d' | 'delta30d' | 'cpl7d' | 'delta7d' | 'status' | 'spend30d' | 'spend7d';
type SortDir = 'asc' | 'desc';

export default function ClientTable() {
  const { state } = useStore();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = state.clients.filter(
    c => filterStatus === 'all' || c.status === filterStatus
  );

  const sorted = [...filtered].sort((a, b) => {
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

  const TrendIcon = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.5) return <Minus size={14} className={styles.trendStable} />;
    // For CPL: down = good (green), up = bad (red)
    if (value < 0) return <TrendingDown size={14} className={styles.trendGood} />;
    return <TrendingUp size={14} className={styles.trendBad} />;
  };

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

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th className={styles.th} onClick={() => handleSort(field)}>
      <span className={styles.thContent}>
        {children}
        <ArrowUpDown size={12} className={`${styles.sortIcon} ${sortField === field ? styles.sortActive : ''}`} />
      </span>
    </th>
  );

  if (!state.isLoaded) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <h2 className={styles.tableTitle}>Client Performance</h2>
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
              <SortHeader field="name">Client</SortHeader>
              <SortHeader field="spend30d">Spend 30D</SortHeader>
              <SortHeader field="spend7d">Spend 7D</SortHeader>
              <SortHeader field="cpl30d">CPL 30D</SortHeader>
              <SortHeader field="delta30d">Δ 30D</SortHeader>
              <SortHeader field="cpl7d">CPL 7D</SortHeader>
              <SortHeader field="delta7d">Δ 7D</SortHeader>
              <th className={styles.th}>☠️ Kill</th>
              <SortHeader field="status">Status</SortHeader>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((client, idx) => {
              const metrics = calculateMetrics(client.cpl);
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
                        <span className={styles.offer}>{client.offer}</span>
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
          No clients match the selected filter.
        </div>
      )}
    </div>
  );
}
