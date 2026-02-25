import { useWeeklyBrief } from '@/hooks/useWeeklyBrief';
import { useCareerData } from '@/hooks/useCareerData';
import { useContacts } from '@/hooks/useContacts';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CardRetro } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, ArrowRight, Thermometer, 
  TrendingUp, TrendingDown, Minus,
  Users, RefreshCw, Send, Loader2, Zap
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export function ClimbWidgets() {
  const { brief, loading, generateBrief, swapMove, showAlternate, currentMove } = useWeeklyBrief();
  const { wins, addWin } = useCareerData();
  const { contacts } = useContacts();
  const navigate = useNavigate();
  const [quickWin, setQuickWin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleQuickWin = async () => {
    if (!quickWin.trim()) return;
    setSubmitting(true);
    try {
      await addWin.mutateAsync({ description: quickWin });
      setQuickWin('');
    } finally {
      setSubmitting(false);
    }
  };

  // Fallback promotion pulse from local data when no brief yet
  const localPulse = (() => {
    if (wins.length === 0) return 'cooling';
    const daysSince = differenceInDays(new Date(), new Date(wins[0].win_date));
    if (daysSince <= 7) return 'heating';
    if (daysSince <= 14) return 'steady';
    return 'cooling';
  })();

  const localPulseInsight = (() => {
    if (wins.length === 0) return "No wins logged yet. Your promotion case hasn't started building.";
    const daysSince = differenceInDays(new Date(), new Date(wins[0].win_date));
    const thisMonth = wins.filter(w => {
      const d = new Date(w.win_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return `${thisMonth} win${thisMonth !== 1 ? 's' : ''} this month. Last entry was ${daysSince} day${daysSince !== 1 ? 's' : ''} ago.`;
  })();

  const overdueContacts = contacts
    .filter(c => {
      if (!c.last_contacted) return true;
      return differenceInDays(new Date(), new Date(c.last_contacted)) >= 30;
    })
    .slice(0, 3);

  const pulse = brief?.promotionPulse || localPulse;
  const pulseInsight = brief?.pulseInsight || localPulseInsight;
  const networkList = brief?.networkPriority?.length
    ? brief.networkPriority
    : overdueContacts.map(c => ({
        name: c.name,
        reason: c.last_contacted
          ? `${differenceInDays(new Date(), new Date(c.last_contacted))} days since last contact`
          : 'Never contacted',
        contactId: c.id,
      }));

  const PulseIcon = pulse === 'heating' ? TrendingUp : pulse === 'cooling' ? TrendingDown : Minus;
  const pulseColor = pulse === 'heating' 
    ? 'text-success' 
    : pulse === 'cooling' 
      ? 'text-destructive' 
      : 'text-secondary';
  const pulseBg = pulse === 'heating'
    ? 'bg-success/10 border-success/30'
    : pulse === 'cooling'
      ? 'bg-destructive/10 border-destructive/30'
      : 'bg-secondary/10 border-secondary/30';

  return (
    <div className="space-y-6">
      {/* Widget 1 — The Weekly Brief */}
      <CardRetro className="overflow-hidden">
        <div className="p-5 sm:p-6">
          {brief ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">This Week</span>
              </div>
              <p className="text-base sm:text-lg font-medium leading-relaxed text-foreground">
                {brief.weeklyBrief}
              </p>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-primary opacity-60" />
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Get your AI-powered weekly situational brief — what's happening in your career and what to do about it.
              </p>
              <ButtonRetro onClick={generateBrief} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Generating...' : 'Generate Weekly Brief'}
              </ButtonRetro>
            </div>
          )}
        </div>
        {brief && (
          <div className="px-5 pb-4 sm:px-6 sm:pb-5 flex justify-end">
            <button
              onClick={generateBrief}
              disabled={loading}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        )}
      </CardRetro>

      {/* Widget 2 — Your One Move */}
      {(brief || !brief) && currentMove && (
        <CardRetro className="overflow-hidden border-primary/30">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Your One Move</span>
              </div>
              <button
                onClick={swapMove}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {showAlternate ? 'Show original' : 'Not this one?'}
              </button>
            </div>
            <p className="text-base sm:text-lg font-bold leading-relaxed">
              {currentMove.text}
            </p>
            <div className="mt-4 flex gap-2">
              <ButtonRetro
                size="sm"
                onClick={() => {
                  if (currentMove.category === 'win_logging') {
                    // Scroll to quick capture
                    document.getElementById('quick-capture')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (currentMove.category === 'network') {
                    navigate('/contacts');
                  } else if (currentMove.category === 'track_record') {
                    navigate('/track-record');
                  } else {
                    navigate('/goals');
                  }
                }}
              >
                Do it now <ArrowRight className="w-3 h-3" />
              </ButtonRetro>
            </div>
          </div>
        </CardRetro>
      )}

      {/* Mid section: Pulse + Network side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Widget 3 — Promotion Case Pulse */}
        <CardRetro 
          className="overflow-hidden cursor-pointer hover-lift"
          onClick={() => navigate('/track-record')}
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Promotion Pulse</span>
            </div>
            <div className="flex items-center justify-center py-4">
              <div className={`p-5 rounded-2xl border-2 ${pulseBg}`}>
                <PulseIcon className={`w-10 h-10 ${pulseColor}`} />
              </div>
            </div>
            <p className="text-center font-black text-lg capitalize mb-2">{pulse}</p>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              {pulseInsight}
            </p>
          </div>
        </CardRetro>

        {/* Widget 4 — Network Radar */}
        <CardRetro className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Network Radar</span>
            </div>
            {networkList.length > 0 ? (
              <div className="space-y-3">
                {networkList.map((contact, i) => (
                  <div key={contact.contactId || i} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{contact.reason}</p>
                    </div>
                    <ButtonRetro 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/contacts')}
                    >
                      Reach out
                    </ButtonRetro>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Your network is healthy — no urgent outreach needed.</p>
              </div>
            )}
          </div>
        </CardRetro>
      </div>

      {/* Widget 5 — Quick Capture */}
      <div id="quick-capture">
        <CardRetro className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
              Something happened this week —
            </p>
            <div className="flex gap-2">
              <Textarea
                value={quickWin}
                onChange={(e) => setQuickWin(e.target.value)}
                placeholder="Led the sprint retro and got positive feedback from VP..."
                className="min-h-[48px] max-h-[120px] resize-none flex-1"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuickWin();
                  }
                }}
              />
              <ButtonRetro
                size="icon"
                onClick={handleQuickWin}
                disabled={!quickWin.trim() || submitting}
                className="shrink-0 self-end"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </ButtonRetro>
            </div>
            {wins.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {wins.length} win{wins.length !== 1 ? 's' : ''} captured · feeds your Track Record
              </p>
            )}
          </div>
        </CardRetro>
      </div>
    </div>
  );
}
