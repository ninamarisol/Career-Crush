import { CardRetro } from '@/components/ui/card-retro';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, BarChart3, Target, Lightbulb, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { TrackRecordEntry } from '@/pages/TrackRecord';
import { format } from 'date-fns';

interface TrackRecordCardProps {
  entry: TrackRecordEntry;
  onClick: () => void;
}

const entryTypeConfig = {
  star_story: { icon: Star, color: 'text-yellow-500' },
  feedback_praise: { icon: MessageSquare, color: 'text-blue-500' },
  metric_outcome: { icon: BarChart3, color: 'text-green-500' },
  project_highlight: { icon: Target, color: 'text-purple-500' },
};

const statusConfig = {
  ready_to_use: { icon: CheckCircle2, label: 'Ready to use', color: 'text-green-500' },
  needs_refinement: { icon: AlertCircle, label: 'Needs refinement', color: 'text-yellow-500' },
  needs_refresh: { icon: Clock, label: 'Needs refresh', color: 'text-orange-500' },
};

function getStrengthColor(score: number): string {
  if (score <= 4) return 'text-destructive';
  if (score <= 7) return 'text-yellow-500';
  return 'text-green-500';
}

export function TrackRecordCard({ entry, onClick }: TrackRecordCardProps) {
  const TypeIcon = entryTypeConfig[entry.entry_type]?.icon || Star;
  const typeColor = entryTypeConfig[entry.entry_type]?.color || 'text-primary';
  const StatusIcon = statusConfig[entry.status]?.icon || CheckCircle2;
  const statusLabel = statusConfig[entry.status]?.label || 'Ready';
  const statusColor = statusConfig[entry.status]?.color || 'text-green-500';

  const allTags = [...entry.manual_tags, ...entry.ai_suggested_tags].slice(0, 4);
  const questionCount = entry.ai_potential_questions?.length || 0;
  const lastUsed = entry.usage_log?.length > 0 
    ? entry.usage_log[entry.usage_log.length - 1] 
    : null;

  const displayTitle = entry.title || entry.content.substring(0, 60) + (entry.content.length > 60 ? '...' : '');

  return (
    <CardRetro 
      className="p-4 cursor-pointer hover:shadow-retro transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 ${typeColor}`}>
          <TypeIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm line-clamp-2 mb-2">{displayTitle}</h4>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {allTags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* AI Insights */}
          {questionCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Lightbulb className="h-3 w-3" />
              Could answer {questionCount} interview questions
            </div>
          )}

          {/* Strength score */}
          {entry.ai_strength_score && (
            <div className="flex items-center gap-1 text-xs mb-2">
              <span className={`font-bold ${getStrengthColor(entry.ai_strength_score)}`}>
                {entry.ai_strength_score}/10
              </span>
              <span className="text-muted-foreground">strength</span>
            </div>
          )}

          {/* Status & Last Used */}
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1 ${statusColor}`}>
              <StatusIcon className="h-3 w-3" />
              {statusLabel}
            </div>
            {lastUsed && (
              <span className="text-muted-foreground">
                Last used: {format(new Date(lastUsed.date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>
    </CardRetro>
  );
}
