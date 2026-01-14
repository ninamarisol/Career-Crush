import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Target, User, Palette, LogOut, Sun, Moon, Compass } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { ButtonRetro } from '@/components/ui/button-retro';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { MasterResumeBuilder } from '@/components/profile/MasterResumeBuilder';
import { DreamJobProfiler } from '@/components/profile/DreamJobProfiler';
import { CareerPather } from '@/components/profile/CareerPather';
import { MasterResume, JobPreferences, defaultPriorityWeights } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const tabs = [
  { id: 'resume', label: 'Master Resume', icon: FileText, emoji: '📄' },
  { id: 'preferences', label: 'Dream Job Profiler', icon: Target, emoji: '🎯' },
  { id: 'career', label: 'Career Pather', icon: Compass, emoji: '🧭' },
  { id: 'account', label: 'Account Settings', icon: User, emoji: '⚙️' },
];

type ThemeColorValue = 'bubblegum' | 'electric' | 'minty' | 'sky' | 'coral' | 'lavender' | 'peach' | 'rose';

const themeOptions: { value: ThemeColorValue; label: string; color: string; gradient: string }[] = [
  { value: 'bubblegum', label: 'Bubblegum', color: 'hsl(330, 100%, 70%)', gradient: 'linear-gradient(135deg, hsl(330, 100%, 97%) 0%, hsl(330, 100%, 85%) 100%)' },
  { value: 'electric', label: 'Electric', color: 'hsl(47, 100%, 55%)', gradient: 'linear-gradient(135deg, hsl(47, 100%, 97%) 0%, hsl(47, 100%, 80%) 100%)' },
  { value: 'minty', label: 'Minty', color: 'hsl(160, 60%, 45%)', gradient: 'linear-gradient(135deg, hsl(160, 60%, 97%) 0%, hsl(160, 60%, 80%) 100%)' },
  { value: 'sky', label: 'Sky', color: 'hsl(214, 100%, 60%)', gradient: 'linear-gradient(135deg, hsl(214, 100%, 97%) 0%, hsl(214, 100%, 85%) 100%)' },
  { value: 'coral', label: 'Coral', color: 'hsl(16, 100%, 65%)', gradient: 'linear-gradient(135deg, hsl(16, 100%, 97%) 0%, hsl(16, 100%, 85%) 100%)' },
  { value: 'lavender', label: 'Lavender', color: 'hsl(270, 70%, 65%)', gradient: 'linear-gradient(135deg, hsl(270, 70%, 97%) 0%, hsl(270, 70%, 85%) 100%)' },
  { value: 'peach', label: 'Peach', color: 'hsl(30, 100%, 70%)', gradient: 'linear-gradient(135deg, hsl(30, 100%, 97%) 0%, hsl(30, 100%, 85%) 100%)' },
  { value: 'rose', label: 'Rose', color: 'hsl(350, 90%, 65%)', gradient: 'linear-gradient(135deg, hsl(350, 90%, 97%) 0%, hsl(350, 90%, 85%) 100%)' },
];

const defaultResume: MasterResume = {
  summary: '',
  skills: [],
  experience: [],
  education: [],
  certifications: [],
};

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

export default function Profile() {
  const { profile, updateProfile, jobPreferences, updateJobPreferences } = useApp();
  const { signOut, user } = useAuth();
  const { theme, themeColor, toggleTheme, setThemeColor, previewThemeColor } = useTheme();
  const [activeTab, setActiveTab] = useState('resume');
  const [masterResume, setMasterResume] = useState<MasterResume>(defaultResume);

  const currentPreferences = jobPreferences || defaultPreferences;

  const updatePreferences = async (preferences: JobPreferences) => {
    await updateJobPreferences(preferences);
  };

  const handleThemeColorChange = async (color: ThemeColorValue) => {
    // Update theme immediately via context
    setThemeColor(color);
    // Also persist to database
    await updateProfile({ theme_color: color });
    toast.success('Theme updated!');
  };

  const updateName = async (displayName: string) => {
    await updateProfile({ display_name: displayName });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  // Calculate profile completion
  const calculateCompletion = () => {
    let completed = 0;
    let total = 6;

    if (masterResume.summary) completed++;
    if (masterResume.skills.length > 0) completed++;
    if (masterResume.experience.length > 0) completed++;
    if (currentPreferences.locations.length > 0 || currentPreferences.remotePreference !== 'flexible') completed++;
    if (currentPreferences.roleTypes.length > 0) completed++;
    if (currentPreferences.salaryRange.min > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            Your Profile 👤
          </h1>
          <p className="text-muted-foreground">
            Build your master resume and set your dream job preferences
          </p>
        </motion.div>

        {/* Profile Completion Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <CardRetro>
            <CardRetroContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">Profile Completion</span>
                <span className="text-lg font-black text-primary">{completionPercentage}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              {completionPercentage < 100 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Complete your profile to get better job match scores! ✨
                </p>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Tabs - Grid layout for better visibility */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {tabs.map((tab) => (
            <ButtonRetro
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center py-3 px-2 h-auto text-center"
              size="sm"
            >
              <span className="text-lg mb-1">{tab.emoji}</span>
              <span className="text-xs font-bold leading-tight">{tab.label}</span>
            </ButtonRetro>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'resume' && (
            <MasterResumeBuilder
              resume={masterResume}
              onUpdate={setMasterResume}
            />
          )}

          {activeTab === 'preferences' && (
            <DreamJobProfiler
              preferences={currentPreferences}
              onUpdate={updatePreferences}
            />
          )}

          {activeTab === 'career' && (
            <CareerPather
              resume={masterResume}
              preferences={jobPreferences}
            />
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Name */}
              <CardRetro>
                <CardRetroHeader>
                  <CardRetroTitle>👋 Your Name</CardRetroTitle>
                </CardRetroHeader>
                <CardRetroContent>
                  <input
                    type="text"
                    value={profile?.display_name || ''}
                    onChange={(e) => updateName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-card focus:border-primary focus:outline-none font-medium"
                    placeholder="Enter your name"
                  />
                </CardRetroContent>
              </CardRetro>

              {/* Email */}
              <CardRetro>
                <CardRetroHeader>
                  <CardRetroTitle>📧 Email</CardRetroTitle>
                </CardRetroHeader>
                <CardRetroContent>
                  <p className="text-muted-foreground">{user?.email || 'No email'}</p>
                </CardRetroContent>
              </CardRetro>

              {/* Dark Mode Toggle */}
              <CardRetro>
                <CardRetroHeader>
                  <CardRetroTitle>
                    {theme === 'dark' ? <Moon className="w-5 h-5 inline mr-2" /> : <Sun className="w-5 h-5 inline mr-2" />}
                    Appearance
                  </CardRetroTitle>
                </CardRetroHeader>
                <CardRetroContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                      <p className="text-sm text-muted-foreground">
                        {theme === 'dark' ? 'Deep, immersive colors' : 'Bright, vibrant gradients'}
                      </p>
                    </div>
                    <ButtonRetro
                      variant="outline"
                      onClick={toggleTheme}
                      className="gap-2"
                    >
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {theme === 'dark' ? 'Light' : 'Dark'}
                    </ButtonRetro>
                  </div>
                </CardRetroContent>
              </CardRetro>

              {/* Theme Selection with Live Preview */}
              <CardRetro>
                <CardRetroHeader>
                  <CardRetroTitle>
                    <Palette className="w-5 h-5 inline mr-2" />
                    Theme Color
                  </CardRetroTitle>
                </CardRetroHeader>
                <CardRetroContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hover to preview, click to apply
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {themeOptions.map((themeOpt) => (
                      <button
                        key={themeOpt.value}
                        onClick={() => handleThemeColorChange(themeOpt.value)}
                        onMouseEnter={() => previewThemeColor(themeOpt.value)}
                        onMouseLeave={() => previewThemeColor(null)}
                        className={cn(
                          "group p-3 rounded-xl border-2 transition-all text-center relative overflow-hidden",
                          themeColor === themeOpt.value
                            ? "border-primary shadow-retro scale-105"
                            : "border-border hover:border-primary/50 hover:scale-105"
                        )}
                      >
                        {/* Preview gradient background */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                          style={{ background: themeOpt.gradient }}
                        />
                        <div
                          className="w-10 h-10 rounded-full mx-auto mb-2 border-2 shadow-sm transition-transform group-hover:scale-110"
                          style={{ 
                            backgroundColor: themeOpt.color,
                            borderColor: themeOpt.color
                          }}
                        />
                        <span className="font-bold text-xs">{themeOpt.label}</span>
                        {themeColor === themeOpt.value && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardRetroContent>
              </CardRetro>

              {/* Sign Out */}
              <CardRetro>
                <CardRetroHeader>
                  <CardRetroTitle>🚪 Sign Out</CardRetroTitle>
                </CardRetroHeader>
                <CardRetroContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign out of your account. Your data will be saved.
                  </p>
                  <ButtonRetro
                    variant="outline"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </ButtonRetro>
                </CardRetroContent>
              </CardRetro>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}