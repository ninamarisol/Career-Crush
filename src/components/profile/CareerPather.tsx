import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, RefreshCw, Compass, Target, MapPin, 
  ChevronDown, ChevronUp, CheckCircle2, Circle, 
  Clock, Zap, BookOpen, Users, Award, AlertTriangle,
  ArrowRight, ArrowLeft, Flag, Rocket, TrendingUp,
  DollarSign, BarChart3, Shield, Star, Briefcase
} from "lucide-react";
import { ButtonRetro } from "@/components/ui/button-retro";
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from "@/components/ui/card-retro";
import { useApp } from "@/context/AppContext";
import { MasterResume, JobPreferences } from "@/lib/data";
import { 
  GeneratedTrajectories, 
  CareerTrajectory, 
  ActiveCareerPath,
  calculateTrajectoryProgress 
} from "@/lib/careerPathTypes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CareerPatherProps {
  resume: MasterResume;
  preferences: JobPreferences | null;
}

type ViewState = "intro" | "loading" | "select-path" | "path-details" | "active-path";

const pathCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut" as const
    }
  }),
  hover: {
    y: -8,
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

const getIconForTrajectory = (icon: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    "🚀": <Rocket className="w-8 h-8" />,
    "🎯": <Target className="w-8 h-8" />,
    "💼": <Briefcase className="w-8 h-8" />,
    "🌟": <Star className="w-8 h-8" />,
    "🛡️": <Shield className="w-8 h-8" />,
  };
  return iconMap[icon] || <Compass className="w-8 h-8" />;
};

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    "Low": "bg-success/20 text-success",
    "Medium": "bg-info/20 text-info",
    "Medium-High": "bg-warning/20 text-warning",
    "High": "bg-destructive/20 text-destructive",
    "Very High": "bg-destructive/30 text-destructive",
  };
  return colors[difficulty] || "bg-muted text-muted-foreground";
};

const getProbabilityColor = (probability: number) => {
  if (probability >= 80) return "text-success";
  if (probability >= 65) return "text-info";
  if (probability >= 50) return "text-warning";
  return "text-destructive";
};

export function CareerPather({ resume, preferences }: CareerPatherProps) {
  const { applications } = useApp();
  const [viewState, setViewState] = useState<ViewState>("intro");
  const [isLoading, setIsLoading] = useState(false);
  const [trajectories, setTrajectories] = useState<GeneratedTrajectories | null>(null);
  const [selectedPath, setSelectedPath] = useState<CareerTrajectory | null>(null);
  const [activePath, setActivePath] = useState<ActiveCareerPath | null>(null);
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

  const generateTrajectories = async () => {
    if (!hasEnoughData()) {
      toast.error("Please fill out your Master Resume or Dream Job Preferences first!");
      return;
    }

    setIsLoading(true);
    setViewState("loading");
    setRawContent("");
    setTrajectories(null);

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
          toast.error(errorData.error || "Failed to generate career trajectories");
        }
        setViewState("intro");
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

        const data = JSON.parse(cleanedContent) as GeneratedTrajectories;
        data.generatedAt = new Date().toISOString();
        setTrajectories(data);
        setViewState("select-path");
        toast.success("5 career trajectories generated!");
      } catch (parseError) {
        console.error("Failed to parse trajectories JSON:", parseError);
        console.log("Raw content:", fullContent);
        toast.error("Failed to parse career trajectories. Please try again.");
        setViewState("intro");
      }
    } catch (error) {
      console.error("Career pather error:", error);
      toast.error("Failed to generate career trajectories. Please try again.");
      setViewState("intro");
    } finally {
      setIsLoading(false);
    }
  };

  const selectPath = (trajectory: CareerTrajectory) => {
    setSelectedPath(trajectory);
    setViewState("path-details");
  };

  const startPath = () => {
    if (!selectedPath) return;
    
    const newActivePath: ActiveCareerPath = {
      trajectoryId: selectedPath.id,
      trajectory: selectedPath,
      customizations: {},
      overallProgress: 0,
      currentMilestoneIndex: 0,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    
    setActivePath(newActivePath);
    setViewState("active-path");
    toast.success(`Started "${selectedPath.name}" path! Let's do this! 🚀`);
  };

  const goBack = () => {
    if (viewState === "path-details") {
      setSelectedPath(null);
      setViewState("select-path");
    } else if (viewState === "active-path") {
      setViewState("path-details");
    }
  };

  // Auto-scroll during loading
  useEffect(() => {
    if (contentRef.current && isLoading) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [rawContent, isLoading]);

  // ==================== INTRO VIEW ====================
  if (viewState === "intro") {
    return (
      <div className="space-y-6">
        <CardRetro className="bg-gradient-to-br from-primary/5 via-transparent to-primary/10 overflow-hidden">
          <CardRetroContent className="p-8 text-center relative">
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
            <p className="text-muted-foreground mb-2 max-w-lg mx-auto relative z-10">
              <strong>We analyzed your career. Here are 5 natural next moves.</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto relative z-10">
              Pick one, we'll help you get there with a personalized roadmap, milestones, and action items.
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
              onClick={generateTrajectories}
              disabled={isLoading || !hasEnoughData()}
              className="gap-2 relative z-10"
              size="lg"
            >
              <Sparkles className="w-5 h-5" />
              View Your Paths
            </ButtonRetro>
          </CardRetroContent>
        </CardRetro>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Target, title: "5 Career Paths", desc: "AI analyzes your profile and suggests 5 natural next moves", color: "text-primary", bg: "bg-primary/10" },
            { icon: TrendingUp, title: "Compare Options", desc: "See compensation, timeline, and probability for each path", color: "text-info", bg: "bg-info/10" },
            { icon: Zap, title: "Track Progress", desc: "Pick a path and track your milestones to the goal", color: "text-success", bg: "bg-success/10" },
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

  // ==================== LOADING VIEW ====================
  if (viewState === "loading") {
    return (
      <div className="space-y-6">
        <CardRetro>
          <CardRetroHeader className="border-b-2 border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 border-2 border-border">
                <Compass className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div>
                <CardRetroTitle>Analyzing Your Career...</CardRetroTitle>
                <p className="text-sm text-muted-foreground">Generating 5 personalized trajectories</p>
              </div>
            </div>
          </CardRetroHeader>
          <CardRetroContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">AI is crafting your paths...</span>
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

  // ==================== SELECT PATH VIEW ====================
  if (viewState === "select-path" && trajectories) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <CardRetro className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardRetroContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black mb-1">🎯 Your Career Trajectories</h2>
                <p className="text-muted-foreground">
                  Based on your background as <span className="font-medium">{trajectories.currentRole}</span>
                </p>
              </div>
              <ButtonRetro
                variant="outline"
                onClick={generateTrajectories}
                disabled={isLoading}
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </ButtonRetro>
            </div>
            {trajectories.reasoning && (
              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t-2 border-border/50">
                💡 {trajectories.reasoning}
              </p>
            )}
          </CardRetroContent>
        </CardRetro>

        {/* Path Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trajectories.trajectories.map((trajectory, index) => {
            const isRecommended = trajectory.id === trajectories.recommendedPath;
            
            return (
              <motion.div
                key={trajectory.id}
                custom={index}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                variants={pathCardVariants}
              >
                <CardRetro 
                  className={cn(
                    "h-full cursor-pointer transition-all relative overflow-hidden",
                    isRecommended && "ring-2 ring-primary"
                  )}
                  onClick={() => selectPath(trajectory)}
                  hoverable
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                      ⭐ Recommended
                    </div>
                  )}
                  
                  <CardRetroContent className="p-6">
                    {/* Icon and Name */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10 border-2 border-border">
                        {getIconForTrajectory(trajectory.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-lg leading-tight">{trajectory.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{trajectory.targetRole}</p>
                        <p className="text-xs text-muted-foreground truncate">{trajectory.targetCompany}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      {/* Compensation */}
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span className="text-sm font-bold text-success">
                          +${trajectory.compensation.increase.toLocaleString()} ({trajectory.compensation.percentIncrease}%)
                        </span>
                      </div>
                      
                      {/* Timeline */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-info" />
                        <span className="text-sm">{trajectory.timeline}</span>
                      </div>
                      
                      {/* Success Probability */}
                      <div className="flex items-center gap-2">
                        <BarChart3 className={cn("w-4 h-4", getProbabilityColor(trajectory.successProbability))} />
                        <span className={cn("text-sm font-bold", getProbabilityColor(trajectory.successProbability))}>
                          {trajectory.successProbability}% success probability
                        </span>
                      </div>

                      {/* Difficulty Badge */}
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold", getDifficultyColor(trajectory.difficulty))}>
                          {trajectory.difficulty} effort
                        </span>
                      </div>
                    </div>

                    {/* Best For */}
                    <div className="mt-4 pt-4 border-t-2 border-border/50">
                      <p className="text-xs font-bold text-muted-foreground mb-2">BEST IF YOU:</p>
                      <ul className="space-y-1">
                        {trajectory.appeal.bestFor.slice(0, 3).map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span>•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <ButtonRetro variant="outline" size="sm" className="w-full gap-2">
                        View Path <ArrowRight className="w-4 h-4" />
                      </ButtonRetro>
                    </div>
                  </CardRetroContent>
                </CardRetro>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== PATH DETAILS VIEW ====================
  if (viewState === "path-details" && selectedPath) {
    const progress = calculateTrajectoryProgress(selectedPath);
    
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <ButtonRetro variant="ghost" onClick={goBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to All Paths
        </ButtonRetro>

        {/* Header */}
        <CardRetro className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardRetroContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-primary/20 border-2 border-border">
                  {getIconForTrajectory(selectedPath.icon)}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{selectedPath.name}</h2>
                  <p className="text-lg font-medium">{selectedPath.targetRole}</p>
                  <p className="text-muted-foreground">{selectedPath.targetCompany}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <ButtonRetro onClick={startPath} className="gap-2" size="lg">
                  <Rocket className="w-5 h-5" />
                  Start This Path
                </ButtonRetro>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardRetro className="p-4 text-center">
            <DollarSign className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-black text-success">+${selectedPath.compensation.increase.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{selectedPath.compensation.percentIncrease}% increase</p>
          </CardRetro>
          <CardRetro className="p-4 text-center">
            <Clock className="w-6 h-6 text-info mx-auto mb-2" />
            <p className="text-2xl font-black">{selectedPath.timeline}</p>
            <p className="text-xs text-muted-foreground">Timeline</p>
          </CardRetro>
          <CardRetro className="p-4 text-center">
            <BarChart3 className={cn("w-6 h-6 mx-auto mb-2", getProbabilityColor(selectedPath.successProbability))} />
            <p className={cn("text-2xl font-black", getProbabilityColor(selectedPath.successProbability))}>
              {selectedPath.successProbability}%
            </p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </CardRetro>
          <CardRetro className="p-4 text-center">
            <Flag className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-black">{selectedPath.roadmap.milestones.length}</p>
            <p className="text-xs text-muted-foreground">Milestones</p>
          </CardRetro>
        </div>

        {/* Roadmap */}
        <CardRetro>
          <CardRetroHeader className="border-b-2 border-border">
            <CardRetroTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              🗺️ Your Roadmap ({selectedPath.roadmap.milestones.length} Milestones)
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent className="p-4">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-info to-muted-foreground/30" />
              
              {selectedPath.roadmap.milestones.map((milestone, index) => {
                const isExpanded = expandedMilestone === milestone.id;
                
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-16 pb-6 last:pb-0"
                  >
                    {/* Milestone marker */}
                    <div className="absolute left-3 w-6 h-6 rounded-full bg-primary border-2 border-border flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {milestone.order}
                    </div>
                    
                    <CardRetro 
                      className="cursor-pointer"
                      onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                      hoverable
                    >
                      <CardRetroContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black">{milestone.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{milestone.duration}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-4 border-t border-border/50 mt-2"
                            >
                              <div className="grid md:grid-cols-2 gap-4">
                                {/* Objectives */}
                                <div>
                                  <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                    Objectives
                                  </h5>
                                  <ul className="space-y-1">
                                    {milestone.objectives.map((obj, i) => (
                                      <li key={i} className="text-sm flex items-start gap-2">
                                        <Circle className="w-3 h-3 mt-1.5 flex-shrink-0 text-muted-foreground" />
                                        {obj}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                {/* Skills */}
                                <div>
                                  <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-info" />
                                    Skills to Acquire
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {milestone.skillsToAcquire.map((skill, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-info/10 text-info rounded text-xs font-medium">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Resources */}
                                {milestone.resources.length > 0 && (
                                  <div>
                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                                      <Zap className="w-4 h-4 text-warning" />
                                      Resources
                                    </h5>
                                    <ul className="space-y-1">
                                      {milestone.resources.map((resource, i) => (
                                        <li key={i} className="text-sm text-muted-foreground">• {resource}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Success Metrics */}
                                {milestone.successMetrics.length > 0 && (
                                  <div>
                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                                      <Award className="w-4 h-4 text-primary" />
                                      Success Metrics
                                    </h5>
                                    <ul className="space-y-1">
                                      {milestone.successMetrics.map((metric, i) => (
                                        <li key={i} className="text-sm text-muted-foreground">✓ {metric}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardRetroContent>
                    </CardRetro>
                  </motion.div>
                );
              })}
            </div>
          </CardRetroContent>
        </CardRetro>

        {/* Gap Analysis */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <CardRetro className="border-success/30">
            <CardRetroHeader className="pb-2">
              <CardRetroTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                ✅ What You Have Going For You
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="pt-0">
              <ul className="space-y-2">
                {selectedPath.gaps.strengths.map((strength, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-success">•</span> {strength}
                  </li>
                ))}
              </ul>
            </CardRetroContent>
          </CardRetro>

          {/* Needs to Build */}
          <CardRetro className="border-warning/30">
            <CardRetroHeader className="pb-2">
              <CardRetroTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                ⚠️ What You'll Need to Build
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="pt-0">
              <ul className="space-y-2">
                {selectedPath.gaps.needsToBuild.map((need, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-warning">•</span> {need}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-border/50">
                <span className={cn("px-2 py-1 rounded text-xs font-bold", getDifficultyColor(selectedPath.gaps.effortLevel))}>
                  {selectedPath.gaps.effortLevel} Effort Required
                </span>
              </div>
            </CardRetroContent>
          </CardRetro>
        </div>

        {/* Market Context */}
        <CardRetro>
          <CardRetroHeader className="border-b-2 border-border">
            <CardRetroTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-info" />
              📊 Market Context
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-2">
                  <span className="font-bold">Demand Score:</span>{" "}
                  <span className={cn("font-bold", getProbabilityColor(selectedPath.marketContext.demandScore))}>
                    {selectedPath.marketContext.demandScore}/100
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mb-2">{selectedPath.marketContext.hiringTrends}</p>
                <p className="text-sm text-muted-foreground">{selectedPath.marketContext.competitiveLandscape}</p>
              </div>
              <div>
                <p className="font-bold text-sm mb-2">🏢 Top Companies Hiring:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPath.marketContext.topCompanies.map((company, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium border-2 border-border">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>

        {/* Benefits & Tradeoffs */}
        <div className="grid md:grid-cols-2 gap-4">
          <CardRetro>
            <CardRetroHeader className="pb-2">
              <CardRetroTitle className="text-base">🎁 Benefits</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="pt-0">
              <ul className="space-y-2">
                {selectedPath.appeal.benefits.map((benefit, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-success">+</span> {benefit}
                  </li>
                ))}
              </ul>
            </CardRetroContent>
          </CardRetro>

          <CardRetro>
            <CardRetroHeader className="pb-2">
              <CardRetroTitle className="text-base">⚖️ Trade-offs</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="pt-0">
              <ul className="space-y-2">
                {selectedPath.appeal.tradeoffs.map((tradeoff, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">-</span> {tradeoff}
                  </li>
                ))}
              </ul>
            </CardRetroContent>
          </CardRetro>
        </div>

        {/* Start CTA */}
        <CardRetro className="bg-gradient-to-r from-primary/10 to-success/10">
          <CardRetroContent className="p-6 text-center">
            <p className="text-lg font-bold mb-4">Ready to start "{selectedPath.name}"?</p>
            <div className="flex justify-center gap-3">
              <ButtonRetro variant="outline" onClick={goBack}>
                Compare Other Paths
              </ButtonRetro>
              <ButtonRetro onClick={startPath} className="gap-2" size="lg">
                <Rocket className="w-5 h-5" />
                Start This Path
              </ButtonRetro>
            </div>
          </CardRetroContent>
        </CardRetro>
      </div>
    );
  }

  // ==================== ACTIVE PATH VIEW ====================
  if (viewState === "active-path" && activePath) {
    const { trajectory } = activePath;
    const progress = calculateTrajectoryProgress(trajectory);
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <CardRetro className="bg-gradient-to-r from-primary/5 to-success/10">
          <CardRetroContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20 border-2 border-border">
                  {getIconForTrajectory(trajectory.icon)}
                </div>
                <div>
                  <h2 className="text-xl font-black">{trajectory.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{trajectories?.currentRole}</span>
                    <ArrowRight className="w-4 h-4 inline mx-2" />
                    <span className="font-medium text-primary">{trajectory.targetRole}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="font-bold text-lg text-success">+${trajectory.compensation.increase.toLocaleString()}</p>
                </div>
                <ButtonRetro
                  variant="outline"
                  onClick={() => setViewState("select-path")}
                  size="sm"
                >
                  Switch Path
                </ButtonRetro>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 pt-4 border-t-2 border-border/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="font-bold text-primary">{progress.overallProgress}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden border-2 border-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{progress.milestonesCompleted} / {progress.totalMilestones} milestones</span>
                <span>{trajectory.timeline}</span>
              </div>
            </div>
          </CardRetroContent>
        </CardRetro>

        {/* Active Milestones */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-success via-warning to-muted-foreground/30 rounded-full hidden md:block" />
          
          {trajectory.roadmap.milestones.map((milestone, index) => {
            const isCurrent = index === progress.currentMilestoneIndex;
            const isCompleted = milestone.completed || milestone.progress >= 100;
            const isExpanded = expandedMilestone === milestone.id;
            
            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-4"
              >
                <CardRetro 
                  className={cn(
                    "transition-all cursor-pointer",
                    isCompleted && "bg-success/5 border-success/30",
                    isCurrent && "bg-warning/5 border-warning/30 ring-2 ring-warning/50",
                    !isCompleted && !isCurrent && "bg-muted/50"
                  )}
                  onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                >
                  <CardRetroContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-full border-2 border-border shadow-retro z-10 flex-shrink-0",
                        isCompleted && "bg-success",
                        isCurrent && "bg-warning",
                        !isCompleted && !isCurrent && "bg-muted"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                        ) : isCurrent ? (
                          <Clock className="w-5 h-5 text-warning-foreground animate-pulse" />
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
                              isCompleted && "bg-success/20 text-success",
                              isCurrent && "bg-warning/20 text-warning",
                              !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                            )}>
                              {milestone.progress}%
                            </span>
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                        
                        <h3 className="font-black text-lg mb-1">{milestone.title}</h3>
                        
                        {/* Progress bar */}
                        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden border border-border">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${milestone.progress}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(
                              "h-full rounded-full",
                              isCompleted && "bg-success",
                              isCurrent && "bg-warning",
                              !isCompleted && !isCurrent && "bg-muted-foreground/30"
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
                          className="mt-4 pt-4 border-t-2 border-border/50"
                        >
                          <div className="grid md:grid-cols-2 gap-4">
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
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardRetroContent>
                </CardRetro>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <CardRetro>
          <CardRetroContent className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              <ButtonRetro variant="outline" size="sm" disabled>
                Mark Objective Complete
              </ButtonRetro>
              <ButtonRetro variant="outline" size="sm" disabled>
                Adjust Timeline
              </ButtonRetro>
              <ButtonRetro variant="outline" size="sm" onClick={() => setViewState("select-path")}>
                Explore Alternatives
              </ButtonRetro>
            </div>
          </CardRetroContent>
        </CardRetro>
      </div>
    );
  }

  // Fallback
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Something went wrong. Please refresh the page.</p>
      <ButtonRetro onClick={() => setViewState("intro")} className="mt-4">
        Start Over
      </ButtonRetro>
    </div>
  );
}
