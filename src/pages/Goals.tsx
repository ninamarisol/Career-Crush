import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Trophy, Flame, Zap, TrendingUp, TrendingDown, 
  Minus, CheckCircle2, Circle, Clock, Calendar, Settings2,
  Star, Award, ChevronRight, Sparkles, Play, Pause
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGoals } from '@/hooks/useGoals';
import { GoalsSetup } from '@/components/goals/GoalsSetup';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

const achievementLabels: Record<string, { name: string; emoji: string }> = {
  application_warrior: { name: 'Application Warrior', emoji: '⚔️' },
  consistent_pro: { name: 'Consistent Pro', emoji: '📅' },
  interview_ace: { name: 'Interview Ace', emoji: '🎯' },
  quality_seeker: { name: 'Quality Seeker', emoji: '💎' },
  network_builder: { name: 'Network Builder', emoji: '🤝' },
};

const tierColors: Record<string, string> = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-300 to-blue-500',
};

export default function Goals() {
  const {
    userGoals,
    quests,
    achievements,
    weeklyStats,
    personalBests,
    loading,
    levelProgress,
    getLevelTitle,
    updateGoals,
    completeSetup,
    updateQuestProgress,
  } = useGoals();

  const [showSetup, setShowSetup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-bold">Loading your goals...</p>
        </div>
      </div>
    );
  }

  // Show setup if not calibrated
  if (!userGoals?.calibration_complete) {
    return <GoalsSetup onComplete={completeSetup} />;
  }

  const dailyQuests = quests.filter(q => q.type === 'daily' && !q.is_completed);
  const weeklyQuests = quests.filter(q => q.type === 'weekly' && !q.is_completed);
  const completedQuests = quests.filter(q => q.is_completed);

  const weekChange = weeklyStats.applicationsLastWeek > 0
    ? ((weeklyStats.applicationsThisWeek - weeklyStats.applicationsLastWeek) / weeklyStats.applicationsLastWeek) * 100
    : weeklyStats.applicationsThisWeek > 0 ? 100 : 0;

  const activeAchievements = achievements.filter(a => !a.unlocked).slice(0, 4);
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">
              Crush It 💪
            </h1>
            <p className="text-muted-foreground">
              Track YOUR progress, at YOUR pace
            </p>
          </div>
          <ButtonRetro
            variant="outline"
            size="sm"
            onClick={() => setShowSetup(true)}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Adjust Goals
          </ButtonRetro>
        </motion.div>

        {/* Level & XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <CardRetro className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardRetroContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Level Circle */}
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

        {/* This Week vs Last Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quests Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
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

          {/* Stats & Streaks Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
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

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                    <AchievementCard key={achievement.id} achievement={achievement} />
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

        {/* Pace Check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6"
        >
          <CardRetro className="bg-muted/30">
            <CardRetroContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">How's this pace feeling?</h4>
                  <p className="text-sm text-muted-foreground">Your goals adapt to YOU</p>
                </div>
                <div className="flex gap-2">
                  <ButtonRetro variant="outline" size="sm" onClick={() => updateGoals({ weekly_application_target: Math.max(1, (userGoals?.weekly_application_target || 3) - 1) })}>
                    Too hard
                  </ButtonRetro>
                  <ButtonRetro variant="outline" size="sm">
                    Just right ✓
                  </ButtonRetro>
                  <ButtonRetro variant="outline" size="sm" onClick={() => updateGoals({ weekly_application_target: (userGoals?.weekly_application_target || 3) + 1 })}>
                    Too easy
                  </ButtonRetro>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Goal Settings Modal */}
        <AnimatePresence>
          {showSetup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowSetup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                onClick={e => e.stopPropagation()}
              >
                <GoalsSetup 
                  onComplete={async (setup) => {
                    await completeSetup(setup);
                    setShowSetup(false);
                  }}
                  isEdit
                  initialValues={userGoals}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Quest Item Component
function QuestItem({ quest, onComplete }: { quest: any; onComplete: () => void }) {
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

// Achievement Card Component
function AchievementCard({ achievement }: { achievement: any }) {
  const label = achievementLabels[achievement.achievement_id] || { name: achievement.achievement_id, emoji: '🏅' };
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
                tierColors[achievement.tier]
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