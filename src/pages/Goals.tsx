import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2 } from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { useGoals } from '@/hooks/useGoals';
import { GoalsSetup } from '@/components/goals/GoalsSetup';
import { ActiveSeekerGoals } from '@/components/goals/ActiveSeekerGoals';
import { ClimbGoals } from '@/components/goals/ClimbGoals';
import { useApp } from '@/context/AppContext';

const achievementLabels: Record<string, { name: string; emoji: string }> = {
  application_warrior: { name: 'Application Warrior', emoji: '⚔️' },
  interview_ace: { name: 'Interview Ace', emoji: '🎯' },
  quality_seeker: { name: 'Quality Seeker', emoji: '💎' },
  star_story_master: { name: 'Story Master', emoji: '⭐' },
  skill_builder: { name: 'Skill Builder', emoji: '🎓' },
  win_logger: { name: 'Win Logger', emoji: '🏆' },
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
  const userMode = profile?.user_mode || 'crush';

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

  if (!userGoals?.calibration_complete) {
    return <GoalsSetup onComplete={completeSetup} />;
  }

  const getModeInfo = () => {
    switch (userMode) {
      case 'climb':
        return { title: 'Level Up 📈', subtitle: 'Building skills for long-term success' };
      default:
        return { title: 'Crush It 💪', subtitle: 'Track YOUR progress, at YOUR pace' };
    }
  };

  const modeInfo = getModeInfo();

  const renderModeContent = () => {
    if (userMode === 'climb') {
      return (
        <ClimbGoals
          userGoals={userGoals}
          quests={quests}
          weeklyStats={weeklyStats}
          personalBests={personalBests}
          levelProgress={levelProgress}
          getLevelTitle={getLevelTitle}
          updateQuestProgress={updateQuestProgress}
        />
      );
    }
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
        achievementLabels={{}}
        tierColors={{}}
      />
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">{modeInfo.title}</h1>
            <p className="text-muted-foreground">{modeInfo.subtitle}</p>
          </div>
          <ButtonRetro variant="outline" size="sm" onClick={() => setShowSetup(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            Adjust Goals
          </ButtonRetro>
        </motion.div>

        {renderModeContent()}

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
                  <ButtonRetro variant="outline" size="sm">Just right ✓</ButtonRetro>
                  <ButtonRetro variant="outline" size="sm" onClick={() => updateGoals({ weekly_application_target: (userGoals?.weekly_application_target || 3) + 1 })}>
                    Too easy
                  </ButtonRetro>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>

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
