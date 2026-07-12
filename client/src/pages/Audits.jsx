/**
 * Asset Audit Page — Screen 8
 * design.md v2 — pure black canvas, hairline borders, status dots only.
 * No filled colored pills, no colored banners, no green buttons.
 *
 * Two views:
 *   List view  — table of all audit cycles
 *   Detail view — verification table for a specific cycle
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  X,
  ChevronLeft,
  AlertCircle,
  FileText,
  Download,
  ClipboardList,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { STATUS_COLORS, TICKET_STATUS_COLOR } from '../lib/tokens';
import { cn } from '../lib/utils';
import { VerificationToggle, getResultDot } from '../components/shared/VerificationToggle';

// ─── STATUS DOT (§5.4) ────────────────────────────────────────────────────────

function StatusDot({ color, label, className = '' }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm text-muted-foreground', className)}>
      <span
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

// Cycle-status color map
const CYCLE_STATUS_COLOR = {
  Open:   STATUS_COLORS.info,     // blue — ongoing
  Closed: STATUS_COLORS.neutral,  // gray — done
};

// ─── SKELETON (§4.2) ──────────────────────────────────────────────────────────

function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── TOASTS ───────────────────────────────────────────────────────────────────

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'default') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  return { toasts, push };
}

function ToastRegion({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto px-4 py-2.5 rounded-lg border text-sm bg-popover text-foreground',
            t.type === 'danger' ? 'border-danger/30 text-danger' : 'border-border'
          )}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── DIALOG SHELL ─────────────────────────────────────────────────────────────

function Dialog({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full bg-popover border border-border rounded-lg shadow-sm',
          wide ? 'max-w-lg' : 'max-w-sm'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── ALERT DIALOG (confirm/destructive) ───────────────────────────────────────

function AlertDialog({ open, onClose, title, description, confirmLabel = 'Confirm', onConfirm, destructive = false }) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground bg-transparent hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium border focus:outline-none focus:ring-1 focus:ring-white/20',
              destructive
                ? 'border-danger/30 text-danger bg-transparent hover:bg-danger/5'
                : 'bg-foreground text-background hover:bg-foreground/90 border-transparent'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

// ─── SHARED FIELD CLASSES (§5.8) ──────────────────────────────────────────────

const fieldCls =
  'w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:border-border focus:ring-1 focus:ring-white/10';

const btnPrimary =
  'px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background ' +
  'hover:bg-foreground/90 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed';

const btnOutline =
  'px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground bg-transparent ' +
  'hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20';

// ─── CREATE AUDIT CYCLE DIALOG ────────────────────────────────────────────────

function CreateCycleDialog({ open, onClose, onCreated, toast }) {
  const [form, setForm]         = useState({ scope: '', startDate: '', endDate: '', auditorIds: [] });
  const [users, setUsers]       = useState([]);
  const [submitting, setSubmit] = useState(false);
  const [error, setError]       = useState('');

  // Fetch all users to pick auditors from
  useEffect(() => {
    if (!open) return;
    setForm({ scope: '', startDate: '', endDate: '', auditorIds: [] });
    setError('');
    
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;
    if (isMockMode) {
      setUsers([
        { id: 'emp-1', name: 'Roberto Sanchez', email: 'roberto@assetflow.com' },
        { id: 'emp-2', name: 'Lara Croft', email: 'lara@assetflow.com' },
        { id: 'emp-3', name: 'Aarav Patel', email: 'aarav@assetflow.com' },
        { id: 'emp-4', name: 'Sarah Connor', email: 'sarah@assetflow.com' }
      ]);
      return;
    }
    
    api.get('/employees').then((r) => setUsers(r.data)).catch(() => {});
  }, [open]);

  const toggleAuditor = (id) => {
    setForm((f) => ({
      ...f,
      auditorIds: f.auditorIds.includes(id)
        ? f.auditorIds.filter((x) => x !== id)
        : [...f.auditorIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scope || !form.startDate || !form.endDate || !form.auditorIds.length) {
      setError('All fields are required, and at least one auditor must be selected.');
      return;
    }
    setSubmit(true);

    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;
    if (isMockMode) {
      const newCycle = {
        id: `cyc-${Date.now()}`,
        scope: form.scope,
        startDate: form.startDate,
        endDate: form.endDate,
        status: 'Open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      toast('Audit cycle created.');
      onCreated(newCycle);
      onClose();
      setSubmit(false);
      return;
    }

    try {
      const res = await api.post('/audit-cycles', form);
      toast('Audit cycle created.');
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to create audit cycle.');
    } finally {
      setSubmit(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create audit cycle" wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-xs text-danger border border-danger/30 rounded-md px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Scope */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Scope *</label>
          <input
            className={fieldCls}
            placeholder="e.g. Q3 Audit — Engineering Dept"
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
          />
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Start date *</label>
            <input
              type="date"
              className={fieldCls}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">End date *</label>
            <input
              type="date"
              className={fieldCls}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Auditors multi-select */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Auditors * (select one or more)</label>
          <div className="border border-border rounded-md overflow-y-auto max-h-44">
            {users.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">Loading users…</p>
            ) : (
              users.map((u) => {
                const selected = form.auditorIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleAuditor(u.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left border-b border-border last:border-b-0 transition-colors',
                      selected ? 'bg-card text-foreground' : 'text-muted-foreground hover:bg-white/5'
                    )}
                  >
                    {/* Initials avatar */}
                    <span className="inline-flex h-6 w-6 rounded-full bg-white/10 items-center justify-center text-[10px] font-medium text-foreground shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </span>
                    <span className="flex-1 truncate">{u.name}</span>
                    {selected && (
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.success }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
          {form.auditorIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {form.auditorIds.length} auditor{form.auditorIds.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" className={btnOutline} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create cycle'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// ─── DISCREPANCY SHEET ────────────────────────────────────────────────────────
// Plain slide-over panel — bg-popover border-l border-border

function DiscrepancySheet({ open, onClose, items }) {
  if (!open) return null;
  const flagged = items.filter((i) => i.result !== 'Verified' && i.result !== 'Pending');

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="complementary"
        aria-label="Discrepancy report"
        className="relative z-10 w-full max-w-md bg-popover border-l border-border flex flex-col h-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-medium text-foreground">Discrepancy Report</h2>
          <div className="flex items-center gap-2">
            {/* Ghost export icon — consistent with Reports page pattern */}
            <button
              onClick={() => {
                const rows = flagged.map((i) => `${i.asset?.tag},${i.asset?.name},${i.result},${i.auditor?.name}`).join('\n');
                const csv = 'Tag,Name,Result,Auditor\n' + rows;
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'discrepancy-report.csv'; a.click();
                URL.revokeObjectURL(url);
              }}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {flagged.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center mt-12">No discrepancies found.</p>
          ) : (
            <div className="space-y-3">
              {flagged.map((item) => {
                const dot = getResultDot(item.result);
                return (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
                    <span className="font-mono text-sm text-foreground shrink-0">{item.asset?.tag}</span>
                    <span className="text-sm text-muted-foreground flex-1 truncate">{item.asset?.name}</span>
                    {dot && (
                      <StatusDot color={dot.dotColor} label={item.result} className="text-xs shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CYCLE LIST VIEW ──────────────────────────────────────────────────────────

function CycleListView({ cycles, loading, onSelect, onCreateClick }) {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Scope', 'Date Range', 'Status', 'Created'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
              </>
            ) : cycles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center">
                  {/* §5.7 empty state — small icon + one line + one action */}
                  <div className="flex flex-col items-center gap-3">
                    <ClipboardList className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No audit cycles yet.</p>
                    <button className={btnOutline} onClick={onCreateClick}>
                      Create Audit Cycle
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              cycles.map((cycle) => (
                <tr
                  key={cycle.id}
                  className="border-b border-border last:border-b-0 hover:bg-white/[0.03] cursor-pointer"
                  onClick={() => onSelect(cycle)}
                >
                  <td className="px-4 py-3 text-foreground font-medium">{cycle.scope}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {formatDate(cycle.startDate)} – {formatDate(cycle.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusDot
                      color={CYCLE_STATUS_COLOR[cycle.status] ?? STATUS_COLORS.neutral}
                      label={cycle.status}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {formatDate(cycle.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── CYCLE DETAIL VIEW ────────────────────────────────────────────────────────

function CycleDetailView({ cycle, onBack, toast }) {
  const { user } = useAuth();
  const isManager = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [items,         setItems]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [sheetOpen,     setSheetOpen]     = useState(false);
  const [closeConfirm,  setCloseConfirm]  = useState(false);
  const [cycleStatus,   setCycleStatus]   = useState(cycle.status);

  const isClosed = cycleStatus === 'Closed';

  const flaggedCount = items.filter((i) => i.result === 'Missing' || i.result === 'Damaged').length;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;
    if (isMockMode) {
      const mockItems = [
        { id: `itm-1-${cycle.id}`, asset: { tag: 'AF-0012', name: 'Dell Laptop' }, auditor: { name: 'Sarah Connor' }, result: 'Verified', cycleId: cycle.id },
        { id: `itm-2-${cycle.id}`, asset: { tag: 'AF-0020', name: 'MacBook Pro' }, auditor: { name: 'Sarah Connor' }, result: 'Damaged', cycleId: cycle.id },
        { id: `itm-3-${cycle.id}`, asset: { tag: 'AF-0062', name: 'Conference Projector' }, auditor: { name: 'John Doe' }, result: 'Pending', cycleId: cycle.id },
        { id: `itm-4-${cycle.id}`, asset: { tag: 'AF-0087', name: 'Forklift' }, auditor: { name: 'Roberto Sanchez' }, result: 'Missing', cycleId: cycle.id }
      ];
      setItems(mockItems);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/audit-cycles/${cycle.id}/items`);
      setItems(res.data);
    } catch {
      toast('Failed to load audit items.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [cycle.id, toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleVerify = async (itemId, result) => {
    // Optimistic update
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, result } : i));
    
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;
    if (isMockMode) {
      toast('Verification status updated.');
      return;
    }

    try {
      await api.patch(`/audit-items/${itemId}`, { result });
    } catch (err) {
      toast(err.response?.data?.error ?? 'Update failed.', 'danger');
      fetchItems(); // revert on error
    }
  };

  const handleClose = async () => {
    setCloseConfirm(false);
    
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;
    if (isMockMode) {
      setCycleStatus('Closed');
      setItems((prev) => prev.map((i) => i.result === 'Pending' ? { ...i, result: 'Missing' } : i));
      toast('Audit cycle closed. Missing assets marked as Lost.');
      return;
    }

    try {
      await api.patch(`/audit-cycles/${cycle.id}/close`);
      setCycleStatus('Closed');
      fetchItems();
      toast('Audit cycle closed. Missing assets marked as Lost.');
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to close cycle.', 'danger');
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-white/20 rounded"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        All audit cycles
      </button>

      {/* ── Cycle header card — §5.2, plain bordered, NO color fill */}
      <div className="bg-card border border-border rounded-lg p-5 flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          {/* Cycle code + scope in one title line */}
          <p className="text-sm font-medium text-foreground leading-snug">
            {cycle.scope}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatDate(cycle.startDate)} – {formatDate(cycle.endDate)}
          </p>
          {/* Auditors row */}
          {cycle.auditors?.length ? (
            <p className="text-xs text-muted-foreground">
              Auditors:{' '}
              {cycle.auditors.map((a) => a.name ?? a.email).join(', ')}
            </p>
          ) : null}
        </div>
        {/* Status dot top-right — the ONLY color on this card */}
        <StatusDot
          color={CYCLE_STATUS_COLOR[cycleStatus] ?? STATUS_COLORS.neutral}
          label={cycleStatus}
          className="text-xs shrink-0"
        />
      </div>

      {/* ── Verification table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Asset
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Expected Location
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Verification
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <SkeletonRow cols={3} />
                <SkeletonRow cols={3} />
                <SkeletonRow cols={3} />
              </>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-xs text-muted-foreground">
                  No assets in this audit cycle.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const dot = getResultDot(item.result);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-b-0 hover:bg-white/[0.03]"
                  >
                    {/* Asset — result dot to the left once set, §3 (prompt) */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        {dot && (
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: dot.dotColor }}
                            aria-hidden="true"
                          />
                        )}
                        <span>
                          {/* §5.5 — inline mono tag, not boxed */}
                          <span className="font-mono text-sm text-foreground">{item.asset?.tag}</span>
                          {item.asset?.name && (
                            <span className="text-sm text-muted-foreground ml-1.5">{item.asset.name}</span>
                          )}
                        </span>
                      </span>
                    </td>
                    {/* Expected Location */}
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.asset?.location ?? '—'}
                    </td>
                    {/* Verification toggle */}
                    <td className="px-4 py-3">
                      {isClosed ? (
                        // Read-only when closed — show only final StatusDot
                        dot
                          ? <StatusDot color={dot.dotColor} label={item.result} className="text-xs" />
                          : <span className="text-xs text-muted-foreground">Pending</span>
                      ) : (
                        <VerificationToggle
                          value={item.result}
                          onChange={(result) => handleVerify(item.id, result)}
                          disabled={isClosed}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Discrepancy summary — §4 (prompt), plain bordered, no fill/tint */}
      <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 text-sm text-foreground">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: flaggedCount > 0 ? STATUS_COLORS.attention : STATUS_COLORS.success }}
          />
          {flaggedCount === 0
            ? 'No discrepancies — all verified.'
            : `${flaggedCount} asset${flaggedCount > 1 ? 's' : ''} flagged — discrepancy report generated automatically.`}
        </span>
        {/* Ghost "View report" button — opens the Sheet */}
        <button
          onClick={() => setSheetOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-white/20 rounded border border-border px-2.5 py-1.5 hover:bg-white/5"
        >
          <FileText className="w-3.5 h-3.5" />
          View report
        </button>
      </div>

      {/* ── Close Audit Cycle — §5, outline button, NOT a green button */}
      {isManager && !isClosed && (
        <div className="flex justify-end">
          <button
            className={btnOutline}
            onClick={() => setCloseConfirm(true)}
          >
            Close Audit Cycle
          </button>
        </div>
      )}

      {/* ── Close confirm AlertDialog — destructive tier */}
      <AlertDialog
        open={closeConfirm}
        onClose={() => setCloseConfirm(false)}
        title="Close this audit cycle?"
        description={`This will mark ${items.filter((i) => i.result === 'Missing').length} asset(s) as Lost and lock the cycle. This can't be undone.`}
        confirmLabel="Close cycle"
        onConfirm={handleClose}
        destructive
      />

      {/* ── Discrepancy Sheet */}
      <DiscrepancySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        items={items}
      />
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Audits() {
  const [cycles,       setCycles]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedCycle, setSelectedCycle] = useState(null); // null = list view
  const [createOpen,   setCreateOpen]   = useState(false);

  const { toasts, push: toast } = useToasts();

  const fetchCycles = useCallback(async () => {
    setLoading(true);
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;
    if (isMockMode) {
      setCycles([
        {
          id: 'cyc-1',
          scope: 'Q3 Electronics Audit',
          startDate: '2026-07-01T00:00:00.000Z',
          endDate: '2026-07-31T00:00:00.000Z',
          status: 'Open',
          createdAt: '2026-07-01T08:00:00.000Z',
          updatedAt: '2026-07-01T08:00:00.000Z'
        },
        {
          id: 'cyc-2',
          scope: 'H1 Vehicles Inventory',
          startDate: '2026-01-15T00:00:00.000Z',
          endDate: '2026-01-30T00:00:00.000Z',
          status: 'Closed',
          createdAt: '2026-01-15T09:00:00.000Z',
          updatedAt: '2026-01-30T17:00:00.000Z'
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/audit-cycles');
      setCycles(res.data);
    } catch {
      toast('Failed to load audit cycles.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCycles(); }, [fetchCycles]);

  const handleCycleCreated = (newCycle) => {
    setCycles((prev) => [newCycle, ...prev]);
  };

  return (
    // §1 — dark only
    <div className="dark min-h-screen bg-background text-foreground flex flex-col font-sans">

      {/* ── Page header §4.1 */}
      <header className="px-10 py-6 border-b border-border flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
            {selectedCycle ? 'Audit' : 'Audit'}
          </p>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            {selectedCycle ? selectedCycle.scope : 'Audit'}
          </h1>
        </div>

        {/* §5.1 — one primary button per view */}
        {!selectedCycle && (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:bg-foreground/90 focus:outline-none focus:ring-1 focus:ring-white/20"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Audit Cycle
          </button>
        )}
      </header>

      {/* ── Main content */}
      <main className="flex-1 px-10 py-6">
        {selectedCycle ? (
          <CycleDetailView
            cycle={selectedCycle}
            onBack={() => { setSelectedCycle(null); fetchCycles(); }}
            toast={toast}
          />
        ) : (
          <CycleListView
            cycles={cycles}
            loading={loading}
            onSelect={setSelectedCycle}
            onCreateClick={() => setCreateOpen(true)}
          />
        )}
      </main>

      {/* ── Create Audit Cycle dialog */}
      <CreateCycleDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCycleCreated}
        toast={toast}
      />

      {/* ── Toasts */}
      <ToastRegion toasts={toasts} />
    </div>
  );
}
