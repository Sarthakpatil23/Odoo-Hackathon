import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Button — Design System Compliant
 *
 * Per design.md Button Standards:
 * - Pill shape: rounded-full
 * - Primary: bg-indigo-600 hover:bg-indigo-700, white bold text,
 *   shadow-lg shadow-indigo-600/30, smooth hover translate + scale
 * - Secondary: bg-white hover:bg-slate-50, dark slate semibold text,
 *   shadow-md hover:shadow-lg
 * - Default height: h-[52px] for primary CTA buttons (py-3.5 px-8)
 */
const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    // Primary — Indigo-600, white bold text, glow shadow
    default:
      "bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300",
    // Destructive — danger red
    destructive:
      "bg-danger text-white shadow-sm hover:bg-danger/90 transition-colors",
    // Outline
    outline:
      "border border-border bg-transparent shadow-sm hover:bg-muted hover:text-foreground transition-colors",
    // Secondary / Nav — white fill, dark text
    secondary:
      "bg-white hover:bg-slate-50 text-slate-900 font-semibold shadow-md hover:shadow-lg transition-all duration-300",
    // Ghost
    ghost: "hover:bg-muted hover:text-foreground transition-colors",
    // Link
    link: "text-indigo-600 underline-offset-4 hover:underline",
  }

  const sizes = {
    // Default: 52px height pill — matches design spec exactly
    default: "h-[52px] px-8 py-3.5",
    sm: "h-9 px-4 text-sm",
    lg: "h-[52px] px-10",
    icon: "h-[52px] w-[52px]",
  }

  return (
    <button
      ref={ref}
      className={cn(
        // All buttons are pill-shaped per design.md
        "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
