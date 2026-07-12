/**
 * Skeleton — design.md §4.2 / §5.7
 * Flat pulsing gray block. Build once, import for every loading state.
 * No shimmer gradient sweep — just animate-pulse bg-white/5.
 */

import { cn } from '../../lib/utils';

/**
 * @param {object} props
 * @param {string} [props.className] - additional Tailwind classes for shape/size
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-md bg-white/5 animate-pulse',
        className
      )}
      {...props}
    />
  );
}
