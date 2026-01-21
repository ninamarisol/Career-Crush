import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus } from 'lucide-react';

interface AddSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSkill: (skillName: string, targetHours: number) => void;
  existingSkills: string[];
}

const SUGGESTED_SKILLS = [
  'Leadership',
  'Public Speaking',
  'Data Analysis',
  'Project Management',
  'Technical Writing',
  'Python',
  'JavaScript',
  'SQL',
  'Machine Learning',
  'Product Management',
  'UX Design',
  'Negotiation',
  'Strategic Thinking',
  'Communication',
];

export function AddSkillModal({ 
  open, 
  onOpenChange, 
  onAddSkill,
  existingSkills 
}: AddSkillModalProps) {
  const [skillName, setSkillName] = useState('');
  const [targetHours, setTargetHours] = useState(5);
  const [customSkill, setCustomSkill] = useState('');

  const availableSuggestions = SUGGESTED_SKILLS.filter(
    s => !existingSkills.includes(s)
  );

  const handleSubmit = () => {
    const finalSkillName = skillName === 'custom' ? customSkill : skillName;
    if (!finalSkillName.trim()) return;
    
    onAddSkill(finalSkillName.trim(), targetHours);
    setSkillName('');
    setCustomSkill('');
    setTargetHours(5);
    onOpenChange(false);
  };

  const canSubmit = skillName === 'custom' 
    ? customSkill.trim().length > 0 
    : skillName.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Add Skill to Track
          </DialogTitle>
          <DialogDescription>
            Choose a skill and set your weekly hours goal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select skill</Label>
            <Select value={skillName} onValueChange={setSkillName}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a skill..." />
              </SelectTrigger>
              <SelectContent>
                {availableSuggestions.map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
                <SelectItem value="custom">+ Custom skill...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {skillName === 'custom' && (
            <div className="space-y-2">
              <Label>Custom skill name</Label>
              <Input
                placeholder="e.g., Rust Programming"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Hours per week goal</Label>
            <Select 
              value={targetHours.toString()} 
              onValueChange={(v) => setTargetHours(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour/week</SelectItem>
                <SelectItem value="2">2 hours/week</SelectItem>
                <SelectItem value="3">3 hours/week</SelectItem>
                <SelectItem value="5">5 hours/week</SelectItem>
                <SelectItem value="10">10 hours/week</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Start small and increase as you build momentum
            </p>
          </div>

          {existingSkills.length >= 3 && (
            <div className="p-3 bg-amber-500/10 rounded-lg text-sm">
              <p className="text-amber-700">
                💡 Tip: Focus on 1-3 skills at a time for best results. 
                You can always swap skills later.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <ButtonRetro variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </ButtonRetro>
          <ButtonRetro onClick={handleSubmit} disabled={!canSubmit}>
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </ButtonRetro>
        </div>
      </DialogContent>
    </Dialog>
  );
}
