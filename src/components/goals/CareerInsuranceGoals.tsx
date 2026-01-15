import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Users, Linkedin, Calendar, Coffee, 
  MessageCircle, TrendingUp, CheckCircle2, Clock,
  Sparkles, Award, Target, BookOpen, CalendarDays,
  Lightbulb, Heart
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserGoals, Quest, WeeklyStats, PersonalBests } from '@/hooks/useGoals';
import { achievementsByMode } from '@/lib/questTemplates';

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
  // Career Insurance uses monthly and weekly quests - NO daily pressure
  const monthlyQuests = quests.filter(q => q.type === 'monthly' && !q.is_completed);
  const weeklyQuests = quests.filter(q => q.type === 'weekly' && !q.is_completed);
  const epicQuests = quests.filter(q => q.type === 'epic');
  const completedQuests = quests.filter(q => q.is_completed && q.type !== 'epic');

  // Mock networking metrics (would come from database in production)
  const networkingStats = {
    connectionsThisMonth: 3,
    coffeeChatsThisMonth: 2,
    linkedInEngagements: 12,
    industryEventsAttended: 1,
    articlesRead: 8,
  };

  const monthlyNetworkingGoal = (userGoals.weekly_networking_target || 1) * 4;
  const networkingProgress = monthlyNetworkingGoal > 0
    ? (networkingStats.connectionsThisMonth / monthlyNetworkingGoal) * 100
    : 0;

  // Calculate total time investment this month (~2-3 hours expected)
  const estimatedTimeInvested = (
    networkingStats.coffeeChatsThisMonth * 0.75 + // 45 min each
    networkingStats.industryEventsAttended * 1 + // 1 hour each
    networkingStats.linkedInEngagements * 0.08 // 5 min each
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Career Insurance Header - Calm & Supportive Tone */}
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
                <Heart className="absolute -top-1 -right-1 w-6 h-6 text-pink-500" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xl">Career Insurance Mode</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500">
                    Protected
                  </Badge>
                </div>
                <p className="text-muted-foreground">Building your safety net through relationships, not pressure</p>
                
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

      {/* Monthly Networking Goal - Main Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Monthly Network Building
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-4xl font-black text-blue-500">{networkingStats.connectionsThisMonth}</span>
                <span className="text-2xl text-muted-foreground">/{monthlyNetworkingGoal || 4}</span>
                <span className="ml-2 text-muted-foreground">meaningful connections</span>
              </div>
              <Badge variant={networkingProgress >= 100 ? "default" : "secondary"} className="text-lg px-4 py-2">
                {Math.round(networkingProgress)}%
              </Badge>
            </div>
            <Progress value={Math.min(networkingProgress, 100)} className="h-4" />
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>~{estimatedTimeInvested} hours invested this month</span>
              <span className="text-blue-500">No pressure - completely optional!</span>
            </div>
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-black">{networkingStats.connectionsThisMonth}</div>
                <p className="text-xs text-muted-foreground">New Connections</p>
                <p className="text-xs text-blue-500">+15 XP each</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Coffee className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <div className="text-2xl font-black">{networkingStats.coffeeChatsThisMonth}</div>
                <p className="text-xs text-muted-foreground">Coffee Chats</p>
                <p className="text-xs text-amber-500">+75 XP each</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Linkedin className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-black">{networkingStats.linkedInEngagements}</div>
                <p className="text-xs text-muted-foreground">LinkedIn Posts</p>
                <p className="text-xs text-blue-600">+10 XP each</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-black">{networkingStats.industryEventsAttended}</div>
                <p className="text-xs text-muted-foreground">Events Attended</p>
                <p className="text-xs text-green-500">+40 XP each</p>
              </div>

              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-black">{networkingStats.articlesRead}</div>
                <p className="text-xs text-muted-foreground">Articles Read</p>
                <p className="text-xs text-purple-500">+10 XP each</p>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optional Activities - Low Pressure */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                💡 Optional Activities
              </CardRetroTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Suggestions, not requirements. No penalties!
              </p>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {monthlyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    THIS MONTH
                  </h4>
                  <div className="space-y-2">
                    {monthlyQuests.map(quest => (
                      <SuggestionItem key={quest.id} quest={quest} onComplete={() => updateQuestProgress(quest.id, quest.target)} />
                    ))}
                  </div>
                </div>
              )}

              {weeklyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    THIS WEEK
                  </h4>
                  <div className="space-y-2">
                    {weeklyQuests.map(quest => (
                      <SuggestionItem key={quest.id} quest={quest} onComplete={() => updateQuestProgress(quest.id, quest.target)} />
                    ))}
                  </div>
                </div>
              )}

              {monthlyQuests.length === 0 && weeklyQuests.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-green-600">All caught up! 🎉</p>
                  <p className="text-sm text-muted-foreground">Great networking this month</p>
                </div>
              )}

              {completedQuests.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    ✓ {completedQuests.length} activity{completedQuests.length !== 1 ? 'ies' : 'y'} completed
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
                  <span className="font-bold">Monthly Activity</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-600">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Any activity counts - no streaks, no pressure!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Career Insurance Metrics
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

              {/* Monthly Consistency Bonus */}
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  <span className="font-bold text-sm">Monthly Consistency Bonus</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete any activity this month for +100 XP bonus!
                </p>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm">Pro Tip</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Aim for 2-3 meaningful conversations per month to maintain a strong network.
                </p>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>

      {/* Career Health Milestones */}
      {epicQuests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <CardRetro className="border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
            <CardRetroHeader>
              <CardRetroTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                🌟 Career Health Milestones
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {epicQuests.map(quest => (
                  <MilestoneCard key={quest.id} quest={quest} />
                ))}
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      )}
    </div>
  );
}

// Suggestion Item - Softer UI for Career Insurance
function SuggestionItem({ quest, onComplete }: { quest: Quest; onComplete: () => void }) {
  const progress = (quest.current_progress / quest.target) * 100;
  
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg group hover:bg-muted/40 transition-colors">
      <button 
        onClick={onComplete}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <CheckCircle2 className="w-5 h-5 text-muted-foreground hover:text-green-500" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{quest.title}</p>
        <p className="text-xs text-muted-foreground">{quest.description}</p>
        {quest.target > 1 && (
          <div className="flex items-center gap-2 mt-1">
            <Progress value={progress} className="h-1 flex-1" />
            <span className="text-xs text-muted-foreground shrink-0">
              {quest.current_progress}/{quest.target}
            </span>
          </div>
        )}
      </div>
      <Badge variant="outline" className="shrink-0 text-xs">
        +{quest.xp_reward} XP
      </Badge>
    </div>
  );
}

function MilestoneCard({ quest }: { quest: Quest }) {
  const progress = (quest.current_progress / quest.target) * 100;
  
  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-blue-500/20">
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold">{quest.title}</p>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
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
