import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Check, Sparkles, Mail, Users, FileText } from 'lucide-react';

interface SmartStepDialogProps {
  trigger: React.ReactNode;
  step: {
    title: string;
    description: string;
    type: 'optimize' | 'followup' | 'network';
  };
}

export function SmartStepDialog({ trigger, step }: SmartStepDialogProps) {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState(false);

  const getIcon = () => {
    switch (step.type) {
      case 'optimize':
        return <FileText className="h-8 w-8 text-primary" />;
      case 'followup':
        return <Mail className="h-8 w-8 text-primary" />;
      case 'network':
        return <Users className="h-8 w-8 text-primary" />;
    }
  };

  const getContent = () => {
    if (completed) {
      return (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-border">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h3 className="text-xl font-bold mb-2">Nice work! 🎉</h3>
          <p className="text-muted-foreground">You're one step closer to your dream job.</p>
          <ButtonRetro className="mt-6" onClick={() => setOpen(false)}>
            Continue Crushing It
          </ButtonRetro>
        </div>
      );
    }

    switch (step.type) {
      case 'optimize':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border-2 border-border">
              <h4 className="font-bold mb-2">Resume Optimization Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Add "Product Strategy" to your skills section</li>
                <li>• Include metrics from your last project</li>
                <li>• Match keywords from the job description</li>
                <li>• Highlight cross-functional collaboration</li>
              </ul>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border-2 border-border">
              <p className="text-sm font-bold">💡 Pro tip: Tailored resumes get 3x more interviews!</p>
            </div>
            <ButtonRetro className="w-full" onClick={() => setCompleted(true)}>
              <Check className="h-4 w-4" /> Mark as Optimized
            </ButtonRetro>
          </div>
        );
      case 'followup':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border-2 border-border">
              <h4 className="font-bold mb-2">Suggested Follow-up Email</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Subject:</strong> Following up on [Role] Application</p>
                <p className="italic">"Hi [Recruiter],</p>
                <p className="italic">I wanted to follow up on my application for the [Role] position submitted on [Date]. I'm very excited about the opportunity to contribute to [Company]'s mission.</p>
                <p className="italic">I'd love to discuss how my experience in [relevant skill] could benefit your team.</p>
                <p className="italic">Best regards, [Your name]"</p>
              </div>
            </div>
            <ButtonRetro className="w-full" onClick={() => setCompleted(true)}>
              <Mail className="h-4 w-4" /> Mark Email Sent
            </ButtonRetro>
          </div>
        );
      case 'network':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border-2 border-border">
              <h4 className="font-bold mb-2">Potential Connections</h4>
              <div className="space-y-3">
                {[
                  { name: 'Alex Chen', role: 'Senior PM', mutual: 3 },
                  { name: 'Sarah Johnson', role: 'Design Lead', mutual: 2 },
                  { name: 'Mike Rivera', role: 'Engineering Manager', mutual: 1 },
                ].map((person) => (
                  <div key={person.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold border-2 border-border">
                      {person.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.role} • {person.mutual} mutual connections</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border-2 border-border">
              <p className="text-sm font-bold">💡 Referrals increase your chances by 10x!</p>
            </div>
            <ButtonRetro className="w-full" onClick={() => setCompleted(true)}>
              <Users className="h-4 w-4" /> Mark Outreach Done
            </ButtonRetro>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setCompleted(false); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md border-2 border-border shadow-retro-xl bg-card">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <DialogTitle className="text-xl font-black">{step.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">{getContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
