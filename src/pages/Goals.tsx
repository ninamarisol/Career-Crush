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
import { ActiveSeekerGoals } from '@/components/goals/ActiveSeekerGoals';
import { CareerInsuranceGoals } from '@/components/goals/CareerInsuranceGoals';
import { StealthSeekerGoals } from '@/components/goals/StealthSeekerGoals';
import { CareerGrowthGoals } from '@/components/goals/CareerGrowthGoals';
import { useApp } from '@/context/AppContext';
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

  const { profile } = useApp();
  const [showSetup, setShowSetup] = useState(false);
  const userMode = profile?.user_mode || 'active_seeker';

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

  // Get mode-specific title and subtitle
  const getModeInfo = () => {
    switch (userMode) {
      case 'career_insurance':
        return { title: 'Build Your Network 🤝', subtitle: 'Growing your career safety net' };
      case 'stealth_seeker':
        return { title: 'Stealth Progress 🔒', subtitle: 'Discrete job search while employed' };
      case 'career_growth':
        return { title: 'Level Up 📈', subtitle: 'Building skills for long-term success' };
      default:
        return { title: 'Crush It 💪', subtitle: 'Track YOUR progress, at YOUR pace' };
    }
  };

  const modeInfo = getModeInfo();

  // Render mode-specific content
  const renderModeContent = () => {
    switch (userMode) {
      case 'career_insurance':
        return (
          <CareerInsuranceGoals
            userGoals={userGoals}
            quests={quests}
            weeklyStats={weeklyStats}
            personalBests={personalBests}
            levelProgress={levelProgress}
            getLevelTitle={getLevelTitle}
            updateQuestProgress={updateQuestProgress}
          />
        );
      case 'stealth_seeker':
        return (
          <StealthSeekerGoals
            userGoals={userGoals}
            quests={quests}
            weeklyStats={weeklyStats}
            personalBests={personalBests}
            levelProgress={levelProgress}
            getLevelTitle={getLevelTitle}
            updateQuestProgress={updateQuestProgress}
          />
        );
      case 'career_growth':
        return (
          <CareerGrowthGoals
            userGoals={userGoals}
            quests={quests}
            weeklyStats={weeklyStats}
            personalBests={personalBests}
            levelProgress={levelProgress}
            getLevelTitle={getLevelTitle}
            updateQuestProgress={updateQuestProgress}
          />
        );
      default:
        return (
          <ActiveSeekerGoals
            userGoals={userGoals}
            quests={quests}
            achievements={achievements}
            weeklyStats={weeklyStats}
            personalBests={personalBests}
            levelProgress={levelProgress}
            getLevelTitle={getLevelTitle}
            updateQuestProgress={updateQuestProgress}
            achievementLabels={achievementLabels}
            tierColors={tierColors}
          />
        );
    }
  };

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
              {modeInfo.title}
            </h1>
            <p className="text-muted-foreground">
              {modeInfo.subtitle}
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

        {/* Mode-specific content */}
        {renderModeContent()}

        {/* Pace Check - Show for all modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <CardRetro className="bg-muted/30">
            <CardRetroContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold">How's this pace feeling?</h4>
                  <p className="text-sm text-muted-foreground">Your goals adapt to YOU</p>
                </div>
                <div className="flex gap-2 flex-wrap">
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