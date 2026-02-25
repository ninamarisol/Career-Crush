import React from 'react';
import { motion } from 'framer-motion';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Target, ArrowRightLeft } from 'lucide-react';

interface CrushOneMoveCardProps {
  move: { text: string; category: string } | null;
  onSwap: () => void;
  showAlternate: boolean;
  onExecute: (category: string) => void;
}

const CATEGORY_CTA: Record<string, string> = {
  applications: 'Add application',
  follow_ups: 'Log follow-up',
  interview_prep: 'Start prep',
  networking: 'Reach out',
  resume: 'Optimize resume',
};

export function CrushOneMoveCard({ move, onSwap, showAlternate, onExecute }: CrushOneMoveCardProps) {
  if (!move) return null;

  const cta = CATEGORY_CTA[move.category] || 'Take action';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <CardRetro className="border-primary/30 overflow-hidden">
        <CardRetroContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Your One Move
            </span>
          </div>
          <p className="text-lg sm:text-2xl font-black leading-snug mb-4">{move.text}</p>
          <div className="flex items-center gap-3">
            <ButtonRetro size="sm" onClick={() => onExecute(move.category)}>
              {cta}
            </ButtonRetro>
            <button
              onClick={onSwap}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              {showAlternate ? 'Show original' : 'Show me a different move'}
            </button>
          </div>
          <div className="mt-2">
            <span className="text-[10px] italic text-muted-foreground">AI suggested</span>
          </div>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}
