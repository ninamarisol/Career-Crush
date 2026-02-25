import React from 'react';
import { motion } from 'framer-motion';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyBriefCardProps {
  brief: string | null;
  loading: boolean;
  onGenerate: () => void;
}

export function WeeklyBriefCard({ brief, loading, onGenerate }: WeeklyBriefCardProps) {
  if (!brief && !loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <CardRetro>
          <CardRetroContent className="p-6 text-center space-y-4">
            <Sparkles className="w-8 h-8 text-primary mx-auto" />
            <div>
              <h3 className="font-black text-lg mb-1">Your Weekly Brief</h3>
              <p className="text-sm text-muted-foreground">Get a quick AI-powered read on where your career stands this week.</p>
            </div>
            <ButtonRetro onClick={onGenerate} disabled={loading} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Brief
            </ButtonRetro>
          </CardRetroContent>
        </CardRetro>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <CardRetro className="overflow-hidden">
        <CardRetroContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Your Weekly Brief
            </span>
            <button
              onClick={onGenerate}
              disabled={loading}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-full" />
              <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
              <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
            </div>
          ) : (
            <p className="text-base leading-relaxed border-l-2 border-primary pl-4">
              {brief}
            </p>
          )}
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}
