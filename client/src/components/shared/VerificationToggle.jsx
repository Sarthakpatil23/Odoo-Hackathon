/**
 * VerificationToggle — three-way segmented toggle for audit verification.
 * design.md v2 §5 — ghost/outline buttons by default, bg-card + text-foreground
 * when active, plus a matching StatusDot to the left of the row.
 * Build once here, import wherever a three-state input is needed.
 *
 * Props:
 *   value    — 'Pending' | 'Verified' | 'Missing' | 'Damaged'
 *   onChange — (newValue: string) => void
 *   disabled — boolean (cycle closed → read-only)
 */
import { cn } from '../../lib/utils';
import { STATUS_COLORS } from '../../lib/tokens';

const OPTIONS = [
  {
    value: 'Verified',
    label: 'Verified',
    dotColor: STATUS_COLORS.success,   // green §2.3
  },
  {
    value: 'Missing',
    label: 'Missing',
    dotColor: STATUS_COLORS.danger,    // red §2.3
  },
  {
    value: 'Damaged',
    label: 'Damaged',
    dotColor: STATUS_COLORS.damaged,   // violet-gray §2.3
  },
];

export function VerificationToggle({ value, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Verification status">
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.value)}
            aria-pressed={isActive}
            className={cn(
              // Base — ghost/outline, §5.1
              'px-2.5 py-1 rounded text-xs border transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-white/20',
              isActive
                ? // Active — bg-card + text-foreground, matching sidebar active item §4.1
                  'bg-card text-foreground border-border-strong'
                : // Inactive
                  'bg-transparent text-muted-foreground border-border hover:text-foreground',
              disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Returns the color and label for a given audit result value.
 * Used to render a StatusDot at the row level once a result is selected.
 */
export function getResultDot(result) {
  return OPTIONS.find((o) => o.value === result) ?? null;
}
