import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Eye, Users, BookOpen, FileText, Clock } from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';
import type { CareerTarget } from '@/hooks/useCareerTarget';

const BLOCKER_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  visibility: { label: 'Visibility', icon: <Eye className="w-3 h-3" />, color: 'hsl(var(--pillar-visibility))' },
  relationships: { label: 'Relationships', icon: <Users className="w-3 h-3" />, color: 'hsl(var(--pillar-network))' },
  skills: { label: 'Skills', icon: <BookOpen className="w-3 h-3" />, color: 'hsl(var(--pillar-skills))' },
  evidence: { label: 'Evidence', icon: <FileText className="w-3 h-3" />, color: 'hsl(var(--primary))' },
  other: { label: 'Custom', icon: <Clock className="w-3 h-3" />, color: 'hsl(var(--muted-foreground))' },
};

function getTimelineRemaining(timeline: string, createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const daysSince = differenceInDays(now, created);

  const timelineMonths: Record<string, number> = {
    'Within 6 months': 6,
    '6–12 months': 12,
    '1–2 years': 24,
    "I'm playing the long game (2+ years)": 36,
  };

  const totalMonths = timelineMonths[timeline] || 12;
  const monthsElapsed = Math.floor(daysSince / 30);
  const remaining = Math.max(0, totalMonths - monthsElapsed);
  return `${remaining} months to target`;
}

function getReviewDaysRemaining(reviewCycle: string | null): number | null {
  if (!reviewCycle) return null;
  const map: Record<string, number> = {
    'Within 3 months': 90,
    '3–6 months': 180,
    '6–12 months': 365,
  };
  return map[reviewCycle] || null;
}

interface CareerTargetCardProps {
  target: CareerTarget;
  onUpdateTarget: () => void;
}

export function CareerTargetCard({ target, onUpdateTarget }: CareerTargetCardProps) {
  const blocker = BLOCKER_MAP[target.biggest_blocker] || BLOCKER_MAP.other;
  const timeRemaining = getTimelineRemaining(target.timeline, target.created_at);
  const reviewDays = getReviewDaysRemaining(target.review_cycle);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <CardRetro className="border-primary/30 overflow-hidden">
        <CardRetroContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Role → Target */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0">
                <span className="text-sm font-bold text-muted-foreground">{target.role_title}</span>
              </div>
              <div className="shrink-0 flex items-center text-primary">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="shrink-0">
                <span className="text-sm font-black text-foreground">{target.target_destination}</span>
              </div>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {timeRemaining}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs gap-1"
                style={{ borderColor: blocker.color, color: blocker.color }}
              >
                {blocker.icon}
                Focus: {blocker.label}
              </Badge>
              {reviewDays && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Calendar className="w-3 h-3" />
                  Review in ~{reviewDays} days
                </Badge>
              )}
            </div>
          </div>

          {/* Update link */}
          <div className="mt-3 text-right">
            <button
              onClick={onUpdateTarget}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Update target
            </button>
          </div>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}
