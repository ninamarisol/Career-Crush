import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useCareerData } from '@/hooks/useCareerData';
import type { CareerTarget } from '@/hooks/useCareerTarget';
import type { ClimbModeGoals as ClimbGoalsType, MonthlyProgress, CustomGoal } from '@/hooks/useGoalCrusher';
import { CareerTargetCard } from '@/components/goals/CareerTargetCard';
import { WeeklyBriefCard } from '@/components/goals/WeeklyBriefCard';
import { OneMoveCard } from '@/components/goals/OneMoveCard';
import { MomentumMap } from '@/components/goals/MomentumMap';
import { SprintPillars } from '@/components/goals/SprintPillars';
import { StreakAndCapture } from '@/components/goals/StreakAndCapture';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClimbGoalCrusherProps {
  careerTarget: CareerTarget;
  weeklyBrief: {
    brief: any;
    loading: boolean;
    generateBrief: () => Promise<void>;
    swapMove: () => void;
    showAlternate: boolean;
    currentMove: { text: string; category: string } | null;
    dataSnapshot: any;
  };
  goals: ClimbGoalsType;
  monthlyProgress: MonthlyProgress;
  customGoals: CustomGoal[];
  streakCount: number;
  streakMonths: string[];
  onUpdateTarget: () => void;
  onAddSkill: () => void;
  onLogSkillHours: (name: string) => void;
  onToggleVisibility: (id: string, enabled: boolean) => void;
  onLogVisibility: (id: string) => void;
  onEditGoals: () => void;
  onSaveCustomGoal: (goal: CustomGoal) => void;
  onToggleCustomStep: (goalId: string, stepIdx: number) => void;
}

export function ClimbGoalCrusher({
  careerTarget,
  weeklyBrief,
  goals,
  monthlyProgress,
  customGoals,
  streakCount,
  streakMonths,
  onUpdateTarget,
  onAddSkill,
  onLogSkillHours,
  onToggleVisibility,
  onLogVisibility,
  onEditGoals,
  onSaveCustomGoal,
  onToggleCustomStep,
}: ClimbGoalCrusherProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { wins } = useCareerData();
  const { contacts } = useContacts();

  // Auto-generate brief on mount
  useEffect(() => {
    if (!weeklyBrief.brief && !weeklyBrief.loading) {
      weeklyBrief.generateBrief();
    }
  }, []);

  const handleExecuteMove = useCallback((category: string) => {
    switch (category) {
      case 'win_logging':
      case 'track_record':
        navigate('/track-record');
        break;
      case 'network':
        navigate('/contacts');
        break;
      case 'skill':
        onAddSkill();
        break;
      case 'visibility':
        // Log first enabled visibility activity
        const firstVis = goals.visibilityActivities.find(a => a.enabled && a.completed < a.target);
        if (firstVis) onLogVisibility(firstVis.id);
        else toast.info('All visibility activities complete for this month!');
        break;
    }
  }, [navigate, goals.visibilityActivities, onAddSkill, onLogVisibility]);

  const handleAddCustomGoal = (pillar: 'visibility' | 'network' | 'skills') => {
    // For now, create a simple custom goal inline
    const goalText = prompt('What do you want to achieve?');
    if (!goalText) return;

    onSaveCustomGoal({
      id: crypto.randomUUID(),
      pillar,
      refinedGoal: goalText,
      steps: [{ title: goalText, cadence: 'weekly' }],
      featureSuggestions: [],
    });
  };

  // Build data for momentum map
  const winsData = wins.map(w => ({ win_date: w.win_date }));
  const contactsData = contacts.map(c => ({ last_contacted: c.last_contacted }));

  // Build pillar actions from visibility activities completed dates
  const pillarActions: Array<{ date: string }> = [];
  goals.visibilityActivities.forEach(a => {
    for (let i = 0; i < a.completed; i++) {
      pillarActions.push({ date: new Date().toISOString().split('T')[0] });
    }
  });

  // Build network priority contacts from brief or fallback
  const priorityContacts = weeklyBrief.brief?.networkPriority || [];

  // Brief insight for momentum map
  const momentumInsight = weeklyBrief.brief
    ? weeklyBrief.brief.pulseInsight || null
    : null;

  return (
    <div className="space-y-4">
      {/* Section 1: Career Target Card */}
      <CareerTargetCard target={careerTarget} onUpdateTarget={onUpdateTarget} />

      {/* Section 2: Weekly Brief */}
      <WeeklyBriefCard
        brief={weeklyBrief.brief?.weeklyBrief || null}
        loading={weeklyBrief.loading}
        onGenerate={weeklyBrief.generateBrief}
      />

      {/* Section 3: Your One Move */}
      <OneMoveCard
        move={weeklyBrief.currentMove}
        onSwap={weeklyBrief.swapMove}
        showAlternate={weeklyBrief.showAlternate}
        onExecute={handleExecuteMove}
      />

      {/* Section 4: Momentum Map */}
      <MomentumMap
        wins={winsData}
        contacts={contactsData}
        pillarActions={pillarActions}
        aiInsight={momentumInsight}
      />

      {/* Section 5: Sprint Pillars */}
      <SprintPillars
        primaryBlocker={careerTarget.biggest_blocker}
        visibilityActivities={goals.visibilityActivities}
        networkContacts={goals.networkContacts}
        networkProgress={monthlyProgress.networkContacts}
        priorityContacts={priorityContacts}
        skills={goals.skills}
        customGoals={customGoals}
        onLogVisibility={onLogVisibility}
        onToggleVisibility={onToggleVisibility}
        onAddSkill={onAddSkill}
        onLogSkillHours={onLogSkillHours}
        onAddCustomGoal={handleAddCustomGoal}
        onToggleCustomStep={onToggleCustomStep}
      />

      {/* Section 6: Streak + Quick Capture */}
      <StreakAndCapture
        streakCount={streakCount}
        streakMonths={streakMonths}
        onWinLogged={() => {
          // Could trigger momentum recalculation
          weeklyBrief.generateBrief();
        }}
      />
    </div>
  );
}
