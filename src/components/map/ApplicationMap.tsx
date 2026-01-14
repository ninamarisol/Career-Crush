import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CardRetro } from '@/components/ui/card-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { Application } from '@/context/AppContext';
import { MapPin, Building2, ExternalLink } from 'lucide-react';

interface ApplicationMapProps {
  applications: Application[];
}

// US city coordinates for common locations
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'new york': { lat: 40.7128, lng: -74.0060 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'atlanta': { lat: 33.7490, lng: -84.3880 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'portland': { lat: 45.5152, lng: -122.6784 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'washington': { lat: 38.9072, lng: -77.0369 },
  'remote': { lat: 39.8283, lng: -98.5795 }, // Center of US
};

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

const getStatusDotColor = (status: string): string => {
  const colors: Record<string, string> = {
    Saved: 'bg-yellow-500',
    Applied: 'bg-blue-500',
    Interview: 'bg-purple-500',
    Offer: 'bg-green-500',
    Rejected: 'bg-red-500',
    Ghosted: 'bg-gray-400',
  };
  return colors[status] || 'bg-gray-400';
};

interface MapMarker {
  app: Application;
  coords: { lat: number; lng: number };
  x: number;
  y: number;
}

export function ApplicationMap({ applications }: ApplicationMapProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [hoveredApp, setHoveredApp] = useState<Application | null>(null);

  // Map dimensions (based on US map aspect ratio)
  const mapWidth = 800;
  const mapHeight = 500;

  // Mercator projection bounds for continental US
  const bounds = {
    north: 49.5,
    south: 24.5,
    west: -125,
    east: -66.5,
  };

  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * mapWidth;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * mapHeight;
    return { x, y };
  };

  const markers: MapMarker[] = useMemo(() => {
    return applications
      .map(app => {
        if (!app.location) return null;
        
        const locationLower = app.location.toLowerCase();
        
        // Check for exact city match
        for (const [city, coords] of Object.entries(cityCoordinates)) {
          if (locationLower.includes(city)) {
            const { x, y } = projectToMap(coords.lat, coords.lng);
            return { app, coords, x, y };
          }
        }

        // Check if it's marked as remote
        if (locationLower === 'remote') {
          const coords = cityCoordinates.remote;
          const { x, y } = projectToMap(coords.lat, coords.lng);
          return { app, coords, x, y };
        }

        // Use stored coordinates if available
        if (app.latitude && app.longitude) {
          const { x, y } = projectToMap(app.latitude, app.longitude);
          return { app, coords: { lat: app.latitude, lng: app.longitude }, x, y };
        }

        return null;
      })
      .filter((m): m is MapMarker => m !== null);
  }, [applications]);

  const remoteApps = applications.filter(app => 
    app.location?.toLowerCase() === 'remote'
  );

  const unmappedApps = applications.filter(app => {
    if (!app.location) return true;
    const locationLower = app.location.toLowerCase();
    return !Object.keys(cityCoordinates).some(city => locationLower.includes(city)) &&
           locationLower !== 'remote' &&
           !app.latitude;
  });

  return (
    <div className="space-y-4">
      <CardRetro className="p-6">
        <div className="relative w-full" style={{ aspectRatio: '800/500' }}>
          {/* Simple US outline SVG */}
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-full"
            style={{ background: 'hsl(var(--muted))' }}
          >
            {/* Simplified US outline */}
            <path
              d="M50,150 L80,120 L120,100 L180,90 L220,85 L280,80 L340,75 L400,70 L460,75 L520,80 L580,90 L620,100 L660,120 L700,150 L720,180 L730,220 L740,260 L750,300 L740,340 L720,380 L680,400 L620,420 L560,430 L500,435 L440,430 L380,420 L320,400 L260,380 L200,360 L140,330 L100,290 L70,240 L50,190 Z"
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            
            {/* Application markers */}
            {markers.map((marker, index) => (
              <g
                key={marker.app.id}
                transform={`translate(${marker.x}, ${marker.y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedApp(marker.app)}
                onMouseEnter={() => setHoveredApp(marker.app)}
                onMouseLeave={() => setHoveredApp(null)}
              >
                <circle
                  r="12"
                  className={`${getStatusDotColor(marker.app.status)} transition-all`}
                  opacity={selectedApp?.id === marker.app.id ? 1 : 0.8}
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                />
                <circle
                  r="6"
                  fill="white"
                  opacity="0.5"
                />
              </g>
            ))}
          </svg>

          {/* Hover tooltip */}
          {hoveredApp && (
            <div 
              className="absolute z-10 bg-card border-2 border-border rounded-lg p-3 shadow-retro-lg pointer-events-none"
              style={{
                left: '50%',
                top: '20px',
                transform: 'translateX(-50%)',
              }}
            >
              <p className="font-bold">{hoveredApp.position}</p>
              <p className="text-sm text-muted-foreground">{hoveredApp.company}</p>
              <p className="text-xs text-muted-foreground">{hoveredApp.location}</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t-2 border-border">
          <span className="text-sm font-bold text-muted-foreground">Status:</span>
          {['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'].map(status => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusDotColor(status)}`} />
              <span className="text-sm">{status}</span>
            </div>
          ))}
        </div>
      </CardRetro>

      {/* Selected application details */}
      {selectedApp && (
        <CardRetro className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center text-xl font-black">
                {selectedApp.company.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedApp.position}</h3>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {selectedApp.company}
                </p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {selectedApp.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={getStatusColor(selectedApp.status) as any}>
                {selectedApp.status}
              </StatusBadge>
              <Link to={`/applications/${selectedApp.id}`}>
                <button className="p-2 rounded-lg border-2 border-border hover:bg-muted transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </CardRetro>
      )}

      {/* Remote positions */}
      {remoteApps.length > 0 && (
        <CardRetro className="p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Remote Positions ({remoteApps.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {remoteApps.map(app => (
              <Link key={app.id} to={`/applications/${app.id}`}>
                <div className="px-3 py-2 rounded-lg border-2 border-border hover:bg-muted transition-colors">
                  <span className="font-bold">{app.position}</span>
                  <span className="text-muted-foreground"> @ {app.company}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardRetro>
      )}

      {/* Unmapped positions */}
      {unmappedApps.length > 0 && (
        <CardRetro className="p-4">
          <h3 className="font-bold mb-3 text-muted-foreground">
            Other Locations ({unmappedApps.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {unmappedApps.map(app => (
              <Link key={app.id} to={`/applications/${app.id}`}>
                <div className="px-3 py-2 rounded-lg border-2 border-border hover:bg-muted transition-colors text-sm">
                  <span className="font-bold">{app.company}</span>
                  {app.location && <span className="text-muted-foreground"> • {app.location}</span>}
                </div>
              </Link>
            ))}
          </div>
        </CardRetro>
      )}
    </div>
  );
}
