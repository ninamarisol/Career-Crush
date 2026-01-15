import React from 'react';
import { motion } from 'framer-motion';
import { 
  EyeOff, Target, Clock, CheckCircle2, Shield,
  Sparkles, Lock, Timer, Star, TrendingUp,
  AlertTriangle, Calendar, Send
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { UserGoals, Quest, WeeklyStats, PersonalBests } from '@/hooks/useGoals';

interface StealthSeekerGoalsProps {
  userGoals: UserGoals;
  quests: Quest[];
  weeklyStats: WeeklyStats;
  personalBests: PersonalBests;
  levelProgress: { currentXP: number; xpForNextLevel: number; progressPercent: number } | null;
  getLevelTitle: (level: number) => string;
  updateQuestProgress: (questId: string, progress: number) => Promise<void>;
}

export function StealthSeekerGoals({
  userGoals,
  quests,
  weeklyStats,
  personalBests,
  levelProgress,
  getLevelTitle,
  updateQuestProgress,
}: StealthSeekerGoalsProps) {
  const activeQuests = quests.filter(q => !q.is_completed);
  const completedQuests = quests.filter(q => q.is_completed);

  // Stealth-specific metrics
  const stealthStats = {
    discreteApplications: weeklyStats.applicationsThisWeek,
    targetedCompanies: 3,
    qualityScore: 85,
    privacyLevel: 'Maximum',
  };

  const weeklyProgress = userGoals.weekly_application_target > 0
    ? (weeklyStats.applicationsThisWeek / userGoals.weekly_application_target) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Stealth Mode Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardRetro className="bg-gradient-to-r from-slate-500/10 to-zinc-500/10 border-slate-500/30">
          <CardRetroContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center text-white shadow-retro">
                  <EyeOff className="w-10 h-10" />
                </div>
                <Lock className="absolute -top-1 -right-1 w-6 h-6 text-slate-500" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xl">Stealth Mode Active</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500">
                    Private
                  </Badge>
                </div>
                <p className="text-muted-foreground">Discreet job search while employed</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline" className="bg-slate-500/10">
                    Level {userGoals.current_level} - {getLevelTitle(userGoals.current_level)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {levelProgress?.currentXP.toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Quality Over Quantity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-500" />
              Quality Targeted Search
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Send className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                <span className="text-3xl font-black">{stealthStats.discreteApplications}</span>
                <p className="text-sm text-muted-foreground">Discrete Applications</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <span className="text-3xl font-black">{stealthStats.qualityScore}%</span>
                <p className="text-sm text-muted-foreground">Quality Score</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <span className="text-3xl font-black">{stealthStats.targetedCompanies}</span>
                <p className="text-sm text-muted-foreground">Target Companies</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Weekly Target Progress</span>
              <span className="font-bold">{weeklyStats.applicationsThisWeek}/{userGoals.weekly_application_target}</span>
            </div>
            <Progress value={Math.min(weeklyProgress, 100)} className="h-3" />
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Privacy & Time Constraints */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardRetro className="border-amber-500/30 bg-amber-500/5">
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Stealth Reminders
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Shield className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Privacy Status: {stealthStats.privacyLevel}</p>
                  <p className="text-xs text-muted-foreground">All searches and applications are private</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Timer className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Best Search Times</p>
                  <p className="text-xs text-muted-foreground">Early mornings, lunch breaks, and evenings work best</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Interview Scheduling</p>
                  <p className="text-xs text-muted-foreground">Use PTO or lunch hours for interviews</p>
                </div>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stealth Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>🎯 Focus Tasks</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {activeQuests.length > 0 ? (
                <div className="space-y-2">
                  {activeQuests.slice(0, 4).map(quest => (
                    <div
                      key={quest.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <Clock className="w-5 h-5 text-slate-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{quest.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={(quest.current_progress / quest.target) * 100} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground shrink-0">
                            {quest.current_progress}/{quest.target}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        +{quest.xp_reward} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-green-600">All tasks complete! 🎉</p>
                  <p className="text-sm text-muted-foreground">Enjoy your evening</p>
                </div>
              )}

              {completedQuests.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    ✓ {completedQuests.length} task{completedQuests.length !== 1 ? 's' : ''} completed this week
                  </p>
                </div>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Progress Tracking */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>📈 Your Progress</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-slate-500/10 to-zinc-500/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Consistency Streak</span>
                  <span className="font-black text-xl text-slate-600">{userGoals.current_streak} days</span>
                </div>
                <p className="text-sm text-muted-foreground">Steady progress wins the race</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Stats
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-slate-600">{personalBests.totalApplications}</p>
                    <p className="text-xs text-muted-foreground">Total Applied</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-slate-600">{personalBests.totalInterviews}</p>
                    <p className="text-xs text-muted-foreground">Interviews</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-slate-600">{weeklyStats.followUpsThisWeek}</p>
                    <p className="text-xs text-muted-foreground">Follow-ups</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-slate-600">{userGoals.total_xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>
    </div>
  );
}
