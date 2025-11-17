import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import type { InputStatus } from "./input"

type SelectSize = "sm" | "md" | "lg"

type SelectStatus = InputStatus

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: SelectSize
  status?: SelectStatus
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  errorMessage?: string
  successMessage?: string
  fullWidth?: boolean
  wrapperClassName?: string
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "h-9 text-sm",
  md: "h-11 text-base",
  lg: "h-13 text-lg",
}

const paddingStyles: Record<SelectSize, string> = {
  sm: "pl-3 pr-10",
  md: "pl-4 pr-11",
  lg: "pl-5 pr-12",
}

const statusStyles: Record<SelectStatus, string> = {
  default:
    "border-border/60 focus-visible:border-transparent focus-visible:ring-primary/65",
  error: "border-red-500/70 focus-visible:border-transparent focus-visible:ring-red-500/70",
  success:
    "border-accent-green/70 focus-visible:border-transparent focus-visible:ring-accent-green/60",
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      wrapperClassName,
      size = "md",
      status = "default",
      leftIcon,
      rightIcon,
      errorMessage,
      successMessage,
      fullWidth = true,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasLeftIcon = Boolean(leftIcon)
    const hasRightAdornment = Boolean(rightIcon)

    const padding = cn(
      paddingStyles[size],
      hasLeftIcon && "pl-12",
      hasRightAdornment && "pr-14"
    )

    const baseClasses = cn(
      "w-full appearance-none rounded-md border bg-surface/85",
      "backdrop-blur-sm transition-colors duration-200 shadow-subtle",
      "placeholder:text-muted-foreground text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
      "hover:bg-surface/95",
      "disabled:cursor-not-allowed disabled:opacity-60",
      statusStyles[status],
      sizeStyles[size],
      padding,
      className
    )

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth ? "w-full" : "inline-flex",
          wrapperClassName
        )}
      >
        <div className="relative">
          {hasLeftIcon ? (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </span>
          ) : null}
          <select
            ref={ref}
            className={baseClasses}
            disabled={disabled}
            aria-invalid={status === "error" || undefined}
            {...props}
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2 text-muted-foreground">
            {hasRightAdornment ? rightIcon : null}
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {status === "error" && errorMessage ? (
          <p className="text-sm text-red-400">{errorMessage}</p>
        ) : null}
        {status === "success" && successMessage ? (
          <p className="text-sm text-accent-green/80">{successMessage}</p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }
export type { SelectProps }
