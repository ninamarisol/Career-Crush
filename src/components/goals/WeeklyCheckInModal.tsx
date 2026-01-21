import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalsStatus: { label: string; hit: boolean }[];
  onSubmit: (data: {
    weekStartDate: string;
    goalsHit: string[];
    goalsMissed: string[];
    whatWorked: string;
    whatGotInTheWay: string;
  }) => void;
}

export function WeeklyCheckInModal({ 
  open, 
  onOpenChange, 
  goalsStatus,
  onSubmit 
}: WeeklyCheckInModalProps) {
  const [whatWorked, setWhatWorked] = useState('');
  const [whatGotInTheWay, setWhatGotInTheWay] = useState('');
  const [keepSameGoals, setKeepSameGoals] = useState(true);

  const goalsHit = goalsStatus.filter(g => g.hit).map(g => g.label);
  const goalsMissed = goalsStatus.filter(g => !g.hit).map(g => g.label);

  const handleSubmit = () => {
    onSubmit({
      weekStartDate: new Date().toISOString(),
      goalsHit,
      goalsMissed,
      whatWorked,
      whatGotInTheWay,
    });
    setWhatWorked('');
    setWhatGotInTheWay('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Weekly Check-In
          </DialogTitle>
          <DialogDescription>
            Reflect on your week and set yourself up for success next week
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Goals Summary */}
          <div className="space-y-3">
            <Label>This week's goals</Label>
            <div className="space-y-2">
              {goalsStatus.map((goal, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-sm",
                    goal.hit ? "bg-green-500/10" : "bg-red-500/10"
                  )}
                >
                  {goal.hit ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span>{goal.label}</span>
                  <Badge variant="outline" className={cn(
                    "ml-auto text-xs",
                    goal.hit ? "border-green-500 text-green-600" : "border-red-500 text-red-600"
                  )}>
                    {goal.hit ? 'Hit!' : 'Missed'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div className="space-y-2">
            <Label htmlFor="what-worked">What worked well this week?</Label>
            <Textarea
              id="what-worked"
              placeholder="e.g., Morning routine, batch applying, networking events..."
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="what-blocked">What got in the way?</Label>
            <Textarea
              id="what-blocked"
              placeholder="e.g., Too many interviews, personal commitments..."
              value={whatGotInTheWay}
              onChange={(e) => setWhatGotInTheWay(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Next Week */}
          <div className="space-y-3">
            <Label>For next week</Label>
            <div className="flex gap-2">
              <ButtonRetro
                variant={keepSameGoals ? "default" : "outline"}
                size="sm"
                onClick={() => setKeepSameGoals(true)}
                className="flex-1"
              >
                Keep same goals
              </ButtonRetro>
              <ButtonRetro
                variant={!keepSameGoals ? "default" : "outline"}
                size="sm"
                onClick={() => setKeepSameGoals(false)}
                className="flex-1"
              >
                Adjust goals
              </ButtonRetro>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <ButtonRetro variant="outline" onClick={() => onOpenChange(false)}>
              Skip
            </ButtonRetro>
            <ButtonRetro onClick={handleSubmit}>
              Submit & Start Fresh Week
            </ButtonRetro>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
