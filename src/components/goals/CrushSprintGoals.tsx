import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Users, MessageSquare, Clock,
  Plus,
} from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { ButtonRetro } from '@/components/ui/button-retro';
import { cn } from '@/lib/utils';
import type { CrushModeGoals as CrushGoalsType, WeeklyProgress } from '@/hooks/useGoalCrusher';

interface CrushSprintGoalsProps {
  goals: CrushGoalsType;
  progress: WeeklyProgress;
  onLogProgress: (type: keyof WeeklyProgress, amount?: number) => void;
  getGoalProgress: (current: number, target: number) => number;
  momentumLines?: {
    applications: string;
    newContacts: string;
    followUps: string;
    interviewPrepHours: string;
  } | null;
}

const GOAL_CONFIG = {
  applications: {
    icon: FileText,
    label: 'Applications',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  newContacts: {
    icon: Users,
    label: 'New Contacts',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  followUps: {
    icon: MessageSquare,
    label: 'Follow-Ups',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  interviewPrepHours: {
    icon: Clock,
    label: 'Interview Prep',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
} as const;

const DEFAULT_MOMENTUM: Record<string, string> = {
  applications: 'Submit quality applications this week.',
  newContacts: 'Grow your network with new connections.',
  followUps: 'Follow up on existing conversations.',
  interviewPrepHours: 'Practice questions and research companies.',
};

export function CrushSprintGoals({
  goals,
  progress,
  onLogProgress,
  getGoalProgress,
  momentumLines,
}: CrushSprintGoalsProps) {
  const goalEntries = [
    { key: 'applications' as const, current: progress.applications, target: goals.applications },
    { key: 'newContacts' as const, current: progress.newContacts, target: goals.newContacts },
    { key: 'followUps' as const, current: progress.followUps, target: goals.followUps },
    { key: 'interviewPrepHours' as const, current: progress.interviewPrepHours, target: goals.interviewPrepHours },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goalEntries.map((goal, index) => {
        const config = GOAL_CONFIG[goal.key];
        const Icon = config.icon;
        const progressPercent = getGoalProgress(goal.current, goal.target);
        const isComplete = goal.current >= goal.target;
        const isHours = goal.key === 'interviewPrepHours';
        const momentumLine = momentumLines?.[goal.key] || DEFAULT_MOMENTUM[goal.key];

        return (
          <motion.div
            key={goal.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.08 }}
          >
            <CardRetro className={cn(
              "h-full transition-all duration-150 relative overflow-hidden",
              "hover:-translate-y-0.5 hover:shadow-retro-lg",
              isComplete ? "border-primary" : "border-border",
              /* Perforated left edge */
            )}>
              {/* Perforated edge */}
              <div
                className="absolute left-0 top-2 bottom-2 w-[6px]"
                style={{
                  background: `repeating-radial-gradient(circle, hsl(var(--primary) / 0.15) 0px, hsl(var(--primary) / 0.15) 2px, transparent 2px, transparent 6px)`,
                  backgroundSize: '6px 8px',
                }}
              />

              {/* DONE stamp overlay */}
              {isComplete && (
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <span
                    className="text-xs font-black uppercase tracking-widest text-primary border-2 border-primary rounded px-2 py-0.5"
                    style={{ transform: 'rotate(-12deg)', display: 'inline-block', opacity: 0.85 }}
                  >
                    DONE
                  </span>
                </div>
              )}

              <CardRetroContent className="p-5 pl-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("p-2 rounded-xl", config.bgColor)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <h3 className="font-bold text-sm">{config.label}</h3>
                </div>

                {/* Progress fraction */}
                <div className="mb-1">
                  <span className="text-3xl font-black text-primary">{goal.current}</span>
                  <span className="text-lg text-muted-foreground">/{goal.target}</span>
                  {isHours && <span className="text-sm text-muted-foreground ml-1">hrs</span>}
                </div>

                {/* Momentum context line */}
                <p className="text-xs italic text-muted-foreground mb-3 min-h-[2em] leading-relaxed">
                  {momentumLine}
                </p>

                {/* Progress bar */}
                <Progress
                  value={progressPercent}
                  className={cn(
                    "h-4 rounded-full mb-3",
                    isComplete && "[&>div]:bg-primary"
                  )}
                />

                {/* Action button */}
                {!isComplete && (
                  <ButtonRetro
                    size="sm"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => onLogProgress(goal.key)}
                  >
                    <Plus className="w-4 h-4" />
                    Log {isHours ? 'Hour' : config.label.replace(/s$/, '')}
                  </ButtonRetro>
                )}
              </CardRetroContent>
            </CardRetro>
          </motion.div>
        );
      })}
    </div>
  );
}
