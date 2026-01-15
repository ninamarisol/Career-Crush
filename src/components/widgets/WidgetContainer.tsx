import { ReactNode } from 'react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetSize } from './types';

interface WidgetContainerProps {
  title: string;
  icon?: LucideIcon;
  size?: WidgetSize;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  noPadding?: boolean;
  gradient?: string;
  bordered?: boolean;
}

export function WidgetContainer({
  title,
  icon: Icon,
  size = 'medium',
  children,
  className,
  headerAction,
  noPadding = false,
  gradient,
  bordered = false,
}: WidgetContainerProps) {
  return (
    <CardRetro 
      className={cn(
        gradient,
        bordered && 'border-dashed',
        className
      )}
    >
      <CardRetroHeader className="flex-row items-center justify-between">
        <CardRetroTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          {title}
        </CardRetroTitle>
        {headerAction}
      </CardRetroHeader>
      <CardRetroContent className={cn(noPadding && 'p-0')}>
        {children}
      </CardRetroContent>
    </CardRetro>
  );
}

// Simple stat card used across many widgets
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  colorClass?: string;
}

export function StatCard({ icon: Icon, label, value, suffix = '', colorClass = 'bg-primary/20' }: StatCardProps) {
  return (
    <CardRetro className={cn('p-4', colorClass)}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-current/20 border-2 border-border">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
          <p className="text-2xl font-black">
            {value}{suffix}
          </p>
        </div>
      </div>
    </CardRetro>
  );
}

// Progress bar component
interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  colorClass?: string;
}

export function ProgressBar({ 
  label, 
  current, 
  target, 
  unit = '', 
  colorClass = 'bg-primary' 
}: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {current}/{target} {unit}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full border border-border overflow-hidden">
        <div 
          className={cn('h-full transition-all duration-500', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Circular progress indicator
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 128,
  strokeWidth = 8,
  label,
  sublabel,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-muted"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-primary"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black">{Math.round(percentage)}%</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
        {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}

// Checklist item
interface ChecklistItemProps {
  checked: boolean;
  children: ReactNode;
  variant?: 'success' | 'warning' | 'default';
  action?: ReactNode;
}

export function ChecklistItem({ 
  checked, 
  children, 
  variant = 'default',
  action 
}: ChecklistItemProps) {
  const variantStyles = {
    success: 'bg-success/10 border-success/30',
    warning: 'bg-warning/10 border-warning/30',
    default: 'bg-muted border-border',
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border-2',
      variantStyles[variant]
    )}>
      {checked ? (
        <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
      )}
      <span className="flex-1">{children}</span>
      {action}
    </div>
  );
}
