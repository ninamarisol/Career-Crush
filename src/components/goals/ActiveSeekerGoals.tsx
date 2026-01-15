import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Trophy, Flame, Zap, TrendingUp, TrendingDown, 
  Minus, CheckCircle2, Circle, Clock, Calendar, 
  Star, Sparkles, Rocket, Send
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserGoals, Quest, Achievement, WeeklyStats, PersonalBests } from '@/hooks/useGoals';

interface ActiveSeekerGoalsProps {
  userGoals: UserGoals;
  quests: Quest[];
  achievements: Achievement[];
  weeklyStats: WeeklyStats;
  personalBests: PersonalBests;
  levelProgress: { currentXP: number; xpForNextLevel: number; progressPercent: number } | null;
  getLevelTitle: (level: number) => string;
  updateQuestProgress: (questId: string, progress: number) => Promise<void>;
  achievementLabels: Record<string, { name: string; emoji: string }>;
  tierColors: Record<string, string>;
}

export function ActiveSeekerGoals({
  userGoals,
  quests,
  weeklyStats,
  personalBests,
  levelProgress,
  getLevelTitle,
  updateQuestProgress,
  achievements,
  achievementLabels,
  tierColors,
}: ActiveSeekerGoalsProps) {
  const dailyQuests = quests.filter(q => q.type === 'daily' && !q.is_completed);
  const weeklyQuests = quests.filter(q => q.type === 'weekly' && !q.is_completed);
  const completedQuests = quests.filter(q => q.is_completed);

  const weekChange = weeklyStats.applicationsLastWeek > 0
    ? ((weeklyStats.applicationsThisWeek - weeklyStats.applicationsLastWeek) / weeklyStats.applicationsLastWeek) * 100
    : weeklyStats.applicationsThisWeek > 0 ? 100 : 0;

  const activeAchievements = achievements.filter(a => !a.unlocked).slice(0, 4);
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const weeklyProgress = userGoals.weekly_application_target > 0
    ? (weeklyStats.applicationsThisWeek / userGoals.weekly_application_target) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Level & XP Card - Prominent for Active Seekers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardRetro className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardRetroContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-retro">
                  <span className="text-3xl font-black">{userGoals.current_level}</span>
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xl">Level {userGoals.current_level}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="font-bold text-primary">{getLevelTitle(userGoals.current_level)}</span>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      {levelProgress?.currentXP.toLocaleString()} XP
                    </span>
                    <span className="font-bold">
                      {levelProgress?.xpForNextLevel.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress value={levelProgress?.progressPercent || 0} className="h-3" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {Math.round((levelProgress?.xpForNextLevel || 0) - (levelProgress?.currentXP || 0))} XP to next level
                </p>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Weekly Application Target - Key Metric */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CardRetro className="border-primary/30">
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Weekly Application Goal
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-4xl font-black text-primary">{weeklyStats.applicationsThisWeek}</span>
                <span className="text-2xl text-muted-foreground">/{userGoals.weekly_application_target}</span>
              </div>
              <Badge variant={weeklyProgress >= 100 ? "default" : "secondary"} className="text-lg px-4 py-2">
                {Math.round(weeklyProgress)}%
              </Badge>
            </div>
            <Progress value={Math.min(weeklyProgress, 100)} className="h-4" />
            {weeklyProgress >= 100 && (
              <p className="mt-2 text-green-600 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Weekly goal achieved! Keep the momentum! 🎉
              </p>
            )}
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* This Week vs Last Week */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle>📊 This Week vs. Last Week</CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-3xl font-black">{weeklyStats.applicationsThisWeek}</span>
                  {weekChange > 0 && <TrendingUp className="w-5 h-5 text-green-500" />}
                  {weekChange < 0 && <TrendingDown className="w-5 h-5 text-red-500" />}
                  {weekChange === 0 && <Minus className="w-5 h-5 text-muted-foreground" />}
                </div>
                <p className="text-sm text-muted-foreground">Applications</p>
                {weekChange !== 0 && (
                  <Badge variant={weekChange > 0 ? "default" : "secondary"} className="mt-1">
                    {weekChange > 0 ? '+' : ''}{Math.round(weekChange)}%
                  </Badge>
                )}
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-black mb-1">{weeklyStats.interviewsThisWeek}</div>
                <p className="text-sm text-muted-foreground">Interviews</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-black mb-1">{weeklyStats.followUpsThisWeek}</div>
                <p className="text-sm text-muted-foreground">Follow-ups</p>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quests */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>⚡ Your Quests</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {dailyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Daily
                  </h4>
                  <div className="space-y-2">
                    {dailyQuests.map(quest => (
                      <QuestItem key={quest.id} quest={quest} onComplete={() => updateQuestProgress(quest.id, quest.target)} />
                    ))}
                  </div>
                </div>
              )}
              
              {weeklyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Weekly
                  </h4>
                  <div className="space-y-2">
                    {weeklyQuests.map(quest => (
                      <QuestItem key={quest.id} quest={quest} onComplete={() => updateQuestProgress(quest.id, quest.target)} />
                    ))}
                  </div>
                </div>
              )}

              {dailyQuests.length === 0 && weeklyQuests.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-green-600">All quests complete! 🎉</p>
                  <p className="text-sm text-muted-foreground">Check back tomorrow for new quests</p>
                </div>
              )}

              {completedQuests.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    ✓ {completedQuests.length} quest{completedQuests.length !== 1 ? 's' : ''} completed today
                  </p>
                </div>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Stats & Streaks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>🔥 Your Stats</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {/* Streak */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="font-black text-2xl">{userGoals.current_streak} days</p>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{userGoals.longest_streak} days</p>
                  <p className="text-xs text-muted-foreground">Personal Best</p>
                </div>
              </div>

              {/* Personal Bests */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Personal Records
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-black text-primary">{personalBests.totalApplications}</p>
                    <p className="text-xs text-muted-foreground">Total Applications</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-black text-primary">{personalBests.mostAppsInWeek}</p>
                    <p className="text-xs text-muted-foreground">Best Week</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-black text-primary">{personalBests.totalInterviews}</p>
                    <p className="text-xs text-muted-foreground">Total Interviews</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-black text-primary">{userGoals.total_xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <CardRetro>
          <CardRetroHeader className="flex items-center justify-between">
            <CardRetroTitle>🏆 Your Achievements</CardRetroTitle>
            {unlockedAchievements.length > 0 && (
              <Badge variant="secondary">
                {unlockedAchievements.length} unlocked
              </Badge>
            )}
          </CardRetroHeader>
          <CardRetroContent>
            {activeAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAchievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} labels={achievementLabels} colors={tierColors} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="font-bold">Complete quests to unlock achievements!</p>
              </div>
            )}

            {unlockedAchievements.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="font-bold text-sm text-muted-foreground mb-3">Unlocked</h4>
                <div className="flex flex-wrap gap-2">
                  {unlockedAchievements.map(a => (
                    <Badge 
                      key={a.id}
                      className={cn(
                        "bg-gradient-to-r text-white",
                        tierColors[a.tier]
                      )}
                    >
                      {achievementLabels[a.achievement_id]?.emoji} {achievementLabels[a.achievement_id]?.name || a.achievement_id} ({a.tier})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardRetroContent>
        </CardRetro>
      </motion.div>
    </div>
  );
}

function QuestItem({ quest, onComplete }: { quest: Quest; onComplete: () => void }) {
  const progress = (quest.current_progress / quest.target) * 100;
  
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
      <button 
        onClick={onComplete}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{quest.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground shrink-0">
            {quest.current_progress}/{quest.target}
          </span>
        </div>
      </div>
      <Badge variant="outline" className="shrink-0">
        +{quest.xp_reward} XP
      </Badge>
    </div>
  );
}

function AchievementCard({ achievement, labels, colors }: { achievement: Achievement; labels: Record<string, { name: string; emoji: string }>; colors: Record<string, string> }) {
  const label = labels[achievement.achievement_id] || { name: achievement.achievement_id, emoji: '🏅' };
  const progress = (achievement.current_progress / achievement.target) * 100;
  
  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{label.emoji}</span>
          <div>
            <p className="font-bold text-sm">{label.name}</p>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs capitalize bg-gradient-to-r text-white border-0",
                colors[achievement.tier]
              )}
            >
              {achievement.tier}
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{achievement.current_progress}/{achievement.target}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
