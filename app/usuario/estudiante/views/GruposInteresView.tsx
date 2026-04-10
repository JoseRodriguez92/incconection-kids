"use client";

import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function GruposInteresView() {
  return (
    <div className="flex-1 space-y-6 p-6 relative z-1">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Grupos de Interés</h1>
        <p className="text-muted-foreground text-sm">
          Comunidades y grupos extracurriculares
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <Users className="h-14 w-14 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">
                No hay grupos configurados actualmente
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Cuando el administrador configure grupos de interés, aparecerán
                aquí para que puedas unirte.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
