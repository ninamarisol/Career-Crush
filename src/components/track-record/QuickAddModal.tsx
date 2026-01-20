import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Lightbulb, AlertTriangle, Loader2, X, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIAnalysis {
  entryType?: string;
  suggestedTags: string[];
  potentialQuestions: string[];
  strengthScore: number;
  strengthExplanation: string;
  improvementSuggestion: string;
}

const entryTypeLabels: Record<string, string> = {
  star_story: 'STAR Story',
  feedback_praise: 'Feedback/Praise',
  metric_outcome: 'Metric/Outcome',
  project_highlight: 'Project Highlight',
};

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [entryType, setEntryType] = useState<string>('star_story');
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [contextCompany, setContextCompany] = useState('');
  const [contextRole, setContextRole] = useState('');
  const [contextDate, setContextDate] = useState('');
  const [contextProject, setContextProject] = useState('');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const analyzeContent = useCallback(async (text: string) => {
    if (!text || text.length < 20) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-track-record', {
        body: { type: 'quick_add', content: text },
      });

      if (error) throw error;
      setAnalysis(data);
      if (data.entryType) {
        setEntryType(data.entryType);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const debouncedAnalyze = useDebouncedCallback(analyzeContent, 1000);

  const handleContentChange = (value: string) => {
    setContent(value);
    debouncedAnalyze(value);
  };

  const addTag = () => {
    if (newTag && !manualTags.includes(newTag)) {
      setManualTags([...manualTags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setManualTags(manualTags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!user?.id || !content) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from('track_record_entries').insert({
        user_id: user.id,
        content,
        title: title || null,
        entry_type: entryType,
        manual_tags: manualTags,
        ai_suggested_tags: analysis?.suggestedTags || [],
        ai_potential_questions: analysis?.potentialQuestions || [],
        ai_strength_score: analysis?.strengthScore || null,
        ai_strength_explanation: analysis?.strengthExplanation || null,
        ai_improvement_suggestion: analysis?.improvementSuggestion || null,
        context_company: contextCompany || null,
        context_role: contextRole || null,
        context_date: contextDate || null,
        context_project: contextProject || null,
        status: analysis?.strengthScore && analysis.strengthScore >= 7 ? 'ready_to_use' : 'needs_refinement',
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['track-record-entries'] });
      toast.success('Entry added to Track Record!');
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setTitle('');
    setEntryType('star_story');
    setManualTags([]);
    setAnalysis(null);
    setContextCompany('');
    setContextRole('');
    setContextDate('');
    setContextProject('');
  };

  const questionsToShow = showAllQuestions 
    ? analysis?.potentialQuestions 
    : analysis?.potentialQuestions?.slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Track Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="A short title for this entry..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Paste feedback, describe a win, or tell a story about your impact..."
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          {/* AI Analysis */}
          {(isAnalyzing || analysis) && (
            <div className="border-2 border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm">AI Analysis</span>
                {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>

              {analysis && (
                <div className="space-y-4">
                  {/* Entry Type */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Entry Type</Label>
                    <Select value={entryType} onValueChange={setEntryType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(entryTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Suggested Tags */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Suggested Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.suggestedTags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Potential Questions */}
                  {analysis.potentialQuestions?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Lightbulb className="h-3 w-3 text-primary" />
                        <Label className="text-xs text-muted-foreground">This could answer:</Label>
                      </div>
                      <ul className="text-sm space-y-1">
                        {questionsToShow?.map((q, i) => (
                          <li key={i} className="text-muted-foreground">• {q}</li>
                        ))}
                      </ul>
                      {analysis.potentialQuestions.length > 3 && (
                        <button
                          className="text-xs text-primary hover:underline mt-1"
                          onClick={() => setShowAllQuestions(!showAllQuestions)}
                        >
                          {showAllQuestions ? 'Show less' : `+${analysis.potentialQuestions.length - 3} more questions`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Strength Score */}
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${
                      analysis.strengthScore <= 4 ? 'text-destructive' :
                      analysis.strengthScore <= 7 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {analysis.strengthScore}/10
                    </span>
                    <span className="text-sm text-muted-foreground">{analysis.strengthExplanation}</span>
                  </div>

                  {/* Improvement Suggestion */}
                  {analysis.improvementSuggestion && (
                    <div className="flex items-start gap-2 text-sm bg-muted/50 rounded p-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{analysis.improvementSuggestion}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Tags */}
          <div>
            <Label>Your Tags</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {manualTags.map((tag, i) => (
                <Badge key={i} variant="outline" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <ButtonRetro type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </ButtonRetro>
            </div>
          </div>

          {/* Context */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Context (optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="company" className="text-xs">Company</Label>
                <Input
                  id="company"
                  value={contextCompany}
                  onChange={(e) => setContextCompany(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-xs">Role</Label>
                <Input
                  id="role"
                  value={contextRole}
                  onChange={(e) => setContextRole(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-xs">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={contextDate}
                  onChange={(e) => setContextDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="project" className="text-xs">Project</Label>
                <Input
                  id="project"
                  value={contextProject}
                  onChange={(e) => setContextProject(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <ButtonRetro variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </ButtonRetro>
            <ButtonRetro onClick={handleSave} disabled={!content || isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save to Track Record
            </ButtonRetro>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
