import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Trophy, Flame, TrendingUp, 
  CheckCircle2, Circle, Clock, Calendar, 
  Sparkles, Award, BookOpen, Users, Lightbulb
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserGoals, Quest, WeeklyStats, PersonalBests } from '@/hooks/useGoals';

interface ClimbGoalsProps {
  userGoals: UserGoals;
  quests: Quest[];
  weeklyStats: WeeklyStats;
  personalBests: PersonalBests;
  levelProgress: { currentXP: number; xpForNextLevel: number; progressPercent: number } | null;
  getLevelTitle: (level: number) => string;
  updateQuestProgress: (questId: string, progress: number) => Promise<void>;
}

export function ClimbGoals({
  userGoals,
  quests,
  weeklyStats,
  personalBests,
  levelProgress,
  getLevelTitle,
  updateQuestProgress,
}: ClimbGoalsProps) {
  const dailyQuests = quests.filter(q => q.type === 'daily' && !q.is_completed);
  const weeklyQuests = quests.filter(q => q.type === 'weekly' && !q.is_completed);
  const completedQuests = quests.filter(q => q.is_completed && q.type !== 'epic');

  return (
    <div className="space-y-6">
      {/* Level & Career Growth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardRetro className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border-blue-500/30">
          <CardRetroContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white shadow-retro">
                  <span className="text-3xl font-black">{userGoals.current_level}</span>
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-blue-500" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xl">Level {userGoals.current_level}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="font-bold text-blue-600">{getLevelTitle(userGoals.current_level)}</span>
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

      {/* Growth Focus Areas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Growth Focus Areas
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="font-bold">Skills</p>
                <p className="text-sm text-muted-foreground">Build expertise</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="font-bold">Network</p>
                <p className="text-sm text-muted-foreground">Grow connections</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="font-bold">Visibility</p>
                <p className="text-sm text-muted-foreground">Build your brand</p>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quest Board */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CardRetro className="h-full border-blue-500/20">
            <CardRetroHeader>
              <CardRetroTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                🎯 Growth Quests
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {dailyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    TODAY
                  </h4>
                  <div className="space-y-2">
                    {dailyQuests.map(quest => (
                      <div 
                        key={quest.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => updateQuestProgress(quest.id, quest.target)}
                      >
                        <Circle className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-bold text-sm">{quest.title}</p>
                          {quest.description && (
                            <p className="text-xs text-muted-foreground">{quest.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">+{quest.xp_reward} XP</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {weeklyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    THIS WEEK
                  </h4>
                  <div className="space-y-2">
                    {weeklyQuests.map(quest => (
                      <div 
                        key={quest.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => updateQuestProgress(quest.id, quest.target)}
                      >
                        <Circle className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-bold text-sm">{quest.title}</p>
                          {quest.description && (
                            <p className="text-xs text-muted-foreground">{quest.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">+{quest.xp_reward} XP</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dailyQuests.length === 0 && weeklyQuests.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-green-600">All quests complete! 🎉</p>
                  <p className="text-sm text-muted-foreground">Check back tomorrow</p>
                </div>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Stats & Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>📊 Your Progress</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {/* Streak */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-blue-500" />
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-black text-blue-600">{personalBests.totalApplications}</p>
                  <p className="text-xs text-muted-foreground">Skills Logged</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-black text-emerald-600">{weeklyStats.followUpsThisWeek}</p>
                  <p className="text-xs text-muted-foreground">Connections Made</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-black text-amber-600">{completedQuests.length}</p>
                  <p className="text-xs text-muted-foreground">Quests Done</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-black text-purple-600">{userGoals.total_xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>
    </div>
  );
}
