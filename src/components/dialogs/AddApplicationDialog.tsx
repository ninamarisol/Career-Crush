import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { useApp } from '@/context/AppContext';
import { ApplicationStatus } from '@/lib/data';
import { Plus, Building2, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddApplicationDialogProps {
  trigger?: React.ReactNode;
}

export function AddApplicationDialog({ trigger }: AddApplicationDialogProps) {
  const { addApplication } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    roleTitle: '',
    companyName: '',
    location: '',
    salaryRange: '',
    status: 'Saved' as ApplicationStatus,
    applicationUrl: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleTitle || !formData.companyName) return;

    addApplication({
      ...formData,
      companyInitial: formData.companyName.charAt(0).toUpperCase(),
      appliedDate: new Date().toISOString().split('T')[0],
      dreamJobMatchScore: Math.floor(Math.random() * 30) + 70,
      atsScore: Math.floor(Math.random() * 30) + 60,
      roleType: 'Full-time',
      industryTags: ['Tech'],
    });

    setFormData({
      roleTitle: '',
      companyName: '',
      location: '',
      salaryRange: '',
      status: 'Saved',
      applicationUrl: '',
      notes: '',
    });
    setOpen(false);
  };

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <ButtonRetro>
            <Plus className="h-4 w-4" /> Add App
          </ButtonRetro>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg border-2 border-border shadow-retro-xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Add New Application 🎯</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Role Title *
            </label>
            <InputRetro
              placeholder="e.g., Product Designer"
              value={formData.roleTitle}
              onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Company Name *
            </label>
            <InputRetro
              placeholder="e.g., Linear"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </label>
              <InputRetro
                placeholder="e.g., Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Salary Range
              </label>
              <InputRetro
                placeholder="e.g., $120k-$150k"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
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
            <label className="text-sm font-bold">Job Posting URL</label>
            <InputRetro
              placeholder="https://..."
              value={formData.applicationUrl}
              onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
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
            <ButtonRetro type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit" className="flex-1">
              <Plus className="h-4 w-4" /> Add Application
            </ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
