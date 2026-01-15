import { Sparkles, BookOpen } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { WidgetContainer, ProgressBar } from './WidgetContainer';
import { BaseWidgetProps, SkillProgress } from './types';

interface SkillsProgressWidgetProps extends BaseWidgetProps {
  skills: SkillProgress[];
}

export function SkillsProgressWidget({ skills }: SkillsProgressWidgetProps) {
  return (
    <WidgetContainer title="Skills Development" icon={Sparkles}>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs text-muted-foreground ml-2 px-2 py-0.5 rounded-full bg-muted">
                  {skill.category}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {skill.current}/{skill.target} hours
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full border border-border overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500" 
                style={{ width: `${Math.min((skill.current / skill.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
        <ButtonRetro variant="outline" className="w-full mt-4">
          <BookOpen className="h-4 w-4 mr-2" />
          Add New Skill Goal
        </ButtonRetro>
      </div>
    </WidgetContainer>
  );
}
