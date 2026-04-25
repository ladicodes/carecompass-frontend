"use client";

import "leaflet/dist/leaflet.css";

import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { PolicyDesertsResponse } from "@/lib/api/policy";
import { INDIA_STATE_CENTROIDS } from "@/lib/india/stateCentroids";

export function IndiaMap({
  deserts,
}: {
  deserts: PolicyDesertsResponse | null;
}) {
  const markers = useMemo(() => {
    const states = deserts?.desert_states || [];
    return states
      .map((s) => {
        const c = INDIA_STATE_CENTROIDS[s];
        if (!c) return null;
        return { state: s, ...c };
      })
      .filter(Boolean) as { state: string; lat: number; lng: number }[];
  }, [deserts]);

  return (
    <div className="h-[520px] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <MapContainer
        center={[22.9734, 78.6569]}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((m) => (
          <CircleMarker
            key={m.state}
            center={[m.lat, m.lng]}
            radius={10}
            pathOptions={{ color: "#b45309", fillColor: "#f59e0b", fillOpacity: 0.45 }}
          >
            <Popup>
              <div className="text-sm font-semibold">{m.state}</div>
              <div className="text-xs">Desert state (policy report)</div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

