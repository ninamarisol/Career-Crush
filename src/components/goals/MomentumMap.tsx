import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { cn } from '@/lib/utils';
import { format, getDaysInMonth, startOfMonth, subMonths, differenceInDays } from 'date-fns';

interface MomentumMapProps {
  wins: Array<{ win_date: string }>;
  contacts: Array<{ last_contacted: string | null }>;
  pillarActions: Array<{ date: string }>; // any logged actions
  aiInsight: string | null;
}

export function MomentumMap({ wins, contacts, pillarActions, aiInsight }: MomentumMapProps) {
  const [view, setView] = useState<'month' | '3months'>('month');

  const chartData = useMemo(() => {
    const now = new Date();
    const startDate = view === 'month' ? startOfMonth(now) : startOfMonth(subMonths(now, 2));
    const totalDays = differenceInDays(now, startDate) + 1;

    // Build daily scores
    const scores: { day: number; score: number; hasActivity: boolean }[] = [];
    let cumulativeScore = 50; // start at midpoint

    for (let d = 0; d < totalDays; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      const dateStr = format(date, 'yyyy-MM-dd');

      // Count activities on this day
      const dayWins = wins.filter(w => w.win_date === dateStr).length;
      const dayContacts = contacts.filter(c => c.last_contacted === dateStr).length;
      const dayActions = pillarActions.filter(a => a.date === dateStr).length;

      const activityCount = dayWins + dayContacts + dayActions;
      const hasActivity = activityCount > 0;

      // Score calculation
      if (hasActivity) {
        cumulativeScore = Math.min(100, cumulativeScore + (activityCount * 8));
      } else {
        cumulativeScore = Math.max(0, cumulativeScore - 2);
      }

      scores.push({ day: d, score: cumulativeScore, hasActivity });
    }

    return scores;
  }, [wins, contacts, pillarActions, view]);

  // Build SVG path
  const width = 100;
  const height = 40;
  const path = useMemo(() => {
    if (chartData.length === 0) return '';
    const xStep = width / Math.max(chartData.length - 1, 1);

    const points = chartData.map((d, i) => ({
      x: i * xStep,
      y: height - (d.score / 100) * height,
    }));

    // Smooth curve using catmull-rom to bezier
    let pathStr = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathStr += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return pathStr;
  }, [chartData]);

  const fillPath = path ? `${path} L ${width} ${height} L 0 ${height} Z` : '';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <CardRetro>
        <CardRetroContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Momentum Map
            </span>
            <div className="flex rounded-lg border-2 border-border overflow-hidden">
              <button
                onClick={() => setView('month')}
                className={cn(
                  'px-3 py-1 text-xs font-bold transition-colors',
                  view === 'month' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                This Month
              </button>
              <button
                onClick={() => setView('3months')}
                className={cn(
                  'px-3 py-1 text-xs font-bold transition-colors border-l-2 border-border',
                  view === '3months' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                Last 3 Months
              </button>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full aspect-[5/1] relative">
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="momentumFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="0.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {fillPath && <path d={fillPath} fill="url(#momentumFill)" />}
              {path && (
                <path
                  d={path}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
              )}
              {/* Activity dots */}
              {chartData.filter(d => d.hasActivity).map((d, i) => {
                const xStep = width / Math.max(chartData.length - 1, 1);
                return (
                  <circle
                    key={i}
                    cx={d.day * xStep}
                    cy={height - (d.score / 100) * height}
                    r="0.8"
                    fill="hsl(var(--primary))"
                  />
                );
              })}
            </svg>
          </div>

          {/* AI Insight */}
          {aiInsight && (
            <p className="text-sm text-muted-foreground mt-3 italic border-l-2 border-primary/30 pl-3">
              {aiInsight}
              <span className="text-[10px] ml-2 text-muted-foreground/70">AI suggested</span>
            </p>
          )}
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}
