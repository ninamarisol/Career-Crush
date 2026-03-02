import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Users, BookOpen, Target, Sparkles, Flame, RefreshCw,
  ChevronDown, ChevronUp, Check, Plus
} from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/context/AppContext';
import type { ClimbModeGoals as ClimbGoalsType, MonthlyProgress, VisibilityActivity, CustomGoal } from '@/hooks/useGoalCrusher';
import { invokeAuthedFunction } from '@/lib/cloudFunctions';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface BriefingData {
  retrospective: string;
  stats: { label: string; value: string }[];
  patterns: string[];
  blindSpots: string[];
  oneMove: string;
  supportingActions: string[];
}

interface ClimbModeGoalsProps {
  goals: ClimbGoalsType;
  monthlyProgress: MonthlyProgress;
  customGoals: CustomGoal[];
  streakCount: number;
  streakMonths: string[];
  onAddSkill: () => void;
  onLogSkillHours: (skillName: string) => void;
  onToggleVisibility: (activityId: string, enabled: boolean) => void;
  onLogVisibility: (activityId: string) => void;
  onEditGoals: () => void;
  getGoalProgress: (current: number, target: number) => number;
  onSaveCustomGoal: (goal: CustomGoal) => void;
  onToggleCustomStep: (goalId: string, stepIdx: number) => void;
}

// ─── Data Snapshot Builder ──────────────────────────────────────────────────
function useDataSnapshot() {
  const { user } = useAuth();
  const { applications, events } = useApp();
  const { contacts } = useContacts();

  return useCallback(async () => {
    if (!user) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const isoThirty = thirtyDaysAgo.toISOString();

    // Recent applications
    const recentApps = applications.filter(a => new Date(a.created_at) >= thirtyDaysAgo);
    const statusCounts: Record<string, number> = {};
    recentApps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

    // Contacts & interactions
    const totalContacts = contacts.length;
    const dormantContacts = contacts.filter(c => {
      if (!c.last_contacted) return true;
      return new Date(c.last_contacted) < thirtyDaysAgo;
    }).length;

    const { data: interactions } = await supabase
      .from('contact_interactions')
      .select('type, date')
      .eq('user_id', user.id)
      .gte('date', isoThirty.split('T')[0]);

    // Track record entries
    const { data: trackEntries } = await supabase
      .from('track_record_entries')
      .select('entry_type, title, ai_strength_score, manual_tags')
      .eq('user_id', user.id)
      .gte('created_at', isoThirty);

    // Career wins
    const { data: wins } = await supabase
      .from('career_wins')
      .select('description, impact, category')
      .eq('user_id', user.id)
      .gte('win_date', isoThirty.split('T')[0]);

    // Skills
    const { data: skills } = await supabase
      .from('skill_tracking')
      .select('skill_name, logged_hours, target_hours')
      .eq('user_id', user.id);

    // Climb goals
    const monthKey = format(now, 'yyyy-MM');
    const { data: climbData } = await supabase
      .from('climb_goals')
      .select('visibility_activities, streak_count, streak_months')
      .eq('user_id', user.id)
      .eq('month_key', monthKey)
      .maybeSingle();

    // Events
    const recentEvents = events.filter(e => new Date(e.date) >= thirtyDaysAgo);

    return {
      period: `${format(thirtyDaysAgo, 'MMM d')} – ${format(now, 'MMM d, yyyy')}`,
      applications: {
        total: recentApps.length,
        byStatus: statusCounts,
        companies: [...new Set(recentApps.map(a => a.company))].slice(0, 10),
      },
      network: {
        totalContacts,
        dormantContacts,
        recentInteractions: interactions?.length || 0,
        interactionTypes: interactions?.reduce((acc: Record<string, number>, i) => {
          acc[i.type] = (acc[i.type] || 0) + 1;
          return acc;
        }, {}) || {},
      },
      trackRecord: {
        entriesLogged: trackEntries?.length || 0,
        types: trackEntries?.reduce((acc: Record<string, number>, e) => {
          acc[e.entry_type] = (acc[e.entry_type] || 0) + 1;
          return acc;
        }, {}) || {},
        withImpactScores: trackEntries?.filter(e => e.ai_strength_score).length || 0,
      },
      wins: {
        total: wins?.length || 0,
        withImpact: wins?.filter(w => w.impact).length || 0,
        categories: wins?.reduce((acc: Record<string, number>, w) => {
          const cat = w.category || 'general';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}) || {},
      },
      skills: skills?.map(s => ({
        name: s.skill_name,
        logged: Number(s.logged_hours),
        target: s.target_hours,
        onTrack: Number(s.logged_hours) >= s.target_hours,
      })) || [],
      visibility: {
        activities: (climbData?.visibility_activities as any[]) || [],
        streak: (climbData?.streak_count as number) || 0,
      },
      events: {
        total: recentEvents.length,
        byType: recentEvents.reduce((acc: Record<string, number>, e) => {
          acc[e.type] = (acc[e.type] || 0) + 1;
          return acc;
        }, {}),
      },
    };
  }, [user, applications, events, contacts]);
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ClimbModeGoals({
  goals,
  monthlyProgress,
  customGoals,
  streakCount,
  streakMonths,
  onAddSkill,
  onLogSkillHours,
  onToggleVisibility,
  onLogVisibility,
  onEditGoals,
  getGoalProgress,
  onSaveCustomGoal,
  onToggleCustomStep,
}: ClimbModeGoalsProps) {
  const { user } = useAuth();
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const buildSnapshot = useDataSnapshot();

  const monthKey = format(new Date(), 'yyyy-MM');
  const monthLabel = format(new Date(), 'MMMM yyyy');
  const nextMonthLabel = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), 'MMMM');

  // Load cached briefing on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('career_briefings')
        .select('briefing_data')
        .eq('user_id', user.id)
        .eq('month_key', monthKey)
        .maybeSingle();

      if (data?.briefing_data) {
        setBriefing(data.briefing_data as unknown as BriefingData);
      }
    })();
  }, [user, monthKey]);

  const generateBriefing = async () => {
    if (!user) return;
    setBriefingLoading(true);
    try {
      const snapshot = await buildSnapshot();
      if (!snapshot) throw new Error('Could not build data snapshot');

      const data = await invokeAuthedFunction<BriefingData & { error?: string }>('career-briefing', {
        dataSnapshot: snapshot,
      });

      if (data?.error) throw new Error(data.error);

      setBriefing(data);

      // Cache the briefing
      await supabase.from('career_briefings').upsert(
        {
          user_id: user.id,
          month_key: monthKey,
          briefing_data: data as any,
          generated_at: new Date().toISOString(),
        } as any,
        { onConflict: 'user_id,month_key' }
      );

      toast.success('Briefing generated!');
    } catch (e: any) {
      console.error('Briefing error:', e);
      toast.error(e.message || 'Failed to generate briefing');
    } finally {
      setBriefingLoading(false);
    }
  };

  // Pillar summaries for the activity log
  const enabledVis = goals.visibilityActivities.filter(a => a.enabled);
  const visCompleted = enabledVis.filter(a => a.completed >= a.target).length;
  const skillsOnTrack = goals.skills.filter(s => s.logged >= s.hoursPerWeek).length;

  return (
    <div className="space-y-6">
      {/* ─── Briefing Card ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <CardRetro className="overflow-hidden">
          <CardRetroContent className="p-6 sm:p-8">
            {briefing ? (
              <div className="space-y-8">
                {/* Header */}
                <div>
                  <Badge variant="outline" className="mb-3 text-xs tracking-widest uppercase">
                    Monthly Career Briefing
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-black">{monthLabel}</h2>
                </div>

                {/* Retrospective */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                    Your Last 30 Days
                  </h3>
                  <p className="text-base leading-relaxed">{briefing.retrospective}</p>
                </div>

                {/* Stats Row */}
                {briefing.stats && briefing.stats.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {briefing.stats.map((stat, i) => (
                      <div key={i} className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-2xl sm:text-3xl font-black">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Patterns */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                    What the Data Says
                  </h3>
                  <div className="space-y-2">
                    {briefing.patterns.map((p, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <p className="text-sm leading-relaxed">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blind Spots */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                    What You're Not Seeing
                  </h3>
                  <div className="space-y-2">
                    {briefing.blindSpots.map((b, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                        <Eye className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                        <p className="text-sm leading-relaxed">{b}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* The One Move */}
                <div className="p-5 sm:p-6 rounded-xl bg-primary/10 border-2 border-primary/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                      Your One Move for {nextMonthLabel}
                    </h3>
                  </div>
                  <p className="text-lg font-bold leading-snug mb-4">{briefing.oneMove}</p>
                  <div className="space-y-2">
                    {briefing.supportingActions.map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-xs font-black text-primary mt-0.5">{i + 1}.</span>
                        <p className="text-sm">{a}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regenerate */}
                <ButtonRetro
                  variant="outline"
                  size="sm"
                  onClick={generateBriefing}
                  disabled={briefingLoading}
                  className="gap-2"
                >
                  <RefreshCw className={cn("w-4 h-4", briefingLoading && "animate-spin")} />
                  Regenerate Briefing
                </ButtonRetro>
              </div>
            ) : (
              /* Empty state — generate first briefing */
              <div className="text-center py-10 space-y-5">
                <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20 w-fit mx-auto">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2">{monthLabel} Career Briefing</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Get an AI-powered debrief of your last 30 days — patterns, blind spots, and the one move that will create the most leverage for your career.
                  </p>
                </div>
                <ButtonRetro
                  onClick={generateBriefing}
                  disabled={briefingLoading}
                  className="gap-2"
                >
                  {briefingLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate My Briefing
                    </>
                  )}
                </ButtonRetro>
              </div>
            )}
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* ─── Monthly Streak ────────────────────────────────────────────── */}
      <CardRetro>
        <CardRetroContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-primary" />
              <div>
                <span className="font-black text-lg">{streakCount}</span>
                <span className="text-sm text-muted-foreground ml-2">consecutive months ≥ 70%</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {streakCount >= 1 ? `🔥 ${streakCount} mo streak` : 'Start your streak!'}
            </Badge>
          </div>
        </CardRetroContent>
      </CardRetro>

      {/* ─── Collapsible Activity Log ──────────────────────────────────── */}
      <Collapsible open={activityLogOpen} onOpenChange={setActivityLogOpen}>
        <CollapsibleTrigger asChild>
          <CardRetro className="cursor-pointer hover-lift">
            <CardRetroContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="font-black text-sm">Activity Log</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {visCompleted}/{enabledVis.length} visibility · {monthlyProgress.networkContacts}/{goals.networkContacts} network · {skillsOnTrack}/{goals.skills.length || 0} skills
                    </span>
                  </div>
                </div>
                {activityLogOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardRetroContent>
          </CardRetro>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-4">
            {/* Visibility */}
            <CardRetro>
              <CardRetroContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4" style={{ color: 'hsl(var(--pillar-visibility))' }} />
                  <span className="font-black text-sm uppercase tracking-wide">Visibility</span>
                </div>
                <div className="space-y-2">
                  {goals.visibilityActivities.map(activity => (
                    <div
                      key={activity.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
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
                          <p className="text-sm font-medium truncate">{activity.label}</p>
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
                </div>
              </CardRetroContent>
            </CardRetro>

            {/* Network */}
            <CardRetro>
              <CardRetroContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4" style={{ color: 'hsl(var(--pillar-network))' }} />
                  <span className="font-black text-sm uppercase tracking-wide">Network</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Monthly check-ins</span>
                  <span className="text-lg font-black">{monthlyProgress.networkContacts}/{goals.networkContacts}</span>
                </div>
                <Progress value={getGoalProgress(monthlyProgress.networkContacts, goals.networkContacts)} className="h-2.5" />
              </CardRetroContent>
            </CardRetro>

            {/* Skills */}
            <CardRetro>
              <CardRetroContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" style={{ color: 'hsl(var(--pillar-skills))' }} />
                    <span className="font-black text-sm uppercase tracking-wide">Skills</span>
                  </div>
                  <ButtonRetro variant="outline" size="sm" onClick={onAddSkill} className="gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Add
                  </ButtonRetro>
                </div>
                {goals.skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No skills tracked yet</p>
                ) : (
                  <div className="space-y-3">
                    {goals.skills.map(skill => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => onLogSkillHours(skill.name)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{skill.name}</p>
                          <Progress
                            value={getGoalProgress(skill.logged, skill.hoursPerWeek)}
                            className="h-1.5 mt-1.5"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground ml-3 shrink-0">
                          {skill.logged}/{skill.hoursPerWeek}h
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardRetroContent>
            </CardRetro>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
