import { 
  PromotionReadinessWidget,
  SkillsProgressWidget,
  GrowthGoalsWidget,
  WeeklyFocusWidget,
  WidgetGrid,
  TwoColumn,
} from '@/components/widgets';
import { SkillProgress, GrowthGoal } from '@/components/widgets/types';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import { Zap, Users, Linkedin, Award, ChevronUp } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { useContacts } from '@/hooks/useContacts';
import { useMemo, useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ClimbWidgetsProps {
  stats: {
    skillsInProgress: number;
    completedGoals: number;
    learningStreak: number;
    nextMilestone: string;
    networkContacts: number;
    monthlyCheckIns: number;
  };
  skillsProgress: SkillProgress[];
  growthGoals: GrowthGoal[];
}

// Weekly high-leverage actions (would be AI-generated in production)
const weeklyActions = [
  { id: '1', action: 'Write post-mortem for recent project', category: 'Visibility', done: false },
  { id: '2', action: 'Congratulate Sarah on her new role', category: 'Network', done: false },
  { id: '3', action: 'Complete Module 3 of leadership course', category: 'Skills', done: true },
];

// LinkedIn content ideas
const linkedInIdeas = [
  { type: 'Thought Leadership', idea: '3 things I wish I knew before leading my first project' },
  { type: 'Lesson Learned', idea: 'What going live taught me about stakeholder management' },
  { type: 'Industry Insight', idea: 'Why [trending topic] will change how we work' },
];

export function ClimbWidgets({ 
  stats, 
  skillsProgress, 
  growthGoals 
}: ClimbWidgetsProps) {
  const { contacts } = useContacts();
  const [actions, setActions] = useState(weeklyActions);
  const [showWinLogger, setShowWinLogger] = useState(false);
  const [winText, setWinText] = useState('');
  const [winImpact, setWinImpact] = useState('');

  // Calculate contacts that need attention (not contacted in 60+ days)
  const contactsNeedingAttention = useMemo(() => {
    return contacts.filter(c => {
      if (!c.last_contacted) return true;
      const daysSince = differenceInDays(new Date(), new Date(c.last_contacted));
      return daysSince >= 60;
    }).slice(0, 3);
  }, [contacts]);

  const toggleAction = (id: string) => {
    setActions(actions.map(a => 
      a.id === id ? { ...a, done: !a.done } : a
    ));
  };

  const handleLogWin = () => {
    if (!winText.trim()) return;
    toast.success('Win logged! 🎉');
    setWinText('');
    setWinImpact('');
    setShowWinLogger(false);
  };

  return (
    <WidgetGrid>
      {/* Weekly High-Leverage Actions */}
      <WidgetContainer 
        title="This Week's High-Leverage Actions" 
        icon={Zap} 
        size="large"
        className="bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30"
      >
        <div className="space-y-3">
          {actions.map((action) => (
            <div 
              key={action.id}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 border-border bg-card transition-all ${action.done ? 'opacity-60' : ''}`}
            >
              <button 
                onClick={() => toggleAction(action.id)}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  action.done 
                    ? 'bg-success border-success text-success-foreground' 
                    : 'border-border hover:border-primary'
                }`}
              >
                {action.done && <span className="text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${action.done ? 'line-through' : ''}`}>
                  {action.action}
                </p>
                <span className="text-xs text-muted-foreground">{action.category}</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground text-center mt-4">
            ✨ AI-generated based on your career goals
          </p>
        </div>
      </WidgetContainer>

      {/* Promotion Readiness */}
      <PromotionReadinessWidget 
        size="full"
        targetRole={stats.nextMilestone}
        progress={72}
        timeline="8-10 months at this pace"
        nextMilestone={{ title: 'Complete leadership course', deadline: 'Mar 2026' }}
      />

      {/* Skills Development */}
      <SkillsProgressWidget size="large" skills={skillsProgress} />

      {/* Network Health & LinkedIn Ideas */}
      <TwoColumn>
        {/* Relationship Maintenance */}
        <WidgetContainer title="Network Health" icon={Users} size="medium">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Contacts</span>
              <span className="text-lg font-bold">{stats.networkContacts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Touched this month</span>
              <span className="text-lg font-bold text-success">{stats.monthlyCheckIns}</span>
            </div>
            
            {contactsNeedingAttention.length > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-bold text-muted-foreground mb-2">RECONNECT WITH:</p>
                {contactsNeedingAttention.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.company || 'No company'}</p>
                    </div>
                    <ButtonRetro size="sm" variant="outline">Reach out</ButtonRetro>
                  </div>
                ))}
              </div>
            )}
          </div>
        </WidgetContainer>

        {/* LinkedIn Ideas */}
        <WidgetContainer title="LinkedIn Ideas" icon={Linkedin} size="medium">
          <div className="space-y-3">
            {linkedInIdeas.map((idea, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-xs font-bold text-primary">{idea.type}</span>
                <p className="text-sm mt-1">{idea.idea}</p>
              </div>
            ))}
            <ButtonRetro variant="outline" size="sm" className="w-full">
              Generate more ideas ✨
            </ButtonRetro>
          </div>
        </WidgetContainer>
      </TwoColumn>

      {/* Impact Narrative & Win Logger */}
      <TwoColumn>
        {/* Growth Goals */}
        <GrowthGoalsWidget size="medium" goals={growthGoals} />
        
        {/* Win Logger */}
        <WidgetContainer title="Log a Win" icon={ChevronUp} size="medium">
          {!showWinLogger ? (
            <div className="space-y-4 text-center py-4">
              <Award className="w-12 h-12 mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                What did you accomplish this week?
              </p>
              <ButtonRetro onClick={() => setShowWinLogger(true)} className="w-full">
                Log This Week's Win
              </ButtonRetro>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={winText}
                onChange={(e) => setWinText(e.target.value)}
                placeholder="What did you accomplish?"
                className="min-h-[80px]"
              />
              <Input
                value={winImpact}
                onChange={(e) => setWinImpact(e.target.value)}
                placeholder="Impact/outcome (optional)"
              />
              <div className="flex gap-2">
                <ButtonRetro variant="outline" size="sm" onClick={() => setShowWinLogger(false)}>
                  Cancel
                </ButtonRetro>
                <ButtonRetro size="sm" onClick={handleLogWin} className="flex-1">
                  Save Win 🎉
                </ButtonRetro>
              </div>
            </div>
          )}
        </WidgetContainer>
      </TwoColumn>

      {/* Weekly Focus */}
      <WeeklyFocusWidget size="medium" />
    </WidgetGrid>
  );
}
