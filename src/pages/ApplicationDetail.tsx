import { useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { InputRetro } from '@/components/ui/input-retro';
import { ArrowLeft, ExternalLink, Trash2, MapPin, DollarSign, Calendar, Building2, FileText, Clock, Edit2, Check, X, Upload, Link as LinkIcon, Sparkles, Wand2, Target, Tag, ChevronDown, ChevronUp, Download, Save, Loader2, Briefcase, StickyNote, BarChart3, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddEventDialog } from '@/components/dialogs/AddEventDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MasterResume, industryOptions, roleTypeOptions } from '@/lib/data';
import { calculateMatchScore, getScoreColor, getScoreBgColor } from '@/lib/matchScore';
import { Progress } from '@/components/ui/progress';
import { useMasterResume } from '@/hooks/useMasterResume';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterviewWizard } from '@/components/interview/InterviewWizard';

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

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Saved: 'saved',
    Applied: 'applied',
    Interview: 'interview',
    Offer: 'offer',
    Rejected: 'rejected',
    Ghosted: 'ghosted',
  };
  return colors[status] || 'saved';
};

const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return 'Not specified';
  if (min && max) return `$${Math.round(min / 1000)}k - $${Math.round(max / 1000)}k`;
  if (min) return `$${Math.round(min / 1000)}k+`;
  if (max) return `Up to $${Math.round(max / 1000)}k`;
  return 'Not specified';
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applications, updateApplication, deleteApplication, events, uploadResume, jobPreferences } = useApp();
  const { masterResume, hasResume: hasMasterResume } = useMasterResume();
  const app = applications.find(a => a.id === id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showATSDialog, setShowATSDialog] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [savingResume, setSavingResume] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    position: app?.position || '',
    company: app?.company || '',
    location: app?.location || '',
    salary_min: app?.salary_min ? String(app.salary_min / 1000) : '',
    salary_max: app?.salary_max ? String(app.salary_max / 1000) : '',
    job_posting_url: app?.job_posting_url || '',
    job_description: app?.job_description || '',
    notes: app?.notes || '',
    work_style: app?.work_style || '',
    date_applied: app?.date_applied || new Date().toISOString().split('T')[0],
    industry: app?.industry || '',
    role_type: app?.role_type || '',
  });

  const matchBreakdown = useMemo(() => {
    if (!app) return null;
    return calculateMatchScore(app, jobPreferences);
  }, [app, jobPreferences]);

  const relatedEvents = events.filter(e => e.application_id === id);

  if (!app) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Application not found</h2>
        <ButtonRetro onClick={() => navigate('/applications')} className="mt-4">Back to Applications</ButtonRetro>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this application?')) {
      await deleteApplication(app.id);
      navigate('/applications');
      toast.success('Application deleted');
    }
  };

  const handleSaveEdit = async () => {
    await updateApplication(app.id, {
      position: editForm.position,
      company: editForm.company,
      location: editForm.location || null,
      salary_min: editForm.salary_min ? parseInt(editForm.salary_min) * 1000 : null,
      salary_max: editForm.salary_max ? parseInt(editForm.salary_max) * 1000 : null,
      job_posting_url: editForm.job_posting_url || null,
      job_description: editForm.job_description || null,
      notes: editForm.notes || null,
      work_style: editForm.work_style || null,
      date_applied: editForm.date_applied,
      industry: editForm.industry || null,
      role_type: editForm.role_type || null,
    });
    setIsEditing(false);
    toast.success('Application updated');
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateApplication(app.id, { status: newStatus });
    setIsEditingStatus(false);
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadResume(app.id, file);
      if (url) {
        toast.success('Resume uploaded successfully!');
      } else {
        toast.error('Failed to upload resume');
      }
    } catch (error) {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const getResumeDownloadUrl = async () => {
    if (!app.resume_url) return null;
    const { data } = await supabase.storage
      .from('resumes')
      .createSignedUrl(app.resume_url, 3600);
    return data?.signedUrl;
  };

  const handleViewResume = async () => {
    const url = await getResumeDownloadUrl();
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Could not retrieve resume');
    }
  };

  const handleGenerateATSResume = async () => {
    if (!app.job_description) {
      toast.error('Please add a job description first to generate an ATS-optimized resume');
      return;
    }

    setShowATSDialog(true);
    setGeneratingResume(true);
    setGeneratedResume('');

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          masterResume: masterResume,
          jobDescription: app.job_description,
          jobTitle: app.position,
          company: app.company,
        }),
      });

      if (!resp.ok) {
        const error = await resp.json();
        if (resp.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (resp.status === 402) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          toast.error(error.error || 'Failed to generate resume');
        }
        setGeneratingResume(false);
        return;
      }

      const reader = resp.body?.getReader();
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

      setGeneratingResume(false);
    } catch (error) {
      console.error('Error generating resume:', error);
      toast.error('Failed to generate resume');
      setGeneratingResume(false);
    }
  };

  const handleCopyResume = () => {
    navigator.clipboard.writeText(generatedResume);
    toast.success('Resume copied to clipboard!');
  };

  const handleSaveGeneratedResume = async () => {
    if (!user || !app || !generatedResume) return;

    setSavingResume(true);
    try {
      const fileName = `${user.id}/${app.id}/generated_resume_${Date.now()}.txt`;
      const blob = new Blob([generatedResume], { type: 'text/plain' });

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, blob);

      if (uploadError) {
        toast.error('Failed to save resume');
        return;
      }

      await updateApplication(app.id, { resume_url: fileName });
      toast.success('Resume saved to your application!');
      setShowATSDialog(false);
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setSavingResume(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!app?.resume_url) return;
    
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(app.resume_url);

      if (error || !data) {
        toast.error('Failed to download resume');
        return;
      }

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      
      const ext = app.resume_url.split('.').pop() || 'txt';
      link.download = `${app.company}_${app.position}_resume.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded!');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    } finally {
      setDownloading(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!app?.resume_url || !app?.job_description) {
      toast.error('Resume and job description are required for analysis');
      return;
    }

    setAnalyzingResume(true);
    setResumeAnalysis(null);
    setShowAnalysisDialog(true);

    try {
      const { data: resumeData, error: downloadError } = await supabase.storage
        .from('resumes')
        .download(app.resume_url);

      if (downloadError || !resumeData) {
        toast.error('Failed to retrieve resume');
        setAnalyzingResume(false);
        return;
      }

      const resumeText = await resumeData.text();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          resumeText: resumeText,
          jobDescription: app.job_description,
          jobTitle: app.position,
          company: app.company,
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
        setAnalyzingResume(false);
        return;
      }

      const analysisData = await response.json();
      setResumeAnalysis(analysisData);
      
      if (analysisData.overallScore) {
        await updateApplication(app.id, { resume_score: analysisData.overallScore });
      }
      
      toast.success('Resume analyzed!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setAnalyzingResume(false);
    }
  };

  const getAnalysisScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAnalysisScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <ButtonRetro variant="ghost" onClick={() => navigate('/applications')}>
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </ButtonRetro>

      {/* Header Card - Always Visible */}
      <CardRetro className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/20 border-2 border-border flex items-center justify-center text-2xl font-black shrink-0">
            {app.company.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <InputRetro
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  placeholder="Role Title"
                  className="text-xl font-bold"
                />
                <InputRetro
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="Company"
                />
              </div>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-black truncate">{app.position}</h1>
                <p className="text-lg text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span>{app.company}</span>
                  {app.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {app.location}
                      </span>
                    </>
                  )}
                </p>
              </>
            )}
            
            {/* Quick Info Row */}
            <div className="flex gap-3 mt-3 flex-wrap items-center">
              {isEditingStatus ? (
                <div className="flex gap-2 flex-wrap">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={cn(
                        "px-3 py-1 rounded-full border-2 border-border text-sm font-bold transition-all",
                        app.status === status
                          ? "bg-primary text-primary-foreground shadow-retro-sm"
                          : "bg-card hover:bg-muted"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                  <ButtonRetro size="sm" variant="ghost" onClick={() => setIsEditingStatus(false)}>
                    <X className="h-4 w-4" />
                  </ButtonRetro>
                </div>
              ) : (
                <>
                  <StatusBadge status={getStatusColor(app.status) as any}>{app.status}</StatusBadge>
                  <ButtonRetro size="sm" variant="ghost" onClick={() => setIsEditingStatus(true)}>
                    <Edit2 className="h-3 w-3" /> Change
                  </ButtonRetro>
                </>
              )}
              
              {/* Match Score Badge */}
              {matchBreakdown && (
                <div className={cn("px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1", getScoreBgColor(matchBreakdown.totalScore))}>
                  <Target className="h-3 w-3" />
                  <span className={getScoreColor(matchBreakdown.totalScore)}>{matchBreakdown.totalScore}% Match</span>
                </div>
              )}
              
              {/* ATS Score Badge */}
              {app.resume_score && (
                <div className={cn("px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1", getAnalysisScoreBgColor(app.resume_score))}>
                  <BarChart3 className="h-3 w-3" />
                  <span className={getAnalysisScoreColor(app.resume_score)}>ATS: {app.resume_score}%</span>
                </div>
              )}
            </div>
            
            {/* Tags */}
            {(app.industry || app.role_type || app.work_style) && !isEditing && (
              <div className="flex gap-2 flex-wrap mt-3">
                {app.industry && (
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-xs font-medium flex items-center gap-1 border border-border">
                    <Tag className="h-3 w-3" /> {app.industry}
                  </span>
                )}
                {app.role_type && (
                  <span className="px-2 py-1 rounded-full bg-muted text-xs font-medium border border-border">
                    {app.role_type}
                  </span>
                )}
                {app.work_style && (
                  <span className="px-2 py-1 rounded-full bg-muted text-xs font-medium border border-border flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {app.work_style}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Header Actions */}
          <div className="flex gap-2 shrink-0">
            {app.job_posting_url && (
              <ButtonRetro size="sm" variant="outline" onClick={() => window.open(app.job_posting_url!, '_blank')}>
                <ExternalLink className="h-4 w-4" />
              </ButtonRetro>
            )}
            {!isEditing ? (
              <ButtonRetro size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </ButtonRetro>
            ) : (
              <div className="flex gap-2">
                <ButtonRetro size="sm" onClick={handleSaveEdit}>
                  <Check className="h-4 w-4" />
                </ButtonRetro>
                <ButtonRetro size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </ButtonRetro>
              </div>
            )}
          </div>
        </div>
      </CardRetro>

      {/* Main Content with Tabs */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start mb-4 bg-muted/50 p-1">
              <TabsTrigger value="overview" className="gap-2">
                <Briefcase className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="resume" className="gap-2">
                <FileText className="h-4 w-4" /> Resume
              </TabsTrigger>
              <TabsTrigger value="interview" className="gap-2">
                <GraduationCap className="h-4 w-4" /> Interview
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <StickyNote className="h-4 w-4" /> Notes
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              {/* Quick Details */}
              <CardRetro className="p-6">
                <h3 className="font-bold text-lg mb-4">Job Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Salary Range</p>
                      {isEditing ? (
                        <div className="flex gap-2 items-center">
                          <InputRetro
                            type="number"
                            value={editForm.salary_min}
                            onChange={(e) => setEditForm({ ...editForm, salary_min: e.target.value })}
                            placeholder="Min"
                            className="w-16 text-sm"
                          />
                          <span>-</span>
                          <InputRetro
                            type="number"
                            value={editForm.salary_max}
                            onChange={(e) => setEditForm({ ...editForm, salary_max: e.target.value })}
                            placeholder="Max"
                            className="w-16 text-sm"
                          />
                          <span className="text-xs text-muted-foreground">k</span>
                        </div>
                      ) : (
                        <p className="font-bold">{formatSalary(app.salary_min, app.salary_max)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date Applied</p>
                      {isEditing ? (
                        <InputRetro
                          type="date"
                          value={editForm.date_applied}
                          onChange={(e) => setEditForm({ ...editForm, date_applied: e.target.value })}
                          className="w-36 text-sm"
                        />
                      ) : (
                        <p className="font-bold">{new Date(app.date_applied).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Work Style</p>
                      {isEditing ? (
                        <div className="flex gap-1">
                          {['Remote', 'Hybrid', 'On-site'].map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setEditForm({ ...editForm, work_style: style })}
                              className={cn(
                                "px-2 py-0.5 rounded text-xs font-bold border border-border",
                                editForm.work_style === style ? "bg-primary text-primary-foreground" : "bg-muted"
                              )}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="font-bold">{app.work_style || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      {isEditing ? (
                        <InputRetro
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          placeholder="City, State"
                          className="text-sm"
                        />
                      ) : (
                        <p className="font-bold">{app.location || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Industry & Role Type (Edit Mode) */}
                {isEditing && (
                  <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Industry</label>
                      <select
                        value={editForm.industry}
                        onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                        className="w-full p-2 border-2 border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                      >
                        <option value="">Select industry...</option>
                        {industryOptions.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role Type</label>
                      <select
                        value={editForm.role_type}
                        onChange={(e) => setEditForm({ ...editForm, role_type: e.target.value })}
                        className="w-full p-2 border-2 border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                      >
                        <option value="">Select role type...</option>
                        {roleTypeOptions.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </CardRetro>

              {/* Dream Job Match Score */}
              {matchBreakdown && (
                <CardRetro className="p-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl", getScoreBgColor(matchBreakdown.totalScore))}>
                        <span className={getScoreColor(matchBreakdown.totalScore)}>{matchBreakdown.totalScore}%</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <Target className="h-5 w-5" /> Dream Job Match
                        </h3>
                        <p className="text-sm text-muted-foreground">Based on your job preferences</p>
                      </div>
                    </div>
                    <ButtonRetro size="sm" variant="ghost">
                      {showScoreBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </ButtonRetro>
                  </div>
                  
                  {showScoreBreakdown && (
                    <div className="mt-4 pt-4 border-t-2 border-border space-y-4">
                      {[
                        { key: 'location', label: 'Location', icon: MapPin, data: matchBreakdown.location },
                        { key: 'salary', label: 'Salary', icon: DollarSign, data: matchBreakdown.salary },
                        { key: 'roleType', label: 'Role Type', icon: Building2, data: matchBreakdown.roleType },
                        { key: 'industry', label: 'Industry', icon: Tag, data: matchBreakdown.industry },
                        { key: 'workStyle', label: 'Work Style', icon: Clock, data: matchBreakdown.workStyle },
                      ].map(({ key, label, icon: Icon, data }) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 font-medium">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              {label}
                              <span className="text-xs text-muted-foreground">({data.weight}% weight)</span>
                            </span>
                            <span className={cn("font-bold", getScoreColor(data.score))}>{data.score}%</span>
                          </div>
                          <Progress value={data.score} className="h-2" />
                          <p className="text-xs text-muted-foreground">{data.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardRetro>
              )}

              {/* Job Description */}
              <CardRetro className="p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Job Description
                </h3>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> Job Posting URL
                      </label>
                      <InputRetro
                        type="url"
                        value={editForm.job_posting_url}
                        onChange={(e) => setEditForm({ ...editForm, job_posting_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <textarea
                      value={editForm.job_description}
                      onChange={(e) => setEditForm({ ...editForm, job_description: e.target.value })}
                      className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[200px] resize-none"
                      placeholder="Paste the job description here..."
                    />
                  </div>
                ) : (
                  <>
                    {app.job_posting_url && (
                      <a 
                        href={app.job_posting_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline text-sm flex items-center gap-1 mb-3"
                      >
                        <LinkIcon className="h-3 w-3" /> View original posting
                      </a>
                    )}
                    {app.job_description ? (
                      <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed max-h-[400px] overflow-y-auto">{app.job_description}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No job description added. Click Edit to paste one!</p>
                    )}
                  </>
                )}
              </CardRetro>
            </TabsContent>

            {/* Resume Tab */}
            <TabsContent value="resume" className="space-y-6 mt-0">
              <CardRetro className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Resume Management
                </h3>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                
                {app.resume_url ? (
                  <div className="space-y-4">
                    {/* Current Resume Status */}
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-medium">Resume Uploaded</span>
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        {app.resume_score && (
                          <div className={cn("px-3 py-1 rounded-full font-bold text-sm", getAnalysisScoreBgColor(app.resume_score))}>
                            <span className={getAnalysisScoreColor(app.resume_score)}>ATS Score: {app.resume_score}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <ButtonRetro size="sm" variant="outline" onClick={handleViewResume}>
                          <FileText className="h-4 w-4" /> View
                        </ButtonRetro>
                        <ButtonRetro size="sm" variant="outline" onClick={handleDownloadResume} disabled={downloading}>
                          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download
                        </ButtonRetro>
                        <ButtonRetro size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          <Upload className="h-4 w-4" /> Replace
                        </ButtonRetro>
                      </div>
                    </div>

                    {/* Analyze Resume */}
                    {app.job_description && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <Target className="h-4 w-4" /> Analyze Your Resume
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                          Get detailed feedback on how well your resume matches this job description.
                        </p>
                        <ButtonRetro
                          variant="outline"
                          className="w-full gap-2 border-blue-300 dark:border-blue-700"
                          onClick={handleAnalyzeResume}
                          disabled={analyzingResume}
                        >
                          {analyzingResume ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                          ) : (
                            <><Target className="h-4 w-4" /> Analyze ATS Score</>
                          )}
                        </ButtonRetro>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium mb-1">No resume uploaded</p>
                    <p className="text-sm text-muted-foreground mb-3">Upload your resume to track it with this application</p>
                    <ButtonRetro
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : <><Upload className="h-4 w-4" /> Upload Resume</>}
                    </ButtonRetro>
                    <p className="text-xs text-muted-foreground mt-2">PDF, DOC, or DOCX files</p>
                  </div>
                )}
              </CardRetro>

              {/* AI Resume Generator */}
              <CardRetro className="p-6">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" /> AI Resume Generator
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate an ATS-optimized resume tailored specifically for this job using your master resume.
                </p>
                
                <ButtonRetro
                  className="w-full gap-2"
                  onClick={handleGenerateATSResume}
                  disabled={!app.job_description || generatingResume}
                >
                  {generatingResume ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate ATS-Optimized Resume</>
                  )}
                </ButtonRetro>
                
                {!app.job_description && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    ⚠️ Add a job description first to generate a tailored resume
                  </p>
                )}
                {!hasMasterResume && app.job_description && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    💡 Add your master resume in Profile for better results
                  </p>
                )}
              </CardRetro>
            </TabsContent>


            {/* Interview Tab */}
            <TabsContent value="interview" className="mt-0">
              <InterviewWizard
                applicationId={app.id}
                jobDescription={app.job_description}
                jobTitle={app.position}
                company={app.company}
                industry={app.industry}
              />
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6 mt-0">
              <CardRetro className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <StickyNote className="h-5 w-5" /> Notes & Observations
                </h3>
                {isEditing ? (
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[200px] resize-none"
                    placeholder="Add notes about this opportunity, interview prep, company research..."
                  />
                ) : (
                  <div className="min-h-[120px]">
                    {app.notes ? (
                      <p className="text-muted-foreground whitespace-pre-wrap">{app.notes}</p>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notes yet.</p>
                        <p className="text-sm">Click Edit to add your thoughts about this opportunity.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardRetro>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Timeline */}
          <CardRetro className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Clock className="h-5 w-5" /> Activity Timeline
              </h3>
              <AddEventDialog applicationId={app.id} trigger={
                <ButtonRetro size="sm" variant="ghost"><Calendar className="h-3 w-3" /> Add</ButtonRetro>
              } />
            </div>
            <div className="space-y-3">
              {relatedEvents.map(event => (
                <div key={event.id} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 p-2 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                <div>
                  <p className="font-bold text-sm">Applied</p>
                  <p className="text-xs text-muted-foreground">{new Date(app.date_applied).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-3 p-2 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-2" />
                <div>
                  <p className="font-bold text-sm text-muted-foreground">Application Created</p>
                  <p className="text-xs text-muted-foreground">Tracking started</p>
                </div>
              </div>
            </div>
          </CardRetro>

          {/* Quick Actions */}
          <CardRetro className="p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {app.job_posting_url && (
                <ButtonRetro variant="outline" className="w-full justify-start gap-2" onClick={() => window.open(app.job_posting_url!, '_blank')}>
                  <ExternalLink className="h-4 w-4" /> View Job Posting
                </ButtonRetro>
              )}
              <ButtonRetro variant="outline" className="w-full justify-start gap-2" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" /> Edit Details
              </ButtonRetro>
              <AddEventDialog applicationId={app.id} trigger={
                <ButtonRetro variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" /> Schedule Event
                </ButtonRetro>
              } />
            </div>
          </CardRetro>

          {/* Danger Zone */}
          <ButtonRetro variant="destructive" className="w-full" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete Application
          </ButtonRetro>
        </div>
      </div>

      {/* ATS Resume Dialog */}
      <Dialog open={showATSDialog} onOpenChange={setShowATSDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              ATS-Optimized Resume
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {generatingResume && !generatedResume && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Generating your optimized resume...</p>
              </div>
            )}
            {generatedResume && (
              <div className="space-y-4">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[50vh]">
                  {generatedResume}
                </pre>
                <div className="flex gap-2 flex-wrap">
                  <ButtonRetro onClick={handleSaveGeneratedResume} disabled={savingResume}>
                    {savingResume ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="h-4 w-4" /> Save to Application</>
                    )}
                  </ButtonRetro>
                  <ButtonRetro variant="outline" onClick={handleCopyResume}>
                    Copy to Clipboard
                  </ButtonRetro>
                  <ButtonRetro variant="outline" onClick={() => setShowATSDialog(false)}>
                    Close
                  </ButtonRetro>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Save the resume to your application, or copy and paste into a Word document to format as PDF.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Resume Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {analyzingResume && !resumeAnalysis && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing your resume against the job description...</p>
              </div>
            )}
            {resumeAnalysis && (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-border">
                  <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center font-black text-xl", getAnalysisScoreBgColor(resumeAnalysis.overallScore))}>
                    <span className={getAnalysisScoreColor(resumeAnalysis.overallScore)}>{resumeAnalysis.overallScore}</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">ATS Resume Score</p>
                    <p className="text-sm text-muted-foreground">{resumeAnalysis.summary}</p>
                  </div>
                </div>

                {/* Category Breakdowns */}
                <div className="space-y-3">
                  <h4 className="font-bold">Score Breakdown</h4>
                  {Object.entries(resumeAnalysis.categories).map(([key, cat]) => (
                    <div key={key} className="space-y-1 p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{key}</span>
                        <span className={cn("font-bold", getAnalysisScoreColor(cat.score))}>{cat.score}%</span>
                      </div>
                      <Progress value={cat.score} className="h-2" />
                      <p className="text-xs text-muted-foreground">{cat.feedback}</p>
                    </div>
                  ))}
                </div>

                {/* Top Improvements */}
                {resumeAnalysis.topImprovements && resumeAnalysis.topImprovements.length > 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="font-bold flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-200">
                      <Sparkles className="h-4 w-4" /> Top Improvements
                    </p>
                    <ul className="space-y-2">
                      {resumeAnalysis.topImprovements.map((imp, i) => (
                        <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                          <span className="text-amber-500">•</span> {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <ButtonRetro variant="outline" onClick={() => setShowAnalysisDialog(false)} className="flex-1">
                    Close
                  </ButtonRetro>
                  <ButtonRetro onClick={handleGenerateATSResume} className="flex-1">
                    <Wand2 className="h-4 w-4" /> Generate Improved Resume
                  </ButtonRetro>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
