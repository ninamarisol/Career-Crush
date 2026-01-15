import { useState } from 'react';
import { Sparkles, BookOpen, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WidgetContainer, ProgressBar } from './WidgetContainer';
import { BaseWidgetProps, SkillProgress } from './types';
import { toast } from 'sonner';

interface SkillsProgressWidgetProps extends BaseWidgetProps {
  skills?: SkillProgress[];
}

export function SkillsProgressWidget({ skills: initialSkills }: SkillsProgressWidgetProps) {
  const [skills, setSkills] = useState<SkillProgress[]>(initialSkills || [
    { name: 'Leadership', current: 12, target: 20, category: 'Soft Skills' },
    { name: 'System Design', current: 8, target: 15, category: 'Technical' },
    { name: 'Public Speaking', current: 5, target: 10, category: 'Soft Skills' },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', target: '10', category: 'Technical' });

  const handleAddSkill = () => {
    if (!newSkill.name) {
      toast.error('Please enter a skill name');
      return;
    }

    setSkills(prev => [...prev, {
      name: newSkill.name,
      current: 0,
      target: parseInt(newSkill.target) || 10,
      category: newSkill.category,
    }]);

    setNewSkill({ name: '', target: '10', category: 'Technical' });
    setDialogOpen(false);
    toast.success('Skill goal added! 🎯');
  };

  const handleLogTime = (skillName: string) => {
    setSkills(prev => prev.map(skill => 
      skill.name === skillName 
        ? { ...skill, current: Math.min(skill.current + 1, skill.target) }
        : skill
    ));
    toast.success(`+1 hour logged for ${skillName}! 📚`);
  };

  return (
    <WidgetContainer title="Skills Development" icon={Sparkles}>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                  {skill.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {skill.current}/{skill.target} hours
                </span>
                <ButtonRetro 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleLogTime(skill.name)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </ButtonRetro>
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full border border-border overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500" 
                style={{ width: `${Math.min((skill.current / skill.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <ButtonRetro variant="outline" className="w-full mt-4">
              <BookOpen className="h-4 w-4 mr-2" />
              Add New Skill Goal
            </ButtonRetro>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Skill Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Skill Name</label>
                <Input 
                  placeholder="e.g., Python, Leadership, Public Speaking"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Target Hours</label>
                  <Input 
                    type="number"
                    value={newSkill.target}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, target: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Category</label>
                  <Select 
                    value={newSkill.category} 
                    onValueChange={(val) => setNewSkill(prev => ({ ...prev, category: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                      <SelectItem value="Industry">Industry Knowledge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ButtonRetro onClick={handleAddSkill} className="w-full">
                Add Skill Goal
              </ButtonRetro>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </WidgetContainer>
  );
}
