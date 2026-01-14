import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { OnboardingStep1 } from '@/components/onboarding/OnboardingStep1';
import { OnboardingStep2 } from '@/components/onboarding/OnboardingStep2';
import { OnboardingStep3 } from '@/components/onboarding/OnboardingStep3';
import { OnboardingStep4 } from '@/components/onboarding/OnboardingStep4';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { CardRetro } from '@/components/ui/card-retro';
import { useApp } from '@/context/AppContext';
import { Briefcase, Heart } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<'bubblegum' | 'electric' | 'minty' | 'sky'>('bubblegum');

  const handleComplete = () => {
    setUser({
      name,
      themeColor: theme,
      onboardingComplete: true,
      weeklyStreak: 0,
    });
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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
            
            <ProgressBar currentStep={step} totalSteps={4} />

            <div className="mt-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <OnboardingStep1
                    key="step1"
                    name={name}
                    setName={setName}
                    onNext={() => setStep(2)}
                  />
                )}
                {step === 2 && (
                  <OnboardingStep2
                    key="step2"
                    theme={theme}
                    setTheme={setTheme}
                    onNext={() => setStep(3)}
                  />
                )}
                {step === 3 && (
                  <OnboardingStep3
                    key="step3"
                    onNext={() => setStep(4)}
                  />
                )}
                {step === 4 && (
                  <OnboardingStep4
                    key="step4"
                    onComplete={handleComplete}
                  />
                )}
              </AnimatePresence>
            </div>
          </CardRetro>
        </div>
      </div>
    </div>
  );
}
