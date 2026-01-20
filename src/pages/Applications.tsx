import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, Application } from '@/context/AppContext';
import { CardRetro } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { InputRetro } from '@/components/ui/input-retro';
import { LayoutGrid, List, Map, Search, Plus, MapPin, Building2, DollarSign, Target, FileCheck, Tag, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddApplicationDialog } from '@/components/dialogs/AddApplicationDialog';
import { ApplicationMap } from '@/components/map/ApplicationMap';
import { calculateMatchScore, getScoreColor, getScoreBgColor } from '@/lib/matchScore';

type ViewMode = 'card' | 'list' | 'map';
type StatusFilter = 'all' | 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';

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
  if (!min && !max) return '';
  if (min && max) return `$${Math.round(min / 1000)}k - $${Math.round(max / 1000)}k`;
  if (min) return `$${Math.round(min / 1000)}k+`;
  if (max) return `Up to $${Math.round(max / 1000)}k`;
  return '';
};

export default function Applications() {
  const { applications, jobPreferences } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.position.toLowerCase().includes(search.toLowerCase()) || 
                            app.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return applications.length;
    return applications.filter(a => a.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black">Applications Pipeline 💼</h1>
          <p className="text-muted-foreground">Keep track of every opportunity.</p>
        </div>
        <AddApplicationDialog trigger={
          <ButtonRetro><Plus className="h-4 w-4" /> Add Application</ButtonRetro>
        } />
      </div>

      {/* View Toggle & Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'card' as ViewMode, icon: LayoutGrid, label: 'Card' },
            { id: 'list' as ViewMode, icon: List, label: 'List' },
            { id: 'map' as ViewMode, icon: Map, label: 'Map' },
          ].map(v => (
            <ButtonRetro key={v.id} variant={viewMode === v.id ? 'default' : 'outline'} size="sm" onClick={() => setViewMode(v.id)}>
              <v.icon className="h-4 w-4" /> {v.label}
            </ButtonRetro>
          ))}
        </div>
        <div className="flex gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <InputRetro placeholder="Search roles or companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn(
            "px-3 py-1 rounded-full border-2 border-border text-sm font-bold transition-all",
            statusFilter === s ? "bg-primary text-primary-foreground shadow-retro-sm" : "bg-card hover:bg-muted"
          )}>
            {s === 'all' ? 'All' : s} ({getStatusCount(s)})
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && (
        <CardRetro className="p-12 text-center">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-bold">No applications found</h3>
          <p className="text-muted-foreground mt-2">
            {applications.length === 0 
              ? "Start tracking your job search by adding your first application!"
              : "No applications match your current filters."}
          </p>
          {applications.length === 0 && (
            <AddApplicationDialog trigger={
              <ButtonRetro className="mt-4"><Plus className="h-4 w-4" /> Add Your First Application</ButtonRetro>
            } />
          )}
        </CardRetro>
      )}

      {/* Card View */}
      {viewMode === 'card' && filteredApps.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map(app => {
            const matchBreakdown = calculateMatchScore(app, jobPreferences);
            const matchScore = matchBreakdown.totalScore;
            
            return (
              <Link key={app.id} to={`/applications/${app.id}`}>
                <CardRetro hoverable className="p-5 h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center text-xl font-black">
                      {app.company.charAt(0).toUpperCase()}
                    </div>
                    <StatusBadge status={getStatusColor(app.status) as any}>{app.status}</StatusBadge>
                  </div>
                  <h3 className="font-bold text-lg">{app.position}</h3>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1"><Building2 className="h-3 w-3" /> {app.company}</p>
                  {app.location && <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.location}</p>}
                  {(app.salary_min || app.salary_max) && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> {formatSalary(app.salary_min, app.salary_max)}
                    </p>
                  )}
                  
                  {/* Tags */}
                  {(app.industry || app.role_type) && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {app.industry && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          <Tag className="h-2.5 w-2.5" /> {app.industry}
                        </span>
                      )}
                      {app.role_type && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                          {app.role_type}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Scores */}
                  <div className="flex gap-4 mt-4 pt-3 border-t-2 border-border">
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" /> Match
                      </span>
                      <p className={cn("font-bold text-sm", getScoreColor(matchScore))}>{matchScore}%</p>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Resume
                      </span>
                      <p className={cn("font-bold text-sm", app.resume_score ? getScoreColor(app.resume_score) : 'text-muted-foreground')}>
                        {app.resume_score ? `${app.resume_score}%` : '—'}
                      </p>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground">Applied</span>
                      <p className="font-bold text-sm">{new Date(app.date_applied).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardRetro>
              </Link>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredApps.length > 0 && (
        <CardRetro className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr className="text-left text-xs font-bold uppercase tracking-wide">
                <th className="p-4">Company</th>
                <th className="p-4">Role</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Match</th>
                <th className="p-4">Resume</th>
                <th className="p-4">Salary</th>
                <th className="p-4">Applied</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => {
                const matchBreakdown = calculateMatchScore(app, jobPreferences);
                const matchScore = matchBreakdown.totalScore;
                
                return (
                  <tr key={app.id} className="border-t-2 border-border hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/applications/${app.id}`)}>
                    <td className="p-4 font-bold">{app.company}</td>
                    <td className="p-4">{app.position}</td>
                    <td className="p-4 text-muted-foreground">{app.location || '-'}</td>
                    <td className="p-4"><StatusBadge status={getStatusColor(app.status) as any}>{app.status}</StatusBadge></td>
                    <td className={cn("p-4 font-bold", getScoreColor(matchScore))}>{matchScore}%</td>
                    <td className={cn("p-4 font-bold", app.resume_score ? getScoreColor(app.resume_score) : 'text-muted-foreground')}>
                      {app.resume_score ? `${app.resume_score}%` : '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">{formatSalary(app.salary_min, app.salary_max) || '-'}</td>
                    <td className="p-4 text-muted-foreground">{new Date(app.date_applied).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardRetro>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <ApplicationMap applications={filteredApps} />
      )}
    </div>
  );
}

function Briefcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
