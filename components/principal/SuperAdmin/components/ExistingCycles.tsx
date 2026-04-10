import React from "react";
import { type AcademicPeriodHasCycle } from "@/Stores/periodAcademicStore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ExistingCyclesProps {
  cycles: AcademicPeriodHasCycle[];
  onUpdateCycle: (index: number, updatedCycle: AcademicPeriodHasCycle) => void;
}

export const ExistingCycles: React.FC<ExistingCyclesProps> = ({
  cycles,
  onUpdateCycle,
}) => {
  if (!cycles || cycles.length === 0) return null;

  return (
    <div className="border-t pt-4">
      <Label className="text-sm font-semibold mb-2 block">
        Ciclos del Período ({cycles.length})
      </Label>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {cycles.map((item, index) => (
          <div
            key={item.cycle.id}
            className="bg-blue-50 border border-blue-200 p-3 rounded-md space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-xs font-medium">
                  Ciclo {item.cycle.name}
                </Label>
                {item.cycle.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.cycle.description}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-xs">Activo</Label>
                <Switch
                  checked={item.is_active ?? true}
                  onCheckedChange={(checked) => {
                    onUpdateCycle(index, {
                      ...item,
                      is_active: checked,
                    });
                  }}
                />
              </div>
            </div>
            <div className="border-t pt-2 space-y-2">
              <Label className="text-xs font-semibold text-blue-700">
                Fechas del ciclo en este período:
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Fecha inicio *</Label>
                  <Input
                    type="date"
                    value={item.start_date ?? ""}
                    onChange={(e) => {
                      onUpdateCycle(index, {
                        ...item,
                        start_date: e.target.value || undefined,
                      });
                    }}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Fecha fin *</Label>
                  <Input
                    type="date"
                    value={item.end_date ?? ""}
                    onChange={(e) => {
                      onUpdateCycle(index, {
                        ...item,
                        end_date: e.target.value || undefined,
                      });
                    }}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
