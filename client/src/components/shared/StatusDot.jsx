import React from 'react';
import { cn } from '../../lib/utils';

const STATUS_MAP = {
  success: { bg: 'bg-success', label: 'Success' },
  available: { bg: 'bg-success', label: 'Available' },
  verified: { bg: 'bg-success', label: 'Verified' },
  approved: { bg: 'bg-success', label: 'Approved' },
  completed: { bg: 'bg-success', label: 'Completed' },
  resolved: { bg: 'bg-success', label: 'Resolved' },
  
  info: { bg: 'bg-info', label: 'Info' },
  allocated: { bg: 'bg-info', label: 'Allocated' },
  ongoing: { bg: 'bg-info', label: 'Ongoing' },
  'in progress': { bg: 'bg-info', label: 'In Progress' },
  
  warning: { bg: 'bg-warning', label: 'Warning' },
  reserved: { bg: 'bg-warning', label: 'Reserved' },
  pending: { bg: 'bg-warning', label: 'Pending' },
  upcoming: { bg: 'bg-warning', label: 'Upcoming' },
  
  attention: { bg: 'bg-attention', label: 'Attention' },
  'under maintenance': { bg: 'bg-attention', label: 'Under Maintenance' },
  'high priority': { bg: 'bg-attention', label: 'High Priority' },
  
  danger: { bg: 'bg-danger', label: 'Danger' },
  lost: { bg: 'bg-danger', label: 'Lost' },
  rejected: { bg: 'bg-danger', label: 'Rejected' },
  overdue: { bg: 'bg-danger', label: 'Overdue' },
  missing: { bg: 'bg-danger', label: 'Missing' },
  
  damaged: { bg: 'bg-damaged', label: 'Damaged' },
  
  neutral: { bg: 'bg-neutral-state', label: 'Neutral' },
  retired: { bg: 'bg-neutral-state', label: 'Retired' },
  disposed: { bg: 'bg-neutral-state', label: 'Disposed' },
  cancelled: { bg: 'bg-neutral-state', label: 'Cancelled' },
  inactive: { bg: 'bg-neutral-state', label: 'Inactive' },
};

export function StatusDot({ status, label, className }) {
  const normalized = (status || '').toLowerCase();
  const config = STATUS_MAP[normalized] || { bg: 'bg-neutral-state', label: status };
  const displayLabel = label || config.label;

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
      <span className={cn("h-2 w-2 rounded-full shrink-0", config.bg)}></span>
      <span>{displayLabel}</span>
    </span>
  );
}
