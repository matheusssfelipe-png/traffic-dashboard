'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './KPICard.module.css';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: number;
  icon: React.ReactNode;
  format?: 'currency' | 'percent' | 'number';
  invertColors?: boolean; // if true, positive delta = good (default: negative delta = good for CPL)
  delay?: number;
}

function useCountUp(target: number, duration: number = 1200, delay: number = 0): number {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const progress = Math.min((timestamp - startTime.current) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(eased * target);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return count;
}

export default function KPICard({ title, value, subtitle, delta, icon, invertColors = false, delay = 0 }: KPICardProps) {
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedValue = useCountUp(numericValue, 1200, delay);

  const getDeltaClass = () => {
    if (delta === undefined || Math.abs(delta) < 0.5) return styles.neutral;
    if (invertColors) return styles.info; // Spend: use neutral blue
    const isGood = delta < 0; // CPL: lower is better
    return isGood ? styles.positive : styles.negative;
  };

  const getDeltaIcon = () => {
    if (delta === undefined || Math.abs(delta) < 0.5) return '→';
    return delta > 0 ? '▲' : '▼';
  };

  const displayValue = typeof value === 'string' ? value : Math.round(animatedValue).toString();

  return (
    <div className={styles.card} style={{ animationDelay: `${delay}ms` }}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>{icon}</div>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{displayValue}</span>
        {delta !== undefined && (
          <span className={`${styles.delta} ${getDeltaClass()}`}>
            <span className={styles.deltaIcon}>{getDeltaIcon()}</span>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.glow} />
    </div>
  );
}
