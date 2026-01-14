import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonRetroVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-border rounded-lg",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-retro hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-retro-lg active:translate-x-0 active:translate-y-0 active:shadow-retro-sm",
        outline:
          "bg-card text-foreground border-primary shadow-retro hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-retro-lg active:translate-x-0 active:translate-y-0 active:shadow-retro-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-retro hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-retro-lg",
        ghost: "border-transparent shadow-none hover:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground shadow-retro hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-retro-lg",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-3",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonRetroProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonRetroVariants> {
  asChild?: boolean;
}

const ButtonRetro = React.forwardRef<HTMLButtonElement, ButtonRetroProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonRetroVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ButtonRetro.displayName = "ButtonRetro";

export { ButtonRetro, buttonRetroVariants };
