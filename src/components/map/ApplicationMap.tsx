import { useState, useMemo, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CardRetro } from "@/components/ui/card-retro";
import { StatusBadge } from "@/components/ui/status-badge";
import { Application } from "@/context/AppContext";
import { MapPin, Building2, ExternalLink, Globe, Loader2 } from "lucide-react";

// Fix Leaflet default icon issue in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ApplicationMapProps {
  applications: Application[];
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Saved: "saved",
    Applied: "applied",
    Interview: "interview",
    Offer: "offer",
    Rejected: "rejected",
    Ghosted: "ghosted",
  };
  return colors[status] || "saved";
};

const getStatusHexColor = (status: string): string => {
  const colors: Record<string, string> = {
    Saved: "#9ca3af",
    Applied: "#3b82f6",
    Interview: "#f59e0b",
    Offer: "#22c55e",
    Rejected: "#ef4444",
    Ghosted: "#6b7280",
  };
  return colors[status] || "#9ca3af";
};

interface MapMarker {
  app: Application;
  lat: number;
  lng: number;
}

interface GeocodedLocation {
  lat: number;
  lng: number;
}

// Cache for geocoded locations (persisted in localStorage)
const GEOCODE_CACHE_KEY = "geocode_cache";

function getGeocodeCache(): Record<string, GeocodedLocation> {
  try {
    const cached = localStorage.getItem(GEOCODE_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

function setGeocodeCache(cache: Record<string, GeocodedLocation>) {
  try {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage might be full or unavailable
  }
}

// Geocode a location string using OpenStreetMap Nominatim API
async function geocodeLocation(location: string): Promise<GeocodedLocation | null> {
  const cache = getGeocodeCache();
  const cacheKey = location.toLowerCase().trim();
  
  // Check cache first
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    // Use Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      {
        headers: {
          'User-Agent': 'CareerCrushApp/1.0'
        }
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      
      // Cache the result
      cache[cacheKey] = result;
      setGeocodeCache(cache);
      
      return result;
    }
    
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Custom colored marker
function createColoredIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

// Auto-fit bounds component
function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [markers, map]);

  return null;
}

export const ApplicationMap = forwardRef<HTMLDivElement, ApplicationMapProps>(
  function ApplicationMap({ applications }, ref) {
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [geocodedCount, setGeocodedCount] = useState(0);

    // Applications that need geocoding
    const appsToGeocode = useMemo(() => {
      return applications.filter((app) => {
        if (!app.location) return false;
        if (app.latitude && app.longitude) return false;
        if (app.location.toLowerCase() === "remote") return false;
        return true;
      });
    }, [applications]);

    // Geocode all locations
    useEffect(() => {
      let cancelled = false;

      async function geocodeAll() {
        setIsLoading(true);
        setGeocodedCount(0);

        const newMarkers: MapMarker[] = [];

        // First, add apps with existing coordinates
        for (const app of applications) {
          if (app.latitude && app.longitude) {
            newMarkers.push({ app, lat: app.latitude, lng: app.longitude });
          }
        }

        // Then geocode the rest (with rate limiting for Nominatim - 1 req/sec)
        for (let i = 0; i < appsToGeocode.length; i++) {
          if (cancelled) return;

          const app = appsToGeocode[i];
          
          // Check cache first (no delay needed)
          const cache = getGeocodeCache();
          const cacheKey = app.location!.toLowerCase().trim();
          
          if (cache[cacheKey]) {
            const offset = () => (Math.random() - 0.5) * 0.02;
            newMarkers.push({
              app,
              lat: cache[cacheKey].lat + offset(),
              lng: cache[cacheKey].lng + offset(),
            });
            setGeocodedCount(i + 1);
            continue;
          }

          // Rate limit: wait 1 second between uncached API calls
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1100));
          }

          const result = await geocodeLocation(app.location!);
          
          if (result && !cancelled) {
            const offset = () => (Math.random() - 0.5) * 0.02;
            newMarkers.push({
              app,
              lat: result.lat + offset(),
              lng: result.lng + offset(),
            });
          }
          
          setGeocodedCount(i + 1);
        }

        if (!cancelled) {
          setMarkers(newMarkers);
          setIsLoading(false);
        }
      }

      geocodeAll();

      return () => {
        cancelled = true;
      };
    }, [applications, appsToGeocode]);

    const remoteApps = useMemo(() => 
      applications.filter((app) => app.location?.toLowerCase() === "remote"),
      [applications]
    );

    const unmappedApps = useMemo(() => {
      const markerAppIds = new Set(markers.map((m) => m.app.id));
      return applications.filter((app) => {
        if (!app.location) return true;
        if (app.location.toLowerCase() === "remote") return false;
        return !markerAppIds.has(app.id);
      });
    }, [applications, markers]);

    // Default center (US if no markers)
    const defaultCenter: [number, number] =
      markers.length > 0 ? [markers[0].lat, markers[0].lng] : [39.8283, -98.5795];

    const totalToGeocode = appsToGeocode.length;

    return (
      <div className="space-y-4" ref={ref}>
        <CardRetro className="p-0 overflow-hidden">
          <div className="h-[500px] relative">
            {isLoading && totalToGeocode > 0 && (
              <div className="absolute top-4 left-4 z-[1000] bg-card border-2 border-border rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">
                  Mapping locations... {geocodedCount}/{totalToGeocode}
                </span>
              </div>
            )}

            {(markers.length > 0 || isLoading) ? (
              <MapContainer
                center={defaultCenter}
                zoom={4}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.length > 0 && <FitBounds markers={markers} />}
                {markers.map((marker) => (
                  <Marker
                    key={marker.app.id}
                    position={[marker.lat, marker.lng]}
                    icon={createColoredIcon(getStatusHexColor(marker.app.status))}
                    eventHandlers={{
                      click: () => setSelectedApp(marker.app),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <p className="font-bold text-base">{marker.app.position}</p>
                        <p className="text-sm text-gray-600">{marker.app.company}</p>
                        <p className="text-xs text-gray-500">{marker.app.location}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{
                              backgroundColor: getStatusHexColor(marker.app.status),
                            }}
                          >
                            {marker.app.status}
                          </span>
                          <Link
                            to={`/applications/${marker.app.id}`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-muted">
                <Globe className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold">No mappable locations</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  Add location information to your applications to see them on the
                  map. Any city, state, or address will be automatically geocoded.
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 p-4 border-t-2 border-border bg-card">
            <span className="text-sm font-bold text-muted-foreground">Status:</span>
            {["Saved", "Applied", "Interview", "Offer", "Rejected", "Ghosted"].map(
              (status) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getStatusHexColor(status) }}
                  />
                  <span className="text-sm">{status}</span>
                </div>
              )
            )}
          </div>
        </CardRetro>

        {/* Selected application details */}
        {selectedApp && (
          <CardRetro className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
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
              <Globe className="h-4 w-4" /> Remote Positions ({remoteApps.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {remoteApps.map((app) => (
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
        {!isLoading && unmappedApps.length > 0 && (
          <CardRetro className="p-4">
            <h3 className="font-bold mb-3 text-muted-foreground">
              Could Not Map ({unmappedApps.length})
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              These locations couldn't be found. Try adding more specific addresses or city names.
            </p>
            <div className="flex flex-wrap gap-2">
              {unmappedApps.map((app) => (
                <Link key={app.id} to={`/applications/${app.id}`}>
                  <div className="px-3 py-2 rounded-lg border-2 border-border hover:bg-muted transition-colors text-sm">
                    <span className="font-bold">{app.company}</span>
                    {app.location && (
                      <span className="text-muted-foreground"> • {app.location}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardRetro>
        )}
      </div>
    );
  }
);
