import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkillTracking } from '@/hooks/useCareerData';

interface LogSkillHoursDialogProps {
  skills: SkillTracking[];
  onLogHours: (skillId: string, hours: number) => void;
  trigger?: React.ReactNode;
}

export function LogSkillHoursDialog({ skills, onLogHours, trigger }: LogSkillHoursDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [hours, setHours] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId || !hours) return;
    
    onLogHours(selectedSkillId, parseFloat(hours));
    setSelectedSkillId('');
    setHours('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <ButtonRetro variant="outline" size="sm">+ Log Learning Time</ButtonRetro>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Learning Time</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill">Skill</Label>
            <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill" />
              </SelectTrigger>
              <SelectContent>
                {skills.map(skill => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.skill_name} ({skill.logged_hours}/{skill.target_hours}h)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Hours</Label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g., 1.5"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <ButtonRetro type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit" disabled={!selectedSkillId || !hours}>
              Log Hours
            </ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
