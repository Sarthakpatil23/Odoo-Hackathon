/**
 * StatusDot — design.md §5.4
 * Renders a small colored dot + plain muted-foreground label.
 * The ONLY color allowed in the design system outside of this component is bg-background.
 *
 * Status → dot color mapping follows design.md §2.3 exactly.
 */

const STATUS_CONFIG = {
  // Active / Available states
  active:     { color: '#3FBA6D', label: 'Active' },
  available:  { color: '#3FBA6D', label: 'Available' },
  verified:   { color: '#3FBA6D', label: 'Verified' },
  approved:   { color: '#3FBA6D', label: 'Approved' },
  completed:  { color: '#3FBA6D', label: 'Completed' },
  resolved:   { color: '#3FBA6D', label: 'Resolved' },

  // Info states
  allocated:  { color: '#4B8FE0', label: 'Allocated' },
  ongoing:    { color: '#4B8FE0', label: 'Ongoing' },
  'in-progress': { color: '#4B8FE0', label: 'In Progress' },

  // Warning states
  reserved:   { color: '#D9A441', label: 'Reserved' },
  upcoming:   { color: '#D9A441', label: 'Upcoming' },
  pending:    { color: '#D9A441', label: 'Pending' },

  // Attention states
  maintenance: { color: '#D97B3F', label: 'Under Maintenance' },

  // Danger states
  lost:       { color: '#DB5A5A', label: 'Lost' },
  rejected:   { color: '#DB5A5A', label: 'Rejected' },
  overdue:    { color: '#DB5A5A', label: 'Overdue' },

  // Neutral / Inactive
  inactive:   { color: '#6E6E6E', label: 'Inactive' },
  retired:    { color: '#6E6E6E', label: 'Retired' },
  disposed:   { color: '#6E6E6E', label: 'Disposed' },
  cancelled:  { color: '#6E6E6E', label: 'Cancelled' },

  // Damaged (audit only)
  damaged:    { color: '#A25AC7', label: 'Damaged' },
};

/**
 * @param {object} props
 * @param {keyof STATUS_CONFIG} props.status - the status key
 * @param {string} [props.label] - override the displayed text label
 */
export function StatusDot({ status, label }) {
  const config = STATUS_CONFIG[status] ?? { color: '#6E6E6E', label: status };
  const displayLabel = label ?? config.label;

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <span
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: config.color }}
        aria-hidden="true"
      />
      {displayLabel}
    </span>
  );
}
