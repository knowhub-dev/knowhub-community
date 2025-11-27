import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-transparent px-4 py-2 font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-soft hover:shadow-glow hover:-translate-y-[1px]",
        secondary:
          "bg-surface-1 text-foreground border-border/70 backdrop-blur-sm hover:border-primary/60 hover:-translate-y-[1px] hover:shadow-soft",
        subtle:
          "bg-surface-1/80 text-foreground border-border/50 hover:border-border hover:bg-surface-2/80",
        ghost:
          "bg-transparent text-foreground hover:bg-surface-1/70 hover:text-foreground",
        outline:
          "border border-primary text-primary hover:bg-primary/10 hover:shadow-glow",
        destructive:
          "bg-danger text-danger-foreground shadow-soft hover:bg-danger/90",
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
      { variant: "ghost", size: "icon", className: "h-10 w-10" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
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
