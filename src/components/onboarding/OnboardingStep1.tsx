import { motion } from 'framer-motion';
import { ArrowRight, Rocket } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';

interface OnboardingStep1Props {
  name: string;
  setName: (name: string) => void;
  onNext: () => void;
}

export function OnboardingStep1({ name, setName, onNext }: OnboardingStep1Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Rocket className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-black">Let's get you organized</h2>
        </div>
        <p className="text-muted-foreground">
          First things first, what should we call you?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
            Your Name
          </label>
          <InputRetro
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />
        </div>

        <ButtonRetro
          onClick={onNext}
          disabled={!name.trim()}
          className="w-full"
        >
          Next Step
          <ArrowRight className="h-4 w-4" />
        </ButtonRetro>
      </div>
    </motion.div>
  );
}
