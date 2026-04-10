"use client"

import { Users } from "lucide-react"

export default function GruposEscolaresPage() {
  return (
    <div className="min-w-0 space-y-6 p-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Grupos Escolares</h1>
          <p className="text-muted-foreground">Gestiona los grupos académicos en los que participas</p>
        </div>
      </div>

      {/* Estado vacío */}
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-muted/30 rounded-full">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Grupos Escolares</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              No hay grupos disponibles en este momento
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
