import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, MessageSquare, Clock, Eye, Settings2 } from 'lucide-react';
import type { CrushModeGoals, ClimbModeGoals, VisibilityActivity } from '@/hooks/useGoalCrusher';
import { UserMode } from '@/context/AppContext';

interface EditGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userMode: UserMode;
  crushGoals: CrushModeGoals;
  climbGoals: ClimbModeGoals;
  onSaveCrushGoals: (goals: Partial<CrushModeGoals>) => void;
  onSaveClimbGoals: (goals: Partial<ClimbModeGoals>) => void;
  onToggleVisibility: (activityId: string, enabled: boolean) => void;
}

export function EditGoalsModal({
  open,
  onOpenChange,
  userMode,
  crushGoals,
  climbGoals,
  onSaveCrushGoals,
  onSaveClimbGoals,
  onToggleVisibility,
}: EditGoalsModalProps) {
  const [localCrushGoals, setLocalCrushGoals] = useState(crushGoals);
  const [localClimbGoals, setLocalClimbGoals] = useState(climbGoals);

  const handleSave = () => {
    if (userMode === 'crush') {
      onSaveCrushGoals(localCrushGoals);
    } else {
      onSaveClimbGoals(localClimbGoals);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Edit Goals
          </DialogTitle>
          <DialogDescription>
            Adjust your targets based on what's working for you
          </DialogDescription>
        </DialogHeader>

        {userMode === 'crush' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Applications/week
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={localCrushGoals.applications}
                  onChange={(e) => setLocalCrushGoals(prev => ({ 
                    ...prev, 
                    applications: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-emerald-500" />
                  New contacts/week
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={localCrushGoals.newContacts}
                  onChange={(e) => setLocalCrushGoals(prev => ({ 
                    ...prev, 
                    newContacts: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  Follow-ups/week
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={localCrushGoals.followUps}
                  onChange={(e) => setLocalCrushGoals(prev => ({ 
                    ...prev, 
                    followUps: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Prep hours/week
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={40}
                  value={localCrushGoals.interviewPrepHours}
                  onChange={(e) => setLocalCrushGoals(prev => ({ 
                    ...prev, 
                    interviewPrepHours: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="network" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="visibility">Visibility</TabsTrigger>
            </TabsList>
            
            <TabsContent value="network" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  Network check-ins per month
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={localClimbGoals.networkContacts}
                  onChange={(e) => setLocalClimbGoals(prev => ({ 
                    ...prev, 
                    networkContacts: parseInt(e.target.value) || 1 
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  Number of key contacts to check in with each month
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="visibility" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Toggle activities on/off and set frequency targets.
              </p>
              <div className="space-y-3">
                {climbGoals.visibilityActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.label}</p>
                      <p className="text-xs text-muted-foreground">{activity.frequency}</p>
                    </div>
                    <Switch
                      checked={activity.enabled}
                      onCheckedChange={(enabled) => onToggleVisibility(activity.id, enabled)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex gap-2 justify-end pt-4 border-t">
          <ButtonRetro variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </ButtonRetro>
          <ButtonRetro onClick={handleSave}>
            Save Changes
          </ButtonRetro>
        </div>
      </DialogContent>
    </Dialog>
  );
}
