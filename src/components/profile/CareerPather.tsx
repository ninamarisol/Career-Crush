import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, RefreshCw, Compass, Target, MapPin, 
  ChevronDown, ChevronUp, CheckCircle2, Circle, 
  Clock, Zap, BookOpen, Users, Award, AlertTriangle,
  ArrowRight, Flag, Rocket
} from "lucide-react";
import { ButtonRetro } from "@/components/ui/button-retro";
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from "@/components/ui/card-retro";
import { useApp } from "@/context/AppContext";
import { MasterResume, JobPreferences } from "@/lib/data";
import { CareerPath, Milestone, calculateProgress, ProgressMetrics } from "@/lib/careerPathTypes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CareerPatherProps {
  resume: MasterResume;
  preferences: JobPreferences | null;
}

export function CareerPather({ resume, preferences }: CareerPatherProps) {
  const { applications } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-pather`;

  const hasEnoughData = () => {
    const hasResume = resume.summary || resume.skills.length > 0 || resume.experience.length > 0;
    const hasPreferences = preferences && (
      preferences.roleTypes.length > 0 ||
      preferences.industries.length > 0 ||
      preferences.salaryRange.min > 0
    );
    return hasResume || hasPreferences;
  };

  const generateCareerPath = async () => {
    if (!hasEnoughData()) {
      toast.error("Please fill out your Master Resume or Dream Job Preferences first!");
      return;
    }

    setIsLoading(true);
    setRawContent("");
    setCareerPath(null);
    setHasGenerated(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          resume,
          preferences,
          applications: applications.slice(0, 20),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (response.status === 402) {
          toast.error("AI credits depleted. Please add credits to your workspace.");
        } else {
          toast.error(errorData.error || "Failed to generate career analysis");
        }
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setRawContent(fullContent);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setRawContent(fullContent);
            }
          } catch { /* ignore */ }
        }
      }

      // Parse the JSON response
      try {
        // Clean up the response - remove markdown code blocks if present
        let cleanedContent = fullContent.trim();
        if (cleanedContent.startsWith("```json")) {
          cleanedContent = cleanedContent.slice(7);
        } else if (cleanedContent.startsWith("```")) {
          cleanedContent = cleanedContent.slice(3);
        }
        if (cleanedContent.endsWith("```")) {
          cleanedContent = cleanedContent.slice(0, -3);
        }
        cleanedContent = cleanedContent.trim();

        const pathData = JSON.parse(cleanedContent) as CareerPath;
        pathData.generatedAt = new Date().toISOString();
        pathData.overallProgress = 0;
        setCareerPath(pathData);
        toast.success("Career path generated!");
      } catch (parseError) {
        console.error("Failed to parse career path JSON:", parseError);
        console.log("Raw content:", fullContent);
        toast.error("Failed to parse career path. Please try again.");
      }
    } catch (error) {
      console.error("Career pather error:", error);
      toast.error("Failed to generate career path. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll during loading
  useEffect(() => {
    if (contentRef.current && isLoading) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [rawContent, isLoading]);

  const getMilestoneStatus = (milestone: Milestone): 'completed' | 'in-progress' | 'not-started' => {
    if (milestone.completed || milestone.progress >= 100) return 'completed';
    if (milestone.progress > 0) return 'in-progress';
    return 'not-started';
  };

  const getMilestoneStatusClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 border-success';
      case 'in-progress':
        return 'bg-warning/10 border-warning';
      default:
        return 'bg-muted border-muted-foreground/30';
    }
  };

  const progressMetrics: ProgressMetrics | null = careerPath ? calculateProgress(careerPath) : null;

  if (!hasGenerated) {
    return (
      <div className="space-y-6">
        {/* Intro Card */}
        <CardRetro className="bg-gradient-to-br from-primary/5 via-transparent to-primary/10 overflow-hidden">
          <CardRetroContent className="p-8 text-center relative">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            </div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-4 border-border flex items-center justify-center shadow-retro relative z-10"
            >
              <Compass className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h2 className="text-3xl font-black mb-3 relative z-10">Career Pather 🗺️</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto relative z-10">
              <strong>Think of it like Google Maps, but for your career.</strong>
              <br />
              Get a personalized roadmap from where you are to your dream job, complete with milestones, skill gaps, and action items.
            </p>

            {!hasEnoughData() && (
              <div className="bg-warning/10 border-2 border-warning/30 p-4 rounded-xl mb-6 text-left max-w-md mx-auto relative z-10">
                <p className="font-bold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Add more info for better results:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fill out your <span className="font-medium">Master Resume</span> with skills & experience</li>
                  <li>• Complete your <span className="font-medium">Dream Job Profiler</span> preferences</li>
                </ul>
              </div>
            )}

            <ButtonRetro
              onClick={generateCareerPath}
              disabled={isLoading || !hasEnoughData()}
              className="gap-2 relative z-10"
              size="lg"
            >
              <Sparkles className="w-5 h-5" />
              {isLoading ? "Generating..." : "Generate My Career Path"}
            </ButtonRetro>
          </CardRetroContent>
        </CardRetro>

        {/* What you'll get */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Target, title: "Gap Analysis", desc: "See exactly what skills, experience, and credentials you need", color: "text-primary", bg: "bg-primary/10" },
            { icon: MapPin, title: "Milestone Roadmap", desc: "Clear steps from your current role to your dream job", color: "text-info", bg: "bg-info/10" },
            { icon: Zap, title: "Action Plan", desc: "Specific tasks for the next 30 days, 6 months, and beyond", color: "text-success", bg: "bg-success/10" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <CardRetro className="p-4 h-full" hoverable>
                <div className={cn("p-3 rounded-xl w-fit mb-3 border-2 border-border", item.bg)}>
                  <item.icon className={cn("w-6 h-6", item.color)} />
                </div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardRetro>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Loading state with raw JSON display
  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardRetro>
          <CardRetroHeader className="border-b-2 border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 border-2 border-border">
                <Compass className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div>
                <CardRetroTitle>Generating Your Career Path...</CardRetroTitle>
                <p className="text-sm text-muted-foreground">Analyzing your profile and creating personalized milestones</p>
              </div>
            </div>
          </CardRetroHeader>
          <CardRetroContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">AI is working its magic...</span>
            </div>
            <div 
              ref={contentRef}
              className="bg-muted/50 rounded-lg p-4 max-h-[300px] overflow-y-auto font-mono text-xs text-muted-foreground"
            >
              {rawContent || "Starting analysis..."}
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
            </div>
          </CardRetroContent>
        </CardRetro>
      </div>
    );
  }

  // Career path display
  if (!careerPath) {
    return (
      <div className="space-y-6">
        <CardRetro>
          <CardRetroContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to generate career path. Please try again.</p>
            <ButtonRetro onClick={generateCareerPath} className="mt-4 gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </ButtonRetro>
          </CardRetroContent>
        </CardRetro>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <CardRetro className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardRetroContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20 border-2 border-border">
                <Compass className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black">Your Career Path</h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{careerPath.currentRole}</span>
                  <ArrowRight className="w-4 h-4 inline mx-2" />
                  <span className="font-medium text-primary">{careerPath.targetRole}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Estimated Journey</p>
                <p className="font-bold text-lg">{careerPath.estimatedDuration}</p>
              </div>
              <ButtonRetro
                variant="outline"
                onClick={generateCareerPath}
                disabled={isLoading}
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </ButtonRetro>
            </div>
          </div>
          
          {/* Progress bar */}
          {progressMetrics && (
            <div className="mt-4 pt-4 border-t-2 border-border/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="font-bold text-primary">{progressMetrics.overallProgress}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden border-2 border-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressMetrics.overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{progressMetrics.milestonesCompleted} / {progressMetrics.totalMilestones} milestones</span>
                <span>{progressMetrics.estimatedTimeRemaining} remaining</span>
              </div>
            </div>
          )}
        </CardRetroContent>
      </CardRetro>

      {/* Target Companies */}
      {careerPath.targetCompanies && careerPath.targetCompanies.length > 0 && (
        <CardRetro>
          <CardRetroContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-5 h-5 text-primary" />
              <span className="font-bold">Target Companies</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {careerPath.targetCompanies.map((company, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium border-2 border-border">
                  {company}
                </span>
              ))}
            </div>
          </CardRetroContent>
        </CardRetro>
      )}

      {/* Vertical Journey Map */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-success via-warning to-muted-foreground/30 rounded-full hidden md:block" />
        
        {/* Target at top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <CardRetro className="bg-gradient-to-r from-primary/10 to-primary/20 border-primary/50">
            <CardRetroContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary border-2 border-border shadow-retro z-10">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">🎯 Target</p>
                  <p className="font-black text-lg">{careerPath.targetRole}</p>
                  {careerPath.targetCompanies?.[0] && (
                    <p className="text-sm text-muted-foreground">{careerPath.targetCompanies.slice(0, 3).join(" / ")}</p>
                  )}
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Milestones (reversed to show target at top) */}
        {[...careerPath.milestones].reverse().map((milestone, index) => {
          const status = getMilestoneStatus(milestone);
          const isExpanded = expandedMilestone === milestone.id;
          const realIndex = careerPath.milestones.length - 1 - index;
          
          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-4"
            >
              <CardRetro 
                className={cn(
                  "transition-all duration-200 cursor-pointer",
                  getMilestoneStatusClasses(status),
                  isExpanded && "shadow-retro-lg"
                )}
                onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
              >
                <CardRetroContent className="p-4">
                  {/* Milestone header */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-full border-2 border-border shadow-retro z-10 flex-shrink-0",
                      status === 'completed' && "bg-success",
                      status === 'in-progress' && "bg-warning",
                      status === 'not-started' && "bg-muted"
                    )}>
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                      ) : status === 'in-progress' ? (
                        <Clock className="w-5 h-5 text-warning-foreground" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                          Milestone {milestone.order} • {milestone.duration}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold",
                            status === 'completed' && "bg-success/20 text-success",
                            status === 'in-progress' && "bg-warning/20 text-warning",
                            status === 'not-started' && "bg-muted text-muted-foreground"
                          )}>
                            {milestone.progress}%
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-black text-lg mb-1">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground">{milestone.role}</p>
                      
                      {/* Progress bar */}
                      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden border border-border">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${milestone.progress}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={cn(
                            "h-full rounded-full",
                            status === 'completed' && "bg-success",
                            status === 'in-progress' && "bg-warning",
                            status === 'not-started' && "bg-muted-foreground/30"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t-2 border-border/50"
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Objectives */}
                          <div>
                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              Objectives
                            </h4>
                            <ul className="space-y-1">
                              {milestone.objectives.map((obj, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <Circle className="w-3 h-3 mt-1.5 flex-shrink-0 text-muted-foreground" />
                                  {obj}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Skills to acquire */}
                          <div>
                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-info" />
                              Skills to Acquire
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {milestone.skillsToAcquire.map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-info/10 text-info rounded text-xs font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Projects */}
                          {milestone.projectsToLead.length > 0 && (
                            <div>
                              <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                <Rocket className="w-4 h-4 text-primary" />
                                Projects to Lead
                              </h4>
                              <ul className="space-y-1">
                                {milestone.projectsToLead.map((project, i) => (
                                  <li key={i} className="text-sm text-muted-foreground">• {project}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Success criteria */}
                          <div>
                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                              <Award className="w-4 h-4 text-warning" />
                              Success Criteria
                            </h4>
                            <ul className="space-y-1">
                              {milestone.successCriteria.map((criteria, i) => (
                                <li key={i} className="text-sm text-muted-foreground">✓ {criteria}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardRetroContent>
              </CardRetro>
            </motion.div>
          );
        })}
        
        {/* Starting point at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: careerPath.milestones.length * 0.1 }}
        >
          <CardRetro className="bg-muted/50">
            <CardRetroContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-muted-foreground border-2 border-border shadow-retro z-10">
                  <MapPin className="w-6 h-6 text-muted" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">📍 Starting Point</p>
                  <p className="font-black text-lg">{careerPath.currentRole}</p>
                  <p className="text-sm text-muted-foreground">Current Position</p>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>
      </div>

      {/* Gap Analysis Summary */}
      {careerPath.gapAnalysis && (
        <CardRetro>
          <CardRetroHeader className="border-b-2 border-border">
            <CardRetroTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Gap Analysis
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Skill gaps */}
              <div>
                <h4 className="font-bold text-sm mb-3">Top Skill Gaps</h4>
                <div className="space-y-2">
                  {careerPath.gapAnalysis.skillGaps.slice(0, 4).map((gap, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{gap.skill}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-bold",
                        gap.priority === "Critical" && "bg-destructive/20 text-destructive",
                        gap.priority === "High" && "bg-warning/20 text-warning",
                        gap.priority === "Medium" && "bg-info/20 text-info",
                        gap.priority === "Nice-to-Have" && "bg-muted text-muted-foreground"
                      )}>
                        {gap.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Experience gap */}
              <div>
                <h4 className="font-bold text-sm mb-3">Experience Strategy</h4>
                <p className="text-sm text-muted-foreground">{careerPath.gapAnalysis.experienceGap.strategy}</p>
                
                {careerPath.gapAnalysis.networkGaps && (
                  <div className="mt-4">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Network Building
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {careerPath.gapAnalysis.networkGaps.targetConnections.slice(0, 4).map((conn, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 rounded text-xs">
                          {conn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>
      )}

      {/* Immediate Actions */}
      {careerPath.actionPlan?.immediate && careerPath.actionPlan.immediate.length > 0 && (
        <CardRetro>
          <CardRetroHeader className="border-b-2 border-border">
            <CardRetroTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Next 30 Days Action Items
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent className="p-4">
            <div className="space-y-3">
              {careerPath.actionPlan.immediate.slice(0, 5).map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={cn(
                    "p-2 rounded-lg border-2 border-border flex-shrink-0",
                    action.category === "Learning" && "bg-info/10",
                    action.category === "Networking" && "bg-primary/10",
                    action.category === "Experience" && "bg-success/10",
                    action.category === "Credibility" && "bg-warning/10"
                  )}>
                    {action.category === "Learning" && <BookOpen className="w-4 h-4 text-info" />}
                    {action.category === "Networking" && <Users className="w-4 h-4 text-primary" />}
                    {action.category === "Experience" && <Rocket className="w-4 h-4 text-success" />}
                    {action.category === "Credibility" && <Award className="w-4 h-4 text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{action.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{action.estimatedTime}</span>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded">{action.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardRetroContent>
        </CardRetro>
      )}

      {/* Resources */}
      {careerPath.resources && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Courses */}
          {careerPath.resources.courses && careerPath.resources.courses.length > 0 && (
            <CardRetro>
              <CardRetroHeader className="pb-2">
                <CardRetroTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-info" />
                  Recommended Courses
                </CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="pt-0">
                <div className="space-y-2">
                  {careerPath.resources.courses.slice(0, 3).map((course, i) => (
                    <div key={i} className="p-2 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.provider} • {course.duration}</p>
                    </div>
                  ))}
                </div>
              </CardRetroContent>
            </CardRetro>
          )}
          
          {/* Books */}
          {careerPath.resources.books && careerPath.resources.books.length > 0 && (
            <CardRetro>
              <CardRetroHeader className="pb-2">
                <CardRetroTitle className="text-base flex items-center gap-2">
                  📚 Recommended Books
                </CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="pt-0">
                <div className="space-y-2">
                  {careerPath.resources.books.slice(0, 3).map((book, i) => (
                    <div key={i} className="p-2 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">{book.title}</p>
                      <p className="text-xs text-muted-foreground">by {book.author}</p>
                    </div>
                  ))}
                </div>
              </CardRetroContent>
            </CardRetro>
          )}
        </div>
      )}

      {/* Risks */}
      {careerPath.risks && careerPath.risks.commonPitfalls && careerPath.risks.commonPitfalls.length > 0 && (
        <CardRetro className="border-warning/50">
          <CardRetroHeader className="border-b-2 border-border">
            <CardRetroTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Watch Out For
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent className="p-4">
            <ul className="space-y-2">
              {careerPath.risks.commonPitfalls.slice(0, 4).map((pitfall, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-warning">⚠️</span>
                  {pitfall}
                </li>
              ))}
            </ul>
          </CardRetroContent>
        </CardRetro>
      )}
    </div>
  );
}
