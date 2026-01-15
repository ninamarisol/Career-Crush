import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { useApp } from '@/context/AppContext';
import { Plus, Building2, MapPin, DollarSign, Briefcase, Link as LinkIcon, FileText, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddApplicationDialogProps {
  trigger?: React.ReactNode;
}

type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';

export function AddApplicationDialog({ trigger }: AddApplicationDialogProps) {
  const { addApplication, uploadResume } = useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.position || !formData.company) return;

    setLoading(true);
    try {
      await addApplication({
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

      toast.success('Application added! 🎯');
      
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
      setOpen(false);
    } catch (error) {
      toast.error('Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];
  const workStyles = ['Remote', 'Hybrid', 'On-site'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <ButtonRetro>
            <Plus className="h-4 w-4" /> Add App
          </ButtonRetro>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-border shadow-retro-xl bg-card">
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
            <ButtonRetro type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={loading}>
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
