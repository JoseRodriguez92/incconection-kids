"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Clock, MapPin, Users } from "lucide-react";
import type { DayWithSchedules, ScheduleWithDetails } from "./types";

type Props = {
  dataLoaded: boolean;
  filteredHorarios: ScheduleWithDetails[];
  horariosPorDia: DayWithSchedules[];
  onEditClick: (horario: ScheduleWithDetails) => void;
};

export function SchedulesListView({ dataLoaded, filteredHorarios, horariosPorDia, onEditClick }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Lista de Horarios</span>
          {dataLoaded && (
            <Badge variant="secondary" className="ml-2">
              {filteredHorarios.length} horarios
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!dataLoaded ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Presiona el botón "Filtrar" para cargar los horarios</p>
            <p className="text-sm">Configura los filtros que necesites y luego haz clic en el botón Filtrar</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHorarios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron horarios que coincidan con los filtros seleccionados.
              </div>
            ) : (
              horariosPorDia.map((diaData) => {
                const horariosDelDia = filteredHorarios.filter(
                  (h) => h.day_of_week === diaData.dayNumber,
                );
                if (horariosDelDia.length === 0) return null;

                return (
                  <div key={diaData.dia} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{diaData.dia}</h3>
                      <Badge variant="secondary" className="ml-2">
                        {horariosDelDia.length} {horariosDelDia.length === 1 ? "clase" : "clases"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {horariosDelDia.map((horario) => (
                        <Card
                          key={horario.id}
                          className="border border-border cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => onEditClick(horario)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">{horario.dia}</Badge>
                                <span className="text-sm font-medium text-blue-600">
                                  {horario.horaInicio} - {horario.horaFin}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <BookOpen className="w-4 h-4 text-green-500" />
                                  <span className="font-medium">{horario.materia}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Users className="w-4 h-4 text-blue-500" />
                                  <span>{horario.profesor}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Users className="w-4 h-4 text-purple-500" />
                                  <span>{horario.curso} - {horario.grupo}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <MapPin className="w-4 h-4 text-orange-500" />
                                  <span>{horario.aula}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
