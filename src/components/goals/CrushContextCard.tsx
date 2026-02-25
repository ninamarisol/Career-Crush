import React from 'react';
import { motion } from 'framer-motion';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { Badge } from '@/components/ui/badge';
import type { JobSearchContext } from '@/hooks/useCrushContext';

const STAGE_LABELS: Record<string, string> = {
  'Just starting out': '🌱 Just Starting',
  'Actively applying': '🚀 Actively Applying',
  'In interviews': '🎤 In Interviews',
  'Final stages': '🏁 Final Stages',
  'Returning after a break': '🔄 Returning',
};

const FRICTION_LABELS: Record<string, string> = {
  resume_not_landing: '📄 Resume conversion',
  getting_ghosted: '👻 Ghosting',
  interviews_not_converting: '🗣️ Interview conversion',
  network_inactive: '🕸️ Network activation',
  not_sure_what_looking_for: '🧭 Direction finding',
};

const URGENCY_LABELS: Record<string, string> = {
  asap: '🔥 High urgency',
  few_months: '📅 Moderate runway',
  exploring: '🌱 Exploring',
  stealth: '💼 Stealth mode',
};

interface CrushContextCardProps {
  context: JobSearchContext;
  onUpdate: () => void;
}

export function CrushContextCard({ context, onUpdate }: CrushContextCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <CardRetro className="border-primary/20">
        <CardRetroContent className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs font-bold">
              {STAGE_LABELS[context.search_stage] || context.search_stage}
            </Badge>
            <Badge variant="outline" className="text-xs font-bold">
              {FRICTION_LABELS[context.friction_type] || `Focus: ${context.friction_type}`}
            </Badge>
            <Badge variant="outline" className="text-xs font-bold">
              {URGENCY_LABELS[context.urgency] || context.urgency}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{context.target_role}</span>
            {context.target_companies && (
              <span> → {context.target_companies}</span>
            )}
          </p>
          <button
            onClick={onUpdate}
            className="text-xs text-muted-foreground hover:text-primary transition-colors mt-2 underline underline-offset-2"
          >
            Update context
          </button>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}
