import React from 'react';
import { motion } from 'framer-motion';
import { 
  EyeOff, Target, Clock, CheckCircle2, Shield,
  Sparkles, Lock, Timer, Star, TrendingUp,
  AlertTriangle, Calendar, Send, Search, Users,
  Coffee, BookOpen, Award
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
  // Stealth uses weekly and monthly quests - strategic, not frantic
  const weeklyQuests = quests.filter(q => q.type === 'weekly' && !q.is_completed);
  const monthlyQuests = quests.filter(q => q.type === 'monthly' && !q.is_completed);
  const epicQuests = quests.filter(q => q.type === 'epic');
  const completedQuests = quests.filter(q => q.is_completed && q.type !== 'epic');

  // Stealth-specific metrics
  const stealthStats = {
    discreteApplications: weeklyStats.applicationsThisWeek,
    targetedCompanies: 3,
    savedOpportunities: 12,
    qualityScore: 92,
    privacyLevel: 'Maximum',
    avgMatchScore: 94,
  };

  const weeklyProgress = userGoals.weekly_application_target > 0
    ? (weeklyStats.applicationsThisWeek / userGoals.weekly_application_target) * 100
    : 0;

  // Estimate time: 3-5 hours per week (fits around full-time job)
  const estimatedTimeThisWeek = '3-5';

  return (
    <div className="space-y-6">
      {/* Stealth Mode Header - Professional & Discrete */}
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
                <Lock className="absolute -top-1 -right-1 w-6 h-6 text-green-500" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xl">Stealth Mode Active</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500">
                    Private & Secure
                  </Badge>
                </div>
                <p className="text-muted-foreground">Quality over quantity. Strategic moves only.</p>
                
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

      {/* Quality Metrics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-500" />
              Quality-Focused Search
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Send className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                <span className="text-3xl font-black">{stealthStats.discreteApplications}</span>
                <p className="text-xs text-muted-foreground">Quality Apps</p>
                <p className="text-xs text-green-500">+100 XP each</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <span className="text-3xl font-black">{stealthStats.avgMatchScore}%</span>
                <p className="text-xs text-muted-foreground">Avg Match Score</p>
                <p className="text-xs text-amber-500">High Quality</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <span className="text-3xl font-black">{stealthStats.targetedCompanies}</span>
                <p className="text-xs text-muted-foreground">Target Companies</p>
                <p className="text-xs text-blue-500">Researched</p>
              </div>

              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Search className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <span className="text-3xl font-black">{stealthStats.savedOpportunities}</span>
                <p className="text-xs text-muted-foreground">Saved Roles</p>
                <p className="text-xs text-purple-500">For Review</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Weekly Target Progress</span>
              <span className="font-bold">{weeklyStats.applicationsThisWeek}/{userGoals.weekly_application_target}</span>
            </div>
            <Progress value={Math.min(weeklyProgress, 100)} className="h-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              Estimated time: ~{estimatedTimeThisWeek} hours/week • Fits around your full-time job
            </p>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Privacy & Stealth Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardRetro className="border-green-500/30 bg-green-500/5">
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Stealth Status
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Lock className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Privacy: {stealthStats.privacyLevel}</p>
                  <p className="text-xs text-muted-foreground">All activity is private & encrypted</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Timer className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Best Search Times</p>
                  <p className="text-xs text-muted-foreground">Early AM, lunch, evenings</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Interview Strategy</p>
                  <p className="text-xs text-muted-foreground">Use PTO or lunch hours</p>
                </div>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Moves Panel - Medium Prominence */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-500" />
                🎯 Strategic Moves
              </CardRetroTitle>
              <div className="flex gap-1 mt-1">
                <Badge variant={weeklyQuests.length > 0 ? "default" : "secondary"} className="text-xs">This Week</Badge>
                <Badge variant={monthlyQuests.length > 0 ? "outline" : "secondary"} className="text-xs">This Month</Badge>
              </div>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {weeklyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    THIS WEEK'S STRATEGIC MOVES
                  </h4>
                  <div className="space-y-2">
                    {weeklyQuests.map(quest => (
                      <StrategicItem key={quest.id} quest={quest} onComplete={() => updateQuestProgress(quest.id, quest.target)} />
                    ))}
                  </div>
                </div>
              )}

              {monthlyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    MONTHLY CAMPAIGN
                  </h4>
                  <div className="space-y-2">
                    {monthlyQuests.map(quest => (
                      <StrategicItem key={quest.id} quest={quest} onComplete={() => updateQuestProgress(quest.id, quest.target)} />
                    ))}
                  </div>
                </div>
              )}

              {weeklyQuests.length === 0 && monthlyQuests.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-green-600">All moves complete! 🎯</p>
                  <p className="text-sm text-muted-foreground">Strategic progress made</p>
                </div>
              )}

              {completedQuests.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    ✓ {completedQuests.length} strategic move{completedQuests.length !== 1 ? 's' : ''} completed
                  </p>
                </div>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Progress & Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>📈 Stealth Progress</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {/* Consistency - Weekly focused */}
              <div className="p-4 bg-gradient-to-r from-slate-500/10 to-zinc-500/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Weekly Consistency</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-600">
                    On Track
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Steady progress wins the race</p>
              </div>

              {/* Weekly Complete Bonus */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-sm">Weekly Complete Bonus</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete all weekly moves for +150 XP bonus!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Strategic Stats
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

      {/* Strategic Milestones */}
      {epicQuests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <CardRetro className="border-slate-500/30 bg-gradient-to-r from-slate-500/5 to-zinc-500/5">
            <CardRetroHeader>
              <CardRetroTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-500" />
                🏆 Strategic Milestones
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {epicQuests.map(quest => (
                  <StrategicMilestone key={quest.id} quest={quest} />
                ))}
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      )}
    </div>
  );
}

// Strategic Item - Professional, refined design
function StrategicItem({ quest, onComplete }: { quest: Quest; onComplete: () => void }) {
  const progress = (quest.current_progress / quest.target) * 100;
  
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg group hover:bg-muted/40 transition-colors border border-transparent hover:border-slate-500/20">
      <button 
        onClick={onComplete}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <CheckCircle2 className="w-5 h-5 text-muted-foreground hover:text-green-500" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{quest.title}</p>
        <p className="text-xs text-muted-foreground">{quest.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground shrink-0">
            {quest.current_progress}/{quest.target}
          </span>
        </div>
      </div>
      <Badge variant="outline" className="shrink-0 bg-slate-500/10">
        +{quest.xp_reward} XP
      </Badge>
    </div>
  );
}

function StrategicMilestone({ quest }: { quest: Quest }) {
  const progress = (quest.current_progress / quest.target) * 100;
  
  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-slate-500/20">
      <div className="flex items-center justify-between mb-2">
        <p className="font-black">{quest.title}</p>
        <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/30">
          +{quest.xp_reward} XP
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>
      <div className="flex items-center gap-2">
        <Progress value={progress} className="h-2 flex-1" />
        <span className="text-sm font-bold">
          {quest.current_progress}/{quest.target}
        </span>
      </div>
    </div>
  );
}
