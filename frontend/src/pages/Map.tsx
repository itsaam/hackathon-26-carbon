import { useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { useSites } from "@/hooks/useSites";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

// Fix pour les icônes Leaflet dans un bundle Vite
// (on utilise des cercles, mais on laisse l'override pour éviter des warnings).
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: undefined,
  iconUrl: undefined,
  shadowUrl: undefined,
});

function FitBounds({ points }: { points: { lat: number; lon: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 13);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);

  return null;
}

export default function MapPage() {
  const { sites, getLatestResult } = useSites();

  const markers = useMemo(() => {
    return sites
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => {
        const r = getLatestResult(s.id);
        const totalT = (r?.totalCo2Kg ?? 0) / 1000;
        let bucket = 0;
        if (totalT > 50 && totalT <= 200) bucket = 1;
        else if (totalT > 200 && totalT <= 500) bucket = 2;
        else if (totalT > 500) bucket = 3;
        return {
          id: s.id,
          name: s.name,
          lat: s.latitude!,
          lon: s.longitude!,
          totalT,
          bucket,
        };
      });
  }, [sites, getLatestResult]);

  const center: [number, number] = markers.length
    ? [markers[0].lat, markers[0].lon]
    : [48.8566, 2.3522]; // Paris par défaut

  return (
    <div>
      <PageHeader
        title="Carte des sites"
        subtitle="Visualisez vos sites sur une carte détaillée avec un code couleur en fonction de l’empreinte carbone."
      />

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
            <span>{"< 50 tCO₂e"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
            <span>{"50–200 tCO₂e"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[2] }} />
            <span>{"200–500 tCO₂e"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[3] }} />
            <span>{"> 500 tCO₂e"}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right max-w-xs">
          Fond de carte OpenStreetMap. Les marqueurs sont dimensionnés et colorés en fonction du total CO₂ (tCO₂e) par site.
        </div>
      </div>

      <div className="relative border border-border rounded-xl overflow-hidden h-[520px]">
        <MapContainer
          className="w-full h-full"
          center={center}
          zoom={6}
          scrollWheelZoom
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={markers.map((m) => ({ lat: m.lat, lon: m.lon }))} />

          {markers.map((m) => {
            const color = COLORS[m.bucket];
            const radius = 8 + m.bucket * 4;
            return (
              <CircleMarker
                key={m.id}
                center={[m.lat, m.lon]}
                radius={radius}
                pathOptions={{
                  color,
                  weight: 1,
                  fillColor: color,
                  fillOpacity: 0.75,
                }}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={1} className="text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold">{m.name}</div>
                    <div>{m.totalT.toLocaleString("fr-FR")} tCO₂e</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

