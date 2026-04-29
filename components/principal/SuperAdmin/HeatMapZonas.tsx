"use client"

import { useEffect, useState } from "react"
import Map, { Source, Layer } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

interface ZonaPoint {
  address: string
  weight: number
  lat?: number
  lng?: number
}

interface GeoFeature {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: { weight: number }
}

async function geocode(address: string, ciudad: string): Promise<[number, number] | null> {
  await new Promise((r) => setTimeout(r, 1100))
  try {
    const q = encodeURIComponent(`${address}, ${ciudad}, Colombia`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "User-Agent": "IncconectionKids/1.0" } }
    )
    const data = await res.json()
    if (data[0]) return [parseFloat(data[0].lon), parseFloat(data[0].lat)]
  } catch {}
  return null
}

export default function HeatMapZonas({
  zonas,
  ciudad = "Bogotá",
  lat = 4.711,
  lng = -74.0721,
  zoom = 11,
}: {
  zonas: ZonaPoint[]
  ciudad?: string
  lat?: number
  lng?: number
  zoom?: number
}) {
  const [features, setFeatures] = useState<GeoFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false

    // Si todas las zonas ya tienen coordenadas, cargar instantáneo
    const allHaveCoords = zonas.every((z) => z.lat !== undefined && z.lng !== undefined)
    if (allHaveCoords) {
      const result: GeoFeature[] = zonas.map((z) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [z.lng!, z.lat!] },
        properties: { weight: z.weight },
      }))
      setFeatures(result)
      setLoading(false)
      return
    }

    // Geocodificar las que no tienen coordenadas
    async function load() {
      const result: GeoFeature[] = []
      for (let i = 0; i < zonas.length; i++) {
        const z = zonas[i]
        let coords: [number, number] | null =
          z.lat !== undefined && z.lng !== undefined ? [z.lng, z.lat] : null
        if (!coords) coords = await geocode(z.address, ciudad)
        if (cancelled) return
        if (coords) {
          result.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: coords },
            properties: { weight: z.weight },
          })
          setFeatures([...result])
        }
        setProgress(Math.round(((i + 1) / zonas.length) * 100))
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const geojson = { type: "FeatureCollection" as const, features }

  return (
    <div className="relative w-full h-72 rounded-lg overflow-hidden border">
      {loading && (
        <div className="absolute top-2 left-2 z-10 bg-background/90 text-xs px-3 py-1 rounded-full border shadow-sm">
          Geocodificando zonas... {progress}%
        </div>
      )}
      <Map
        initialViewState={{ longitude: lng, latitude: lat, zoom }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
      >
        <Source id="heat-source" type="geojson" data={geojson}>
          <Layer
            id="heatmap"
            type="heatmap"
            paint={{
              "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 20, 1],
              "heatmap-intensity": 1.5,
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,    "rgba(0,0,255,0)",
                0.15, "rgba(0,0,255,0.6)",
                0.35, "rgba(0,200,100,0.8)",
                0.55, "rgba(255,230,0,0.9)",
                0.75, "rgba(255,140,0,1)",
                1,    "rgba(220,0,0,1)",
              ],
              "heatmap-radius": 40,
              "heatmap-opacity": 0.85,
            }}
          />
        </Source>
      </Map>
    </div>
  )
}
