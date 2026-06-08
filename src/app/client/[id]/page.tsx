'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store';
import { calculateMetrics, formatCurrency, formatPercent } from '@/data';
import { downloadReportAsPdf } from '@/export';
import KPICard from '@/components/KPICard';
import PerformanceChart from '@/components/PerformanceChart';
import StatusBadge from '@/components/StatusBadge';
import ClientForm from '@/components/ClientForm';
import Sidebar from '@/components/Sidebar';
import type { CPLMetrics, SpendMetrics, WinningCreative, KillCandidate } from '@/types';
import {
  ArrowLeft, Edit3, Presentation, DollarSign,
  TrendingDown, TrendingUp, Calendar, Sparkles,
  FileText, Target, Download, Skull, Monitor, Globe,
} from 'lucide-react';
import styles from './page.module.css';

type PlatformTab = 'overview' | 'meta' | 'google';

export default function ClientDetailPage() {
  const params = useParams();
  const { state } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformTab>('overview');

  const clientId = params.id as string;
  const client = state.clients.find(c => c.id === clientId);

  // ── Derived platform-specific data ─────────────────────────────
  const isBothPlatforms = client?.platform === 'both';

  const activeCpl: CPLMetrics | undefined = useMemo(() => {
    if (!client) return undefined;
    if (activeTab === 'meta' && client.metaData) return client.metaData.cpl;
    if (activeTab === 'google' && client.googleData) return client.googleData.cpl;
    return client.cpl;
  }, [client, activeTab]);

  const activeSpend: SpendMetrics | undefined = useMemo(() => {
    if (!client) return undefined;
    if (activeTab === 'meta' && client.metaData) return client.metaData.spend;
    if (activeTab === 'google' && client.googleData) return client.googleData.spend;
    return client.spend;
  }, [client, activeTab]);

  const activeCreative: WinningCreative | undefined = useMemo(() => {
    if (!client) return undefined;
    if (activeTab === 'meta' && client.metaData) return client.metaData.winningCreative;
    if (activeTab === 'google' && client.googleData) return client.googleData.winningCreative;
    return client.winningCreative;
  }, [client, activeTab]);

  const activeKillCandidates: KillCandidate[] = useMemo(() => {
    if (!client) return [];
    if (activeTab === 'meta' && client.metaData) return client.metaData.killCandidates;
    if (activeTab === 'google' && client.googleData) return client.googleData.killCandidates;
    return client.killCandidates;
  }, [client, activeTab]);

  const activeAnalysis: string = useMemo(() => {
    if (!client) return '';
    if (activeTab === 'meta' && client.metaData) return client.metaData.analysis;
    if (activeTab === 'google' && client.googleData) return client.googleData.analysis;
    return client.analysis;
  }, [client, activeTab]);

  // ── Loading / Not found ────────────────────────────────────────
  if (!state.isLoaded) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!client) {
    return (
      <div className={styles.notFound}>
        <h2>Client not found</h2>
        <Link href="/" className={styles.backLink}>← Back to Dashboard</Link>
      </div>
    );
  }

  // ── Computed metrics ───────────────────────────────────────────
  const metrics = calculateMetrics(activeCpl!);

  const calcDelta = (curr?: number, prev?: number) => {
    if (curr === undefined || prev === undefined || prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const platformLabel =
    client.platform === 'google_ads' ? 'Google Ads' :
    client.platform === 'meta_ads' ? 'Meta Ads' : 'Google + Meta';

  // ── Tab style helper ───────────────────────────────────────────
  const getTabClass = (tab: PlatformTab) => {
    if (activeTab !== tab) return styles.tab;
    if (tab === 'meta') return `${styles.tab} ${styles.tabMeta}`;
    if (tab === 'google') return `${styles.tab} ${styles.tabGoogle}`;
    return `${styles.tab} ${styles.tabActive}`;
  };

  return (
    <div className={styles.layout}>
      <Sidebar onAddClient={() => setShowAddForm(true)} />

      <main className={styles.main}>
        {/* ── Breadcrumb ────────────────────────────────────── */}
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{client.name}</span>
        </nav>

        {/* ── Header ───────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.clientAvatar}>
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className={styles.clientName}>{client.name}</h1>
              <div className={styles.clientMeta}>
                <span className={styles.offer}>{client.offer}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.platform}>{platformLabel}</span>
                <span className={styles.dot}>•</span>
                <StatusBadge status={client.status} />
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.editBtn} onClick={() => setShowForm(true)}>
              <Edit3 size={16} />
              Edit
            </button>
            <Link href={`/client/${client.id}/present`} className={styles.presentBtn}>
              <Presentation size={16} />
              Present
            </Link>
            <button
              className={styles.exportBtn}
              onClick={() => downloadReportAsPdf('dashboard-main')}
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </header>

        {/* ── Platform Tabs (only for 'both') ──────────────── */}
        {isBothPlatforms && (
          <div className={styles.tabsContainer}>
            <button
              className={getTabClass('overview')}
              onClick={() => setActiveTab('overview')}
            >
              <span className={styles.tabIcon}><Globe size={15} /></span>
              Overview
            </button>
            <button
              className={getTabClass('meta')}
              onClick={() => setActiveTab('meta')}
            >
              <span className={styles.tabIcon}><Monitor size={15} /></span>
              Meta Ads
            </button>
            <button
              className={getTabClass('google')}
              onClick={() => setActiveTab('google')}
            >
              <span className={styles.tabIcon}><Target size={15} /></span>
              Google Ads
            </button>
          </div>
        )}

        {/* ── KPI Cards ────────────────────────────────────── */}
        <section className={styles.kpiGrid}>
          <KPICard
            title="CPL 30 Days"
            value={formatCurrency(activeCpl!.current30d, client.currency)}
            delta={metrics.delta30dPercent}
            subtitle={`Previous: ${formatCurrency(activeCpl!.prev30d, client.currency)}`}
            icon={<Target size={20} />}
            delay={0}
          />
          <KPICard
            title="Spend 30 Days"
            value={formatCurrency(activeSpend?.current30d || 0, client.currency)}
            delta={calcDelta(activeSpend?.current30d, activeSpend?.prev30d)}
            subtitle={`Previous: ${formatCurrency(activeSpend?.prev30d || 0, client.currency)}`}
            icon={<DollarSign size={20} />}
            invertColors={true}
            delay={100}
          />
          <KPICard
            title="CPL 7 Days"
            value={formatCurrency(activeCpl!.current7d, client.currency)}
            delta={metrics.delta7dPercent}
            subtitle={`Previous: ${formatCurrency(activeCpl!.prev7d, client.currency)}`}
            icon={<Calendar size={20} />}
            delay={200}
          />
          <KPICard
            title="Spend 7 Days"
            value={formatCurrency(activeSpend?.current7d || 0, client.currency)}
            delta={calcDelta(activeSpend?.current7d, activeSpend?.prev7d)}
            subtitle={`Previous: ${formatCurrency(activeSpend?.prev7d || 0, client.currency)}`}
            icon={<DollarSign size={20} />}
            invertColors={true}
            delay={300}
          />
        </section>

        {/* ── Performance Chart ─────────────────────────────── */}
        <section className={styles.chartSection}>
          <PerformanceChart
            clients={state.clients}
            type="single"
            selectedClientId={client.id}
          />
        </section>

        {/* ── Winning Creative + Kill Candidates ───────────── */}
        <div className={styles.bottomGrid}>
          {/* Winning Creative */}
          <div className={styles.glassCard} style={{ animationDelay: '100ms' }}>
            <div className={styles.cardHeader}>
              <Sparkles size={18} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>🏆 Winning Creative — Last 30D</h3>
            </div>
            <div className={styles.creativeContent}>
              <p className={styles.creativeName}>{activeCreative?.name}</p>
              <span className={styles.creativePeriod}>
                <Target size={14} />
                {activeCreative?.period}
              </span>
              {activeCreative?.imageUrl && (
                <div className={styles.creativeImage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeCreative.imageUrl}
                    alt={activeCreative.name}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Kill Candidates */}
          <div className={styles.glassCard} style={{ animationDelay: '200ms' }}>
            <div className={styles.cardHeader}>
              <Skull size={18} className={styles.cardIcon} style={{ color: '#ef4444' }} />
              <h3 className={styles.cardTitle}>☠️ Kill Candidates</h3>
            </div>
            {activeKillCandidates.length > 0 ? (
              <div className={styles.killList}>
                {activeKillCandidates.map((candidate, i) => (
                  <div key={i} className={styles.killItem}>
                    <p className={styles.killName}>{candidate.name}</p>
                    <p className={styles.killReason}>{candidate.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.killEmpty}>
                <span className={styles.killEmptyIcon}>✅</span>
                No kill candidates — all ads performing well
              </div>
            )}
          </div>
        </div>

        {/* ── Analysis & Next Steps ────────────────────────── */}
        <div className={styles.fullWidthSection}>
          <div className={styles.glassCard} style={{ animationDelay: '300ms' }}>
            <div className={styles.cardHeader}>
              <FileText size={18} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Analysis & Next Steps</h3>
            </div>
            <div className={styles.analysisContent}>
              {activeAnalysis.split('\n').map((line, i) => (
                <p key={i} className={styles.analysisLine}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Modals ──────────────────────────────────────────── */}
      {showForm && <ClientForm client={client} onClose={() => setShowForm(false)} />}
      {showAddForm && <ClientForm onClose={() => setShowAddForm(false)} />}
    </div>
  );
}
