import { UserMode } from '@/context/AppContext';
import { Rocket, TrendingUp } from 'lucide-react';

interface ModeWelcomeProps {
  displayName: string;
  mode: UserMode | null;
  quote: string;
}

const modeConfig = {
  crush: {
    icon: Rocket,
    greeting: "Let's land that dream job",
    emoji: "🚀",
    description: "Full speed ahead on your job search",
  },
  climb: {
    icon: TrendingUp,
    greeting: "Growing in your role",
    emoji: "📈",
    description: "Focus on developing where you are",
  },
};

export function ModeWelcome({ displayName, mode, quote }: ModeWelcomeProps) {
  const validMode = mode && (mode === 'crush' || mode === 'climb') ? mode : 'crush';
  const config = modeConfig[validMode];
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20 border-2 border-border shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight truncate">
          Welcome back, {displayName || 'Friend'} {config.emoji}
        </h1>
      </div>
      <p className="text-sm sm:text-base text-muted-foreground italic">{quote}</p>
    </div>
  );
}
