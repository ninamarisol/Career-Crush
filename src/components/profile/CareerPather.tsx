import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Compass, Target, TrendingUp, Lightbulb, Building2, Calendar, Zap } from "lucide-react";
import { ButtonRetro } from "@/components/ui/button-retro";
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from "@/components/ui/card-retro";
import { useApp } from "@/context/AppContext";
import { MasterResume, JobPreferences } from "@/lib/data";
import { toast } from "sonner";

interface CareerPatherProps {
  resume: MasterResume;
  preferences: JobPreferences | null;
}

export function CareerPather({ resume, preferences }: CareerPatherProps) {
  const { applications } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [hasGenerated, setHasGenerated] = useState(false);
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
    setAnalysis("");
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
          applications: applications.slice(0, 20), // Send recent applications for context
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
              setAnalysis(fullContent);
            }
          } catch {
            // Incomplete JSON, put back and wait
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
              setAnalysis(fullContent);
            }
          } catch { /* ignore */ }
        }
      }

      toast.success("Career analysis complete!");
    } catch (error) {
      console.error("Career pather error:", error);
      toast.error("Failed to generate career analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom as content streams
  useEffect(() => {
    if (contentRef.current && isLoading) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [analysis, isLoading]);

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    return text
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-xl font-black mt-6 mb-3 flex items-center gap-2">
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-lg font-bold mt-4 mb-2">
              {line.replace("### ", "")}
            </h3>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} className="font-bold mt-4 mb-2">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="ml-4 mb-1">
              {line.replace(/^[-*] /, "")}
            </li>
          );
        }
        if (line.match(/^\d+\. /)) {
          return (
            <li key={i} className="ml-4 mb-1 list-decimal">
              {line.replace(/^\d+\. /, "")}
            </li>
          );
        }
        if (line.trim() === "") {
          return <br key={i} />;
        }
        return (
          <p key={i} className="mb-2">
            {line}
          </p>
        );
      });
  };

  if (!hasGenerated) {
    return (
      <div className="space-y-6">
        {/* Intro Card */}
        <CardRetro className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardRetroContent className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 border-2 border-border flex items-center justify-center"
            >
              <Compass className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-black mb-2">AI Career Pather 🚀</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Get personalized career recommendations based on your skills, experience, and dream job preferences.
              Our AI will analyze your profile and suggest the best paths forward.
            </p>

            {!hasEnoughData() && (
              <div className="bg-muted p-4 rounded-lg mb-4 text-left">
                <p className="font-bold text-sm mb-2">📝 Add more info for better results:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fill out your <span className="font-medium">Master Resume</span> with skills & experience</li>
                  <li>• Complete your <span className="font-medium">Dream Job Profiler</span> preferences</li>
                </ul>
              </div>
            )}

            <ButtonRetro
              onClick={generateCareerPath}
              disabled={isLoading || !hasEnoughData()}
              className="gap-2"
              size="lg"
            >
              <Sparkles className="w-5 h-5" />
              {isLoading ? "Analyzing..." : "Generate My Career Path"}
            </ButtonRetro>
          </CardRetroContent>
        </CardRetro>

        {/* What you'll get */}
        <div className="grid md:grid-cols-3 gap-4">
          <CardRetro className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20 border-2 border-border">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold">Skill Gap Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover what skills you need to develop for your target roles.
            </p>
          </CardRetro>

          <CardRetro className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-info/20 border-2 border-border">
                <Building2 className="w-5 h-5 text-info" />
              </div>
              <h3 className="font-bold">Target Companies</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get specific company and role recommendations that match your goals.
            </p>
          </CardRetro>

          <CardRetro className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/20 border-2 border-border">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-bold">Growth Strategy</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get a personalized 1-year and 3-year career development plan.
            </p>
          </CardRetro>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 border-2 border-border">
            <Compass className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black">Your Career Path Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Personalized recommendations based on your profile
            </p>
          </div>
        </div>
        <ButtonRetro
          variant="outline"
          onClick={generateCareerPath}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Analyzing..." : "Regenerate"}
        </ButtonRetro>
      </div>

      {/* Analysis Content */}
      <CardRetro>
        <CardRetroContent className="p-6">
          <div
            ref={contentRef}
            className="prose prose-sm max-w-none max-h-[60vh] overflow-y-auto"
          >
            {isLoading && !analysis && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Analyzing your career profile...</span>
              </div>
            )}
            {analysis && renderMarkdown(analysis)}
            {isLoading && analysis && (
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
            )}
          </div>
        </CardRetroContent>
      </CardRetro>

      {/* Quick Actions */}
      {!isLoading && analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <CardRetro className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20 border-2 border-border">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Take Action</h3>
                <p className="text-sm text-muted-foreground">
                  Review the recommendations above and start with the quick wins!
                </p>
              </div>
            </div>
          </CardRetro>

          <CardRetro className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20 border-2 border-border">
                <Calendar className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Update Regularly</h3>
                <p className="text-sm text-muted-foreground">
                  Regenerate this analysis as you update your resume and preferences.
                </p>
              </div>
            </div>
          </CardRetro>
        </motion.div>
      )}
    </div>
  );
}
