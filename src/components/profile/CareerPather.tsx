import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, RefreshCw, Compass, Target, MapPin, 
  ChevronDown, ChevronUp, CheckCircle2, Circle, 
  Clock, Zap, BookOpen, Users, Award, AlertTriangle,
  ArrowRight, ArrowLeft, Flag, Rocket, TrendingUp,
  DollarSign, BarChart3, Shield, Star, Briefcase,
  Search, Navigation, GitBranch, Lightbulb
} from "lucide-react";
import { ButtonRetro } from "@/components/ui/button-retro";
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from "@/components/ui/card-retro";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/context/AppContext";
import { MasterResume, JobPreferences } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CareerPatherProps {
  resume: MasterResume;
  preferences: JobPreferences | null;
}

type PatherMode = "exploratory" | "goal-oriented";
type ViewState = "intro" | "goal-input" | "loading" | "results" | "path-details" | "active-path";

interface Constraints {
  locationLocked: boolean;
  location: string;
  minSalary: number | null;
  familyObligations: boolean;
  noMBA: boolean;
  otherConstraints: string;
}

// Shared types for both modes
interface PathMilestone {
  id: string;
  order: number;
  title: string;
  duration: string;
  targetRoles?: string[];
  companiesTargeted?: string[];
  objectives: string[];
  skillsToAcquire: string[];
  resources: string[];
  successMetrics: string[];
  avgTimeToComplete?: string;
  completed: boolean;
  progress: number;
}

interface PathCompensation {
  current: number;
  target: number;
  increase: number;
  percentIncrease: number;
}

interface ExploratoryPath {
  id: string;
  name: string;
  icon: string;
  targetRole: string;
  targetCompany: string;
  timeline: string;
  compensation: PathCompensation;
  successProbability: number;
  difficulty: string;
  whyThisPath: string;
  existingAdvantages: string[];
  appeal: { bestFor: string[]; benefits: string[]; tradeoffs: string[] };
  nextSteps: string[];
  roadmap: { milestones: PathMilestone[] };
  gapAnalysis: { strengths: string[]; gaps: string[]; effortLevel: string };
  marketContext: { demandScore: number; hiringTrends: string; topCompanies: string[] };
}

interface GoalOrientedResult {
  mode: "goal-oriented";
  currentRole: string;
  currentCompensation: number;
  yearsOfExperience: number;
  targetGoal: string;
  feasibilityScore: number;
  feasibilityNote: string;
  primaryPath: {
    id: string;
    name: string;
    icon: string;
    targetRole: string;
    targetCompany: string;
    timeline: string;
    compensation: PathCompensation;
    successProbability: number;
    difficulty: string;
    gapAnalysis: { strengths: string[]; gaps: string[]; effortLevel: string };
    roadmap: { milestones: PathMilestone[] };
    actionItems: { immediate: string[]; shortTerm: string[]; longTerm: string[] };
  };
  alternativePaths: {
    id: string;
    name: string;
    icon: string;
    description: string;
    timeline: string;
    keyDifference: string;
    tradeoffs: string[];
    roadmap: { milestones: PathMilestone[] };
  }[];
  reasoning: string;
}

interface ExploratoryResult {
  mode: "exploratory";
  currentRole: string;
  currentCompensation: number;
  yearsOfExperience: number;
  paths: ExploratoryPath[];
  recommendedPath: string;
  reasoning: string;
}

type CareerResult = GoalOrientedResult | ExploratoryResult;

const pathCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const }
  }),
  hover: { y: -8, scale: 1.02, transition: { duration: 0.2 } }
};

const getIconForPath = (icon: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    "🚀": <Rocket className="w-8 h-8" />,
    "🎯": <Target className="w-8 h-8" />,
    "💼": <Briefcase className="w-8 h-8" />,
    "🌟": <Star className="w-8 h-8" />,
    "🛡️": <Shield className="w-8 h-8" />,
    "🔄": <GitBranch className="w-8 h-8" />,
    "💡": <Lightbulb className="w-8 h-8" />,
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

const getFeasibilityColor = (score: number) => {
  if (score >= 75) return { bg: "bg-success/10", text: "text-success", border: "border-success/30" };
  if (score >= 50) return { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" };
  return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" };
};

export function CareerPather({ resume, preferences }: CareerPatherProps) {
  const { applications } = useApp();
  const [viewState, setViewState] = useState<ViewState>("intro");
  const [patherMode, setPatherMode] = useState<PatherMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CareerResult | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [constraints, setConstraints] = useState<Constraints>({
    locationLocked: false, location: "", minSalary: null,
    familyObligations: false, noMBA: false, otherConstraints: "",
  });
  const [showAltPath, setShowAltPath] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-pather`;

  const hasEnoughData = () => {
    const hasResume = resume.summary || resume.skills.length > 0 || resume.experience.length > 0;
    return !!hasResume;
  };

  const generatePaths = async () => {
    if (!hasEnoughData()) {
      toast.error("Please fill out your Master Resume first!");
      return;
    }
    if (patherMode === "goal-oriented" && !targetGoal.trim()) {
      toast.error("Please enter your target role or career goal.");
      return;
    }

    setIsLoading(true);
    setViewState("loading");
    setRawContent("");
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast.error('Please log in first'); return; }
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          resume, preferences,
          applications: applications.slice(0, 20),
          mode: patherMode,
          targetGoal: patherMode === "goal-oriented" ? targetGoal : undefined,
          constraints: (constraints.locationLocked || constraints.minSalary || constraints.familyObligations || constraints.noMBA || constraints.otherConstraints) ? constraints : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) toast.error("Rate limit exceeded. Please wait and try again.");
        else if (response.status === 402) toast.error("AI credits depleted.");
        else toast.error(errorData.error || "Failed to generate career paths");
        setViewState(patherMode === "goal-oriented" ? "goal-input" : "intro");
        setIsLoading(false);
        return;
      }

      if (!response.body) throw new Error("No response body");

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
            if (content) { fullContent += content; setRawContent(fullContent); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }

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
            if (content) { fullContent += content; setRawContent(fullContent); }
          } catch { /* ignore */ }
        }
      }

      try {
        let cleanedContent = fullContent.trim();
        if (cleanedContent.startsWith("```json")) cleanedContent = cleanedContent.slice(7);
        else if (cleanedContent.startsWith("```")) cleanedContent = cleanedContent.slice(3);
        if (cleanedContent.endsWith("```")) cleanedContent = cleanedContent.slice(0, -3);
        cleanedContent = cleanedContent.trim();

        const data = JSON.parse(cleanedContent) as CareerResult;
        setResult(data);
        setViewState("results");
        toast.success(data.mode === "goal-oriented" ? "Career roadmap generated!" : "Career paths generated!");
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError, fullContent);
        toast.error("Failed to parse results. Please try again.");
        setViewState(patherMode === "goal-oriented" ? "goal-input" : "intro");
      }
    } catch (error) {
      console.error("Career pather error:", error);
      toast.error("Failed to generate career paths. Please try again.");
      setViewState(patherMode === "goal-oriented" ? "goal-input" : "intro");
    } finally {
      setIsLoading(false);
    }
  };

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
            
            <h2 className="text-3xl font-black mb-3 relative z-10">Career PATHer 🗺️</h2>
            <p className="text-muted-foreground mb-2 max-w-lg mx-auto relative z-10">
              <strong>AI-powered roadmap generator that creates a personalized development plan.</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto relative z-10">
              Most people waste years in roles that don't move them forward. Career PATHer shows the efficient path based on real career data.
            </p>

            {!hasEnoughData() && (
              <div className="bg-warning/10 border-2 border-warning/30 p-4 rounded-xl mb-6 text-left max-w-md mx-auto relative z-10">
                <p className="font-bold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Fill out your Master Resume first
                </p>
                <p className="text-sm text-muted-foreground">
                  We need your education, work experience, and skills to generate accurate paths.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 max-w-lg mx-auto">
              <ButtonRetro
                onClick={() => { setPatherMode("exploratory"); generatePaths(); }}
                disabled={isLoading || !hasEnoughData()}
                className="gap-2 flex-1"
                size="lg"
                variant="outline"
              >
                <Search className="w-5 h-5" />
                Explore My Options
              </ButtonRetro>
              <ButtonRetro
                onClick={() => { setPatherMode("goal-oriented"); setViewState("goal-input"); }}
                disabled={isLoading || !hasEnoughData()}
                className="gap-2 flex-1"
                size="lg"
              >
                <Target className="w-5 h-5" />
                I Have a Goal
              </ButtonRetro>
            </div>
          </CardRetroContent>
        </CardRetro>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: Search, title: "Exploratory Mode", desc: "Don't have a specific goal? AI suggests 3-5 high-potential career paths based on your background and highlights where you have advantages.", color: "text-info", bg: "bg-info/10" },
            { icon: Target, title: "Goal-Oriented Mode", desc: "Have a dream role? Input your target and we'll reverse-engineer the path with intermediate roles, required skills, and timeline.", color: "text-primary", bg: "bg-primary/10" },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
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

  // ==================== GOAL INPUT VIEW ====================
  if (viewState === "goal-input") {
    return (
      <div className="space-y-6">
        <ButtonRetro variant="ghost" onClick={() => { setViewState("intro"); setPatherMode(null); }} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </ButtonRetro>

        <CardRetro>
          <CardRetroHeader className="border-b-2 border-border">
            <CardRetroTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              What's your career goal?
            </CardRetroTitle>
          </CardRetroHeader>
          <CardRetroContent className="p-6 space-y-6">
            <div>
              <Label className="font-bold mb-2 block">Dream Role / Goal</Label>
              <Input
                placeholder='e.g. "VP of Product at a tech startup" or "Management Consultant at MBB"'
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground mt-1">Be as specific as you like — include target role, company type, industry, etc.</p>
            </div>

            <div className="border-t-2 border-border/50 pt-6">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Constraints (optional)
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="locationLocked"
                    checked={constraints.locationLocked}
                    onCheckedChange={(c) => setConstraints(prev => ({ ...prev, locationLocked: !!c }))}
                  />
                  <div className="flex-1">
                    <Label htmlFor="locationLocked" className="font-medium">Can't relocate</Label>
                    {constraints.locationLocked && (
                      <Input
                        placeholder="Current location"
                        value={constraints.location}
                        onChange={(e) => setConstraints(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="minSalary"
                    checked={!!constraints.minSalary}
                    onCheckedChange={(c) => setConstraints(prev => ({ ...prev, minSalary: c ? 60000 : null }))}
                  />
                  <div className="flex-1">
                    <Label htmlFor="minSalary" className="font-medium">Minimum salary requirement</Label>
                    {constraints.minSalary !== null && (
                      <Input
                        type="number"
                        placeholder="Minimum salary"
                        value={constraints.minSalary}
                        onChange={(e) => setConstraints(prev => ({ ...prev, minSalary: parseInt(e.target.value) || null }))}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="family"
                    checked={constraints.familyObligations}
                    onCheckedChange={(c) => setConstraints(prev => ({ ...prev, familyObligations: !!c }))}
                  />
                  <Label htmlFor="family" className="font-medium">Family obligations affecting flexibility</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="noMBA"
                    checked={constraints.noMBA}
                    onCheckedChange={(c) => setConstraints(prev => ({ ...prev, noMBA: !!c }))}
                  />
                  <Label htmlFor="noMBA" className="font-medium">Can't pursue MBA (budget or time)</Label>
                </div>

                <div>
                  <Label className="font-medium mb-2 block">Other constraints</Label>
                  <Textarea
                    placeholder="Any other constraints or preferences..."
                    value={constraints.otherConstraints}
                    onChange={(e) => setConstraints(prev => ({ ...prev, otherConstraints: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <ButtonRetro
              onClick={() => { setPatherMode("goal-oriented"); generatePaths(); }}
              disabled={isLoading || !targetGoal.trim()}
              className="gap-2 w-full"
              size="lg"
            >
              <Sparkles className="w-5 h-5" />
              Generate My Roadmap
            </ButtonRetro>
          </CardRetroContent>
        </CardRetro>
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
                <CardRetroTitle>
                  {patherMode === "goal-oriented" ? "Reverse-Engineering Your Path..." : "Analyzing Your Career..."}
                </CardRetroTitle>
                <p className="text-sm text-muted-foreground">
                  {patherMode === "goal-oriented"
                    ? `Building roadmap to: "${targetGoal}"`
                    : "Discovering high-potential career paths"}
                </p>
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

  // ==================== RESULTS VIEW ====================
  if (viewState === "results" && result) {
    // ---- GOAL-ORIENTED RESULTS ----
    if (result.mode === "goal-oriented") {
      const goalResult = result as GoalOrientedResult;
      const feasColors = getFeasibilityColor(goalResult.feasibilityScore);
      const primary = goalResult.primaryPath;

      return (
        <div className="space-y-6">
          <ButtonRetro variant="ghost" onClick={() => { setViewState("intro"); setResult(null); setPatherMode(null); }} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Start Over
          </ButtonRetro>

          {/* Goal & Feasibility Header */}
          <CardRetro className={cn("overflow-hidden", feasColors.border, "border-2")}>
            <CardRetroContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Goal</p>
                  <h2 className="text-2xl font-black">{goalResult.targetGoal}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Current: <span className="font-medium">{goalResult.currentRole}</span>
                  </p>
                </div>
                <div className={cn("text-center p-4 rounded-xl border-2 border-border", feasColors.bg)}>
                  <p className={cn("text-3xl font-black", feasColors.text)}>{goalResult.feasibilityScore}%</p>
                  <p className="text-xs font-bold">Feasibility</p>
                </div>
              </div>
              {goalResult.feasibilityNote && (
                <div className={cn("mt-4 p-3 rounded-lg", feasColors.bg)}>
                  <p className={cn("text-sm flex items-start gap-2", feasColors.text)}>
                    {goalResult.feasibilityScore < 50 ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    {goalResult.feasibilityNote}
                  </p>
                </div>
              )}
            </CardRetroContent>
          </CardRetro>

          {/* Primary Path Overview */}
          <CardRetro className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardRetroContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/20 border-2 border-border">
                  {getIconForPath(primary.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black">{primary.name}</h3>
                  <p className="text-muted-foreground">{primary.targetRole} at {primary.targetCompany}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-background/60 rounded-lg p-3 text-center border border-border">
                  <DollarSign className="w-5 h-5 text-success mx-auto mb-1" />
                  <p className="font-black text-success">+${primary.compensation.increase.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{primary.compensation.percentIncrease}% increase</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3 text-center border border-border">
                  <Clock className="w-5 h-5 text-info mx-auto mb-1" />
                  <p className="font-black">{primary.timeline}</p>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3 text-center border border-border">
                  <BarChart3 className={cn("w-5 h-5 mx-auto mb-1", getProbabilityColor(primary.successProbability))} />
                  <p className={cn("font-black", getProbabilityColor(primary.successProbability))}>{primary.successProbability}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3 text-center border border-border">
                  <Flag className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="font-black">{primary.roadmap.milestones.length}</p>
                  <p className="text-xs text-muted-foreground">Milestones</p>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>

          {/* Visual Timeline */}
          <CardRetro>
            <CardRetroHeader className="border-b-2 border-border">
              <CardRetroTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                🗺️ Your Roadmap
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="p-4">
              {/* Timeline visualization */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-muted border-2 border-border text-center">
                  <p className="text-xs text-muted-foreground">Now</p>
                  <p className="text-sm font-bold">{goalResult.currentRole}</p>
                </div>
                {primary.roadmap.milestones.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2 flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className={cn(
                      "px-3 py-2 rounded-lg border-2 border-border text-center",
                      i === primary.roadmap.milestones.length - 1 ? "bg-primary/10 border-primary" : "bg-background"
                    )}>
                      <p className="text-xs text-muted-foreground">{m.duration}</p>
                      <p className="text-sm font-bold">{m.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Milestone details */}
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-info to-muted-foreground/30" />
                {primary.roadmap.milestones.map((milestone, index) => {
                  const isExpanded = expandedMilestone === milestone.id;
                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-16 pb-6 last:pb-0"
                    >
                      <div className="absolute left-3 w-6 h-6 rounded-full bg-primary border-2 border-border flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {milestone.order}
                      </div>
                      <CardRetro className="cursor-pointer" onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)} hoverable>
                        <CardRetroContent className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-black">{milestone.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{milestone.duration}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                          {milestone.targetRoles && milestone.targetRoles.length > 0 && (
                            <p className="text-sm text-muted-foreground">Roles: {milestone.targetRoles.join(", ")}</p>
                          )}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-4 border-t border-border/50 mt-3">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" />Objectives</h5>
                                    <ul className="space-y-1">{milestone.objectives.map((obj, i) => (<li key={i} className="text-sm flex items-start gap-2"><Circle className="w-3 h-3 mt-1.5 flex-shrink-0 text-muted-foreground" />{obj}</li>))}</ul>
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-info" />Skills to Acquire</h5>
                                    <div className="flex flex-wrap gap-1">{milestone.skillsToAcquire.map((skill, i) => (<span key={i} className="px-2 py-0.5 bg-info/10 text-info rounded text-xs font-medium">{skill}</span>))}</div>
                                  </div>
                                  {milestone.companiesTargeted && milestone.companiesTargeted.length > 0 && (
                                    <div>
                                      <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" />Companies to Target</h5>
                                      <div className="flex flex-wrap gap-1">{milestone.companiesTargeted.map((c, i) => (<span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">{c}</span>))}</div>
                                    </div>
                                  )}
                                  {milestone.resources.length > 0 && (
                                    <div>
                                      <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-warning" />Resources</h5>
                                      <ul className="space-y-1">{milestone.resources.map((r, i) => (<li key={i} className="text-sm text-muted-foreground">• {r}</li>))}</ul>
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

          {/* Action Items */}
          <CardRetro>
            <CardRetroHeader className="border-b-2 border-border">
              <CardRetroTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                ⚡ Action Items
              </CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Rocket className="w-4 h-4 text-destructive" />Do This Week</h4>
                  <ul className="space-y-2">{primary.actionItems.immediate.map((a, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="text-destructive font-bold">→</span>{a}</li>))}</ul>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-warning" />Next 3 Months</h4>
                  <ul className="space-y-2">{primary.actionItems.shortTerm.map((a, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="text-warning font-bold">→</span>{a}</li>))}</ul>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-info" />6-12 Months</h4>
                  <ul className="space-y-2">{primary.actionItems.longTerm.map((a, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="text-info font-bold">→</span>{a}</li>))}</ul>
                </div>
              </div>
            </CardRetroContent>
          </CardRetro>

          {/* Gap Analysis */}
          <div className="grid md:grid-cols-2 gap-4">
            <CardRetro className="border-success/30">
              <CardRetroHeader className="pb-2">
                <CardRetroTitle className="text-base flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" />✅ Your Strengths</CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="pt-0">
                <ul className="space-y-2">{primary.gapAnalysis.strengths.map((s, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="text-success">•</span>{s}</li>))}</ul>
              </CardRetroContent>
            </CardRetro>
            <CardRetro className="border-warning/30">
              <CardRetroHeader className="pb-2">
                <CardRetroTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />⚠️ Gaps to Close</CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="pt-0">
                <ul className="space-y-2">{primary.gapAnalysis.gaps.map((g, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="text-warning">•</span>{g}</li>))}</ul>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <span className={cn("px-2 py-1 rounded text-xs font-bold", getDifficultyColor(primary.gapAnalysis.effortLevel))}>{primary.gapAnalysis.effortLevel} Effort</span>
                </div>
              </CardRetroContent>
            </CardRetro>
          </div>

          {/* Alternative Paths */}
          {goalResult.alternativePaths.length > 0 && (
            <CardRetro>
              <CardRetroHeader className="border-b-2 border-border">
                <CardRetroTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-info" />
                  🔄 Alternative Paths
                </CardRetroTitle>
              </CardRetroHeader>
              <CardRetroContent className="p-4 space-y-4">
                {goalResult.alternativePaths.map((alt) => (
                  <CardRetro key={alt.id} className="cursor-pointer" onClick={() => setShowAltPath(showAltPath === alt.id ? null : alt.id)} hoverable>
                    <CardRetroContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-info/10 border-2 border-border">{getIconForPath(alt.icon)}</div>
                          <div>
                            <h4 className="font-black">{alt.name}</h4>
                            <p className="text-sm text-muted-foreground">{alt.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{alt.timeline}</span>
                          {showAltPath === alt.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                      <p className="text-sm mt-2 bg-info/5 p-2 rounded"><strong>Key difference:</strong> {alt.keyDifference}</p>
                      <AnimatePresence>
                        {showAltPath === alt.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border/50 space-y-3">
                            <div>
                              <h5 className="font-bold text-sm mb-2">Trade-offs</h5>
                              <ul className="space-y-1">{alt.tradeoffs.map((t, i) => (<li key={i} className="text-sm text-muted-foreground">• {t}</li>))}</ul>
                            </div>
                            <div>
                              <h5 className="font-bold text-sm mb-2">Milestones</h5>
                              {alt.roadmap.milestones.map((m, i) => (
                                <div key={m.id} className="mb-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="font-bold text-sm">{m.order}. {m.title} <span className="font-normal text-muted-foreground">({m.duration})</span></p>
                                  <ul className="mt-1 space-y-0.5">{m.objectives.map((o, j) => (<li key={j} className="text-xs text-muted-foreground">• {o}</li>))}</ul>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardRetroContent>
                  </CardRetro>
                ))}
              </CardRetroContent>
            </CardRetro>
          )}

          {/* Reasoning */}
          {goalResult.reasoning && (
            <CardRetro className="bg-muted/30">
              <CardRetroContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning" />
                  {goalResult.reasoning}
                </p>
              </CardRetroContent>
            </CardRetro>
          )}

          <div className="flex justify-center gap-3">
            <ButtonRetro variant="outline" onClick={() => { setViewState("goal-input"); setResult(null); }}>
              Try Different Goal
            </ButtonRetro>
            <ButtonRetro variant="outline" onClick={() => { setPatherMode("exploratory"); setResult(null); generatePaths(); }}>
              <Search className="w-4 h-4 mr-2" /> Explore Options Instead
            </ButtonRetro>
          </div>
        </div>
      );
    }

    // ---- EXPLORATORY RESULTS ----
    const exploratoryResult = result as ExploratoryResult;
    const selectedPath = selectedPathId ? exploratoryResult.paths.find(p => p.id === selectedPathId) : null;

    if (selectedPath && viewState === "results") {
      // Detailed view of a selected exploratory path
      return (
        <div className="space-y-6">
          <ButtonRetro variant="ghost" onClick={() => setSelectedPathId(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to All Paths
          </ButtonRetro>

          {/* Path Header */}
          <CardRetro className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardRetroContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-4 rounded-xl bg-primary/20 border-2 border-border">{getIconForPath(selectedPath.icon)}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black">{selectedPath.name}</h2>
                  <p className="text-lg font-medium">{selectedPath.targetRole}</p>
                  <p className="text-muted-foreground">{selectedPath.targetCompany}</p>
                </div>
              </div>
              <p className="text-sm bg-primary/5 p-3 rounded-lg border border-border">{selectedPath.whyThisPath}</p>
            </CardRetroContent>
          </CardRetro>

          {/* Stats */}
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
              <p className={cn("text-2xl font-black", getProbabilityColor(selectedPath.successProbability))}>{selectedPath.successProbability}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </CardRetro>
            <CardRetro className="p-4 text-center">
              <Flag className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-black">{selectedPath.roadmap.milestones.length}</p>
              <p className="text-xs text-muted-foreground">Milestones</p>
            </CardRetro>
          </div>

          {/* Existing Advantages */}
          <CardRetro className="border-success/30">
            <CardRetroHeader className="pb-2">
              <CardRetroTitle className="text-base flex items-center gap-2"><Star className="w-5 h-5 text-success" />🌟 Where You Already Have Advantages</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="pt-0">
              <ul className="space-y-2">{selectedPath.existingAdvantages.map((a, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="text-success font-bold">✓</span>{a}</li>))}</ul>
            </CardRetroContent>
          </CardRetro>

          {/* Next Steps */}
          <CardRetro>
            <CardRetroHeader className="border-b-2 border-border">
              <CardRetroTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-warning" />⚡ Immediate Next Steps</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="p-4">
              <ol className="space-y-2">{selectedPath.nextSteps.map((s, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="font-bold text-primary">{i + 1}.</span>{s}</li>))}</ol>
            </CardRetroContent>
          </CardRetro>

          {/* Roadmap */}
          <CardRetro>
            <CardRetroHeader className="border-b-2 border-border">
              <CardRetroTitle className="flex items-center gap-2"><Navigation className="w-5 h-5 text-primary" />🗺️ Roadmap</CardRetroTitle>
            </CardRetroHeader>
            <CardRetroContent className="p-4">
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-info to-muted-foreground/30" />
                {selectedPath.roadmap.milestones.map((milestone, index) => {
                  const isExpanded = expandedMilestone === milestone.id;
                  return (
                    <motion.div key={milestone.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="relative pl-16 pb-6 last:pb-0">
                      <div className="absolute left-3 w-6 h-6 rounded-full bg-primary border-2 border-border flex items-center justify-center text-xs font-bold text-primary-foreground">{milestone.order}</div>
                      <CardRetro className="cursor-pointer" onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)} hoverable>
                        <CardRetroContent className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-black">{milestone.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{milestone.duration}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                          {milestone.targetRoles && <p className="text-sm text-muted-foreground">Roles: {milestone.targetRoles.join(", ")}</p>}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-4 border-t border-border/50 mt-3">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" />Objectives</h5>
                                    <ul className="space-y-1">{milestone.objectives.map((obj, i) => (<li key={i} className="text-sm flex items-start gap-2"><Circle className="w-3 h-3 mt-1.5 flex-shrink-0 text-muted-foreground" />{obj}</li>))}</ul>
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-info" />Skills</h5>
                                    <div className="flex flex-wrap gap-1">{milestone.skillsToAcquire.map((s, i) => (<span key={i} className="px-2 py-0.5 bg-info/10 text-info rounded text-xs font-medium">{s}</span>))}</div>
                                  </div>
                                  {milestone.companiesTargeted && milestone.companiesTargeted.length > 0 && (
                                    <div>
                                      <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" />Companies</h5>
                                      <div className="flex flex-wrap gap-1">{milestone.companiesTargeted.map((c, i) => (<span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">{c}</span>))}</div>
                                    </div>
                                  )}
                                  {milestone.resources.length > 0 && (
                                    <div>
                                      <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-warning" />Resources</h5>
                                      <ul className="space-y-1">{milestone.resources.map((r, i) => (<li key={i} className="text-sm text-muted-foreground">• {r}</li>))}</ul>
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

          {/* Gap Analysis & Market */}
          <div className="grid md:grid-cols-2 gap-4">
            <CardRetro className="border-warning/30">
              <CardRetroHeader className="pb-2"><CardRetroTitle className="text-base">⚠️ Gaps to Close</CardRetroTitle></CardRetroHeader>
              <CardRetroContent className="pt-0">
                <ul className="space-y-2">{selectedPath.gapAnalysis.gaps.map((g, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="text-warning">•</span>{g}</li>))}</ul>
                <div className="mt-3"><span className={cn("px-2 py-1 rounded text-xs font-bold", getDifficultyColor(selectedPath.gapAnalysis.effortLevel))}>{selectedPath.gapAnalysis.effortLevel} Effort</span></div>
              </CardRetroContent>
            </CardRetro>
            <CardRetro>
              <CardRetroHeader className="pb-2"><CardRetroTitle className="text-base">📊 Market Context</CardRetroTitle></CardRetroHeader>
              <CardRetroContent className="pt-0">
                <p className="text-sm mb-2"><span className="font-bold">Demand:</span> <span className={cn("font-bold", getProbabilityColor(selectedPath.marketContext.demandScore))}>{selectedPath.marketContext.demandScore}/100</span></p>
                <p className="text-sm text-muted-foreground mb-2">{selectedPath.marketContext.hiringTrends}</p>
                <div className="flex flex-wrap gap-1">{selectedPath.marketContext.topCompanies.map((c, i) => (<span key={i} className="px-2 py-0.5 bg-primary/10 rounded-full text-xs font-medium border border-border">{c}</span>))}</div>
              </CardRetroContent>
            </CardRetro>
          </div>

          {/* Benefits & Tradeoffs */}
          <div className="grid md:grid-cols-2 gap-4">
            <CardRetro>
              <CardRetroHeader className="pb-2"><CardRetroTitle className="text-base">🎁 Benefits</CardRetroTitle></CardRetroHeader>
              <CardRetroContent className="pt-0">
                <ul className="space-y-2">{selectedPath.appeal.benefits.map((b, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="text-success">+</span>{b}</li>))}</ul>
              </CardRetroContent>
            </CardRetro>
            <CardRetro>
              <CardRetroHeader className="pb-2"><CardRetroTitle className="text-base">⚖️ Trade-offs</CardRetroTitle></CardRetroHeader>
              <CardRetroContent className="pt-0">
                <ul className="space-y-2">{selectedPath.appeal.tradeoffs.map((t, i) => (<li key={i} className="text-sm flex items-start gap-2"><span className="text-muted-foreground">-</span>{t}</li>))}</ul>
              </CardRetroContent>
            </CardRetro>
          </div>
        </div>
      );
    }

    // Exploratory path selection grid
    return (
      <div className="space-y-6">
        <ButtonRetro variant="ghost" onClick={() => { setViewState("intro"); setResult(null); setPatherMode(null); }} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Start Over
        </ButtonRetro>

        <CardRetro className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardRetroContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black mb-1">🎯 Your Career Paths</h2>
                <p className="text-muted-foreground">
                  Based on your background as <span className="font-medium">{exploratoryResult.currentRole}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <ButtonRetro variant="outline" onClick={() => { setPatherMode("goal-oriented"); setViewState("goal-input"); setResult(null); }} size="sm" className="gap-2">
                  <Target className="w-4 h-4" /> Set a Goal
                </ButtonRetro>
                <ButtonRetro variant="outline" onClick={() => { setResult(null); generatePaths(); }} disabled={isLoading} size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Regenerate
                </ButtonRetro>
              </div>
            </div>
            {exploratoryResult.reasoning && (
              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t-2 border-border/50">💡 {exploratoryResult.reasoning}</p>
            )}
          </CardRetroContent>
        </CardRetro>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exploratoryResult.paths.map((path, index) => {
            const isRecommended = path.id === exploratoryResult.recommendedPath;
            return (
              <motion.div key={path.id} custom={index} initial="hidden" animate="visible" whileHover="hover" variants={pathCardVariants}>
                <CardRetro
                  className={cn("h-full cursor-pointer transition-all relative overflow-hidden", isRecommended && "ring-2 ring-primary")}
                  onClick={() => setSelectedPathId(path.id)}
                  hoverable
                >
                  {isRecommended && <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">⭐ Recommended</div>}
                  <CardRetroContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10 border-2 border-border">{getIconForPath(path.icon)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-lg leading-tight">{path.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{path.targetRole}</p>
                        <p className="text-xs text-muted-foreground truncate">{path.targetCompany}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span className="text-sm font-bold text-success">+${path.compensation.increase.toLocaleString()} ({path.compensation.percentIncrease}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-info" />
                        <span className="text-sm">{path.timeline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className={cn("w-4 h-4", getProbabilityColor(path.successProbability))} />
                        <span className={cn("text-sm font-bold", getProbabilityColor(path.successProbability))}>{path.successProbability}% success</span>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-bold inline-block", getDifficultyColor(path.difficulty))}>{path.difficulty} effort</span>
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-border/50">
                      <p className="text-xs text-muted-foreground line-clamp-2">{path.whyThisPath}</p>
                    </div>
                    <div className="mt-4">
                      <ButtonRetro variant="outline" size="sm" className="w-full gap-2">View Path <ArrowRight className="w-4 h-4" /></ButtonRetro>
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

  // Fallback
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Something went wrong. Please refresh the page.</p>
      <ButtonRetro onClick={() => { setViewState("intro"); setResult(null); setPatherMode(null); }} className="mt-4">Start Over</ButtonRetro>
    </div>
  );
}
