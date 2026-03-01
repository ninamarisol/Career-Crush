import React, { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { PriorityWeights } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ButtonRetro } from '@/components/ui/button-retro';

interface PriorityItem {
  key: keyof PriorityWeights;
  label: string;
  emoji: string;
  description: string;
}

const allPriorities: PriorityItem[] = [
  { key: 'location', label: 'Location', emoji: '📍', description: 'Preferred region & remote options' },
  { key: 'salary', label: 'Salary', emoji: '💰', description: 'Compensation & benefits' },
  { key: 'roleType', label: 'Role Type', emoji: '💼', description: 'Matching your target role' },
  { key: 'industry', label: 'Industry', emoji: '🏭', description: 'Industry sector fit' },
  { key: 'companySize', label: 'Company Size', emoji: '🏢', description: 'Startup vs enterprise' },
  { key: 'workStyle', label: 'Work Style', emoji: '💖', description: 'Culture & work-life balance' },
];

// Weights distributed by rank position (must sum to 100)
const RANK_WEIGHTS = [30, 25, 20, 13, 8, 4];

function weightsFromOrder(order: PriorityItem[]): PriorityWeights {
  const weights: Partial<PriorityWeights> = {};
  order.forEach((item, i) => {
    weights[item.key] = RANK_WEIGHTS[i];
  });
  return weights as PriorityWeights;
}

function orderFromWeights(weights: PriorityWeights): PriorityItem[] {
  // Sort priorities by their current weight descending
  return [...allPriorities].sort((a, b) => (weights[b.key] || 0) - (weights[a.key] || 0));
}

interface PriorityRankerProps {
  weights: PriorityWeights;
  onChange: (weights: PriorityWeights) => void;
}

function RankItem({ item, rank }: { item: PriorityItem; rank: number }) {
  const dragControls = useDragControls();

  const rankColors = [
    'border-primary bg-primary/15 shadow-retro-sm',
    'border-primary/80 bg-primary/10',
    'border-primary/60 bg-primary/8',
    'border-border bg-muted/40',
    'border-border bg-muted/25',
    'border-border bg-muted/15',
  ];

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border-2 transition-colors cursor-grab active:cursor-grabbing select-none",
        rankColors[rank] || rankColors[5]
      )}
      whileDrag={{
        scale: 1.03,
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        zIndex: 50,
      }}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Rank badge */}
      <motion.div
        layout
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0",
          rank === 0 ? "bg-primary text-primary-foreground" :
          rank <= 2 ? "bg-primary/20 text-primary" :
          "bg-muted text-muted-foreground"
        )}
      >
        {rank + 1}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.emoji}</span>
          <span className="font-bold text-sm">{item.label}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
      </div>

      {/* Weight */}
      <span className={cn(
        "font-black text-sm min-w-[2.5rem] text-right",
        rank === 0 ? "text-primary" : "text-muted-foreground"
      )}>
        {RANK_WEIGHTS[rank]}%
      </span>

      {/* Drag handle */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="p-1 rounded-md hover:bg-muted/50 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
    </Reorder.Item>
  );
}

export function PriorityRanker({ weights, onChange }: PriorityRankerProps) {
  const [items, setItems] = useState<PriorityItem[]>(() => orderFromWeights(weights));

  const handleReorder = (newOrder: PriorityItem[]) => {
    setItems(newOrder);
    onChange(weightsFromOrder(newOrder));
  };

  const handleReset = () => {
    const defaultOrder = [...allPriorities];
    setItems(defaultOrder);
    onChange(weightsFromOrder(defaultOrder));
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-xl">
        <p className="text-sm font-bold mb-1">
          🏆 Drag to rank what matters most
        </p>
        <p className="text-xs text-muted-foreground">
          Top = highest impact on your match score. Just grab and stack!
        </p>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between px-2 text-xs text-muted-foreground font-medium">
        <span>Most important ↑</span>
        <span>Weight</span>
      </div>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {items.map((item, index) => (
          <RankItem key={item.key} item={item} rank={index} />
        ))}
      </Reorder.Group>

      {/* Labels */}
      <div className="flex items-center justify-between px-2 text-xs text-muted-foreground font-medium">
        <span>Least important ↓</span>
        <span className="font-bold text-primary">Total: 100%</span>
      </div>

      <div className="flex justify-center pt-2">
        <ButtonRetro variant="outline" size="sm" onClick={handleReset}>
          Reset Order
        </ButtonRetro>
      </div>
    </div>
  );
}
