import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Star, MessageSquare, BarChart3, Target, Lightbulb, CheckCircle2, 
  AlertCircle, Clock, Trash2, Copy, Edit, AlertTriangle, Calendar
} from 'lucide-react';
import { TrackRecordEntry } from '@/pages/TrackRecord';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EntryDetailModalProps {
  entry: TrackRecordEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onMarkAsUsed: (usedFor: string) => void;
}

const entryTypeConfig = {
  star_story: { icon: Star, label: 'STAR Story', color: 'text-yellow-500' },
  feedback_praise: { icon: MessageSquare, label: 'Feedback & Praise', color: 'text-blue-500' },
  metric_outcome: { icon: BarChart3, label: 'Metric/Outcome', color: 'text-green-500' },
  project_highlight: { icon: Target, label: 'Project Highlight', color: 'text-purple-500' },
};

const statusConfig = {
  ready_to_use: { icon: CheckCircle2, label: 'Ready to use', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  needs_refinement: { icon: AlertCircle, label: 'Needs refinement', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  needs_refresh: { icon: Clock, label: 'Needs refresh', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
};

function getStrengthColor(score: number): string {
  if (score <= 4) return 'text-destructive';
  if (score <= 7) return 'text-yellow-500';
  return 'text-green-500';
}

export function EntryDetailModal({ entry, open, onOpenChange, onDelete, onMarkAsUsed }: EntryDetailModalProps) {
  const [showMarkAsUsed, setShowMarkAsUsed] = useState(false);
  const [usedForInput, setUsedForInput] = useState('');
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const TypeIcon = entryTypeConfig[entry.entry_type]?.icon || Star;
  const typeLabel = entryTypeConfig[entry.entry_type]?.label || 'Entry';
  const typeColor = entryTypeConfig[entry.entry_type]?.color || 'text-primary';
  const StatusIcon = statusConfig[entry.status]?.icon || CheckCircle2;
  const statusLabel = statusConfig[entry.status]?.label || 'Ready';
  const statusColor = statusConfig[entry.status]?.color || 'text-green-500';
  const statusBgColor = statusConfig[entry.status]?.bgColor || 'bg-green-500/10';

  const allTags = [...entry.manual_tags, ...entry.ai_suggested_tags];
  const questionsToShow = showAllQuestions 
    ? entry.ai_potential_questions 
    : entry.ai_potential_questions?.slice(0, 5);

  const handleMarkAsUsed = () => {
    if (usedForInput.trim()) {
      onMarkAsUsed(usedForInput.trim());
      setUsedForInput('');
      setShowMarkAsUsed(false);
    }
  };

  const contextString = [
    entry.context_company,
    entry.context_role,
    entry.context_date ? format(new Date(entry.context_date), 'MMM yyyy') : null,
  ].filter(Boolean).join(' | ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <TypeIcon className={`h-5 w-5 ${typeColor}`} />
              {typeLabel}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <ButtonRetro variant="ghost" size="icon" title="Duplicate">
                <Copy className="h-4 w-4" />
              </ButtonRetro>
              <ButtonRetro variant="ghost" size="icon" title="Edit">
                <Edit className="h-4 w-4" />
              </ButtonRetro>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <ButtonRetro variant="ghost" size="icon" title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </ButtonRetro>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this track record entry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title & Status */}
          <div>
            <h2 className="font-bold text-xl mb-2">
              {entry.title || entry.content.substring(0, 60) + '...'}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded ${statusBgColor} ${statusColor}`}>
                <StatusIcon className="h-4 w-4" />
                {statusLabel}
              </div>
              {contextString && (
                <span className="text-sm text-muted-foreground">{contextString}</span>
              )}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, i) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Content */}
          {entry.entry_type === 'star_story' && entry.star_situation ? (
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-bold text-sm text-muted-foreground mb-1">Situation</h4>
                <p className="text-sm">{entry.star_situation}</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-sm text-muted-foreground mb-1">Task</h4>
                <p className="text-sm">{entry.star_task}</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-bold text-sm text-muted-foreground mb-1">Action</h4>
                <p className="text-sm">{entry.star_action}</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-bold text-sm text-muted-foreground mb-1">Result</h4>
                <p className="text-sm">{entry.star_result}</p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
            </div>
          )}

          {/* AI Insights */}
          <div className="border-2 border-border rounded-lg p-4 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              AI Insights
            </h3>

            {/* Strength Score */}
            {entry.ai_strength_score && (
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-black ${getStrengthColor(entry.ai_strength_score)}`}>
                  {entry.ai_strength_score}/10
                </span>
                <span className="text-sm text-muted-foreground">{entry.ai_strength_explanation}</span>
              </div>
            )}

            {/* Potential Questions */}
            {entry.ai_potential_questions?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold mb-2">Could answer these interview questions:</h4>
                <ul className="space-y-1">
                  {questionsToShow?.map((q, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {q}
                    </li>
                  ))}
                </ul>
                {entry.ai_potential_questions.length > 5 && (
                  <button
                    className="text-xs text-primary hover:underline mt-2"
                    onClick={() => setShowAllQuestions(!showAllQuestions)}
                  >
                    {showAllQuestions ? 'Show less' : `Show all ${entry.ai_potential_questions.length} questions`}
                  </button>
                )}
              </div>
            )}

            {/* Improvement Suggestion */}
            {entry.ai_improvement_suggestion && (
              <div className="flex items-start gap-2 text-sm bg-muted/50 rounded p-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">Suggestion to improve:</span>
                  <p className="text-muted-foreground">{entry.ai_improvement_suggestion}</p>
                </div>
              </div>
            )}
          </div>

          {/* Usage History */}
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Usage History
            </h3>
            {entry.usage_log?.length > 0 ? (
              <ul className="space-y-2">
                {entry.usage_log.map((usage, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{usage.usedFor}</span>
                    <span className="text-muted-foreground">
                      ({format(new Date(usage.date), 'MMM d, yyyy')})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Not yet used</p>
            )}
          </div>

          {/* Mark as Used */}
          {showMarkAsUsed ? (
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Amazon interview, Q4 review..."
                value={usedForInput}
                onChange={(e) => setUsedForInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMarkAsUsed()}
              />
              <ButtonRetro onClick={handleMarkAsUsed} disabled={!usedForInput.trim()}>
                Save
              </ButtonRetro>
              <ButtonRetro variant="outline" onClick={() => setShowMarkAsUsed(false)}>
                Cancel
              </ButtonRetro>
            </div>
          ) : (
            <div className="flex gap-3 pt-4 border-t">
              <ButtonRetro onClick={() => setShowMarkAsUsed(true)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Used
              </ButtonRetro>
              <ButtonRetro variant="secondary">
                Use in Interview Prep
              </ButtonRetro>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
