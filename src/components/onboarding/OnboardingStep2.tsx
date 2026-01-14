import { motion } from 'framer-motion';
import { ArrowRight, Palette } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { cn } from '@/lib/utils';

type ThemeColor = 'bubblegum' | 'electric' | 'minty' | 'sunset';

interface OnboardingStep2Props {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  onNext: () => void;
}

const themes: { id: ThemeColor; name: string; color: string }[] = [
  { id: 'bubblegum', name: 'Bubblegum', color: 'bg-pink-400' },
  { id: 'electric', name: 'Electric', color: 'bg-yellow-400' },
  { id: 'minty', name: 'Minty', color: 'bg-emerald-400' },
  { id: 'sunset', name: 'Sunset', color: 'bg-orange-400' },
];

export function OnboardingStep2({ theme, setTheme, onNext }: OnboardingStep2Props) {
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
          <Palette className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-black">Pick your vibe 🎨</h2>
        </div>
        <p className="text-muted-foreground">
          Choose a theme color that keeps you motivated.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border transition-all duration-150",
              theme === t.id
                ? "shadow-retro-lg -translate-x-0.5 -translate-y-0.5 bg-muted"
                : "shadow-retro hover:shadow-retro-lg hover:-translate-x-0.5 hover:-translate-y-0.5 bg-card"
            )}
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full border-2 border-border mb-3",
                t.color
              )}
            />
            <span className="font-bold">{t.name}</span>
          </button>
        ))}
      </div>

      <ButtonRetro onClick={onNext} className="w-full">
        Next Step
        <ArrowRight className="h-4 w-4" />
      </ButtonRetro>
    </motion.div>
  );
}
