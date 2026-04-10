import React from "react";
import { type Cycle } from "@/Stores/periodAcademicStore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { SelectedCycleData } from "../hooks";

interface CycleSelectorProps {
  cycles: Cycle[];
  selectedCycles: SelectedCycleData[];
  onToggleSelection: (cycleId: string) => void;
  onUpdateData: (cycleId: string, field: keyof SelectedCycleData, value: string | boolean) => void;
  isSelected: (cycleId: string) => boolean;
  title: string;
  accentColor?: "blue" | "green";
  loading?: boolean;
  emptyMessage?: string;
}

export const CycleSelector: React.FC<CycleSelectorProps> = ({
  cycles,
  selectedCycles,
  onToggleSelection,
  onUpdateData,
  isSelected,
  title,
  accentColor = "blue",
  loading = false,
  emptyMessage = "No hay ciclos disponibles en el sistema.",
}) => {
  const accentStyles = {
    blue: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-700",
    },
    green: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-700",
    },
  };

  const accent = accentStyles[accentColor];

  // Debug
  console.log(`CycleSelector [${title}] - Ciclos recibidos:`, cycles.length);
  console.log(`CycleSelector [${title}] - Ciclos seleccionados:`, selectedCycles.length);

  return (
    <div className="border-t pt-4">
      <Label className="text-sm font-semibold mb-3 block">
        {title} ({selectedCycles.length} seleccionados)
      </Label>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : cycles.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {cycles
            .filter((cycle) => cycle && cycle.id)
            .map((cycle) => {
              const selected = isSelected(cycle.id);
              const cycleData = selectedCycles.find(
                (item) => item.cycle_id === cycle.id,
              );

              return (
                <div
                  key={cycle.id}
                  className={`border rounded-md p-3 transition-all ${
                    selected ? accent.bg : "bg-muted/30 border-muted"
                  }`}
                >
                  {/* Header con Switch */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selected}
                        onCheckedChange={() => onToggleSelection(cycle.id)}
                      />
                      <span className="text-sm font-medium">
                        Ciclo {cycle.name || "Sin nombre"}
                      </span>
                    </div>
                  </div>

                  {/* Descripción del ciclo */}
                  {cycle.description && (
                    <p className="text-xs text-muted-foreground ml-12 mb-2">
                      {cycle.description}
                    </p>
                  )}

                  {/* Fechas originales del ciclo */}
                  {cycle.start_date && cycle.end_date && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground ml-12 mb-3">
                      <span>
                        {new Date(cycle.start_date).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>→</span>
                      <span>
                        {new Date(cycle.end_date).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {/* Formulario expandible cuando está seleccionado */}
                  {selected && cycleData && (
                    <div className="ml-12 mt-3 space-y-3 border-t pt-3">
                      <Label className={`text-xs font-semibold ${accent.text}`}>
                        Configuración del ciclo en este período:
                      </Label>

                      {/* Fecha de inicio */}
                      <div className="space-y-1">
                        <Label htmlFor={`cycle-start-${cycle.id}`} className="text-xs">
                          Fecha de inicio *
                        </Label>
                        <Input
                          id={`cycle-start-${cycle.id}`}
                          type="date"
                          value={cycleData.start_date}
                          onChange={(e) =>
                            onUpdateData(cycle.id, "start_date", e.target.value)
                          }
                          className="text-xs"
                        />
                      </div>

                      {/* Fecha de fin */}
                      <div className="space-y-1">
                        <Label htmlFor={`cycle-end-${cycle.id}`} className="text-xs">
                          Fecha de fin *
                        </Label>
                        <Input
                          id={`cycle-end-${cycle.id}`}
                          type="date"
                          value={cycleData.end_date}
                          onChange={(e) =>
                            onUpdateData(cycle.id, "end_date", e.target.value)
                          }
                          className="text-xs"
                        />
                      </div>

                      {/* Estado activo/inactivo */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`cycle-active-${cycle.id}`}
                          checked={cycleData.is_active}
                          onCheckedChange={(checked) =>
                            onUpdateData(cycle.id, "is_active", checked)
                          }
                        />
                        <Label htmlFor={`cycle-active-${cycle.id}`} className="text-xs">
                          Ciclo activo en este período
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};
