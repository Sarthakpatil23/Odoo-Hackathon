import { useState, useEffect, useCallback, useRef } from 'react';
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: 'Pending', label: 'Pending' },
  { id: 'Approved', label: 'Approved' },
  { id: 'TechnicianAssigned', label: 'Technician Assigned' },
  { id: 'InProgress', label: 'In Progress' },
  { id: 'Resolved', label: 'Resolved' },
];

const COLUMN_ORDER = ['Pending', 'Approved', 'TechnicianAssigned', 'InProgress', 'Resolved'];

// Priority dot colours — reuse semantic scale, no hardcoded hex
const PRIORITY_DOT = {
  Low: 'bg-slate-500',
  Medium: 'bg-amber-400',
  High: 'bg-red-500',
};

// ─── TOAST ───────────────────────────────────────────────────────────────────

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border backdrop-blur-sm transition-all pointer-events-auto
            ${t.type === 'error'
              ? 'bg-red-950/80 border-red-500/30 text-red-300'
              : t.type === 'warning'
              ? 'bg-amber-950/80 border-amber-500/30 text-amber-300'
              : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);
  return { toasts, add };
}

// ─── IDENTITY CHIP ────────────────────────────────────────────────────────────

function IdentityChip({ tag }) {
  return (
    <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 tracking-wide">
      {tag}
    </span>
  );
}

// ─── TICKET CARD (Sortable) ───────────────────────────────────────────────────

function TicketCard({ req, onMenuAction, columnId, isDragOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: req.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isResolved = columnId === 'Resolved';

  if (isDragging && !isDragOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[110px] rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/20"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-xl border p-3 cursor-grab active:cursor-grabbing select-none transition-all
        ${isDragOverlay ? 'shadow-2xl scale-[1.02] rotate-1' : 'shadow-sm hover:shadow-md'}
        ${isResolved
          ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60'
          : 'border-slate-700/60 bg-slate-900 hover:border-slate-600'
        }
      `}
    >
      {/* Top row: asset tag + priority dot + menu */}
      <div className="flex items-center justify-between mb-2">
        <IdentityChip tag={req.asset?.tag || 'N/A'} />
        <div className="flex items-center gap-2">
          <span
            title={`Priority: ${req.priority}`}
            className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[req.priority] || 'bg-slate-500'}`}
          />
          {/* ⋯ context menu */}
          <CardMenu req={req} columnId={columnId} onMenuAction={onMenuAction} />
        </div>
      </div>

      {/* Issue name */}
      <p className="text-sm font-medium text-slate-200 leading-snug line-clamp-2 mb-2">
        {req.asset?.name ? `${req.asset.name} — ${req.issue}` : req.issue}
      </p>

      {/* Bottom row */}
      <div className="text-xs text-slate-500 font-mono">
        {isResolved && req.updatedAt ? (
          <span>
            Resolved{' '}
            {new Date(req.updatedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        ) : req.technician ? (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {req.technician[0]?.toUpperCase()}
            </span>
            <span className="text-slate-400 truncate">{req.technician}</span>
          </div>
        ) : (
          <span className="text-slate-600 italic">No technician assigned</span>
        )}
      </div>
    </div>
  );
}

// ─── CARD CONTEXT MENU ────────────────────────────────────────────────────────

function CardMenu({ req, columnId, onMenuAction }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const actions = [];
  if (columnId === 'Pending') {
    actions.push({ label: 'Reject ticket…', action: 'reject', danger: true });
  }

  if (actions.length === 0) return null;

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="p-0.5 rounded text-slate-600 hover:text-slate-300 hover:bg-slate-700 transition-colors"
        aria-label="Card actions"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-5 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 min-w-[160px]">
          {actions.map((a) => (
            <button
              key={a.action}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onMenuAction(req, a.action);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                a.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DROPPABLE COLUMN ─────────────────────────────────────────────────────────

function KanbanColumn({ col, cards, isOver, onMenuAction }) {
  return (
    <div
      className={`flex flex-col shrink-0 w-64 rounded-2xl border transition-colors
        ${isOver ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/30'}
      `}
    >
      {/* Column header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200">{col.label}</span>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-3 flex flex-col gap-2 min-h-[120px]">
          {cards.length === 0 ? (
            <p className="text-xs text-slate-600 text-center mt-6">No tickets</p>
          ) : (
            cards.map((req) => (
              <TicketCard
                key={req.id}
                req={req}
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

// ─── DIALOG: APPROVE CONFIRM ─────────────────────────────────────────────────

function ApproveDialog({ req, onConfirm, onCancel }) {
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-2">Approve Maintenance?</h3>
        <p className="text-sm text-slate-400 mb-6">
          Approve maintenance for{' '}
          <span className="font-mono text-indigo-300 font-semibold">{req.asset?.tag}</span>?
          <br />
          The asset will be marked <span className="text-amber-400 font-medium">Under Maintenance</span>.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl hover:from-emerald-500 hover:to-emerald-400 transition-all"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DIALOG: ASSIGN TECHNICIAN ────────────────────────────────────────────────

function AssignTechDialog({ req, onConfirm, onCancel }) {
  const [techName, setTechName] = useState('');
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-2">Assign Technician</h3>
        <p className="text-xs text-slate-500 mb-4">
          Required before moving{' '}
          <span className="font-mono text-indigo-300">{req.asset?.tag}</span> to Technician Assigned.
        </p>
        <input
          autoFocus
          type="text"
          placeholder="Technician name or team…"
          value={techName}
          onChange={(e) => setTechName(e.target.value)}
          className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 outline-none mb-5"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => techName.trim() && onConfirm(techName.trim())}
            disabled={!techName.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-600 rounded-xl hover:from-indigo-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DIALOG: RESOLVE NOTES ────────────────────────────────────────────────────

function ResolveDialog({ req, onConfirm, onCancel }) {
  const [notes, setNotes] = useState('');
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-2">Resolve Ticket</h3>
        <p className="text-xs text-slate-500 mb-4">
          Add resolution notes for{' '}
          <span className="font-mono text-indigo-300">{req.asset?.tag}</span> before closing.
        </p>
        <textarea
          autoFocus
          placeholder="What was done to fix the issue?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 outline-none resize-none mb-5"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => notes.trim() && onConfirm(notes.trim())}
            disabled={!notes.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DIALOG: REJECT WITH REASON ────────────────────────────────────────────────

function RejectDialog({ req, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-red-400 mb-2">Reject Ticket</h3>
        <p className="text-xs text-slate-500 mb-4">
          Provide a reason for rejecting{' '}
          <span className="font-mono text-indigo-300">{req.asset?.tag}</span>. This will remove it from the board.
        </p>
        <textarea
          autoFocus
          placeholder="Reason for rejection…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl text-slate-100 outline-none resize-none mb-5"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Reject Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RAISE REQUEST FORM ───────────────────────────────────────────────────────

function RaiseRequestModal({ isOpen, onClose, assets, onSubmit }) {
  const [form, setForm] = useState({ assetId: '', issue: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetId || !form.issue.trim()) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    setForm({ assetId: '', issue: '', priority: 'Medium' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raise Maintenance Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
            Select Asset *
          </label>
          <select
            required
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none cursor-pointer"
          >
            <option value="">Select Asset</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.tag} — {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
            Describe Issue *
          </label>
          <textarea
            required
            placeholder="Describe the issue or defect in detail…"
            value={form.issue}
            onChange={(e) => setForm({ ...form, issue: e.target.value })}
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
            Priority
          </label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none cursor-pointer"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── TABLE VIEW (flat list for scanning) ─────────────────────────────────────

function TableView({ requests }) {
  const getStatusBadge = (status) => {
    const cls = {
      Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      TechnicianAssigned: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      InProgress: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      Resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    const label =
      status === 'TechnicianAssigned' ? 'Tech Assigned' : status === 'InProgress' ? 'In Progress' : status;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${cls[status] || 'bg-slate-800'}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
            <tr>
              <th className="px-5 py-3 font-semibold">Asset</th>
              <th className="px-5 py-3 font-semibold">Issue</th>
              <th className="px-5 py-3 font-semibold">Priority</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Technician</th>
              <th className="px-5 py-3 font-semibold">Raised By</th>
              <th className="px-5 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-600 text-sm">
                  No maintenance tickets found.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-3">
                    <IdentityChip tag={req.asset?.tag || '—'} />
                  </td>
                  <td className="px-5 py-3 text-slate-200 max-w-[200px] truncate">{req.issue}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[req.priority]}`} />
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3">{getStatusBadge(req.status)}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{req.technician || '—'}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{req.raisedBy?.name}</td>
                  <td className="px-5 py-3 text-slate-600 text-xs font-mono">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Maintenance() {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board'); // 'board' | 'table'

  // Active drag state
  const [activeDragId, setActiveDragId] = useState(null);
  const [activeReq, setActiveReq] = useState(null);
  const [overColumnId, setOverColumnId] = useState(null);

  // Pending transition dialogs
  const [pendingDrop, setPendingDrop] = useState(null); // { req, targetCol }
  const [approveDialog, setApproveDialog] = useState(null);
  const [assignDialog, setAssignDialog] = useState(null);
  const [resolveDialog, setResolveDialog] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);

  // Raise request modal
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);

  const { toasts, add: toast } = useToast();

  // ── Sensors ───────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Data ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([api.get('/maintenance'), api.get('/assets')]);
      setRequests(mRes.data);
      setAssets(aRes.data);
    } catch (e) {
      console.error(e);
      toast('Failed to load maintenance data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Board layout helpers ──────────────────────────────────────────────────
  // Active board only shows non-Rejected tickets
  const boardRequests = requests.filter((r) => r.status !== 'Rejected');

  const columnCards = (colId) => boardRequests.filter((r) => r.status === colId);

  const findRequestById = (id) => requests.find((r) => r.id === id);
  const findColumnForRequest = (id) => requests.find((r) => r.id === id)?.status;

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = ({ active }) => {
    setActiveDragId(active.id);
    setActiveReq(findRequestById(active.id));
  };

  const handleDragOver = ({ over }) => {
    if (!over) { setOverColumnId(null); return; }
    // over.id could be a column id or a card id
    const colId = COLUMN_ORDER.includes(over.id)
      ? over.id
      : findColumnForRequest(over.id);
    setOverColumnId(colId);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveDragId(null);
    setActiveReq(null);
    setOverColumnId(null);

    if (!over) return;

    const req = findRequestById(active.id);
    if (!req) return;

    const fromIndex = COLUMN_ORDER.indexOf(req.status);
    const toColId = COLUMN_ORDER.includes(over.id)
      ? over.id
      : findColumnForRequest(over.id);

    if (!toColId || toColId === req.status) return;

    const toIndex = COLUMN_ORDER.indexOf(toColId);

    // Enforce sequential movement — only ±1 column
    if (Math.abs(toIndex - fromIndex) > 1) {
      toast(`Approve this request first.`, 'warning');
      return;
    }

    // Role guard: only Admin/AssetManager can move cards
    if (!isAdminOrManager) {
      toast('You do not have permission to move tickets.', 'error');
      return;
    }

    // Open the appropriate dialog for the transition
    if (toColId === 'Approved' && req.status === 'Pending') {
      setApproveDialog({ req, targetCol: toColId });
    } else if (toColId === 'TechnicianAssigned' && req.status === 'Approved') {
      setAssignDialog({ req, targetCol: toColId });
    } else if (toColId === 'InProgress' && req.status === 'TechnicianAssigned') {
      // Free drag — instant
      moveCard(req.id, 'start');
    } else if (toColId === 'Resolved' && req.status === 'InProgress') {
      setResolveDialog({ req, targetCol: toColId });
    } else {
      // Backwards move — snap back with message
      toast(`Cannot move a ticket backwards from ${req.status}.`, 'warning');
    }
  };

  // ── API calls ─────────────────────────────────────────────────────────────
  const moveCard = async (id, action, payload = {}) => {
    try {
      await api.patch(`/maintenance/${id}/${action}`, payload);
      await fetchAll();
    } catch (e) {
      toast(e.response?.data?.error || 'Action failed.', 'error');
    }
  };

  const handleApproveConfirm = async () => {
    const { req } = approveDialog;
    setApproveDialog(null);
    await moveCard(req.id, 'approve');
    toast(`${req.asset?.tag} → Under Maintenance`, 'info');
  };

  const handleAssignConfirm = async (techName) => {
    const { req } = assignDialog;
    setAssignDialog(null);
    await moveCard(req.id, 'assign', { technician: techName });
    toast(`Technician "${techName}" assigned to ${req.asset?.tag}`, 'info');
  };

  const handleResolveConfirm = async (notes) => {
    const { req } = resolveDialog;
    setResolveDialog(null);
    await moveCard(req.id, 'resolve', { notes });
    toast(`${req.asset?.tag} → Available`, 'info');
  };

  const handleRejectConfirm = async (reason) => {
    const { req } = rejectDialog;
    setRejectDialog(null);
    await moveCard(req.id, 'reject', { reason });
    toast(`Ticket rejected and archived.`, 'info');
  };

  // Card context menu actions
  const handleMenuAction = (req, action) => {
    if (action === 'reject') setRejectDialog({ req });
  };

  // Raise request submit
  const handleRaiseSubmit = async (form) => {
    try {
      await api.post('/maintenance', form);
      toast('Maintenance request submitted!', 'info');
      fetchAll();
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to submit request.', 'error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 min-h-screen text-slate-100 flex flex-col">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Maintenance</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
            Maintenance Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Board / Table toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            {['board', 'table'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  view === v
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {v === 'board' ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="2" y="3" width="6" height="18" rx="1" />
                      <rect x="9" y="3" width="6" height="14" rx="1" />
                      <rect x="16" y="3" width="6" height="10" rx="1" />
                    </svg>
                    Board
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Table
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Raise Request */}
          <button
            onClick={() => setIsRaiseOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/15 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Raise Maintenance Request
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Board View ── */}
      {!loading && view === 'board' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-6 flex-1">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                cards={columnCards(col.id)}
                isOver={overColumnId === col.id}
                onMenuAction={handleMenuAction}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeReq ? (
              <TicketCard
                req={activeReq}
                columnId={activeReq.status}
                onMenuAction={() => {}}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Table View ── */}
      {!loading && view === 'table' && (
        <TableView requests={requests} />
      )}

      {/* ── Dialogs ── */}
      {approveDialog && (
        <ApproveDialog
          req={approveDialog.req}
          onConfirm={handleApproveConfirm}
          onCancel={() => setApproveDialog(null)}
        />
      )}
      {assignDialog && (
        <AssignTechDialog
          req={assignDialog.req}
          onConfirm={handleAssignConfirm}
          onCancel={() => setAssignDialog(null)}
        />
      )}
      {resolveDialog && (
        <ResolveDialog
          req={resolveDialog.req}
          onConfirm={handleResolveConfirm}
          onCancel={() => setResolveDialog(null)}
        />
      )}
      {rejectDialog && (
        <RejectDialog
          req={rejectDialog.req}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectDialog(null)}
        />
      )}

      {/* ── Raise Request Modal ── */}
      <RaiseRequestModal
        isOpen={isRaiseOpen}
        onClose={() => setIsRaiseOpen(false)}
        assets={assets}
        onSubmit={handleRaiseSubmit}
      />

      {/* ── Toast notifications ── */}
      <Toast toasts={toasts} />
    </div>
  );
}
