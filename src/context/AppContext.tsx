import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { JobPreferences, PriorityWeights, defaultPriorityWeights } from '@/lib/data';

export type UserMode = 'crush' | 'climb';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  theme_color: string;
  onboarding_complete: boolean;
  user_mode: UserMode | null;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  work_style: string | null;
  date_applied: string;
  notes: string | null;
  job_description: string | null;
  job_posting_url: string | null;
  resume_url: string | null;
  company_logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  industry: string | null;
  role_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  application_id: string | null;
  title: string;
  type: string;
  date: string;
  time: string | null;
  notes: string | null;
}

interface AppContextType {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  addApplication: (app: Omit<Application, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Application | null>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  addEvent: (event: Omit<Event, 'id' | 'user_id'>) => Promise<void>;
  jobPreferences: JobPreferences | null;
  updateJobPreferences: (preferences: Partial<JobPreferences>) => Promise<void>;
  loading: boolean;
  uploadResume: (applicationId: string, file: File) => Promise<string | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultJobPreferences: JobPreferences = {
  locations: [],
  remotePreference: 'flexible',
  companySizes: [],
  roleTypes: [],
  customRoleTypes: [],
  industries: [],
  customIndustries: [],
  workStyle: {
    pacePreference: 'moderate',
    collaborationStyle: 'mixed',
    managementPreference: 'supportive',
    growthPriority: 'learning',
  },
  salaryRange: { min: 0, max: 300000 },
  dealbreakers: [],
  additionalNotes: '',
  priorityWeights: defaultPriorityWeights,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobPreferences, setJobPreferences] = useState<JobPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data when authenticated
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setProfile(null);
      setApplications([]);
      setEvents([]);
      setJobPreferences(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch job preferences
      const { data: prefsData } = await supabase
        .from('job_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (prefsData) {
        const rawWeights = prefsData.priority_weights as Record<string, number> | null;
        const parsedWeights: PriorityWeights = rawWeights ? {
          location: rawWeights.location ?? 20,
          salary: rawWeights.salary ?? 25,
          roleType: rawWeights.roleType ?? 20,
          industry: rawWeights.industry ?? 15,
          companySize: rawWeights.companySize ?? 10,
          workStyle: rawWeights.workStyle ?? 10,
        } : defaultPriorityWeights;
        
        const prefs: JobPreferences = {
          locations: prefsData.locations || [],
          remotePreference: 'flexible',
          companySizes: (prefsData.company_sizes || []) as JobPreferences['companySizes'],
          roleTypes: prefsData.role_types || [],
          customRoleTypes: prefsData.custom_role_types || [],
          industries: prefsData.industries || [],
          customIndustries: prefsData.custom_industries || [],
          workStyle: {
            pacePreference: 'moderate',
            collaborationStyle: 'mixed',
            managementPreference: 'supportive',
            growthPriority: 'learning',
          },
          salaryRange: {
            min: prefsData.salary_min || 0,
            max: prefsData.salary_max || 300000,
          },
          dealbreakers: [],
          additionalNotes: prefsData.additional_notes || '',
          priorityWeights: parsedWeights,
        };
        setJobPreferences(prefs);
      } else {
        setJobPreferences(defaultJobPreferences);
      }

      // Fetch applications
      const { data: appsData } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (appsData) {
        setApplications(appsData as Application[]);
      }

      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (eventsData) {
        setEvents(eventsData as Event[]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }
  };

  const addApplication = async (app: Omit<Application, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Application | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('applications')
      .insert({ ...app, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setApplications((prev) => [data as Application, ...prev]);
      return data as Application;
    }
    return null;
  };

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    if (!user) return;

    const { error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
      );
    }
  };

  const deleteApplication = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setApplications((prev) => prev.filter((app) => app.id !== id));
    }
  };

  const addEvent = async (event: Omit<Event, 'id' | 'user_id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('events')
      .insert({ ...event, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setEvents((prev) => [...prev, data as Event]);
    }
  };

  const updateJobPreferences = async (preferences: Partial<JobPreferences>) => {
    if (!user) return;

    const updatedPrefs = { ...jobPreferences, ...preferences } as JobPreferences;
    
    const dbUpdate = {
      locations: updatedPrefs.locations,
      salary_min: updatedPrefs.salaryRange?.min || 0,
      salary_max: updatedPrefs.salaryRange?.max || 300000,
      role_types: updatedPrefs.roleTypes,
      custom_role_types: updatedPrefs.customRoleTypes,
      industries: updatedPrefs.industries,
      custom_industries: updatedPrefs.customIndustries,
      company_sizes: updatedPrefs.companySizes,
      work_styles: updatedPrefs.workStyle ? [
        updatedPrefs.workStyle.pacePreference,
        updatedPrefs.workStyle.collaborationStyle,
      ] : [],
      additional_notes: updatedPrefs.additionalNotes,
      priority_weights: updatedPrefs.priorityWeights as unknown as Record<string, number>,
    };

    const { error } = await supabase
      .from('job_preferences')
      .update(dbUpdate)
      .eq('user_id', user.id);

    if (!error) {
      setJobPreferences(updatedPrefs);
    }
  };

  const uploadResume = async (applicationId: string, file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${applicationId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading resume:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // Update application with resume URL
    await updateApplication(applicationId, { resume_url: fileName });

    return publicUrl;
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        applications,
        setApplications,
        addApplication,
        updateApplication,
        deleteApplication,
        events,
        setEvents,
        addEvent,
        jobPreferences,
        updateJobPreferences,
        loading,
        uploadResume,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
