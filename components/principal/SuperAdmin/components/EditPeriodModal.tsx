import React from "react";
import {
  type PeriodoAcademico,
  type Cycle,
} from "@/Stores/periodAcademicStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExistingCycles } from "./ExistingCycles";
import { CycleSelector } from "./CycleSelector";
import type { SelectedCycleData } from "../hooks";

interface EditPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPeriodo: PeriodoAcademico | null;
  setSelectedPeriodo: React.Dispatch<
    React.SetStateAction<PeriodoAcademico | null>
  >;
  availableCycles: Cycle[];
  newCyclesToAdd: SelectedCycleData[];
  onToggleNewCycleSelection: (cycleId: string) => void;
  isNewCycleSelected: (cycleId: string) => boolean;
  onUpdateNewCycleData: (
    cycleId: string,
    field: keyof SelectedCycleData,
    value: string | boolean,
  ) => void;
  onSubmit: () => Promise<boolean>;
  loading: boolean;
}

export const EditPeriodModal: React.FC<EditPeriodModalProps> = ({
  isOpen,
  onClose,
  selectedPeriodo,
  setSelectedPeriodo,
  availableCycles,
  newCyclesToAdd,
  onToggleNewCycleSelection,
  isNewCycleSelected,
  onUpdateNewCycleData,
  onSubmit,
  loading,
}) => {
  // Debug effect
  React.useEffect(() => {
    if (isOpen && selectedPeriodo) {
      console.log("EditPeriodModal montado/actualizado");
      console.log("- Ciclos disponibles recibidos:", availableCycles.length);
      console.log("- Período seleccionado:", selectedPeriodo.name);
      console.log(
        "- Ciclos del período:",
        selectedPeriodo.academic_period_has_cycle?.length || 0,
      );
    }
  }, [isOpen, selectedPeriodo, availableCycles]);

  if (!isOpen || !selectedPeriodo) return null;

  const handleSubmit = async () => {
    const success = await onSubmit();
    if (success) {
      onClose();
    }
  };

  const getAvailableCyclesForPeriod = () => {
    if (!selectedPeriodo?.academic_period_has_cycle) {
      console.log(
        "No hay ciclos en el período, devolviendo todos:",
        availableCycles,
      );
      return availableCycles;
    }
    const existingCycleIds = selectedPeriodo.academic_period_has_cycle.map(
      (item) => item.cycle.id,
    );
    const filteredCycles = availableCycles.filter(
      (cycle) => !existingCycleIds.includes(cycle.id),
    );
    console.log("Ciclos existentes IDs:", existingCycleIds);
    console.log("Ciclos disponibles filtrados:", filteredCycles);
    return filteredCycles;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Editar Período Académico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda - Información del Período */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                Información del Período
              </h3>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre del período</Label>
                <Input
                  id="edit-name"
                  placeholder="Nombre del período"
                  value={selectedPeriodo.name}
                  onChange={(e) =>
                    setSelectedPeriodo({
                      ...selectedPeriodo,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input
                  id="edit-description"
                  placeholder="Descripción"
                  value={selectedPeriodo.description || ""}
                  onChange={(e) =>
                    setSelectedPeriodo({
                      ...selectedPeriodo,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-start_date">Fecha de inicio</Label>
                <Input
                  id="edit-start_date"
                  type="date"
                  value={selectedPeriodo.start_date}
                  onChange={(e) =>
                    setSelectedPeriodo({
                      ...selectedPeriodo,
                      start_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-end_date">Fecha de fin</Label>
                <Input
                  id="edit-end_date"
                  type="date"
                  value={selectedPeriodo.end_date}
                  onChange={(e) =>
                    setSelectedPeriodo({
                      ...selectedPeriodo,
                      end_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={selectedPeriodo.is_active ?? true}
                  onCheckedChange={(checked) =>
                    setSelectedPeriodo({
                      ...selectedPeriodo,
                      is_active: checked,
                    })
                  }
                />
                <Label htmlFor="edit-is_active">Período activo</Label>
              </div>
            </div>

            {/* Columna Derecha - Ciclos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                Gestión de Ciclos
              </h3>

              <ExistingCycles
                cycles={selectedPeriodo.academic_period_has_cycle || []}
                onUpdateCycle={(index, updatedCycle) => {
                  const updatedCycles = [
                    ...(selectedPeriodo.academic_period_has_cycle || []),
                  ];
                  updatedCycles[index] = updatedCycle;
                  setSelectedPeriodo({
                    ...selectedPeriodo,
                    academic_period_has_cycle: updatedCycles,
                  });
                }}
              />

              <CycleSelector
                cycles={getAvailableCyclesForPeriod()}
                selectedCycles={newCyclesToAdd}
                onToggleSelection={onToggleNewCycleSelection}
                onUpdateData={onUpdateNewCycleData}
                isSelected={isNewCycleSelected}
                title="Agregar Ciclos al Período"
                accentColor="green"
                loading={loading}
                emptyMessage={
                  selectedPeriodo.academic_period_has_cycle &&
                  selectedPeriodo.academic_period_has_cycle.length > 0
                    ? "Todos los ciclos disponibles ya están asignados a este período."
                    : "No hay ciclos disponibles en el sistema."
                }
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
