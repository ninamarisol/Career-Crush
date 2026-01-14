import { motion } from 'framer-motion';
import { Check, PartyPopper } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';

interface OnboardingStep4Props {
  onComplete: () => void;
}

export function OnboardingStep4({ onComplete }: OnboardingStep4Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="space-y-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto rounded-full bg-success border-2 border-border shadow-retro-lg flex items-center justify-center"
      >
        <Check className="h-12 w-12 text-success-foreground" />
      </motion.div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl font-black">You're all set!</h2>
          <PartyPopper className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Time to find your dream job.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ButtonRetro onClick={onComplete} className="w-full" size="lg">
          Go to Dashboard
        </ButtonRetro>
      </motion.div>
    </motion.div>
  );
}
