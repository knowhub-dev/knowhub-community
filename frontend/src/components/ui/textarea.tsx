import * as React from "react"

import { cn } from "@/lib/utils"
import type { InputStatus } from "./input"

type TextareaSize = "sm" | "md" | "lg"

type TextareaStatus = InputStatus

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: TextareaSize
  status?: TextareaStatus
  errorMessage?: string
  successMessage?: string
  autoResize?: boolean
  showCounter?: boolean
  fullWidth?: boolean
  wrapperClassName?: string
}

const sizeStyles: Record<TextareaSize, string> = {
  sm: "min-h-[7.5rem] text-sm",
  md: "min-h-[9.5rem] text-base",
  lg: "min-h-[12rem] text-lg",
}

const paddingStyles: Record<TextareaSize, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-5 py-4",
}

const statusStyles: Record<TextareaStatus, string> = {
  default:
    "border-border/60 focus-visible:border-transparent focus-visible:ring-primary/65",
  error: "border-red-500/70 focus-visible:border-transparent focus-visible:ring-red-500/70",
  success:
    "border-accent-green/70 focus-visible:border-transparent focus-visible:ring-accent-green/60",
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      wrapperClassName,
      size = "md",
      status = "default",
      errorMessage,
      successMessage,
      autoResize = false,
      showCounter = false,
      fullWidth = true,
      maxLength,
      onChange,
      ...props
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null)
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

    const assignRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
        }
      },
      [ref]
    )

    const adjustHeight = React.useCallback(() => {
      if (!autoResize) return
      const node = innerRef.current
      if (!node) return
      node.style.height = "auto"
      node.style.height = `${node.scrollHeight}px`
    }, [autoResize])

    React.useEffect(() => {
      adjustHeight()
    }, [adjustHeight, currentValue])

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setUncontrolledValue(event.target.value)
      }
      onChange?.(event)
      if (autoResize) {
        requestAnimationFrame(adjustHeight)
      }
    }

    const baseClasses = cn(
      "w-full appearance-none rounded-md border bg-surface/85",
      "backdrop-blur-sm transition-colors duration-200 shadow-subtle",
      "placeholder:text-muted-foreground text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
      "hover:bg-surface/95",
      "disabled:cursor-not-allowed disabled:opacity-60",
      "resize-none",
      statusStyles[status],
      sizeStyles[size],
      paddingStyles[size],
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
        <textarea
          ref={assignRef}
          className={baseClasses}
          aria-invalid={status === "error" || undefined}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
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

Textarea.displayName = "Textarea"

export { Textarea }
export type { TextareaProps }
