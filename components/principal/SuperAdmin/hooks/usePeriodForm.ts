import { useState } from "react";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { InstituteStore } from "@/Stores/InstituteStore";

export interface SelectedCycleData {
  cycle_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const usePeriodForm = () => {
  const { addPeriodo, addCycleToPeriod, fetchPeriodos } = PeriodAcademicStore();
  const { institute } = InstituteStore();

  const [selectedCyclesData, setSelectedCyclesData] = useState<
    SelectedCycleData[]
  >([]);

  const [newPeriodo, setNewPeriodo] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const handleToggleCycleSelection = (cycleId: string) => {
    setSelectedCyclesData((prev) => {
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

  const isCycleSelected = (cycleId: string) => {
    return selectedCyclesData.some((item) => item.cycle_id === cycleId);
  };

  const updateCycleData = (
    cycleId: string,
    field: keyof SelectedCycleData,
    value: string | boolean,
  ) => {
    setSelectedCyclesData((prev) =>
      prev.map((item) =>
        item.cycle_id === cycleId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleCreatePeriodo = async () => {
    if (!newPeriodo.name || !newPeriodo.start_date || !newPeriodo.end_date) {
      alert("Por favor completa todos los campos obligatorios");
      return false;
    }

    if (!institute.id) {
      alert(
        "No se encontró el ID del instituto. Por favor inicia sesión nuevamente.",
      );
      return false;
    }

    if (selectedCyclesData.length > 0) {
      const incompleteCycles = selectedCyclesData.filter(
        (cycle) => !cycle.start_date || !cycle.end_date,
      );
      if (incompleteCycles.length > 0) {
        alert(
          "Por favor completa las fechas de inicio y fin de todos los ciclos seleccionados",
        );
        return false;
      }
    }

    try {
      const newPeriodoId = crypto.randomUUID();

      await addPeriodo({
        id: newPeriodoId,
        institute_id: institute.id,
        name: newPeriodo.name,
        description: newPeriodo.description || "",
        start_date: newPeriodo.start_date,
        end_date: newPeriodo.end_date,
        is_active: newPeriodo.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        academic_period_has_cycle: [],
      });

      for (const cycleData of selectedCyclesData) {
        await addCycleToPeriod(newPeriodoId, cycleData.cycle_id, {
          isActive: cycleData.is_active,
          start_date: cycleData.start_date,
          end_date: cycleData.end_date,
        });
      }

      await fetchPeriodos();

      // Limpiar formulario
      setNewPeriodo({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
      setSelectedCyclesData([]);

      return true;
    } catch (error) {
      console.error("Error al crear período:", error);
      alert("Ocurrió un error al crear el período académico");
      return false;
    }
  };

  const resetForm = () => {
    setNewPeriodo({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
    setSelectedCyclesData([]);
  };

  return {
    newPeriodo,
    setNewPeriodo,
    selectedCyclesData,
    handleToggleCycleSelection,
    isCycleSelected,
    updateCycleData,
    handleCreatePeriodo,
    resetForm,
  };
};
