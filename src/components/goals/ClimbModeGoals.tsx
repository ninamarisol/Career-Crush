import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Users, BookOpen, Plus, Check, ChevronDown, ChevronUp,
  Sparkles, Flame, MessageSquare, ExternalLink, Calendar
} from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, getDaysInMonth, getDate } from 'date-fns';
import type { ClimbModeGoals as ClimbGoalsType, MonthlyProgress, VisibilityActivity } from '@/hooks/useGoalCrusher';
import { useNavigate } from 'react-router-dom';

interface ClimbModeGoalsProps {
  goals: ClimbGoalsType;
  monthlyProgress: MonthlyProgress;
  onAddSkill: () => void;
  onLogSkillHours: (skillName: string) => void;
  onToggleVisibility: (activityId: string, enabled: boolean) => void;
  onLogVisibility: (activityId: string) => void;
  onEditGoals: () => void;
  getGoalProgress: (current: number, target: number) => number;
}

type PillarType = 'visibility' | 'network' | 'skills';

interface AINudges {
  visibility: string;
  network: string;
  skills: string;
  statusMessage: string;
}

interface CustomGoalStep {
  title: string;
  cadence: string;
  dueDate?: string;
  completed?: boolean;
}

interface CustomGoal {
  id: string;
  pillar: PillarType;
  refinedGoal: string;
  steps: CustomGoalStep[];
  featureSuggestions: string[];
}

// ─── Pillar Summary Card ────────────────────────────────────────────────────
function PillarCard({
  pillar,
  label,
  icon: Icon,
  completed,
  total,
  statusNote,
  isExpanded,
  onToggle,
}: {
  pillar: PillarType;
  label: string;
  icon: React.ElementType;
  completed: number;
  total: number;
  statusNote: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const colorMap: Record<PillarType, string> = {
    visibility: 'pillar-visibility',
    network: 'pillar-network',
    skills: 'pillar-skills',
  };
  const color = colorMap[pillar];

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <CardRetro
        hoverable
        onClick={onToggle}
        className={cn(
          'relative overflow-hidden transition-all',
          isExpanded && `ring-2 ring-${color}/50`
        )}
      >
        <CardRetroContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn('p-2 rounded-lg', `bg-${color}/10`)}>
                <Icon className={cn('w-5 h-5', `text-${color}`)} />
              </div>
              <span className="font-black text-base uppercase tracking-wide">{label}</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex items-end justify-between mb-3">
            <span className="text-3xl font-black">{pct}%</span>
            <span className="text-sm text-muted-foreground">{completed}/{total} done</span>
          </div>

          <div className="relative h-3 rounded-full overflow-hidden bg-muted">
            <motion.div
              className={cn('h-full rounded-full', `bg-${color}`)}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <p className="text-xs text-muted-foreground mt-2">{statusNote}</p>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}

// ─── Monthly Streak ─────────────────────────────────────────────────────────
function MonthlyStreak({ streak }: { streak: number }) {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  const filled = Math.min(streak, 5);

  return (
    <CardRetro>
      <CardRetroContent className="p-5">
        <h3 className="font-black text-base mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          Monthly Streak
        </h3>

        <div className="text-center mb-4">
          <span className="text-5xl font-black">{streak}</span>
          <p className="text-sm text-muted-foreground mt-1">consecutive months ≥ 70%</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          {months.map((m, i) => {
            const isFilled = i < filled;
            const isCurrent = i === months.length - 1;
            return (
              <div key={m} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 transition-all',
                    isFilled ? 'bg-primary border-primary' : 'border-muted-foreground/30',
                    isCurrent && !isFilled && 'border-primary animate-pulse-scale'
                  )}
                />
                <span className="text-[10px] text-muted-foreground">{m}</span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center italic">
          {streak >= 1
            ? `Finish this month → ${streak + 1}-month streak. Keep building! 🔥`
            : 'Complete ≥ 70% this month to start your streak!'}
        </p>
      </CardRetroContent>
    </CardRetro>
  );
}

// ─── AI Nudges Panel ────────────────────────────────────────────────────────
function AINudgesPanel({ nudges, loading }: { nudges: AINudges | null; loading: boolean }) {
  if (loading) {
    return (
      <CardRetro>
        <CardRetroContent className="p-5">
          <h3 className="font-black text-base mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            AI Nudges
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardRetroContent>
      </CardRetro>
    );
  }

  if (!nudges) return null;

  const items: { pillar: PillarType; text: string; icon: React.ElementType }[] = [
    { pillar: 'visibility', text: nudges.visibility, icon: Eye },
    { pillar: 'network', text: nudges.network, icon: Users },
    { pillar: 'skills', text: nudges.skills, icon: BookOpen },
  ];

  const colorMap: Record<PillarType, string> = {
    visibility: 'pillar-visibility',
    network: 'pillar-network',
    skills: 'pillar-skills',
  };

  return (
    <CardRetro>
      <CardRetroContent className="p-5">
        <h3 className="font-black text-base mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          AI Nudges
        </h3>
        <div className="space-y-3">
          {items.map(({ pillar, text, icon: NIcon }) => (
            <div
              key={pillar}
              className={cn(
                'p-3 rounded-lg border-l-4 bg-muted/30',
                `border-l-${colorMap[pillar]}`
              )}
              style={{ borderLeftColor: `hsl(var(--pillar-${pillar}))` }}
            >
              <div className="flex items-start gap-2">
                <NIcon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: `hsl(var(--pillar-${pillar}))` }} />
                <p className="text-sm italic">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </CardRetroContent>
    </CardRetro>
  );
}

// ─── Custom Goal Builder Modal ──────────────────────────────────────────────
function CustomGoalBuilder({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (goal: CustomGoal) => void;
}) {
  const [text, setText] = useState('');
  const [pillar, setPillar] = useState<PillarType>('visibility');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ refinedGoal: string; steps: CustomGoalStep[]; featureSuggestions: string[] } | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('climb-nudges', {
        body: { type: 'custom_goal', goal: { text, pillar, timeframe: 'this month' } },
      });
      if (error) throw error;
      setResult(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate goal. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      id: crypto.randomUUID(),
      pillar,
      refinedGoal: result.refinedGoal,
      steps: result.steps.map(s => ({ ...s, completed: false })),
      featureSuggestions: result.featureSuggestions,
    });
    setText('');
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            AI Goal Builder
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-1 block">What do you want to achieve this month?</label>
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="e.g. Get feedback from my manager on my promotion readiness"
                className="min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Pillar</label>
              <Select value={pillar} onValueChange={v => setPillar(v as PillarType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visibility">Visibility</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ButtonRetro onClick={handleGenerate} disabled={loading || !text.trim()} className="w-full">
              {loading ? 'Generating...' : 'Generate Goal Plan'}
            </ButtonRetro>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 border-l-4" style={{ borderLeftColor: `hsl(var(--pillar-${pillar}))` }}>
              <p className="text-xs text-muted-foreground mb-1 italic">AI suggested</p>
              <p className="font-bold text-sm">{result.refinedGoal}</p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2">Action Steps</h4>
              <div className="space-y-2">
                {result.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-card border">
                    <span className="text-xs font-bold text-muted-foreground mt-0.5">{i + 1}.</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.title}</p>
                      <Badge variant="outline" className="text-xs mt-1">{step.cadence}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.featureSuggestions.length > 0 && (
              <div className="text-xs text-muted-foreground space-y-1">
                {result.featureSuggestions.map((s, i) => (
                  <p key={i} className="flex items-start gap-1">
                    <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                    {s}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <ButtonRetro variant="outline" onClick={() => setResult(null)} className="flex-1">
                Edit
              </ButtonRetro>
              <ButtonRetro onClick={handleSave} className="flex-1">
                Save Goal
              </ButtonRetro>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Pillar Detail Drawer ───────────────────────────────────────────────────
function PillarDrawer({
  pillar,
  goals,
  monthlyProgress,
  customGoals,
  onToggleVisibility,
  onLogVisibility,
  onLogSkillHours,
  onAddCustomGoal,
  onToggleCustomStep,
  getGoalProgress,
}: {
  pillar: PillarType;
  goals: ClimbGoalsType;
  monthlyProgress: MonthlyProgress;
  customGoals: CustomGoal[];
  onToggleVisibility: (id: string, enabled: boolean) => void;
  onLogVisibility: (id: string) => void;
  onLogSkillHours: (name: string) => void;
  onAddCustomGoal: () => void;
  onToggleCustomStep: (goalId: string, stepIdx: number) => void;
  getGoalProgress: (current: number, target: number) => number;
}) {
  const navigate = useNavigate();
  const pillarCustomGoals = customGoals.filter(g => g.pillar === pillar);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <CardRetro className="mt-2">
        <CardRetroContent className="p-5 space-y-3">
          {/* Visibility actions */}
          {pillar === 'visibility' && (
            <>
              {goals.visibilityActivities.map(activity => (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-all',
                    activity.completed >= activity.target && activity.enabled
                      ? 'border-pillar-visibility/30 bg-pillar-visibility/5'
                      : 'border-border',
                    !activity.enabled && 'opacity-40'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={activity.completed >= activity.target}
                      disabled={!activity.enabled}
                      onCheckedChange={() => activity.enabled && onLogVisibility(activity.id)}
                    />
                    <div className="min-w-0">
                      <p className={cn('text-sm font-medium truncate', !activity.enabled && 'line-through')}>
                        {activity.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{activity.frequency}</Badge>
                        <span className="text-xs text-muted-foreground">{activity.completed}/{activity.target}</span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={activity.enabled}
                    onCheckedChange={(e) => onToggleVisibility(activity.id, e)}
                    className="ml-2"
                  />
                </div>
              ))}
            </>
          )}

          {/* Network actions */}
          {pillar === 'network' && (
            <>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">Monthly check-in goal</span>
                  <span className="text-lg font-black">{monthlyProgress.networkContacts}/{goals.networkContacts}</span>
                </div>
                <Progress
                  value={getGoalProgress(monthlyProgress.networkContacts, goals.networkContacts)}
                  className="h-2.5 [&>div]:rounded-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Coffee chats, LinkedIn messages, emails, meeting catch-ups
                </p>
              </div>
              <ButtonRetro
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/contacts')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Overdue Contacts
              </ButtonRetro>
            </>
          )}

          {/* Skills actions */}
          {pillar === 'skills' && (
            <>
              {goals.skills.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">No skills tracked yet</p>
                  <p className="text-xs mb-3">Add skills to generate weekly micro-actions</p>
                </div>
              ) : (
                goals.skills.map(skill => {
                  const pct = getGoalProgress(skill.logged, skill.hoursPerWeek);
                  const done = skill.logged >= skill.hoursPerWeek;
                  return (
                    <div
                      key={skill.name}
                      className={cn(
                        'p-3 rounded-lg border transition-all',
                        done ? 'border-pillar-skills/30 bg-pillar-skills/5' : 'border-border'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={done} disabled />
                          <span className="font-bold text-sm">{skill.name}</span>
                        </div>
                        {!done && (
                          <ButtonRetro size="sm" variant="ghost" onClick={() => onLogSkillHours(skill.name)}>
                            <Plus className="w-3 h-3 mr-1" /> Log
                          </ButtonRetro>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-2 flex-1 [&>div]:rounded-full" />
                        <span className="text-xs font-bold whitespace-nowrap">{skill.logged}h / {skill.hoursPerWeek}h</span>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* Custom goals for this pillar */}
          {pillarCustomGoals.map(cg => (
            <div key={cg.id} className="p-3 rounded-lg border border-dashed" style={{ borderColor: `hsl(var(--pillar-${pillar}) / 0.3)` }}>
              <p className="text-xs text-muted-foreground italic mb-1">AI suggested goal</p>
              <p className="text-sm font-bold mb-2">{cg.refinedGoal}</p>
              <div className="space-y-1.5">
                {cg.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Checkbox
                      checked={step.completed}
                      onCheckedChange={() => onToggleCustomStep(cg.id, idx)}
                      className="mt-0.5"
                    />
                    <div>
                      <span className={cn('text-xs', step.completed && 'line-through text-muted-foreground')}>{step.title}</span>
                      <Badge variant="outline" className="text-[10px] ml-1.5 px-1 py-0">{step.cadence}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add Custom Goal */}
          <button
            onClick={onAddCustomGoal}
            className="w-full p-3 rounded-lg border-2 border-dashed border-muted-foreground/20 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Custom Goal
          </button>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ClimbModeGoals({
  goals,
  monthlyProgress,
  onAddSkill,
  onLogSkillHours,
  onToggleVisibility,
  onLogVisibility,
  onEditGoals,
  getGoalProgress,
}: ClimbModeGoalsProps) {
  const [expandedPillar, setExpandedPillar] = useState<PillarType | null>(null);
  const [nudges, setNudges] = useState<AINudges | null>(null);
  const [nudgesLoading, setNudgesLoading] = useState(true);
  const [showGoalBuilder, setShowGoalBuilder] = useState(false);
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);

  const now = new Date();
  const monthName = format(now, 'MMMM');
  const daysInMonth = getDaysInMonth(now);
  const currentDay = getDate(now);
  const daysLeft = daysInMonth - currentDay;
  const monthPct = Math.round((currentDay / daysInMonth) * 100);

  // Calculate pillar stats
  const enabledVis = goals.visibilityActivities.filter(a => a.enabled);
  const visCompleted = enabledVis.filter(a => a.completed >= a.target).length;
  const visTotal = enabledVis.length;

  const netCompleted = monthlyProgress.networkContacts;
  const netTotal = goals.networkContacts;

  const skillsOnTrack = goals.skills.filter(s => s.logged >= s.hoursPerWeek).length;
  const skillsTotal = goals.skills.length;

  const visPct = visTotal > 0 ? Math.round((visCompleted / visTotal) * 100) : 0;
  const netPct = netTotal > 0 ? Math.round((netCompleted / netTotal) * 100) : 0;
  const skillsPct = skillsTotal > 0 ? Math.round((skillsOnTrack / skillsTotal) * 100) : 0;
  const overallPct = Math.round((visPct + netPct + skillsPct) / 3);

  const totalActions = visTotal + 1 + skillsTotal; // vis actions + network goal + skills
  const doneActions = visCompleted + (netCompleted >= netTotal ? 1 : 0) + skillsOnTrack;

  // Fetch AI nudges
  const fetchNudges = useCallback(async () => {
    setNudgesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('climb-nudges', {
        body: {
          type: 'nudges',
          progress: {
            monthName,
            daysLeft,
            visibility: {
              completed: visCompleted,
              total: visTotal,
              actions: enabledVis.map(a => ({ label: a.label, completed: a.completed, target: a.target })),
            },
            network: {
              completed: netCompleted,
              total: netTotal,
              details: { contacts: netCompleted, goal: netTotal },
            },
            skills: {
              completed: skillsOnTrack,
              total: skillsTotal,
              details: goals.skills.map(s => ({ name: s.name, logged: s.logged, target: s.hoursPerWeek })),
            },
          },
        },
      });
      if (error) throw error;
      setNudges(data);
    } catch (e) {
      console.error('Nudges error:', e);
      // Fallback nudges
      setNudges({
        visibility: 'Check your visibility actions — staying visible keeps you top of mind.',
        network: 'Reach out to a contact this week to maintain your network momentum.',
        skills: 'Keep logging skill hours — consistency beats intensity.',
        statusMessage: `You're ${monthPct}% through ${monthName}. ${daysLeft} days left to hit your goals.`,
      });
    } finally {
      setNudgesLoading(false);
    }
  }, [monthName, daysLeft, visCompleted, visTotal, netCompleted, netTotal, skillsOnTrack, skillsTotal]);

  useEffect(() => {
    fetchNudges();
  }, []);

  const handleToggleCustomStep = (goalId: string, stepIdx: number) => {
    setCustomGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, steps: g.steps.map((s, i) => (i === stepIdx ? { ...s, completed: !s.completed } : s)) }
          : g
      )
    );
  };

  const handleSaveCustomGoal = (goal: CustomGoal) => {
    setCustomGoals(prev => [...prev, goal]);
    toast.success('Custom goal added!');
  };

  const streak = 2; // TODO: calculate from persisted data

  return (
    <div className="space-y-6">
      {/* Monthly Progress Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <CardRetro className="overflow-hidden">
          <CardRetroContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ProgressCircle value={overallPct} size={100} strokeWidth={8}>
                <span className="text-2xl font-black">{overallPct}%</span>
              </ProgressCircle>

              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-medium text-muted-foreground italic mb-1">
                  {nudges?.statusMessage || `${monthPct}% through ${monthName}. ${daysLeft} days left.`}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                  <div className="text-center">
                    <span className="text-2xl font-black">{doneActions}</span>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <span className="text-2xl font-black">{totalActions - doneActions}</span>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <span className="text-2xl font-black">{streak}</span>
                    <p className="text-xs text-muted-foreground">Mo. Streak</p>
                  </div>
                </div>
              </div>

              <ButtonRetro variant="outline" size="sm" onClick={onEditGoals}>
                Edit Goals
              </ButtonRetro>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Three Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PillarCard
          pillar="visibility"
          label="Visibility"
          icon={Eye}
          completed={visCompleted}
          total={visTotal}
          statusNote={visCompleted === visTotal && visTotal > 0 ? 'All actions complete! 🎉' : `${visTotal - visCompleted} actions remaining`}
          isExpanded={expandedPillar === 'visibility'}
          onToggle={() => setExpandedPillar(p => (p === 'visibility' ? null : 'visibility'))}
        />
        <PillarCard
          pillar="network"
          label="Network"
          icon={Users}
          completed={Math.min(netCompleted, netTotal)}
          total={netTotal}
          statusNote={netCompleted >= netTotal ? 'Monthly goal hit! 🎉' : `${netTotal - netCompleted} check-ins to go`}
          isExpanded={expandedPillar === 'network'}
          onToggle={() => setExpandedPillar(p => (p === 'network' ? null : 'network'))}
        />
        <PillarCard
          pillar="skills"
          label="Skills"
          icon={BookOpen}
          completed={skillsOnTrack}
          total={skillsTotal || 1}
          statusNote={skillsTotal === 0 ? 'Add skills to start tracking' : `${skillsOnTrack}/${skillsTotal} on track`}
          isExpanded={expandedPillar === 'skills'}
          onToggle={() => setExpandedPillar(p => (p === 'skills' ? null : 'skills'))}
        />
      </div>

      {/* Expanded Pillar Drawer */}
      <AnimatePresence>
        {expandedPillar && (
          <PillarDrawer
            key={expandedPillar}
            pillar={expandedPillar}
            goals={goals}
            monthlyProgress={monthlyProgress}
            customGoals={customGoals}
            onToggleVisibility={onToggleVisibility}
            onLogVisibility={onLogVisibility}
            onLogSkillHours={onLogSkillHours}
            onAddCustomGoal={() => setShowGoalBuilder(true)}
            onToggleCustomStep={handleToggleCustomStep}
            getGoalProgress={getGoalProgress}
          />
        )}
      </AnimatePresence>

      {/* Bottom Row: Streak + AI Nudges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <MonthlyStreak streak={streak} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <AINudgesPanel nudges={nudges} loading={nudgesLoading} />
        </motion.div>
      </div>

      {/* Custom Goal Builder Modal */}
      <CustomGoalBuilder
        open={showGoalBuilder}
        onOpenChange={setShowGoalBuilder}
        onSave={handleSaveCustomGoal}
      />
    </div>
  );
}
