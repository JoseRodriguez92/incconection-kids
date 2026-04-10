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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Gestión de Períodos Académicos
        </h2>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Período</span>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5" />
            <span>Lista de Períodos Académicos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : periodos.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                No hay períodos académicos registrados
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear primer período
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periodos.map((periodo) => (
                <Card
                  key={periodo.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-lg">
                        {periodo.name}
                      </h3>
                      <Badge
                        variant={periodo.is_active ? "default" : "secondary"}
                      >
                        {periodo.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    {periodo.description && (
                      <p className="text-sm text-muted-foreground">
                        {periodo.description}
                      </p>
                    )}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Inicio:</span>
                        <span className="ml-2 font-medium">
                          {formatDate(periodo.start_date)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Fin:</span>
                        <span className="ml-2 font-medium">
                          {formatDate(periodo.end_date)}
                        </span>
                      </div>
                    </div>

                    {/* Ciclos del periodo - Acordeón */}
                    {periodo.academic_period_has_cycle.length > 0 && (
                      <div className="pt-2 border-t">
                        <Accordion type="single" collapsible>
                          <AccordionItem value="cycles" className="border-none">
                            <AccordionTrigger className="py-2 hover:no-underline">
                              <div className="flex items-center text-sm font-medium text-foreground">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>
                                  Ciclos (
                                  {periodo.academic_period_has_cycle.length})
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-1">
                                {periodo.academic_period_has_cycle.map(
                                  (item) => (
                                    <div
                                      key={item.cycle.id}
                                      className="bg-muted/30 p-2 rounded-md space-y-1"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                          Ciclo {item.cycle.name}
                                        </span>
                                        <Badge
                                          variant={
                                            item.is_active
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="text-xs"
                                        >
                                          {item.is_active
                                            ? "Activo"
                                            : "Inactivo"}
                                        </Badge>
                                      </div>
                                      {item.cycle.description && (
                                        <p className="text-xs text-muted-foreground">
                                          {item.cycle.description}
                                        </p>
                                      )}
                                      {item.start_date && item.end_date && (
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                          <span>
                                            {new Date(
                                              item.start_date,
                                            ).toLocaleDateString("es-ES", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </span>
                                          <span>→</span>
                                          <span>
                                            {new Date(
                                              item.end_date,
                                            ).toLocaleDateString("es-ES", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(periodo)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
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
