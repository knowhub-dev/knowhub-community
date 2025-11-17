import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-subtle hover:bg-primary-light hover:shadow-neon",
        secondary:
          "bg-surface/85 text-foreground border border-border/80 backdrop-blur-sm hover:border-primary-light hover:bg-surface/95 hover:shadow-subtle",
        ghost:
          "bg-transparent text-foreground hover:bg-surface/70 hover:text-foreground",
        outline:
          "border border-primary text-primary hover:bg-primary/10 hover:text-white hover:shadow-neon",
        destructive:
          "bg-red-600 text-white shadow-subtle hover:bg-red-700 hover:shadow-[0_0_22px_rgba(220,38,38,0.4)]",
        neon:
          "relative isolate overflow-hidden bg-transparent text-white shadow-neon hover:shadow-[0_0_30px_rgba(164,85,247,0.65)] before:absolute before:inset-0 before:-z-20 before:rounded-[var(--radius-md)] before:bg-gradient-to-r before:from-accent-purple before:to-accent-pink before:opacity-90 before:transition-opacity before:duration-200 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[var(--radius-md)] after:bg-surface/80 after:content-[''] hover:before:opacity-100",
        icon:
          "bg-surface/85 text-foreground border border-border/80 backdrop-blur-sm hover:border-primary hover:bg-surface/95 hover:text-foreground hover:shadow-neon",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0 [&>svg]:h-5 [&>svg]:w-5",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    compoundVariants: [
      {
        variant: "icon",
        size: "sm",
        className: "h-9 w-9",
      },
      {
        variant: "icon",
        size: "md",
        className: "h-10 w-10",
      },
      {
        variant: "icon",
        size: "lg",
        className: "h-12 w-12 text-lg",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, asChild = false, disabled, isLoading, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || isLoading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        disabled={isDisabled}
        data-variant={variant}
        aria-busy={isLoading || undefined}
        {...props}
      >
        <span className="inline-flex items-center justify-center gap-2">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {children}
        </span>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
