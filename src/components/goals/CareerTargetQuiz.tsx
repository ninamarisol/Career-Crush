import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { cn } from '@/lib/utils';
import type { QuizAnswers } from '@/hooks/useCareerTarget';

interface CareerTargetQuizProps {
  onComplete: (answers: QuizAnswers, summary: string) => void;
  onGenerateSummary: (answers: QuizAnswers) => Promise<string | null>;
  initialAnswers?: Partial<QuizAnswers>;
}

const TIME_OPTIONS = ['Under 1 year', '1–2 years', '3–5 years', '5+ years'];
const TIMELINE_OPTIONS = ['Within 6 months', '6–12 months', '1–2 years', "I'm playing the long game (2+ years)"];
const BLOCKER_OPTIONS = [
  { id: 'visibility', emoji: '👁️', label: "I'm not visible enough", desc: "the right people don't know what I do" },
  { id: 'relationships', emoji: '🤝', label: "I don't have the right relationships", desc: "I need stronger sponsors and advocates" },
  { id: 'skills', emoji: '📈', label: 'I have a skills gap', desc: "there's something I need to learn or prove" },
  { id: 'evidence', emoji: '📋', label: "I don't have enough evidence", desc: "I can't point to clear impact yet" },
  { id: 'other', emoji: '✏️', label: 'Something else', desc: '' },
];
const REVIEW_OPTIONS = ['Within 3 months', '3–6 months', '6–12 months', "I don't know", "My company doesn't have formal cycles"];

export function CareerTargetQuiz({ onComplete, onGenerateSummary, initialAnswers }: CareerTargetQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    roleTitle: initialAnswers?.roleTitle || '',
    timeInRole: initialAnswers?.timeInRole || '',
    targetDestination: initialAnswers?.targetDestination || '',
    timeline: initialAnswers?.timeline || '',
    biggestBlocker: initialAnswers?.biggestBlocker || '',
    blockerCustomText: initialAnswers?.blockerCustomText || '',
    reviewCycle: initialAnswers?.reviewCycle || '',
  });
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editingStep, setEditingStep] = useState<number | null>(null);

  const totalSteps = 5;

  const canProceed = () => {
    switch (step) {
      case 0: return answers.roleTitle.trim() && answers.timeInRole;
      case 1: return answers.targetDestination.trim();
      case 2: return answers.timeline;
      case 3: return answers.biggestBlocker && (answers.biggestBlocker !== 'other' || answers.blockerCustomText?.trim());
      case 4: return answers.reviewCycle;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Last step — generate summary
      setGenerating(true);
      const result = await onGenerateSummary(answers);
      setGenerating(false);
      if (result) {
        setSummary(result);
        setShowConfirmation(true);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleEdit = (targetStep: number) => {
    setEditingStep(targetStep);
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
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Career Target</span>
                </div>
                <p className="text-lg sm:text-xl leading-relaxed font-medium italic text-foreground">
                  "{summary}"
                </p>
                <p className="text-sm text-muted-foreground text-center">Sound right?</p>
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                  <ButtonRetro onClick={() => onComplete(answers, summary)} className="w-full sm:w-auto">
                    That's exactly it — build my sprint
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
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">Let's figure out where you are.</h1>
                  <p className="text-muted-foreground">This helps us build a sprint that actually makes sense for your situation.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">What's your current role or title?</label>
                    <InputRetro
                      placeholder="e.g. Senior Product Manager"
                      value={answers.roleTitle}
                      onChange={(e) => setAnswers(p => ({ ...p, roleTitle: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-muted-foreground">How long have you been in this role?</label>
                    <div className="flex flex-wrap gap-2">
                      {TIME_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setAnswers(p => ({ ...p, timeInRole: opt }))}
                          className={cn(
                            'px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all duration-150',
                            answers.timeInRole === opt
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
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">Now, where are you trying to go?</h1>
                  <p className="text-muted-foreground">It can be a specific title, a type of work, or just a direction. There's no wrong answer here.</p>
                </div>
                <textarea
                  className="flex w-full rounded-lg border-2 border-border bg-card px-4 py-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px] resize-none"
                  placeholder="e.g. 'VP of Product,' 'lead my own team,' 'stop executing and start deciding'"
                  value={answers.targetDestination}
                  onChange={(e) => setAnswers(p => ({ ...p, targetDestination: e.target.value }))}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">How soon are you trying to make this move?</h1>
                  <p className="text-muted-foreground">Your timeline changes everything about how we build your sprint.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {TIMELINE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAnswers(p => ({ ...p, timeline: opt }))}
                      className={cn(
                        'px-5 py-3.5 rounded-xl border-2 text-left text-sm font-bold transition-all duration-150',
                        answers.timeline === opt
                          ? 'border-primary bg-primary/10 text-foreground shadow-retro-sm'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">What's the main thing standing between you and that next move?</h1>
                  <p className="text-muted-foreground">Be honest — this shapes everything your Goal Crusher focuses on.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {BLOCKER_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers(p => ({ ...p, biggestBlocker: opt.id, blockerCustomText: opt.id !== 'other' ? '' : p.blockerCustomText }))}
                      className={cn(
                        'px-5 py-4 rounded-xl border-2 text-left transition-all duration-150',
                        answers.biggestBlocker === opt.id
                          ? 'border-primary bg-primary/10 shadow-retro-sm'
                          : 'border-border bg-card hover:border-primary/50'
                      )}
                    >
                      <span className="text-lg mr-2">{opt.emoji}</span>
                      <span className="font-bold text-sm">{opt.label}</span>
                      {opt.desc && <span className="text-sm text-muted-foreground"> — {opt.desc}</span>}
                    </button>
                  ))}
                  {answers.biggestBlocker === 'other' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <InputRetro
                        placeholder="Tell us what's in the way..."
                        value={answers.blockerCustomText}
                        onChange={(e) => setAnswers(p => ({ ...p, blockerCustomText: e.target.value }))}
                        className="mt-2"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">Do you know when your next performance review or promotion cycle opens?</h1>
                  <p className="text-muted-foreground">Optional — but if you know it, we'll build urgency around it.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {REVIEW_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAnswers(p => ({ ...p, reviewCycle: opt }))}
                      className={cn(
                        'px-5 py-3.5 rounded-xl border-2 text-left text-sm font-bold transition-all duration-150',
                        answers.reviewCycle === opt
                          ? 'border-primary bg-primary/10 text-foreground shadow-retro-sm'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      )}
                    >
                      {opt}
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
                See my career target
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
