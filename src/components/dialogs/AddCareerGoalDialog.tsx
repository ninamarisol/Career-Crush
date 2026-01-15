import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, addMonths } from 'date-fns';

interface AddCareerGoalDialogProps {
  onAddGoal: (data: { title: string; description?: string; deadline?: string }) => void;
  trigger?: React.ReactNode;
}

export function AddCareerGoalDialog({ onAddGoal, trigger }: AddCareerGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(format(addMonths(new Date(), 3), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAddGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: deadline || undefined,
    });
    setTitle('');
    setDescription('');
    setDeadline(format(addMonths(new Date(), 3), 'yyyy-MM-dd'));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <ButtonRetro variant="outline" size="sm">+ Add Goal</ButtonRetro>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Career Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Get AWS Certification"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does achieving this goal look like?"
              className="min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Target Date</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <ButtonRetro type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit" disabled={!title.trim()}>
              Add Goal
            </ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
