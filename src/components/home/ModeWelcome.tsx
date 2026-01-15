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
  const config = modeConfig[mode || 'crush'];
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20 border-2 border-border">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black">
            Welcome back, {displayName || 'Friend'} {config.emoji}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">{config.greeting} — {config.description}</p>
        </div>
      </div>
      <p className="text-muted-foreground italic">{quote}</p>
    </div>
  );
}
