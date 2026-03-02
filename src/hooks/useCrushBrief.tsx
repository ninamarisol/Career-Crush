import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/context/AppContext';
import { startOfWeek, endOfWeek, subDays, format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import type { JobSearchContext } from '@/hooks/useCrushContext';
import { invokeAuthedFunction } from '@/lib/cloudFunctions';
export interface CrushBriefData {
  weeklyBrief: string;
  oneMove: string;
  oneMoveCategory: string;
  alternateMove: string;
  alternateMoveCategory: string;
  momentumLines: {
    applications: string;
    newContacts: string;
    followUps: string;
    interviewPrepHours: string;
  };
}

export function useCrushBrief(searchContext: JobSearchContext | null) {
  const { user } = useAuth();
  const { applications, events } = useApp();
  const [brief, setBrief] = useState<CrushBriefData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlternate, setShowAlternate] = useState(false);

  const dataSnapshot = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const thirtyDaysAgo = subDays(now, 30);

    const appsThisWeek = applications.filter(a => {
      const d = new Date(a.date_applied || a.created_at);
      return d >= weekStart && d <= weekEnd;
    });

    const recentApps = applications.filter(a => {
      const d = new Date(a.date_applied || a.created_at);
      return d >= thirtyDaysAgo;
    });

    const statusCounts: Record<string, number> = {};
    applications.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    // Find overdue follow-ups (applied > 7 days ago, no status change)
    const overdueFollowUps = applications.filter(a => {
      if (!a.date_applied) return false;
      const daysSince = differenceInDays(now, new Date(a.date_applied));
      return daysSince > 7 && a.status === 'applied';
    });

    const followUpsThisWeek = events.filter(e => {
      const d = new Date(e.date);
      return (e.type === 'follow_up' || e.type === 'networking') && d >= weekStart && d <= weekEnd;
    });

    return {
      currentDate: format(now, 'yyyy-MM-dd'),
      applications: {
        total: applications.length,
        thisWeek: appsThisWeek.length,
        last30Days: recentApps.length,
        statusBreakdown: statusCounts,
        overdueFollowUps: overdueFollowUps.length,
        interviews: applications.filter(a => a.status === 'Interview').length,
        offers: applications.filter(a => a.status === 'Offer').length,
      },
      followUpsThisWeek: followUpsThisWeek.length,
    };
  }, [applications, events]);

  const generateBrief = useCallback(async () => {
    if (!user || !searchContext) return;
    setLoading(true);
    setShowAlternate(false);

    try {
      const data = await invokeAuthedFunction<CrushBriefData & { error?: string }>('crush-brief', {
        dataSnapshot,
        searchContext,
      });
      if (data?.error) { toast.error(data.error); return; }
      setBrief(data as CrushBriefData);
    } catch (e) {
      console.error('Failed to generate crush brief:', e);
      toast.error('Failed to generate brief.');
    } finally {
      setLoading(false);
    }
  }, [user, dataSnapshot, searchContext]);

  const swapMove = () => setShowAlternate(prev => !prev);

  const currentMove = useMemo(() => {
    if (!brief) return null;
    return showAlternate
      ? { text: brief.alternateMove, category: brief.alternateMoveCategory }
      : { text: brief.oneMove, category: brief.oneMoveCategory };
  }, [brief, showAlternate]);

  return { brief, loading, generateBrief, swapMove, showAlternate, currentMove };
}
