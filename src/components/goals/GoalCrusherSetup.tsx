import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Users, MessageSquare, Clock,
  BookOpen, Eye, ChevronRight, Target, Zap
} from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CrushModeGoals, ClimbModeGoals } from '@/hooks/useGoalCrusher';
import { UserMode } from '@/context/AppContext';

interface GoalCrusherSetupProps {
  userMode: UserMode;
  onComplete: (goals: CrushModeGoals | ClimbModeGoals) => Promise<void>;
  initialCrushGoals?: CrushModeGoals;
  initialClimbGoals?: ClimbModeGoals;
  isEdit?: boolean;
}

export function GoalCrusherSetup({ 
  userMode, 
  onComplete, 
  initialCrushGoals,
  initialClimbGoals,
  isEdit 
}: GoalCrusherSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [crushGoals, setCrushGoals] = useState<CrushModeGoals>(initialCrushGoals || {
    applications: 5,
    newContacts: 3,
    followUps: 2,
    interviewPrepHours: 3,
  });

  const [climbGoals, setClimbGoals] = useState<ClimbModeGoals>(initialClimbGoals || {
    skills: [],
    networkContacts: 5,
    visibilityActivities: [],
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (userMode === 'crush') {
        await onComplete(crushGoals);
      } else {
        await onComplete(climbGoals);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCrushMode = userMode === 'crush';

  return (
    <div className={cn("min-h-screen p-6", isEdit && "min-h-0")}>
      <div className="max-w-2xl mx-auto">
        {!isEdit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black mb-2">
              Set Your Weekly Goals 🎯
            </h1>
            <p className="text-muted-foreground">
              Focus on what you can control. We'll help you track the rest.
            </p>
          </motion.div>
        )}

        {isCrushMode ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CardRetro>
              <CardRetroHeader>
                <CardRetroTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Weekly Job Search Goals
                </CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Set realistic weekly targets. These are about actions you can control, not outcomes.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Applications per week
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={crushGoals.applications}
                      onChange={(e) => setCrushGoals(prev => ({ 
                        ...prev, 
                        applications: parseInt(e.target.value) || 1 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 3-10 quality applications
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      New contacts per week
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={crushGoals.newContacts}
                      onChange={(e) => setCrushGoals(prev => ({ 
                        ...prev, 
                        newContacts: parseInt(e.target.value) || 0 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      LinkedIn connects, referrals, etc.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                      Follow-ups per week
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={crushGoals.followUps}
                      onChange={(e) => setCrushGoals(prev => ({ 
                        ...prev, 
                        followUps: parseInt(e.target.value) || 0 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Reach out to existing contacts
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      Interview prep hours
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={40}
                      value={crushGoals.interviewPrepHours}
                      onChange={(e) => setCrushGoals(prev => ({ 
                        ...prev, 
                        interviewPrepHours: parseInt(e.target.value) || 0 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Practice questions, research, etc.
                    </p>
                  </div>
                </div>
              </CardRetroContent>
            </CardRetro>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CardRetro>
              <CardRetroHeader>
                <CardRetroTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Career Growth Goals
                </CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Focus on skill building and visibility. You'll add specific skills after setup.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      Network check-ins per month
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={climbGoals.networkContacts}
                      onChange={(e) => setClimbGoals(prev => ({ 
                        ...prev, 
                        networkContacts: parseInt(e.target.value) || 1 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Key contacts to maintain relationships with monthly
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <strong>Visibility activities</strong> can be customized after setup. 
                      We'll start with common options like LinkedIn posts and meeting participation.
                    </div>
                  </div>
                </div>
              </CardRetroContent>
            </CardRetro>
          </motion.div>
        )}

        <div className="flex justify-end mt-6">
          <ButtonRetro onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Goals' : 'Start Crushing Goals'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </ButtonRetro>
        </div>
      </div>
    </div>
  );
}
