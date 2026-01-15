import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Building2, ExternalLink, Globe, MapPin } from "lucide-react";

import { CardRetro } from "@/components/ui/card-retro";
import { StatusBadge } from "@/components/ui/status-badge";
import { Application } from "@/context/AppContext";

// Fix Leaflet default icon issue in bundlers
// (Leaflet expects these images to exist on disk, which isn't true in Vite)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ApplicationMapProps {
  applications: Application[];
}

// Common city coordinates (extend as needed)
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // US
  "new york": { lat: 40.7128, lng: -74.006 },
  nyc: { lat: 40.7128, lng: -74.006 },
  manhattan: { lat: 40.7831, lng: -73.9712 },
  brooklyn: { lat: 40.6782, lng: -73.9442 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  sf: { lat: 37.7749, lng: -122.4194 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  la: { lat: 34.0522, lng: -118.2437 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  austin: { lat: 30.2672, lng: -97.7431 },
  boston: { lat: 42.3601, lng: -71.0589 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  denver: { lat: 39.7392, lng: -104.9903 },
  miami: { lat: 25.7617, lng: -80.1918 },
  atlanta: { lat: 33.749, lng: -84.388 },
  dallas: { lat: 32.7767, lng: -96.797 },
  houston: { lat: 29.7604, lng: -95.3698 },
  portland: { lat: 45.5152, lng: -122.6784 },
  phoenix: { lat: 33.4484, lng: -112.074 },
  "san diego": { lat: 32.7157, lng: -117.1611 },
  washington: { lat: 38.9072, lng: -77.0369 },
  dc: { lat: 38.9072, lng: -77.0369 },
  "washington dc": { lat: 38.9072, lng: -77.0369 },
  "palo alto": { lat: 37.4419, lng: -122.143 },
  "mountain view": { lat: 37.3861, lng: -122.0839 },
  cupertino: { lat: 37.323, lng: -122.0322 },
  menlo: { lat: 37.4529, lng: -122.1817 },
  redwood: { lat: 37.4852, lng: -122.2364 },
  sunnyvale: { lat: 37.3688, lng: -122.0363 },
  "san jose": { lat: 37.3382, lng: -121.8863 },
  oakland: { lat: 37.8044, lng: -122.2712 },
  raleigh: { lat: 35.7796, lng: -78.6382 },
  charlotte: { lat: 35.2271, lng: -80.8431 },
  nashville: { lat: 36.1627, lng: -86.7816 },
  "salt lake": { lat: 40.7608, lng: -111.891 },
  minneapolis: { lat: 44.9778, lng: -93.265 },
  detroit: { lat: 42.3314, lng: -83.0458 },
  philadelphia: { lat: 39.9526, lng: -75.1652 },

  // Added: Memphis
  memphis: { lat: 35.1495, lng: -90.049 },
  "memphis, tn": { lat: 35.1495, lng: -90.049 },
  "memphis tn": { lat: 35.1495, lng: -90.049 },

  // International
  london: { lat: 51.5074, lng: -0.1278 },
  berlin: { lat: 52.52, lng: 13.405 },
  paris: { lat: 48.8566, lng: 2.3522 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  dublin: { lat: 53.3498, lng: -6.2603 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  vancouver: { lat: 49.2827, lng: -123.1207 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  "tel aviv": { lat: 32.0853, lng: 34.7818 },
};

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

function normalizeLocation(location: string) {
  const raw = location.trim().toLowerCase();
  // Normalize commas and multiple spaces
  const cleaned = raw.replace(/\s+/g, " ");
  // If "City, ST" or "City, State", keep a city-only variant too
  const cityOnly = cleaned.split(",")[0]?.trim() || cleaned;
  return { cleaned, cityOnly };
}

function getCoordsForLocation(location: string): { lat: number; lng: number } | null {
  const { cleaned, cityOnly } = normalizeLocation(location);
  return cityCoordinates[cleaned] || cityCoordinates[cityOnly] || null;
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

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [markers, map]);

  return null;
}

export function ApplicationMap({ applications }: ApplicationMapProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const markers: MapMarker[] = useMemo(() => {
    return applications
      .map((app) => {
        // Use stored coordinates first
        if (app.latitude != null && app.longitude != null) {
          return { app, lat: app.latitude, lng: app.longitude };
        }

        if (!app.location) return null;

        const locLower = app.location.trim().toLowerCase();
        if (locLower === "remote") return null;

        const coords = getCoordsForLocation(app.location);
        if (!coords) return null;

        // Add small random offset to prevent exact overlap
        const offset = () => (Math.random() - 0.5) * 0.02;
        return {
          app,
          lat: coords.lat + offset(),
          lng: coords.lng + offset(),
        };
      })
      .filter((m): m is MapMarker => m !== null);
  }, [applications]);

  const remoteApps = useMemo(
    () => applications.filter((app) => app.location?.trim().toLowerCase() === "remote"),
    [applications]
  );

  const unmappedApps = useMemo(() => {
    return applications.filter((app) => {
      if (!app.location) return true;
      const locLower = app.location.trim().toLowerCase();
      if (locLower === "remote") return false;
      if (app.latitude != null && app.longitude != null) return false;
      return getCoordsForLocation(app.location) == null;
    });
  }, [applications]);

  const defaultCenter: [number, number] =
    markers.length > 0 ? [markers[0].lat, markers[0].lng] : [39.8283, -98.5795];

  return (
    <div className="space-y-4">
      <CardRetro className="p-0 overflow-hidden">
        <div className="h-[500px] relative">
          {markers.length > 0 ? (
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
              <FitBounds markers={markers} />
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
                      <p className="text-sm text-muted-foreground">{marker.app.company}</p>
                      <p className="text-xs text-muted-foreground">{marker.app.location}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getStatusHexColor(marker.app.status) }}
                        >
                          {marker.app.status}
                        </span>
                        <Link
                          to={`/applications/${marker.app.id}`}
                          className="text-sm underline"
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
                Add location information like "Memphis" or "Memphis, TN" to see markers.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 p-4 border-t-2 border-border bg-card">
          <span className="text-sm font-bold text-muted-foreground">Status:</span>
          {["Saved", "Applied", "Interview", "Offer", "Rejected", "Ghosted"].map((status) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusHexColor(status) }} />
              <span className="text-sm">{status}</span>
            </div>
          ))}
        </div>
      </CardRetro>

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

      {unmappedApps.length > 0 && (
        <CardRetro className="p-4">
          <h3 className="font-bold mb-3 text-muted-foreground">Other Locations ({unmappedApps.length})</h3>
          <p className="text-sm text-muted-foreground mb-3">
            These locations couldn't be mapped yet. Add coordinates or use a known city name.
          </p>
          <div className="flex flex-wrap gap-2">
            {unmappedApps.map((app) => (
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
