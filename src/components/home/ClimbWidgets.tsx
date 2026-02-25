import { 
  WidgetGrid,
  TwoColumn,
} from '@/components/widgets';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import { Users, Award, TrendingUp, Target, Flame, Plus, Sparkles } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { useContacts } from '@/hooks/useContacts';
import { useMemo, useState, useEffect } from 'react';
import { differenceInDays, format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { CardRetro } from '@/components/ui/card-retro';
import { Slider } from '@/components/ui/slider';
import { useCareerData } from '@/hooks/useCareerData';
import { AddCareerGoalDialog } from '@/components/dialogs/AddCareerGoalDialog';
import { useGoalCrusher } from '@/hooks/useGoalCrusher';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { BriefingData } from '@/components/goals/ClimbModeGoals';

export function ClimbWidgets() {
  const { contacts } = useContacts();
  const { wins, goals, addWin, addGoal, updateGoalProgress } = useCareerData();
  const { streakCount } = useGoalCrusher();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWinLogger, setShowWinLogger] = useState(false);
  const [winText, setWinText] = useState('');
  const [briefingOneMove, setBriefingOneMove] = useState<string | null>(null);

  // Fetch cached briefing's "One Move" for the teaser
  useEffect(() => {
    if (!user) return;
    const monthKey = format(new Date(), 'yyyy-MM');
    (async () => {
      const { data } = await supabase
        .from('career_briefings')
        .select('briefing_data')
        .eq('user_id', user.id)
        .eq('month_key', monthKey)
        .maybeSingle();
      if (data?.briefing_data) {
        const bd = data.briefing_data as unknown as BriefingData;
        setBriefingOneMove(bd.oneMove || null);
      }
    })();
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyCheckIns = contacts.filter(c => {
      if (!c.last_contacted) return false;
      return new Date(c.last_contacted) >= monthStart;
    }).length;
    const topGoal = goals.length > 0 ? goals[0] : null;
    return {
      nextMilestone: topGoal?.title || 'Set a goal',
      winsLogged: wins.length,
      networkContacts: contacts.length,
      monthlyCheckIns,
    };
  }, [contacts, wins, goals]);

  const contactsNeedingAttention = useMemo(() => {
    return contacts.filter(c => {
      if (!c.last_contacted) return true;
      const daysSince = differenceInDays(new Date(), new Date(c.last_contacted));
      return daysSince >= 60;
    }).slice(0, 3);
  }, [contacts]);

  const handleLogWin = () => {
    if (!winText.trim()) return;
    addWin.mutate({ description: winText });
    setWinText('');
    setShowWinLogger(false);
  };

  const handleAddGoal = (data: { title: string; description?: string; deadline?: string }) => {
    addGoal.mutate(data);
  };

  const handleUpdateProgress = (goalId: string, progress: number) => {
    updateGoalProgress.mutate({ goalId, progress });
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
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Next Goal</p>
              <p className="text-sm font-bold truncate">{stats.nextMilestone}</p>
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
              <p className="text-2xl font-bold">{stats.winsLogged}</p>
            </div>
          </div>
        </CardRetro>

        <CardRetro className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border-2 border-border" style={{ backgroundColor: 'hsl(var(--pillar-visibility) / 0.2)' }}>
              <Flame className="h-5 w-5" style={{ color: 'hsl(var(--pillar-visibility))' }} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold">{streakCount} mo</p>
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

      {/* Goal Crusher Monitor — Briefing "One Move" teaser */}
      <div className="col-span-full">
        <CardRetro className="overflow-hidden cursor-pointer hover-lift" onClick={() => navigate('/goals')}>
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-black text-base">Career Briefing — {format(new Date(), 'MMMM')}</h3>
              </div>
              <span className="text-xs text-muted-foreground">Tap for full briefing →</span>
            </div>

            {briefingOneMove ? (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Your One Move</span>
                </div>
                <p className="text-sm font-bold leading-relaxed">{briefingOneMove}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Generate your monthly career briefing to get your personalized recommendation.
                </p>
                <ButtonRetro size="sm" className="mt-3 gap-2" onClick={(e) => { e.stopPropagation(); navigate('/goals'); }}>
                  <Sparkles className="w-4 h-4" /> Get Briefing
                </ButtonRetro>
              </div>
            )}
          </div>
        </CardRetro>
      </div>

      {/* Main Content: Goals + Win Logger */}
      <TwoColumn>
        {/* Active Goals */}
        <WidgetContainer title="Career Goals" icon={TrendingUp} size="medium">
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No goals yet. Add one to track your progress!</p>
              </div>
            ) : (
              goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.deadline ? `Due ${format(new Date(goal.deadline), 'MMM yyyy')}` : 'No deadline'}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">{goal.progress}%</span>
                  </div>
                  <Slider
                    value={[goal.progress]}
                    max={100}
                    step={5}
                    onValueCommit={(value) => handleUpdateProgress(goal.id, value[0])}
                    className="cursor-pointer"
                  />
                </div>
              ))
            )}
            <AddCareerGoalDialog 
              onAddGoal={handleAddGoal}
              trigger={
                <ButtonRetro variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Goal
                </ButtonRetro>
              }
            />
          </div>
        </WidgetContainer>

        {/* Win Logger */}
        <WidgetContainer title="Log a Win" icon={Award} size="medium">
          {!showWinLogger ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="p-4 rounded-full bg-success/10 border-2 border-success/30">
                <Award className="w-8 h-8 text-success" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Track your accomplishments</p>
                <p className="text-xs text-muted-foreground mt-1">Build evidence for promotions & reviews</p>
              </div>
              <ButtonRetro onClick={() => setShowWinLogger(true)} className="w-full">
                Log This Week's Win
              </ButtonRetro>
              {wins.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {wins.length} win{wins.length !== 1 ? 's' : ''} logged total
                </p>
              )}
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
                <ButtonRetro variant="outline" size="sm" onClick={() => setShowWinLogger(false)}>Cancel</ButtonRetro>
                <ButtonRetro 
                  size="sm" 
                  onClick={handleLogWin} 
                  className="flex-1"
                  disabled={!winText.trim() || addWin.isPending}
                >
                  Save Win 🎉
                </ButtonRetro>
              </div>
            </div>
          )}
        </WidgetContainer>
      </TwoColumn>

      {/* Network Health */}
      <div className="col-span-full">
        <WidgetContainer title="Network Health" icon={Users} size="medium">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Contacts touched this month</span>
              <span className="text-lg font-bold text-success">{stats.monthlyCheckIns}</span>
            </div>
            
            {contactsNeedingAttention.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">Time to reconnect:</p>
                {contactsNeedingAttention.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {contact.company || contact.position || 'Contact'}
                      </p>
                    </div>
                    <ButtonRetro size="sm" variant="outline">Reach out</ButtonRetro>
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
      </div>
    </WidgetGrid>
  );
}
