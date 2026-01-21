import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Eye, Plus, Check, 
  TrendingUp, Sparkles, Calendar
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { Progress } from '@/components/ui/progress';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ClimbModeGoals as ClimbGoalsType, MonthlyProgress, VisibilityActivity } from '@/hooks/useGoalCrusher';

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

function SkillCard({ 
  skill, 
  onLogHours 
}: { 
  skill: { name: string; hoursPerWeek: number; logged: number }; 
  onLogHours: () => void;
}) {
  const progress = Math.min(100, Math.round((skill.logged / skill.hoursPerWeek) * 100));
  const isComplete = skill.logged >= skill.hoursPerWeek;

  return (
    <div className={cn(
      "p-4 rounded-lg border-2 transition-all",
      isComplete ? "border-green-500/50 bg-green-500/5" : "border-border"
    )}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold">{skill.name}</h4>
        {isComplete ? (
          <Badge className="bg-green-500 text-white">
            <Check className="w-3 h-3 mr-1" /> Done
          </Badge>
        ) : (
          <ButtonRetro size="sm" variant="outline" onClick={onLogHours}>
            <Plus className="w-4 h-4" />
          </ButtonRetro>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="font-bold">{skill.logged}h</span>
        <span className="text-muted-foreground">/ {skill.hoursPerWeek}h per week</span>
      </div>
      
      <Progress value={progress} className={cn("h-2", isComplete && "[&>div]:bg-green-500")} />
    </div>
  );
}

function VisibilityCard({ 
  activity, 
  onToggle, 
  onLog 
}: { 
  activity: VisibilityActivity; 
  onToggle: (enabled: boolean) => void;
  onLog: () => void;
}) {
  const progress = Math.min(100, Math.round((activity.completed / activity.target) * 100));
  const isComplete = activity.completed >= activity.target;

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all",
      !activity.enabled && "opacity-50",
      isComplete && activity.enabled && "border-green-500/50 bg-green-500/5"
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h4 className={cn("font-bold text-sm", !activity.enabled && "line-through")}>
            {activity.label}
          </h4>
          <p className="text-xs text-muted-foreground">{activity.frequency}</p>
        </div>
        <Switch 
          checked={activity.enabled} 
          onCheckedChange={onToggle}
        />
      </div>
      
      {activity.enabled && (
        <>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>{activity.completed} / {activity.target}</span>
            {!isComplete && (
              <ButtonRetro size="sm" variant="outline" onClick={onLog}>
                <Plus className="w-3 h-3" />
              </ButtonRetro>
            )}
            {isComplete && (
              <Badge className="bg-green-500 text-white text-xs">
                <Check className="w-3 h-3" />
              </Badge>
            )}
          </div>
          <Progress value={progress} className={cn("h-1.5", isComplete && "[&>div]:bg-green-500")} />
        </>
      )}
    </div>
  );
}

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
  const enabledActivities = goals.visibilityActivities.filter(a => a.enabled);
  const completedActivities = enabledActivities.filter(a => a.completed >= a.target).length;
  const skillsWithProgress = goals.skills.filter(s => s.logged > 0).length;
  const completedSkills = goals.skills.filter(s => s.logged >= s.hoursPerWeek).length;

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CardRetro className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border-blue-500/30">
          <CardRetroContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-black">Career Growth Dashboard</h2>
                </div>
                <p className="text-muted-foreground">
                  Building expertise and visibility for your next level
                </p>
              </div>
              
              <ButtonRetro variant="outline" size="sm" onClick={onEditGoals}>
                Edit Goals
              </ButtonRetro>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Development - Weekly */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <div className="flex items-center justify-between w-full">
                <CardRetroTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Skill Development
                  <Badge variant="outline" className="ml-2">Weekly</Badge>
                </CardRetroTitle>
                <ButtonRetro size="sm" variant="outline" onClick={onAddSkill}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill
                </ButtonRetro>
              </div>
            </CardRetroHeader>
            <CardRetroContent className="space-y-3">
              {goals.skills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-bold">No skills tracked yet</p>
                  <p className="text-sm">Add 1-3 skills to develop this week</p>
                  <ButtonRetro size="sm" className="mt-4" onClick={onAddSkill}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Skill
                  </ButtonRetro>
                </div>
              ) : (
                <>
                  {goals.skills.map(skill => (
                    <SkillCard 
                      key={skill.name} 
                      skill={skill} 
                      onLogHours={() => onLogSkillHours(skill.name)}
                    />
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      {completedSkills}/{goals.skills.length} skills on track this week
                    </p>
                  </div>
                </>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Network Maintenance - Monthly */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <CardRetro className="h-full">
            <CardRetroHeader>
              <CardRetroTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Network Maintenance
                <Badge variant="outline" className="ml-2">Monthly</Badge>
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent>
              <div className="p-4 bg-muted/30 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Key contacts to check in with</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {monthlyProgress.networkContacts} / {goals.networkContacts}
                  </span>
                </div>
                <Progress 
                  value={getGoalProgress(monthlyProgress.networkContacts, goals.networkContacts)} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  💡 Check-ins include: coffee chats, LinkedIn messages, emails, or meeting catch-ups
                </p>
                <ButtonRetro variant="outline" size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Contacts Due for Check-in
                </ButtonRetro>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>

      {/* Visibility & Branding - Monthly */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              Visibility & Branding
              <Badge variant="outline" className="ml-2">Monthly</Badge>
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent>
            <p className="text-sm text-muted-foreground mb-4">
              Toggle activities on/off based on what matters for your career right now.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.visibilityActivities.map(activity => (
                <VisibilityCard
                  key={activity.id}
                  activity={activity}
                  onToggle={(enabled) => onToggleVisibility(activity.id, enabled)}
                  onLog={() => onLogVisibility(activity.id)}
                />
              ))}
            </div>
            
            {enabledActivities.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Monthly progress: {completedActivities}/{enabledActivities.length} activities complete
                  </span>
                  <Progress 
                    value={(completedActivities / enabledActivities.length) * 100} 
                    className="w-32 h-2"
                  />
                </div>
              </div>
            )}
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Integration Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CardRetro className="bg-muted/30">
          <CardRetroContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <strong>Auto-tracking:</strong> Network contacts sync from your Contacts tab. 
                Log visibility wins in your <strong>Track Record</strong> to build your promotion case!
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>
    </div>
  );
}
