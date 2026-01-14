import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { InputRetro } from '@/components/ui/input-retro';
import { ArrowLeft, ExternalLink, Trash2, MapPin, DollarSign, Calendar, Building2, FileText, Clock, Edit2, Check, X, Upload, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddEventDialog } from '@/components/dialogs/AddEventDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';

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
  const { applications, updateApplication, deleteApplication, events, uploadResume } = useApp();
  const app = applications.find(a => a.id === id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
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
  });

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

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];

  return (
    <div className="space-y-6">
      <ButtonRetro variant="ghost" onClick={() => navigate('/applications')}>
        <ArrowLeft className="h-4 w-4" /> Back
      </ButtonRetro>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <CardRetro className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/20 border-2 border-border flex items-center justify-center text-2xl font-black">
                {app.company.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <InputRetro
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      placeholder="Role Title"
                      className="text-2xl font-bold"
                    />
                    <InputRetro
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      placeholder="Company"
                    />
                    <InputRetro
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Location"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-black">{app.position}</h1>
                    <p className="text-lg text-muted-foreground">{app.company} • {app.location || 'No location'}</p>
                  </>
                )}
                <div className="flex gap-2 mt-3 flex-wrap items-center">
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
                  {app.job_posting_url && (
                    <ButtonRetro size="sm" variant="outline" onClick={() => window.open(app.job_posting_url!, '_blank')}>
                      <ExternalLink className="h-4 w-4" /> View Posting
                    </ButtonRetro>
                  )}
                </div>
              </div>
              {!isEditing && (
                <ButtonRetro size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" /> Edit
                </ButtonRetro>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-4">
                <ButtonRetro size="sm" onClick={handleSaveEdit}>
                  <Check className="h-4 w-4" /> Save
                </ButtonRetro>
                <ButtonRetro size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" /> Cancel
                </ButtonRetro>
              </div>
            )}
          </CardRetro>

          <CardRetro className="p-6">
            <h3 className="font-bold text-lg mb-4">Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  {isEditing ? (
                    <div className="flex gap-2 items-center">
                      <InputRetro
                        type="number"
                        value={editForm.salary_min}
                        onChange={(e) => setEditForm({ ...editForm, salary_min: e.target.value })}
                        placeholder="Min"
                        className="w-20"
                      />
                      <span>-</span>
                      <InputRetro
                        type="number"
                        value={editForm.salary_max}
                        onChange={(e) => setEditForm({ ...editForm, salary_max: e.target.value })}
                        placeholder="Max"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">k</span>
                    </div>
                  ) : (
                    <p className="font-bold">{formatSalary(app.salary_min, app.salary_max)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Applied</p>
                  <p className="font-bold">{new Date(app.date_applied).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
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
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-bold">{app.location || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </CardRetro>

          {/* Job Posting URL */}
          <CardRetro className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <LinkIcon className="h-5 w-5" /> Job Posting Link
            </h3>
            {isEditing ? (
              <InputRetro
                type="url"
                value={editForm.job_posting_url}
                onChange={(e) => setEditForm({ ...editForm, job_posting_url: e.target.value })}
                placeholder="https://..."
              />
            ) : (
              app.job_posting_url ? (
                <a href={app.job_posting_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                  {app.job_posting_url}
                </a>
              ) : (
                <p className="text-muted-foreground">No job posting link added</p>
              )
            )}
          </CardRetro>

          {/* Job Description */}
          <CardRetro className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" /> Job Description
            </h3>
            {isEditing ? (
              <textarea
                value={editForm.job_description}
                onChange={(e) => setEditForm({ ...editForm, job_description: e.target.value })}
                className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[200px] resize-none"
                placeholder="Paste the job description here..."
              />
            ) : (
              app.job_description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">{app.job_description}</p>
              ) : (
                <p className="text-muted-foreground italic">No job description added. Click Edit to paste one!</p>
              )
            )}
          </CardRetro>

          {/* Notes Section */}
          <CardRetro className="p-6">
            <h3 className="font-bold text-lg mb-3">Notes</h3>
            {isEditing ? (
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[120px] resize-none"
                placeholder="Add notes about this opportunity..."
              />
            ) : (
              <p className="text-muted-foreground">{app.notes || 'No notes yet. Click Edit to add some!'}</p>
            )}
          </CardRetro>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Resume Upload */}
          <CardRetro className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" /> Resume for this Job
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
            />
            {app.resume_url ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Resume uploaded ✓</p>
                <div className="flex gap-2">
                  <ButtonRetro size="sm" variant="outline" onClick={handleViewResume}>
                    <FileText className="h-4 w-4" /> View
                  </ButtonRetro>
                  <ButtonRetro size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload className="h-4 w-4" /> Replace
                  </ButtonRetro>
                </div>
              </div>
            ) : (
              <ButtonRetro
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : <><Upload className="h-4 w-4" /> Upload Resume</>}
              </ButtonRetro>
            )}
            <p className="text-xs text-muted-foreground mt-2">PDF, DOC, or DOCX files</p>
          </CardRetro>

          {/* Activity Timeline */}
          <CardRetro className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Activity Timeline</h3>
              <AddEventDialog applicationId={app.id} trigger={
                <ButtonRetro size="sm" variant="ghost"><Calendar className="h-3 w-3" /></ButtonRetro>
              } />
            </div>
            <div className="space-y-3">
              {relatedEvents.map(event => (
                <div key={event.id} className="flex gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-bold text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-bold text-sm">Applied</p>
                  <p className="text-xs text-muted-foreground">{new Date(app.date_applied).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-bold text-sm">Application Created</p>
                  <p className="text-xs text-muted-foreground">Tracking started</p>
                </div>
              </div>
            </div>
          </CardRetro>

          <ButtonRetro variant="destructive" className="w-full" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete Application
          </ButtonRetro>
        </div>
      </div>
    </div>
  );
}
