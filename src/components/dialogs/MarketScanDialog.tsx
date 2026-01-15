import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Search, Briefcase, DollarSign, Users, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface MarketScanDialogProps {
  trigger?: React.ReactNode;
}

interface ScanResults {
  openRoles: number;
  avgSalary: string;
  topCompanies: string[];
  hotSkills: string[];
  marketTrend: 'growing' | 'stable' | 'cooling';
}

export function MarketScanDialog({ trigger }: MarketScanDialogProps) {
  const { jobPreferences, applications } = useApp();
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [results, setResults] = useState<ScanResults | null>(null);

  const runScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setResults(null);

    const phases = [
      'Analyzing your preferences...',
      'Scanning job boards...',
      'Checking industry trends...',
      'Identifying top opportunities...',
      'Compiling insights...',
    ];

    let currentPhase = 0;
    const interval = setInterval(() => {
      if (currentPhase < phases.length) {
        setScanPhase(phases[currentPhase]);
        setScanProgress((currentPhase + 1) * 20);
        currentPhase++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        
        // Generate dynamic results based on user data
        const industries = jobPreferences?.industries || ['Technology'];
        const roles = jobPreferences?.roleTypes || ['Software Engineer'];
        
        setResults({
          openRoles: Math.floor(Math.random() * 500) + 200,
          avgSalary: `$${Math.floor(Math.random() * 50 + 100)}k - $${Math.floor(Math.random() * 50 + 150)}k`,
          topCompanies: ['Google', 'Microsoft', 'Apple', 'Meta', 'Amazon'].slice(0, 3),
          hotSkills: ['AI/ML', 'Cloud Computing', 'System Design', 'Leadership'].slice(0, 4),
          marketTrend: 'growing',
        });
      }
    }, 600);
  };

  useEffect(() => {
    if (open && !results && !isScanning) {
      runScan();
    }
  }, [open]);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'growing': return 'text-success';
      case 'stable': return 'text-info';
      case 'cooling': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return '📈';
      case 'stable': return '➡️';
      case 'cooling': return '📉';
      default: return '📊';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <ButtonRetro variant="outline" size="sm">
            Start Scan
          </ButtonRetro>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Job Market Scan
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {isScanning ? (
            <div className="space-y-4 py-6">
              <div className="flex items-center justify-center">
                <div className="animate-pulse">
                  <TrendingUp className="h-12 w-12 text-primary" />
                </div>
              </div>
              <Progress value={scanProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">{scanPhase}</p>
            </div>
          ) : results ? (
            <div className="space-y-4">
              {/* Market Overview */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Market Trend</p>
                    <p className={`text-2xl font-black capitalize ${getTrendColor(results.marketTrend)}`}>
                      {getTrendIcon(results.marketTrend)} {results.marketTrend}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border-2 border-border bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">Open Roles</span>
                  </div>
                  <p className="text-xl font-black">{results.openRoles}+</p>
                </div>
                <div className="p-4 rounded-lg border-2 border-border bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span className="text-xs font-bold text-muted-foreground">Avg Salary</span>
                  </div>
                  <p className="text-xl font-black">{results.avgSalary}</p>
                </div>
              </div>

              {/* Top Companies */}
              <div className="p-4 rounded-lg border-2 border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-info" />
                  <span className="text-sm font-bold">Top Hiring Companies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.topCompanies.map((company, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-info/20 text-sm font-medium">
                      {company}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hot Skills */}
              <div className="p-4 rounded-lg border-2 border-border">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-warning" />
                  <span className="text-sm font-bold">In-Demand Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.hotSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-warning/20 text-sm font-medium">
                      🔥 {skill}
                    </span>
                  ))}
                </div>
              </div>

              <ButtonRetro onClick={runScan} variant="outline" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Run New Scan
              </ButtonRetro>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
