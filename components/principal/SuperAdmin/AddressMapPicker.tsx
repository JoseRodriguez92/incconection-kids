"use client";

import { useState, useCallback, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2 } from "lucide-react";

const CARTO_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const BOGOTA = { lat: 4.711, lng: -74.0721, zoom: 11 };

export interface AddressMapPickerProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  editing: boolean;
  onChange: (address: string, lat: number, lng: number) => void;
}

async function nominatimSearch(query: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
    { headers: { "User-Agent": "incconection-kids/1.0" } },
  );
  const data = await res.json();
  if (!data[0]) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display_name: data[0].display_name as string };
}

async function nominatimReverse(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "incconection-kids/1.0" } },
    );
    const data = await res.json();
    return (data.display_name as string) ?? null;
  } catch {
    return null;
  }
}

export function AddressMapPicker({ address, latitude, longitude, editing, onChange }: AddressMapPickerProps) {
  const hasCoords = latitude != null && longitude != null;

  const [searchQuery,  setSearchQuery]  = useState("");
  const [searching,    setSearching]    = useState(false);
  const [markerPos,    setMarkerPos]    = useState({
    lat: hasCoords ? latitude! : BOGOTA.lat,
    lng: hasCoords ? longitude! : BOGOTA.lng,
  });
  const [viewState, setViewState] = useState({
    latitude:  hasCoords ? latitude!  : BOGOTA.lat,
    longitude: hasCoords ? longitude! : BOGOTA.lng,
    zoom:      hasCoords ? 15         : BOGOTA.zoom,
  });

  // Sync when parent provides coordinates (async load)
  useEffect(() => {
    if (latitude != null && longitude != null) {
      setMarkerPos({ lat: latitude, lng: longitude });
      setViewState((v) => ({ ...v, latitude, longitude, zoom: 15 }));
    }
  }, [latitude, longitude]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await nominatimSearch(searchQuery);
      if (result) {
        setMarkerPos({ lat: result.lat, lng: result.lng });
        setViewState({ latitude: result.lat, longitude: result.lng, zoom: 16 });
        onChange(result.display_name, result.lat, result.lng);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleMarkerDragEnd = useCallback(
    async (event: any) => {
      const lat: number = event.lngLat.lat;
      const lng: number = event.lngLat.lng;
      setMarkerPos({ lat, lng });
      const addr = await nominatimReverse(lat, lng);
      onChange(addr ?? address, lat, lng);
    },
    [address, onChange],
  );

  return (
    <div className="space-y-2">
      {/* Search bar — only in edit mode */}
      {editing && (
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar dirección..."
            className="h-9 text-sm"
          />
          <Button
            size="sm" variant="outline" className="h-9 px-3 shrink-0"
            onClick={handleSearch} disabled={searching}
          >
            {searching
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border" style={{ height: 230 }}>
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={CARTO_STYLE}
          style={{ width: "100%", height: "100%" }}
          scrollZoom={editing}
          dragPan={editing}
          doubleClickZoom={editing}
          touchZoomRotate={editing}
        >
          <NavigationControl position="top-right" showCompass={false} />
          <Marker
            longitude={markerPos.lng}
            latitude={markerPos.lat}
            anchor="bottom"
            draggable={editing}
            onDragEnd={handleMarkerDragEnd}
          >
            <MapPin
              className="w-7 h-7 drop-shadow-lg cursor-grab active:cursor-grabbing"
              style={{ color: "#25305D" }}
              fill="#25305D"
              strokeWidth={1.2}
            />
          </Marker>
        </Map>
      </div>

      {/* Address + coords summary */}
      <div className="flex items-start justify-between gap-3 px-0.5">
        <p className="text-xs text-muted-foreground leading-snug flex-1 min-w-0 line-clamp-2">
          {address || "Sin dirección registrada"}
        </p>
        {hasCoords && (
          <p className="text-[10px] font-mono text-muted-foreground/50 shrink-0 mt-0.5">
            {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
          </p>
        )}
      </div>
    </div>
  );
}
