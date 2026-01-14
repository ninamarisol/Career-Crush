import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingStep1 } from '@/components/onboarding/OnboardingStep1';
import { OnboardingStep2 } from '@/components/onboarding/OnboardingStep2';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { CardRetro } from '@/components/ui/card-retro';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Heart } from 'lucide-react';
import { DreamJobProfiler } from '@/components/profile/DreamJobProfiler';
import { JobPreferences, defaultPriorityWeights } from '@/lib/data';
import { toast } from 'sonner';

type ThemeColor = 'bubblegum' | 'electric' | 'minty' | 'sunset';

const defaultPreferences: JobPreferences = {
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
  salaryRange: { min: 0, max: 0 },
  dealbreakers: [],
  additionalNotes: '',
  priorityWeights: defaultPriorityWeights,
};

export default function Onboarding() {
  const { profile, updateProfile, updateJobPreferences, jobPreferences } = useApp();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile?.display_name || user?.user_metadata?.full_name || '');
  const [theme, setTheme] = useState<ThemeColor>('bubblegum');
  const [showDreamJobProfiler, setShowDreamJobProfiler] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<JobPreferences>(jobPreferences || defaultPreferences);

  const handleStep1Complete = () => {
    setStep(2);
  };

  const handleStep2Complete = async () => {
    // Save name and theme
    await updateProfile({
      display_name: name,
      theme_color: theme,
    });
    // Move to dream job profiler
    setShowDreamJobProfiler(true);
  };

  const handlePreferencesUpdate = (preferences: JobPreferences) => {
    setLocalPreferences(preferences);
  };

  const handleDreamJobComplete = async () => {
    await updateJobPreferences(localPreferences);
    await updateProfile({ onboarding_complete: true });
    toast.success('Welcome to Career Crush! 🎉');
  };

  if (showDreamJobProfiler) {
    return (
      <div className={`min-h-screen bg-background theme-${theme}`}>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2">Let's Find Your Dream Job! 🎯</h1>
            <p className="text-muted-foreground">Tell us what you're looking for</p>
          </div>
          <DreamJobProfiler
            preferences={localPreferences}
            onUpdate={handlePreferencesUpdate}
            onComplete={handleDreamJobComplete}
            isOnboarding={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background relative overflow-hidden theme-${theme}`}>
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 blob-pink blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 blob-yellow blur-3xl opacity-50" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Illustration */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-primary/20 border-2 border-border shadow-retro-xl flex items-center justify-center">
                <Briefcase className="w-24 h-24 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-secondary border-2 border-border shadow-retro flex items-center justify-center">
                <Heart className="w-8 h-8 text-secondary-foreground" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black">Career Crush</h1>
              <p className="text-muted-foreground mt-2">Your job search, organized.</p>
            </div>
          </div>

          {/* Right side - Form card */}
          <CardRetro className="p-8">
            <div className="md:hidden text-center mb-6">
              <h1 className="text-2xl font-black">Career Crush 💼</h1>
            </div>
            
            <ProgressBar currentStep={step} totalSteps={2} />

            <div className="mt-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <OnboardingStep1
                      name={name}
                      setName={setName}
                      onNext={handleStep1Complete}
                    />
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <OnboardingStep2
                      theme={theme}
                      setTheme={setTheme}
                      onNext={handleStep2Complete}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardRetro>
        </div>
      </div>
    </div>
  );
}
