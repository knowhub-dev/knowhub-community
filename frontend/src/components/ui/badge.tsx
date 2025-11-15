import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge relative inline-flex min-w-0 items-center justify-start gap-2 overflow-hidden rounded-[var(--radius-md)] border border-transparent px-3 py-1 font-medium tracking-tight text-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        solid: "bg-surface/60 text-foreground shadow-subtle backdrop-blur-sm",
        outline:
          "bg-transparent text-foreground shadow-none backdrop-blur-sm hover:shadow-subtle",
        neon:
          "isolate bg-transparent text-white shadow-[0_0_28px_rgba(164,85,247,0.45)] before:absolute before:inset-0 before:-z-10 before:rounded-[var(--radius-md)] before:bg-gradient-to-r before:from-accent-purple/80 before:to-accent-pink/80 before:opacity-90 before:blur-[1px] before:transition-opacity before:duration-200 before:content-[''] after:absolute after:inset-[1px] after:-z-20 after:rounded-[calc(var(--radius-md)-2px)] after:bg-surface/70 after:backdrop-blur-md after:content-[''] hover:before:opacity-100",
        icon: "bg-surface/40 text-foreground shadow-subtle backdrop-blur-sm",
        achievement:
          "bg-gradient-to-r from-amber-400/85 via-amber-300/80 to-yellow-400/80 text-slate-900 shadow-[0_0_32px_rgba(251,191,36,0.45)]",
      },
      size: {
        sm: "h-7 px-2 text-xs",
        md: "h-8 px-3 text-sm",
        lg: "h-10 px-4 text-base",
      },
      color: {
        primary: "",
        secondary: "",
        success: "",
        danger: "",
        warning: "",
      },
      fullWidth: {
        true: "w-full justify-between",
      },
    },
    compoundVariants: [
      {
        variant: "solid",
        color: "primary",
        className: "border-primary/30 bg-primary text-white",
      },
      {
        variant: "solid",
        color: "secondary",
        className: "border-secondary/30 bg-secondary text-background",
      },
      {
        variant: "solid",
        color: "success",
        className: "border-accent-green/30 bg-accent-green text-background",
      },
      {
        variant: "solid",
        color: "danger",
        className: "border-red-500/35 bg-red-500 text-white",
      },
      {
        variant: "solid",
        color: "warning",
        className: "border-amber-400/40 bg-amber-400 text-slate-900",
      },
      {
        variant: "outline",
        color: "primary",
        className:
          "border-primary/70 text-primary hover:border-primary-light hover:text-white",
      },
      {
        variant: "outline",
        color: "secondary",
        className:
          "border-secondary/70 text-secondary hover:border-secondary hover:text-background",
      },
      {
        variant: "outline",
        color: "success",
        className:
          "border-accent-green/70 text-accent-green hover:border-accent-green hover:text-background",
      },
      {
        variant: "outline",
        color: "danger",
        className:
          "border-red-500/70 text-red-400 hover:border-red-500 hover:text-white",
      },
      {
        variant: "outline",
        color: "warning",
        className:
          "border-amber-400/70 text-amber-300 hover:border-amber-300 hover:text-slate-900",
      },
      {
        variant: "icon",
        color: "primary",
        className: "border-primary/30 bg-primary/20 text-primary-light",
      },
      {
        variant: "icon",
        color: "secondary",
        className: "border-secondary/30 bg-secondary/15 text-secondary",
      },
      {
        variant: "icon",
        color: "success",
        className: "border-accent-green/30 bg-accent-green/15 text-accent-green",
      },
      {
        variant: "icon",
        color: "danger",
        className: "border-red-500/40 bg-red-500/15 text-red-400",
      },
      {
        variant: "icon",
        color: "warning",
        className: "border-amber-400/40 bg-amber-400/10 text-amber-300",
      },
      {
        variant: "achievement",
        color: "primary",
        className: "border-amber-300/70",
      },
    ],
    defaultVariants: {
      variant: "solid",
      size: "md",
      color: "primary",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  tooltip?: string;
  truncate?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      color,
      fullWidth,
      leftIcon,
      rightIcon,
      tooltip,
      truncate = true,
      children,
      ...props
    },
    ref,
  ) => {
    const showInnerGlow = variant === "neon" || variant === "achievement";

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, color, fullWidth }),
          showInnerGlow && "[&>*]:relative [&>*]:z-10",
          className,
        )}
        title={tooltip}
        data-variant={variant}
        {...props}
      >
        {leftIcon ? (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-current">
            {leftIcon}
          </span>
        ) : null}
        <span className={cn("min-w-0", truncate ? "truncate" : "break-words")}>{children}</span>
        {rightIcon ? (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-current">
            {rightIcon}
          </span>
        ) : null}
      </span>
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
