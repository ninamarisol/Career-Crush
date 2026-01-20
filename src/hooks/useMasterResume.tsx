import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MasterResume } from '@/lib/data';

export function useMasterResume() {
  const { user } = useAuth();

  const { data: masterResume, isLoading } = useQuery({
    queryKey: ['master-resume', user?.id],
    queryFn: async (): Promise<MasterResume | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('master_resumes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching master resume:', error);
        return null;
      }

      if (data) {
        return {
          summary: (data.personal_info as { summary?: string })?.summary || '',
          skills: (data.skills as string[]) || [],
          experience: (data.work_experience as MasterResume['experience']) || [],
          education: (data.education as MasterResume['education']) || [],
          certifications: (data.certifications as string[]) || [],
          projects: (data.projects as MasterResume['projects']) || [],
        };
      }

      return null;
    },
    enabled: !!user?.id,
  });

  const defaultMasterResume: MasterResume = {
    summary: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  };

  return {
    masterResume: masterResume || defaultMasterResume,
    isLoading,
    hasResume: !!masterResume && (
      masterResume.summary !== '' ||
      masterResume.skills.length > 0 ||
      masterResume.experience.length > 0
    ),
  };
}
