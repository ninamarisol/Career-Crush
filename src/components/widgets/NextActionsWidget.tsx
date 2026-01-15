import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { WidgetContainer } from './WidgetContainer';
import { SmartStepDialog } from '@/components/dialogs/SmartStepDialog';
import type { SmartStep } from '@/hooks/useSmartSteps';
import { BaseWidgetProps } from './types';

interface NextActionsWidgetProps extends BaseWidgetProps {
  smartSteps: SmartStep[];
}

export function NextActionsWidget({ smartSteps }: NextActionsWidgetProps) {
  return (
    <WidgetContainer title="Smart Next Steps" icon={Sparkles}>
      <div className="grid md:grid-cols-3 gap-4">
        {smartSteps.length > 0 ? (
          smartSteps.map((step, index) => (
            <div key={`${step.type}-${index}`} className="p-4 bg-muted rounded-lg border-2 border-border">
              <h4 className="font-bold">{step.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              <SmartStepDialog
                step={step}
                trigger={
                  <ButtonRetro size="sm" variant={step.buttonVariant} className="mt-3">
                    {step.buttonLabel}
                  </ButtonRetro>
                }
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-6 text-muted-foreground">
            <p>All caught up! Add more applications to get personalized suggestions. ✨</p>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
