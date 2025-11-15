import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

type InputSize = "sm" | "md" | "lg"
type InputStatus = "default" | "error" | "success"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize
  status?: InputStatus
  errorMessage?: string
  successMessage?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  wrapperClassName?: string
  showCounter?: boolean
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 text-sm",
  md: "h-11 text-base",
  lg: "h-13 text-lg",
}

const paddingStyles: Record<InputSize, string> = {
  sm: "px-3",
  md: "px-4",
  lg: "px-5",
}

const statusStyles: Record<InputStatus, string> = {
  default:
    "border-border/60 focus-visible:border-transparent focus-visible:ring-primary/65",
  error: "border-red-500/70 focus-visible:border-transparent focus-visible:ring-red-500/70",
  success:
    "border-accent-green/70 focus-visible:border-transparent focus-visible:ring-accent-green/60",
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      size = "md",
      status = "default",
      leftIcon,
      rightIcon,
      type = "text",
      disabled,
      fullWidth = true,
      errorMessage,
      successMessage,
      showCounter = false,
      maxLength,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(
      typeof props.defaultValue === "string"
        ? props.defaultValue
        : props.defaultValue !== undefined
        ? String(props.defaultValue)
        : ""
    )

    const isControlled = props.value !== undefined
    const currentValue = React.useMemo(() => {
      if (isControlled) {
        if (typeof props.value === "number") {
          return String(props.value)
        }
        return (props.value as string) ?? ""
      }
      return uncontrolledValue
    }, [isControlled, props.value, uncontrolledValue])

    const resolvedType =
      type === "password" && isPasswordVisible ? "text" : type

    const hasAction = Boolean(rightIcon) || type === "password"
    const hasLeftIcon = Boolean(leftIcon)

    const padding = cn(
      paddingStyles[size],
      hasLeftIcon && "pl-12",
      hasAction && "pr-12"
    )

    const baseClasses = cn(
      "w-full appearance-none rounded-md border bg-surface/60",
      "backdrop-blur-sm transition-colors duration-200 shadow-subtle",
      "placeholder:text-muted-foreground text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
      "hover:bg-surface/80",
      "disabled:cursor-not-allowed disabled:opacity-60",
      statusStyles[status],
      sizeStyles[size],
      padding,
      className
    )

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setUncontrolledValue(event.target.value)
      }
      onChange?.(event)
    }

    const togglePassword = () => {
      setIsPasswordVisible((prev) => !prev)
    }

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth ? "w-full" : "inline-flex",
          wrapperClassName
        )}
      >
        <div className={cn("relative", fullWidth ? "w-full" : "inline-flex")}> 
          {hasLeftIcon ? (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            type={resolvedType}
            className={baseClasses}
            disabled={disabled}
            aria-invalid={status === "error" || undefined}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
          {hasAction ? (
            <div className="absolute inset-y-0 right-3 flex items-center">
              {type === "password" ? (
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  onClick={togglePassword}
                  disabled={disabled}
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                >
                  {isPasswordVisible ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              ) : (
                <span className="text-muted-foreground">{rightIcon}</span>
              )}
            </div>
          ) : null}
        </div>
        {showCounter ? (
          <div className="flex justify-end text-xs text-muted-foreground">
            {currentValue.length}
            {typeof maxLength === "number" ? ` / ${maxLength}` : ""}
          </div>
        ) : null}
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

Input.displayName = "Input"

export { Input }
export type { InputProps, InputStatus, InputSize }
