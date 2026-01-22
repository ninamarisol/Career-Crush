import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Users, MessageSquare, Clock, 
  Plus, Check, Target, ArrowRight
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CrushModeGoals as CrushGoalsType, WeeklyProgress } from '@/hooks/useGoalCrusher';

interface CrushModeGoalsProps {
  goals: CrushGoalsType;
  progress: WeeklyProgress;
  onLogProgress: (type: keyof WeeklyProgress, amount?: number) => void;
  onEditGoals: () => void;
  getGoalProgress: (current: number, target: number) => number;
}

const GOAL_CONFIG = {
  applications: {
    icon: FileText,
    label: 'Applications',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Quality job applications submitted',
  },
  newContacts: {
    icon: Users,
    label: 'New Contacts',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'LinkedIn connects, referrals, networking',
  },
  followUps: {
    icon: MessageSquare,
    label: 'Follow-Ups',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Reach out to existing contacts',
  },
  interviewPrepHours: {
    icon: Clock,
    label: 'Interview Prep',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Hours practicing questions & research',
  },
} as const;

export function CrushModeGoals({ 
  goals, 
  progress, 
  onLogProgress, 
  onEditGoals,
  getGoalProgress 
}: CrushModeGoalsProps) {
  const goalEntries = [
    { key: 'applications' as const, current: progress.applications, target: goals.applications },
    { key: 'newContacts' as const, current: progress.newContacts, target: goals.newContacts },
    { key: 'followUps' as const, current: progress.followUps, target: goals.followUps },
    { key: 'interviewPrepHours' as const, current: progress.interviewPrepHours, target: goals.interviewPrepHours },
  ];

  const completedCount = goalEntries.filter(g => g.current >= g.target).length;
  const totalProgress = Math.round(
    goalEntries.reduce((acc, g) => acc + getGoalProgress(g.current, g.target), 0) / goalEntries.length
  );

  return (
    <div className="space-y-6">
      {/* Progress Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CardRetro className="bg-gradient-to-br from-primary/5 via-primary/10 to-orange-500/5 border-primary/20">
          <CardRetroContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <span className="text-2xl font-black text-primary">{totalProgress}%</span>
                  </div>
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                    style={{ 
                      transform: `rotate(${(totalProgress / 100) * 360}deg)`,
                      transition: 'transform 0.5s ease-out'
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-black">This Week's Progress</h2>
                  <p className="text-muted-foreground">
                    {completedCount === goalEntries.length 
                      ? "🏆 All goals crushed!" 
                      : `${completedCount}/${goalEntries.length} goals completed`
                    }
                  </p>
                </div>
              </div>
              
              <ButtonRetro variant="outline" size="sm" onClick={onEditGoals}>
                Edit Weekly Targets
              </ButtonRetro>
            </div>
            
            <Progress value={totalProgress} className="h-2 mt-4" />
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Goals Grid - Clean & Organized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalEntries.map((goal, index) => {
          const config = GOAL_CONFIG[goal.key];
          const Icon = config.icon;
          const progressPercent = getGoalProgress(goal.current, goal.target);
          const isComplete = goal.current >= goal.target;
          const isHours = goal.key === 'interviewPrepHours';

          return (
            <motion.div
              key={goal.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CardRetro className={cn(
                "h-full transition-all hover:shadow-md",
                isComplete && "ring-2 ring-green-500/30 bg-green-500/5"
              )}>
                <CardRetroContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl", config.bgColor)}>
                        <Icon className={cn("w-5 h-5", config.color)} />
                      </div>
                      <div>
                        <h3 className="font-bold">{config.label}</h3>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    {isComplete && (
                      <Badge className="bg-green-500 text-white shrink-0">
                        <Check className="w-3 h-3 mr-1" /> Done
                      </Badge>
                    )}
                  </div>

                  {/* Progress Display */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-black">{goal.current}</span>
                      <span className="text-muted-foreground text-lg">/ {goal.target}</span>
                      {isHours && <span className="text-muted-foreground text-sm ml-1">hrs</span>}
                    </div>
                    <Progress 
                      value={progressPercent} 
                      className={cn("h-2", isComplete && "[&>div]:bg-green-500")} 
                    />
                  </div>

                  {/* Action Button */}
                  {!isComplete ? (
                    <ButtonRetro 
                      size="sm" 
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => onLogProgress(goal.key)}
                    >
                      <Plus className="w-4 h-4" />
                      Log {isHours ? 'Hour' : config.label.replace(/s$/, '')}
                    </ButtonRetro>
                  ) : (
                    <p className="text-center text-sm text-green-600 font-medium">
                      🎉 Goal achieved this week!
                    </p>
                  )}
                </CardRetroContent>
              </CardRetro>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CardRetro>
          <CardRetroHeader className="pb-2">
            <CardRetroTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4" />
              Quick Log
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent className="pt-2">
            <div className="flex flex-wrap gap-2">
              {goalEntries.map((goal) => {
                const config = GOAL_CONFIG[goal.key];
                const Icon = config.icon;
                const isComplete = goal.current >= goal.target;
                const isHours = goal.key === 'interviewPrepHours';
                
                return (
                  <ButtonRetro 
                    key={goal.key}
                    size="sm" 
                    variant={isComplete ? "ghost" : "outline"}
                    disabled={isComplete}
                    onClick={() => onLogProgress(goal.key)}
                    className={cn("gap-2", isComplete && "opacity-50")}
                  >
                    <Icon className={cn("w-4 h-4", config.color)} />
                    +1 {isHours ? 'Hour' : config.label.replace(/s$/, '')}
                    {isComplete && <Check className="w-3 h-3 text-green-500" />}
                  </ButtonRetro>
                );
              })}
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 flex items-start gap-3"
      >
        <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong>Auto-tracking:</strong> Applications and contacts are synced from your Applications and Network tabs. 
          Use manual logging for activities outside the app.
        </div>
      </motion.div>
    </div>
  );
}
