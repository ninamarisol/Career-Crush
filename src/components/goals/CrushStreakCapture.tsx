import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Send } from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CrushStreakCaptureProps {
  streakCount: number;
  streakWeeks: boolean[]; // last 8 weeks, true = hit ≥70%
  searchStage: string;
  onLoggedAction: () => void;
}

export function CrushStreakCapture({ streakCount, streakWeeks, searchStage, onLoggedAction }: CrushStreakCaptureProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('track_record_entries').insert({
        user_id: user.id,
        content: text.trim(),
        title: text.trim().slice(0, 60),
        entry_type: 'achievement',
        status: 'ready_to_use',
        manual_tags: ['quick-capture', 'crush-mode'],
        context_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      toast.success('Logged to Track Record! 🎯');
      setText('');
      onLoggedAction();
    } catch (e) {
      console.error('Quick log error:', e);
      toast.error('Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  // Streak message based on search stage
  const getStreakMessage = () => {
    if (streakCount === 0) return "Start your streak this week. Consistency wins the job search.";
    if (streakCount === 1) return "1-week streak. Keep the momentum.";
    if (streakCount <= 3) return `${streakCount}-week streak. Most job seekers quit by week 2. You're not most people.`;
    return `${streakCount}-week streak. Relentless. This is how searches end in offers.`;
  };

  // Last 8 weeks dots
  const dots = streakWeeks.length >= 8 ? streakWeeks.slice(-8) : [
    ...Array(8 - streakWeeks.length).fill(false),
    ...streakWeeks,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Weekly Streak */}
      <CardRetro>
        <CardRetroContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Weekly Streak
            </span>
          </div>
          <div className="text-center mb-4">
            <span className="text-5xl font-black text-primary">{streakCount}</span>
            <p className="text-xs text-muted-foreground mt-1">consecutive weeks ≥70% goals hit</p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            {dots.map((hit, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-all',
                  hit ? 'bg-primary' : i === dots.length - 1 ? 'bg-primary/40 animate-pulse' : 'bg-muted'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground italic">
            {getStreakMessage()}
          </p>
        </CardRetroContent>
      </CardRetro>

      {/* Quick Log */}
      <CardRetro>
        <CardRetroContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Quick Log
            </span>
          </div>
          <div className="space-y-3">
            <textarea
              className="flex w-full rounded-lg border-2 border-border bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-none"
              placeholder="Something happened this week —"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Saves to Track Record</span>
              <ButtonRetro
                size="sm"
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="gap-1"
              >
                <Send className="w-3 h-3" />
                Log it
              </ButtonRetro>
            </div>
          </div>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}
