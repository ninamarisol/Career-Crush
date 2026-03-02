import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { invokeAuthedFunction } from '@/lib/cloudFunctions';
export interface CareerTarget {
  id: string;
  user_id: string;
  role_title: string;
  time_in_role: string;
  target_destination: string;
  timeline: string;
  biggest_blocker: string;
  blocker_custom_text: string | null;
  review_cycle: string | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizAnswers {
  roleTitle: string;
  timeInRole: string;
  targetDestination: string;
  timeline: string;
  biggestBlocker: string;
  blockerCustomText?: string;
  reviewCycle?: string;
}

export function useCareerTarget() {
  const { user } = useAuth();
  const [careerTarget, setCareerTarget] = useState<CareerTarget | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTarget = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data } = await supabase
        .from('career_targets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setCareerTarget(data as CareerTarget | null);
    } catch (e) {
      console.error('Error fetching career target:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTarget(); }, [fetchTarget]);

  const generateSummary = async (answers: QuizAnswers): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('career-target-summary', {
        body: { quizAnswers: answers },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.summary || null;
    } catch (e: any) {
      console.error('Summary generation error:', e);
      toast.error(e.message || 'Failed to generate summary');
      return null;
    }
  };

  const saveTarget = async (answers: QuizAnswers, summary: string) => {
    if (!user) return;
    try {
      const payload = {
        user_id: user.id,
        role_title: answers.roleTitle,
        time_in_role: answers.timeInRole,
        target_destination: answers.targetDestination,
        timeline: answers.timeline,
        biggest_blocker: answers.biggestBlocker,
        blocker_custom_text: answers.blockerCustomText || null,
        review_cycle: answers.reviewCycle || null,
        ai_summary: summary,
      };

      const { data, error } = await supabase
        .from('career_targets')
        .upsert(payload as any, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      setCareerTarget(data as CareerTarget);
      toast.success('Career target saved!');
    } catch (e: any) {
      console.error('Save target error:', e);
      toast.error('Failed to save career target');
    }
  };

  const deleteTarget = async () => {
    if (!user) return;
    try {
      await supabase.from('career_targets').delete().eq('user_id', user.id);
      setCareerTarget(null);
    } catch (e) {
      console.error('Delete target error:', e);
    }
  };

  return {
    careerTarget,
    loading,
    generateSummary,
    saveTarget,
    deleteTarget,
    refetch: fetchTarget,
  };
}
