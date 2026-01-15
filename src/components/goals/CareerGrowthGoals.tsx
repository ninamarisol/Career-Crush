import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BookOpen, Award, Target, Star,
  Sparkles, GraduationCap, Lightbulb, CheckCircle2,
  Flame, Briefcase, BarChart3, Trophy, Clock,
  Calendar, Users, PenTool, Rocket
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
  // Career Growth uses daily learning quests + weekly/monthly projects
  const dailyQuests = quests.filter(q => q.type === 'daily' && !q.is_completed);
  const weeklyQuests = quests.filter(q => q.type === 'weekly' && !q.is_completed);
  const monthlyQuests = quests.filter(q => q.type === 'monthly' && !q.is_completed);
  const epicQuests = quests.filter(q => q.type === 'epic');
  const completedQuests = quests.filter(q => q.is_completed && q.type !== 'epic');

  // Growth-focused metrics (would come from database in production)
  const growthStats = {
    skillsInProgress: 3,
    coursesCompleted: 2,
    certificationsEarned: 1,
    mentoringSessions: 4,
    industryArticlesRead: 12,
    hoursLearned: 8.5,
    projectsShipped: 2,
  };

  const monthlyLearningGoal = userGoals.weekly_hours || 10;
  const learningProgress = (growthStats.hoursLearned / monthlyLearningGoal) * 100;

  // Mock promotion readiness
  const promotionReadiness = {
    percentage: 72,
    requirementsMet: 3,
    requirementsTotal: 5,
    xpToPromotion: 350,
  };

  const allDailyComplete = dailyQuests.length === 0 && completedQuests.some(q => q.type === 'daily');

  return (
    <div className="space-y-6">
      {/* Career Growth Header - Achievement Focused */}
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
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-600 border-emerald-500">
                    Learning
                  </Badge>
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

      {/* Learning Streak Bonus */}
      {allDailyComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <CardRetro className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30">
            <CardRetroContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-black text-lg">🎓 LEARNING STREAK! +75 XP</p>
                  <p className="text-sm text-muted-foreground">
                    Week {Math.min(9, Math.ceil(userGoals.current_streak / 7))}+ bonus active!
                  </p>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      )}

      {/* Monthly Learning Progress */}
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
                <span className="text-4xl font-black text-emerald-500">{growthStats.hoursLearned}</span>
                <span className="text-2xl text-muted-foreground">/{monthlyLearningGoal} hours</span>
              </div>
              <Badge variant={learningProgress >= 100 ? "default" : "secondary"} className="text-lg px-4 py-2">
                {Math.round(learningProgress)}%
              </Badge>
            </div>
            <Progress value={Math.min(learningProgress, 100)} className="h-4" />
            <p className="mt-2 text-sm text-muted-foreground">
              Invest in yourself - every hour of learning compounds over time 📚
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
                <p className="text-xs text-amber-500">In Progress</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <GraduationCap className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-black">{growthStats.coursesCompleted}</div>
                <p className="text-xs text-muted-foreground">Courses Done</p>
                <p className="text-xs text-blue-500">+200 XP each</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-black">{growthStats.certificationsEarned}</div>
                <p className="text-xs text-muted-foreground">Certifications</p>
                <p className="text-xs text-purple-500">+300 XP each</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Rocket className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-black">{growthStats.projectsShipped}</div>
                <p className="text-xs text-muted-foreground">Projects Shipped</p>
                <p className="text-xs text-orange-500">+150 XP each</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <div className="text-2xl font-black">{growthStats.mentoringSessions}</div>
                <p className="text-xs text-muted-foreground">Mentoring</p>
                <p className="text-xs text-emerald-500">+40 XP each</p>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Promotion Readiness Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <CardRetro className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-indigo-500/5">
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              🏆 Promotion Path
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Promotion Readiness</p>
                <span className="text-3xl font-black text-purple-500">{promotionReadiness.percentage}%</span>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-purple-500/10">
                  {promotionReadiness.requirementsMet}/{promotionReadiness.requirementsTotal} requirements met
                </Badge>
              </div>
            </div>
            <Progress value={promotionReadiness.percentage} className="h-3" />
            <p className="mt-2 text-sm text-muted-foreground">
              {promotionReadiness.xpToPromotion} XP to unlock promotion milestone
            </p>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Path - Prominent for Career Growth */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardRetro className="h-full border-emerald-500/20">
            <CardRetroHeader className="flex items-center justify-between">
              <CardRetroTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                📚 Learning Path
              </CardRetroTitle>
              <div className="flex gap-1">
                <Badge variant={dailyQuests.length > 0 ? "default" : "secondary"} className="text-xs">Daily</Badge>
                <Badge variant={weeklyQuests.length > 0 ? "default" : "secondary"} className="text-xs">Weekly</Badge>
                <Badge variant={monthlyQuests.length > 0 ? "outline" : "secondary"} className="text-xs">Monthly</Badge>
              </div>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {dailyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    DAILY LEARNING
                  </h4>
                  <div className="space-y-2">
                    {dailyQuests.map(quest => (
                      <LearningItem key={quest.id} quest={quest} onComplete={() => updateQuestProgress(quest.id, quest.target)} />
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
                      <LearningItem key={quest.id} quest={quest} onComplete={() => updateQuestProgress(quest.id, quest.target)} />
                    ))}
                  </div>
                </div>
              )}

              {monthlyQuests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    THIS MONTH
                  </h4>
                  <div className="space-y-2">
                    {monthlyQuests.map(quest => (
                      <LearningItem key={quest.id} quest={quest} onComplete={() => updateQuestProgress(quest.id, quest.target)} />
                    ))}
                  </div>
                </div>
              )}

              {dailyQuests.length === 0 && weeklyQuests.length === 0 && monthlyQuests.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-green-600">All learning complete! 🎉</p>
                  <p className="text-sm text-muted-foreground">Time to apply what you've learned</p>
                </div>
              )}

              {completedQuests.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    ✓ {completedQuests.length} learning task{completedQuests.length !== 1 ? 's' : ''} completed
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
          transition={{ delay: 0.35 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle>📈 Growth Stats</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-4">
              {/* Learning Streak */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Learning Streak</span>
                  <span className="font-black text-xl text-emerald-500">{userGoals.current_streak} days</span>
                </div>
                <p className="text-sm text-muted-foreground">Consistency builds expertise!</p>
                <div className="mt-2 text-xs">
                  <span className="text-emerald-500">
                    Week {Math.min(9, Math.ceil(userGoals.current_streak / 7))}+ = +75 XP/week bonus
                  </span>
                </div>
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

      {/* Epic Career Milestones */}
      {epicQuests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CardRetro className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
            <CardRetroHeader>
              <CardRetroTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                🏆 Career Milestones
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {epicQuests.map(quest => (
                  <CareerMilestone key={quest.id} quest={quest} />
                ))}
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      )}
    </div>
  );
}

// Learning Item - Educational, achievement-focused design
function LearningItem({ quest, onComplete }: { quest: Quest; onComplete: () => void }) {
  const progress = (quest.current_progress / quest.target) * 100;
  
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors border border-transparent hover:border-emerald-500/20">
      <button 
        onClick={onComplete}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <CheckCircle2 className="w-5 h-5 text-muted-foreground hover:text-emerald-500" />
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
      <Badge variant="outline" className="shrink-0 bg-emerald-500/10">
        +{quest.xp_reward} XP
      </Badge>
    </div>
  );
}

function CareerMilestone({ quest }: { quest: Quest }) {
  const progress = (quest.current_progress / quest.target) * 100;
  
  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-emerald-500/20">
      <div className="flex items-center justify-between mb-2">
        <p className="font-black">{quest.title}</p>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
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
