import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { InputRetro } from '@/components/ui/input-retro';
import { getStatusColor, ApplicationStatus } from '@/lib/data';
import { ArrowLeft, ExternalLink, Trash2, MapPin, DollarSign, Calendar, Building2, FileText, Clock, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddEventDialog } from '@/components/dialogs/AddEventDialog';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, updateApplication, deleteApplication, events } = useApp();
  const app = applications.find(a => a.id === id);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(app?.notes || '');
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const relatedEvents = events.filter(e => e.applicationId === id);

  if (!app) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Application not found</h2>
        <ButtonRetro onClick={() => navigate('/applications')} className="mt-4">Back to Applications</ButtonRetro>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteApplication(app.id);
      navigate('/applications');
    }
  };

  const handleSaveNotes = () => {
    updateApplication(app.id, { notes: editedNotes });
    setIsEditingNotes(false);
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    updateApplication(app.id, { status: newStatus });
    setIsEditingStatus(false);
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
                {app.companyInitial}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black">{app.roleTitle}</h1>
                <p className="text-lg text-muted-foreground">{app.companyName} • {app.location}</p>
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
                  {app.applicationUrl && (
                    <ButtonRetro size="sm" variant="outline" onClick={() => window.open(app.applicationUrl, '_blank')}>
                      <ExternalLink className="h-4 w-4" /> View Posting
                    </ButtonRetro>
                  )}
                </div>
              </div>
            </div>
          </CardRetro>

          <CardRetro className="p-6">
            <h3 className="font-bold text-lg mb-4">Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="font-bold">{app.salaryRange || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Applied</p>
                  <p className="font-bold">{new Date(app.appliedDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-bold">{app.roleType || 'Full-time'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-bold">{app.location}</p>
                </div>
              </div>
            </div>
            {app.industryTags && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {app.industryTags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-muted rounded-full text-xs font-bold border-2 border-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardRetro>

          {/* Notes Section - Editable */}
          <CardRetro className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Notes</h3>
              {!isEditingNotes && (
                <ButtonRetro size="sm" variant="ghost" onClick={() => { setEditedNotes(app.notes || ''); setIsEditingNotes(true); }}>
                  <Edit2 className="h-3 w-3" /> Edit
                </ButtonRetro>
              )}
            </div>
            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[120px] resize-none"
                  placeholder="Add notes about this opportunity..."
                />
                <div className="flex gap-2">
                  <ButtonRetro size="sm" onClick={handleSaveNotes}>
                    <Check className="h-4 w-4" /> Save
                  </ButtonRetro>
                  <ButtonRetro size="sm" variant="outline" onClick={() => setIsEditingNotes(false)}>
                    <X className="h-4 w-4" /> Cancel
                  </ButtonRetro>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">{app.notes || 'No notes yet. Click Edit to add some!'}</p>
            )}
          </CardRetro>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <CardRetro className="p-6 text-center">
            <h3 className="font-bold mb-4">Dream Job Match</h3>
            <ProgressCircle value={app.dreamJobMatchScore || 0} size={140} variant="primary" />
            <p className="text-sm text-muted-foreground mt-4">
              {(app.dreamJobMatchScore || 0) >= 90
                ? "Excellent match! 🎯"
                : (app.dreamJobMatchScore || 0) >= 75
                ? "Strong match! 💪"
                : "Good potential 👍"}
            </p>
          </CardRetro>

          {app.atsScore !== undefined && (
            <CardRetro className="p-6 text-center">
              <h3 className="font-bold mb-4">ATS Score</h3>
              <ProgressCircle value={app.atsScore} size={140} variant="info" />
              <p className="text-sm text-muted-foreground mt-4">
                {app.atsScore >= 85
                  ? "Your resume is well-optimized!"
                  : app.atsScore >= 70
                  ? "Good, but could improve keywords"
                  : "Consider tailoring your resume"}
              </p>
            </CardRetro>
          )}

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
                    <p className="text-xs text-muted-foreground">{new Date(event.eventDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-bold text-sm">Applied</p>
                  <p className="text-xs text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</p>
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
