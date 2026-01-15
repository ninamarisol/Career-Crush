import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddSkillDialogProps {
  onAddSkill: (data: { skill_name: string; category: string; target_hours: number }) => void;
  trigger?: React.ReactNode;
}

const SKILL_CATEGORIES = ['Technical', 'Soft Skills', 'Leadership', 'Industry Knowledge', 'Tools & Frameworks'];

export function AddSkillDialog({ onAddSkill, trigger }: AddSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('Technical');
  const [targetHours, setTargetHours] = useState('20');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    
    onAddSkill({
      skill_name: skillName.trim(),
      category,
      target_hours: parseInt(targetHours) || 20,
    });
    setSkillName('');
    setCategory('Technical');
    setTargetHours('20');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <ButtonRetro variant="outline" size="sm">+ Add Skill</ButtonRetro>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Skill to Track</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skillName">Skill Name</Label>
            <Input
              id="skillName"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g., React, Public Speaking, SQL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetHours">Target Hours</Label>
            <Input
              id="targetHours"
              type="number"
              min="1"
              max="1000"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              placeholder="20"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <ButtonRetro type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit" disabled={!skillName.trim()}>
              Add Skill
            </ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
