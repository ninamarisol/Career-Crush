import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Sparkles, Copy, RefreshCw, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

interface LinkedInHeadlineDialogProps {
  trigger?: React.ReactNode;
}

const headlineTemplates = [
  { template: "[Role] | [Industry] Professional | [Key Skill]", example: "Product Manager | SaaS Professional | Building User-Centric Solutions" },
  { template: "[Role] helping [Target] achieve [Outcome]", example: "Marketing Strategist helping startups achieve 10x growth" },
  { template: "[Role] @ [Company/Industry] | [Value Prop]", example: "Senior Engineer @ FinTech | Scaling systems for millions" },
  { template: "[Role] | [Years]+ years in [Industry] | [Specialty]", example: "UX Designer | 8+ years in HealthTech | Accessibility Champion" },
  { template: "[Passionate about] [Topic] | [Role] | [Achievement]", example: "Passionate about AI Ethics | Data Scientist | Ex-Google" },
];

export function LinkedInHeadlineDialog({ trigger }: LinkedInHeadlineDialogProps) {
  const { jobPreferences } = useApp();
  const [open, setOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState('');
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateHeadlines = () => {
    setIsGenerating(true);
    
    // Simulate generation with templates + user input
    const role = currentRole || (jobPreferences?.roleTypes?.[0] || 'Professional');
    const industry = jobPreferences?.industries?.[0] || 'Technology';
    
    const suggestions = [
      `${role} | ${industry} Expert | Driving Results Through Innovation`,
      `${role} specializing in ${industry} | Open to New Opportunities`,
      `Experienced ${role} | ${industry} Industry | Building What Matters`,
      `${role} | Passionate about ${industry} | Let's Connect!`,
      `${role} helping companies succeed in ${industry} | Problem Solver`,
    ];
    
    setTimeout(() => {
      setGeneratedHeadlines(suggestions);
      setIsGenerating(false);
    }, 500);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <ButtonRetro variant="outline" size="sm">
            Get Suggestions
          </ButtonRetro>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            LinkedIn Headline Suggestions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Your current/target role</label>
            <Input
              placeholder="e.g., Product Manager, Software Engineer"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            />
          </div>

          <ButtonRetro 
            onClick={generateHeadlines} 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Headlines
              </>
            )}
          </ButtonRetro>

          {generatedHeadlines.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-sm font-bold">Click to copy:</p>
              {generatedHeadlines.map((headline, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(headline, index)}
                  className="w-full text-left p-3 rounded-lg border-2 border-border bg-muted/50 hover:bg-muted hover:border-primary transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">{headline}</p>
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-bold mb-2">💡 Pro Tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Keep it under 120 characters</li>
              <li>• Include keywords recruiters search for</li>
              <li>• Show value, not just job title</li>
              <li>• Update it every few months</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
