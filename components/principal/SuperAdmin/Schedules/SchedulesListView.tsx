"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, ChevronDown, Clock, MapPin, Users } from "lucide-react";
import type { DayWithSchedules, ScheduleWithDetails } from "./types";

type Props = {
  dataLoaded: boolean;
  filteredHorarios: ScheduleWithDetails[];
  horariosPorDia: DayWithSchedules[];
  onEditClick: (horario: ScheduleWithDetails) => void;
};

export function SchedulesListView({ dataLoaded, filteredHorarios, horariosPorDia, onEditClick }: Props) {
  // Todos los días abiertos por defecto
  const [openDays, setOpenDays] = useState<Set<number>>(() => new Set([1, 2, 3, 4, 5]));

  const toggleDay = (dayNumber: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) next.delete(dayNumber);
      else next.add(dayNumber);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 shrink-0" />
          <span>Lista de Horarios</span>
          {dataLoaded && (
            <Badge variant="secondary" className="text-xs">
              {filteredHorarios.length} {filteredHorarios.length === 1 ? "horario" : "horarios"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!dataLoaded ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-base font-medium mb-1">Presiona "Filtrar" para cargar los horarios</p>
            <p className="text-sm">Configura los filtros y haz clic en Filtrar</p>
          </div>
        ) : filteredHorarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No se encontraron horarios con los filtros seleccionados.
          </div>
        ) : (
          <div className="space-y-2">
            {horariosPorDia.map((diaData) => {
              const horariosDelDia = filteredHorarios.filter(
                (h) => h.day_of_week === diaData.dayNumber,
              );
              if (horariosDelDia.length === 0) return null;

              const isOpen = openDays.has(diaData.dayNumber);

              return (
                <div key={diaData.dia} className="border rounded-xl overflow-hidden">
                  {/* Trigger del acordeón */}
                  <button
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => toggleDay(diaData.dayNumber)}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{diaData.dia}</span>
                      <Badge variant="secondary" className="text-xs">
                        {horariosDelDia.length} {horariosDelDia.length === 1 ? "clase" : "clases"}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Contenido colapsable */}
                  {isOpen && (
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {horariosDelDia.map((horario) => (
                        <Card
                          key={horario.id}
                          className="border cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => onEditClick(horario)}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Hora */}
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="outline" className="text-xs shrink-0">{horario.dia}</Badge>
                              <span className="text-xs font-semibold text-blue-600 tabular-nums">
                                {horario.horaInicio.substring(0, 5)} – {horario.horaFin.substring(0, 5)}
                              </span>
                            </div>
                            {/* Detalles */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm min-w-0">
                                <BookOpen className="w-4 h-4 text-green-500 shrink-0" />
                                <span className="font-medium truncate">{horario.materia}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm min-w-0">
                                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="truncate text-muted-foreground">{horario.profesor}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm min-w-0">
                                <Users className="w-4 h-4 text-purple-500 shrink-0" />
                                <span className="truncate text-muted-foreground">{horario.curso} — {horario.grupo}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm min-w-0">
                                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                                <span className="truncate text-muted-foreground">{horario.aula}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
