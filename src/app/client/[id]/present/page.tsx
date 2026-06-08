'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store';
import { calculateMetrics, formatCurrency, formatPercent } from '@/data';
import PerformanceChart from '@/components/PerformanceChart';
import {
  ArrowLeft, Maximize, Minimize, DollarSign, Calendar,
  TrendingDown, TrendingUp, Minus, Sparkles, Target,
  Globe, Monitor
} from 'lucide-react';
import type { CPLMetrics, SpendMetrics, WinningCreative, KillCandidate } from '@/types';
import styles from './page.module.css';

type PlatformTab = 'overview' | 'meta' | 'google';

export default function PresentationPage() {
  const params = useParams();
  const { state } = useStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformTab>('overview');

  const clientId = params.id as string;
  const client = state.clients.find(c => c.id === clientId);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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

  if (!state.isLoaded || !client || !activeCpl) {
    return (
      <div className={styles.loading}>
        {!client && state.isLoaded ? (
          <>
            <h2>Client not found</h2>
            <Link href="/" className={styles.backBtn}>← Back to Dashboard</Link>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }

  const metrics = calculateMetrics(activeCpl);

  const calcDelta = (curr?: number, prev?: number) => {
    if (curr === undefined || prev === undefined || prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const spend30dDelta = calcDelta(activeSpend?.current30d, activeSpend?.prev30d);
  const spend7dDelta = calcDelta(activeSpend?.current7d, activeSpend?.prev7d);

  const TrendArrow = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.5) return <Minus size={20} />;
    return value < 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />;
  };

  const getTrendClass = (value: number) => {
    if (Math.abs(value) < 0.5) return styles.neutral;
    return value < 0 ? styles.good : styles.bad;
  };

  const analysisLines = activeAnalysis
    ? activeAnalysis.split('\n').filter(line => line.trim().length > 0)
    : [];

  const getTabClass = (tab: PlatformTab) => {
    if (activeTab !== tab) return styles.tab;
    if (tab === 'meta') return `${styles.tab} ${styles.tabMeta}`;
    if (tab === 'google') return `${styles.tab} ${styles.tabGoogle}`;
    return `${styles.tab} ${styles.tabActive}`;
  };

  return (
    <div className={styles.presentation}>
      <header className={styles.topBar}>
        <Link href={`/client/${client.id}`} className={styles.backBtn}>
          <ArrowLeft size={18} />
          <span>Exit</span>
        </Link>
        <div className={styles.brand}>
          <span className={styles.brandName}>Matty - Media Buyer LeadFlix</span>
        </div>
        <button className={styles.fullscreenBtn} onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </header>

      <main className={styles.content}>
        <div className={styles.clientHeader}>
          <div className={styles.avatar}>{client.name.charAt(0)}</div>
          <div>
            <h1 className={styles.clientName}>{client.name}</h1>
            <p className={styles.clientOffer}>{client.offer} • {client.platform === 'google_ads' ? 'Google Ads' : client.platform === 'meta_ads' ? 'Meta Ads' : 'Google + Meta'}</p>
          </div>
        </div>

        {isBothPlatforms && (
          <div className={styles.tabsContainer} style={{ marginBottom: '24px' }}>
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

        <div className={styles.metricsGrid}>
          {/* CPL 30D */}
          <div className={`${styles.metricCard} ${styles.metricLarge}`}>
            <div className={styles.metricLabel}>
              <Target size={18} />
              CPL — Last 30 Days
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {formatCurrency(activeCpl.current30d, client.currency)}
              </span>
              <span className={`${styles.metricDelta} ${getTrendClass(metrics.delta30dPercent)}`}>
                <TrendArrow value={metrics.delta30dPercent} />
                {formatPercent(metrics.delta30dPercent)}
              </span>
            </div>
            <div className={styles.metricCompare}>
              Previous: {formatCurrency(activeCpl.prev30d, client.currency)}
            </div>
          </div>

          {/* Spend 30D */}
          <div className={`${styles.metricCard} ${styles.metricLarge}`}>
            <div className={styles.metricLabel}>
              <DollarSign size={18} />
              Spend — Last 30 Days
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {formatCurrency(activeSpend?.current30d || 0, client.currency)}
              </span>
              <span className={`${styles.metricDelta} ${getTrendClass(spend30dDelta)}`}>
                <TrendArrow value={spend30dDelta} />
                {formatPercent(spend30dDelta)}
              </span>
            </div>
            <div className={styles.metricCompare}>
              Previous: {formatCurrency(activeSpend?.prev30d || 0, client.currency)}
            </div>
          </div>

          {/* CPL 7D */}
          <div className={`${styles.metricCard} ${styles.metricLarge}`}>
            <div className={styles.metricLabel}>
              <Calendar size={18} />
              CPL — Last 7 Days
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {formatCurrency(activeCpl.current7d, client.currency)}
              </span>
              <span className={`${styles.metricDelta} ${getTrendClass(metrics.delta7dPercent)}`}>
                <TrendArrow value={metrics.delta7dPercent} />
                {formatPercent(metrics.delta7dPercent)}
              </span>
            </div>
            <div className={styles.metricCompare}>
              Previous: {formatCurrency(activeCpl.prev7d, client.currency)}
            </div>
          </div>

          {/* Spend 7D */}
          <div className={`${styles.metricCard} ${styles.metricLarge}`}>
            <div className={styles.metricLabel}>
              <DollarSign size={18} />
              Spend — Last 7 Days
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {formatCurrency(activeSpend?.current7d || 0, client.currency)}
              </span>
              <span className={`${styles.metricDelta} ${getTrendClass(spend7dDelta)}`}>
                <TrendArrow value={spend7dDelta} />
                {formatPercent(spend7dDelta)}
              </span>
            </div>
            <div className={styles.metricCompare}>
              Previous: {formatCurrency(activeSpend?.prev7d || 0, client.currency)}
            </div>
          </div>
        </div>

        <div className={styles.chartArea}>
          <PerformanceChart
            clients={state.clients}
            type="single"
            selectedClientId={client.id}
          />
        </div>

        {activeCreative && (
          <div className={styles.creativeSection}>
            <div className={styles.creativeCard}>
              <div className={styles.creativeHeader}>
                <Sparkles size={18} />
                <h3>🏆 Winning Creative — Last 30D</h3>
              </div>
              <p className={styles.creativeName}>{activeCreative.name}</p>
              <span className={styles.creativePeriod}>
                <Target size={14} />
                {activeCreative.period}
              </span>
            </div>
          </div>
        )}

        {/* Analysis Section */}
        {activeAnalysis && analysisLines.length > 0 && (
          <div className={styles.analysisSection}>
            <div className={styles.analysisCard}>
              <div className={styles.analysisHeader}>
                <h3>📊 Analysis & Next Steps</h3>
              </div>
              <div className={styles.analysisBody}>
                {analysisLines.map((line, index) => (
                  <p key={index} className={styles.analysisParagraph}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Kill Candidates Section */}
        {activeKillCandidates && activeKillCandidates.length > 0 && (
          <div className={styles.killSection}>
            <div className={styles.killCard}>
              <div className={styles.killHeader}>
                <h3>☠️ Ads to Kill</h3>
              </div>
              <div className={styles.killBody}>
                {activeKillCandidates.map((candidate, index) => (
                  <div key={index} className={styles.killItem}>
                    <span className={styles.killName}>{candidate.name}</span>
                    <span className={styles.killReason}>{candidate.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <span>Generated by Matty - Media Buyer LeadFlix</span>
        <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </footer>
    </div>
  );
}
