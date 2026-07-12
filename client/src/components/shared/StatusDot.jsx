/**
 * StatusDot — design.md §5.4
 * Renders a small colored dot + plain muted-foreground label.
 * The ONLY color allowed in the design system outside of this component.
 *
 * Uses Tailwind color classes (bg-success, bg-danger, etc.) which map to
 * the CSS variables in index.css — no hardcoded hex values.
 */

import { cn } from '../../lib/utils';

const STATUS_MAP = {
  // Active / Available states
  active:        { bg: 'bg-success', label: 'Active' },
  success:       { bg: 'bg-success', label: 'Success' },
  available:     { bg: 'bg-success', label: 'Available' },
  verified:      { bg: 'bg-success', label: 'Verified' },
  approved:      { bg: 'bg-success', label: 'Approved' },
  completed:     { bg: 'bg-success', label: 'Completed' },
  resolved:      { bg: 'bg-success', label: 'Resolved' },

  // Info states
  info:          { bg: 'bg-info', label: 'Info' },
  allocated:     { bg: 'bg-info', label: 'Allocated' },
  ongoing:       { bg: 'bg-info', label: 'Ongoing' },
  'in progress': { bg: 'bg-info', label: 'In Progress' },
  'in-progress': { bg: 'bg-info', label: 'In Progress' },

  // Warning states
  warning:       { bg: 'bg-warning', label: 'Warning' },
  reserved:      { bg: 'bg-warning', label: 'Reserved' },
  pending:       { bg: 'bg-warning', label: 'Pending' },
  upcoming:      { bg: 'bg-warning', label: 'Upcoming' },

  // Attention states
  attention:         { bg: 'bg-attention', label: 'Attention' },
  maintenance:       { bg: 'bg-attention', label: 'Under Maintenance' },
  'under maintenance': { bg: 'bg-attention', label: 'Under Maintenance' },
  'high priority':   { bg: 'bg-attention', label: 'High Priority' },

  // Danger states
  danger:   { bg: 'bg-danger', label: 'Danger' },
  lost:     { bg: 'bg-danger', label: 'Lost' },
  rejected: { bg: 'bg-danger', label: 'Rejected' },
  overdue:  { bg: 'bg-danger', label: 'Overdue' },
  missing:  { bg: 'bg-danger', label: 'Missing' },

  // Damaged (audit only)
  damaged: { bg: 'bg-damaged', label: 'Damaged' },

  // Neutral / Inactive
  neutral:   { bg: 'bg-neutral-state', label: 'Neutral' },
  inactive:  { bg: 'bg-neutral-state', label: 'Inactive' },
  retired:   { bg: 'bg-neutral-state', label: 'Retired' },
  disposed:  { bg: 'bg-neutral-state', label: 'Disposed' },
  cancelled: { bg: 'bg-neutral-state', label: 'Cancelled' },
};

/**
 * @param {object} props
 * @param {string} props.status - the status key (case-insensitive)
 * @param {string} [props.label] - override the displayed text label
 * @param {string} [props.className] - additional classes
 */
export function StatusDot({ status, label, className }) {
  const normalized = (status || '').toLowerCase();
  const config = STATUS_MAP[normalized] ?? { bg: 'bg-neutral-state', label: status };
  const displayLabel = label ?? config.label;

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm text-muted-foreground', className)}>
      <span
        className={cn('h-2 w-2 rounded-full shrink-0', config.bg)}
        aria-hidden="true"
      />
      <span>{displayLabel}</span>
    </span>
  );
}
