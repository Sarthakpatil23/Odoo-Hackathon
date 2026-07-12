import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusDot } from './StatusDot';
import { cn } from '../../lib/utils';

/**
 * Format relative time (e.g. "2m ago", "1h ago", "1d ago")
 */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

/**
 * Inline asset tags rendered as plain monospace code blocks (not boxed)
 */
export function formatMessage(message) {
  if (!message) return '';
  // Match asset tags like AF-0014, AF-0055, AF-0033, AF-0021, AF-0088 or Room B2
  const regex = /(AF-\d{4}|Room [A-Z0-9]+)/g;
  const parts = message.split(regex);
  return parts.map((part, i) => {
    if (regex.test(part)) {
      return (
        <code key={i} className="font-mono text-sm text-foreground bg-transparent border-none p-0 font-normal">
          {part}
        </code>
      );
    }
    return part;
  });
}

/**
 * NotificationRow component (design.md §5)
 * Renders a small status dot, the notification text, relative timestamp.
 * Row click navigates to the relevant category detail page.
 */
export function NotificationRow({ notification, onClick, className }) {
  const navigate = useNavigate();

  const handleRowClick = (e) => {
    if (onClick) {
      onClick(notification);
      return;
    }

    // Default navigation logic based on notification content
    const msg = (notification.message || '').toLowerCase();
    if (msg.includes('maintenance')) {
      navigate('/maintenance');
    } else if (msg.includes('booking') || msg.includes('room')) {
      navigate('/bookings');
    } else if (msg.includes('transfer')) {
      navigate('/allocations');
    } else if (msg.includes('audit')) {
      navigate('/audits');
    } else {
      navigate('/assets');
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={cn(
        'flex items-center justify-between py-3 px-4 hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-border select-none',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* StatusDot on the left with empty label per §2.3/§5.4 */}
        <StatusDot status={notification.type} label="" className="shrink-0" />
        <span className="text-sm text-foreground truncate">
          {formatMessage(notification.message)}
        </span>
      </div>
      <span className="font-mono text-xs text-muted-foreground shrink-0 ml-4">
        {formatRelativeTime(notification.createdAt)}
      </span>
    </div>
  );
}
