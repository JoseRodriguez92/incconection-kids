import { useState } from "react";
import {
  PeriodAcademicStore,
  type PeriodoAcademico,
} from "@/Stores/periodAcademicStore";
import type { SelectedCycleData } from "./usePeriodForm";

export const usePeriodEdit = () => {
  const {
    updatePeriodo,
    addCycleToPeriod,
    updateCycleRelation,
    fetchPeriodos,
  } = PeriodAcademicStore();

  const [selectedPeriodo, setSelectedPeriodo] =
    useState<PeriodoAcademico | null>(null);
  const [newCyclesToAdd, setNewCyclesToAdd] = useState<SelectedCycleData[]>([]);

  const handleToggleNewCycleSelection = (cycleId: string) => {
    setNewCyclesToAdd((prev) => {
      const exists = prev.find((item) => item.cycle_id === cycleId);
      if (exists) {
        return prev.filter((item) => item.cycle_id !== cycleId);
      } else {
        return [
          ...prev,
          {
            cycle_id: cycleId,
            start_date: "",
            end_date: "",
            is_active: true,
          },
        ];
      }
    });
  };

  const isNewCycleSelected = (cycleId: string) => {
    return newCyclesToAdd.some((item) => item.cycle_id === cycleId);
  };

  const updateNewCycleData = (
    cycleId: string,
    field: keyof SelectedCycleData,
    value: string | boolean,
  ) => {
    setNewCyclesToAdd((prev) =>
      prev.map((item) =>
        item.cycle_id === cycleId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleUpdatePeriodo = async () => {
    if (!selectedPeriodo) return false;

    if (newCyclesToAdd.length > 0) {
      const incompleteCycles = newCyclesToAdd.filter(
        (cycle) => !cycle.start_date || !cycle.end_date,
      );
      if (incompleteCycles.length > 0) {
        alert(
          "Por favor completa las fechas de inicio y fin de todos los ciclos nuevos seleccionados",
        );
        return false;
      }
    }

    if (selectedPeriodo.academic_period_has_cycle) {
      const incompleteCycles = selectedPeriodo.academic_period_has_cycle.filter(
        (item) => !item.start_date || !item.end_date,
      );
      if (incompleteCycles.length > 0) {
        alert(
          "Por favor completa las fechas de inicio y fin de todos los ciclos",
        );
        return false;
      }
    }

    try {
      await updatePeriodo(selectedPeriodo.id, {
        name: selectedPeriodo.name,
        description: selectedPeriodo.description,
        start_date: selectedPeriodo.start_date,
        end_date: selectedPeriodo.end_date,
        is_active: selectedPeriodo.is_active,
        updated_at: new Date().toISOString(),
      });

      if (selectedPeriodo.academic_period_has_cycle) {
        for (const item of selectedPeriodo.academic_period_has_cycle) {
          await updateCycleRelation(selectedPeriodo.id, item.cycle.id, {
            is_active: item.is_active ?? true,
            start_date: item.start_date,
            end_date: item.end_date,
          });
        }
      }

      for (const cycleData of newCyclesToAdd) {
        await addCycleToPeriod(selectedPeriodo.id, cycleData.cycle_id, {
          isActive: cycleData.is_active,
          start_date: cycleData.start_date,
          end_date: cycleData.end_date,
        });
      }

      await fetchPeriodos();
      setNewCyclesToAdd([]);

      return true;
    } catch (error) {
      console.error("Error al actualizar período:", error);
      alert("Ocurrió un error al actualizar el período académico");
      return false;
    }
  };

  const resetEdit = () => {
    setSelectedPeriodo(null);
    setNewCyclesToAdd([]);
  };

  return {
    selectedPeriodo,
    setSelectedPeriodo,
    newCyclesToAdd,
    handleToggleNewCycleSelection,
    isNewCycleSelected,
    updateNewCycleData,
    handleUpdatePeriodo,
    resetEdit,
  };
};
