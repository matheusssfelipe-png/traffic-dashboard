'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store';
import { ClientStatus } from '@/types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onAddClient: () => void;
}

const statusDotClass: Record<ClientStatus, string> = {
  active: styles.dotActive,
  paused: styles.dotPaused,
  review: styles.dotReview,
  scaling: styles.dotScaling,
  new: styles.dotNew,
  needs_creatives: styles.dotNeedsCreatives || '',
  attention: styles.dotAttention || '',
};

export default function Sidebar({ onAddClient }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { state } = useStore();

  const clients = state.clients;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? '72px' : '260px'
    );
  }, [collapsed]);

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      style={{ '--sidebar-width': collapsed ? '72px' : '260px' } as React.CSSProperties}
    >
      {/* Toggle button */}
      <button
        className={styles.toggleButton}
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        title={collapsed ? 'Expandir' : 'Recolher'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo / Brand */}
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>
          <Activity size={18} strokeWidth={2.2} />
        </div>
        <div className={styles.logoText}>
          <span className={styles.brandName}>Matty</span>
          <span className={styles.brandSub}>Media Buyer LeadFlix</span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className={styles.nav}>
        <span className={styles.navLabel}>Menu</span>

        <Link
          href="/"
          className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
        >
          <span className={styles.navLinkIcon}>
            <LayoutDashboard size={18} />
          </span>
          <span className={styles.navLinkText}>Overview</span>
          {collapsed && <span className={styles.tooltip}>Overview</span>}
        </Link>

        <Link
          href="/"
          className={`${styles.navLink} ${pathname === '/clients' ? styles.active : ''}`}
        >
          <span className={styles.navLinkIcon}>
            <Users size={18} />
          </span>
          <span className={styles.navLinkText}>Clients</span>
          {collapsed && <span className={styles.tooltip}>Clients</span>}
        </Link>
      </nav>

      {/* Client list */}
      <div className={styles.clientSection}>
        <div className={styles.clientSectionHeader}>
          <span className={styles.clientSectionTitle}>Clients</span>
          <span className={styles.clientCount}>{clients.length}</span>
        </div>

        <div className={styles.clientList}>
          {clients.map((client) => {
            const isActive = pathname === `/client/${client.id}`;
            return (
              <Link
                key={client.id}
                href={`/client/${client.id}`}
                className={`${styles.clientItem} ${isActive ? styles.active : ''}`}
              >
                <span
                  className={`${styles.statusDot} ${statusDotClass[client.status] || ''}`}
                />
                <span className={styles.clientName}>{client.name}</span>
                {collapsed && <span className={styles.tooltip}>{client.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Add client button */}
      <div className={styles.addSection}>
        <button className={styles.addButton} onClick={onAddClient}>
          <PlusCircle size={16} />
          <span className={styles.addButtonText}>Add Client</span>
        </button>
      </div>
    </aside>
  );
}
