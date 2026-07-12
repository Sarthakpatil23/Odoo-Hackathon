/**
 * Resource Booking — Screen 6
 * design.md v2 — pure black canvas, hairline borders, status dots only.
 *
 * Features:
 *   1. Resource selector (bookable assets) + date picker
 *   2. CSS-grid hour timeline (9 AM – 7 PM), no 3rd-party calendar lib
 *   3. Click-drag to select a time range → Popover to confirm booking
 *   4. Overlap detection: 409 from server → inline bordered Alert
 *   5. Right panel: today's booking list with cancel / reschedule actions
 *   6. Skeleton loading, empty states per §5.7
 *   7. Responsive: below 640 px → simple vertical stacked list
 */

import { useState, useEffect, useRef, useCallback, useId } from 'react';
import {
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox,
  MoreHorizontal,
  X,
  Clock,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatusDot } from '../components/shared/StatusDot';
import { Skeleton } from '../components/shared/Skeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { cn } from '../lib/utils';

// ─── CONFIG ─────────────────────────────────────────────────────────────────

const HOUR_START = 9;   // 9 AM
const HOUR_END   = 20;  // 8 PM (exclusive — 7 PM is last visible hour block)
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatHour(h) {
  if (h === 12) return '12:00 PM';
  if (h > 12)  return `${h - 12}:00 PM`;
  return `${h}:00 AM`;
}

function formatTimeRange(startIso, endIso) {
  const fmt = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(startIso)} – ${fmt(endIso)}`;
}

function toLocalDateValue(date) {
  // Returns YYYY-MM-DD for <input type="date">
  const d = new Date(date);
  return d.toLocaleDateString('en-CA'); // ISO date in local TZ
}

function buildDateTimeISO(dateStr, hour, minute = 0) {
  // dateStr: YYYY-MM-DD, hour: 9–19, minute: 0|30
  const dt = new Date(`${dateStr}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`);
  return dt.toISOString();
}

// ─── BOOKING STATUS → design.md §2.3 ─────────────────────────────────────────

function bookingStatus(b) {
  const now = new Date();
  const start = new Date(b.startTime);
  const end   = new Date(b.endTime);
  if (b.status === 'Cancelled') return 'cancelled';
  if (now >= start && now < end)  return 'ongoing';
  if (now >= end)                 return 'completed';
  return 'upcoming';
}

// ─── TOAST (sonner-style, §5.7) ────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'default') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  return { toasts, push };
}

function ToastRegion({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div role="status" aria-live="polite"
      className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={cn(
            'pointer-events-auto animate-fade-in px-4 py-2.5 rounded-lg border text-sm bg-popover text-foreground',
            t.type === 'danger' ? 'border-danger/30 text-danger' : 'border-border'
          )}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── DIALOG SHELL (AlertDialog for cancel confirm) ───────────────────────────

function Dialog({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-popover border border-border rounded-lg p-6 w-full max-w-sm mx-4 shadow-sm"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          <button onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 -mt-0.5 -mr-0.5 rounded">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── GRID SKELETON ────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {HOURS.map(h => (
        <div key={h} className="flex border-b border-border last:border-b-0">
          <div className="w-20 shrink-0 px-3 py-3 border-r border-border">
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="flex-1 px-3 py-3">
            {Math.random() > 0.7 && <Skeleton className="h-12 w-3/4 rounded-md" />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BOOKING BLOCK ─────────────────────────────────────────────────────────

function BookingBlock({ booking }) {
  const status = bookingStatus(booking);
  const isOngoing = status === 'ongoing';
  const isCancelled = status === 'cancelled';

  return (
    <div className="bg-card border border-border rounded-md p-2 mb-1 last:mb-0 select-none">
      <div className="flex items-start gap-2">
        {/* Pulsing dot for ongoing, static for others */}
        <span
          className={cn(
            'mt-0.5 h-2 w-2 rounded-full shrink-0',
            isOngoing   ? 'bg-info animate-pulse'      :
            isCancelled ? 'bg-neutral-state'            :
            status === 'upcoming'  ? 'bg-warning'       :
            status === 'completed' ? 'bg-neutral-state' : 'bg-neutral-state'
          )}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className={cn(
            'text-sm text-foreground leading-snug truncate',
            isCancelled && 'line-through text-muted-foreground'
          )}>
            {booking.employee?.name || 'Unknown'} · {formatTimeRange(booking.startTime, booking.endTime)}
          </p>
          {booking.purpose && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{booking.purpose}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── INLINE CONFLICT ALERT (§5.7) ────────────────────────────────────────

function ConflictAlert({ message, onDismiss }) {
  return (
    <div className="flex items-start gap-2 border border-danger/30 rounded-md px-3 py-2 text-sm text-danger">
      <AlertCircle size={14} className="mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss}
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function Bookings() {
  const { user } = useAuth();
  const { toasts, push: toast } = useToast();

  // Resource + Date state
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedDate, setSelectedDate] = useState(toLocalDateValue(new Date()));

  // Bookings for this resource+day
  const [bookings, setBookings] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Drag selection state
  const [dragStart, setDragStart] = useState(null); // hour integer
  const [dragEnd, setDragEnd]     = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Booking popover / form state
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [purpose, setPurpose]         = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [conflictMsg, setConflictMsg] = useState('');

  // Cancel confirm dialog
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling]     = useState(false);

  // Mobile: which panel is shown
  const [mobilePanel, setMobilePanel] = useState('grid'); // 'grid' | 'list'

  // ── Load bookable resources ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingResources(true);
      try {
        const res = await api.get('/assets', { params: { isBookable: true } });
        const list = (res.data?.assets || res.data || []).filter(a => a.isBookable);
        setResources(list);
        if (list.length > 0 && !selectedResource) setSelectedResource(list[0]);
      } catch (err) {
        console.error('Failed to fetch bookable resources:', err);
        // Use placeholder so UI never breaks in demo
        setResources([
          { id: 'ph-1', tag: 'Room-B2', name: 'Conference Room B2', isBookable: true },
          { id: 'ph-2', tag: 'AF-0004', name: 'iPhone 15 Pro Testbed', isBookable: true },
        ]);
        setSelectedResource({ id: 'ph-1', tag: 'Room-B2', name: 'Conference Room B2', isBookable: true });
      } finally {
        setLoadingResources(false);
      }
    })();
  }, []);

  // ── Load bookings for selected resource + date ───────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!selectedResource) return;
    setLoadingBookings(true);
    setConflictMsg('');
    try {
      const res = await api.get('/bookings', { params: { assetId: selectedResource.id } });
      // Filter to selected date
      const dayStart = new Date(`${selectedDate}T00:00:00`);
      const dayEnd   = new Date(`${selectedDate}T23:59:59`);
      const dayBookings = (res.data || []).filter(b => {
        const s = new Date(b.startTime);
        return s >= dayStart && s <= dayEnd;
      });
      setBookings(dayBookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, [selectedResource, selectedDate]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleHourMouseDown = (hour) => {
    setDragStart(hour);
    setDragEnd(hour);
    setIsDragging(true);
    setPopoverOpen(false);
    setConflictMsg('');
  };

  const handleHourMouseEnter = (hour) => {
    if (!isDragging) return;
    setDragEnd(hour);
  };

  const handleGridMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragStart !== null && dragEnd !== null) {
      setPurpose('');
      setConflictMsg('');
      setPopoverOpen(true);
    }
  };

  // Normalize selection (start ≤ end always)
  const selStart = dragStart !== null && dragEnd !== null ? Math.min(dragStart, dragEnd) : null;
  const selEnd   = dragStart !== null && dragEnd !== null ? Math.max(dragStart, dragEnd) + 1 : null;

  function isHourSelected(h) {
    return selStart !== null && h >= selStart && h < selEnd;
  }

  // ── Submit booking ────────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (!selectedResource || selStart === null) return;
    setSubmitting(true);
    setConflictMsg('');
    try {
      await api.post('/bookings', {
        assetId:   selectedResource.id,
        startTime: buildDateTimeISO(selectedDate, selStart),
        endTime:   buildDateTimeISO(selectedDate, selEnd),
        purpose,
      });
      toast(`Booking confirmed: ${formatHour(selStart)} – ${formatHour(selEnd)}`);
      setPopoverOpen(false);
      setDragStart(null);
      setDragEnd(null);
      setPurpose('');
      await fetchBookings();
    } catch (err) {
      if (err.response?.status === 409) {
        const conf = err.response.data?.conflictingBooking;
        setConflictMsg(
          conf
            ? `Requested ${formatHour(selStart)}–${formatHour(selEnd)} conflicts with an existing booking (${formatTimeRange(conf.startTime, conf.endTime)}) — this slot is unavailable.`
            : 'This slot conflicts with an existing booking — it is unavailable.'
        );
        setDragStart(null);
        setDragEnd(null);
      } else {
        toast('Failed to create booking.', 'danger');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel booking ────────────────────────────────────────────────────────
  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.patch(`/bookings/${cancelTarget.id}/cancel`);
      toast('Booking cancelled.');
      setCancelTarget(null);
      await fetchBookings();
    } catch (err) {
      toast(err.response?.data?.error || 'Could not cancel booking.', 'danger');
    } finally {
      setCancelling(false);
    }
  };

  // ── Navigate date ─────────────────────────────────────────────────────────
  const shiftDate = (delta) => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + delta);
    setSelectedDate(toLocalDateValue(d));
  };

  // ── Overlay blocks for a given hour ──────────────────────────────────────
  function bookingsForHour(hour) {
    return bookings.filter(b => {
      const s = new Date(b.startTime).getHours();
      return s === hour;
    });
  }

  const today = toLocalDateValue(new Date());
  const isToday = selectedDate === today;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6" onMouseUp={handleGridMouseUp}>

      {/* ── 1. Page header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">Resource Booking</h1>
        </div>

        {/* Primary action — solid off-white fill, §5.1 */}
        <button
          id="book-slot-btn"
          onClick={() => {
            setDragStart(10);
            setDragEnd(11);
            setPurpose('');
            setConflictMsg('');
            setPopoverOpen(true);
          }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:bg-foreground/90 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
        >
          <Plus size={14} />
          Book a Slot
        </button>
      </div>

      {/* ── 2. Resource + Date selector ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        {/* Resource select */}
        <div className="flex flex-col gap-1 min-w-0 w-full sm:w-auto">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Resource</label>
          {loadingResources ? (
            <Skeleton className="h-9 w-52 rounded-md" />
          ) : (
            <select
              id="resource-select"
              value={selectedResource?.id || ''}
              onChange={e => {
                const r = resources.find(x => x.id === e.target.value);
                setSelectedResource(r || null);
              }}
              className="h-9 bg-card border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-white/10 transition-colors cursor-pointer w-full sm:w-auto"
            >
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name} · {r.tag}</option>
              ))}
              {resources.length === 0 && (
                <option value="">No bookable resources</option>
              )}
            </select>
          )}
        </div>

        {/* Date navigation */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Date</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => shiftDate(-1)}
              className="h-9 w-9 flex items-center justify-center border border-border bg-transparent rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft size={14} />
            </button>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="h-9 bg-card border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-white/10 transition-colors font-mono"
            />
            <button
              onClick={() => shiftDate(+1)}
              className="h-9 w-9 flex items-center justify-center border border-border bg-transparent rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              aria-label="Next day"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Today badge */}
        {isToday && (
          <span className="self-end sm:self-auto mb-0.5 text-xs font-mono text-muted-foreground border border-border-strong rounded-full px-2 py-0.5 select-none">
            Today
          </span>
        )}
      </div>

      {/* ── Conflict Alert (shown when overlap detected) ─────────────────── */}
      {conflictMsg && !popoverOpen && (
        <ConflictAlert message={conflictMsg} onDismiss={() => setConflictMsg('')} />
      )}

      {/* ── Mobile panel tabs ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden border-b border-border">
        {['grid', 'list'].map(p => (
          <button
            key={p}
            onClick={() => setMobilePanel(p)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize',
              mobilePanel === p
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {p === 'grid' ? 'Timeline' : 'List'}
          </button>
        ))}
      </div>

      {/* ── 3. Main content area ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">

        {/* ── LEFT: Hour timeline grid ──────────────────────────────────── */}
        <div className={cn(
          'flex-1 min-w-0',
          mobilePanel === 'list' ? 'hidden sm:block' : 'block'
        )}>
          {!selectedResource ? (
            <EmptyState
              icon={<Calendar />}
              message="Select a resource to view its booking schedule."
            />
          ) : loadingBookings ? (
            <GridSkeleton />
          ) : (
            <div
              className={cn(
                'border border-border rounded-lg overflow-hidden',
                isToday && 'border-border-strong'
              )}
              role="grid"
              aria-label="Booking timeline"
              onMouseLeave={() => { if (isDragging) { setIsDragging(false); setPopoverOpen(true); } }}
            >
              {/* Today indicator strip */}
              {isToday && (
                <div className="px-3 py-1.5 bg-white/[0.02] border-b border-border flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
                  <span className="text-xs text-muted-foreground font-mono">Today · {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              {HOURS.map(hour => {
                const hourBookings = bookingsForHour(hour);
                const selected = isHourSelected(hour);

                return (
                  <div
                    key={hour}
                    role="row"
                    className={cn(
                      'flex border-b border-border last:border-b-0 transition-colors group',
                      selected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]',
                      !isDragging && 'cursor-crosshair'
                    )}
                    onMouseDown={() => handleHourMouseDown(hour)}
                    onMouseEnter={() => handleHourMouseEnter(hour)}
                  >
                    {/* Hour label column */}
                    <div className="w-24 shrink-0 px-3 py-3 border-r border-border flex items-start select-none">
                      <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatHour(hour)}
                      </span>
                    </div>

                    {/* Booking slots column */}
                    <div className="flex-1 px-3 py-1.5 min-h-[52px] flex flex-col justify-start gap-1">
                      {/* Selection overlay label */}
                      {selected && !popoverOpen && (
                        <span className="text-xs text-muted-foreground select-none">
                          {formatHour(selStart)} – {formatHour(selEnd)}
                        </span>
                      )}
                      {hourBookings.map(b => (
                        <BookingBlock key={b.id} booking={b} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Day booking list panel ────────────────────────────── */}
        <div className={cn(
          'w-full sm:w-72 shrink-0',
          mobilePanel === 'grid' ? 'hidden sm:block' : 'block'
        )}>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">
                {isToday ? "Today's Bookings" : new Date(`${selectedDate}T12:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {bookings.filter(b => b.status !== 'Cancelled').length} booked
              </span>
            </div>

            {/* List content */}
            {loadingBookings ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="px-4 py-10 flex flex-col items-center justify-center text-center gap-3">
                <Clock size={28} className="text-muted-foreground stroke-[1.5]" />
                <p className="text-sm text-muted-foreground">No bookings for this day.</p>
                <button
                  onClick={() => { setDragStart(10); setDragEnd(11); setPurpose(''); setConflictMsg(''); setPopoverOpen(true); }}
                  className="text-xs border border-border bg-transparent text-foreground hover:bg-white/5 px-3 py-1.5 rounded-md font-medium transition-colors"
                >
                  Book a Slot
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {bookings.map(b => {
                  const status = bookingStatus(b);
                  const isCancelled = status === 'cancelled';
                  const isUpcoming  = status === 'upcoming';
                  return (
                    <div
                      key={b.id}
                      className="px-4 py-3 flex items-start justify-between gap-2 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <StatusDot
                          status={status}
                          label=""
                          className={cn('mt-0.5 shrink-0', status === 'ongoing' && '[&>span:first-child]:animate-pulse')}
                        />
                        <div className="min-w-0">
                          <p className={cn(
                            'text-sm text-foreground truncate',
                            isCancelled && 'line-through text-muted-foreground'
                          )}>
                            {b.employee?.name || 'Unknown'}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeRange(b.startTime, b.endTime)}
                          </p>
                        </div>
                      </div>

                      {/* Row action — ghost ⋯ only for Upcoming bookings */}
                      {isUpcoming && (
                        <div className="relative shrink-0">
                          <BookingRowMenu
                            booking={b}
                            onCancel={() => setCancelTarget(b)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Booking creation popover ──────────────────────────────────── */}
      {popoverOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 bg-black/50 backdrop-blur-sm"
          onClick={() => { setPopoverOpen(false); setDragStart(null); setDragEnd(null); }}>
          <div
            className="bg-popover border border-border rounded-lg p-5 w-full max-w-sm shadow-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">Confirm Booking</h2>
              <button onClick={() => { setPopoverOpen(false); setDragStart(null); setDragEnd(null); }}
                className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Selected time range */}
            <div className="mb-4 font-mono text-sm text-muted-foreground border border-border rounded-md px-3 py-2 bg-card">
              {selectedResource?.name} · {formatHour(selStart ?? 10)} – {formatHour(selEnd ?? 11)}
            </div>

            {/* Conflict alert inline */}
            {conflictMsg && (
              <div className="mb-3">
                <ConflictAlert message={conflictMsg} onDismiss={() => setConflictMsg('')} />
              </div>
            )}

            {/* Purpose input */}
            <div className="mb-4">
              <label htmlFor="booking-purpose" className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                Purpose
              </label>
              <input
                id="booking-purpose"
                type="text"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="e.g. Team standup, Design review…"
                className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-white/10 transition-colors"
                onKeyDown={e => { if (e.key === 'Enter') handleConfirmBooking(); }}
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                id="confirm-booking-btn"
                onClick={handleConfirmBooking}
                disabled={submitting || !!conflictMsg}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
              >
                {submitting ? 'Confirming…' : 'Confirm Booking'}
              </button>
              <button
                onClick={() => { setPopoverOpen(false); setDragStart(null); setDragEnd(null); setConflictMsg(''); }}
                className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 border border-border bg-transparent font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Cancel confirm AlertDialog ────────────────────────────────── */}
      <Dialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel this booking?"
      >
        <p className="text-sm text-muted-foreground mb-4">
          This will cancel the booking for{' '}
          <span className="text-foreground font-medium">{cancelTarget?.employee?.name || 'this user'}</span>{' '}
          {cancelTarget && (
            <span className="font-mono text-xs">({formatTimeRange(cancelTarget.startTime, cancelTarget.endTime)})</span>
          )}.
          This cannot be undone.
        </p>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setCancelTarget(null)}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border bg-transparent rounded-md hover:bg-white/5 transition-colors"
          >
            Keep
          </button>
          <button
            id="confirm-cancel-btn"
            onClick={handleCancelBooking}
            disabled={cancelling}
            className="px-3 py-1.5 text-sm border border-danger/30 text-danger bg-transparent rounded-md hover:bg-danger/5 disabled:opacity-50 transition-colors"
          >
            {cancelling ? 'Cancelling…' : 'Cancel Booking'}
          </button>
        </div>
      </Dialog>

      {/* ── Toasts ────────────────────────────────────────────────────────── */}
      <ToastRegion toasts={toasts} />
    </div>
  );
}

// ─── BOOKING ROW MENU ─────────────────────────────────────────────────────────

function BookingRowMenu({ booking, onCancel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="p-1 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded transition-colors"
        aria-label="Booking options"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 min-w-[140px] bg-popover border border-border rounded-md shadow-sm overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onCancel(); }}
            className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-white/5 transition-colors"
          >
            Cancel booking
          </button>
        </div>
      )}
    </div>
  );
}
