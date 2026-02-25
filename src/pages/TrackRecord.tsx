import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CardRetro } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, BarChart3, Target, Plus, Search, Sparkles } from 'lucide-react';
import { QuickAddModal } from '@/components/track-record/QuickAddModal';
import { StarStoryBuilderModal } from '@/components/track-record/StarStoryBuilderModal';
import { EntryDetailModal } from '@/components/track-record/EntryDetailModal';
import { TrackRecordCard } from '@/components/track-record/TrackRecordCard';
import { toast } from 'sonner';

export interface TrackRecordEntry {
  id: string;
  user_id: string;
  content: string;
  title: string | null;
  entry_type: 'star_story' | 'feedback_praise' | 'metric_outcome' | 'project_highlight';
  manual_tags: string[];
  ai_suggested_tags: string[];
  ai_potential_questions: string[];
  ai_strength_score: number | null;
  ai_strength_explanation: string | null;
  ai_improvement_suggestion: string | null;
  star_situation: string | null;
  star_task: string | null;
  star_action: string | null;
  star_result: string | null;
  context_company: string | null;
  context_role: string | null;
  context_date: string | null;
  context_project: string | null;
  usage_log: { usedFor: string; date: string }[];
  status: 'ready_to_use' | 'needs_refinement' | 'needs_refresh';
  created_at: string;
  updated_at: string;
}

const entryTypeConfig = {
  star_story: { icon: Star, label: 'STAR Stories', color: 'text-yellow-500' },
  feedback_praise: { icon: MessageSquare, label: 'Feedback & Praise', color: 'text-blue-500' },
  metric_outcome: { icon: BarChart3, label: 'Metrics & Outcomes', color: 'text-green-500' },
  project_highlight: { icon: Target, label: 'Project Highlights', color: 'text-purple-500' },
};

export default function TrackRecord() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [starBuilderOpen, setStarBuilderOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TrackRecordEntry | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['track-record-entries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('track_record_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TrackRecordEntry[];
    },
    enabled: !!user?.id,
  });

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('track_record_entries')
        .delete()
        .eq('id', entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-record-entries'] });
      toast.success('Entry deleted');
      setSelectedEntry(null);
    },
    onError: () => {
      toast.error('Failed to delete entry');
    },
  });

  const markAsUsed = useMutation({
    mutationFn: async ({ entryId, usedFor }: { entryId: string; usedFor: string }) => {
      const entry = entries.find(e => e.id === entryId);
      if (!entry) throw new Error('Entry not found');
      
      const newUsageLog = [...(entry.usage_log || []), { usedFor, date: new Date().toISOString() }];
      
      const { error } = await supabase
        .from('track_record_entries')
        .update({ usage_log: newUsageLog })
        .eq('id', entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-record-entries'] });
      toast.success('Usage logged');
    },
  });

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entry =>
        entry.content.toLowerCase().includes(query) ||
        entry.title?.toLowerCase().includes(query) ||
        entry.manual_tags.some(tag => tag.toLowerCase().includes(query)) ||
        entry.ai_suggested_tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(entry => entry.entry_type === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(entry => entry.status === statusFilter);
    }

    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'strength':
        result.sort((a, b) => (b.ai_strength_score || 0) - (a.ai_strength_score || 0));
        break;
      case 'usage':
        result.sort((a, b) => (b.usage_log?.length || 0) - (a.usage_log?.length || 0));
        break;
    }

    return result;
  }, [entries, searchQuery, typeFilter, statusFilter, sortBy]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, TrackRecordEntry[]> = {
      star_story: [],
      feedback_praise: [],
      metric_outcome: [],
      project_highlight: [],
    };
    
    filteredEntries.forEach(entry => {
      groups[entry.entry_type].push(entry);
    });
    
    return groups;
  }, [filteredEntries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading your track record...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Track Record</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Your proof of impact—ready when you need it</p>
        </div>
      </div>

      {/* Quick Add Section */}
      <CardRetro className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="h-5 w-5 text-primary shrink-0" />
          <h2 className="font-bold text-base sm:text-lg">Quick Add to Track Record</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
          Paste feedback, describe a win, or tell a story about your impact...
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <ButtonRetro onClick={() => setQuickAddOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </ButtonRetro>
          <ButtonRetro variant="secondary" onClick={() => setStarBuilderOpen(true)} className="w-full sm:w-auto">
            <Star className="h-4 w-4 mr-2" />
            Build STAR Story
          </ButtonRetro>
        </div>
      </CardRetro>

      {/* Filters - stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px] sm:w-[160px] shrink-0">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="star_story">STAR Stories</SelectItem>
              <SelectItem value="feedback_praise">Feedback</SelectItem>
              <SelectItem value="metric_outcome">Metrics</SelectItem>
              <SelectItem value="project_highlight">Projects</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] sm:w-[160px] shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready_to_use">Ready</SelectItem>
              <SelectItem value="needs_refinement">Refine</SelectItem>
              <SelectItem value="needs_refresh">Refresh</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px] sm:w-[160px] shrink-0">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="usage">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Entries by Group */}
      {entries.length === 0 ? (
        <CardRetro className="p-8 sm:p-12 text-center">
          <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg sm:text-xl mb-2">Start Building Your Track Record</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Add your achievements, feedback, and success stories.
          </p>
          <ButtonRetro onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Entry
          </ButtonRetro>
        </CardRetro>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(groupedEntries).map(([type, typeEntries]) => {
            if (typeEntries.length === 0) return null;
            const config = entryTypeConfig[type as keyof typeof entryTypeConfig];
            const Icon = config.icon;
            
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.color}`} />
                  <h3 className="font-bold text-base sm:text-lg">{config.label}</h3>
                  <Badge variant="secondary">{typeEntries.length}</Badge>
                </div>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  {typeEntries.map(entry => (
                    <TrackRecordCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => setSelectedEntry(entry)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <QuickAddModal
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
      />
      <StarStoryBuilderModal
        open={starBuilderOpen}
        onOpenChange={setStarBuilderOpen}
      />
      {selectedEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          open={!!selectedEntry}
          onOpenChange={(open) => !open && setSelectedEntry(null)}
          onDelete={() => deleteEntry.mutate(selectedEntry.id)}
          onMarkAsUsed={(usedFor) => markAsUsed.mutate({ entryId: selectedEntry.id, usedFor })}
        />
      )}
    </div>
  );
}
