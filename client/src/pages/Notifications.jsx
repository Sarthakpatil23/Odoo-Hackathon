import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { NotificationRow } from '../components/shared/NotificationRow';
import { Skeleton } from '../components/shared/Skeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { cn } from '../lib/utils';

// ─── MOCK DATASETS FOR TESTING ──────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    message: 'Laptop AF-0014 assigned to Priya Shah.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2m ago
  },
  {
    id: 'notif-2',
    message: 'Maintenance request AF-0055 approved.',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18m ago
  },
  {
    id: 'notif-3',
    message: 'Booking confirmed: Room B2, 2:00–3:00 PM.',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1h ago
  },
  {
    id: 'notif-4',
    message: 'Transfer approved: AF-0033 to Facilities dept.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
  },
  {
    id: 'notif-5',
    message: 'Overdue return: AF-0021 was due 3 days ago.',
    type: 'danger',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago (Yesterday)
  },
  {
    id: 'notif-6',
    message: 'Audit discrepancy flagged: AF-0088 damaged.',
    type: 'damaged',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2d ago (Earlier)
  }
];

const MOCK_ACTIVITY_LOGS = [
  {
    id: 'log-1',
    action: 'Assigned Dell Laptop AF-0014 to Priya Shah.',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    user: {
      name: 'Sarah Connor',
      role: 'AssetManager'
    }
  },
  {
    id: 'log-2',
    action: 'Approved maintenance request for Forklift AF-0087.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user: {
      name: 'Sarah Connor',
      role: 'AssetManager'
    }
  },
  {
    id: 'log-3',
    action: 'Reserved Conference Room B2 for 2:00–3:00 PM.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: {
      name: 'Priya Shah',
      role: 'Employee'
    }
  },
  {
    id: 'log-4',
    action: 'Approved asset transfer of AF-0033 to Facilities dept.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: {
      name: 'John Doe',
      role: 'DepartmentHead'
    }
  },
  {
    id: 'log-5',
    action: 'Marked MacBook Pro AF-0021 as Overdue.',
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      name: 'System Scheduler',
      role: 'Admin'
    }
  },
  {
    id: 'log-6',
    action: 'Flagged discrepancy: AF-0088 was found Damaged during Q3 Audit.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      name: 'Sarah Connor',
      role: 'AssetManager'
    }
  }
];

/** Plain outline role badge matching design.md */
function RoleBadge({ role }) {
  return (
    <span className="inline-flex items-center border border-border rounded-full px-2 py-0.5 text-xs text-foreground font-medium bg-transparent select-none">
      {role}
    </span>
  );
}

/** Helper to group notifications by day (Today, Yesterday, Earlier) */
function groupNotificationsByDay(notifications) {
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  const now = new Date();
  
  // Start of today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Start of yesterday
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  notifications.forEach((notif) => {
    const date = new Date(notif.createdAt);
    if (date >= todayStart) {
      groups.Today.push(notif);
    } else if (date >= yesterdayStart) {
      groups.Yesterday.push(notif);
    } else {
      groups.Earlier.push(notif);
    }
  });

  return groups;
}

/** Helper to extract asset or resource target tag from action text */
function getTargetTag(actionText) {
  if (!actionText) return '—';
  const regex = /(AF-\d{4}|Room [A-Z0-9]+)/i;
  const match = actionText.match(regex);
  return match ? match[0] : '—';
}

/** Helper to format target tag (mono style) */
function formatTargetTag(tag) {
  if (tag === '—') return '—';
  return (
    <code className="font-mono text-sm text-foreground bg-transparent border-none p-0 font-normal">
      {tag}
    </code>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const [view, setView] = useState('notifications'); // 'notifications' | 'activity-log'
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Alerts' | 'Approvals' | 'Bookings'
  
  const [notifications, setNotifications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;

    if (isMockMode) {
      setNotifications(MOCK_NOTIFICATIONS);
      return;
    }

    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;

    if (isMockMode) {
      setActivityLogs(MOCK_ACTIVITY_LOGS);
      return;
    }

    try {
      const res = await api.get('/activity-logs');
      setActivityLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    }
  }, []);

  // Initial load and view switching
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (view === 'notifications') {
        await fetchNotifications();
      } else {
        await fetchActivityLogs();
      }
      setLoading(false);
    };
    loadData();
  }, [view, fetchNotifications, fetchActivityLogs]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;

    if (isMockMode) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setActionLoading(false);
      return;
    }

    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Reload state
  const handleReload = async () => {
    setLoading(true);
    if (view === 'notifications') {
      await fetchNotifications();
    } else {
      await fetchActivityLogs();
    }
    setLoading(false);
  };

  // Filter notifications based on tab
  const getFilteredNotifications = () => {
    return notifications.filter((notif) => {
      if (activeTab === 'All') return true;
      const msg = (notif.message || '').toLowerCase();
      const type = (notif.type || '').toLowerCase();
      
      if (activeTab === 'Alerts') {
        // Overdue return / audit discrepancy flagged (danger/damaged)
        return type === 'danger' || type === 'damaged';
      }
      if (activeTab === 'Approvals') {
        // Maintenance approved / transfer approved (success/approved)
        return type === 'success' || msg.includes('approved');
      }
      if (activeTab === 'Bookings') {
        // Bookings (contains booking or Room)
        return msg.includes('booking') || msg.includes('room');
      }
      return true;
    });
  };

  const filteredNotifs = getFilteredNotifications();
  const groupedNotifs = groupNotificationsByDay(filteredNotifs);
  const hasUnread = notifications.some(n => !n.isRead);

  // Get Empty State Message
  const getEmptyMessage = () => {
    if (activeTab === 'Alerts') return 'No alert notifications.';
    if (activeTab === 'Approvals') return 'No approval notifications.';
    if (activeTab === 'Bookings') return 'No booking notifications.';
    return 'No notifications.';
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none pb-2">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">Notifications</h1>
        </div>

        {/* View Toggle Group */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex border border-border rounded-md overflow-hidden bg-card">
            <button
              onClick={() => setView('notifications')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                view === 'notifications'
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:text-foreground bg-transparent'
              )}
            >
              Notifications
            </button>
            <button
              onClick={() => setView('activity-log')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
                view === 'activity-log'
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:text-foreground bg-transparent'
              )}
            >
              Activity Log
            </button>
          </div>

          <button 
            onClick={handleReload}
            className="p-2 hover:text-foreground hover:bg-white/5 rounded border border-border text-muted-foreground transition-colors"
            title="Refresh logs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Notifications View */}
      {view === 'notifications' && (
        <div className="space-y-4">
          {/* Subheader with Filter Tabs & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border gap-2">
            {/* Underline Tabs matching design.md */}
            <div className="flex overflow-x-auto scrollbar-none -mb-px">
              {['All', 'Alerts', 'Approvals', 'Bookings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                    activeTab === tab
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Quiet outline mark all read button */}
            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                disabled={actionLoading}
                className="self-end sm:self-auto mb-2 text-xs border border-border bg-transparent text-foreground hover:bg-white/5 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List Content */}
          {loading ? (
            <div className="space-y-4 py-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3 w-3/4">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-3 w-10 shrink-0" />
                </div>
              ))}
            </div>
          ) : filteredNotifs.length === 0 ? (
            <EmptyState
              icon={<Inbox />}
              message={getEmptyMessage()}
            />
          ) : (
            <div className="divide-y-0">
              {/* Group Notifications by Day */}
              {['Today', 'Yesterday', 'Earlier'].map((day) => {
                const dayNotifs = groupedNotifs[day];
                if (!dayNotifs || dayNotifs.length === 0) return null;

                return (
                  <div key={day} className="space-y-2 py-4 first:pt-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground-2 px-1 mb-1">
                      {day}
                    </h3>
                    <div className="flex flex-col">
                      {dayNotifs.map((notif) => (
                        <NotificationRow
                          key={notif.id}
                          notification={notif}
                          className={notif.isRead ? 'opacity-60' : ''}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Activity Log View */}
      {view === 'activity-log' && (
        <div className="space-y-4">
          {loading ? (
            <div className="border border-border rounded-lg p-6 space-y-4 animate-pulse">
              <div className="flex justify-between border-b border-border pb-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 w-16 bg-white/5 rounded" />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between py-1">
                  <div className="h-6 w-24 bg-white/5 rounded" />
                  <div className="h-6 w-48 bg-white/5 rounded" />
                  <div className="h-6 w-16 bg-white/5 rounded" />
                  <div className="h-6 w-12 bg-white/5 rounded" />
                  <div className="h-6 w-16 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : activityLogs.length === 0 ? (
            <EmptyState
              icon={<Inbox />}
              message="No activity logs found."
            />
          ) : (
            <>
              {/* Desktop Table View (hidden below 480px) */}
              <div className="max-[480px]:hidden border border-border rounded-lg bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[180px]">Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="w-[120px]">Target</TableHead>
                      <TableHead className="w-[140px]">Timestamp</TableHead>
                      <TableHead className="w-[130px]">Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-white/[0.03]">
                        {/* Actor */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/10 text-foreground flex items-center justify-center text-xs font-bold font-sans">
                              {(log.user?.name || 'U')[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                              {log.user?.name || 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        
                        {/* Action */}
                        <TableCell className="text-sm text-muted-foreground font-normal">
                          {log.action}
                        </TableCell>
                        
                        {/* Target */}
                        <TableCell>
                          {formatTargetTag(getTargetTag(log.action))}
                        </TableCell>

                        {/* Timestamp */}
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <RoleBadge role={log.user?.role || 'User'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Stacked Card View (visible below 480px) */}
              <div className="min-[481px]:hidden space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="border border-border rounded-lg bg-card p-4 space-y-3 hover:bg-white/[0.01] transition-colors">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/10 text-foreground flex items-center justify-center text-[10px] font-bold">
                          {(log.user?.name || 'U')[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {log.user?.name || 'Unknown'}
                        </span>
                      </div>
                      <RoleBadge role={log.user?.role || 'User'} />
                    </div>

                    {/* Action Text */}
                    <p className="text-sm text-muted-foreground">
                       {log.action}
                    </p>

                    {/* Meta Row */}
                    <div className="flex items-center justify-between border-t border-border pt-2 text-xs font-mono text-muted-foreground-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase font-sans text-muted-foreground-2">Target:</span>
                        {formatTargetTag(getTargetTag(log.action))}
                      </div>
                      <span>
                        {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
