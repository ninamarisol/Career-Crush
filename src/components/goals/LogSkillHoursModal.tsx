import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Plus } from 'lucide-react';

interface LogSkillHoursModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
  currentHours: number;
  targetHours: number;
  onLogHours: (skillName: string, newTotal: number) => void;
}

export function LogSkillHoursModal({ 
  open, 
  onOpenChange, 
  skillName,
  currentHours,
  targetHours,
  onLogHours,
}: LogSkillHoursModalProps) {
  const [hoursToAdd, setHoursToAdd] = useState(1);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onLogHours(skillName, currentHours + hoursToAdd);
    setHoursToAdd(1);
    setNotes('');
    onOpenChange(false);
  };

  const newTotal = currentHours + hoursToAdd;
  const willComplete = newTotal >= targetHours;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Log Hours: {skillName}
          </DialogTitle>
          <DialogDescription>
            Current: {currentHours}h / {targetHours}h weekly goal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Hours to add</Label>
            <div className="flex gap-2">
              {[0.5, 1, 2, 3].map(h => (
                <ButtonRetro
                  key={h}
                  variant={hoursToAdd === h ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHoursToAdd(h)}
                >
                  {h}h
                </ButtonRetro>
              ))}
              <Input
                type="number"
                min={0.5}
                max={20}
                step={0.5}
                value={hoursToAdd}
                onChange={(e) => setHoursToAdd(parseFloat(e.target.value) || 0.5)}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>What did you work on? (optional)</Label>
            <Textarea
              placeholder="e.g., Completed chapter 3 of course, practiced coding problems..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {willComplete && (
            <div className="p-3 bg-green-500/10 rounded-lg text-sm">
              <p className="text-green-700 font-medium">
                🎉 This will complete your weekly goal for {skillName}!
              </p>
            </div>
          )}

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>New total this week:</span>
              <span className="font-bold">{newTotal}h / {targetHours}h</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <ButtonRetro variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </ButtonRetro>
          <ButtonRetro onClick={handleSubmit}>
            <Plus className="w-4 h-4 mr-2" />
            Log {hoursToAdd} Hour{hoursToAdd !== 1 ? 's' : ''}
          </ButtonRetro>
        </div>
      </DialogContent>
    </Dialog>
  );
}
