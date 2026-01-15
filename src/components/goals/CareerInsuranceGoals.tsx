import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Users, Linkedin, Calendar, Coffee, 
  MessageCircle, TrendingUp, CheckCircle2, Clock,
  Sparkles, Award, Target
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { UserGoals, Quest, WeeklyStats, PersonalBests } from '@/hooks/useGoals';

interface CareerInsuranceGoalsProps {
  userGoals: UserGoals;
  quests: Quest[];
  weeklyStats: WeeklyStats;
  personalBests: PersonalBests;
  levelProgress: { currentXP: number; xpForNextLevel: number; progressPercent: number } | null;
  getLevelTitle: (level: number) => string;
  updateQuestProgress: (questId: string, progress: number) => Promise<void>;
}

export function CareerInsuranceGoals({
  userGoals,
  quests,
  weeklyStats,
  levelProgress,
  getLevelTitle,
  updateQuestProgress,
}: CareerInsuranceGoalsProps) {
  const activeQuests = quests.filter(q => !q.is_completed);
  const completedQuests = quests.filter(q => q.is_completed);

  // Mock data for networking metrics
  const networkingStats = {
    connectionsThisMonth: 3,
    coffeeChatsThisMonth: 2,
    linkedInEngagements: 12,
    industryEventsAttended: 1,
  };

  const monthlyNetworkingGoal = userGoals.weekly_networking_target * 4;
  const networkingProgress = monthlyNetworkingGoal > 0
    ? (networkingStats.connectionsThisMonth / monthlyNetworkingGoal) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Career Insurance Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardRetro className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardRetroContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-retro">
                  <Shield className="w-10 h-10" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-blue-500" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xl">Career Insurance Mode</span>
                </div>
                <p className="text-muted-foreground">Building your safety net through relationships</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline" className="bg-blue-500/10">
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

      {/* Monthly Networking Goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Monthly Networking Goal
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-4xl font-black text-blue-500">{networkingStats.connectionsThisMonth}</span>
                <span className="text-2xl text-muted-foreground">/{monthlyNetworkingGoal || 4}</span>
                <span className="ml-2 text-muted-foreground">new connections</span>
              </div>
              <Badge variant={networkingProgress >= 100 ? "default" : "secondary"} className="text-lg px-4 py-2">
                {Math.round(networkingProgress)}%
              </Badge>
            </div>
            <Progress value={Math.min(networkingProgress, 100)} className="h-4" />
            <p className="mt-2 text-sm text-muted-foreground">
              Keep nurturing your network - it's your career safety net!
            </p>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Networking Activities Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle>📊 This Month's Activity</CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-black">{networkingStats.connectionsThisMonth}</div>
                <p className="text-sm text-muted-foreground">New Connections</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Coffee className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <div className="text-2xl font-black">{networkingStats.coffeeChatsThisMonth}</div>
                <p className="text-sm text-muted-foreground">Coffee Chats</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Linkedin className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-black">{networkingStats.linkedInEngagements}</div>
                <p className="text-sm text-muted-foreground">LinkedIn Posts</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-black">{networkingStats.industryEventsAttended}</div>
                <p className="text-sm text-muted-foreground">Events Attended</p>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relationship Building Quests */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>🤝 Relationship Building</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {activeQuests.length > 0 ? (
                <div className="space-y-2">
                  {activeQuests.map(quest => (
                    <div
                      key={quest.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <MessageCircle className="w-5 h-5 text-blue-500" />
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
                  <p className="text-sm text-muted-foreground">Great networking this week</p>
                </div>
              )}

              {completedQuests.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    ✓ {completedQuests.length} relationship task{completedQuests.length !== 1 ? 's' : ''} completed
                  </p>
                </div>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Network Health */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>💪 Network Health</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Activity Streak</span>
                  <span className="font-black text-xl text-blue-500">{userGoals.current_streak} days</span>
                </div>
                <p className="text-sm text-muted-foreground">Keep connecting regularly!</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Insurance Metrics
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-blue-500">{weeklyStats.followUpsThisWeek}</p>
                    <p className="text-xs text-muted-foreground">Follow-ups Sent</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-blue-500">{userGoals.total_xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm">Pro Tip</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Aim for 2-3 meaningful conversations per week to maintain a strong network.
                </p>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>
    </div>
  );
}
