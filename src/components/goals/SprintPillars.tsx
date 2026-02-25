import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Users, BookOpen, Plus, Check, ExternalLink } from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VisibilityActivity, CustomGoal } from '@/hooks/useGoalCrusher';

interface SprintPillarsProps {
  primaryBlocker: string;
  visibilityActivities: VisibilityActivity[];
  networkContacts: number;
  networkProgress: number;
  priorityContacts: Array<{ name: string; reason: string; contactId: string }>;
  skills: Array<{ name: string; hoursPerWeek: number; logged: number }>;
  customGoals: CustomGoal[];
  onLogVisibility: (id: string) => void;
  onToggleVisibility: (id: string, enabled: boolean) => void;
  onAddSkill: () => void;
  onLogSkillHours: (name: string) => void;
  onAddCustomGoal: (pillar: 'visibility' | 'network' | 'skills') => void;
  onToggleCustomStep: (goalId: string, stepIdx: number) => void;
}

export function SprintPillars({
  primaryBlocker,
  visibilityActivities,
  networkContacts,
  networkProgress,
  priorityContacts,
  skills,
  customGoals,
  onLogVisibility,
  onToggleVisibility,
  onAddSkill,
  onLogSkillHours,
  onAddCustomGoal,
  onToggleCustomStep,
}: SprintPillarsProps) {
  const enabledVis = visibilityActivities.filter(a => a.enabled);
  const isPrimary = (p: string) => p === primaryBlocker;

  const pillarCustomGoals = (pillar: string) => customGoals.filter(g => g.pillar === pillar);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {/* Visibility Pillar */}
      <CardRetro className={cn(
        'transition-all',
        isPrimary('visibility') && 'border-pillar-visibility/50 ring-1 ring-pillar-visibility/20'
      )}>
        <CardRetroContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-pillar-visibility" />
            <span className="font-black text-sm uppercase tracking-wide">Visibility</span>
            {isPrimary('visibility') && <Badge variant="outline" className="text-[10px] ml-auto">Primary</Badge>}
          </div>
          <div className="space-y-2">
            {enabledVis.map(activity => (
              <div key={activity.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Checkbox
                    checked={activity.completed >= activity.target}
                    onCheckedChange={() => onLogVisibility(activity.id)}
                    disabled={activity.completed >= activity.target}
                  />
                  <span className={cn(
                    'text-xs truncate',
                    activity.completed >= activity.target && 'line-through text-muted-foreground'
                  )}>
                    {activity.label}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                  {activity.completed}/{activity.target}
                </span>
              </div>
            ))}
            {pillarCustomGoals('visibility').map(goal => (
              <CustomGoalItem key={goal.id} goal={goal} onToggleStep={onToggleCustomStep} />
            ))}
          </div>
          <button
            onClick={() => onAddCustomGoal('visibility')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-3 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Custom Goal
          </button>
        </CardRetroContent>
      </CardRetro>

      {/* Network Pillar */}
      <CardRetro className={cn(
        'transition-all',
        isPrimary('relationships') && 'border-pillar-network/50 ring-1 ring-pillar-network/20'
      )}>
        <CardRetroContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-pillar-network" />
            <span className="font-black text-sm uppercase tracking-wide">Network</span>
            {isPrimary('relationships') && <Badge variant="outline" className="text-[10px] ml-auto">Primary</Badge>}
          </div>
          <div className="mb-3">
            <span className="text-xs text-muted-foreground">
              {networkProgress}/{networkContacts} monthly check-ins
            </span>
          </div>
          {priorityContacts.length > 0 ? (
            <div className="space-y-3">
              {priorityContacts.slice(0, 3).map((contact, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{contact.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{contact.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No priority contacts flagged yet.</p>
          )}
          {pillarCustomGoals('network').map(goal => (
            <CustomGoalItem key={goal.id} goal={goal} onToggleStep={onToggleCustomStep} />
          ))}
          <button
            onClick={() => onAddCustomGoal('network')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-3 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Custom Goal
          </button>
        </CardRetroContent>
      </CardRetro>

      {/* Skills Pillar */}
      <CardRetro className={cn(
        'transition-all',
        isPrimary('skills') && 'border-pillar-skills/50 ring-1 ring-pillar-skills/20'
      )}>
        <CardRetroContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-pillar-skills" />
            <span className="font-black text-sm uppercase tracking-wide">Skills</span>
            {isPrimary('skills') && <Badge variant="outline" className="text-[10px] ml-auto">Primary</Badge>}
          </div>
          {skills.length > 0 ? (
            <div className="space-y-2">
              {skills.map(skill => (
                <div key={skill.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={skill.logged >= skill.hoursPerWeek} disabled />
                    <span className="text-xs">{skill.name}</span>
                  </div>
                  <button
                    onClick={() => onLogSkillHours(skill.name)}
                    className="text-[10px] text-primary hover:underline"
                  >
                    {skill.logged}/{skill.hoursPerWeek}h
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <BookOpen className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-2">No skills tracked yet</p>
              <ButtonRetro size="sm" variant="outline" onClick={onAddSkill}>
                Add a skill
              </ButtonRetro>
            </div>
          )}
          {pillarCustomGoals('skills').map(goal => (
            <CustomGoalItem key={goal.id} goal={goal} onToggleStep={onToggleCustomStep} />
          ))}
          <button
            onClick={() => onAddCustomGoal('skills')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-3 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Custom Goal
          </button>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}

function CustomGoalItem({ goal, onToggleStep }: { goal: CustomGoal; onToggleStep: (goalId: string, stepIdx: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const completedSteps = goal.steps.filter(s => s.completed).length;

  return (
    <div className="mt-2 p-2.5 rounded-lg bg-muted/20 border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-bold truncate">{goal.refinedGoal}</span>
        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
          {completedSteps}/{goal.steps.length}
        </span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1">
          {goal.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox
                checked={step.completed}
                onCheckedChange={() => onToggleStep(goal.id, i)}
              />
              <span className={cn('text-[11px]', step.completed && 'line-through text-muted-foreground')}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
