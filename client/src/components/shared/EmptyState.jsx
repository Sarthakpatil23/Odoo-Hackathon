/**
 * EmptyState — design.md §5.7
 * Centered icon + one plain line + one optional action button.
 * Matches the calm "Deploy your first project" Vercel-reference pattern.
 * No illustration, no color.
 */

/**
 * @param {object} props
 * @param {React.ReactNode} props.icon - Lucide icon element (32px, text-muted-foreground)
 * @param {string} props.message - one plain line of copy
 * @param {React.ReactNode} [props.action] - one ghost/outline button if an action applies
 */
export function EmptyState({ icon, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-muted-foreground [&>svg]:h-8 [&>svg]:w-8 [&>svg]:stroke-[1.5]">
        {icon}
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
