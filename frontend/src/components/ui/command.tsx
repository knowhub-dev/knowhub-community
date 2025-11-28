"use client";

import * as React from "react";

import { Search } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  contentClassName?: string;
}

const CommandDialog = ({ children, contentClassName, ...props }: CommandDialogProps) => (
  <Dialog {...props}>
    <DialogContent
      className={cn(
        "overflow-hidden border-0 bg-background p-0 shadow-xl sm:border",
        "fixed inset-0 translate-x-0 translate-y-0 rounded-none sm:left-1/2 sm:top-1/2 sm:inset-auto sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl",
        "h-[100dvh] max-h-[100dvh] w-full max-w-full sm:h-[80vh] sm:w-full sm:max-w-3xl",
        contentClassName,
      )}
      size="lg"
    >
      {children}
    </DialogContent>
  </Dialog>
);

const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid h-full w-full grid-rows-[auto,1fr] overflow-hidden bg-background text-foreground",
        "sm:rounded-2xl",
        className,
      )}
      {...props}
    />
  ),
);
Command.displayName = "Command";

const CommandInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3", 
        "max-h-[calc(100dvh-6rem)] sm:max-h-[60vh]", 
        className,
      )}
      {...props}
    />
  ),
);
CommandList.displayName = "CommandList";

const CommandEmpty = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-4 py-8 text-center text-sm text-muted-foreground",
      className,
    )}
    {...props}
  />
);
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = ({
  className,
  heading,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { heading?: string }) => (
  <div
    className={cn("overflow-hidden rounded-lg border border-border/60 bg-card/50", className)}
    {...props}
  >
    {heading ? (
      <div className="bg-muted/60 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        {heading}
      </div>
    ) : null}
    <div className="divide-y divide-border/60">{children}</div>
  </div>
);
CommandGroup.displayName = "CommandGroup";

const CommandItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition hover:bg-muted",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

const CommandSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={cn("my-2 border-border/60", className)} {...props} />
);
CommandSeparator.displayName = "CommandSeparator";

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
);
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
