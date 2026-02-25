import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { JobSearchContext } from '@/hooks/useCrushContext';
import type { CrushModeGoals as CrushGoalsType, WeeklyProgress } from '@/hooks/useGoalCrusher';
import type { CrushBriefData } from '@/hooks/useCrushBrief';
import { CrushContextCard } from '@/components/goals/CrushContextCard';
import { WeeklyBriefCard } from '@/components/goals/WeeklyBriefCard';
import { CrushOneMoveCard } from '@/components/goals/CrushOneMoveCard';
import { CrushSprintGoals } from '@/components/goals/CrushSprintGoals';
import { CrushStreakCapture } from '@/components/goals/CrushStreakCapture';

interface CrushSprintPageProps {
  searchContext: JobSearchContext;
  goals: CrushGoalsType;
  progress: WeeklyProgress;
  brief: {
    brief: CrushBriefData | null;
    loading: boolean;
    generateBrief: () => Promise<void>;
    swapMove: () => void;
    showAlternate: boolean;
    currentMove: { text: string; category: string } | null;
  };
  onLogProgress: (type: keyof WeeklyProgress, amount?: number) => void;
  onEditGoals: () => void;
  onEditContext: () => void;
  getGoalProgress: (current: number, target: number) => number;
  getCrushWeeklyProgress: () => number;
}

export function CrushSprintPage({
  searchContext,
  goals,
  progress,
  brief,
  onLogProgress,
  onEditGoals,
  onEditContext,
  getGoalProgress,
  getCrushWeeklyProgress,
}: CrushSprintPageProps) {
  const navigate = useNavigate();

  // Auto-generate brief on mount
  useEffect(() => {
    if (!brief.brief && !brief.loading) {
      brief.generateBrief();
    }
  }, []);

  const handleExecuteMove = useCallback((category: string) => {
    switch (category) {
      case 'applications':
        navigate('/applications');
        break;
      case 'follow_ups':
        onLogProgress('followUps');
        break;
      case 'interview_prep':
        onLogProgress('interviewPrepHours');
        break;
      case 'networking':
        navigate('/contacts');
        break;
      case 'resume':
        navigate('/profile');
        break;
    }
  }, [navigate, onLogProgress]);

  // Calculate streak from progress (simplified — in production you'd track this in DB)
  const totalProgress = getCrushWeeklyProgress();
  const streakCount = totalProgress >= 70 ? 1 : 0; // Simplified
  const streakWeeks = [false, false, true, true, false, true, true, totalProgress >= 70];

  return (
    <div className="space-y-4">
      {/* Section 1: Context Card */}
      <CrushContextCard context={searchContext} onUpdate={onEditContext} />

      {/* Section 2: AI Weekly Brief */}
      <WeeklyBriefCard
        brief={brief.brief?.weeklyBrief || null}
        loading={brief.loading}
        onGenerate={brief.generateBrief}
      />

      {/* Section 3: Your One Move */}
      <CrushOneMoveCard
        move={brief.currentMove}
        onSwap={brief.swapMove}
        showAlternate={brief.showAlternate}
        onExecute={handleExecuteMove}
      />

      {/* Section 4: Sprint Goals 2x2 */}
      <CrushSprintGoals
        goals={goals}
        progress={progress}
        onLogProgress={onLogProgress}
        getGoalProgress={getGoalProgress}
        momentumLines={brief.brief?.momentumLines || null}
      />

      {/* Section 5: Streak + Quick Log */}
      <CrushStreakCapture
        streakCount={streakCount}
        streakWeeks={streakWeeks}
        searchStage={searchContext.search_stage}
        onLoggedAction={() => brief.generateBrief()}
      />
    </div>
  );
}
