import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Send } from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface StreakAndCaptureProps {
  streakCount: number;
  streakMonths: string[];
  onWinLogged: () => void;
}

export function StreakAndCapture({ streakCount, streakMonths, onWinLogged }: StreakAndCaptureProps) {
  const { user } = useAuth();
  const [winText, setWinText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !winText.trim()) return;
    setSubmitting(true);
    try {
      // Log to track record
      const { error: trError } = await supabase.from('track_record_entries').insert({
        user_id: user.id,
        content: winText.trim(),
        title: winText.trim().slice(0, 60),
        entry_type: 'achievement',
        status: 'ready_to_use',
        manual_tags: ['quick-capture', 'goal-crusher'],
        context_date: new Date().toISOString().split('T')[0],
      });
      if (trError) throw trError;

      // Also log as a career win
      const { error: winError } = await supabase.from('career_wins').insert({
        user_id: user.id,
        description: winText.trim(),
        category: 'general',
      });
      if (winError) console.error('Win log error:', winError);

      toast.success('Win captured! 🎉');
      setWinText('');
      onWinLogged();
    } catch (e) {
      console.error('Quick capture error:', e);
      toast.error('Failed to capture win');
    } finally {
      setSubmitting(false);
    }
  };

  // Build last 6 months dots
  const last6 = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const isCurrent = i === 0;
    const completed = streakMonths.includes(key);
    last6.push({ key, completed, isCurrent });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Monthly Streak */}
      <CardRetro>
        <CardRetroContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Monthly Streak
            </span>
          </div>
          <div className="text-center mb-4">
            <span className="text-5xl font-black text-primary">{streakCount}</span>
            <p className="text-xs text-muted-foreground mt-1">consecutive months ≥70% complete</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {last6.map(month => (
              <div
                key={month.key}
                className={cn(
                  'w-3 h-3 rounded-full transition-all',
                  month.completed
                    ? 'bg-primary'
                    : month.isCurrent
                      ? 'bg-primary/40 animate-pulse-scale'
                      : 'bg-muted'
                )}
                title={month.key}
              />
            ))}
          </div>
          {streakCount > 0 && (
            <p className="text-xs text-center text-muted-foreground mt-3 italic">
              {streakCount} month{streakCount !== 1 ? 's' : ''} strong — keep the momentum going.
            </p>
          )}
        </CardRetroContent>
      </CardRetro>

      {/* Quick Capture */}
      <CardRetro>
        <CardRetroContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Quick Capture
            </span>
          </div>
          <div className="space-y-3">
            <textarea
              className="flex w-full rounded-lg border-2 border-border bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-none"
              placeholder="Something happened this week —"
              value={winText}
              onChange={(e) => setWinText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) handleSubmit();
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Saves to Track Record</span>
              <ButtonRetro
                size="sm"
                onClick={handleSubmit}
                disabled={!winText.trim() || submitting}
                className="gap-1"
              >
                <Send className="w-3 h-3" />
                Capture
              </ButtonRetro>
            </div>
          </div>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}
