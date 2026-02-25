import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface JobSearchContext {
  id: string;
  user_id: string;
  search_stage: string;
  target_role: string;
  target_companies: string | null;
  friction_type: string;
  urgency: string;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrushQuizAnswers {
  searchStage: string;
  targetRole: string;
  targetCompanies: string;
  frictionType: string;
  urgency: string;
}

export function useCrushContext() {
  const { user } = useAuth();
  const [context, setContext] = useState<JobSearchContext | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContext = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data } = await supabase
        .from('job_search_context')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setContext(data as JobSearchContext | null);
    } catch (e) {
      console.error('Error fetching crush context:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchContext(); }, [fetchContext]);

  const generateSummary = useCallback(async (answers: CrushQuizAnswers): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('crush-context-summary', {
        body: { answers },
      });
      if (error) throw error;
      return data?.summary || null;
    } catch (e) {
      console.error('Failed to generate crush summary:', e);
      return null;
    }
  }, []);

  const saveContext = useCallback(async (answers: CrushQuizAnswers, summary: string) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      search_stage: answers.searchStage,
      target_role: answers.targetRole,
      target_companies: answers.targetCompanies || null,
      friction_type: answers.frictionType,
      urgency: answers.urgency,
      ai_summary: summary,
    };

    const { data, error } = await supabase
      .from('job_search_context')
      .upsert(payload as any, { onConflict: 'user_id' })
      .select()
      .single();

    if (!error && data) {
      setContext(data as JobSearchContext);
    }
  }, [user]);

  const deleteContext = useCallback(async () => {
    if (!user) return;
    await supabase.from('job_search_context').delete().eq('user_id', user.id);
    setContext(null);
  }, [user]);

  return { context, loading, generateSummary, saveContext, deleteContext };
}
