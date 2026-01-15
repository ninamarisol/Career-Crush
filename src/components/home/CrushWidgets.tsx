import { 
  TodaysMomentumWidget,
  WeeklyProgressWidget,
  NextActionsWidget,
  RecentApplicationsWidget,
  UpcomingInterviewsWidget,
  WidgetGrid,
  TwoColumn,
} from '@/components/widgets';
import type { SmartStep } from '@/hooks/useSmartSteps';
import { Application, Event } from '@/context/AppContext';

interface CrushWidgetsProps {
  stats: {
    weeklyStreak: number;
    activeJobs: number;
    totalApps: number;
    offers: number;
    interviews: number;
    appliedThisWeek: number;
  };
  recentApps: Application[];
  upcomingEvents: Event[];
  smartSteps: SmartStep[];
  getStatusColor: (status: string) => string;
}

export function CrushWidgets({ 
  stats, 
  recentApps, 
  upcomingEvents, 
  smartSteps, 
  getStatusColor 
}: CrushWidgetsProps) {
  return (
    <WidgetGrid>
      {/* Performance Tracker - Full Stats */}
      <TodaysMomentumWidget 
        size="large" 
        stats={stats} 
      />

      {/* Weekly Goals Progress */}
      <WeeklyProgressWidget 
        size="full" 
        stats={stats}
      />

      {/* Smart Next Steps */}
      <NextActionsWidget 
        size="large" 
        smartSteps={smartSteps} 
      />

      {/* Recent Applications & Schedule */}
      <TwoColumn>
        <RecentApplicationsWidget 
          size="medium"
          applications={recentApps}
          getStatusColor={getStatusColor}
        />
        <UpcomingInterviewsWidget 
          size="medium"
          events={upcomingEvents}
        />
      </TwoColumn>
    </WidgetGrid>
  );
}
