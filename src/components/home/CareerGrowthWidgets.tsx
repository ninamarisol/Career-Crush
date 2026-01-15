import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { TrendingUp, BookOpen, Award, Target, Star, Sparkles, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CareerGrowthWidgetsProps {
  stats: {
    skillsInProgress: number;
    completedGoals: number;
    learningStreak: number;
    nextMilestone: string;
  };
  skillsProgress: Array<{
    name: string;
    current: number;
    target: number;
    category: string;
  }>;
  growthGoals: Array<{
    id: string;
    title: string;
    progress: number;
    deadline: string;
  }>;
}

export function CareerGrowthWidgets({ stats, skillsProgress, growthGoals }: CareerGrowthWidgetsProps) {
  return (
    <>
      {/* Growth Progress Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardRetro className="p-4 bg-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary border-2 border-border"><BookOpen className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Skills Building</p>
              <p className="text-2xl font-black">{stats.skillsInProgress}</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-success/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success border-2 border-border"><Award className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Goals Met</p>
              <p className="text-2xl font-black">{stats.completedGoals} 🎯</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary border-2 border-border"><Star className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Learning Streak</p>
              <p className="text-2xl font-black">{stats.learningStreak} days</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-info/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info border-2 border-border"><Target className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Next Milestone</p>
              <p className="text-lg font-black truncate">{stats.nextMilestone}</p>
            </div>
          </div>
        </CardRetro>
      </div>

      {/* Skills Development */}
      <CardRetro>
        <CardRetroHeader>
          <CardRetroTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Skills Development
          </CardRetroTitle>
        </CardRetroHeader>
        <CardRetroContent>
          <div className="space-y-4">
            {skillsProgress.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 px-2 py-0.5 rounded-full bg-muted">{skill.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{skill.current}/{skill.target} hours</span>
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
        </CardRetroContent>
      </CardRetro>

      {/* Growth Goals */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Active Growth Goals
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent className="space-y-3">
            {growthGoals.map(goal => (
              <div key={goal.id} className="p-4 rounded-lg border-2 border-border bg-muted/50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold">{goal.title}</h4>
                  <span className="text-xs text-muted-foreground">{goal.deadline}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full border border-border overflow-hidden">
                    <div 
                      className="h-full bg-success transition-all duration-500" 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Link to="/goals">
              <ButtonRetro variant="outline" className="w-full">
                View All Goals <ArrowRight className="h-4 w-4 ml-2" />
              </ButtonRetro>
            </Link>
          </CardRetroContent>
        </CardRetro>

        <CardRetro>
          <CardRetroHeader>
            <CardRetroTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              This Week's Focus
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="flex-1">Complete leadership course module 3</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border-2 border-border">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">Schedule 1:1 with manager for feedback</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border-2 border-border">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">Practice presentation for team meeting</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border-2 border-border">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">Read "The Manager's Path" Chapter 4</span>
            </div>
          </CardRetroContent>
        </CardRetro>
      </div>
    </>
  );
}
