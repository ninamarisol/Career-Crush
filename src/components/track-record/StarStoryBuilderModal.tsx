import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, AlertTriangle, Loader2, X, Plus, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

interface StarStoryBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIAnalysis {
  suggestedTags: string[];
  potentialQuestions: string[];
  strengthScore: number;
  strengthExplanation: string;
  improvementSuggestion: string;
}

export function StarStoryBuilderModal({ open, onOpenChange }: StarStoryBuilderModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
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

  const analyzeStory = useCallback(async () => {
    if (!situation || !task || !action || !result) {
      return;
    }
    if (situation.length < 10 && task.length < 10 && action.length < 10 && result.length < 10) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-track-record', {
        body: {
          type: 'star_story',
          starStructure: { situation, task, action, result },
        },
      });

      if (error) throw error;
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [situation, task, action, result]);

  const debouncedAnalyze = useDebouncedCallback(analyzeStory, 1500);

  const handleFieldChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    debouncedAnalyze();
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
    if (!user?.id || !situation || !task || !action || !result) return;

    const fullContent = `Situation: ${situation}\n\nTask: ${task}\n\nAction: ${action}\n\nResult: ${result}`;

    setIsSaving(true);
    try {
      const { error } = await supabase.from('track_record_entries').insert({
        user_id: user.id,
        content: fullContent,
        title: title || `STAR: ${situation.substring(0, 40)}...`,
        entry_type: 'star_story',
        star_situation: situation,
        star_task: task,
        star_action: action,
        star_result: result,
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
      toast.success('STAR Story added to Track Record!');
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save STAR story');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSituation('');
    setTask('');
    setAction('');
    setResult('');
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

  const canSave = situation && task && action && result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Build a STAR Story
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="A memorable title for this story..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* STAR Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="situation" className="font-bold">Situation</Label>
              <p className="text-xs text-muted-foreground mb-1">What was the context or challenge?</p>
              <Textarea
                id="situation"
                placeholder="Describe the situation you faced..."
                value={situation}
                onChange={(e) => handleFieldChange(setSituation)(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="task" className="font-bold">Task</Label>
              <p className="text-xs text-muted-foreground mb-1">What did you need to accomplish?</p>
              <Textarea
                id="task"
                placeholder="What was your responsibility or goal?"
                value={task}
                onChange={(e) => handleFieldChange(setTask)(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="action" className="font-bold">Action</Label>
              <p className="text-xs text-muted-foreground mb-1">What specific steps did you take?</p>
              <Textarea
                id="action"
                placeholder="Describe the actions you took..."
                value={action}
                onChange={(e) => handleFieldChange(setAction)(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="result" className="font-bold">Result</Label>
              <p className="text-xs text-muted-foreground mb-1">What was the measurable outcome?</p>
              <Textarea
                id="result"
                placeholder="Describe the results and impact..."
                value={result}
                onChange={(e) => handleFieldChange(setResult)(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Tip: Include numbers, percentages, or quotes
              </p>
            </div>
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
                  {/* Suggested Tags */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Suggested Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.suggestedTags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Strength Score */}
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${
                      analysis.strengthScore <= 4 ? 'text-destructive' :
                      analysis.strengthScore <= 7 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {analysis.strengthScore}/10
                    </span>
                    <span className="text-sm text-muted-foreground">{analysis.strengthExplanation}</span>
                  </div>

                  {/* Potential Questions */}
                  {analysis.potentialQuestions?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Lightbulb className="h-3 w-3 text-primary" />
                        <Label className="text-xs text-muted-foreground">Could answer:</Label>
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
                          {showAllQuestions ? 'Show less' : `+${analysis.potentialQuestions.length - 3} more`}
                        </button>
                      )}
                    </div>
                  )}

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
            <Label className="text-muted-foreground">Context</Label>
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
            <ButtonRetro onClick={handleSave} disabled={!canSave || isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save STAR Story
            </ButtonRetro>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
