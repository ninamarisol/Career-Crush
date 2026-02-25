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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">Applications Pipeline 💼</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Keep track of every opportunity.</p>
        </div>
        <AddApplicationDialog trigger={
          <ButtonRetro className="w-full sm:w-auto"><Plus className="h-4 w-4" /> Add Application</ButtonRetro>
        } />
      </div>

      {/* View Toggle & Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {[
            { id: 'card' as ViewMode, icon: LayoutGrid, label: 'Card' },
            { id: 'list' as ViewMode, icon: List, label: 'List' },
            { id: 'map' as ViewMode, icon: Map, label: 'Map' },
          ].map(v => (
            <ButtonRetro key={v.id} variant={viewMode === v.id ? 'default' : 'outline'} size="sm" onClick={() => setViewMode(v.id)}>
              <v.icon className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">{v.label}</span>
            </ButtonRetro>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <InputRetro placeholder="Search roles or companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Status Filter Pills - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
        {(['all', 'Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn(
            "px-3 py-1 rounded-full border-2 border-border text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0",
            statusFilter === s ? "bg-primary text-primary-foreground shadow-retro-sm" : "bg-card hover:bg-muted"
          )}>
            {s === 'all' ? 'All' : s} ({getStatusCount(s)})
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && (
        <CardRetro className="p-8 sm:p-12 text-center">
          <BriefcaseIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold">No applications found</h3>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredApps.map(app => {
            const matchBreakdown = calculateMatchScore(app, jobPreferences);
            const matchScore = matchBreakdown.totalScore;
            
            return (
              <Link key={app.id} to={`/applications/${app.id}`}>
                <CardRetro hoverable className="p-4 sm:p-5 h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center text-lg sm:text-xl font-black shrink-0">
                      {app.company.charAt(0).toUpperCase()}
                    </div>
                    <StatusBadge status={getStatusColor(app.status) as any}>{app.status}</StatusBadge>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight">{app.position}</h3>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm"><Building2 className="h-3 w-3 shrink-0" /> <span className="truncate">{app.company}</span></p>
                  {app.location && <p className="text-muted-foreground flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{app.location}</span></p>}
                  {(app.salary_min || app.salary_max) && (
                    <p className="text-muted-foreground flex items-center gap-1 text-sm">
                      <DollarSign className="h-3 w-3 shrink-0" /> {formatSalary(app.salary_min, app.salary_max)}
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
                  <div className="flex gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 border-t-2 border-border">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" /> Match
                      </span>
                      <p className={cn("font-bold text-sm", getScoreColor(matchScore))}>{matchScore}%</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Resume
                      </span>
                      <p className={cn("font-bold text-sm", app.resume_score ? getScoreColor(app.resume_score) : 'text-muted-foreground')}>
                        {app.resume_score ? `${app.resume_score}%` : '—'}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
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

      {/* List View - scrollable table on mobile */}
      {viewMode === 'list' && filteredApps.length > 0 && (
        <CardRetro className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-muted">
                <tr className="text-left text-xs font-bold uppercase tracking-wide">
                  <th className="p-3 sm:p-4">Company</th>
                  <th className="p-3 sm:p-4">Role</th>
                  <th className="p-3 sm:p-4 hidden sm:table-cell">Location</th>
                  <th className="p-3 sm:p-4">Status</th>
                  <th className="p-3 sm:p-4">Match</th>
                  <th className="p-3 sm:p-4 hidden md:table-cell">Resume</th>
                  <th className="p-3 sm:p-4 hidden lg:table-cell">Salary</th>
                  <th className="p-3 sm:p-4 hidden sm:table-cell">Applied</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => {
                  const matchBreakdown = calculateMatchScore(app, jobPreferences);
                  const matchScore = matchBreakdown.totalScore;
                  
                  return (
                    <tr key={app.id} className="border-t-2 border-border hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/applications/${app.id}`)}>
                      <td className="p-3 sm:p-4 font-bold">{app.company}</td>
                      <td className="p-3 sm:p-4 max-w-[150px] truncate">{app.position}</td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden sm:table-cell">{app.location || '-'}</td>
                      <td className="p-3 sm:p-4"><StatusBadge status={getStatusColor(app.status) as any}>{app.status}</StatusBadge></td>
                      <td className={cn("p-3 sm:p-4 font-bold", getScoreColor(matchScore))}>{matchScore}%</td>
                      <td className={cn("p-3 sm:p-4 font-bold hidden md:table-cell", app.resume_score ? getScoreColor(app.resume_score) : 'text-muted-foreground')}>
                        {app.resume_score ? `${app.resume_score}%` : '-'}
                      </td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden lg:table-cell">{formatSalary(app.salary_min, app.salary_max) || '-'}</td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden sm:table-cell">{new Date(app.date_applied).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardRetro>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <ApplicationMap applications={filteredApps} />
      )}
    </div>
  );
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
