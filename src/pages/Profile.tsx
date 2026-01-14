import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Target, User, Palette } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ButtonRetro } from '@/components/ui/button-retro';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { MasterResumeBuilder } from '@/components/profile/MasterResumeBuilder';
import { DreamJobProfiler } from '@/components/profile/DreamJobProfiler';
import { MasterResume, JobPreferences } from '@/lib/data';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'resume', label: 'Master Resume', icon: FileText, emoji: '📄' },
  { id: 'preferences', label: 'Dream Job Profiler', icon: Target, emoji: '🎯' },
  { id: 'account', label: 'Account Settings', icon: User, emoji: '⚙️' },
];

const themeOptions = [
  { value: 'bubblegum', label: 'Bubblegum', color: 'hsl(330, 85%, 60%)' },
  { value: 'electric', label: 'Electric', color: 'hsl(45, 95%, 55%)' },
  { value: 'minty', label: 'Minty', color: 'hsl(165, 75%, 45%)' },
  { value: 'sky', label: 'Sky', color: 'hsl(200, 85%, 55%)' },
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
};

export default function Profile() {
  const { user, setUser } = useApp();
  const [activeTab, setActiveTab] = useState('resume');

  const masterResume = user?.masterResume || defaultResume;
  const jobPreferences = user?.jobPreferences || defaultPreferences;

  const updateResume = (resume: MasterResume) => {
    if (user) {
      setUser({ ...user, masterResume: resume });
    }
  };

  const updatePreferences = (preferences: JobPreferences) => {
    if (user) {
      setUser({ ...user, jobPreferences: preferences });
    }
  };

  const updateTheme = (themeColor: 'bubblegum' | 'electric' | 'minty' | 'sky') => {
    if (user) {
      setUser({ ...user, themeColor });
    }
  };

  const updateName = (name: string) => {
    if (user) {
      setUser({ ...user, name });
    }
  };

  // Calculate profile completion
  const calculateCompletion = () => {
    let completed = 0;
    let total = 6;

    if (masterResume.summary) completed++;
    if (masterResume.skills.length > 0) completed++;
    if (masterResume.experience.length > 0) completed++;
    if (jobPreferences.locations.length > 0 || jobPreferences.remotePreference !== 'flexible') completed++;
    if (jobPreferences.roleTypes.length > 0) completed++;
    if (jobPreferences.salaryRange.min > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-background">
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <ButtonRetro
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap"
            >
              <span className="mr-2">{tab.emoji}</span>
              {tab.label}
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
              onUpdate={updateResume}
            />
          )}

          {activeTab === 'preferences' && (
            <DreamJobProfiler
              preferences={jobPreferences}
              onUpdate={updatePreferences}
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
                    value={user?.name || ''}
                    onChange={(e) => updateName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none font-medium"
                    placeholder="Enter your name"
                  />
                </CardRetroContent>
              </CardRetro>

              {/* Theme Selection */}
              <CardRetro>
                <CardRetroHeader>
                  <CardRetroTitle>
                    <Palette className="w-5 h-5 inline mr-2" />
                    Theme Color
                  </CardRetroTitle>
                </CardRetroHeader>
                <CardRetroContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {themeOptions.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => updateTheme(theme.value as any)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center",
                          user?.themeColor === theme.value
                            ? "border-primary shadow-retro"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div
                          className="w-10 h-10 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: theme.color }}
                        />
                        <span className="font-bold text-sm">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </CardRetroContent>
              </CardRetro>

              {/* Statistics */}
              <CardRetro>
                <CardRetroHeader>
                  <CardRetroTitle>📊 Your Stats</CardRetroTitle>
                </CardRetroHeader>
                <CardRetroContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-3xl font-black text-primary">{user?.weeklyStreak || 0}</p>
                      <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-3xl font-black text-primary">{masterResume.skills.length}</p>
                      <p className="text-sm text-muted-foreground">Skills Listed</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-3xl font-black text-primary">{masterResume.experience.length}</p>
                      <p className="text-sm text-muted-foreground">Experiences</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-3xl font-black text-primary">{jobPreferences.roleTypes.length}</p>
                      <p className="text-sm text-muted-foreground">Target Roles</p>
                    </div>
                  </div>
                </CardRetroContent>
              </CardRetro>

              {/* Reset Data */}
              <CardRetro>
                <CardRetroHeader>
                  <CardRetroTitle>⚠️ Danger Zone</CardRetroTitle>
                </CardRetroHeader>
                <CardRetroContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reset all your data and start fresh. This action cannot be undone.
                  </p>
                  <ButtonRetro
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                  >
                    Reset All Data
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
