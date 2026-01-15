import { 
  CareerHealthWidget,
  CareerInsuranceStatsWidget,
  QuickMaintenanceWidget,
  SavedJobsWidget,
  WidgetGrid,
} from '@/components/widgets';
import { Application } from '@/context/AppContext';

interface CareerInsuranceWidgetsProps {
  stats: {
    savedJobs: number;
    networkContacts: number;
    lastResumeUpdate: string;
    monthlyCheckIns: number;
    careerHealthScore?: number;
    marketPosition?: number;
    skillRelevance?: number;
    networkHealth?: number;
  };
  savedPositions: Application[];
}

export function CareerInsuranceWidgets({ stats, savedPositions }: CareerInsuranceWidgetsProps) {
  // Add default career health values if not provided
  const healthStats = {
    careerHealthScore: stats.careerHealthScore ?? 75,
    marketPosition: stats.marketPosition ?? 85,
    skillRelevance: stats.skillRelevance ?? 70,
    networkHealth: stats.networkHealth ?? 80,
  };

  return (
    <WidgetGrid>
      {/* Career Health Score - Primary Focus */}
      <CareerHealthWidget 
        size="full" 
        stats={healthStats}
      />

      {/* Quick Stats */}
      <CareerInsuranceStatsWidget 
        size="large" 
        stats={stats}
      />

      {/* Low-Effort Tasks */}
      <QuickMaintenanceWidget size="large" />

      {/* Saved Opportunities */}
      <SavedJobsWidget 
        size="medium"
        savedJobs={savedPositions}
      />
    </WidgetGrid>
  );
}
