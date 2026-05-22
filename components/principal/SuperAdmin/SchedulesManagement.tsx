"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { useSchedulesData } from "./Schedules/hooks/useSchedulesData";
import { useScheduleForm } from "./Schedules/hooks/useScheduleForm";
import { SchedulesFilters } from "./Schedules/SchedulesFilters";
import { SchedulesCalendarView } from "./Schedules/SchedulesCalendarView";
import { SchedulesListView } from "./Schedules/SchedulesListView";
import { SchedulesModal } from "./Schedules/SchedulesModal";

export function SchedulesManagement() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");

  // Desktop (≥1024px) arranca en calendario, mobile en lista
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setViewMode("calendar");
    }
  }, []);

  const data = useSchedulesData();
  const form = useScheduleForm();

  const handleEditClick = (
    horario: Parameters<typeof form.handleEditClick>[0],
  ) => form.handleEditClick(horario);

  const handleCloneClick = (
    horario: Parameters<typeof form.handleCloneClick>[0],
  ) => form.handleCloneClick(horario);

  const filtersProps = {
    searchTerm: data.searchTerm,
    setSearchTerm: data.setSearchTerm,
    selectedProfesor: data.selectedProfesor,
    setSelectedProfesor: data.setSelectedProfesor,
    selectedMateria: data.selectedMateria,
    setSelectedMateria: data.setSelectedMateria,
    selectedDia: data.selectedDia,
    setSelectedDia: data.setSelectedDia,
    selectedCurso: data.selectedCurso,
    setSelectedCurso: data.setSelectedCurso,
    selectedGrupo: data.selectedGrupo,
    setSelectedGrupo: data.setSelectedGrupo,
    selectedPeriodo: data.selectedPeriodo,
    setSelectedPeriodo: data.setSelectedPeriodo,
    profesoresList: data.profesoresList,
    materias: data.materias,
    cursos: data.cursos,
    grupos: data.grupos,
    periodosData: data.periodosData,
    isLoading: data.isLoading,
    handleFilterClick: data.handleFilterClick,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          Gestión de Horarios
        </h2>
        <Button onClick={form.openCreateModal} className="gap-2 sm:shrink-0">
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Crear Nueva Clase</span>
          <span className="sm:hidden">Nueva Clase</span>
        </Button>
      </div>

      {/* Layout: mobile apilado, desktop dos columnas */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_300px] lg:items-start">

        {/* ── Columna derecha (filtros): arriba en mobile, sidebar en desktop ── */}
        <div className="order-first lg:order-last lg:sticky lg:top-6">
          <SchedulesFilters {...filtersProps} />
        </div>

        {/* ── Columna izquierda (toggle + vista): abajo en mobile, principal en desktop ── */}
        <div className="order-last lg:order-first space-y-6 min-w-0">
          {/* Selector de vista */}
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  Vista:
                </span>
                <div className="flex flex-1 gap-2">
                  <Button
                    variant={viewMode === "calendar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("calendar")}
                    className="flex-1 gap-1.5"
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Calendario Semanal</span>
                    <span className="sm:hidden">Calendario</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1 gap-1.5"
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Lista de Horarios</span>
                    <span className="sm:hidden">Lista</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vistas */}
          {viewMode === "calendar" && (
            <SchedulesCalendarView
              dataLoaded={data.dataLoaded}
              horariosPorDia={data.horariosPorDia}
              getColorForSubject={data.getColorForSubject}
              onEditClick={handleEditClick}
              onCloneClick={handleCloneClick}
            />
          )}
          {viewMode === "list" && (
            <SchedulesListView
              dataLoaded={data.dataLoaded}
              filteredHorarios={data.filteredHorarios}
              horariosPorDia={data.horariosPorDia}
              onEditClick={handleEditClick}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      <SchedulesModal
        isOpen={form.isModalOpen}
        isEditing={form.isEditing}
        isCloning={form.isCloning}
        formData={form.formData}
        setFormData={form.setFormData}
        schedules={form.schedules}
        tempSchedule={form.tempSchedule}
        setTempSchedule={form.setTempSchedule}
        editingScheduleIndex={form.editingScheduleIndex}
        onClose={form.closeModal}
        onSave={form.handleCreateOrUpdateClass}
        onAddSchedule={form.handleAddSchedule}
        onEditSchedule={form.handleEditSchedule}
        onCancelEditSchedule={form.handleCancelEditSchedule}
        onRemoveSchedule={form.handleRemoveSchedule}
        onSuccess={() => data.setDataLoaded(true)}
        classId={form.editingClassId}
        materiasData={data.materiasData}
        teachersEnrolled={data.teachersEnrolled}
        profiles={data.profiles}
        coursesData={data.coursesData}
        groupsData={data.groupsData}
        classroomsData={data.classroomsData}
      />
    </div>
  );
}
