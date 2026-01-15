import { 
  GrowthGoalsWidget,
  WidgetGrid,
  TwoColumn,
} from '@/components/widgets';
import { SkillProgress, GrowthGoal } from '@/components/widgets/types';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import { Zap, Users, Award, TrendingUp, Target, BookOpen } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { useContacts } from '@/hooks/useContacts';
import { useMemo, useState } from 'react';
import { differenceInDays } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CardRetro } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';

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

export function ClimbWidgets({ 
  stats, 
  skillsProgress, 
  growthGoals 
}: ClimbWidgetsProps) {
  const { contacts } = useContacts();
  const [showWinLogger, setShowWinLogger] = useState(false);
  const [winText, setWinText] = useState('');

  // Calculate contacts that need attention (not contacted in 60+ days)
  const contactsNeedingAttention = useMemo(() => {
    return contacts.filter(c => {
      if (!c.last_contacted) return true;
      const daysSince = differenceInDays(new Date(), new Date(c.last_contacted));
      return daysSince >= 60;
    }).slice(0, 3);
  }, [contacts]);

  const handleLogWin = () => {
    if (!winText.trim()) return;
    toast.success('Win logged! 🎉', {
      description: 'Your accomplishment has been saved.'
    });
    setWinText('');
    setShowWinLogger(false);
  };

  return (
    <WidgetGrid>
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-full">
        <CardRetro className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 border-2 border-border">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Next Goal</p>
              <p className="text-base font-bold truncate">{stats.nextMilestone}</p>
            </div>
          </div>
        </CardRetro>
        
        <CardRetro className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20 border-2 border-border">
              <Award className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Wins Logged</p>
              <p className="text-2xl font-bold">{stats.completedGoals}</p>
            </div>
          </div>
        </CardRetro>

        <CardRetro className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/20 border-2 border-border">
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Skills Building</p>
              <p className="text-2xl font-bold">{stats.skillsInProgress}</p>
            </div>
          </div>
        </CardRetro>

        <CardRetro className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/20 border-2 border-border">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Network</p>
              <p className="text-2xl font-bold">{stats.networkContacts}</p>
            </div>
          </div>
        </CardRetro>
      </div>

      {/* Main Content: Goals + Win Logger */}
      <TwoColumn>
        {/* Active Goals - The Core Focus */}
        <WidgetContainer 
          title="Career Goals" 
          icon={TrendingUp} 
          size="medium"
        >
          <div className="space-y-4">
            {growthGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">Due {goal.deadline}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
            <ButtonRetro variant="outline" size="sm" className="w-full mt-2">
              + Add Goal
            </ButtonRetro>
          </div>
        </WidgetContainer>

        {/* Win Logger - Document Achievements */}
        <WidgetContainer 
          title="Log a Win" 
          icon={Award} 
          size="medium"
        >
          {!showWinLogger ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="p-4 rounded-full bg-success/10 border-2 border-success/30">
                <Award className="w-8 h-8 text-success" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Track your accomplishments</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Build evidence for promotions & reviews
                </p>
              </div>
              <ButtonRetro onClick={() => setShowWinLogger(true)} className="w-full">
                Log This Week's Win
              </ButtonRetro>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={winText}
                onChange={(e) => setWinText(e.target.value)}
                placeholder="What did you accomplish? Include impact if possible..."
                className="min-h-[100px] resize-none"
              />
              <div className="flex gap-2">
                <ButtonRetro 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowWinLogger(false)}
                >
                  Cancel
                </ButtonRetro>
                <ButtonRetro 
                  size="sm" 
                  onClick={handleLogWin} 
                  className="flex-1"
                  disabled={!winText.trim()}
                >
                  Save Win 🎉
                </ButtonRetro>
              </div>
            </div>
          )}
        </WidgetContainer>
      </TwoColumn>

      {/* Secondary Content: Skills + Network */}
      <TwoColumn>
        {/* Skills Progress */}
        <WidgetContainer 
          title="Skills Development" 
          icon={BookOpen} 
          size="medium"
        >
          <div className="space-y-4">
            {skillsProgress.map((skill, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{skill.name}</p>
                    <p className="text-xs text-muted-foreground">{skill.category}</p>
                  </div>
                  <span className="text-xs font-medium">
                    {skill.current}/{skill.target}h
                  </span>
                </div>
                <Progress value={(skill.current / skill.target) * 100} className="h-2" />
              </div>
            ))}
            <ButtonRetro variant="outline" size="sm" className="w-full">
              + Log Learning Time
            </ButtonRetro>
          </div>
        </WidgetContainer>

        {/* Network Maintenance */}
        <WidgetContainer 
          title="Network Health" 
          icon={Users} 
          size="medium"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Contacts touched this month</span>
              <span className="text-lg font-bold text-success">{stats.monthlyCheckIns}</span>
            </div>
            
            {contactsNeedingAttention.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">
                  Time to reconnect:
                </p>
                {contactsNeedingAttention.map(contact => (
                  <div 
                    key={contact.id} 
                    className="flex items-center justify-between p-2 rounded-lg border border-border"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {contact.company || contact.position || 'Contact'}
                      </p>
                    </div>
                    <ButtonRetro size="sm" variant="outline">
                      Reach out
                    </ButtonRetro>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">You're staying connected! 🎉</p>
              </div>
            )}
          </div>
        </WidgetContainer>
      </TwoColumn>
    </WidgetGrid>
  );
}
