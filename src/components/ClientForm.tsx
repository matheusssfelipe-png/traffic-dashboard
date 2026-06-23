'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Save, Trash2, Plus, Skull } from 'lucide-react';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';
import type { Client, Platform, ClientStatus, CPLMetrics, SpendMetrics, KillCandidate, PlatformData } from '@/types';
import styles from './ClientForm.module.css';

interface ClientFormProps {
  client?: Client;
  onClose: () => void;
}

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'both', label: 'Both' },
];

const CURRENCY_OPTIONS = ['SEK', 'kr', 'USD', 'EUR', 'BRL'];

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'review', label: 'In Review' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'new', label: 'New' },
  { value: 'needs_creatives', label: 'Needs Creatives' },
  { value: 'attention', label: 'Attention' },
];

function calcDelta(current: number, previous: number): number | null {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

const DEFAULT_METRICS = { prev30d: 0, current30d: 0, prev7d: 0, current7d: 0 };

export default function ClientForm({ client, onClose }: ClientFormProps) {
  const { addClient, updateClient, deleteClient } = useStore();
  const { showToast } = useToast();
  const isEditing = Boolean(client);

  // ── Core Form State ─────────────────────────────────────────
  const [name, setName] = useState(client?.name ?? '');
  const [offer, setOffer] = useState(client?.offer ?? '');
  const [platform, setPlatform] = useState<Platform>(client?.platform ?? 'google_ads');
  const [currency, setCurrency] = useState(client?.currency ?? 'SEK');
  const [status, setStatus] = useState<ClientStatus>(client?.status ?? 'new');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Single-platform state ───────────────────────────────────
  const [cpl, setCpl] = useState<CPLMetrics>(client?.cpl ?? { ...DEFAULT_METRICS });
  const [spend, setSpend] = useState<SpendMetrics>(client?.spend ?? { ...DEFAULT_METRICS });
  const [creativeName, setCreativeName] = useState(client?.winningCreative?.name ?? '');
  const [creativePeriod, setCreativePeriod] = useState(client?.winningCreative?.period ?? '');
  const [creativeImageUrl, setCreativeImageUrl] = useState(client?.winningCreative?.imageUrl ?? '');
  const [killCandidates, setKillCandidates] = useState<KillCandidate[]>(client?.killCandidates ?? []);
  const [analysis, setAnalysis] = useState(client?.analysis ?? '');

  // ── Meta Ads platform state ─────────────────────────────────
  const [metaCpl, setMetaCpl] = useState<CPLMetrics>(client?.metaData?.cpl ?? { ...DEFAULT_METRICS });
  const [metaSpend, setMetaSpend] = useState<SpendMetrics>(client?.metaData?.spend ?? { ...DEFAULT_METRICS });
  const [metaCreativeName, setMetaCreativeName] = useState(client?.metaData?.winningCreative?.name ?? '');
  const [metaCreativePeriod, setMetaCreativePeriod] = useState(client?.metaData?.winningCreative?.period ?? '');
  const [metaCreativeImageUrl, setMetaCreativeImageUrl] = useState(client?.metaData?.winningCreative?.imageUrl ?? '');
  const [metaKillCandidates, setMetaKillCandidates] = useState<KillCandidate[]>(client?.metaData?.killCandidates ?? []);
  const [metaAnalysis, setMetaAnalysis] = useState(client?.metaData?.analysis ?? '');

  // ── Google Ads platform state ───────────────────────────────
  const [googleCpl, setGoogleCpl] = useState<CPLMetrics>(client?.googleData?.cpl ?? { ...DEFAULT_METRICS });
  const [googleSpend, setGoogleSpend] = useState<SpendMetrics>(client?.googleData?.spend ?? { ...DEFAULT_METRICS });
  const [googleCreativeName, setGoogleCreativeName] = useState(client?.googleData?.winningCreative?.name ?? '');
  const [googleCreativePeriod, setGoogleCreativePeriod] = useState(client?.googleData?.winningCreative?.period ?? '');
  const [googleCreativeImageUrl, setGoogleCreativeImageUrl] = useState(client?.googleData?.winningCreative?.imageUrl ?? '');
  const [googleKillCandidates, setGoogleKillCandidates] = useState<KillCandidate[]>(client?.googleData?.killCandidates ?? []);
  const [googleAnalysis, setGoogleAnalysis] = useState(client?.googleData?.analysis ?? '');

  // ── Real-Time Delta Calculations (CPL) ──────────────────────
  const delta30d = useMemo(() => calcDelta(cpl.current30d, cpl.prev30d), [cpl.current30d, cpl.prev30d]);
  const delta7d = useMemo(() => calcDelta(cpl.current7d, cpl.prev7d), [cpl.current7d, cpl.prev7d]);

  const metaDelta30d = useMemo(() => calcDelta(metaCpl.current30d, metaCpl.prev30d), [metaCpl.current30d, metaCpl.prev30d]);
  const metaDelta7d = useMemo(() => calcDelta(metaCpl.current7d, metaCpl.prev7d), [metaCpl.current7d, metaCpl.prev7d]);

  const googleDelta30d = useMemo(() => calcDelta(googleCpl.current30d, googleCpl.prev30d), [googleCpl.current30d, googleCpl.prev30d]);
  const googleDelta7d = useMemo(() => calcDelta(googleCpl.current7d, googleCpl.prev7d), [googleCpl.current7d, googleCpl.prev7d]);

  // ── Real-Time Delta Calculations (Spend) ────────────────────
  const spendDelta30d = useMemo(() => calcDelta(spend.current30d, spend.prev30d), [spend.current30d, spend.prev30d]);
  const spendDelta7d = useMemo(() => calcDelta(spend.current7d, spend.prev7d), [spend.current7d, spend.prev7d]);

  const metaSpendDelta30d = useMemo(() => calcDelta(metaSpend.current30d, metaSpend.prev30d), [metaSpend.current30d, metaSpend.prev30d]);
  const metaSpendDelta7d = useMemo(() => calcDelta(metaSpend.current7d, metaSpend.prev7d), [metaSpend.current7d, metaSpend.prev7d]);

  const googleSpendDelta30d = useMemo(() => calcDelta(googleSpend.current30d, googleSpend.prev30d), [googleSpend.current30d, googleSpend.prev30d]);
  const googleSpendDelta7d = useMemo(() => calcDelta(googleSpend.current7d, googleSpend.prev7d), [googleSpend.current7d, googleSpend.prev7d]);

  // ── Metrics Field Updater ───────────────────────────────────
  const makeMetricsHandler = useCallback(
    <T extends CPLMetrics | SpendMetrics>(setter: React.Dispatch<React.SetStateAction<T>>) =>
      (field: keyof T, value: string) => {
        const num = value === '' ? 0 : parseFloat(value);
        if (isNaN(num)) return;
        setter(prev => ({ ...prev, [field]: num as any }));
      },
    []
  );

  const handleCplChange = useMemo(() => makeMetricsHandler(setCpl), [makeMetricsHandler]);
  const handleSpendChange = useMemo(() => makeMetricsHandler(setSpend), [makeMetricsHandler]);
  const handleMetaCplChange = useMemo(() => makeMetricsHandler(setMetaCpl), [makeMetricsHandler]);
  const handleMetaSpendChange = useMemo(() => makeMetricsHandler(setMetaSpend), [makeMetricsHandler]);
  const handleGoogleCplChange = useMemo(() => makeMetricsHandler(setGoogleCpl), [makeMetricsHandler]);
  const handleGoogleSpendChange = useMemo(() => makeMetricsHandler(setGoogleSpend), [makeMetricsHandler]);

  // ── Kill Candidates Helpers ─────────────────────────────────
  const addKillCandidate = useCallback(
    (setter: React.Dispatch<React.SetStateAction<KillCandidate[]>>) => () => {
      setter(prev => [...prev, { name: '', reason: '' }]);
    },
    []
  );

  const removeKillCandidate = useCallback(
    (setter: React.Dispatch<React.SetStateAction<KillCandidate[]>>) => (index: number) => {
      setter(prev => prev.filter((_, i) => i !== index));
    },
    []
  );

  const updateKillCandidate = useCallback(
    (setter: React.Dispatch<React.SetStateAction<KillCandidate[]>>) =>
      (index: number, field: keyof KillCandidate, value: string) => {
        setter(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
      },
    []
  );

  // ── Delta Badge Style ───────────────────────────────────────
  const getDeltaClass = (delta: number | null) => {
    if (delta === null) return styles.deltaNeutral;
    if (delta < -0.5) return styles.deltaGood;
    if (delta > 0.5) return styles.deltaBad;
    return styles.deltaNeutral;
  };

  const formatDelta = (delta: number | null) => {
    if (delta === null) return '—';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}%`;
  };

  // ── Submit Handler ──────────────────────────────────────────
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const isBoth = platform === 'both';

      const metaDataPayload: PlatformData | undefined = isBoth
        ? {
            cpl: metaCpl,
            spend: metaSpend,
            winningCreative: {
              name: metaCreativeName.trim(),
              period: metaCreativePeriod.trim(),
              imageUrl: metaCreativeImageUrl.trim() || undefined,
            },
            killCandidates: metaKillCandidates.filter(k => k.name.trim()),
            analysis: metaAnalysis.trim(),
          }
        : undefined;

      const googleDataPayload: PlatformData | undefined = isBoth
        ? {
            cpl: googleCpl,
            spend: googleSpend,
            winningCreative: {
              name: googleCreativeName.trim(),
              period: googleCreativePeriod.trim(),
              imageUrl: googleCreativeImageUrl.trim() || undefined,
            },
            killCandidates: googleKillCandidates.filter(k => k.name.trim()),
            analysis: googleAnalysis.trim(),
          }
        : undefined;

      const clientData = {
        name: name.trim(),
        offer: offer.trim(),
        platform,
        currency,
        cpl,
        spend,
        winningCreative: {
          name: creativeName.trim(),
          period: creativePeriod.trim(),
          imageUrl: creativeImageUrl.trim() || undefined,
        },
        killCandidates: killCandidates.filter(k => k.name.trim()),
        analysis: analysis.trim(),
        status,
        history: client?.history ?? [],
        metaData: metaDataPayload,
        googleData: googleDataPayload,
      };

      if (isEditing && client) {
        updateClient(client.id, clientData);
        showToast(`${name.trim()} updated successfully`, 'success');
      } else {
        addClient(clientData);
        showToast(`${name.trim()} added successfully`, 'success');
      }

      onClose();
    },
    [
      name, offer, platform, currency, cpl, spend,
      creativeName, creativePeriod, creativeImageUrl,
      killCandidates, analysis, status,
      metaCpl, metaSpend, metaCreativeName, metaCreativePeriod, metaCreativeImageUrl,
      metaKillCandidates, metaAnalysis,
      googleCpl, googleSpend, googleCreativeName, googleCreativePeriod, googleCreativeImageUrl,
      googleKillCandidates, googleAnalysis,
      isEditing, client, addClient, updateClient, onClose,
    ]
  );

  // ── Delete Handler ──────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (client) {
      const clientName = client.name;
      deleteClient(client.id);
      showToast(`${clientName} deleted`, 'error');
      onClose();
    }
  }, [client, deleteClient, onClose, showToast]);

  // ── Close on Escape ─────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ── Prevent overlay scroll ─────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ═══════════════════════════════════════════════════════════
  // ── Reusable sub-sections (Metrics, Creative, Kill, Analysis)
  // ═══════════════════════════════════════════════════════════

  const renderMetricsFields = (
    state: CPLMetrics | SpendMetrics,
    onChange: (field: any, value: string) => void,
    d30: number | null,
    d7: number | null,
    labelPrefix: string
  ) => (
    <div className={styles.cplFields}>
      {/* 30 Days */}
      <div>
        <div className={styles.cplPeriodLabel}>30-Day Period</div>
        <div className={styles.cplRow}>
          <div className={styles.field}>
            <label className={styles.cplLabel}>Previous {labelPrefix}</label>
            <input
              className={styles.input}
              type="number"
              step="0.01"
              min="0"
              value={state.prev30d || ''}
              onChange={e => onChange('prev30d', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.cplLabel}>Current {labelPrefix}</label>
            <input
              className={styles.input}
              type="number"
              step="0.01"
              min="0"
              value={state.current30d || ''}
              onChange={e => onChange('current30d', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className={getDeltaClass(d30)}>{formatDelta(d30)}</div>
        </div>
      </div>

      {/* 7 Days */}
      <div>
        <div className={styles.cplPeriodLabel}>7-Day Period</div>
        <div className={styles.cplRow}>
          <div className={styles.field}>
            <label className={styles.cplLabel}>Previous {labelPrefix}</label>
            <input
              className={styles.input}
              type="number"
              step="0.01"
              min="0"
              value={state.prev7d || ''}
              onChange={e => onChange('prev7d', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.cplLabel}>Current {labelPrefix}</label>
            <input
              className={styles.input}
              type="number"
              step="0.01"
              min="0"
              value={state.current7d || ''}
              onChange={e => onChange('current7d', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className={getDeltaClass(d7)}>{formatDelta(d7)}</div>
        </div>
      </div>
    </div>
  );

  const renderCreativeFields = (
    cName: string,
    setCName: (v: string) => void,
    cPeriod: string,
    setCPeriod: (v: string) => void,
    cImageUrl: string,
    setCImageUrl: (v: string) => void
  ) => (
    <div className={styles.creativeSection}>
      <div className={styles.field}>
        <label className={styles.label}>Winning Creative</label>
        <input
          className={styles.input}
          type="text"
          value={cName}
          onChange={e => setCName(e.target.value)}
          placeholder="e.g. Video UGC — Hook A"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Period</label>
        <input
          className={styles.input}
          type="text"
          value={cPeriod}
          onChange={e => setCPeriod(e.target.value)}
          placeholder="e.g. May 2026"
        />
      </div>
      <div className={styles.fieldFull}>
        <label className={styles.label}>Creative Screenshot URL (optional)</label>
        <input
          className={styles.input}
          type="text"
          value={cImageUrl}
          onChange={e => setCImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
    </div>
  );

  const renderKillCandidates = (
    candidates: KillCandidate[],
    onAdd: () => void,
    onRemove: (i: number) => void,
    onUpdate: (i: number, field: keyof KillCandidate, value: string) => void
  ) => (
    <div className={styles.killSection}>
      <div className={styles.killTitle}>
        <Skull size={16} />
        Kill Candidates
      </div>

      {candidates.map((kc, i) => (
        <div key={i} className={styles.killRow}>
          <input
            className={styles.input}
            type="text"
            value={kc.name}
            onChange={e => onUpdate(i, 'name', e.target.value)}
            placeholder="Ad / Creative name"
          />
          <input
            className={styles.input}
            type="text"
            value={kc.reason}
            onChange={e => onUpdate(i, 'reason', e.target.value)}
            placeholder="Reason to kill"
          />
          <button
            type="button"
            className={styles.killRemoveBtn}
            onClick={() => onRemove(i)}
            aria-label="Remove"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button type="button" className={styles.killAddBtn} onClick={onAdd}>
        <Plus size={14} />
        Add Kill Candidate
      </button>
    </div>
  );

  const renderAnalysis = (value: string, setter: (v: string) => void) => (
    <div className={styles.field}>
      <label className={styles.label}>Analysis &amp; Next Steps</label>
      <textarea
        className={styles.textarea}
        rows={4}
        value={value}
        onChange={e => setter(e.target.value)}
        placeholder="Key insights, observations, and planned optimizations..."
      />
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // ── Platform-specific data block ───────────────────────────
  // ═══════════════════════════════════════════════════════════

  const renderPlatformBlock = (
    label: string,
    accent: 'meta' | 'google',
    cplState: CPLMetrics,
    onCplChange: (field: keyof CPLMetrics, value: string) => void,
    cplD30: number | null,
    cplD7: number | null,
    spendState: SpendMetrics,
    onSpendChange: (field: keyof SpendMetrics, value: string) => void,
    spendD30: number | null,
    spendD7: number | null,
    cName: string,
    setCName: (v: string) => void,
    cPeriod: string,
    setCPeriod: (v: string) => void,
    cImageUrl: string,
    setCImageUrl: (v: string) => void,
    candidates: KillCandidate[],
    candidateSetter: React.Dispatch<React.SetStateAction<KillCandidate[]>>,
    analysisVal: string,
    analysisSetter: (v: string) => void
  ) => (
    <div className={`${styles.platformBlock} ${accent === 'meta' ? styles.platformMeta : styles.platformGoogle}`}>
      <div className={styles.platformHeader}>
        <span className={`${styles.platformDot} ${accent === 'meta' ? styles.dotMeta : styles.dotGoogle}`} />
        {label}
      </div>

      {/* CPL */}
      <div className={styles.cplSection}>
        <div className={styles.cplTitle}>
          <span className={accent === 'meta' ? styles.cplTitleDotMeta : styles.cplTitleDotGoogle} />
          CPL Metrics
        </div>
        {renderMetricsFields(cplState, onCplChange, cplD30, cplD7, 'CPL')}
      </div>

      {/* Spend */}
      <div className={styles.cplSection} style={{ marginTop: '16px' }}>
        <div className={styles.cplTitle}>
          <span className={accent === 'meta' ? styles.cplTitleDotMeta : styles.cplTitleDotGoogle} />
          Spend Metrics
        </div>
        {renderMetricsFields(spendState, onSpendChange, spendD30, spendD7, 'Spend')}
      </div>

      {/* Creative */}
      {renderCreativeFields(cName, setCName, cPeriod, setCPeriod, cImageUrl, setCImageUrl)}

      {/* Kill Candidates */}
      {renderKillCandidates(
        candidates,
        addKillCandidate(candidateSetter),
        removeKillCandidate(candidateSetter),
        updateKillCandidate(candidateSetter)
      )}

      {/* Analysis */}
      {renderAnalysis(analysisVal, analysisSetter)}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Delete confirmation overlay */}
        {showDeleteConfirm && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>
                Are you sure you want to delete <strong>{client?.name}</strong>? This action cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <button className={styles.btnConfirmDelete} onClick={handleDelete}>
                  Delete
                </button>
                <button className={styles.btnConfirmCancel} onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className={styles.body}>
          <form className={styles.form} id="clientForm" onSubmit={handleSubmit}>
            {/* Name & Offer */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Client Name</label>
                <input
                  className={styles.input}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Volvo Sverige"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Offer</label>
                <input
                  className={styles.input}
                  type="text"
                  value={offer}
                  onChange={e => setOffer(e.target.value)}
                  placeholder="e.g. Free Test Drive"
                  required
                />
              </div>
            </div>

            {/* Platform & Currency */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Platform</label>
                <select
                  className={styles.select}
                  value={platform}
                  onChange={e => setPlatform(e.target.value as Platform)}
                >
                  {PLATFORM_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Currency</label>
                <select
                  className={styles.select}
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  {CURRENCY_OPTIONS.map(cur => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* SINGLE PLATFORM VIEW                                */}
            {/* ════════════════════════════════════════════════════ */}
            {platform !== 'both' && (
              <>
                {/* CPL Section */}
                <div className={styles.cplSection}>
                  <div className={styles.cplTitle}>
                    <span className={styles.cplTitleDot} />
                    CPL Metrics
                  </div>
                  {renderMetricsFields(cpl, handleCplChange, delta30d, delta7d, 'CPL')}
                </div>

                {/* Spend Section */}
                <div className={styles.cplSection} style={{ marginTop: '16px' }}>
                  <div className={styles.cplTitle}>
                    <span className={styles.cplTitleDot} />
                    Spend Metrics
                  </div>
                  {renderMetricsFields(spend, handleSpendChange, spendDelta30d, spendDelta7d, 'Spend')}
                </div>

                <div className={styles.divider} />

                {/* Winning Creative */}
                {renderCreativeFields(
                  creativeName, setCreativeName,
                  creativePeriod, setCreativePeriod,
                  creativeImageUrl, setCreativeImageUrl
                )}

                {/* Kill Candidates */}
                {renderKillCandidates(
                  killCandidates,
                  addKillCandidate(setKillCandidates),
                  removeKillCandidate(setKillCandidates),
                  updateKillCandidate(setKillCandidates)
                )}

                {/* Analysis */}
                {renderAnalysis(analysis, setAnalysis)}
              </>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* DUAL PLATFORM VIEW (BOTH)                           */}
            {/* ════════════════════════════════════════════════════ */}
            {platform === 'both' && (
              <>
                {renderPlatformBlock(
                  'Meta Ads Data',
                  'meta',
                  metaCpl, handleMetaCplChange, metaDelta30d, metaDelta7d,
                  metaSpend, handleMetaSpendChange, metaSpendDelta30d, metaSpendDelta7d,
                  metaCreativeName, setMetaCreativeName,
                  metaCreativePeriod, setMetaCreativePeriod,
                  metaCreativeImageUrl, setMetaCreativeImageUrl,
                  metaKillCandidates, setMetaKillCandidates,
                  metaAnalysis, setMetaAnalysis
                )}

                {renderPlatformBlock(
                  'Google Ads Data',
                  'google',
                  googleCpl, handleGoogleCplChange, googleDelta30d, googleDelta7d,
                  googleSpend, handleGoogleSpendChange, googleSpendDelta30d, googleSpendDelta7d,
                  googleCreativeName, setGoogleCreativeName,
                  googleCreativePeriod, setGoogleCreativePeriod,
                  googleCreativeImageUrl, setGoogleCreativeImageUrl,
                  googleKillCandidates, setGoogleKillCandidates,
                  googleAnalysis, setGoogleAnalysis
                )}
              </>
            )}

            {/* Status */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <select
                  className={styles.select}
                  value={status}
                  onChange={e => setStatus(e.target.value as ClientStatus)}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          {isEditing && (
            <button
              type="button"
              className={styles.btnDelete}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}
          <div className={styles.footerRight}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" form="clientForm" className={styles.btnSave}>
              <Save size={15} />
              {isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
