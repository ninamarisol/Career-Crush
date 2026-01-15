import { motion } from 'framer-motion';
import { ArrowRight, Rocket, TrendingUp } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { cn } from '@/lib/utils';
import { UserMode } from '@/context/AppContext';

interface OnboardingModeSelectProps {
  selectedMode: UserMode | null;
  setSelectedMode: (mode: UserMode) => void;
  onNext: () => void;
}

const modes = [
  {
    id: 'crush' as UserMode,
    name: 'Crush Mode',
    headline: 'Land Your Next Role',
    description: 'Active job search tools: application tracking, resume optimization, interview prep, and company research',
    icon: Rocket,
    cta: 'Start Job Search',
    colors: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    emoji: '🚀',
  },
  {
    id: 'climb' as UserMode,
    name: 'Climb Mode',
    headline: 'Grow Where You Are',
    description: 'Proactive career management: promotion readiness, personal brand, skill development, and network maintenance',
    icon: TrendingUp,
    cta: 'Manage My Career',
    colors: 'from-blue-500 to-emerald-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    emoji: '📈',
  },
];

export function OnboardingModeSelect({ selectedMode, setSelectedMode, onNext }: OnboardingModeSelectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black">What's your focus? 🎯</h2>
        <p className="text-muted-foreground">
          Choose how you want to use Career Crush. You can switch anytime.
        </p>
      </div>

      <div className="grid gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <motion.button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative w-full p-6 rounded-xl border-2 text-left transition-all duration-200",
                isSelected
                  ? `${mode.bgColor} ${mode.borderColor} shadow-retro-lg -translate-x-0.5 -translate-y-0.5`
                  : "border-border bg-card hover:shadow-retro hover:-translate-x-0.5 hover:-translate-y-0.5"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="mode-selection"
                  className={cn(
                    "absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r flex items-center justify-center",
                    mode.colors
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
              
              <div className="flex gap-4">
                <div className={cn(
                  "flex-shrink-0 w-14 h-14 rounded-xl border-2 border-border flex items-center justify-center",
                  mode.iconBg
                )}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black">{mode.name}</h3>
                    <span className="text-xl">{mode.emoji}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground/80 mb-2">{mode.headline}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{mode.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <ButtonRetro 
        onClick={onNext} 
        className="w-full"
        disabled={!selectedMode}
      >
        {selectedMode 
          ? modes.find(m => m.id === selectedMode)?.cta || 'Continue'
          : 'Select a mode to continue'
        }
        <ArrowRight className="h-4 w-4" />
      </ButtonRetro>
      
      <p className="text-xs text-center text-muted-foreground">
        💡 You can switch between modes anytime from your profile settings
      </p>
    </motion.div>
  );
}
