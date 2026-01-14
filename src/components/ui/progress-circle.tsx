import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: "primary" | "info";
  children?: React.ReactNode;
}

const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
  ({ value, size = 120, strokeWidth = 8, className, variant = "primary", children }, ref) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    const gradientId = `progress-gradient-${variant}-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {variant === "primary" ? (
                <>
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(330 100% 60%)" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="hsl(var(--info))" />
                  <stop offset="100%" stopColor="hsl(214 100% 55%)" />
                </>
              )}
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children || (
            <span className="text-2xl font-black">{value}%</span>
          )}
        </div>
      </div>
    );
  }
);
ProgressCircle.displayName = "ProgressCircle";

export { ProgressCircle };
