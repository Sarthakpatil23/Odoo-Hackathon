/**
 * AssetFlow — Status Color Token Map (design.md §2.3)
 * These are the ONLY colors allowed in the product beyond black/gray/white.
 * Every status dot, indicator, or state visualization must pull from here.
 * Never hardcode hex in components — import STATUS_COLORS or use the Tailwind
 * semantic class names (bg-success, bg-warning, etc.) which map to these via CSS vars.
 */

export const STATUS_COLORS = {
  // Green — Available, Verified, Approved, Completed, Resolved
  success: '#3FBA6D',
  // Blue — Allocated, Ongoing, In Progress, Technician Assigned
  info: '#4B8FE0',
  // Amber — Reserved, Upcoming, Pending
  warning: '#D9A441',
  // Orange — Under Maintenance, High Priority
  attention: '#D97B3F',
  // Red — Lost, Rejected, Overdue, Missing
  danger: '#DB5A5A',
  // Violet-gray — Damaged (audit-only)
  damaged: '#A25AC7',
  // Gray — Retired, Disposed, Cancelled, Inactive, Low Priority
  neutral: '#6E6E6E',
};

/**
 * Maps a maintenance ticket priority to its status color key.
 * Low → neutral, Medium → warning, High → attention
 */
export const PRIORITY_COLOR = {
  Low: STATUS_COLORS.neutral,
  Medium: STATUS_COLORS.warning,
  High: STATUS_COLORS.attention,
};

/**
 * Maps a maintenance ticket status to its status color key.
 */
export const TICKET_STATUS_COLOR = {
  Pending: STATUS_COLORS.warning,
  Approved: STATUS_COLORS.info,
  TechnicianAssigned: STATUS_COLORS.info,
  InProgress: STATUS_COLORS.attention,
  Resolved: STATUS_COLORS.success,
  Rejected: STATUS_COLORS.danger,
};
