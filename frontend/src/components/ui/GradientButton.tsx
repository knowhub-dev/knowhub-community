import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  glow?: boolean;
}

const baseStyles =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-md)] px-6 py-3 text-base font-semibold tracking-tight text-white shadow-[0_20px_55px_hsla(var(--primary)/0.28)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))] disabled:pointer-events-none disabled:opacity-60";

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, asChild = false, glow = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          baseStyles,
          "bg-[linear-gradient(120deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--secondary)))]",
          glow && "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-[radial-gradient(circle_at_30%_20%,hsla(var(--primary)/0.35),transparent_45%),radial-gradient(circle_at_80%_0%,hsla(var(--secondary)/0.25),transparent_40%)] after:blur-2xl",
          className,
        )}
        {...props}
      >
        <span className="relative inline-flex items-center gap-2">
          {children}
        </span>
      </Comp>
    );
  },
);

GradientButton.displayName = "GradientButton";
