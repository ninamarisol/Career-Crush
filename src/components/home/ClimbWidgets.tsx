import { 
  WidgetGrid,
  TwoColumn,
} from '@/components/widgets';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import { Users, Award, TrendingUp, Target, Eye, BookOpen, Plus, Flame } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { useContacts } from '@/hooks/useContacts';
import { useMemo, useState } from 'react';
import { differenceInDays } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { CardRetro } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { useCareerData } from '@/hooks/useCareerData';
import { AddCareerGoalDialog } from '@/components/dialogs/AddCareerGoalDialog';
import { Slider } from '@/components/ui/slider';
import { useGoalCrusher } from '@/hooks/useGoalCrusher';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export function ClimbWidgets() {
  const { contacts } = useContacts();
  const { wins, goals, addWin, addGoal, updateGoalProgress } = useCareerData();
  const { climbGoals, monthlyProgress, getGoalProgress, streakCount } = useGoalCrusher();
  const navigate = useNavigate();
  const [showWinLogger, setShowWinLogger] = useState(false);
  const [winText, setWinText] = useState('');

  // Calculate stats from real data
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

  // Calculate contacts that need attention
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

  // Goal Crusher pillar data
  const enabledVis = climbGoals.visibilityActivities.filter(a => a.enabled);
  const visCompleted = enabledVis.filter(a => a.completed >= a.target).length;
  const visTotal = enabledVis.length;
  const netCompleted = monthlyProgress.networkContacts;
  const netTotal = climbGoals.networkContacts;
  const skillsOnTrack = climbGoals.skills.filter(s => s.logged >= s.hoursPerWeek).length;
  const skillsTotal = climbGoals.skills.length || 1;

  const visPct = visTotal > 0 ? Math.round((visCompleted / visTotal) * 100) : 0;
  const netPct = netTotal > 0 ? Math.round((netCompleted / netTotal) * 100) : 0;
  const skillsPct = climbGoals.skills.length > 0 ? Math.round((skillsOnTrack / skillsTotal) * 100) : 0;
  const overallPct = Math.round((visPct + netPct + skillsPct) / 3);

  const pillars = [
    { key: 'visibility', label: 'Visibility', pct: visPct, icon: Eye, color: 'hsl(var(--pillar-visibility))' },
    { key: 'network', label: 'Network', pct: netPct, icon: Users, color: 'hsl(var(--pillar-network))' },
    { key: 'skills', label: 'Skills', pct: skillsPct, icon: BookOpen, color: 'hsl(var(--pillar-skills))' },
  ];

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

      {/* Goal Crusher Monitor — replaces Skills Development */}
      <div className="col-span-full">
        <CardRetro className="overflow-hidden cursor-pointer hover-lift" onClick={() => navigate('/goals')}>
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-black text-base">Goal Crusher — {format(new Date(), 'MMMM')}</h3>
              </div>
              <span className="text-xs text-muted-foreground">Tap for details →</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Overall progress ring */}
              <div className="shrink-0">
                <ProgressCircle value={overallPct} size={90} strokeWidth={7}>
                  <span className="text-xl font-black">{overallPct}%</span>
                </ProgressCircle>
              </div>

              {/* Three pillar bars */}
              <div className="flex-1 w-full space-y-3">
                {pillars.map(p => (
                  <div key={p.key} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md" style={{ backgroundColor: `${p.color}20` }}>
                      <p.icon className="w-4 h-4" style={{ color: p.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wide">{p.label}</span>
                        <span className="text-xs font-black">{p.pct}%</span>
                      </div>
                      <div className="relative h-2.5 rounded-full overflow-hidden bg-muted">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: p.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
