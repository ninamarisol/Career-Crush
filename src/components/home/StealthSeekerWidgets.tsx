import { 
  StealthStatusWidget,
  StealthStatsWidget,
  PrivacyChecklistWidget,
  ActiveOpportunitiesWidget,
  WidgetGrid,
} from '@/components/widgets';

interface StealthSeekerWidgetsProps {
  stats: {
    activeConversations: number;
    discreteApplications: number;
    trustedContacts: number;
    pendingResponses: number;
  };
  activeOpportunities: Array<{
    id: string;
    company: string;
    position: string;
    status: string;
    lastActivity: string;
  }>;
  getStatusColor: (status: string) => string;
}

export function StealthSeekerWidgets({ 
  stats, 
  activeOpportunities, 
  getStatusColor 
}: StealthSeekerWidgetsProps) {
  return (
    <WidgetGrid>
      {/* Stealth Mode Indicator */}
      <StealthStatusWidget size="full" />

      {/* Privacy Stats */}
      <StealthStatsWidget size="large" stats={stats} />

      {/* Privacy Checklist */}
      <PrivacyChecklistWidget size="large" />

      {/* Active Opportunities */}
      <ActiveOpportunitiesWidget 
        size="large"
        opportunities={activeOpportunities}
        getStatusColor={getStatusColor}
      />
    </WidgetGrid>
  );
}
