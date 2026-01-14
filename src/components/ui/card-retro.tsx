import * as React from "react";
import { cn } from "@/lib/utils";

const CardRetro = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }
>(({ className, hoverable = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border-2 border-border bg-card text-card-foreground shadow-retro-lg transition-all duration-150",
      hoverable && "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-retro-xl cursor-pointer",
      className
    )}
    {...props}
  />
));
CardRetro.displayName = "CardRetro";

const CardRetroHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardRetroHeader.displayName = "CardRetroHeader";

const CardRetroTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-bold leading-none tracking-tight", className)}
    {...props}
  />
));
CardRetroTitle.displayName = "CardRetroTitle";

const CardRetroDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardRetroDescription.displayName = "CardRetroDescription";

const CardRetroContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardRetroContent.displayName = "CardRetroContent";

const CardRetroFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardRetroFooter.displayName = "CardRetroFooter";

export {
  CardRetro,
  CardRetroHeader,
  CardRetroFooter,
  CardRetroTitle,
  CardRetroDescription,
  CardRetroContent,
};
