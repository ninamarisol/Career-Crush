import { UserMode } from '@/context/AppContext';
import { Shield, Rocket, Eye, TrendingUp } from 'lucide-react';

interface ModeWelcomeProps {
  displayName: string;
  mode: UserMode | null;
  quote: string;
}

const modeConfig = {
  active_seeker: {
    icon: Rocket,
    greeting: "Let's land that dream job",
    emoji: "🚀",
    description: "Full speed ahead on your job search",
  },
  career_insurance: {
    icon: Shield,
    greeting: "Keeping your options open",
    emoji: "🛡️",
    description: "Stay prepared for unexpected opportunities",
  },
  stealth_seeker: {
    icon: Eye,
    greeting: "Under the radar",
    emoji: "🕵️",
    description: "Quietly exploring new opportunities",
  },
  career_growth: {
    icon: TrendingUp,
    greeting: "Growing in your role",
    emoji: "📈",
    description: "Focus on developing where you are",
  },
};

export function ModeWelcome({ displayName, mode, quote }: ModeWelcomeProps) {
  const config = modeConfig[mode || 'active_seeker'];
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
