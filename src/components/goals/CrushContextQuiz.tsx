import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { cn } from '@/lib/utils';
import type { CrushQuizAnswers } from '@/hooks/useCrushContext';

interface CrushContextQuizProps {
  onComplete: (answers: CrushQuizAnswers, summary: string) => void;
  onGenerateSummary: (answers: CrushQuizAnswers) => Promise<string | null>;
  initialAnswers?: Partial<CrushQuizAnswers>;
}

const STAGE_OPTIONS = [
  'Just starting out',
  'Actively applying',
  'In interviews',
  'Final stages',
  'Returning after a break',
];

const FRICTION_OPTIONS = [
  { id: 'resume_not_landing', emoji: '📄', label: "My resume isn't landing interviews" },
  { id: 'getting_ghosted', emoji: '👻', label: "I'm applying but getting ghosted" },
  { id: 'interviews_not_converting', emoji: '🗣️', label: "I'm getting interviews but not offers" },
  { id: 'network_inactive', emoji: '🕸️', label: 'I need to activate my network' },
  { id: 'not_sure_what_looking_for', emoji: '🧭', label: "I'm not sure what I'm looking for yet" },
];

const URGENCY_OPTIONS = [
  { id: 'asap', emoji: '🔥', label: 'I need a job ASAP' },
  { id: 'few_months', emoji: '📅', label: 'I have a few months of runway' },
  { id: 'exploring', emoji: '🌱', label: "I'm exploring, no hard deadline" },
  { id: 'stealth', emoji: '💼', label: "I'm employed but quietly looking" },
];

export function CrushContextQuiz({ onComplete, onGenerateSummary, initialAnswers }: CrushContextQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CrushQuizAnswers>({
    searchStage: initialAnswers?.searchStage || '',
    targetRole: initialAnswers?.targetRole || '',
    targetCompanies: initialAnswers?.targetCompanies || '',
    frictionType: initialAnswers?.frictionType || '',
    urgency: initialAnswers?.urgency || '',
  });
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const totalSteps = 4;

  const canProceed = () => {
    switch (step) {
      case 0: return !!answers.searchStage;
      case 1: return answers.targetRole.trim().length > 0;
      case 2: return !!answers.frictionType;
      case 3: return !!answers.urgency;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setGenerating(true);
      const result = await onGenerateSummary(answers);
      setGenerating(false);
      if (result) {
        setSummary(result);
        setShowConfirmation(true);
      }
    }
  };

  const handleBack = () => { if (step > 0) setStep(step - 1); };

  const handleEdit = (targetStep: number) => {
    setStep(targetStep);
    setShowConfirmation(false);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <CardRetro className="overflow-hidden">
            <CardRetroContent className="p-8 sm:p-12">
              <div className="space-y-8">
                <div className="text-center">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Here's where you're at</span>
                </div>
                <p className="text-lg sm:text-xl leading-relaxed font-medium italic text-foreground">
                  "{summary}"
                </p>
                <p className="text-sm text-muted-foreground text-center">Ready?</p>
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                  <ButtonRetro onClick={() => onComplete(answers, summary)} className="w-full sm:w-auto">
                    Let's crush it — build my sprint
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </ButtonRetro>
                  <ButtonRetro
                    variant="outline"
                    onClick={() => handleEdit(0)}
                    className="w-full sm:w-auto"
                  >
                    Let me adjust
                  </ButtonRetro>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">Let's understand your search.</h1>
                  <p className="text-muted-foreground">A little context makes your weekly sprint a lot smarter.</p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-muted-foreground">Where are you in your job search right now?</label>
                  <div className="flex flex-wrap gap-2">
                    {STAGE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers(p => ({ ...p, searchStage: opt }))}
                        className={cn(
                          'px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all duration-150',
                          answers.searchStage === opt
                            ? 'border-primary bg-primary text-primary-foreground shadow-retro-sm'
                            : 'border-border bg-card text-foreground hover:border-primary/50'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">What kind of role are you going after?</h1>
                  <p className="text-muted-foreground">Be as specific or general as you want — your language helps us calibrate.</p>
                </div>
                <div className="space-y-4">
                  <InputRetro
                    placeholder="e.g. 'Product Manager at a tech startup,' 'something in finance,' 'anything remote that pays well'"
                    value={answers.targetRole}
                    onChange={(e) => setAnswers(p => ({ ...p, targetRole: e.target.value }))}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Any companies on your list? (optional)</label>
                    <InputRetro
                      placeholder="e.g. Google, local startups, open to anything"
                      value={answers.targetCompanies}
                      onChange={(e) => setAnswers(p => ({ ...p, targetCompanies: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">What's making the search hard right now?</h1>
                  <p className="text-muted-foreground">This tells us where to focus your weekly energy.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {FRICTION_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers(p => ({ ...p, frictionType: opt.id }))}
                      className={cn(
                        'px-5 py-4 rounded-xl border-2 text-left transition-all duration-150',
                        answers.frictionType === opt.id
                          ? 'border-primary bg-primary/10 shadow-retro-sm'
                          : 'border-border bg-card hover:border-primary/50'
                      )}
                    >
                      <span className="text-lg mr-2">{opt.emoji}</span>
                      <span className="font-bold text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">How urgent is this search?</h1>
                  <p className="text-muted-foreground">No judgment — urgency shapes your weekly targets.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {URGENCY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers(p => ({ ...p, urgency: opt.id }))}
                      className={cn(
                        'px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all duration-150',
                        answers.urgency === opt.id
                          ? 'border-primary bg-primary text-primary-foreground shadow-retro-sm'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      )}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <ButtonRetro
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={step === 0}
            className={step === 0 ? 'invisible' : ''}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </ButtonRetro>

          <ButtonRetro
            onClick={handleNext}
            disabled={!canProceed() || generating}
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                Generating...
              </>
            ) : step === totalSteps - 1 ? (
              <>
                See my sprint
                <Sparkles className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </ButtonRetro>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === step ? 'w-6 bg-primary' : i < step ? 'bg-primary/60' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
