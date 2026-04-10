import React from "react";
import { type Cycle } from "@/Stores/periodAcademicStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CycleSelector } from "./CycleSelector";
import type { SelectedCycleData } from "../hooks";

interface CreatePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPeriodo: {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
  };
  setNewPeriodo: React.Dispatch<React.SetStateAction<any>>;
  availableCycles: Cycle[];
  selectedCyclesData: SelectedCycleData[];
  onToggleCycleSelection: (cycleId: string) => void;
  isCycleSelected: (cycleId: string) => boolean;
  onUpdateCycleData: (cycleId: string, field: keyof SelectedCycleData, value: string | boolean) => void;
  onSubmit: () => Promise<boolean>;
  loading: boolean;
}

export const CreatePeriodModal: React.FC<CreatePeriodModalProps> = ({
  isOpen,
  onClose,
  newPeriodo,
  setNewPeriodo,
  availableCycles,
  selectedCyclesData,
  onToggleCycleSelection,
  isCycleSelected,
  onUpdateCycleData,
  onSubmit,
  loading,
}) => {
  if (!isOpen) return null;

  const handleSubmit = async () => {
    const success = await onSubmit();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Nuevo Período Académico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda - Información del Período */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                Información del Período
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre del período *</Label>
                <Input
                  id="name"
                  placeholder="Ej: 2024-1, Primer Semestre 2024"
                  value={newPeriodo.name}
                  onChange={(e) =>
                    setNewPeriodo({ ...newPeriodo, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Descripción (opcional)"
                  value={newPeriodo.description}
                  onChange={(e) =>
                    setNewPeriodo({
                      ...newPeriodo,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de inicio *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newPeriodo.start_date}
                  onChange={(e) =>
                    setNewPeriodo({
                      ...newPeriodo,
                      start_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de fin *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newPeriodo.end_date}
                  onChange={(e) =>
                    setNewPeriodo({ ...newPeriodo, end_date: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newPeriodo.is_active}
                  onCheckedChange={(checked) =>
                    setNewPeriodo({ ...newPeriodo, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Período activo</Label>
              </div>
            </div>

            {/* Columna Derecha - Ciclos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                Selección de Ciclos
              </h3>

              <CycleSelector
                cycles={availableCycles}
                selectedCycles={selectedCyclesData}
                onToggleSelection={onToggleCycleSelection}
                onUpdateData={onUpdateCycleData}
                isSelected={isCycleSelected}
                title="Seleccionar Ciclos"
                accentColor="blue"
                loading={loading}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
