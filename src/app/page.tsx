'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { getDashboardSummary } from '@/data';
import { downloadReportAsPdf } from '@/export';
import KPICard from '@/components/KPICard';
import ClientTable from '@/components/ClientTable';
import PerformanceChart from '@/components/PerformanceChart';
import Sidebar from '@/components/Sidebar';
import ClientForm from '@/components/ClientForm';
import { Users, TrendingDown, TrendingUp, DollarSign, Activity, Download } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const { state } = useStore();
  const [showForm, setShowForm] = useState(false);

  if (!state.isLoaded) {
    return (
      <div className={styles.loadingScreen}>
        <Activity size={40} className={styles.loadingIcon} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const summary = getDashboardSummary(state.clients);

  return (
    <div className={styles.layout}>
      <Sidebar onAddClient={() => setShowForm(true)} />
      <main id="dashboard-main" className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Matty - Media Buyer LeadFlix</h1>
            <p className={styles.subtitle}>
              Track and analyze your clients&apos; campaign performance
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.exportBtn}
              onClick={() => downloadReportAsPdf('dashboard-main')}
              title="Export dashboard as PDF"
            >
              <Download size={16} />
              Export PDF
            </button>
            <button className={styles.addBtn} onClick={() => setShowForm(true)}>
              + Add Client
            </button>
          </div>
        </header>

        <section className={styles.kpiGrid}>
          <KPICard
            title="Total Clients"
            value={summary.totalClients}
            subtitle={`${summary.activeClients} active`}
            icon={<Users size={20} />}
            delay={0}
          />
          <KPICard
            title="Total Spend 30D"
            value={`${summary.totalSpend30d.toLocaleString('sv-SE')} kr`}
            subtitle={`Avg CPL: ${summary.avgCPL30d.toFixed(2)} kr`}
            icon={<DollarSign size={20} />}
            delay={100}
          />
          <KPICard
            title="Best Performer (7D)"
            value={summary.bestPerformer?.name || '—'}
            delta={summary.bestPerformer?.delta}
            subtitle="Lowest CPL change — last 7 days"
            icon={<TrendingDown size={20} />}
            delay={200}
          />
          <KPICard
            title="Needs Attention (7D)"
            value={summary.worstPerformer?.name || '—'}
            delta={summary.worstPerformer?.delta}
            subtitle="Highest CPL increase — last 7 days"
            icon={<TrendingUp size={20} />}
            delay={300}
          />
        </section>

        {/* CLIENT PERFORMANCE TABLE FIRST (inverted order) */}
        <section className={styles.tableSection}>
          <ClientTable />
        </section>

        {/* CPL COMPARISON CHART BELOW */}
        <section className={styles.chartSection}>
          <PerformanceChart clients={state.clients} type="overview" />
        </section>
      </main>

      {showForm && <ClientForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
