import { useMemo } from 'react';
import { differenceInDays, parseISO, isAfter } from 'date-fns';
import { Application, Event } from '@/context/AppContext';

interface SmartStep {
  title: string;
  description: string;
  type: 'optimize' | 'followup' | 'network' | 'prepare' | 'apply';
  buttonLabel: string;
  buttonVariant: 'default' | 'outline';
  priority: number;
  applicationId?: string;
  eventId?: string;
}

export function useSmartSteps(applications: Application[], events: Event[]): SmartStep[] {
  return useMemo(() => {
    const steps: SmartStep[] = [];
    const now = new Date();

    // 1. Check for applications needing follow-up (3-7 days since applied)
    applications
      .filter(app => app.status === 'Applied' && app.date_applied)
      .forEach(app => {
        const daysSinceApplied = differenceInDays(now, parseISO(app.date_applied));
        if (daysSinceApplied >= 3 && daysSinceApplied <= 14) {
          steps.push({
            title: `Follow up with ${app.company}`,
            description: `It's been ${daysSinceApplied} days since you applied. A quick follow-up shows initiative!`,
            type: 'followup',
            buttonLabel: 'Draft Email',
            buttonVariant: 'outline',
            priority: daysSinceApplied >= 7 ? 2 : 3,
            applicationId: app.id,
          });
        }
      });

    // 2. Check for upcoming interviews needing preparation
    events
      .filter(e => e.type.toLowerCase().includes('interview'))
      .forEach(event => {
        const eventDate = parseISO(event.date);
        const daysUntil = differenceInDays(eventDate, now);
        if (daysUntil >= 0 && daysUntil <= 3) {
          const relatedApp = applications.find(a => a.id === event.application_id);
          steps.push({
            title: `Prepare for ${relatedApp?.company || 'interview'}`,
            description: daysUntil === 0 
              ? `Your interview is today! Review your notes and practice.`
              : `Interview in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}. Time to prepare!`,
            type: 'prepare',
            buttonLabel: 'Prep Guide',
            buttonVariant: 'default',
            priority: 1,
            eventId: event.id,
            applicationId: event.application_id || undefined,
          });
        }
      });

    // 3. Check for stale "Saved" applications (saved but not applied for 3+ days)
    applications
      .filter(app => app.status === 'Saved')
      .forEach(app => {
        const daysSinceSaved = differenceInDays(now, parseISO(app.created_at));
        if (daysSinceSaved >= 3) {
          steps.push({
            title: `Apply to ${app.company}`,
            description: `You saved this ${daysSinceSaved} days ago. Ready to apply?`,
            type: 'apply',
            buttonLabel: 'Start Application',
            buttonVariant: 'outline',
            priority: 4,
            applicationId: app.id,
          });
        }
      });

    // 4. Check for interviews with no recent activity
    applications
      .filter(app => app.status === 'Interview')
      .forEach(app => {
        const daysSinceUpdate = differenceInDays(now, parseISO(app.updated_at));
        const hasUpcomingEvent = events.some(e => 
          e.application_id === app.id && isAfter(parseISO(e.date), now)
        );
        
        if (daysSinceUpdate >= 5 && !hasUpcomingEvent) {
          steps.push({
            title: `Check in with ${app.company}`,
            description: `No updates in ${daysSinceUpdate} days. Consider reaching out for a status update.`,
            type: 'followup',
            buttonLabel: 'Send Update',
            buttonVariant: 'outline',
            priority: 3,
            applicationId: app.id,
          });
        }
      });

    // 5. Resume optimization suggestions based on active applications
    const activeApps = applications.filter(a => !['Rejected', 'Ghosted', 'Offer'].includes(a.status));
    if (activeApps.length > 0 && activeApps.length <= 3) {
      const topApp = activeApps[0];
      steps.push({
        title: `Optimize resume for ${topApp.company}`,
        description: `Tailoring your resume to ${topApp.position} can boost your chances!`,
        type: 'optimize',
        buttonLabel: 'Optimize',
        buttonVariant: 'default',
        priority: 5,
        applicationId: topApp.id,
      });
    }

    // 6. Networking suggestion when no recent applications
    const recentApps = applications.filter(a => 
      differenceInDays(now, parseISO(a.created_at)) <= 7
    );
    if (recentApps.length === 0 && applications.length > 0) {
      steps.push({
        title: 'Expand your network',
        description: 'No new applications this week. Consider reaching out to connections in your target companies.',
        type: 'network',
        buttonLabel: 'View Tips',
        buttonVariant: 'outline',
        priority: 6,
      });
    }

    // 7. Default step if no applications yet
    if (applications.length === 0) {
      steps.push({
        title: 'Start your job search',
        description: 'Add your first application to track your progress and get personalized tips!',
        type: 'apply',
        buttonLabel: 'Add Application',
        buttonVariant: 'default',
        priority: 1,
      });
    }

    // Sort by priority and return top 3
    return steps
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3);
  }, [applications, events]);
}
