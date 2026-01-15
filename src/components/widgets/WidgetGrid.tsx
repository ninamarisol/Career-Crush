import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { WidgetSize } from './types';

interface WidgetGridProps {
  children: ReactNode;
  className?: string;
}

// Main responsive grid container for widgets
export function WidgetGrid({ children, className }: WidgetGridProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}

// Row of stat cards (typically 4 across on desktop)
interface StatRowProps {
  children: ReactNode;
  className?: string;
}

export function StatRow({ children, className }: StatRowProps) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {children}
    </div>
  );
}

// Two-column layout for medium widgets
interface TwoColumnProps {
  children: ReactNode;
  className?: string;
}

export function TwoColumn({ children, className }: TwoColumnProps) {
  return (
    <div className={cn('grid lg:grid-cols-2 gap-6', className)}>
      {children}
    </div>
  );
}

// Three-column layout for smaller widgets
interface ThreeColumnProps {
  children: ReactNode;
  className?: string;
}

export function ThreeColumn({ children, className }: ThreeColumnProps) {
  return (
    <div className={cn('grid md:grid-cols-3 gap-4', className)}>
      {children}
    </div>
  );
}

// Full-width section wrapper
interface FullWidthProps {
  children: ReactNode;
  className?: string;
}

export function FullWidth({ children, className }: FullWidthProps) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}

// Widget wrapper that applies size-based styling
interface WidgetWrapperProps {
  size: WidgetSize;
  children: ReactNode;
  className?: string;
}

export function WidgetWrapper({ size, children, className }: WidgetWrapperProps) {
  const sizeClasses: Record<WidgetSize, string> = {
    small: 'col-span-1',
    medium: 'col-span-1 lg:col-span-1',
    large: 'col-span-1 lg:col-span-2',
    full: 'col-span-full',
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      {children}
    </div>
  );
}
