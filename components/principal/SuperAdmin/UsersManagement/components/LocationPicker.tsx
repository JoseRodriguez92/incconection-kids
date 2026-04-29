"use client";

import { useState, useCallback } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string | null;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  disabled?: boolean;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "IncconectionKids/1.0" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function LocationPicker({
  initialLat,
  initialLng,
  initialAddress,
  onLocationChange,
  disabled,
}: LocationPickerProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [address, setAddress] = useState(initialAddress || "");
  const [loading, setLoading] = useState(false);

  const updateLocation = useCallback(
    async (lat: number, lng: number) => {
      setMarker({ lat, lng });
      setLoading(true);
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
      setLoading(false);
      onLocationChange(lat, lng, addr);
    },
    [onLocationChange]
  );

  return (
    <div className="space-y-3">
      <div className="relative w-full h-64 rounded-lg overflow-hidden border">
        <Map
          initialViewState={{
            longitude: initialLng ?? -74.0721,
            latitude: initialLat ?? 4.711,
            zoom: initialLat ? 15 : 11,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          onClick={(e) => !disabled && updateLocation(e.lngLat.lat, e.lngLat.lng)}
          cursor={disabled ? "default" : "crosshair"}
        >
          {marker && (
            <Marker
              longitude={marker.lng}
              latitude={marker.lat}
              draggable={!disabled}
              onDragEnd={(e) => updateLocation(e.lngLat.lat, e.lngLat.lng)}
            >
              <MapPin className="w-8 h-8 text-red-500 -translate-y-4" fill="currentColor" />
            </Marker>
          )}
        </Map>
        {!marker && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground bg-background/90 px-3 py-1.5 rounded-full border">
              Haz clic en el mapa para marcar la ubicación
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-sm">Dirección detectada</Label>
        <Input
          value={loading ? "Obteniendo dirección..." : address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Haz clic en el mapa..."
          disabled={loading || disabled}
        />
      </div>

      {marker && (
        <p className="text-xs text-muted-foreground">
          Lat: {marker.lat.toFixed(6)} — Lng: {marker.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
