import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Building2, Briefcase, Factory, Heart, DollarSign, AlertTriangle, ChevronRight, ChevronLeft, Check, Plus, X, MessageSquare, SlidersHorizontal } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { Slider } from '@/components/ui/slider';
import { JobPreferences, PriorityWeights, regionOptions, companySizeOptions, industryOptions, roleTypeOptions, defaultPriorityWeights } from '@/lib/data';
import { cn } from '@/lib/utils';

interface DreamJobProfilerProps {
  preferences: JobPreferences;
  onUpdate: (preferences: JobPreferences) => void;
  onComplete?: () => void;
  isOnboarding?: boolean;
}

const surveySteps = [
  { id: 'locations', title: 'Where do you want to work?', icon: MapPin, emoji: '📍' },
  { id: 'company', title: 'What size company?', icon: Building2, emoji: '🏢' },
  { id: 'roles', title: 'What type of roles?', icon: Briefcase, emoji: '💼' },
  { id: 'industries', title: 'Which industries interest you?', icon: Factory, emoji: '🏭' },
  { id: 'workstyle', title: "What's your work style?", icon: Heart, emoji: '💖' },
  { id: 'salary', title: 'Salary expectations?', icon: DollarSign, emoji: '💰' },
  { id: 'dealbreakers', title: 'Any dealbreakers?', icon: AlertTriangle, emoji: '🚫' },
  { id: 'notes', title: 'Anything else we should know?', icon: MessageSquare, emoji: '📝' },
  { id: 'priorities', title: 'Set your priorities', icon: SlidersHorizontal, emoji: '⚖️' },
];

const priorityLabels: { key: keyof PriorityWeights; label: string; emoji: string; description: string }[] = [
  { key: 'location', label: 'Location', emoji: '📍', description: 'How important is working in your preferred region?' },
  { key: 'salary', label: 'Salary', emoji: '💰', description: 'How much does compensation matter?' },
  { key: 'roleType', label: 'Role Type', emoji: '💼', description: 'How important is matching your target role?' },
  { key: 'industry', label: 'Industry', emoji: '🏭', description: 'How much does the industry sector matter?' },
  { key: 'companySize', label: 'Company Size', emoji: '🏢', description: 'How important is company size preference?' },
  { key: 'workStyle', label: 'Work Style', emoji: '💖', description: 'How much does work culture/style matter?' },
];

export function DreamJobProfiler({ preferences, onUpdate, onComplete, isOnboarding = false }: DreamJobProfilerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [customIndustryInput, setCustomIndustryInput] = useState('');

  // Ensure all array fields exist with defaults
  const safePreferences = {
    ...preferences,
    locations: preferences.locations || [],
    companySizes: preferences.companySizes || [],
    roleTypes: preferences.roleTypes || [],
    customRoleTypes: preferences.customRoleTypes || [],
    industries: preferences.industries || [],
    customIndustries: preferences.customIndustries || [],
    dealbreakers: preferences.dealbreakers || [],
    additionalNotes: preferences.additionalNotes || '',
    priorityWeights: preferences.priorityWeights || defaultPriorityWeights,
  };

  const weights = safePreferences.priorityWeights;
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  const toggleArrayItem = (field: keyof JobPreferences, item: string) => {
    const array = (safePreferences[field] as string[]) || [];
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    onUpdate({ ...safePreferences, [field]: newArray });
  };

  const addCustomRole = () => {
    if (customRoleInput.trim() && !safePreferences.customRoleTypes.includes(customRoleInput.trim())) {
      onUpdate({
        ...safePreferences,
        customRoleTypes: [...safePreferences.customRoleTypes, customRoleInput.trim()],
      });
      setCustomRoleInput('');
    }
  };

  const removeCustomRole = (role: string) => {
    onUpdate({
      ...safePreferences,
      customRoleTypes: safePreferences.customRoleTypes.filter(r => r !== role),
    });
  };

  const addCustomIndustry = () => {
    if (customIndustryInput.trim() && !safePreferences.customIndustries.includes(customIndustryInput.trim())) {
      onUpdate({
        ...safePreferences,
        customIndustries: [...safePreferences.customIndustries, customIndustryInput.trim()],
      });
      setCustomIndustryInput('');
    }
  };

  const removeCustomIndustry = (industry: string) => {
    onUpdate({
      ...safePreferences,
      customIndustries: safePreferences.customIndustries.filter(i => i !== industry),
    });
  };

  const toggleCompanySize = (size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise') => {
    const newSizes = safePreferences.companySizes.includes(size)
      ? safePreferences.companySizes.filter(s => s !== size)
      : [...safePreferences.companySizes, size];
    onUpdate({ ...safePreferences, companySizes: newSizes });
  };

  const updateWorkStyle = (field: keyof JobPreferences['workStyle'], value: string) => {
    onUpdate({
      ...safePreferences,
      workStyle: { ...safePreferences.workStyle, [field]: value },
    });
  };

  const updatePriorityWeight = (key: keyof PriorityWeights, newValue: number) => {
    const currentWeights = { ...weights };
    const oldValue = currentWeights[key];
    const diff = newValue - oldValue;
    
    // Calculate adjustment needed for other weights
    const otherKeys = Object.keys(currentWeights).filter(k => k !== key) as (keyof PriorityWeights)[];
    const otherTotal = otherKeys.reduce((sum, k) => sum + currentWeights[k], 0);
    
    if (otherTotal > 0 && diff !== 0) {
      // Proportionally adjust other weights
      otherKeys.forEach(k => {
        const proportion = currentWeights[k] / otherTotal;
        currentWeights[k] = Math.max(0, Math.round(currentWeights[k] - (diff * proportion)));
      });
    }
    
    currentWeights[key] = newValue;
    
    // Ensure total is exactly 100
    const newTotal = Object.values(currentWeights).reduce((sum, w) => sum + w, 0);
    if (newTotal !== 100 && otherKeys.length > 0) {
      const adjustment = 100 - newTotal;
      // Add adjustment to largest other weight
      const largestKey = otherKeys.reduce((a, b) => currentWeights[a] >= currentWeights[b] ? a : b);
      currentWeights[largestKey] = Math.max(0, currentWeights[largestKey] + adjustment);
    }
    
    onUpdate({ ...safePreferences, priorityWeights: currentWeights });
  };

  const resetWeights = () => {
    onUpdate({ ...safePreferences, priorityWeights: { ...defaultPriorityWeights } });
  };

  const nextStep = () => {
    if (currentStep < surveySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (surveySteps[currentStep].id) {
      case 'locations':
        return (
          <div className="space-y-6">
            <div>
              <p className="font-bold mb-3">🏠 Remote Preference</p>
              <div className="flex flex-wrap gap-2">
                {['remote', 'hybrid', 'onsite', 'flexible'].map((pref) => (
                  <button
                    key={pref}
                    onClick={() => onUpdate({ ...safePreferences, remotePreference: pref as 'remote' | 'hybrid' | 'onsite' | 'flexible' })}
                    className={cn(
                      "px-4 py-2 rounded-full border-2 font-medium transition-all",
                      safePreferences.remotePreference === pref
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {pref === 'remote' && '🏠 Remote Only'}
                    {pref === 'hybrid' && '🔄 Hybrid'}
                    {pref === 'onsite' && '🏢 On-site'}
                    {pref === 'flexible' && '✨ Flexible'}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <p className="font-bold mb-3">🗺️ Select your preferred regions:</p>
              <p className="text-sm text-muted-foreground mb-4">Choose all regions where you'd be willing to work</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {regionOptions.map((region) => (
                  <button
                    key={region.value}
                    onClick={() => toggleArrayItem('locations', region.value)}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left transition-all",
                      safePreferences.locations.includes(region.value)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{region.emoji}</span>
                      <span className="font-medium">{region.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-7">{region.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companySizeOptions.map((size) => (
              <button
                key={size.value}
                onClick={() => toggleCompanySize(size.value as 'startup' | 'small' | 'medium' | 'large' | 'enterprise')}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  safePreferences.companySizes.includes(size.value as 'startup' | 'small' | 'medium' | 'large' | 'enterprise')
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-2xl">{size.emoji}</span>
                <p className="font-bold mt-2">{size.label}</p>
              </button>
            ))}
          </div>
        );

      case 'roles':
        return (
          <div className="space-y-6">
            {/* Custom Roles */}
            {safePreferences.customRoleTypes.length > 0 && (
              <div>
                <p className="text-sm font-bold text-muted-foreground mb-2">Your Custom Roles:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {safePreferences.customRoleTypes.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 text-primary text-sm font-medium"
                    >
                      {role}
                      <button
                        onClick={() => removeCustomRole(role)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Role */}
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-2">Add a custom role:</p>
              <div className="flex gap-2">
                <InputRetro
                  placeholder="e.g., Content Strategist"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomRole()}
                />
                <ButtonRetro onClick={addCustomRole} size="sm">
                  <Plus className="w-4 h-4" />
                </ButtonRetro>
              </div>
            </div>

            {/* Preset Roles */}
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-2">Or select from common roles:</p>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {roleTypeOptions.map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleArrayItem('roleTypes', role)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all",
                      safePreferences.roleTypes.includes(role)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'industries':
        return (
          <div className="space-y-6">
            {/* Custom Industries */}
            {safePreferences.customIndustries.length > 0 && (
              <div>
                <p className="text-sm font-bold text-muted-foreground mb-2">Your Custom Industries:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {safePreferences.customIndustries.map((industry) => (
                    <span
                      key={industry}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 text-primary text-sm font-medium"
                    >
                      {industry}
                      <button
                        onClick={() => removeCustomIndustry(industry)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Industry */}
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-2">Add a custom industry:</p>
              <div className="flex gap-2">
                <InputRetro
                  placeholder="e.g., Space Exploration"
                  value={customIndustryInput}
                  onChange={(e) => setCustomIndustryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomIndustry()}
                />
                <ButtonRetro onClick={addCustomIndustry} size="sm">
                  <Plus className="w-4 h-4" />
                </ButtonRetro>
              </div>
            </div>

            {/* Preset Industries */}
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-2">Or select from common industries:</p>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {industryOptions.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => toggleArrayItem('industries', industry)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all",
                      safePreferences.industries.includes(industry)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'workstyle':
        return (
          <div className="space-y-6">
            {/* Pace Preference */}
            <div>
              <p className="font-bold mb-3">⚡ Work Pace</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'fast', label: 'Fast-paced & dynamic', emoji: '🚀' },
                  { value: 'moderate', label: 'Balanced rhythm', emoji: '⚖️' },
                  { value: 'relaxed', label: 'Steady & methodical', emoji: '🧘' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateWorkStyle('pacePreference', option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                      safePreferences.workStyle.pacePreference === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option.emoji} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Collaboration Style */}
            <div>
              <p className="font-bold mb-3">👥 Collaboration Style</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'independent', label: 'Independent work', emoji: '🦅' },
                  { value: 'collaborative', label: 'Team-focused', emoji: '🤝' },
                  { value: 'mixed', label: 'Mix of both', emoji: '🔄' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateWorkStyle('collaborationStyle', option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                      safePreferences.workStyle.collaborationStyle === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option.emoji} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Management Preference */}
            <div>
              <p className="font-bold mb-3">👔 Management Style</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'hands-off', label: 'Autonomous', emoji: '🦋' },
                  { value: 'supportive', label: 'Mentorship-driven', emoji: '🌱' },
                  { value: 'structured', label: 'Clear direction', emoji: '📋' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateWorkStyle('managementPreference', option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                      safePreferences.workStyle.managementPreference === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option.emoji} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Growth Priority */}
            <div>
              <p className="font-bold mb-3">🎯 What matters most?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'learning', label: 'Learning & skill growth', emoji: '📚' },
                  { value: 'advancement', label: 'Career advancement', emoji: '📈' },
                  { value: 'stability', label: 'Job security', emoji: '🏠' },
                  { value: 'impact', label: 'Making an impact', emoji: '🌍' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateWorkStyle('growthPriority', option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                      safePreferences.workStyle.growthPriority === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option.emoji} {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'salary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-muted-foreground mb-2 block">
                  Minimum Salary
                </label>
                <InputRetro
                  type="number"
                  placeholder="e.g., 80000"
                  value={safePreferences.salaryRange.min || ''}
                  onChange={(e) => onUpdate({
                    ...safePreferences,
                    salaryRange: { ...safePreferences.salaryRange, min: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-muted-foreground mb-2 block">
                  Maximum Salary
                </label>
                <InputRetro
                  type="number"
                  placeholder="e.g., 150000"
                  value={safePreferences.salaryRange.max || ''}
                  onChange={(e) => onUpdate({
                    ...safePreferences,
                    salaryRange: { ...safePreferences.salaryRange, max: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                💡 <strong>Tip:</strong> Be realistic but don't undersell yourself. Research market rates for your role and experience level.
              </p>
            </div>
          </div>
        );

      case 'dealbreakers':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select any factors that would make you decline a job offer:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'No remote option',
                'Long commute',
                'Frequent travel',
                'On-call requirements',
                'Below market pay',
                'No growth opportunities',
                'Poor work-life balance',
                'Outdated tech stack',
                'Micromanagement culture',
                'No benefits/401k',
                'Limited PTO',
                'No equity/stock options',
                'Open office only',
                'Rigid hours',
                'High turnover',
              ].map((dealbreaker) => (
                <button
                  key={dealbreaker}
                    onClick={() => toggleArrayItem('dealbreakers', dealbreaker)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all",
                      safePreferences.dealbreakers.includes(dealbreaker)
                        ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border hover:border-destructive/50"
                  )}
                >
                  {dealbreaker}
                </button>
              ))}
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Share any additional thoughts about your dream job, work style preferences, or anything else that matters to you:
            </p>
            <textarea
              className="w-full min-h-[200px] p-4 rounded-lg border-2 border-border bg-background font-medium focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="For example:&#10;• I value a company with a strong mission and values&#10;• Looking for opportunities to transition into leadership&#10;• Prefer asynchronous communication&#10;• Want to work on consumer-facing products&#10;• Need flexible hours to accommodate family responsibilities&#10;• Looking for mentorship opportunities..."
              value={safePreferences.additionalNotes}
              onChange={(e) => onUpdate({ ...safePreferences, additionalNotes: e.target.value })}
            />
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                💡 <strong>Tip:</strong> The more you share, the better we can help you find your dream job match!
              </p>
            </div>
          </div>
        );

      case 'priorities':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold">
                  Adjust how much each factor impacts your match score
                </p>
                <span className={cn(
                  "text-lg font-black px-3 py-1 rounded-full",
                  totalWeight === 100 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                )}>
                  {totalWeight}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Total must equal 100%. Sliders will auto-adjust to maintain the total.
              </p>
            </div>

            <div className="space-y-6">
              {priorityLabels.map((priority) => (
                <div key={priority.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{priority.emoji}</span>
                      <span className="font-bold">{priority.label}</span>
                    </div>
                    <span className="text-lg font-black text-primary min-w-[3rem] text-right">
                      {weights[priority.key]}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{priority.description}</p>
                  <Slider
                    value={[weights[priority.key]]}
                    onValueChange={(value) => updatePriorityWeight(priority.key, value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <ButtonRetro variant="outline" size="sm" onClick={resetWeights}>
                Reset to Defaults
              </ButtonRetro>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-black mb-2">Profile Complete! 🎉</h3>
        <p className="text-muted-foreground mb-6">
          Your dream job preferences have been saved. We'll use these to calculate match scores for your applications.
        </p>
        <ButtonRetro onClick={() => { setIsCompleted(false); setCurrentStep(0); }}>
          Edit Preferences
        </ButtonRetro>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {surveySteps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              index <= currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Current step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <CardRetro>
            <CardRetroHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{surveySteps[currentStep].emoji}</span>
                <CardRetroTitle>{surveySteps[currentStep].title}</CardRetroTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStep + 1} of {surveySteps.length}
              </p>
            </CardRetroHeader>
            <CardRetroContent>
              {renderStepContent()}
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <ButtonRetro
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </ButtonRetro>
        <ButtonRetro onClick={nextStep}>
          {currentStep === surveySteps.length - 1 ? 'Complete' : 'Next'}
          {currentStep < surveySteps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
        </ButtonRetro>
      </div>
    </div>
  );
}
