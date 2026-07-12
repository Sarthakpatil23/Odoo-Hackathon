/**
 * OrganizationSetup — Admin-only page (Screen 3)
 *
 * Three tabs: Departments · Categories · Employee Directory
 * Follows design.md v2 exactly:
 *   - Pure black/gray palette, hairline borders, no shadows
 *   - StatusDot for lifecycle states (only color in the UI)
 *   - Plain outline role badge (not StatusDot — role is not a lifecycle state)
 *   - Vercel-dashboard table pattern (§5.6)
 *   - Vercel-dashboard card grid for categories (§5.2)
 *   - react-hook-form + zod for forms (§5.8)
 *   - EmptyState (§5.7), Skeleton (§4.2), toasts via useToast
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Building2,
  Tag,
  Users,
  MoreHorizontal,
  X,
  Plus,
  ChevronDown,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useDepartments } from '../../hooks/useDepartments';
import { StatusDot } from '../../components/shared/StatusDot';
import { EmptyState } from '../../components/shared/EmptyState';
import { Skeleton } from '../../components/shared/Skeleton';
import { useToast } from '../../components/shared/Toast';

// ─────────────────────────────────────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Electronics',
    icon: 'Monitor',
    fields: [{ id: 'f1', name: 'Warranty Period', type: 'text' }],
  },
  {
    id: 'cat-2',
    name: 'Furniture',
    icon: 'Armchair',
    fields: [],
  },
  {
    id: 'cat-3',
    name: 'Vehicles',
    icon: 'Car',
    fields: [
      { id: 'f2', name: 'Registration Number', type: 'text' },
      { id: 'f3', name: 'Insurance Expiry', type: 'date' },
    ],
  },
];

const INITIAL_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'Aditi Rao',
    email: 'aditi.rao@acme.com',
    departmentId: 'dept-1',
    role: 'Admin',
    status: 'active',
    initials: 'AR',
  },
  {
    id: 'emp-2',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@acme.com',
    departmentId: 'dept-2',
    role: 'Department Head',
    status: 'active',
    initials: 'RM',
  },
  {
    id: 'emp-3',
    name: 'Sana Iqbal',
    email: 'sana.iqbal@acme.com',
    departmentId: 'dept-4',
    role: 'Department Head',
    status: 'inactive',
    initials: 'SI',
  },
  {
    id: 'emp-4',
    name: 'Karan Patel',
    email: 'karan.patel@acme.com',
    departmentId: 'dept-1',
    role: 'Employee',
    status: 'active',
    initials: 'KP',
  },
  {
    id: 'emp-5',
    name: 'Meera Nair',
    email: 'meera.nair@acme.com',
    departmentId: 'dept-2',
    role: 'Asset Manager',
    status: 'active',
    initials: 'MN',
  },
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
];

const ROLES = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];

// ─────────────────────────────────────────────────────────────────────────────
// Micro-primitives (all design.md compliant, no external libraries needed)
// ─────────────────────────────────────────────────────────────────────────────

/** Primary button — solid off-white fill, near-black text (§5.1) */
function PrimaryButton({ children, onClick, type = 'button', disabled, id, className = '' }) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        rounded-md px-3 py-1.5
        bg-[#EDEDED] text-[#0A0A0A]
        text-sm font-medium
        hover:bg-white
        disabled:opacity-40 disabled:pointer-events-none
        transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-1 focus-visible:ring-offset-background
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/** Outline / secondary button (§5.1) */
function OutlineButton({ children, onClick, type = 'button', disabled, id, className = '' }) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        rounded-md px-3 py-1.5
        border border-border bg-transparent text-foreground
        text-sm font-medium
        hover:bg-white/5
        disabled:opacity-40 disabled:pointer-events-none
        transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-1 focus-visible:ring-offset-background
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/** Ghost icon button — no border, no fill (§5.1) */
function GhostButton({ children, onClick, id, 'aria-label': ariaLabel, className = '' }) {
  return (
    <button
      id={id}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        rounded-md p-1.5
        text-muted-foreground hover:text-foreground hover:bg-white/5
        transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/** Destructive outline button (§5.1) */
function DestructiveButton({ children, onClick, id, className = '' }) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        rounded-md px-3 py-1.5
        border border-danger/30 bg-transparent text-danger
        text-sm font-medium
        hover:bg-danger/5
        transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/** Form input (§5.8) */
function FormInput({ id, label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          flex h-9 w-full rounded-md border border-border
          bg-card px-3 py-1.5 text-sm text-foreground
          placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:border-border-strong focus-visible:ring-1 focus-visible:ring-white/10
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

/** Form select (§5.8) */
function FormSelect({ id, label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          flex h-9 w-full rounded-md border border-border
          bg-card px-3 py-1.5 text-sm text-foreground
          focus-visible:outline-none focus-visible:border-border-strong focus-visible:ring-1 focus-visible:ring-white/10
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors appearance-none
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

/** Toggle switch */
function Switch({ checked, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full
        border border-border transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20
        ${checked ? 'bg-[#3FBA6D]/20 border-[#3FBA6D]/40' : 'bg-white/5'}
      `}
    >
      <span
        className={`
          inline-block h-3.5 w-3.5 rounded-full transition-transform
          ${checked ? 'translate-x-4 bg-[#3FBA6D]' : 'translate-x-1 bg-muted-foreground'}
        `}
      />
    </button>
  );
}

/** Dropdown menu (⋯ row actions) */
function DropdownMenu({ trigger, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <GhostButton onClick={() => setOpen((v) => !v)} aria-label="Row actions">
        {trigger}
      </GhostButton>
      {open && (
        <div
          className="
            absolute right-0 top-full mt-1 z-30
            min-w-[160px]
            rounded-lg border border-border bg-popover
            py-1 shadow-sm
          "
        >
          {items.map((item, i) =>
            item.separator ? (
              <div key={i} className="my-1 border-t border-border" />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => { setOpen(false); item.onClick(); }}
                className={`
                  w-full text-left px-3 py-2 text-sm transition-colors
                  hover:bg-white/5 focus-visible:outline-none focus-visible:bg-white/5
                  ${item.destructive ? 'text-danger' : 'text-foreground'}
                `}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/** Modal/Dialog */
function Dialog({ open, onClose, title, description, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border border-border bg-popover p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="dialog-title" className="text-sm font-medium text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <GhostButton onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </GhostButton>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/** AlertDialog — confirmation before destructive/important action */
function AlertDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm' }) {
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-desc"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-lg border border-border bg-popover p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <div>
            <h2 id="alert-title" className="text-sm font-medium text-foreground">{title}</h2>
            <p id="alert-desc" className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <OutlineButton onClick={onClose}>Cancel</OutlineButton>
          <PrimaryButton onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/** Right Sheet slide-in */
function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
          aria-hidden="true"
          style={{ transition: 'opacity 260ms ease' }}
        />
      )}
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-surface border-l border-border flex flex-col"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 260ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          <GhostButton onClick={onClose} aria-label="Close panel">
            <X className="h-4 w-4" />
          </GhostButton>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {children}
        </div>
      </div>
    </>
  );
}

/** Small avatar with initials */
function Avatar({ initials, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm';
  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full
        bg-white/10 text-foreground font-medium shrink-0
        ${sizeClass}
      `}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/** Plain outline role badge (not StatusDot — role is not a lifecycle state) */
function RoleBadge({ role }) {
  return (
    <span className="inline-flex items-center border border-border rounded-full px-2 py-0.5 text-xs text-foreground">
      {role}
    </span>
  );
}

/** Skeleton table rows */
function TableSkeleton({ cols = 5, rows = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-border">
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="px-4 py-3">
              <Skeleton className={`h-4 ${ci === 0 ? 'w-32' : ci === cols - 1 ? 'w-16' : 'w-24'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Card skeleton for categories */
function CardSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Field Builder (used in Categories create/edit)
// ─────────────────────────────────────────────────────────────────────────────
function FieldBuilder({ fields, onChange }) {
  const addField = () => {
    onChange([...fields, { id: `f-${Date.now()}`, name: '', type: 'text' }]);
  };
  const removeField = (id) => onChange(fields.filter((f) => f.id !== id));
  const updateField = (id, patch) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Custom Fields
        </p>
        <GhostButton onClick={addField} aria-label="Add custom field">
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Add Field</span>
        </GhostButton>
      </div>
      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No custom fields defined.</p>
      ) : (
        <div className="space-y-2">
          {fields.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <input
                className="
                  flex-1 h-8 rounded-md border border-border bg-card
                  px-3 text-sm text-foreground placeholder:text-muted-foreground
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/10
                  transition-colors
                "
                placeholder="Field name"
                value={f.name}
                onChange={(e) => updateField(f.id, { name: e.target.value })}
              />
              <select
                className="
                  h-8 rounded-md border border-border bg-card
                  px-2 text-sm text-foreground
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/10
                  transition-colors appearance-none
                "
                value={f.type}
                onChange={(e) => updateField(f.id, { type: e.target.value })}
                aria-label="Field type"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <GhostButton onClick={() => removeField(f.id)} aria-label={`Remove field ${f.name}`}>
                <Trash2 className="h-3.5 w-3.5 text-danger" />
              </GhostButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Departments
// ─────────────────────────────────────────────────────────────────────────────
function DepartmentsTab() {
  const { departments, addDepartment, updateDepartment } = useDepartments();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // { dept } when editing

  // Simulate load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Create form
  const createForm = useForm({
    defaultValues: { name: '', headId: '', parentId: '', status: true },
  });

  const handleCreate = (data) => {
    const head = departments.find((d) => d.head?.id === data.headId) ?? null;
    addDepartment({
      name: data.name,
      head: head?.head ?? null,
      parentId: data.parentId || null,
      status: data.status ? 'active' : 'inactive',
    });
    setCreateOpen(false);
    createForm.reset();
    toast(`Department "${data.name}" created.`);
  };

  // Edit form
  const editForm = useForm();

  const openEdit = (dept) => {
    setEditTarget(dept);
    editForm.reset({
      name: dept.name,
      parentId: dept.parentId || '',
      status: dept.status === 'active',
    });
  };

  const handleEdit = (data) => {
    updateDepartment(editTarget.id, {
      name: data.name,
      parentId: data.parentId || null,
      status: data.status ? 'active' : 'inactive',
    });
    setEditTarget(null);
    toast(`Department "${data.name}" updated.`);
  };

  const toggleStatus = (dept) => {
    const next = dept.status === 'active' ? 'inactive' : 'active';
    updateDepartment(dept.id, { status: next });
    toast(`"${dept.name}" marked ${next}.`);
  };

  // All unique employees from departments (for head select)
  const allHeads = departments
    .filter((d) => d.head)
    .map((d) => d.head)
    .filter((h, i, arr) => arr.findIndex((x) => x.id === h.id) === i);

  return (
    <div className="space-y-4">
      {/* Tab action */}
      <div className="flex items-center justify-end">
        <PrimaryButton
          id="create-department-btn"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Create Department
        </PrimaryButton>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Name', 'Head', 'Parent Department', 'Status', ''].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={5} rows={4} />
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={<Building2 />}
                    message="No departments yet. Create your first department to get started."
                    action={
                      <OutlineButton onClick={() => setCreateOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Create Department
                      </OutlineButton>
                    }
                  />
                </td>
              </tr>
            ) : (
              departments.map((dept) => {
                const parent = departments.find((d) => d.id === dept.parentId);
                const hasParent = Boolean(dept.parentId);
                return (
                  <tr
                    key={dept.id}
                    className="border-b border-border last:border-0 hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Name — indent child with border-l */}
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-2 ${hasParent ? 'pl-5 border-l border-border ml-2' : ''}`}>
                        <span className="text-sm text-foreground font-medium">{dept.name}</span>
                      </div>
                    </td>
                    {/* Head */}
                    <td className="px-4 py-3">
                      {dept.head ? (
                        <div className="flex items-center gap-2">
                          <Avatar initials={dept.head.initials} />
                          <span className="text-sm text-foreground">{dept.head.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    {/* Parent */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {parent ? parent.name : '—'}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusDot status={dept.status} />
                    </td>
                    {/* Row actions */}
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu
                        trigger={<MoreHorizontal className="h-4 w-4" />}
                        items={[
                          { label: 'Edit', onClick: () => openEdit(dept) },
                          {
                            label: dept.status === 'active' ? 'Deactivate' : 'Activate',
                            onClick: () => toggleStatus(dept),
                            destructive: dept.status === 'active',
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Department Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); createForm.reset(); }}
        title="Create Department"
        description="Add a new department to your organization."
        footer={
          <>
            <OutlineButton onClick={() => { setCreateOpen(false); createForm.reset(); }}>
              Cancel
            </OutlineButton>
            <PrimaryButton type="button" onClick={createForm.handleSubmit(handleCreate)} id="dept-create-submit">
              Create
            </PrimaryButton>
          </>
        }
      >
        <FormInput
          id="dept-name"
          label="Name"
          placeholder="e.g. Engineering"
          error={createForm.formState.errors.name?.message}
          {...createForm.register('name', { required: 'Name is required' })}
        />
        <FormSelect
          id="dept-head"
          label="Head (optional)"
          {...createForm.register('headId')}
        >
          <option value="">No head assigned</option>
          {allHeads.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </FormSelect>
        <FormSelect
          id="dept-parent"
          label="Parent Department (optional)"
          {...createForm.register('parentId')}
        >
          <option value="">None (top-level)</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </FormSelect>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</span>
          <Switch
            id="dept-status"
            checked={createForm.watch('status')}
            onChange={(v) => createForm.setValue('status', v)}
          />
        </div>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title={`Edit Department`}
        description={editTarget ? `Editing "${editTarget.name}"` : ''}
        footer={
          <>
            <OutlineButton onClick={() => setEditTarget(null)}>Cancel</OutlineButton>
            <PrimaryButton type="button" onClick={editForm.handleSubmit(handleEdit)} id="dept-edit-submit">
              Save
            </PrimaryButton>
          </>
        }
      >
        <FormInput
          id="dept-edit-name"
          label="Name"
          error={editForm.formState.errors.name?.message}
          {...editForm.register('name', { required: 'Name is required' })}
        />
        <FormSelect
          id="dept-edit-parent"
          label="Parent Department (optional)"
          {...editForm.register('parentId')}
        >
          <option value="">None (top-level)</option>
          {departments
            .filter((d) => d.id !== editTarget?.id)
            .map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
        </FormSelect>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</span>
          <Switch
            id="dept-edit-status"
            checked={editForm.watch('status')}
            onChange={(v) => editForm.setValue('status', v)}
          />
        </div>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Categories
// ─────────────────────────────────────────────────────────────────────────────
function CategoriesTab() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [sheetTarget, setSheetTarget] = useState(null); // category being viewed/edited in Sheet
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newFields, setNewFields] = useState([]);
  const [createError, setCreateError] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) { setCreateError('Name is required'); return; }
    const cat = {
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      icon: 'Tag',
      fields: newFields.filter((f) => f.name.trim()),
    };
    setCategories((prev) => [...prev, cat]);
    setCreateOpen(false);
    setNewName('');
    setNewFields([]);
    setCreateError('');
    toast(`Category "${cat.name}" created.`);
  };

  // Sheet edit state
  const [sheetFields, setSheetFields] = useState([]);
  const openSheet = (cat) => {
    setSheetTarget(cat);
    setSheetFields([...cat.fields]);
  };
  const saveSheet = () => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === sheetTarget.id
          ? { ...c, fields: sheetFields.filter((f) => f.name.trim()) }
          : c
      )
    );
    toast(`Category "${sheetTarget.name}" updated.`);
    setSheetTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Tab action */}
      <div className="flex items-center justify-end">
        <PrimaryButton id="create-category-btn" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Create Category
        </PrimaryButton>
      </div>

      {/* Card grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton count={3} />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tag />}
          message="No categories yet. Create your first category to organize assets."
          action={
            <OutlineButton onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Create Category
            </OutlineButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => openSheet(cat)}
              className="
                text-left rounded-lg border border-border bg-card p-5
                hover:bg-card-hover transition-colors
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20
                group
              "
              aria-label={`Edit ${cat.name} category`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
              </div>
              <span className="inline-flex items-center border border-border rounded-full px-2 py-0.5 text-xs text-muted-foreground">
                {cat.fields.length} custom {cat.fields.length === 1 ? 'field' : 'fields'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setNewName(''); setNewFields([]); setCreateError(''); }}
        title="Create Category"
        description="Define a new asset category and optional custom fields."
        footer={
          <>
            <OutlineButton onClick={() => { setCreateOpen(false); setNewName(''); setNewFields([]); setCreateError(''); }}>
              Cancel
            </OutlineButton>
            <PrimaryButton id="cat-create-submit" onClick={handleCreate}>Create</PrimaryButton>
          </>
        }
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cat-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Name
          </label>
          <input
            id="cat-name"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setCreateError(''); }}
            placeholder="e.g. Electronics"
            className="
              flex h-9 w-full rounded-md border border-border bg-card
              px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/10
              transition-colors
            "
          />
          {createError && <p className="text-xs text-danger">{createError}</p>}
        </div>
        <div className="border-t border-border pt-4">
          <FieldBuilder fields={newFields} onChange={setNewFields} />
        </div>
      </Dialog>

      {/* Category edit Sheet */}
      <Sheet
        open={Boolean(sheetTarget)}
        onClose={() => setSheetTarget(null)}
        title={sheetTarget ? `Edit — ${sheetTarget.name}` : ''}
      >
        {sheetTarget && (
          <>
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Tag className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium text-foreground">{sheetTarget.name}</span>
            </div>
            <FieldBuilder fields={sheetFields} onChange={setSheetFields} />
            <div className="pt-4 border-t border-border flex justify-end gap-2">
              <OutlineButton onClick={() => setSheetTarget(null)}>Cancel</OutlineButton>
              <PrimaryButton id="cat-sheet-save" onClick={saveSheet}>Save Changes</PrimaryButton>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Employee Directory
// ─────────────────────────────────────────────────────────────────────────────
function EmployeeDirectoryTab() {
  const { getDepartmentName } = useDepartments();
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // AlertDialog state
  const [alertState, setAlertState] = useState(null); // { emp, targetRole }

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const promote = (emp, targetRole) => {
    setAlertState({ emp, targetRole });
  };

  const confirmPromotion = () => {
    const { emp, targetRole } = alertState;
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, role: targetRole } : e))
    );
    const roleLabel = targetRole;
    toast(`${emp.name} promoted to ${roleLabel}.`);
  };

  const toggleStatus = (emp) => {
    const next = emp.status === 'active' ? 'inactive' : 'active';
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, status: next } : e))
    );
    toast(`${emp.name} marked ${next}.`);
  };

  const getPromotionItems = (emp) => {
    const items = [];
    if (emp.role !== 'Department Head') {
      items.push({
        label: 'Promote to Department Head',
        onClick: () => promote(emp, 'Department Head'),
      });
    }
    if (emp.role !== 'Asset Manager') {
      items.push({
        label: 'Promote to Asset Manager',
        onClick: () => promote(emp, 'Asset Manager'),
      });
    }
    if (items.length > 0) items.push({ separator: true });
    items.push({
      label: emp.status === 'active' ? 'Deactivate' : 'Activate',
      onClick: () => toggleStatus(emp),
      destructive: emp.status === 'active',
    });
    return items;
  };

  return (
    <div className="space-y-4">
      {/* Helper line — no add button, per spec */}
      <p className="text-xs text-muted-foreground">
        Employees create their own accounts at signup. Promote existing employees to grant additional roles.
      </p>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Name', 'Email', 'Department', 'Role', 'Status', ''].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={6} rows={5} />
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={<Users />}
                    message="No employees found. Employees self-signup and appear here automatically."
                  />
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-border last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={emp.initials} />
                      <span className="text-sm text-foreground font-medium">{emp.name}</span>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{emp.email}</span>
                  </td>
                  {/* Department */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {getDepartmentName(emp.departmentId)}
                    </span>
                  </td>
                  {/* Role — plain outline badge */}
                  <td className="px-4 py-3">
                    <RoleBadge role={emp.role} />
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusDot status={emp.status} />
                  </td>
                  {/* Row actions */}
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu
                      trigger={<MoreHorizontal className="h-4 w-4" />}
                      items={getPromotionItems(emp)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Promotion AlertDialog */}
      {alertState && (
        <AlertDialog
          open={Boolean(alertState)}
          onClose={() => setAlertState(null)}
          onConfirm={confirmPromotion}
          title={`Promote ${alertState.emp.name} to ${alertState.targetRole}?`}
          description={
            alertState.targetRole === 'Department Head'
              ? `${alertState.emp.name} will gain approval permissions for their department.`
              : `${alertState.emp.name} will gain asset management permissions across the organization.`
          }
          confirmLabel={`Promote to ${alertState.targetRole}`}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'departments', label: 'Departments' },
  { id: 'categories', label: 'Categories' },
  { id: 'employees', label: 'Employee Directory' },
];

export default function OrganizationSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('departments');

  // Hard route gate — redirect non-Admin immediately
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== 'Admin') {
    // Show nothing while redirect happens
    return null;
  }

  return (
    <div className="px-10 py-8 space-y-6 min-h-screen bg-background">
      {/* ── Page header ── */}
      <header className="space-y-0.5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Admin</p>
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Organization Setup
        </h1>
      </header>

      {/* ── Tabs ── */}
      <div>
        {/* Tab bar */}
        <div className="flex border-b border-border gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-2.5 text-sm transition-colors
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20
                ${
                  activeTab === tab.id
                    ? 'text-foreground font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground after:content-[""]'
                    : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="pt-6">
          {activeTab === 'departments' && <DepartmentsTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'employees' && <EmployeeDirectoryTab />}
        </div>
      </div>
    </div>
  );
}
