import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Plus, CalendarCheck } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Badge } from '@/components/ui/badge';
import { useGoalCrusher } from '@/hooks/useGoalCrusher';
import { CrushModeGoals } from '@/components/goals/CrushModeGoals';
import { ClimbModeGoals } from '@/components/goals/ClimbModeGoals';
import { GoalCrusherSetup } from '@/components/goals/GoalCrusherSetup';
import { EditGoalsModal } from '@/components/goals/EditGoalsModal';
import { WeeklyCheckInModal } from '@/components/goals/WeeklyCheckInModal';
import { AddSkillModal } from '@/components/goals/AddSkillModal';
import { LogSkillHoursModal } from '@/components/goals/LogSkillHoursModal';

export default function Goals() {
  const {
    userMode,
    crushGoals,
    climbGoals,
    weeklyProgress,
    monthlyProgress,
    loading,
    goalsSetup,
    updateCrushGoals,
    updateClimbGoals,
    logProgress,
    addSkill,
    logSkillHours,
    toggleVisibilityActivity,
    logVisibilityActivity,
    submitCheckIn,
    getGoalProgress,
    setupGoals,
  } = useGoalCrusher();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showLogHoursModal, setShowLogHoursModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<{ name: string; logged: number; hoursPerWeek: number } | null>(null);

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

  if (!goalsSetup) {
    return (
      <GoalCrusherSetup
        userMode={userMode}
        onComplete={(goals) => setupGoals(userMode, goals)}
      />
    );
  }

  const handleLogSkillHours = (skillName: string) => {
    const skill = climbGoals.skills.find(s => s.name === skillName);
    if (skill) {
      setSelectedSkill(skill);
      setShowLogHoursModal(true);
    }
  };

  // Build goals status for weekly check-in
  const goalsStatus = userMode === 'crush' 
    ? [
        { label: `${crushGoals.applications} applications`, hit: weeklyProgress.applications >= crushGoals.applications },
        { label: `${crushGoals.newContacts} new contacts`, hit: weeklyProgress.newContacts >= crushGoals.newContacts },
        { label: `${crushGoals.followUps} follow-ups`, hit: weeklyProgress.followUps >= crushGoals.followUps },
        { label: `${crushGoals.interviewPrepHours}h interview prep`, hit: weeklyProgress.interviewPrepHours >= crushGoals.interviewPrepHours },
      ]
    : climbGoals.skills.map(s => ({
        label: `${s.hoursPerWeek}h ${s.name}`,
        hit: s.logged >= s.hoursPerWeek,
      }));

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">Goal Crusher</h1>
                <p className="text-sm text-muted-foreground">
                  {userMode === 'crush' 
                    ? 'Weekly targets for your job search' 
                    : 'Monthly goals for career growth'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1.5">
                <Sparkles className="w-3 h-3 mr-1" />
                {userMode === 'crush' ? 'Crush Mode' : 'Climb Mode'}
              </Badge>
              <ButtonRetro 
                variant="outline" 
                size="sm"
                onClick={() => setShowCheckInModal(true)}
                className="gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Weekly Check-In</span>
              </ButtonRetro>
            </div>
          </div>
        </motion.div>

        {/* Mode-specific content */}
        {userMode === 'crush' ? (
          <CrushModeGoals
            goals={crushGoals}
            progress={weeklyProgress}
            onLogProgress={logProgress}
            onEditGoals={() => setShowEditModal(true)}
            getGoalProgress={getGoalProgress}
          />
        ) : (
          <ClimbModeGoals
            goals={climbGoals}
            monthlyProgress={monthlyProgress}
            onAddSkill={() => setShowAddSkillModal(true)}
            onLogSkillHours={handleLogSkillHours}
            onToggleVisibility={toggleVisibilityActivity}
            onLogVisibility={logVisibilityActivity}
            onEditGoals={() => setShowEditModal(true)}
            getGoalProgress={getGoalProgress}
          />
        )}

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 sm:hidden z-50">
          <ButtonRetro 
            size="lg" 
            className="rounded-full w-14 h-14 p-0 shadow-lg"
            onClick={() => {
              if (userMode === 'crush') {
                logProgress('applications');
              } else {
                setShowAddSkillModal(true);
              }
            }}
          >
            <Plus className="w-6 h-6" />
          </ButtonRetro>
        </div>

        {/* Modals */}
        <EditGoalsModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          userMode={userMode}
          crushGoals={crushGoals}
          climbGoals={climbGoals}
          onSaveCrushGoals={updateCrushGoals}
          onSaveClimbGoals={updateClimbGoals}
          onToggleVisibility={toggleVisibilityActivity}
        />

        <WeeklyCheckInModal
          open={showCheckInModal}
          onOpenChange={setShowCheckInModal}
          goalsStatus={goalsStatus}
          onSubmit={submitCheckIn}
        />

        <AddSkillModal
          open={showAddSkillModal}
          onOpenChange={setShowAddSkillModal}
          onAddSkill={addSkill}
          existingSkills={climbGoals.skills.map(s => s.name)}
        />

        {selectedSkill && (
          <LogSkillHoursModal
            open={showLogHoursModal}
            onOpenChange={setShowLogHoursModal}
            skillName={selectedSkill.name}
            currentHours={selectedSkill.logged}
            targetHours={selectedSkill.hoursPerWeek}
            onLogHours={logSkillHours}
          />
        )}
      </div>
    </div>
  );
}
