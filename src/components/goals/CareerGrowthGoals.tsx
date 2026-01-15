import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BookOpen, Award, Target, Star,
  Sparkles, GraduationCap, Lightbulb, CheckCircle2,
  Flame, Briefcase, BarChart3, Trophy
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { UserGoals, Quest, WeeklyStats, PersonalBests } from '@/hooks/useGoals';

interface CareerGrowthGoalsProps {
  userGoals: UserGoals;
  quests: Quest[];
  weeklyStats: WeeklyStats;
  personalBests: PersonalBests;
  levelProgress: { currentXP: number; xpForNextLevel: number; progressPercent: number } | null;
  getLevelTitle: (level: number) => string;
  updateQuestProgress: (questId: string, progress: number) => Promise<void>;
}

export function CareerGrowthGoals({
  userGoals,
  quests,
  weeklyStats,
  personalBests,
  levelProgress,
  getLevelTitle,
  updateQuestProgress,
}: CareerGrowthGoalsProps) {
  const activeQuests = quests.filter(q => !q.is_completed);
  const completedQuests = quests.filter(q => q.is_completed);

  // Growth-focused metrics
  const growthStats = {
    skillsInProgress: 3,
    coursesCompleted: 2,
    certificationsEarned: 1,
    mentoringSessions: 4,
    industryArticlesRead: 12,
  };

  const monthlyLearningGoal = 10; // hours
  const learningProgress = 65; // percent

  return (
    <div className="space-y-6">
      {/* Career Growth Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardRetro className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
          <CardRetroContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-retro">
                  <TrendingUp className="w-10 h-10" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-emerald-500" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xl">Career Growth Mode</span>
                </div>
                <p className="text-muted-foreground">Building skills for long-term success</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline" className="bg-emerald-500/10">
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

      {/* Learning Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              Monthly Learning Goal
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-4xl font-black text-emerald-500">{learningProgress}%</span>
                <span className="ml-2 text-muted-foreground">of {monthlyLearningGoal} hours</span>
              </div>
              <Badge variant={learningProgress >= 100 ? "default" : "secondary"} className="text-lg px-4 py-2">
                {Math.round(learningProgress * monthlyLearningGoal / 100)}h completed
              </Badge>
            </div>
            <Progress value={learningProgress} className="h-4" />
            <p className="mt-2 text-sm text-muted-foreground">
              Invest in yourself - every hour of learning compounds over time
            </p>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Growth Activities Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle>📊 Growth Activities</CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Lightbulb className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <div className="text-2xl font-black">{growthStats.skillsInProgress}</div>
                <p className="text-xs text-muted-foreground">Skills Learning</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <GraduationCap className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-black">{growthStats.coursesCompleted}</div>
                <p className="text-xs text-muted-foreground">Courses Done</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-black">{growthStats.certificationsEarned}</div>
                <p className="text-xs text-muted-foreground">Certifications</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Briefcase className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <div className="text-2xl font-black">{growthStats.mentoringSessions}</div>
                <p className="text-xs text-muted-foreground">Mentoring</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-black">{growthStats.industryArticlesRead}</div>
                <p className="text-xs text-muted-foreground">Articles Read</p>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Quests */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>🎯 Growth Quests</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {activeQuests.length > 0 ? (
                <div className="space-y-2">
                  {activeQuests.map(quest => (
                    <div
                      key={quest.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <Star className="w-5 h-5 text-emerald-500" />
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
                  <p className="font-bold text-green-600">All quests complete! 🎉</p>
                  <p className="text-sm text-muted-foreground">Time to set new goals</p>
                </div>
              )}

              {completedQuests.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    ✓ {completedQuests.length} growth task{completedQuests.length !== 1 ? 's' : ''} completed
                  </p>
                </div>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Growth Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>📈 Growth Stats</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Learning Streak</span>
                  <span className="font-black text-xl text-emerald-500">{userGoals.current_streak} days</span>
                </div>
                <p className="text-sm text-muted-foreground">Consistency builds expertise</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Career Metrics
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-emerald-500">{personalBests.totalApplications}</p>
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-emerald-500">{personalBests.totalInterviews}</p>
                    <p className="text-xs text-muted-foreground">Interviews</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-emerald-500">{userGoals.longest_streak}</p>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-emerald-500">{userGoals.total_xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm">Growth Tip</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Focus on 1-2 high-impact skills that align with your career goals.
                </p>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>
    </div>
  );
}
