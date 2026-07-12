/**
 * Toast — lightweight toast notification system.
 *
 * Sonner is not in the current package.json, so this is a self-contained
 * implementation that matches the design.md aesthetic:
 * pure black/gray, hairline border, no color except status dots,
 * positioned bottom-right, auto-dismissed after 4s.
 *
 * Usage:
 *   import { useToast } from '../components/shared/Toast';
 *   const { toast } = useToast();
 *   toast('Aditi Rao promoted to Department Head.');
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

let _toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    (message, { duration = 4000 } = {}) => {
      const id = ++_toastId;
      setToasts((prev) => [...prev, { id, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — bottom-right, z-50 */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="
              pointer-events-auto
              flex items-start gap-3
              min-w-[280px] max-w-sm
              rounded-lg
              border border-border
              bg-popover
              px-4 py-3
              text-sm text-foreground
              shadow-sm
              animate-fade-in
            "
          >
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
