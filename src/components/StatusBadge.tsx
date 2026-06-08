'use client';

import React from 'react';
import { ClientStatus } from '@/types';
import styles from './StatusBadge.module.css';

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: styles.active },
  paused: { label: 'Paused', className: styles.paused },
  review: { label: 'In Review', className: styles.review },
  scaling: { label: 'Scaling', className: styles.scaling },
  new: { label: 'New', className: styles.new },
  needs_creatives: { label: 'Needs Creatives', className: styles.needs_creatives },
  attention: { label: 'Attention', className: styles.attention },
};

interface StatusBadgeProps {
  status: ClientStatus;
  showDot?: boolean;
}

export default function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`${styles.badge} ${config.className}`}>
      {showDot && <span className={styles.dot} />}
      {config.label}
    </span>
  );
}
