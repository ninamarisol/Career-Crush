import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CardRetro } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, BarChart3, Target, Plus, Search, Sparkles, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entry =>
        entry.content.toLowerCase().includes(query) ||
        entry.title?.toLowerCase().includes(query) ||
        entry.manual_tags.some(tag => tag.toLowerCase().includes(query)) ||
        entry.ai_suggested_tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(entry => entry.entry_type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(entry => entry.status === statusFilter);
    }

    // Sort
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

  // Group entries by type
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

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(entry => {
      entry.manual_tags.forEach(tag => tags.add(tag));
      entry.ai_suggested_tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [entries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading your track record...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black">Track Record</h1>
        <p className="text-muted-foreground">Your proof of impact—ready when you need it</p>
      </div>

      {/* Quick Add Section */}
      <CardRetro className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">Quick Add to Track Record</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Paste feedback, describe a win, or tell a story about your impact...
        </p>
        <div className="flex gap-3">
          <ButtonRetro onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </ButtonRetro>
          <ButtonRetro variant="secondary" onClick={() => setStarBuilderOpen(true)}>
            <Star className="h-4 w-4 mr-2" />
            Build STAR Story Instead
          </ButtonRetro>
        </div>
      </CardRetro>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="star_story">STAR Stories</SelectItem>
            <SelectItem value="feedback_praise">Feedback/Praise</SelectItem>
            <SelectItem value="metric_outcome">Metrics/Outcomes</SelectItem>
            <SelectItem value="project_highlight">Project Highlights</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready_to_use">Ready to Use</SelectItem>
            <SelectItem value="needs_refinement">Needs Refinement</SelectItem>
            <SelectItem value="needs_refresh">Needs Refresh</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="strength">Strength Score</SelectItem>
            <SelectItem value="usage">Most Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entries by Group */}
      {entries.length === 0 ? (
        <CardRetro className="p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-xl mb-2">Start Building Your Track Record</h3>
          <p className="text-muted-foreground mb-6">
            Add your achievements, feedback, and success stories to prepare for interviews and reviews.
          </p>
          <div className="flex gap-3 justify-center">
            <ButtonRetro onClick={() => setQuickAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Entry
            </ButtonRetro>
          </div>
        </CardRetro>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([type, typeEntries]) => {
            if (typeEntries.length === 0) return null;
            const config = entryTypeConfig[type as keyof typeof entryTypeConfig];
            const Icon = config.icon;
            
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <h3 className="font-bold text-lg">{config.label}</h3>
                  <Badge variant="secondary">{typeEntries.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
