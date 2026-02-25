import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useCareerData } from '@/hooks/useCareerData';
import { useApp } from '@/context/AppContext';
import { differenceInDays, format, subDays } from 'date-fns';
import { toast } from 'sonner';

export interface WeeklyBriefData {
  weeklyBrief: string;
  oneMove: string;
  oneMoveCategory: string;
  alternateMove: string;
  alternateMoveCategory: string;
  promotionPulse: 'heating' | 'steady' | 'cooling';
  pulseInsight: string;
  networkPriority: Array<{
    name: string;
    reason: string;
    contactId: string;
  }>;
}

export function useWeeklyBrief() {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { wins, skills } = useCareerData();
  const { applications } = useApp();
  const [brief, setBrief] = useState<WeeklyBriefData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlternate, setShowAlternate] = useState(false);

  // Build the data snapshot for the AI
  const dataSnapshot = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Win stats
    const recentWins = wins.filter(w => new Date(w.win_date) >= thirtyDaysAgo);
    const lastWinDate = wins.length > 0 ? wins[0].win_date : null;
    const daysSinceLastWin = lastWinDate ? differenceInDays(now, new Date(lastWinDate)) : null;

    // Contact stats
    const overdueContacts = contacts
      .filter(c => {
        if (!c.last_contacted) return true;
        return differenceInDays(now, new Date(c.last_contacted)) >= 30;
      })
      .map(c => ({
        id: c.id,
        name: c.name,
        company: c.company,
        position: c.position,
        connectionStrength: c.connection_strength,
        daysSinceContact: c.last_contacted
          ? differenceInDays(now, new Date(c.last_contacted))
          : null,
        neverContacted: !c.last_contacted,
      }));

    const contactedThisMonth = contacts.filter(c => {
      if (!c.last_contacted) return false;
      return new Date(c.last_contacted) >= new Date(now.getFullYear(), now.getMonth(), 1);
    }).length;

    // Application stats
    const recentApps = applications.filter(a => {
      const d = new Date(a.date_applied || a.created_at);
      return d >= thirtyDaysAgo;
    });

    // Skills
    const skillsSummary = skills.map(s => ({
      name: s.skill_name,
      loggedHours: s.logged_hours,
      targetHours: s.target_hours,
      percentComplete: s.target_hours > 0 ? Math.round((s.logged_hours / s.target_hours) * 100) : 0,
    }));

    return {
      currentDate: format(now, 'yyyy-MM-dd'),
      wins: {
        total: wins.length,
        last30Days: recentWins.length,
        daysSinceLastWin,
        recentWinDescriptions: recentWins.slice(0, 5).map(w => w.description),
      },
      network: {
        totalContacts: contacts.length,
        contactedThisMonth,
        overdueContacts: overdueContacts.slice(0, 10),
      },
      applications: {
        total: applications.length,
        last30Days: recentApps.length,
        activeInterviews: applications.filter(a => a.status === 'Interview').length,
      },
      skills: skillsSummary,
    };
  }, [wins, contacts, applications, skills]);

  const generateBrief = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setShowAlternate(false);

    try {
      const { data, error } = await supabase.functions.invoke('weekly-brief', {
        body: { dataSnapshot },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setBrief(data as WeeklyBriefData);
    } catch (e) {
      console.error('Failed to generate weekly brief:', e);
      toast.error('Failed to generate brief. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, dataSnapshot]);

  const swapMove = () => setShowAlternate(prev => !prev);

  const currentMove = useMemo(() => {
    if (!brief) return null;
    return showAlternate
      ? { text: brief.alternateMove, category: brief.alternateMoveCategory }
      : { text: brief.oneMove, category: brief.oneMoveCategory };
  }, [brief, showAlternate]);

  return {
    brief,
    loading,
    generateBrief,
    swapMove,
    showAlternate,
    currentMove,
    dataSnapshot,
  };
}
