'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { Client, HistoryEntry } from '@/types';
import styles from './PerformanceChart.module.css';

type ChartSeries = { name: string; data: number[] }[];
type OverviewMode = 'cpl' | 'spend';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PerformanceChartProps {
  clients: Client[];
  type?: 'overview' | 'single';
  selectedClientId?: string;
}

const sharedAxisStyle: ApexOptions = {
  chart: {
    background: 'transparent',
    foreColor: '#94a3b8',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  theme: { mode: 'dark' },
  grid: {
    borderColor: 'rgba(255,255,255,0.06)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 4, bottom: 0, left: 8 },
  },
  tooltip: {
    theme: 'dark',
    style: { fontSize: '13px' },
    y: {
      formatter: (val: number) => val.toFixed(2),
    },
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '13px',
    fontWeight: 500,
    labels: { colors: '#94a3b8' },
    markers: { size: 5, shape: 'circle' as const },
    itemMargin: { horizontal: 16, vertical: 8 },
  },
  yaxis: {
    labels: {
      style: { colors: '#64748b', fontSize: '12px' },
      formatter: (val: number) => val.toFixed(0),
    },
  },
};

function buildOverviewOptions(clients: Client[], mode: OverviewMode): {
  options: ApexOptions;
  series: ChartSeries;
} {
  const categories = clients.map((c) => c.name);

  const prevSeries = mode === 'cpl'
    ? clients.map((c) => c.cpl.prev30d)
    : clients.map((c) => c.spend?.prev30d || 0);

  const currentSeries = mode === 'cpl'
    ? clients.map((c) => c.cpl.current30d)
    : clients.map((c) => c.spend?.current30d || 0);

  const options: ApexOptions = {
    ...sharedAxisStyle,
    chart: {
      ...sharedAxisStyle.chart,
      type: 'bar',
    },
    colors: mode === 'cpl' ? ['#64748b', '#84B2DB'] : ['#64748b', '#10b981'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        borderRadiusApplication: 'end',
        columnWidth: '55%',
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
        },
        rotate: -45,
        rotateAlways: categories.length > 6,
        trim: true,
        maxHeight: 80,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    fill: {
      opacity: 1,
    },
  };

  const series: ChartSeries = [
    { name: `Previous 30D`, data: prevSeries },
    { name: `Current 30D`, data: currentSeries },
  ];

  return { options, series };
}

function buildSingleOptions(history: HistoryEntry[], currency: string): {
  options: ApexOptions;
  series: ChartSeries;
} {
  const categories = history.map((h) => {
    const [year, month] = h.date.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${year.slice(2)}`;
  });

  const cpl30dData = history.map((h) => h.cpl30d);
  const cpl7dData = history.map((h) => h.cpl7d);

  const options: ApexOptions = {
    ...sharedAxisStyle,
    chart: {
      ...sharedAxisStyle.chart,
      type: 'area',
    },
    tooltip: {
      ...sharedAxisStyle.tooltip,
      y: {
        formatter: (val: number) => `${val.toFixed(2)} ${currency}`,
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontSize: '12px' },
        formatter: (val: number) => `${val.toFixed(0)} ${currency}`,
      },
    },
    colors: ['#84B2DB', '#8b5cf6'],
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: { size: 6, sizeOffset: 2 },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
        },
        rotate: 0,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
  };

  const series: ChartSeries = [
    { name: 'CPL 30D', data: cpl30dData },
    { name: 'CPL 7D', data: cpl7dData },
  ];

  return { options, series };
}

export default function PerformanceChart({
  clients,
  type = 'overview',
  selectedClientId,
}: PerformanceChartProps) {
  const [overviewMode, setOverviewMode] = useState<OverviewMode>('cpl');

  const selectedClient = useMemo(() => {
    if (type === 'single' && selectedClientId) {
      return clients.find((c) => c.id === selectedClientId) ?? null;
    }
    return null;
  }, [clients, type, selectedClientId]);

  const { options, series, chartType } = useMemo(() => {
    if (type === 'overview') {
      const { options: opts, series: ser } = buildOverviewOptions(clients, overviewMode);
      return { options: opts, series: ser, chartType: 'bar' as const };
    }

    if (selectedClient && selectedClient.history.length > 0) {
      const { options: opts, series: ser } = buildSingleOptions(selectedClient.history, selectedClient.currency);
      return { options: opts, series: ser, chartType: 'area' as const };
    }

    return { options: {} as ApexOptions, series: [], chartType: 'area' as const };
  }, [type, clients, selectedClient, overviewMode]);

  const hasData =
    type === 'overview'
      ? clients.length > 0
      : selectedClient !== null && selectedClient.history.length > 0;

  const titleText =
    type === 'overview'
      ? overviewMode === 'cpl'
        ? 'CPL Comparison — All Clients'
        : 'Spend Comparison — All Clients'
      : `🏆 CPL History — ${selectedClient?.name ?? 'Client'} (Last 30D)`;

  const subtitleText =
    type === 'overview'
      ? 'Previous 30D vs Current 30D'
      : `CPL 30D & 7D over time (${selectedClient?.currency ?? ''})`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{titleText}</h3>
          <p className={styles.subtitle}>{subtitleText}</p>
        </div>
        <div className={styles.headerRight}>
          {/* Toggle CPL/Spend — only for overview */}
          {type === 'overview' && (
            <div className={styles.toggle}>
              <button
                className={`${styles.toggleBtn} ${overviewMode === 'cpl' ? styles.toggleActive : ''}`}
                onClick={() => setOverviewMode('cpl')}
              >
                CPL
              </button>
              <button
                className={`${styles.toggleBtn} ${overviewMode === 'spend' ? styles.toggleActive : ''}`}
                onClick={() => setOverviewMode('spend')}
              >
                Spend
              </button>
            </div>
          )}
          {hasData && (
            <span className={styles.badge}>
              <span className={styles.badgeDot} />
              {type === 'overview'
                ? `${clients.length} clients`
                : `${selectedClient!.history.length} months`}
            </span>
          )}
        </div>
      </div>

      {hasData ? (
        <div className={styles.chartContainer}>
          <Chart
            options={options}
            series={series}
            type={chartType}
            height={350}
            width="100%"
          />
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📊</span>
          <span className={styles.emptyText}>
            {type === 'overview'
              ? 'No client data available'
              : 'No history data for this client'}
          </span>
        </div>
      )}

      <div className={styles.glow} />
    </div>
  );
}
