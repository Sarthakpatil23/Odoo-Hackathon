import React, { useState, useEffect, useCallback } from 'react';
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
  Plus,
  MoreHorizontal,
  LayoutGrid,
  List,
  X,
  AlertCircle,
  Search,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/shared/Toast';
import { StatusDot } from '../components/shared/StatusDot';
import { Skeleton } from '../components/shared/Skeleton';
import { Card } from '../components/shared/Card';
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

// Priority mappings to design system StatusDot statuses
const PRIORITY_STATUS_MAP = {
  Low: 'neutral',
  Medium: 'warning',
  High: 'attention',
};

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

// ─── PLAIN DIALOG CONTAINER ────────────────────────────────────────────────────
function Dialog({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-150 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm bg-popover border border-border rounded-lg shadow-sm animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20"
            aria-label="Close dialog"
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

// Shared Form Input Classes (design.md §5.8)
const fieldCls =
  'w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-white/10 transition-shadow';

// Shared Button Classes (design.md §5.1)
const btnPrimary =
  'px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background ' +
  'hover:bg-foreground/90 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';
const btnOutline =
  'px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground bg-transparent ' +
  'hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors';
const btnDestructive =
  'px-4 py-2 rounded-md text-sm font-medium border border-danger/30 text-danger bg-transparent ' +
  'hover:bg-danger/5 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40 transition-colors';

// ─── SUB-DIALOGS ───────────────────────────────────────────────────────────────

// 1. Approve Dialog
function ApproveDialog({ ticket, onConfirm, onCancel }) {
  return (
    <Dialog open={!!ticket} onClose={onCancel} title={`Approve maintenance for ${ticket?.asset?.tag || ''}?`}>
      {ticket && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Approve maintenance for <span className="font-mono text-foreground">{ticket.asset?.tag}</span>.
            The related asset status will synchronize to <span className="text-foreground">Under Maintenance</span>.
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

// 2. Assign Technician Dialog (Searchable Select list)
function AssignDialog({ ticket, employees, onConfirm, onCancel }) {
  const [selectedTech, setSelectedTech] = useState('');
  
  useEffect(() => {
    if (ticket) setSelectedTech('');
  }, [ticket]);

  const handleConfirm = () => {
    if (selectedTech) {
      onConfirm(selectedTech);
    }
  };

  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Assign technician">
      {ticket && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select a technician for <span className="font-mono text-foreground">{ticket.asset?.tag}</span> to transition request.
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
              onClick={handleConfirm}
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// 3. Resolve Dialog
function ResolveDialog({ ticket, onConfirm, onCancel }) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (ticket) setNotes('');
  }, [ticket]);

  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Resolve maintenance ticket">
      {ticket && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Provide resolution notes to complete maintenance for <span className="font-mono text-foreground">{ticket.asset?.tag}</span>.
            The asset status will revert to <span className="text-foreground">Available</span>.
          </p>
          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground font-medium">Resolution Notes *</label>
            <textarea
              autoFocus
              rows={3}
              required
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

// 4. Reject Dialog
function RejectDialog({ ticket, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (ticket) setReason('');
  }, [ticket]);

  return (
    <Dialog open={!!ticket} onClose={onCancel} title="Reject maintenance ticket">
      {ticket && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Provide rejection reason for <span className="font-mono text-foreground">{ticket.asset?.tag}</span>.
            The ticket will be removed from the active board and archived.
          </p>
          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground font-medium">Rejection Reason *</label>
            <textarea
              autoFocus
              rows={3}
              required
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

// 5. Asset Search Combobox inside RaiseDialog
function AssetCombobox({ assets, value, onChange, error }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filteredAssets = assets.filter(
    (a) =>
      a.tag.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAsset = assets.find((a) => a.id === value);

  return (
    <div className="relative">
      <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Asset *</label>
      <div className="relative">
        <input
          type="text"
          className={cn(fieldCls, error && 'border-danger/30')}
          placeholder={selectedAsset ? `${selectedAsset.tag} — ${selectedAsset.name}` : 'Search asset by tag or name…'}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay to allow item click
            setTimeout(() => setOpen(false), 200);
          }}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
          <Search size={14} />
        </div>
      </div>
      {open && (
        <div className="absolute z-[110] w-full mt-1 max-h-48 overflow-y-auto bg-popover border border-border rounded-md py-1 shadow-md">
          {filteredAssets.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">No assets found</div>
          ) : (
            filteredAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onChange(asset.id);
                  setSearch('');
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors",
                  value === asset.id && "bg-white/5 font-medium"
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

// 6. Raise Maintenance Request Dialog
function RaiseDialog({ open, onClose, assets, onSubmit }) {
  const [assetId, setAssetId] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAssetId('');
      setIssue('');
      setPriority('Medium');
      setPhotoUrl('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetId) {
      setError('Please select an asset.');
      return;
    }
    if (!issue.trim()) {
      setError('Please describe the issue.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ assetId, issue: issue.trim(), priority, photoUrl: photoUrl.trim() || undefined });
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
        <AssetCombobox assets={assets} value={assetId} onChange={setAssetId} error={!!error} />
        
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Issue description *</label>
          <textarea
            required
            rows={3}
            className={fieldCls}
            placeholder="Describe the issue or defect…"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={fieldCls}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Photo URL (Optional)</label>
          <input
            type="text"
            className={fieldCls}
            placeholder="https://images.unsplash.com/... (link to photo)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
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
    animation: !isDragOverlay ? 'pure-fade-in 150ms ease forwards' : undefined,
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
      {/* Top Row: Asset Tag + Priority */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-foreground">{ticket.asset?.tag ?? '—'}</span>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <StatusDot status={PRIORITY_STATUS_MAP[ticket.priority] || 'neutral'} label="" />
          {columnId === 'Pending' && isManager && (
            <CardMenu ticket={ticket} onAction={onMenuAction} />
          )}
        </div>
      </div>

      {/* Middle: Issue Description (Clamped to 2 lines) */}
      <p className="text-xs text-foreground line-clamp-2 leading-snug">
        {ticket.issue}
      </p>

      {/* Bottom: Context-dependent resolve info or technician initials */}
      <div className="text-[10px] text-muted-foreground font-mono">
        {isResolved && resolvedDate ? (
          <span className="inline-flex items-center gap-1">
            <StatusDot status="success" label="" className="shrink-0" />
            <span>Resolved {resolvedDate}</span>
          </span>
        ) : ticket.technician ? (
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex h-3.5 w-3.5 rounded-full bg-white/10 items-center justify-center text-[8px] font-sans font-medium text-foreground shrink-0 select-none">
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

// Card Overflow menu (⋯)
function CardMenu({ ticket, onAction }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20"
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-6 z-50 w-32 bg-popover border border-border rounded-lg py-1 shadow-md"
          >
            <button
              role="menuitem"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onAction(ticket, 'reject');
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-danger hover:bg-danger/5 focus:outline-none focus:bg-danger/5 transition-colors"
            >
              Reject ticket…
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── KANBAN COLUMN ────────────────────────────────────────────────────────────
function KanbanColumn({ col, tickets, isOver, isLoading, onMenuAction, isManager }) {
  return (
    <div className="flex flex-col shrink-0 w-72 border-r border-border last:border-r-0 bg-transparent">
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between select-none">
        <span className="text-sm font-medium text-foreground">{col.label}</span>
        <span className="text-xs text-muted-foreground font-mono">{tickets.length}</span>
      </div>

      {/* Sortable Drop Zone */}
      <SortableContext
        items={tickets.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            'flex-1 px-3 py-3 flex flex-col gap-2 min-h-[400px] transition-colors duration-150',
            isOver && 'bg-white/[0.02]'
          )}
        >
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
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

// ─── TABLE VIEW ───────────────────────────────────────────────────────────────
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
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border select-none">
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
              <td colSpan={7} className="px-4 py-12 text-center text-xs text-muted-foreground select-none">
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
                    status={t.status === 'TechnicianAssigned' ? 'allocated' : t.status.toLowerCase()}
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

const MOCK_MAINTENANCE_TICKETS = [
  {
    id: 'tkt-1',
    assetId: 'ast-1',
    raisedById: 'usr-employee',
    issue: 'Forklift AF-0087: hydraulic fluid leak noticed in warehouse A.',
    priority: 'High',
    status: 'Pending',
    createdAt: '2026-07-10T10:00:00.000Z',
    updatedAt: '2026-07-10T10:00:00.000Z',
    asset: { id: 'ast-1', tag: 'AF-0087', name: 'Forklift' },
    raisedBy: { name: 'Aarav Patel' }
  },
  {
    id: 'tkt-2',
    assetId: 'ast-2',
    raisedById: 'usr-employee',
    issue: 'Laptop AF-0020: thermal throttling under compilation loads.',
    priority: 'Medium',
    status: 'Approved',
    createdAt: '2026-07-09T14:30:00.000Z',
    updatedAt: '2026-07-09T15:00:00.000Z',
    asset: { id: 'ast-2', tag: 'AF-0020', name: 'MacBook Pro' },
    raisedBy: { name: 'Sarah Connor' }
  },
  {
    id: 'tkt-3',
    assetId: 'ast-3',
    raisedById: 'usr-employee',
    issue: 'Projector AF-0062: bulb dimming, requires replacing.',
    priority: 'Low',
    status: 'TechnicianAssigned',
    technician: 'Roberto Sanchez',
    createdAt: '2026-07-08T09:15:00.000Z',
    updatedAt: '2026-07-08T11:00:00.000Z',
    asset: { id: 'ast-3', tag: 'AF-0062', name: 'Conference Projector' },
    raisedBy: { name: 'John Doe' }
  },
  {
    id: 'tkt-4',
    assetId: 'ast-4',
    raisedById: 'usr-employee',
    issue: 'AC Unit: compressor making loud rattling noise in lobby.',
    priority: 'High',
    status: 'InProgress',
    technician: 'Lara Croft',
    createdAt: '2026-07-07T08:00:00.000Z',
    updatedAt: '2026-07-07T10:30:00.000Z',
    asset: { id: 'ast-4', tag: 'AF-0010', name: 'AC Unit' },
    raisedBy: { name: 'Priya Shah' }
  },
  {
    id: 'tkt-5',
    assetId: 'ast-5',
    raisedById: 'usr-employee',
    issue: 'Server Rack SR-09: replacing faulty power supply unit.',
    priority: 'High',
    status: 'Resolved',
    technician: 'Roberto Sanchez',
    createdAt: '2026-07-05T12:00:00.000Z',
    updatedAt: '2026-07-06T16:00:00.000Z',
    asset: { id: 'ast-5', tag: 'SR-09', name: 'Dell Server Rack' },
    raisedBy: { name: 'John Doe' }
  }
];

const MOCK_ASSETS = [
  { id: 'ast-1', tag: 'AF-0087', name: 'Forklift' },
  { id: 'ast-2', tag: 'AF-0020', name: 'MacBook Pro' },
  { id: 'ast-3', tag: 'AF-0062', name: 'Conference Projector' },
  { id: 'ast-4', tag: 'AF-0010', name: 'AC Unit' },
  { id: 'ast-5', tag: 'SR-09', name: 'Dell Server Rack' },
  { id: 'ast-6', tag: 'AF-0301', name: 'Sony Camera' },
  { id: 'ast-7', tag: 'AF-0044', name: 'iPad Pro' }
];

const MOCK_EMPLOYEES = [
  { id: 'emp-1', name: 'Roberto Sanchez', email: 'roberto@assetflow.com' },
  { id: 'emp-2', name: 'Lara Croft', email: 'lara@assetflow.com' },
  { id: 'emp-3', name: 'Aarav Patel', email: 'aarav@assetflow.com' },
  { id: 'emp-4', name: 'Sarah Connor', email: 'sarah@assetflow.com' }
];

// ─── MAIN MAINTENANCE PAGE ─────────────────────────────────────────────────────
export default function Maintenance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isManager = user?.role === 'Admin' || user?.role === 'AssetManager';

  // State values
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // App Layout Responsive defaults
  const [userSelectedView, setUserSelectedView] = useState('board');
  const [isMobile, setIsMobile] = useState(false);

  // Drag overlay states
  const [activeDrag, setActiveDrag] = useState(null); // { ticket, sourceColId }
  const [overColId, setOverColId] = useState(null);

  // Dialog targets
  const [approveTarget, setApproveTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [raiseOpen, setRaiseOpen] = useState(false);

  // Detect mobile screen width (< 640px)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeView = isMobile ? 'table' : userSelectedView;

  // DnD Kit sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ─── FETCH CORE DATA ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;
    if (isMockMode) {
      setTickets(MOCK_MAINTENANCE_TICKETS);
      setAssets(MOCK_ASSETS);
      setEmployees(MOCK_EMPLOYEES);
      setLoading(false);
      return;
    }

    try {
      const [mRes, aRes, eRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/assets'),
        api.get('/employees').catch(() => ({ data: [] })),
      ]);
      setTickets(mRes.data);
      setAssets(aRes.data);
      setEmployees(eRes.data);
    } catch {
      toast('Failed to load maintenance data.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── FILTER / TICKETS DATA ───────────────────────────────────────────────────
  const boardTickets = tickets.filter((t) => t.status !== 'Rejected');
  const colCards = (colId) => boardTickets.filter((t) => t.status === colId);

  const findTicket = (id) => tickets.find((t) => t.id === id);
  const findColId = (id) => {
    if (COLUMN_IDS.includes(id)) return id;
    return tickets.find((t) => t.id === id)?.status ?? null;
  };

  // ─── DRAG & DROP FLOW RESOLUTIONS ────────────────────────────────────────────
  const handleDragStart = ({ active }) => {
    const ticket = findTicket(active.id);
    if (ticket) {
      setActiveDrag({ ticket, sourceColId: ticket.status });
    }
  };

  const handleDragOver = ({ over }) => {
    if (!over) {
      setOverColId(null);
      return;
    }
    setOverColId(findColId(over.id));
  };

  const handleDragEnd = ({ active, over }) => {
    const drag = activeDrag;
    setActiveDrag(null);
    setOverColId(null);

    if (!over || !drag) return;

    const toColId = findColId(over.id);
    const fromColId = drag.sourceColId;
    const ticket = drag.ticket;

    if (!toColId || toColId === fromColId) return;

    const fromIdx = COLUMN_IDS.indexOf(fromColId);
    const toIdx = COLUMN_IDS.indexOf(toColId);

    // Enforce sequential moves (must be exactly +1 or -1)
    if (Math.abs(toIdx - fromIdx) > 1) {
      toast('Approve this request first.');
      return;
    }

    // Role guard check for dragging transitions
    if (!isManager) {
      toast('Only Asset Managers can advance request stages.');
      return;
    }

    // Determine state transition handler based on from/to IDs
    if (fromColId === 'Pending' && toColId === 'Approved') {
      setApproveTarget(ticket);
    } else if (fromColId === 'Approved' && toColId === 'TechnicianAssigned') {
      setAssignTarget(ticket);
    } else if (fromColId === 'TechnicianAssigned' && toColId === 'InProgress') {
      // Direct drag transition
      execTransition(ticket.id, 'start');
      toast(`${ticket.asset?.tag || 'Asset'} marked In Progress`);
    } else if (fromColId === 'InProgress' && toColId === 'Resolved') {
      setResolveTarget(ticket);
    } else {
      // Demote / Backwards drag - API blocks this, so we disallow cleanly
      toast('Approve this request first.');
    }
  };

  // ─── STATE TRANSITIONS CALLS ──────────────────────────────────────────────────
  const execTransition = async (id, action, payload = {}) => {
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;

    if (isMockMode) {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            let nextStatus = t.status;
            if (action === 'approve') nextStatus = 'Approved';
            else if (action === 'assign') nextStatus = 'TechnicianAssigned';
            else if (action === 'start') nextStatus = 'InProgress';
            else if (action === 'resolve') nextStatus = 'Resolved';
            else if (action === 'reject') nextStatus = 'Rejected';

            return {
              ...t,
              status: nextStatus,
              technician: action === 'assign' ? payload.technician : t.technician,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );
      return;
    }

    try {
      await api.patch(`/maintenance/${id}/${action}`, payload);
      await fetchAll();
    } catch (err) {
      toast(err.response?.data?.error ?? 'Action failed.');
    }
  };

  const handleApprove = async () => {
    const t = approveTarget;
    setApproveTarget(null);
    if (!t) return;
    await execTransition(t.id, 'approve');
    toast(`${t.asset?.tag} → Under Maintenance`);
  };

  const handleAssign = async (techName) => {
    const t = assignTarget;
    setAssignTarget(null);
    if (!t) return;
    await execTransition(t.id, 'assign', { technician: techName });
    toast(`Technician assigned to ${t.asset?.tag}`);
  };

  const handleResolve = async (notes) => {
    const t = resolveTarget;
    setResolveTarget(null);
    if (!t) return;
    await execTransition(t.id, 'resolve', { notes });
    toast(`${t.asset?.tag} → Available`);
  };

  const handleReject = async (reason) => {
    const t = rejectTarget;
    setRejectTarget(null);
    if (!t) return;
    await execTransition(t.id, 'reject', { reason });
    toast(`Ticket rejected and archived.`);
  };

  const handleRaise = async (form) => {
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;

    if (isMockMode) {
      const selectedAsset = assets.find((a) => a.id === form.assetId);
      const newTicket = {
        id: `tkt-${Date.now()}`,
        assetId: form.assetId,
        raisedById: user?.id || 'usr-mock',
        issue: form.issue,
        priority: form.priority,
        photoUrl: form.photoUrl,
        status: 'Pending',
        technician: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        asset: selectedAsset ? { id: selectedAsset.id, tag: selectedAsset.tag, name: selectedAsset.name } : null,
        raisedBy: { name: user?.name || 'Mock User' },
      };
      setTickets((prev) => [newTicket, ...prev]);
      toast('Maintenance request successfully raised.');
      return;
    }

    try {
      await api.post('/maintenance', form);
      await fetchAll();
      toast(`Maintenance request successfully raised.`);
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to submit request.');
    }
  };

  const handleMenuAction = (ticket, action) => {
    if (action === 'reject') {
      setRejectTarget(ticket);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Keyframes Animation Injection */}
      <style>{`
        @keyframes pure-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: pure-fade-in 150ms ease forwards;
        }
      `}</style>

      {/* ─── 1. PAGE HEADER SECTION ──────────────────────────────────────────────── */}
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
          {/* Tabs switch (Matches Org Setup border underline indicator) */}
          {!isMobile && (
            <div className="flex border-b border-border gap-0 h-9">
              {[
                { id: 'board', label: 'Board', Icon: LayoutGrid },
                { id: 'table', label: 'Table', Icon: List },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setUserSelectedView(item.id)}
                  className={`
                    relative px-4 py-1.5 text-sm transition-colors flex items-center gap-1.5
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20
                    ${
                      userSelectedView === item.id
                        ? 'text-foreground font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground after:content-[""]'
                        : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <item.Icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Raise request button */}
          <button
            onClick={() => setRaiseOpen(true)}
            className={btnPrimary}
          >
            <Plus className="w-4 h-4 mr-1.5 inline-block" />
            Raise Maintenance Request
          </button>
        </div>
      </div>

      {/* ─── 2. MAIN WORKSPACE / CONTENT ────────────────────────────────────────── */}
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
            {/* Horizontally scrollable lane container for tablet/desktop */}
            <div className="flex overflow-x-auto border border-border rounded-lg bg-transparent">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  tickets={colCards(col.id)}
                  isOver={overColId === col.id}
                  isLoading={loading}
                  onMenuAction={handleMenuAction}
                  isManager={isManager}
                />
              ))}
            </div>

            {/* Drag Shadow Overlay */}
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
          loading ? (
            <div className="border border-border rounded-lg p-6 space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="animate-fade-in">
              <TableView tickets={tickets} />
            </div>
          )
        )}
      </div>

      {/* ─── 3. STATE CONFIRMATION DIALOGS ────────────────────────────────────────── */}
      <ApproveDialog
        ticket={approveTarget}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />
      <AssignDialog
        ticket={assignTarget}
        employees={employees}
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
    </div>
  );
}
