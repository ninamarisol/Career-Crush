import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, GraduationCap, UserX, RefreshCw, Clock,
  Target, Zap, Users, BookOpen, Scale,
  Hash, TrendingUp, Calendar, Star,
  PartyPopper, Bell, Share2, EyeOff,
  ChevronRight, ChevronLeft, Check
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { cn } from '@/lib/utils';

interface GoalsSetupProps {
  onComplete: (setup: {
    situation: string;
    focus: string;
    weekly_hours: number;
    motivation_style: string;
    celebration_style: string;
  }) => Promise<void>;
  isEdit?: boolean;
  initialValues?: any;
}

const situationOptions = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Graduating soon' },
  { value: 'employed', label: 'Employed', icon: Briefcase, desc: 'Stealth mode search' },
  { value: 'laid_off', label: 'Recently Laid Off', icon: UserX, desc: 'Urgent search' },
  { value: 'career_switch', label: 'Career Switcher', icon: RefreshCw, desc: 'Taking time to prepare' },
  { value: 'between_opportunities', label: 'Between Jobs', icon: Clock, desc: 'Flexible timing' },
];

const focusOptions = [
  { value: 'maximum', label: 'Maximum Applications', icon: Zap, desc: 'Cast a wide net' },
  { value: 'targeted', label: 'Targeted Applications', icon: Target, desc: 'Quality over quantity' },
  { value: 'networking', label: 'Networking', icon: Users, desc: 'Build relationships' },
  { value: 'interview_prep', label: 'Interview Prep', icon: BookOpen, desc: 'Skill building' },
  { value: 'balanced', label: 'Balanced Approach', icon: Scale, desc: 'A bit of everything' },
];

const hoursOptions = [
  { value: 4, label: '2-4 hours', desc: 'Student/Employed' },
  { value: 8, label: '5-10 hours', desc: 'Part-time search' },
  { value: 15, label: '10-20 hours', desc: 'Active search' },
  { value: 25, label: '20+ hours', desc: 'Full-time search' },
];

const motivationOptions = [
  { value: 'numbers', label: 'Hitting Numbers', icon: Hash, desc: '"10 apps this week"' },
  { value: 'improvement', label: 'Self-Improvement', icon: TrendingUp, desc: '"Beat last week"' },
  { value: 'consistency', label: 'Staying Consistent', icon: Calendar, desc: '"Daily progress"' },
  { value: 'quality', label: 'Quality Metrics', icon: Star, desc: '"Higher match scores"' },
];

const celebrationOptions = [
  { value: 'big_loud', label: 'Big & Loud', icon: PartyPopper, desc: 'Confetti, animations!' },
  { value: 'subtle', label: 'Subtle', icon: Bell, desc: 'Quiet achievements' },
  { value: 'share_worthy', label: 'Share-Worthy', icon: Share2, desc: 'LinkedIn-ready graphics' },
  { value: 'private', label: 'Private', icon: EyeOff, desc: 'Just track it quietly' },
];

export function GoalsSetup({ onComplete, isEdit, initialValues }: GoalsSetupProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState({
    situation: initialValues?.situation || 'between_opportunities',
    focus: initialValues?.focus || 'balanced',
    weekly_hours: initialValues?.weekly_hours || 8,
    motivation_style: initialValues?.motivation_style || 'improvement',
    celebration_style: initialValues?.celebration_style || 'subtle',
  });

  const totalSteps = 5;

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("min-h-screen p-6", isEdit && "min-h-0")}>
      <div className="max-w-2xl mx-auto">
        {!isEdit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-black mb-2">
              Welcome to Your Journey! 🚀
            </h1>
            <p className="text-muted-foreground">
              Let's set up goals that match YOUR pace and YOUR life.
            </p>
          </motion.div>
        )}

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i + 1 === step ? "w-8 bg-primary" : "w-2",
                i + 1 < step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step 1: Situation */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardRetro>
              <CardRetroHeader>
                <CardRetroTitle>🎓 What's your situation?</CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="space-y-3">
                {situationOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setValues(v => ({ ...v, situation: option.value }))}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                      values.situation === option.value
                        ? "border-primary bg-primary/10 shadow-retro-sm"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <option.icon className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                    {values.situation === option.value && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </CardRetroContent>
            </CardRetro>
          </motion.div>
        )}

        {/* Step 2: Focus */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardRetro>
              <CardRetroHeader>
                <CardRetroTitle>🎯 What's your primary focus?</CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="space-y-3">
                {focusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setValues(v => ({ ...v, focus: option.value }))}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                      values.focus === option.value
                        ? "border-primary bg-primary/10 shadow-retro-sm"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <option.icon className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                    {values.focus === option.value && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </CardRetroContent>
            </CardRetro>
          </motion.div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardRetro>
              <CardRetroHeader>
                <CardRetroTitle>⏰ How much time weekly?</CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="grid grid-cols-2 gap-3">
                {hoursOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setValues(v => ({ ...v, weekly_hours: option.value }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all",
                      values.weekly_hours === option.value
                        ? "border-primary bg-primary/10 shadow-retro-sm"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className="font-black text-xl">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                    {values.weekly_hours === option.value && (
                      <Check className="w-5 h-5 text-primary mt-2" />
                    )}
                  </button>
                ))}
              </CardRetroContent>
            </CardRetro>
          </motion.div>
        )}

        {/* Step 4: Motivation */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardRetro>
              <CardRetroHeader>
                <CardRetroTitle>💪 What motivates you?</CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="space-y-3">
                {motivationOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setValues(v => ({ ...v, motivation_style: option.value }))}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                      values.motivation_style === option.value
                        ? "border-primary bg-primary/10 shadow-retro-sm"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <option.icon className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                    {values.motivation_style === option.value && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </CardRetroContent>
            </CardRetro>
          </motion.div>
        )}

        {/* Step 5: Celebration */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardRetro>
              <CardRetroHeader>
                <CardRetroTitle>🎉 How do you celebrate wins?</CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="space-y-3">
                {celebrationOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setValues(v => ({ ...v, celebration_style: option.value }))}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                      values.celebration_style === option.value
                        ? "border-primary bg-primary/10 shadow-retro-sm"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <option.icon className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                    {values.celebration_style === option.value && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </CardRetroContent>
            </CardRetro>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <ButtonRetro
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </ButtonRetro>

          {step < totalSteps ? (
            <ButtonRetro onClick={() => setStep(s => s + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </ButtonRetro>
          ) : (
            <ButtonRetro onClick={handleComplete} disabled={isSubmitting}>
              {isSubmitting ? 'Setting up...' : isEdit ? 'Save Changes' : 'Let\'s Go! 🚀'}
            </ButtonRetro>
          )}
        </div>

        {/* Summary preview on last step */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <CardRetro className="bg-muted/30">
              <CardRetroContent className="p-4">
                <h4 className="font-bold mb-3">Your personalized setup:</h4>
                <ul className="space-y-1 text-sm">
                  <li>✓ {situationOptions.find(o => o.value === values.situation)?.label} mode</li>
                  <li>✓ {focusOptions.find(o => o.value === values.focus)?.label} approach</li>
                  <li>✓ {hoursOptions.find(o => o.value === values.weekly_hours)?.label}/week</li>
                  <li>✓ {motivationOptions.find(o => o.value === values.motivation_style)?.label} motivation</li>
                  <li>✓ {celebrationOptions.find(o => o.value === values.celebration_style)?.label} celebrations</li>
                </ul>
              </CardRetroContent>
            </CardRetro>
          </motion.div>
        )}
      </div>
    </div>
  );
}