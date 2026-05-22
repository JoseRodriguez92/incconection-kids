"use client";

import React, { useEffect, useState } from "react";
import { PeriodAcademicStore, type Cycle } from "@/Stores/periodAcademicStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar, Plus, Edit, CalendarDays, Clock } from "lucide-react";
import { usePeriodForm } from "./hooks/usePeriodForm";
import { usePeriodEdit } from "./hooks/usePeriodEdit";
import { CreatePeriodModal } from "./components/CreatePeriodModal";
import { EditPeriodModal } from "./components/EditPeriodModal";

const PeriodAcademicManagement: React.FC = () => {
  const { periodos, loading, error, fetchPeriodos, fetchCycles } =
    PeriodAcademicStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [availableCycles, setAvailableCycles] = useState<Cycle[]>([]);

  // Hooks personalizados para la lógica de crear y editar
  const periodForm = usePeriodForm();
  const periodEdit = usePeriodEdit();

  // Cargar datos iniciales
  useEffect(() => {
    fetchPeriodos();
    loadAvailableCycles(); // Cargar ciclos al inicio
  }, []);

  const loadAvailableCycles = async () => {
    try {
      const cycles = await fetchCycles();

      setAvailableCycles(cycles);
    } catch (error) {
      console.error("Error al cargar ciclos:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleOpenEdit = (periodo: any) => {
    console.log("Abriendo modal de edición para período:", periodo);
    console.log("Ciclos disponibles en el sistema:", availableCycles);
    console.log("Ciclos del período:", periodo.academic_period_has_cycle);
    periodEdit.setSelectedPeriodo(periodo);
    setIsEditOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    periodForm.resetForm();
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    periodEdit.resetEdit();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          Gestión de Períodos Académicos
        </h2>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 sm:shrink-0">
          <Plus className="w-4 h-4" />
          Nuevo Período
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded text-sm">
          Error: {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 shrink-0" />
            <span>Lista de Períodos Académicos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : periodos.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">
                No hay períodos académicos registrados
              </p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4" />
                Crear primer período
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periodos.map((periodo) => (
                <Card key={periodo.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    {/* Nombre + badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-base leading-snug min-w-0 truncate">
                        {periodo.name}
                      </h3>
                      <Badge
                        variant={periodo.is_active ? "default" : "secondary"}
                        className="shrink-0 text-xs"
                      >
                        {periodo.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    {periodo.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {periodo.description}
                      </p>
                    )}

                    {/* Fechas en grid 2 columnas */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                      <div className="space-y-0.5">
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Inicio
                        </p>
                        <p className="font-medium">{formatDate(periodo.start_date)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Fin
                        </p>
                        <p className="font-medium">{formatDate(periodo.end_date)}</p>
                      </div>
                    </div>

                    {/* Ciclos — acordeón */}
                    {periodo.academic_period_has_cycle.length > 0 && (
                      <div className="pt-2 border-t">
                        <Accordion type="single" collapsible>
                          <AccordionItem value="cycles" className="border-none">
                            <AccordionTrigger className="py-1.5 hover:no-underline">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Clock className="w-4 h-4 shrink-0" />
                                Ciclos ({periodo.academic_period_has_cycle.length})
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-1">
                                {periodo.academic_period_has_cycle.map((item) => (
                                  <div
                                    key={item.cycle.id}
                                    className="bg-muted/30 p-2.5 rounded-md space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-medium truncate">
                                        Ciclo {item.cycle.name}
                                      </span>
                                      <Badge
                                        variant={item.is_active ? "default" : "secondary"}
                                        className="text-xs shrink-0"
                                      >
                                        {item.is_active ? "Activo" : "Inactivo"}
                                      </Badge>
                                    </div>
                                    {item.cycle.description && (
                                      <p className="text-xs text-muted-foreground">
                                        {item.cycle.description}
                                      </p>
                                    )}
                                    {item.start_date && item.end_date && (
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(item.start_date).toLocaleDateString("es-ES", {
                                          month: "short", day: "numeric", year: "numeric",
                                        })}
                                        {" → "}
                                        {new Date(item.end_date).toLocaleDateString("es-ES", {
                                          month: "short", day: "numeric", year: "numeric",
                                        })}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}

                    {/* Editar — full width en mobile */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => handleOpenEdit(periodo)}
                      >
                        <Edit className="w-4 h-4" />
                        Editar período
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear */}
      <CreatePeriodModal
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        newPeriodo={periodForm.newPeriodo}
        setNewPeriodo={periodForm.setNewPeriodo}
        availableCycles={availableCycles}
        selectedCyclesData={periodForm.selectedCyclesData}
        onToggleCycleSelection={periodForm.handleToggleCycleSelection}
        isCycleSelected={periodForm.isCycleSelected}
        onUpdateCycleData={periodForm.updateCycleData}
        onSubmit={periodForm.handleCreatePeriodo}
        loading={loading}
      />

      {/* Modal Editar */}
      <EditPeriodModal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        selectedPeriodo={periodEdit.selectedPeriodo}
        setSelectedPeriodo={periodEdit.setSelectedPeriodo}
        availableCycles={availableCycles}
        newCyclesToAdd={periodEdit.newCyclesToAdd}
        onToggleNewCycleSelection={periodEdit.handleToggleNewCycleSelection}
        isNewCycleSelected={periodEdit.isNewCycleSelected}
        onUpdateNewCycleData={periodEdit.updateNewCycleData}
        onSubmit={periodEdit.handleUpdatePeriodo}
        loading={loading}
      />
    </div>
  );
};

export default PeriodAcademicManagement;
