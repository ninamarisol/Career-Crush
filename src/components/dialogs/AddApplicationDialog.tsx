import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { useApp } from '@/context/AppContext';
import { Plus, Building2, MapPin, DollarSign, Briefcase, Link as LinkIcon, FileText, Upload, Tag, Wand2, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { industryOptions, roleTypeOptions } from '@/lib/data';
import { Progress } from '@/components/ui/progress';

interface AddApplicationDialogProps {
  trigger?: React.ReactNode;
}

type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';

interface ResumeAnalysis {
  overallScore: number;
  categories: {
    keywords: { score: number; feedback: string; matchedKeywords?: string[]; missingKeywords?: string[] };
    experience: { score: number; feedback: string };
    skills: { score: number; feedback: string; matchedSkills?: string[]; missingSkills?: string[] };
    formatting: { score: number; feedback: string };
    impact: { score: number; feedback: string };
  };
  topImprovements: string[];
  summary: string;
}

export function AddApplicationDialog({ trigger }: AddApplicationDialogProps) {
  const { addApplication, uploadResume } = useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [showGeneratedResume, setShowGeneratedResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    location: '',
    salary_min: '',
    salary_max: '',
    status: 'Saved' as ApplicationStatus,
    job_posting_url: '',
    job_description: '',
    notes: '',
    work_style: '',
    industry: '',
    role_type: '',
  });

  const resetForm = () => {
    setFormData({
      position: '',
      company: '',
      location: '',
      salary_min: '',
      salary_max: '',
      status: 'Saved',
      job_posting_url: '',
      job_description: '',
      notes: '',
      work_style: '',
      industry: '',
      role_type: '',
    });
    setResumeFile(null);
    setResumeText('');
    setAnalysis(null);
    setShowFullAnalysis(false);
    setGeneratedResume('');
    setShowGeneratedResume(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.position || !formData.company) return;

    setLoading(true);
    try {
      const newApp = await addApplication({
        position: formData.position,
        company: formData.company,
        location: formData.location || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) * 1000 : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) * 1000 : null,
        status: formData.status,
        job_posting_url: formData.job_posting_url || null,
        job_description: formData.job_description || null,
        notes: formData.notes || null,
        work_style: formData.work_style || null,
        date_applied: new Date().toISOString().split('T')[0],
        resume_url: null,
        company_logo_url: null,
        latitude: null,
        longitude: null,
        industry: formData.industry || null,
        role_type: formData.role_type || null,
      });

      // Upload resume if selected
      if (resumeFile && newApp?.id) {
        await uploadResume(newApp.id, resumeFile);
      }

      toast.success('Application added! 🎯');
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    
    // Read file content for analysis
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setResumeText(text);
      
      // Auto-analyze if we have a job description
      if (formData.job_description) {
        await analyzeResume(text, formData.job_description);
      }
    };
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      // For PDF/DOC files, we'll need the user to paste the text or use the file upload
      setResumeText('');
      toast.info('For best results, paste your resume text below or use a .txt file');
    }
  };

  const analyzeResume = async (resume: string, jobDesc: string) => {
    if (!resume || !jobDesc) {
      toast.error('Both resume and job description are required for analysis');
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          resumeText: resume,
          jobDescription: jobDesc,
          jobTitle: formData.position,
          company: formData.company,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('AI credits exhausted.');
        } else {
          toast.error(error.error || 'Failed to analyze resume');
        }
        return;
      }

      const data = await response.json();
      setAnalysis(data);
      toast.success('Resume analyzed!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!formData.job_description) {
      toast.error('Please add a job description first');
      return;
    }

    setGenerating(true);
    setGeneratedResume('');
    setShowGeneratedResume(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          masterResume: { summary: '', skills: [], experience: [], education: [], certifications: [] },
          jobDescription: formData.job_description,
          jobTitle: formData.position,
          company: formData.company,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate resume');
        setGenerating(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let resumeContent = '';

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              resumeContent += content;
              setGeneratedResume(resumeContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Use generated resume as the resume text for analysis
      setResumeText(resumeContent);
      toast.success('Resume generated! You can now analyze it against the job.');
    } catch (error) {
      console.error('Error generating resume:', error);
      toast.error('Failed to generate resume');
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];
  const workStyles = ['Remote', 'Hybrid', 'On-site'];

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <ButtonRetro>
            <Plus className="h-4 w-4" /> Add App
          </ButtonRetro>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-border shadow-retro-xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Add New Application 🎯</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Role Title *
              </label>
              <InputRetro
                placeholder="e.g., Product Designer"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Company Name *
              </label>
              <InputRetro
                placeholder="e.g., Linear"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </label>
              <InputRetro
                placeholder="e.g., San Francisco, CA or Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Work Style</label>
              <div className="flex gap-2">
                {workStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData({ ...formData, work_style: style })}
                    className={cn(
                      "px-3 py-1 rounded-full border-2 border-border text-sm font-bold transition-all flex-1",
                      formData.work_style === style
                        ? "bg-primary text-primary-foreground shadow-retro-sm"
                        : "bg-card hover:bg-muted"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Industry & Role Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Tag className="h-4 w-4" /> Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full p-2 border-2 border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              >
                <option value="">Select industry...</option>
                {industryOptions.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Role Type
              </label>
              <select
                value={formData.role_type}
                onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
                className="w-full p-2 border-2 border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              >
                <option value="">Select role type...</option>
                {roleTypeOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Salary Range (in thousands)
              </label>
              <div className="flex gap-2 items-center">
                <InputRetro
                  type="number"
                  placeholder="Min (e.g., 120)"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  className="flex-1"
                />
                <span className="text-muted-foreground">-</span>
                <InputRetro
                  type="number"
                  placeholder="Max (e.g., 150)"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <LinkIcon className="h-4 w-4" /> Job Posting URL
              </label>
              <InputRetro
                type="url"
                placeholder="https://..."
                value={formData.job_posting_url}
                onChange={(e) => setFormData({ ...formData, job_posting_url: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Status</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status })}
                  className={cn(
                    "px-3 py-1 rounded-full border-2 border-border text-sm font-bold transition-all",
                    formData.status === status
                      ? "bg-primary text-primary-foreground shadow-retro-sm"
                      : "bg-card hover:bg-muted"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4" /> Job Description
            </label>
            <textarea
              placeholder="Paste the job description here..."
              value={formData.job_description}
              onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
              className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px] resize-none"
            />
          </div>

          {/* Resume Section */}
          <div className="space-y-3 p-4 border-2 border-border rounded-xl bg-muted/30">
            <h4 className="font-bold flex items-center gap-2">
              <Upload className="h-4 w-4" /> Resume for this Job
            </h4>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleResumeUpload}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-3">
              <ButtonRetro
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4" />
                {resumeFile ? resumeFile.name.slice(0, 20) + '...' : 'Upload Resume'}
              </ButtonRetro>
              
              <ButtonRetro
                type="button"
                variant="default"
                onClick={handleGenerateResume}
                disabled={!formData.job_description || generating}
                className="w-full"
              >
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="h-4 w-4" /> Generate ATS Resume</>
                )}
              </ButtonRetro>
            </div>

            {!formData.job_description && (
              <p className="text-xs text-muted-foreground">Add a job description to enable resume generation and analysis</p>
            )}

            {/* Resume Text Input (for manual paste or edit) */}
            {(resumeFile || showGeneratedResume) && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Resume Text (paste or edit for analysis)
                </label>
                <textarea
                  placeholder="Paste your resume text here for ATS analysis..."
                  value={resumeText || generatedResume}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full p-3 border-2 border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px] resize-none text-xs font-mono"
                />
                
                {formData.job_description && (resumeText || generatedResume) && (
                  <ButtonRetro
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => analyzeResume(resumeText || generatedResume, formData.job_description)}
                    disabled={analyzing}
                    className="w-full"
                  >
                    {analyzing ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4" /> Analyze Resume Score</>
                    )}
                  </ButtonRetro>
                )}
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-3 p-3 bg-background rounded-lg border-2 border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg", getScoreBgColor(analysis.overallScore))}>
                      <span className={getScoreColor(analysis.overallScore)}>{analysis.overallScore}</span>
                    </div>
                    <div>
                      <p className="font-bold">ATS Resume Score</p>
                      <p className="text-xs text-muted-foreground">{analysis.summary?.slice(0, 60)}...</p>
                    </div>
                  </div>
                  <ButtonRetro
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                  >
                    {showFullAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </ButtonRetro>
                </div>

                {showFullAnalysis && (
                  <div className="space-y-3 pt-3 border-t border-border">
                    {Object.entries(analysis.categories).map(([key, cat]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium capitalize">{key}</span>
                          <span className={cn("font-bold", getScoreColor(cat.score))}>{cat.score}%</span>
                        </div>
                        <Progress value={cat.score} className="h-2" />
                        <p className="text-xs text-muted-foreground">{cat.feedback}</p>
                      </div>
                    ))}

                    {analysis.topImprovements && analysis.topImprovements.length > 0 && (
                      <div className="pt-2">
                        <p className="text-sm font-bold flex items-center gap-1 mb-2">
                          <AlertCircle className="h-4 w-4" /> Top Improvements
                        </p>
                        <ul className="space-y-1">
                          {analysis.topImprovements.map((imp, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Notes</label>
            <textarea
              placeholder="Any notes about this opportunity..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[80px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <ButtonRetro type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }} className="flex-1" disabled={loading}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Adding...' : <><Plus className="h-4 w-4" /> Add Application</>}
            </ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
