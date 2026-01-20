import { useState, useEffect } from 'react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMasterResume } from '@/hooks/useMasterResume';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  Building2, 
  HelpCircle, 
  GraduationCap, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  MessageSquare,
  Target,
  Users,
  Briefcase,
  Edit2,
  Check,
  X,
  RefreshCw
} from 'lucide-react';

interface PracticeQuestion {
  category: 'behavioral' | 'technical' | 'situational';
  question: string;
  hint: string;
  userAnswer?: string;
}

interface CoachingTip {
  category: string;
  tip: string;
}

interface InterviewPrepData {
  id: string;
  application_id: string;
  company_research: string;
  practice_questions: PracticeQuestion[];
  coaching_tips: CoachingTip[];
  questions_to_ask: string[];
  updated_at: string;
}

interface InterviewWizardProps {
  applicationId: string;
  jobDescription: string | null;
  jobTitle: string;
  company: string;
  industry: string | null;
}

export function InterviewWizard({ applicationId, jobDescription, jobTitle, company, industry }: InterviewWizardProps) {
  const { user } = useAuth();
  const { masterResume, hasResume: hasMasterResume } = useMasterResume();
  
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingResearch, setGeneratingResearch] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatingCoaching, setGeneratingCoaching] = useState(false);
  const [editingResearch, setEditingResearch] = useState(false);
  const [researchDraft, setResearchDraft] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showAllTips, setShowAllTips] = useState(false);

  // Fetch or create interview prep data
  useEffect(() => {
    if (!user?.id || !applicationId) return;

    const fetchInterviewPrep = async () => {
      try {
        const { data, error } = await supabase
          .from('interview_prep')
          .select('*')
          .eq('application_id', applicationId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching interview prep:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setInterviewPrep({
            ...data,
            practice_questions: (data.practice_questions as unknown as PracticeQuestion[]) || [],
            coaching_tips: (data.coaching_tips as unknown as CoachingTip[]) || [],
            questions_to_ask: (data.questions_to_ask as unknown as string[]) || [],
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchInterviewPrep();
  }, [user?.id, applicationId]);

  const createOrUpdatePrep = async (updates: Partial<{
    company_research: string;
    practice_questions: PracticeQuestion[];
    coaching_tips: CoachingTip[];
    questions_to_ask: string[];
  }>) => {
    if (!user?.id) return null;

    // Convert to JSON-compatible format for Supabase
    const dbUpdates: Record<string, unknown> = {};
    if (updates.company_research !== undefined) dbUpdates.company_research = updates.company_research;
    if (updates.practice_questions !== undefined) dbUpdates.practice_questions = JSON.parse(JSON.stringify(updates.practice_questions));
    if (updates.coaching_tips !== undefined) dbUpdates.coaching_tips = JSON.parse(JSON.stringify(updates.coaching_tips));
    if (updates.questions_to_ask !== undefined) dbUpdates.questions_to_ask = JSON.parse(JSON.stringify(updates.questions_to_ask));

    if (interviewPrep?.id) {
      const { data, error } = await supabase
        .from('interview_prep')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', interviewPrep.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('interview_prep')
        .insert({
          application_id: applicationId,
          user_id: user.id,
          ...dbUpdates,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };

  const handleGenerateResearch = async () => {
    if (!jobDescription) {
      toast.error('Add a job description first to generate company research');
      return;
    }

    setGeneratingResearch(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'research',
          jobDescription,
          jobTitle,
          company,
          industry,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) toast.error('Rate limit exceeded. Please try again later.');
        else if (response.status === 402) toast.error('AI credits exhausted.');
        else toast.error(error.error || 'Failed to generate research');
        return;
      }

      const { content } = await response.json();
      
      const data = await createOrUpdatePrep({ company_research: content });
      if (data) {
        setInterviewPrep(prev => ({
          ...prev!,
          id: data.id,
          application_id: data.application_id,
          company_research: content,
          practice_questions: prev?.practice_questions || [],
          coaching_tips: prev?.coaching_tips || [],
          questions_to_ask: prev?.questions_to_ask || [],
          updated_at: data.updated_at,
        }));
      }
      
      toast.success('Company research generated!');
    } catch (error) {
      console.error('Error generating research:', error);
      toast.error('Failed to generate research');
    } finally {
      setGeneratingResearch(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!jobDescription) {
      toast.error('Add a job description first to generate practice questions');
      return;
    }

    setGeneratingQuestions(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'questions',
          jobDescription,
          jobTitle,
          company,
          industry,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) toast.error('Rate limit exceeded. Please try again later.');
        else if (response.status === 402) toast.error('AI credits exhausted.');
        else toast.error(error.error || 'Failed to generate questions');
        return;
      }

      const { content } = await response.json();
      
      // Parse questions from markdown/JSON
      let questions: PracticeQuestion[] = [];
      try {
        // Try to parse as JSON first
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        }
      } catch {
        console.log('Could not parse questions as JSON, keeping raw content');
      }

      const data = await createOrUpdatePrep({ practice_questions: questions });
      if (data) {
        setInterviewPrep(prev => ({
          ...prev!,
          id: data.id,
          application_id: data.application_id,
          company_research: prev?.company_research || '',
          practice_questions: questions,
          coaching_tips: prev?.coaching_tips || [],
          questions_to_ask: prev?.questions_to_ask || [],
          updated_at: data.updated_at,
        }));
      }
      
      toast.success('Practice questions generated!');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleGenerateCoaching = async () => {
    if (!jobDescription) {
      toast.error('Add a job description first to generate coaching tips');
      return;
    }

    setGeneratingCoaching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'coaching',
          jobDescription,
          jobTitle,
          company,
          industry,
          masterResume: hasMasterResume ? masterResume : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) toast.error('Rate limit exceeded. Please try again later.');
        else if (response.status === 402) toast.error('AI credits exhausted.');
        else toast.error(error.error || 'Failed to generate coaching tips');
        return;
      }

      const { content } = await response.json();
      
      // Parse coaching from JSON
      let coachingData = { experiencesToHighlight: [], skillsToEmphasize: [], gapsToAddress: [], questionsToAsk: [] };
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          coachingData = JSON.parse(jsonMatch[0]);
        }
      } catch {
        console.log('Could not parse coaching as JSON');
      }

      // Convert to our format
      const tips: CoachingTip[] = [
        ...(coachingData.experiencesToHighlight || []).map((exp: any) => ({
          category: 'experience',
          tip: `**${exp.experience}** - ${exp.relevance}. ${exp.howToFrame}`,
        })),
        ...(coachingData.skillsToEmphasize || []).map((skill: any) => ({
          category: 'skill',
          tip: `**${skill.skill}**: ${skill.example}`,
        })),
        ...(coachingData.gapsToAddress || []).map((gap: any) => ({
          category: 'gap',
          tip: `⚠️ ${gap.gap}: ${gap.howToAddress}`,
        })),
      ];

      const questionsToAsk = coachingData.questionsToAsk || [];

      const data = await createOrUpdatePrep({ 
        coaching_tips: tips,
        questions_to_ask: questionsToAsk,
      });
      
      if (data) {
        setInterviewPrep(prev => ({
          ...prev!,
          id: data.id,
          application_id: data.application_id,
          company_research: prev?.company_research || '',
          practice_questions: prev?.practice_questions || [],
          coaching_tips: tips,
          questions_to_ask: questionsToAsk,
          updated_at: data.updated_at,
        }));
      }
      
      toast.success('Coaching tips generated!');
    } catch (error) {
      console.error('Error generating coaching:', error);
      toast.error('Failed to generate coaching tips');
    } finally {
      setGeneratingCoaching(false);
    }
  };

  const handleSaveResearch = async () => {
    try {
      const data = await createOrUpdatePrep({ company_research: researchDraft });
      if (data) {
        setInterviewPrep(prev => ({
          ...prev!,
          company_research: researchDraft,
          updated_at: data.updated_at,
        }));
      }
      setEditingResearch(false);
      toast.success('Research saved!');
    } catch (error) {
      toast.error('Failed to save research');
    }
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'behavioral': return <Users className="h-4 w-4" />;
      case 'technical': return <Target className="h-4 w-4" />;
      case 'situational': return <Briefcase className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavioral': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'technical': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'situational': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasResearch = interviewPrep?.company_research && interviewPrep.company_research.length > 0;
  const hasQuestions = interviewPrep?.practice_questions && interviewPrep.practice_questions.length > 0;
  const hasCoaching = interviewPrep?.coaching_tips && interviewPrep.coaching_tips.length > 0;
  const completedSections = [hasResearch, hasQuestions, hasCoaching].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <CardRetro className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">Interview Prep Progress</p>
              <p className="text-sm text-muted-foreground">{completedSections}/3 sections completed</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[hasResearch, hasQuestions, hasCoaching].map((done, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  done ? "bg-primary" : "bg-muted"
                )} 
              />
            ))}
          </div>
        </div>
      </CardRetro>

      {/* Company Intel */}
      <CardRetro className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" /> Company Intel
          </h3>
          <div className="flex gap-2">
            {hasResearch && !editingResearch && (
              <ButtonRetro 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setResearchDraft(interviewPrep?.company_research || '');
                  setEditingResearch(true);
                }}
              >
                <Edit2 className="h-3 w-3" /> Edit
              </ButtonRetro>
            )}
            <ButtonRetro 
              size="sm" 
              variant={hasResearch ? "ghost" : "default"}
              onClick={handleGenerateResearch}
              disabled={generatingResearch || !jobDescription}
            >
              {generatingResearch ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
              ) : hasResearch ? (
                <><RefreshCw className="h-3 w-3" /> Regenerate</>
              ) : (
                <><Sparkles className="h-3 w-3" /> Generate</>
              )}
            </ButtonRetro>
          </div>
        </div>

        {!jobDescription && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
            ⚠️ Add a job description in the Overview tab to generate company research.
          </div>
        )}

        {editingResearch ? (
          <div className="space-y-3">
            <textarea
              value={researchDraft}
              onChange={(e) => setResearchDraft(e.target.value)}
              className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[300px] resize-none text-sm"
              placeholder="Add company research notes..."
            />
            <div className="flex gap-2">
              <ButtonRetro size="sm" onClick={handleSaveResearch}>
                <Check className="h-4 w-4" /> Save
              </ButtonRetro>
              <ButtonRetro size="sm" variant="outline" onClick={() => setEditingResearch(false)}>
                <X className="h-4 w-4" /> Cancel
              </ButtonRetro>
            </div>
          </div>
        ) : hasResearch ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div 
              className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto"
              dangerouslySetInnerHTML={{ 
                __html: interviewPrep.company_research
                  .replace(/^## /gm, '<h3 class="font-bold text-base mt-4 mb-2 text-foreground">')
                  .replace(/^### /gm, '<h4 class="font-bold text-sm mt-3 mb-1 text-foreground">')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/- /g, '• ')
              }}
            />
          </div>
        ) : jobDescription ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No company research yet</p>
            <p className="text-sm">Click Generate to get AI-powered insights about {company}</p>
          </div>
        ) : null}
      </CardRetro>

      {/* Practice Questions */}
      <CardRetro className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" /> Practice Questions
            {hasQuestions && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                {interviewPrep.practice_questions.length} questions
              </span>
            )}
          </h3>
          <ButtonRetro 
            size="sm" 
            variant={hasQuestions ? "ghost" : "default"}
            onClick={handleGenerateQuestions}
            disabled={generatingQuestions || !jobDescription}
          >
            {generatingQuestions ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
            ) : hasQuestions ? (
              <><RefreshCw className="h-3 w-3" /> Regenerate</>
            ) : (
              <><Sparkles className="h-3 w-3" /> Generate</>
            )}
          </ButtonRetro>
        </div>

        {hasQuestions ? (
          <div className="space-y-3">
            {['behavioral', 'technical', 'situational'].map(category => {
              const categoryQuestions = interviewPrep.practice_questions.filter(q => q.category === category);
              if (categoryQuestions.length === 0) return null;
              
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-bold capitalize flex items-center gap-2 text-muted-foreground">
                    {getCategoryIcon(category)} {category} Questions
                  </h4>
                  {categoryQuestions.map((q, idx) => {
                    const globalIdx = interviewPrep.practice_questions.indexOf(q);
                    const isExpanded = expandedQuestions.has(globalIdx);
                    
                    return (
                      <div 
                        key={idx}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(globalIdx)}
                          className="w-full p-3 text-left flex items-start gap-3 hover:bg-muted/50 transition-colors"
                        >
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium shrink-0 mt-0.5", getCategoryColor(category))}>
                            {idx + 1}
                          </span>
                          <span className="flex-1 text-sm font-medium">{q.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-0">
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                <Lightbulb className="h-3 w-3" /> What they're really asking:
                              </p>
                              <p className="text-sm text-muted-foreground">{q.hint}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No practice questions yet</p>
            <p className="text-sm">Generate questions tailored to {company}'s {jobTitle} role</p>
          </div>
        )}
      </CardRetro>

      {/* Your Playbook - Coaching Tips */}
      <CardRetro className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-600" /> Your Playbook
          </h3>
          <ButtonRetro 
            size="sm" 
            variant={hasCoaching ? "ghost" : "default"}
            onClick={handleGenerateCoaching}
            disabled={generatingCoaching || !jobDescription}
          >
            {generatingCoaching ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
            ) : hasCoaching ? (
              <><RefreshCw className="h-3 w-3" /> Regenerate</>
            ) : (
              <><Sparkles className="h-3 w-3" /> Generate</>
            )}
          </ButtonRetro>
        </div>

        {!hasMasterResume && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300 mb-4">
            💡 Add your master resume in Profile for personalized coaching tips based on your experience.
          </div>
        )}

        {hasCoaching ? (
          <div className="space-y-4">
            {/* Grouped Tips */}
            {['experience', 'skill', 'gap'].map(category => {
              const categoryTips = interviewPrep.coaching_tips.filter(t => t.category === category);
              if (categoryTips.length === 0) return null;

              const labels = {
                experience: { title: 'Experiences to Highlight', color: 'text-blue-600' },
                skill: { title: 'Skills to Emphasize', color: 'text-purple-600' },
                gap: { title: 'Gaps to Address', color: 'text-amber-600' },
              };

              return (
                <div key={category} className="space-y-2">
                  <h4 className={cn("text-sm font-bold", labels[category as keyof typeof labels].color)}>
                    {labels[category as keyof typeof labels].title}
                  </h4>
                  <div className="space-y-2">
                    {(showAllTips ? categoryTips : categoryTips.slice(0, 3)).map((tip, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: tip.tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {interviewPrep.coaching_tips.length > 9 && (
              <ButtonRetro 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => setShowAllTips(!showAllTips)}
              >
                {showAllTips ? 'Show Less' : 'Show All Tips'}
                {showAllTips ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </ButtonRetro>
            )}

            {/* Questions to Ask */}
            {interviewPrep.questions_to_ask && interviewPrep.questions_to_ask.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" /> Questions to Ask Them
                </h4>
                <ul className="space-y-2">
                  {interviewPrep.questions_to_ask.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No coaching tips yet</p>
            <p className="text-sm">Get personalized tips on what to highlight from your experience</p>
          </div>
        )}
      </CardRetro>
    </div>
  );
}
