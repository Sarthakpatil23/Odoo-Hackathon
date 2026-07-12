import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  MoreHorizontal,
  LayoutGrid,
  List,
  X,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatusDot } from '../components/shared/StatusDot';
import { Skeleton } from '../components/shared/Skeleton';
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

// Priority → StatusDot status
const PRIORITY_STATUS_MAP = {
  Low:    'neutral',
  Medium: 'warning',
  High:   'attention',
};

// ─── HARDCODED DEMO DATA ──────────────────────────────────────────────────────
const INITIAL_TICKETS = [
  {
    id: 'tkt-1',
    issue: 'Hydraulic fluid leak noticed in Warehouse A bay.',
    priority: 'High',
    status: 'Pending',
    technician: null,
    createdAt: '2026-07-10T10:00:00.000Z',
    updatedAt: '2026-07-10T10:00:00.000Z',
    asset: { id: 'ast-1', tag: 'AF-0087', name: 'Forklift' },
    raisedBy: { name: 'Aarav Patel' },
  },
  {
    id: 'tkt-2',
    issue: 'Thermal throttling under heavy compilation workloads.',
    priority: 'Medium',
    status: 'Approved',
    technician: null,
    createdAt: '2026-07-09T14:30:00.000Z',
    updatedAt: '2026-07-09T15:00:00.000Z',
    asset: { id: 'ast-2', tag: 'AF-0020', name: 'MacBook Pro 16"' },
    raisedBy: { name: 'Sarah Connor' },
  },
  {
    id: 'tkt-3',
    issue: 'Bulb is severely dimming — requires immediate replacement.',
    priority: 'Low',
    status: 'TechnicianAssigned',
    technician: 'Roberto Sanchez',
    createdAt: '2026-07-08T09:15:00.000Z',
    updatedAt: '2026-07-08T11:00:00.000Z',
    asset: { id: 'ast-3', tag: 'AF-0062', name: 'Conference Projector' },
    raisedBy: { name: 'John Doe' },
  },
  {
    id: 'tkt-4',
    issue: 'Compressor making loud rattling noise in the lobby area.',
    priority: 'High',
    status: 'InProgress',
    technician: 'Lara Croft',
    createdAt: '2026-07-07T08:00:00.000Z',
    updatedAt: '2026-07-07T10:30:00.000Z',
    asset: { id: 'ast-4', tag: 'AF-0010', name: 'AC Unit — Floor 2' },
    raisedBy: { name: 'Priya Shah' },
  },
  {
    id: 'tkt-5',
    issue: 'Faulty power supply unit causing random shutdowns.',
    priority: 'High',
    status: 'Resolved',
    technician: 'Roberto Sanchez',
    createdAt: '2026-07-05T12:00:00.000Z',
    updatedAt: '2026-07-06T16:00:00.000Z',
    asset: { id: 'ast-5', tag: 'SR-09', name: 'Dell Server Rack' },
    raisedBy: { name: 'John Doe' },
  },
  {
    id: 'tkt-6',
    issue: 'Battery draining to 0% within 2 hours — won\'t hold charge.',
    priority: 'Medium',
    status: 'Pending',
    technician: null,
    createdAt: '2026-07-11T07:45:00.000Z',
    updatedAt: '2026-07-11T07:45:00.000Z',
    asset: { id: 'ast-6', tag: 'AF-0044', name: 'iPad Pro 12.9"' },
    raisedBy: { name: 'Maya Reddy' },
  },
  {
    id: 'tkt-7',
    issue: 'Autofocus lens stuck — cannot capture sharp images.',
    priority: 'Low',
    status: 'Resolved',
    technician: 'Lara Croft',
    createdAt: '2026-07-04T13:00:00.000Z',
    updatedAt: '2026-07-05T09:30:00.000Z',
    asset: { id: 'ast-7', tag: 'AF-0301', name: 'Sony Alpha A7 Camera' },
    raisedBy: { name: 'Ethan Rao' },
  },
];

const DEMO_ASSETS = [
  { id: 'ast-1', tag: 'AF-0087', name: 'Forklift' },
  { id: 'ast-2', tag: 'AF-0020', name: 'MacBook Pro 16"' },
  { id: 'ast-3', tag: 'AF-0062', name: 'Conference Projector' },
  { id: 'ast-4', tag: 'AF-0010', name: 'AC Unit — Floor 2' },
  { id: 'ast-5', tag: 'SR-09',   name: 'Dell Server Rack' },
  { id: 'ast-6', tag: 'AF-0044', name: 'iPad Pro 12.9"' },
  { id: 'ast-7', tag: 'AF-0301', name: 'Sony Alpha A7 Camera' },
  { id: 'ast-8', tag: 'AF-0055', name: 'Standing Desk Motor Unit' },
  { id: 'ast-9', tag: 'AF-0112', name: 'Epson Color Printer' },
];

const DEMO_EMPLOYEES = [
  { id: 'emp-1', name: 'Roberto Sanchez', email: 'roberto@assetflow.com' },
  { id: 'emp-2', name: 'Lara Croft',      email: 'lara@assetflow.com' },
  { id: 'emp-3', name: 'Aarav Patel',     email: 'aarav@assetflow.com' },
  { id: 'emp-4', name: 'Sarah Connor',    email: 'sarah@assetflow.com' },
  { id: 'emp-5', name: 'Maya Reddy',      email: 'maya@assetflow.com' },
];

// ─── SHARED STYLE TOKENS ───────────────────────────────────────────────────────
const fieldCls =
  'w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-white/10 transition-shadow';

const btnPrimary =
  'px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background ' +
  'hover:bg-foreground/90 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

const btnOutline =
  'px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground bg-transparent ' +
  'hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors';

const btnDestructive =
  'px-4 py-2 rounded-md text-sm font-medium border border-danger/30 text-danger bg-transparent ' +
  'hover:bg-danger/5 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40 transition-colors';

// ─── INLINE TOAST ─────────────────────────────────────────────────────────────
function useLocalToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'default') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={cn(
            'pointer-events-auto px-4 py-2.5 rounded-lg border text-sm bg-popover',
            'animate-fade-in',
            t.type === 'danger'
              ? 'border-danger/30 text-danger'
              : 'border-border text-foreground'
          )}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── SKELETON CARD ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="border border-border rounded-lg p-3 bg-card flex flex-col gap-2 h-[96px] justify-between select-none">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

// ─── DIALOG SHELL ─────────────────────────────────────────────────────────────
function Dialog({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm bg-popover border border-border rounded-lg shadow-sm animate-fade-in"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── APPROVE DIALOG ────────────────────────────────────────────────────────────
function ApproveDialog({ ticket, onConfirm, onCancel }) {
  return (
    <Dialog open={!!ticket} onClose={onCancel} title={`Approve maintenance — ${ticket?.asset?.tag || ''}?`}>
      {ticket && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Approve maintenance for{' '}
            <span className="font-mono text-foreground">{ticket.asset?.tag}</span>.
            The asset status will be set to{' '}
            <span className="text-foreground">Under Maintenance</span>.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button className={btnOutline} onClick={onCancel}>Cancel</button>
            <button className={btnPrimary} onClick={onConfirm}>Approve</button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// ─── ASSIGN TECHNICIAN DIALOG ─────────────────────────────────────────────────
function AssignDialog({ ticket, employees, onConfirm, onCancel }) {
  const [selectedTech, setSelectedTech] = useState('');

  useEffect(() => { if (ticket) setSelectedTech(''); }, [ticket]);

  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Assign technician">
      {ticket && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select a technician for{' '}
            <span className="font-mono text-foreground">{ticket.asset?.tag}</span>.
          </p>
          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground font-medium">Technician *</label>
            <select
              className={fieldCls}
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">Select technician…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <button className={btnOutline} onClick={onCancel}>Cancel</button>
            <button
              className={btnPrimary}
              disabled={!selectedTech}
              onClick={() => onConfirm(selectedTech)}
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// ─── RESOLVE DIALOG ────────────────────────────────────────────────────────────
function ResolveDialog({ ticket, onConfirm, onCancel }) {
  const [notes, setNotes] = useState('');
  useEffect(() => { if (ticket) setNotes(''); }, [ticket]);

  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Resolve maintenance ticket">
      {ticket && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Provide resolution notes for{' '}
            <span className="font-mono text-foreground">{ticket.asset?.tag}</span>.
            The asset status will revert to{' '}
            <span className="text-foreground">Available</span>.
          </p>
          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground font-medium">Resolution Notes *</label>
            <textarea
              autoFocus
              rows={3}
              className={fieldCls}
              placeholder="Describe repairs, replacement parts, or checks done…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <button className={btnOutline} onClick={onCancel}>Cancel</button>
            <button
              className={btnPrimary}
              disabled={!notes.trim()}
              onClick={() => onConfirm(notes.trim())}
            >
              Resolve
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// ─── REJECT DIALOG ─────────────────────────────────────────────────────────────
function RejectDialog({ ticket, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  useEffect(() => { if (ticket) setReason(''); }, [ticket]);

  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Reject maintenance ticket">
      {ticket && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Provide a rejection reason for{' '}
            <span className="font-mono text-foreground">{ticket.asset?.tag}</span>.
            The ticket will be archived.
          </p>
          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground font-medium">Rejection Reason *</label>
            <textarea
              autoFocus
              rows={3}
              className={fieldCls}
              placeholder="Provide reason for rejecting this request…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
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

// ─── ASSET COMBOBOX ────────────────────────────────────────────────────────────
function AssetCombobox({ assets, value, onChange, error }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = assets.filter(
    (a) =>
      a.tag.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase())
  );
  const selected = assets.find((a) => a.id === value);

  return (
    <div className="relative">
      <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Asset *</label>
      <div className="relative">
        <input
          type="text"
          className={cn(fieldCls, error && 'border-danger/30')}
          placeholder={selected ? `${selected.tag} — ${selected.name}` : 'Search by tag or name…'}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
          <Search size={14} />
        </div>
      </div>
      {open && (
        <div className="absolute z-[110] w-full mt-1 max-h-48 overflow-y-auto bg-popover border border-border rounded-md py-1 shadow-md">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">No assets found</div>
          ) : (
            filtered.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => { onChange(asset.id); setSearch(''); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors',
                  value === asset.id && 'bg-white/5 font-medium'
                )}
              >
                <span className="font-mono text-xs text-muted-foreground mr-2">{asset.tag}</span>
                <span>{asset.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── RAISE DIALOG ──────────────────────────────────────────────────────────────
function RaiseDialog({ open, onClose, assets, onSubmit }) {
  const [assetId, setAssetId]   = useState('');
  const [issue, setIssue]       = useState('');
  const [priority, setPriority] = useState('Medium');
  const [error, setError]       = useState('');

  useEffect(() => {
    if (open) { setAssetId(''); setIssue(''); setPriority('Medium'); setError(''); }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assetId) { setError('Please select an asset.'); return; }
    if (!issue.trim()) { setError('Please describe the issue.'); return; }
    onSubmit({ assetId, issue: issue.trim(), priority });
    onClose();
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
        <AssetCombobox assets={assets} value={assetId} onChange={setAssetId} error={!!error && !assetId} />
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Issue description *</label>
          <textarea
            rows={3}
            className={fieldCls}
            placeholder="Describe the issue or defect…"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={fieldCls}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <button type="button" className={btnOutline} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary}>Submit ticket</button>
        </div>
      </form>
    </Dialog>
  );
}

// ─── CARD OVERFLOW MENU (⋯) ───────────────────────────────────────────────────
function CardMenu({ ticket, onAction }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
        aria-label="Actions"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-6 z-50 w-36 bg-popover border border-border rounded-lg py-1 shadow-md"
          >
            <button
              role="menuitem"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setOpen(false); onAction(ticket, 'reject'); }}
              className="w-full text-left px-3 py-1.5 text-xs text-danger hover:bg-danger/5 transition-colors"
            >
              Reject ticket…
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TICKET CARD ───────────────────────────────────────────────────────────────
function TicketCard({ ticket, columnId, onMenuAction, isManager, isDragOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id, disabled: !isManager });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  if (isDragging && !isDragOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border border-dashed border-border rounded-lg h-[96px] bg-white/[0.01]"
        aria-hidden="true"
      />
    );
  }

  const isResolved = columnId === 'Resolved';
  const resolvedDate = isResolved && ticket.updatedAt
    ? new Date(ticket.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      {...(!isDragOverlay ? { ...attributes, ...listeners } : {})}
      className={cn(
        'bg-card border rounded-lg p-3 text-left flex flex-col justify-between h-[96px] shrink-0 select-none',
        isDragOverlay
          ? 'border-border-strong bg-card-hover cursor-grabbing shadow-sm'
          : 'border-border hover:bg-card-hover cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20'
      )}
      tabIndex={isDragOverlay ? -1 : 0}
      role="button"
      aria-label={`Ticket: ${ticket.asset?.tag} — ${ticket.issue}`}
    >
      {/* Top: Asset Tag + Priority dot + menu */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-foreground">{ticket.asset?.tag ?? '—'}</span>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <StatusDot status={PRIORITY_STATUS_MAP[ticket.priority] || 'neutral'} label="" />
          {columnId === 'Pending' && isManager && (
            <CardMenu ticket={ticket} onAction={onMenuAction} />
          )}
        </div>
      </div>

      {/* Middle: Issue text */}
      <p className="text-xs text-foreground line-clamp-2 leading-snug">{ticket.issue}</p>

      {/* Bottom: resolved date or technician */}
      <div className="text-[10px] text-muted-foreground font-mono">
        {isResolved && resolvedDate ? (
          <span className="inline-flex items-center gap-1">
            <StatusDot status="success" label="" className="shrink-0" />
            <span>Resolved {resolvedDate}</span>
          </span>
        ) : ticket.technician ? (
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex h-3.5 w-3.5 rounded-full bg-white/10 items-center justify-center text-[8px] font-sans font-medium text-foreground shrink-0">
              {ticket.technician[0]?.toUpperCase()}
            </span>
            <span className="truncate max-w-[120px]">{ticket.technician}</span>
          </span>
        ) : (
          <span className="text-muted-foreground-2">—</span>
        )}
      </div>
    </div>
  );
}

// ─── KANBAN COLUMN ─────────────────────────────────────────────────────────────
function KanbanColumn({ col, tickets, isOver, isLoading, onMenuAction, isManager }) {
  const { setNodeRef } = useDroppable({ id: col.id });
  return (
    <div ref={setNodeRef} className="flex flex-col shrink-0 w-72 border-r border-border last:border-r-0 bg-transparent">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between select-none">
        <span className="text-sm font-medium text-foreground">{col.label}</span>
        <span className="text-xs text-muted-foreground font-mono">{tickets.length}</span>
      </div>
      <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className={cn(
          'flex-1 px-3 py-3 flex flex-col gap-2 min-h-[400px] transition-colors duration-150',
          isOver && 'bg-white/[0.02]'
        )}>
          {isLoading ? (
            <><SkeletonCard /><SkeletonCard /></>
          ) : tickets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <span className="text-xs text-muted-foreground select-none">No tickets</span>
            </div>
          ) : (
            tickets.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                columnId={col.id}
                onMenuAction={onMenuAction}
                isManager={isManager}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── TABLE VIEW ────────────────────────────────────────────────────────────────
function TableView({ tickets }) {
  const statusLabel = {
    Pending:            'Pending',
    Approved:           'Approved',
    TechnicianAssigned: 'Tech Assigned',
    InProgress:         'In Progress',
    Resolved:           'Resolved',
    Rejected:           'Rejected',
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border select-none">
            {['Asset', 'Issue', 'Priority', 'Status', 'Technician', 'Raised by', 'Date'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium">
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
              <tr key={t.id} className="border-b border-border last:border-b-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-sm text-foreground">{t.asset?.tag}</td>
                <td className="px-4 py-3 text-foreground max-w-[200px] truncate">{t.issue}</td>
                <td className="px-4 py-3">
                  <StatusDot status={PRIORITY_STATUS_MAP[t.priority] || 'neutral'} label={t.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusDot
                    status={
                      t.status === 'TechnicianAssigned' ? 'allocated' :
                      t.status === 'InProgress' ? 'in-progress' :
                      t.status.toLowerCase()
                    }
                    label={statusLabel[t.status] ?? t.status}
                  />
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{t.technician ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{t.raisedBy?.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Maintenance() {
  const { user } = useAuth();
  const { toasts, push: toast } = useLocalToast();
  const isManager = user?.role === 'Admin' || user?.role === 'AssetManager' || true; // allow all for demo

  // ── State ─────────────────────────────────────────────────────────────────
  const [tickets, setTickets]         = useState(INITIAL_TICKETS);
  const [userSelectedView, setView]   = useState('board');
  const [isMobile, setIsMobile]       = useState(false);

  // Drag overlay
  const [activeDrag, setActiveDrag]   = useState(null);
  const [overColId, setOverColId]     = useState(null);

  // Dialog targets
  const [approveTarget, setApproveTarget] = useState(null);
  const [assignTarget,  setAssignTarget]  = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [raiseOpen,     setRaiseOpen]     = useState(false);

  // Responsive: force table on mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const activeView = isMobile ? 'table' : userSelectedView;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Derived data ──────────────────────────────────────────────────────────
  const boardTickets = tickets.filter((t) => t.status !== 'Rejected');
  const colCards = (colId) => boardTickets.filter((t) => t.status === colId);
  const findTicket = (id) => tickets.find((t) => t.id === id);
  const findColId  = (id) => COLUMN_IDS.includes(id) ? id : (tickets.find((t) => t.id === id)?.status ?? null);

  // ── In-memory transition ──────────────────────────────────────────────────
  const applyTransition = (id, action, payload = {}) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = {
          approve:  'Approved',
          assign:   'TechnicianAssigned',
          start:    'InProgress',
          resolve:  'Resolved',
          reject:   'Rejected',
        }[action] ?? t.status;
        return {
          ...t,
          status:     next,
          technician: action === 'assign' ? payload.technician : t.technician,
          updatedAt:  new Date().toISOString(),
        };
      })
    );
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = ({ active }) => {
    const t = findTicket(active.id);
    if (t) setActiveDrag({ ticket: t, sourceColId: t.status });
  };

  const handleDragOver = ({ over }) => {
    setOverColId(over ? findColId(over.id) : null);
  };

  const handleDragEnd = ({ active, over }) => {
    const drag = activeDrag;
    setActiveDrag(null);
    setOverColId(null);
    if (!over || !drag) return;

    const toColId   = findColId(over.id);
    const fromColId = drag.sourceColId;
    if (!toColId || toColId === fromColId) return;

    const fromIdx = COLUMN_IDS.indexOf(fromColId);
    const toIdx   = COLUMN_IDS.indexOf(toColId);

    if (Math.abs(toIdx - fromIdx) > 1) {
      toast('Move tickets stage-by-stage.', 'danger');
      return;
    }

    const ticket = drag.ticket;

    if (fromColId === 'Pending' && toColId === 'Approved') {
      setApproveTarget(ticket);
    } else if (fromColId === 'Approved' && toColId === 'TechnicianAssigned') {
      setAssignTarget(ticket);
    } else if (fromColId === 'TechnicianAssigned' && toColId === 'InProgress') {
      applyTransition(ticket.id, 'start');
      toast(`${ticket.asset?.tag} — In Progress`);
    } else if (fromColId === 'InProgress' && toColId === 'Resolved') {
      setResolveTarget(ticket);
    } else {
      toast('Invalid stage transition.', 'danger');
    }
  };

  // ── Dialog confirm handlers ───────────────────────────────────────────────
  const handleApprove = () => {
    const t = approveTarget;
    setApproveTarget(null);
    if (!t) return;
    applyTransition(t.id, 'approve');
    toast(`${t.asset?.tag} approved → Under Maintenance`);
  };

  const handleAssign = (techName) => {
    const t = assignTarget;
    setAssignTarget(null);
    if (!t) return;
    applyTransition(t.id, 'assign', { technician: techName });
    toast(`${techName} assigned to ${t.asset?.tag}`);
  };

  const handleResolve = (notes) => {
    const t = resolveTarget;
    setResolveTarget(null);
    if (!t) return;
    applyTransition(t.id, 'resolve');
    toast(`${t.asset?.tag} resolved → Available`);
  };

  const handleReject = (reason) => {
    const t = rejectTarget;
    setRejectTarget(null);
    if (!t) return;
    applyTransition(t.id, 'reject');
    toast('Ticket rejected and archived.');
  };

  const handleRaise = ({ assetId, issue, priority }) => {
    const selectedAsset = DEMO_ASSETS.find((a) => a.id === assetId);
    const newTicket = {
      id:         `tkt-${Date.now()}`,
      issue,
      priority,
      status:     'Pending',
      technician: null,
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      asset:      selectedAsset
        ? { id: selectedAsset.id, tag: selectedAsset.tag, name: selectedAsset.name }
        : null,
      raisedBy: { name: user?.name || 'Demo User' },
    };
    setTickets((prev) => [newTicket, ...prev]);
    toast('Maintenance request raised successfully.');
  };

  const handleMenuAction = (ticket, action) => {
    if (action === 'reject') setRejectTarget(ticket);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <style>{`
        @keyframes pure-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* ── 1. PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none pb-4 border-b border-border/40">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Maintenance
          </span>
          <h1 className="text-2xl font-medium tracking-tight text-foreground mt-0.5">
            Maintenance Management
          </h1>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* View toggle — Board / Table (desktop only) */}
          {!isMobile && (
            <div className="flex border-b border-border gap-0 h-9">
              {[
                { id: 'board', label: 'Board', Icon: LayoutGrid },
                { id: 'table', label: 'Table', Icon: List },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={cn(
                    'relative px-4 py-1.5 text-sm transition-colors flex items-center gap-1.5',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20',
                    userSelectedView === item.id
                      ? 'text-foreground font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground after:content-[""]'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.Icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Raise request */}
          <button onClick={() => setRaiseOpen(true)} className={btnPrimary}>
            <Plus className="w-4 h-4 mr-1.5 inline-block" />
            Raise Maintenance Request
          </button>
        </div>
      </div>

      {/* ── 2. WORKSPACE ───────────────────────────────────────────────────── */}
      <div className="min-h-[500px]">
        {/* BOARD VIEW */}
        {activeView === 'board' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex overflow-x-auto border border-border rounded-lg">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  tickets={colCards(col.id)}
                  isOver={overColId === col.id}
                  isLoading={false}
                  onMenuAction={handleMenuAction}
                  isManager={isManager}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeDrag ? (
                <TicketCard
                  ticket={activeDrag.ticket}
                  columnId={activeDrag.sourceColId}
                  onMenuAction={() => {}}
                  isManager={isManager}
                  isDragOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* TABLE VIEW */}
        {activeView === 'table' && (
          <div className="animate-fade-in">
            <TableView tickets={tickets.filter((t) => t.status !== 'Rejected')} />
          </div>
        )}
      </div>

      {/* ── 3. CONFIRMATION DIALOGS ────────────────────────────────────────── */}
      <ApproveDialog
        ticket={approveTarget}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />
      <AssignDialog
        ticket={assignTarget}
        employees={DEMO_EMPLOYEES}
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
        assets={DEMO_ASSETS}
        onSubmit={handleRaise}
      />

      {/* ── Toasts ─────────────────────────────────────────────────────────── */}
      <ToastStack toasts={toasts} />
    </div>
  );
}
