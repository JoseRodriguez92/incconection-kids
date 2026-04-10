"use client";

import { useState } from "react";
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
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const data = useSchedulesData();
  const form = useScheduleForm();

  const handleEditClick = (horario: Parameters<typeof form.handleEditClick>[0]) =>
    form.handleEditClick(horario);

  const handleCloneClick = (horario: Parameters<typeof form.handleCloneClick>[0]) =>
    form.handleCloneClick(horario);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Horarios</h2>
        <button
          onClick={form.openCreateModal}
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
        >
          <span>+</span>
          Crear Nueva Clase
        </button>
      </div>

      {/* Vista toggle */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Vista:</span>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Calendario Semanal
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Lista de Horarios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <SchedulesFilters
        searchTerm={data.searchTerm}
        setSearchTerm={data.setSearchTerm}
        selectedProfesor={data.selectedProfesor}
        setSelectedProfesor={data.setSelectedProfesor}
        selectedMateria={data.selectedMateria}
        setSelectedMateria={data.setSelectedMateria}
        selectedDia={data.selectedDia}
        setSelectedDia={data.setSelectedDia}
        selectedCurso={data.selectedCurso}
        setSelectedCurso={data.setSelectedCurso}
        selectedGrupo={data.selectedGrupo}
        setSelectedGrupo={data.setSelectedGrupo}
        selectedPeriodo={data.selectedPeriodo}
        setSelectedPeriodo={data.setSelectedPeriodo}
        profesoresList={data.profesoresList}
        materias={data.materias}
        cursos={data.cursos}
        grupos={data.grupos}
        periodosData={data.periodosData}
        isLoading={data.isLoading}
        handleFilterClick={data.handleFilterClick}
      />

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
