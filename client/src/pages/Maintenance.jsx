import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Wrench,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  List,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PRIORITY_COLOR, TICKET_STATUS_COLOR } from '../lib/tokens';
import { cn } from '../lib/utils';

// ─── COLUMN CONFIG ─────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: 'Pending',            label: 'Pending' },
  { id: 'Approved',           label: 'Approved' },
  { id: 'TechnicianAssigned', label: 'Technician Assigned' },
  { id: 'InProgress',         label: 'In Progress' },
  { id: 'Resolved',           label: 'Resolved' },
];

const COLUMN_IDS = COLUMNS.map((c) => c.id);

// ─── STATUS DOT ────────────────────────────────────────────────────────────────
// §5.4 — the ONE recurring color component. A small dot + plain muted text.

function StatusDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <span
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
// §4.2 — flat pulsing blocks, no shimmer

function SkeletonCard() {
  return (
    <div className="border border-border rounded-lg p-3 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-16 bg-white/5 rounded" />
        <div className="h-2 w-2 rounded-full bg-white/5" />
      </div>
      <div className="h-4 w-full bg-white/5 rounded mb-1" />
      <div className="h-4 w-3/4 bg-white/5 rounded mb-3" />
      <div className="h-3 w-24 bg-white/5 rounded" />
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
// Sonner-style: bottom-right, no color except danger

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
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto px-4 py-2.5 rounded-lg border text-sm bg-popover text-foreground',
            t.type === 'danger'
              ? 'border-danger/30 text-danger'
              : 'border-border'
          )}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── DIALOGS (plain — no colored fills) ──────────────────────────────────────

function Dialog({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm bg-popover border border-border rounded-lg shadow-sm"
      >
        {/* Header */}
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
        {/* Body */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// Shared input/textarea/select styles — §5.8
const fieldCls =
  'w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:border-border focus:ring-1 focus:ring-white/10';

// Shared button styles
const btnPrimary =
  'px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background ' +
  'hover:bg-foreground/90 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed';
const btnOutline =
  'px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground bg-transparent ' +
  'hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20';
const btnDestructive =
  'px-4 py-2 rounded-md text-sm font-medium border border-danger/30 text-danger bg-transparent ' +
  'hover:bg-danger/5 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40';

// ── Approve confirm ────────────────────────────────────────────────────────────

function ApproveDialog({ ticket, onConfirm, onCancel }) {
  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Approve maintenance request">
      {ticket && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Approve maintenance for{' '}
            <span className="font-mono text-foreground">{ticket.asset?.tag}</span>?
            The asset will be marked{' '}
            <StatusDot color={TICKET_STATUS_COLOR.Approved} label="Under Maintenance" />.
          </p>
          <div className="flex justify-end gap-2">
            <button className={btnOutline} onClick={onCancel}>Cancel</button>
            <button className={btnPrimary} onClick={onConfirm}>Approve</button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// ── Assign technician ──────────────────────────────────────────────────────────

function AssignDialog({ ticket, onConfirm, onCancel }) {
  const [tech, setTech] = useState('');
  useEffect(() => { if (ticket) setTech(''); }, [ticket]);

  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Assign technician">
      {ticket && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Required before moving{' '}
            <span className="font-mono">{ticket.asset?.tag}</span> to Technician Assigned.
          </p>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Technician name</label>
            <input
              autoFocus
              className={fieldCls}
              placeholder="e.g. Roberto Sanchez"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && tech.trim()) onConfirm(tech.trim()); }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className={btnOutline} onClick={onCancel}>Cancel</button>
            <button
              className={btnPrimary}
              disabled={!tech.trim()}
              onClick={() => onConfirm(tech.trim())}
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// ── Resolve notes ──────────────────────────────────────────────────────────────

function ResolveDialog({ ticket, onConfirm, onCancel }) {
  const [notes, setNotes] = useState('');
  useEffect(() => { if (ticket) setNotes(''); }, [ticket]);

  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Resolve ticket">
      {ticket && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Add resolution notes for{' '}
            <span className="font-mono">{ticket.asset?.tag}</span>.
            The asset will return to Available.
          </p>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Resolution notes</label>
            <textarea
              autoFocus
              rows={3}
              className={fieldCls}
              placeholder="What was done to fix the issue?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className={btnOutline} onClick={onCancel}>Cancel</button>
            <button
              className={btnPrimary}
              disabled={!notes.trim()}
              onClick={() => onConfirm(notes.trim())}
            >
              Mark resolved
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// ── Reject with reason ─────────────────────────────────────────────────────────

function RejectDialog({ ticket, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  useEffect(() => { if (ticket) setReason(''); }, [ticket]);

  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Reject ticket">
      {ticket && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Provide a reason for rejecting{' '}
            <span className="font-mono">{ticket.asset?.tag}</span>.
            It will be removed from the board and archived.
          </p>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Reason (required)</label>
            <textarea
              autoFocus
              rows={3}
              className={fieldCls}
              placeholder="Why is this request being rejected?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className={btnOutline} onClick={onCancel}>Cancel</button>
            <button
              className={btnDestructive}
              disabled={!reason.trim()}
              onClick={() => onConfirm(reason.trim())}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// ── Raise request ─────────────────────────────────────────────────────────────

function RaiseDialog({ open, onClose, assets, onSubmit }) {
  const [form, setForm] = useState({ assetId: '', issue: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setForm({ assetId: '', issue: '', priority: 'Medium' }); setError(''); }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetId || !form.issue.trim()) {
      setError('Select an asset and describe the issue.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Raise maintenance request">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-xs text-danger border border-danger/30 rounded-md px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Asset *</label>
          <select
            required
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            className={fieldCls}
          >
            <option value="">Select asset…</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>{a.tag} — {a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Issue description *</label>
          <textarea
            required
            rows={3}
            className={fieldCls}
            placeholder="Describe the issue or defect…"
            value={form.issue}
            onChange={(e) => setForm({ ...form, issue: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className={fieldCls}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" className={btnOutline} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit ticket'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// ─── TICKET CARD ──────────────────────────────────────────────────────────────
// §5.2 — bg-card border border-border rounded-lg p-3, hover:bg-card-hover only
// No shadows, no colored borders, no lift

function TicketCard({ ticket, columnId, onMenuAction, isDragOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  // Placeholder gap while dragging (the card itself disappears)
  if (isDragging && !isDragOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border border-dashed border-border rounded-lg h-[100px] bg-white/[0.02]"
        aria-hidden="true"
      />
    );
  }

  const isResolved = columnId === 'Resolved';
  const priorityColor = PRIORITY_COLOR[ticket.priority] ?? PRIORITY_COLOR.Low;

  const resolvedDate = isResolved && ticket.updatedAt
    ? new Date(ticket.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      {...(!isDragOverlay ? { ...attributes, ...listeners } : {})}
      className={cn(
        'bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing select-none',
        isDragOverlay
          ? 'border-border shadow-sm' // subtle — design.md says no glow/scale
          : 'hover:bg-card-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20'
      )}
      tabIndex={isDragOverlay ? -1 : 0}
      role="button"
      aria-label={`Ticket: ${ticket.asset?.tag} — ${ticket.issue}`}
    >
      {/* Top row: asset tag (mono) + priority dot */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm text-foreground">{ticket.asset?.tag ?? '—'}</span>
        <div className="flex items-center gap-2">
          {/* Priority dot only — no text label on card, saves space */}
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: priorityColor }}
            title={`Priority: ${ticket.priority}`}
            aria-label={`Priority: ${ticket.priority}`}
          />
          {/* ⋯ card menu — only shown in Pending column for Reject action */}
          {columnId === 'Pending' && (
            <CardMenu ticket={ticket} onAction={onMenuAction} />
          )}
        </div>
      </div>

      {/* Issue description — 2 line clamp */}
      <p className="text-sm text-foreground line-clamp-2 mb-2 leading-snug">
        {ticket.asset?.name ? `${ticket.asset.name} — ` : ''}{ticket.issue}
      </p>

      {/* Bottom row: context-dependent */}
      <div className="text-xs text-muted-foreground font-mono">
        {isResolved && resolvedDate ? (
          <span className="inline-flex items-center gap-1.5">
            {/* §4 — small success dot next to resolution date is enough, no border/bg on card */}
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: TICKET_STATUS_COLOR.Resolved }}
            />
            Resolved {resolvedDate}
          </span>
        ) : ticket.technician ? (
          <span className="inline-flex items-center gap-1.5">
            {/* Plain gray initials avatar */}
            <span className="inline-flex h-4 w-4 rounded-full bg-white/10 items-center justify-center text-[9px] font-sans font-medium text-foreground shrink-0">
              {ticket.technician[0]?.toUpperCase()}
            </span>
            <span className="truncate">{ticket.technician}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

// ─── CARD CONTEXT MENU (⋯) ────────────────────────────────────────────────────

function CardMenu({ ticket, onAction }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20"
        aria-label="Card actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-6 z-50 w-36 bg-popover border border-border rounded-lg py-1 shadow-sm"
        >
          <button
            role="menuitem"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onAction(ticket, 'reject');
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-danger hover:bg-danger/5 focus:outline-none focus:bg-danger/5"
          >
            Reject ticket…
          </button>
        </div>
      )}
    </div>
  );
}

// ─── KANBAN COLUMN ────────────────────────────────────────────────────────────

function KanbanColumn({ col, tickets, isOver, isLoading, onMenuAction }) {
  return (
    <div
      className={cn(
        'flex flex-col shrink-0 w-60',
        // Hairline right border separates lanes — no background fill
        'border-r border-border last:border-r-0'
      )}
    >
      {/* Column header — label + count, border-b beneath */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{col.label}</span>
        <span className="text-xs text-muted-foreground">{tickets.length}</span>
      </div>

      {/* Drop zone */}
      <SortableContext
        items={tickets.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            'flex-1 px-3 py-3 flex flex-col gap-2 min-h-[200px] transition-colors duration-150',
            isOver && 'bg-white/[0.02]' // faint highlight on drag-over — §4 prompt
          )}
        >
          {isLoading ? (
            // §4.2 skeleton loading
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : tickets.length === 0 ? (
            // §5.7 empty state — plain text only, no icon (5 empty lanes side-by-side would be noisy)
            <p className="text-xs text-muted-foreground text-center mt-6">No tickets</p>
          ) : (
            tickets.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                columnId={col.id}
                onMenuAction={onMenuAction}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── TABLE VIEW ───────────────────────────────────────────────────────────────
// §5.6 — flat list for scanning/filtering; same data, no color

function TableView({ tickets }) {
  const statusLabel = {
    Pending: 'Pending',
    Approved: 'Approved',
    TechnicianAssigned: 'Tech Assigned',
    InProgress: 'In Progress',
    Resolved: 'Resolved',
    Rejected: 'Rejected',
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {['Asset', 'Issue', 'Priority', 'Status', 'Technician', 'Raised by', 'Date'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-xs text-muted-foreground">
                No maintenance tickets found.
              </td>
            </tr>
          ) : (
            tickets.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-b-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-mono text-sm text-foreground">{t.asset?.tag}</td>
                <td className="px-4 py-3 text-foreground max-w-[200px] truncate">{t.issue}</td>
                <td className="px-4 py-3">
                  <StatusDot color={PRIORITY_COLOR[t.priority]} label={t.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusDot
                    color={TICKET_STATUS_COLOR[t.status] ?? PRIORITY_COLOR.Low}
                    label={statusLabel[t.status] ?? t.status}
                  />
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                  {t.technician ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{t.raisedBy?.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Maintenance() {
  const { user } = useAuth();
  const isManager = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [tickets, setTickets]     = useState([]);
  const [assets,  setAssets]      = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view,    setView]        = useState('board'); // 'board' | 'table'

  // Drag state
  const [activeDrag,    setActiveDrag]    = useState(null); // { ticket, sourceColId }
  const [overColId,     setOverColId]     = useState(null);

  // Dialog state — all nullable; non-null = dialog open with that ticket
  const [approveTarget, setApproveTarget] = useState(null);
  const [assignTarget,  setAssignTarget]  = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [raiseOpen,     setRaiseOpen]     = useState(false);

  const { toasts, push: toast } = useToasts();

  // dnd-kit sensors — keyboard + pointer
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/assets'),
      ]);
      setTickets(mRes.data);
      setAssets(aRes.data);
    } catch {
      toast('Failed to load maintenance data.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Board helpers ──────────────────────────────────────────────────────────

  // Active board — Rejected tickets are archived to table only
  const boardTickets = tickets.filter((t) => t.status !== 'Rejected');

  const colCards = (colId) => boardTickets.filter((t) => t.status === colId);

  const findTicket  = (id) => tickets.find((t) => t.id === id);
  const findColId   = (id) => {
    // id might be a column id or a card id
    if (COLUMN_IDS.includes(id)) return id;
    return tickets.find((t) => t.id === id)?.status ?? null;
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = ({ active }) => {
    const ticket = findTicket(active.id);
    if (ticket) setActiveDrag({ ticket, sourceColId: ticket.status });
  };

  const handleDragOver = ({ over }) => {
    if (!over) { setOverColId(null); return; }
    setOverColId(findColId(over.id));
  };

  const handleDragEnd = ({ active, over }) => {
    const drag = activeDrag;
    setActiveDrag(null);
    setOverColId(null);

    if (!over || !drag) return;

    const toColId   = findColId(over.id);
    const fromColId = drag.sourceColId;
    const ticket    = drag.ticket;

    if (!toColId || toColId === fromColId) return;

    const fromIdx = COLUMN_IDS.indexOf(fromColId);
    const toIdx   = COLUMN_IDS.indexOf(toColId);

    // Enforce sequential — only ±1
    if (Math.abs(toIdx - fromIdx) > 1) {
      toast('Approve this request first.', 'default');
      return;
    }

    // Role guard
    if (!isManager) {
      toast('Only Asset Managers can move tickets.', 'danger');
      return;
    }

    // Each transition — open the right dialog (or execute free drag)
    if (fromColId === 'Pending' && toColId === 'Approved') {
      setApproveTarget(ticket);
    } else if (fromColId === 'Approved' && toColId === 'TechnicianAssigned') {
      setAssignTarget(ticket);
    } else if (fromColId === 'TechnicianAssigned' && toColId === 'InProgress') {
      // Free drag
      execTransition(ticket.id, 'start');
    } else if (fromColId === 'InProgress' && toColId === 'Resolved') {
      setResolveTarget(ticket);
    } else {
      // Backwards — just snap (no special animation per prompt)
      toast('Tickets can only move forward.', 'default');
    }
  };

  // ── API calls ──────────────────────────────────────────────────────────────

  const execTransition = async (id, action, payload = {}) => {
    try {
      await api.patch(`/maintenance/${id}/${action}`, payload);
      await fetchAll();
    } catch (err) {
      toast(err.response?.data?.error ?? 'Action failed.', 'danger');
    }
  };

  const handleApprove = async () => {
    const t = approveTarget;
    setApproveTarget(null);
    await execTransition(t.id, 'approve');
    toast(`${t.asset?.tag} → Under Maintenance`);
  };

  const handleAssign = async (techName) => {
    const t = assignTarget;
    setAssignTarget(null);
    await execTransition(t.id, 'assign', { technician: techName });
    toast(`Technician assigned to ${t.asset?.tag}`);
  };

  const handleResolve = async (notes) => {
    const t = resolveTarget;
    setResolveTarget(null);
    await execTransition(t.id, 'resolve', { notes });
    toast(`${t.asset?.tag} → Available`);
  };

  const handleReject = async (reason) => {
    const t = rejectTarget;
    setRejectTarget(null);
    await execTransition(t.id, 'reject', { reason });
    toast(`Ticket archived.`);
  };

  const handleRaise = async (form) => {
    await api.post('/maintenance', form);
    await fetchAll();
  };

  // Card ⋯ menu
  const handleMenuAction = (ticket, action) => {
    if (action === 'reject') setRejectTarget(ticket);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    // §1 — dark only. Apply .dark class here so CSS vars resolve correctly.
    <div className="dark min-h-screen bg-background text-foreground flex flex-col font-sans">

      {/* ── Page header §4.1 ─────────────────────────────────────────────── */}
      <header className="px-10 py-6 border-b border-border flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
            Maintenance
          </p>
          {/* §3 — text-2xl font-medium tracking-tight, not heavy */}
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Maintenance Management
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Board / Table toggle — underline-style tab, no colored pill */}
          <div className="flex items-center border-b border-border">
            {[
              { id: 'board', label: 'Board', Icon: LayoutGrid },
              { id: 'table', label: 'Table', Icon: List },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm -mb-px border-b-2 transition-colors',
                  view === id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* §5.1 — One primary button per view, solid off-white fill, black text */}
          <button
            onClick={() => setRaiseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:bg-foreground/90 focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            <Plus className="w-4 h-4" />
            Raise Maintenance Request
          </button>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 px-10 py-6">

        {/* ── Board view ───────────────────────────────────────────────── */}
        {view === 'board' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/*
              Columns are horizontally scrollable as a set on narrower viewports.
              Below ~640px, user should switch to Table view (toggle defaults handled
              in layout — board stays scrollable, not stacked vertically).
            */}
            <div className="flex overflow-x-auto border border-border rounded-lg">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  tickets={colCards(col.id)}
                  isOver={overColId === col.id}
                  isLoading={loading}
                  onMenuAction={handleMenuAction}
                />
              ))}
            </div>

            {/* Drag overlay — card follows cursor; subtle, no scale/glow */}
            <DragOverlay dropAnimation={null}>
              {activeDrag ? (
                <TicketCard
                  ticket={activeDrag.ticket}
                  columnId={activeDrag.sourceColId}
                  onMenuAction={() => {}}
                  isDragOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* ── Table view ───────────────────────────────────────────────── */}
        {view === 'table' && (
          loading ? (
            <div className="border border-border rounded-lg p-6 space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-md" />
              ))}
            </div>
          ) : (
            <TableView tickets={tickets} />
          )
        )}
      </main>

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <ApproveDialog
        ticket={approveTarget}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />
      <AssignDialog
        ticket={assignTarget}
        onConfirm={handleAssign}
        onCancel={() => setAssignTarget(null)}
      />
      <ResolveDialog
        ticket={resolveTarget}
        onConfirm={handleResolve}
        onCancel={() => setResolveTarget(null)}
      />
      <RejectDialog
        ticket={rejectTarget}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
      <RaiseDialog
        open={raiseOpen}
        onClose={() => setRaiseOpen(false)}
        assets={assets}
        onSubmit={handleRaise}
      />

      {/* ── Toasts (sonner-style) ─────────────────────────────────────── */}
      <ToastRegion toasts={toasts} />
    </div>
  );
}
