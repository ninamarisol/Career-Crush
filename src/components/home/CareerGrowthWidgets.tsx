import { 
  CareerGrowthStatsWidget,
  SkillsProgressWidget,
  GrowthGoalsWidget,
  WeeklyFocusWidget,
  PromotionReadinessWidget,
  WidgetGrid,
  TwoColumn,
} from '@/components/widgets';
import { SkillProgress, GrowthGoal } from '@/components/widgets/types';

interface CareerGrowthWidgetsProps {
  stats: {
    skillsInProgress: number;
    completedGoals: number;
    learningStreak: number;
    nextMilestone: string;
  };
  skillsProgress: SkillProgress[];
  growthGoals: GrowthGoal[];
}

export function CareerGrowthWidgets({ 
  stats, 
  skillsProgress, 
  growthGoals 
}: CareerGrowthWidgetsProps) {
  return (
    <WidgetGrid>
      {/* Promotion Readiness - Primary Focus */}
      <PromotionReadinessWidget 
        size="full"
        targetRole={stats.nextMilestone}
        progress={72}
        timeline="8-10 months at this pace"
        nextMilestone={{ title: 'Complete leadership course', deadline: 'Mar 2026' }}
      />

      {/* Growth Progress Overview */}
      <CareerGrowthStatsWidget size="large" stats={stats} />

      {/* Skills Development */}
      <SkillsProgressWidget size="large" skills={skillsProgress} />

      {/* Growth Goals and Weekly Focus */}
      <TwoColumn>
        <GrowthGoalsWidget size="medium" goals={growthGoals} />
        <WeeklyFocusWidget size="medium" />
      </TwoColumn>
    </WidgetGrid>
  );
}
