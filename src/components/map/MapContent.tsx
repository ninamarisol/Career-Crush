import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Application } from "@/context/AppContext";

interface MapMarker {
  app: Application;
  lat: number;
  lng: number;
}

interface MapContentProps {
  markers: MapMarker[];
  onMarkerClick: (app: Application) => void;
  getStatusHexColor: (status: string) => string;
  createColoredIcon: (color: string) => L.DivIcon;
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

export default function MapContent({
  markers,
  onMarkerClick,
  getStatusHexColor,
  createColoredIcon,
}: MapContentProps) {
  const defaultCenter: [number, number] =
    markers.length > 0 ? [markers[0].lat, markers[0].lng] : [39.8283, -98.5795];

  return (
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
            click: () => onMarkerClick(marker.app),
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
  );
}
