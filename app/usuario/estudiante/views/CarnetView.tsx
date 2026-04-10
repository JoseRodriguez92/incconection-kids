"use client";

import { IdCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CarnetView() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Carnet Estudiantil</h1>
        <p className="text-muted-foreground text-sm">
          Identificación digital del estudiante
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <IdCard className="h-14 w-14 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">
                Carnet pendiente de configuración
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                El administrador aún no ha configurado el carnet estudiantil
                digital. Estará disponible próximamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
