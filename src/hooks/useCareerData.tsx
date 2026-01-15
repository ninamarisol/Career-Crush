import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CareerWin {
  id: string;
  user_id: string;
  description: string;
  impact: string | null;
  win_date: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface SkillTracking {
  id: string;
  user_id: string;
  skill_name: string;
  category: string;
  target_hours: number;
  logged_hours: number;
  created_at: string;
  updated_at: string;
}

export interface CareerGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  progress: number;
  deadline: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useCareerData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch career wins
  const { data: wins = [], isLoading: winsLoading } = useQuery({
    queryKey: ['career-wins', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('career_wins')
        .select('*')
        .eq('user_id', user.id)
        .order('win_date', { ascending: false });
      if (error) throw error;
      return data as CareerWin[];
    },
    enabled: !!user?.id,
  });

  // Fetch skills
  const { data: skills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ['skill-tracking', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('skill_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SkillTracking[];
    },
    enabled: !!user?.id,
  });

  // Fetch career goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['career-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('deadline', { ascending: true });
      if (error) throw error;
      return data as CareerGoal[];
    },
    enabled: !!user?.id,
  });

  // Add a win
  const addWin = useMutation({
    mutationFn: async (data: { description: string; impact?: string; category?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('career_wins').insert({
        user_id: user.id,
        description: data.description,
        impact: data.impact || null,
        category: data.category || 'general',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-wins'] });
      toast.success('Win logged! 🎉');
    },
    onError: () => {
      toast.error('Failed to log win');
    },
  });

  // Add a skill
  const addSkill = useMutation({
    mutationFn: async (data: { skill_name: string; category?: string; target_hours?: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('skill_tracking').insert({
        user_id: user.id,
        skill_name: data.skill_name,
        category: data.category || 'Technical',
        target_hours: data.target_hours || 20,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-tracking'] });
      toast.success('Skill added!');
    },
    onError: () => {
      toast.error('Failed to add skill');
    },
  });

  // Log hours to a skill
  const logSkillHours = useMutation({
    mutationFn: async ({ skillId, hours }: { skillId: string; hours: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const skill = skills.find(s => s.id === skillId);
      if (!skill) throw new Error('Skill not found');
      
      const { error } = await supabase
        .from('skill_tracking')
        .update({ logged_hours: skill.logged_hours + hours })
        .eq('id', skillId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-tracking'] });
      toast.success('Hours logged!');
    },
    onError: () => {
      toast.error('Failed to log hours');
    },
  });

  // Add a goal
  const addGoal = useMutation({
    mutationFn: async (data: { title: string; description?: string; deadline?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('career_goals').insert({
        user_id: user.id,
        title: data.title,
        description: data.description || null,
        deadline: data.deadline || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      toast.success('Goal added!');
    },
    onError: () => {
      toast.error('Failed to add goal');
    },
  });

  // Update goal progress
  const updateGoalProgress = useMutation({
    mutationFn: async ({ goalId, progress }: { goalId: string; progress: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('career_goals')
        .update({ 
          progress: Math.min(100, Math.max(0, progress)),
          status: progress >= 100 ? 'completed' : 'active'
        })
        .eq('id', goalId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      toast.success('Progress updated!');
    },
    onError: () => {
      toast.error('Failed to update progress');
    },
  });

  return {
    wins,
    skills,
    goals,
    isLoading: winsLoading || skillsLoading || goalsLoading,
    addWin,
    addSkill,
    logSkillHours,
    addGoal,
    updateGoalProgress,
  };
}
