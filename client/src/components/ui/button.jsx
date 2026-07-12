import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Button — Design System Compliant (V2)
 *
 * Per design.md v2 standards:
 * - Corner radius: rounded-lg (8px)
 * - Primary: bg-primary text-primary-foreground hover:bg-primary/90, no glow shadow
 * - Secondary/outline: border border-border bg-transparent text-foreground hover:bg-white/5
 * - Ghost: text-muted-foreground hover:text-foreground hover:bg-white/5
 * - Destructive: same shape as secondary/outline but text-danger border-danger/30
 */
const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    // Primary - solid off-white fill with near-black text
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors",
    // Destructive - outline border-danger/30 text-danger
    destructive:
      "border border-danger/30 bg-transparent text-danger hover:bg-danger/10 font-medium transition-colors",
    // Outline / Secondary
    outline:
      "border border-border bg-transparent text-foreground hover:bg-white/5 font-medium transition-colors",
    // Secondary alias for convenience
    secondary:
      "border border-border bg-transparent text-foreground hover:bg-white/5 font-medium transition-colors",
    // Ghost
    ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5 font-medium transition-colors",
    // Link
    link: "text-foreground underline-offset-4 hover:underline font-medium",
  }

  const sizes = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-10 px-5 text-sm",
    icon: "h-9 w-9 p-0 flex items-center justify-center",
  }

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 transition-colors duration-150",
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
