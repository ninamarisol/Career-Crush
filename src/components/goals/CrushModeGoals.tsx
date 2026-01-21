import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Users, MessageSquare, Clock, 
  Plus, Check, TrendingUp, Zap 
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

interface GoalCardProps {
  icon: React.ElementType;
  label: string;
  current: number;
  target: number;
  progressPercent: number;
  onLog: () => void;
  color: string;
}

function GoalCard({ icon: Icon, label, current, target, progressPercent, onLog, color }: GoalCardProps) {
  const isComplete = current >= target;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <CardRetro className={cn(
        "transition-all",
        isComplete && "border-green-500/50 bg-green-500/5"
      )}>
        <CardRetroContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={cn("p-2 rounded-lg", color)}>
              <Icon className="w-5 h-5" />
            </div>
            {isComplete ? (
              <Badge className="bg-green-500 text-white">
                <Check className="w-3 h-3 mr-1" /> Done!
              </Badge>
            ) : (
              <ButtonRetro size="sm" variant="outline" onClick={onLog}>
                <Plus className="w-4 h-4" />
              </ButtonRetro>
            )}
          </div>
          
          <h3 className="font-bold mb-1">{label}</h3>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-black">{current}</span>
            <span className="text-muted-foreground">/ {target}</span>
          </div>
          
          <Progress 
            value={progressPercent} 
            className={cn("h-2", isComplete && "[&>div]:bg-green-500")} 
          />
          
          <p className="text-xs text-muted-foreground mt-2">
            {isComplete 
              ? '🎉 Goal achieved this week!' 
              : `${target - current} more to go`
            }
          </p>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}

export function CrushModeGoals({ 
  goals, 
  progress, 
  onLogProgress, 
  onEditGoals,
  getGoalProgress 
}: CrushModeGoalsProps) {
  const goalCards = [
    {
      icon: FileText,
      label: 'Applications',
      current: progress.applications,
      target: goals.applications,
      color: 'bg-blue-500/10 text-blue-500',
      key: 'applications' as const,
    },
    {
      icon: Users,
      label: 'New Contacts',
      current: progress.newContacts,
      target: goals.newContacts,
      color: 'bg-emerald-500/10 text-emerald-500',
      key: 'newContacts' as const,
    },
    {
      icon: MessageSquare,
      label: 'Follow-Ups',
      current: progress.followUps,
      target: goals.followUps,
      color: 'bg-amber-500/10 text-amber-500',
      key: 'followUps' as const,
    },
    {
      icon: Clock,
      label: 'Interview Prep (hrs)',
      current: progress.interviewPrepHours,
      target: goals.interviewPrepHours,
      color: 'bg-purple-500/10 text-purple-500',
      key: 'interviewPrepHours' as const,
    },
  ];

  const totalProgress = Math.round(
    goalCards.reduce((acc, g) => acc + getGoalProgress(g.current, g.target), 0) / goalCards.length
  );

  const completedGoals = goalCards.filter(g => g.current >= g.target).length;

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CardRetro className="bg-gradient-to-r from-primary/10 to-orange-500/10 border-primary/30">
          <CardRetroContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-black">This Week's Progress</h2>
                </div>
                <p className="text-muted-foreground">
                  {completedGoals === goalCards.length 
                    ? "🏆 All goals crushed! You're on fire!" 
                    : `${completedGoals}/${goalCards.length} goals hit - keep pushing!`
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-black text-primary">{totalProgress}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
                <ButtonRetro variant="outline" size="sm" onClick={onEditGoals}>
                  Edit Goals
                </ButtonRetro>
              </div>
            </div>
            
            <Progress value={totalProgress} className="h-3 mt-4" />
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {goalCards.map((goal, index) => (
          <motion.div
            key={goal.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GoalCard
              icon={goal.icon}
              label={goal.label}
              current={goal.current}
              target={goal.target}
              progressPercent={getGoalProgress(goal.current, goal.target)}
              onLog={() => onLogProgress(goal.key)}
              color={goal.color}
            />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Quick Actions
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="flex flex-wrap gap-2">
              <ButtonRetro 
                size="sm" 
                onClick={() => onLogProgress('applications')}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Log Application
              </ButtonRetro>
              <ButtonRetro 
                size="sm" 
                variant="outline"
                onClick={() => onLogProgress('newContacts')}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Add Contact
              </ButtonRetro>
              <ButtonRetro 
                size="sm" 
                variant="outline"
                onClick={() => onLogProgress('followUps')}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Log Follow-Up
              </ButtonRetro>
              <ButtonRetro 
                size="sm" 
                variant="outline"
                onClick={() => onLogProgress('interviewPrepHours')}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                Log Prep Hour
              </ButtonRetro>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <CardRetro className="bg-muted/30">
          <CardRetroContent className="p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro tip:</strong> Applications and contacts are auto-tracked from the Applications and Network tabs. 
              Manual logging is available for activities outside the app.
            </p>
          </CardRetroContent>
        </CardRetro>
      </motion.div>
    </div>
  );
}
