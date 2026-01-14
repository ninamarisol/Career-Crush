import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border-2 border-border px-3 py-1 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      status: {
        saved: "bg-status-saved text-foreground",
        applied: "bg-status-applied text-card",
        interview: "bg-status-interview text-foreground",
        offer: "bg-status-offer text-card",
        rejected: "bg-status-rejected text-card",
        ghosted: "bg-status-ghosted text-card",
      },
    },
    defaultVariants: {
      status: "saved",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ status, className }))}
        {...props}
      />
    );
  }
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };
