import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex w-full rounded-md border bg-background text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input placeholder:text-muted-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground placeholder:text-secondary-foreground/70 focus-visible:ring-secondary",
        outline: "border-border bg-background placeholder:text-muted-foreground",
        ghost: "border-transparent bg-transparent placeholder:text-muted-foreground",
      },
      size: {
        sm: "min-h-[7rem] px-3 py-2 text-sm",
        md: "min-h-[9rem] px-4 py-3 text-base",
        lg: "min-h-[11rem] px-5 py-4 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: true,
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
