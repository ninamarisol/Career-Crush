import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Eye, Plus, Check, 
  TrendingUp, Calendar, ArrowRight
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
      "p-4 rounded-xl border-2 transition-all",
      isComplete ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/30"
    )}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-base">{skill.name}</h4>
        {isComplete ? (
          <Badge className="bg-green-500 text-white">
            <Check className="w-3 h-3 mr-1" /> Done
          </Badge>
        ) : (
          <ButtonRetro size="sm" variant="outline" onClick={onLogHours}>
            <Plus className="w-4 h-4 mr-1" /> Log
          </ButtonRetro>
        )}
      </div>
      
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-black">{skill.logged}h</span>
        <span className="text-muted-foreground">/ {skill.hoursPerWeek}h this week</span>
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
      "p-4 rounded-xl border transition-all",
      !activity.enabled && "opacity-50 bg-muted/20",
      isComplete && activity.enabled && "border-green-500/50 bg-green-500/5"
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-bold text-sm truncate", !activity.enabled && "line-through text-muted-foreground")}>
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold">{activity.completed}</span>
              <span className="text-muted-foreground text-sm">/ {activity.target}</span>
            </div>
            {!isComplete ? (
              <ButtonRetro size="sm" variant="ghost" onClick={onLog} className="h-7 px-2">
                <Plus className="w-3 h-3" />
              </ButtonRetro>
            ) : (
              <Check className="w-4 h-4 text-green-500" />
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
  const completedSkills = goals.skills.filter(s => s.logged >= s.hoursPerWeek).length;
  
  const networkProgress = getGoalProgress(monthlyProgress.networkContacts, goals.networkContacts);
  const skillsProgress = goals.skills.length > 0 
    ? Math.round(goals.skills.reduce((acc, s) => acc + getGoalProgress(s.logged, s.hoursPerWeek), 0) / goals.skills.length)
    : 0;
  const visibilityProgress = enabledActivities.length > 0 
    ? Math.round((completedActivities / enabledActivities.length) * 100)
    : 0;

  const overallProgress = Math.round((networkProgress + skillsProgress + visibilityProgress) / 3);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CardRetro className="bg-gradient-to-br from-blue-500/5 via-emerald-500/5 to-amber-500/5 border-blue-500/20">
          <CardRetroContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl font-black text-blue-600">{overallProgress}%</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black">Career Growth Progress</h2>
                  <p className="text-muted-foreground">
                    Building skills and visibility for your next level
                  </p>
                </div>
              </div>
              
              <ButtonRetro variant="outline" size="sm" onClick={onEditGoals}>
                Edit Goals
              </ButtonRetro>
            </div>

            {/* Mini progress bars */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Skills</span>
                  <span className="font-bold">{skillsProgress}%</span>
                </div>
                <Progress value={skillsProgress} className="h-1.5" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-bold">{networkProgress}%</span>
                </div>
                <Progress value={networkProgress} className="h-1.5" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Visibility</span>
                  <span className="font-bold">{visibilityProgress}%</span>
                </div>
                <Progress value={visibilityProgress} className="h-1.5" />
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      </motion.div>

      {/* Three-Column Layout for Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Development - Weekly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <CardRetro className="h-full">
            <CardRetroHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <CardRetroTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Skills
                  <Badge variant="outline" className="text-xs">Weekly</Badge>
                </CardRetroTitle>
                <ButtonRetro size="sm" variant="ghost" onClick={onAddSkill} className="h-7 px-2">
                  <Plus className="w-4 h-4" />
                </ButtonRetro>
              </div>
            </CardRetroHeader>
            <CardRetroContent className="space-y-3">
              {goals.skills.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">No skills tracked</p>
                  <p className="text-xs mb-3">Add 1-3 skills to develop</p>
                  <ButtonRetro size="sm" onClick={onAddSkill}>
                    <Plus className="w-4 h-4 mr-1" /> Add Skill
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
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    {completedSkills}/{goals.skills.length} on track
                  </p>
                </>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Network Maintenance - Monthly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-1"
        >
          <CardRetro className="h-full">
            <CardRetroHeader className="pb-2">
              <CardRetroTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-emerald-500" />
                Network
                <Badge variant="outline" className="text-xs">Monthly</Badge>
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent>
              <div className={cn(
                "p-4 rounded-xl border-2 mb-4",
                monthlyProgress.networkContacts >= goals.networkContacts 
                  ? "border-green-500/50 bg-green-500/5" 
                  : "border-border"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Check-ins this month</span>
                  {monthlyProgress.networkContacts >= goals.networkContacts && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-black">{monthlyProgress.networkContacts}</span>
                  <span className="text-muted-foreground">/ {goals.networkContacts}</span>
                </div>
                <Progress 
                  value={networkProgress} 
                  className={cn("h-2", monthlyProgress.networkContacts >= goals.networkContacts && "[&>div]:bg-green-500")}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  💡 Coffee chats, LinkedIn messages, emails, or meeting catch-ups
                </p>
                <ButtonRetro variant="outline" size="sm" className="w-full text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Due Contacts
                </ButtonRetro>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Visibility & Branding - Monthly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <CardRetro className="h-full">
            <CardRetroHeader className="pb-2">
              <CardRetroTitle className="flex items-center gap-2 text-base">
                <Eye className="w-4 h-4 text-amber-500" />
                Visibility
                <Badge variant="outline" className="text-xs">Monthly</Badge>
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="space-y-3">
              {goals.visibilityActivities.map(activity => (
                <VisibilityCard
                  key={activity.id}
                  activity={activity}
                  onToggle={(enabled) => onToggleVisibility(activity.id, enabled)}
                  onLog={() => onLogVisibility(activity.id)}
                />
              ))}
              
              {enabledActivities.length > 0 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  {completedActivities}/{enabledActivities.length} complete
                </p>
              )}
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 flex items-start gap-3"
      >
        <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong>Auto-tracking:</strong> Network contacts sync from your Contacts tab. 
          Log visibility wins in your <strong>Track Record</strong> to build your promotion case!
        </div>
      </motion.div>
    </div>
  );
}
