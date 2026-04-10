"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Filter } from "lucide-react";
import { HORAS_DIA, HORA_INICIO, ALTURA_HORA_PX } from "./constants";
import type { DayWithSchedules, ScheduleWithDetails } from "./types";

type Props = {
  dataLoaded: boolean;
  horariosPorDia: DayWithSchedules[];
  getColorForSubject: (subjectId: string | undefined) => string;
  onEditClick: (horario: ScheduleWithDetails) => void;
  onCloneClick: (horario: ScheduleWithDetails) => void;
};

function parseMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function SchedulesCalendarView({
  dataLoaded,
  horariosPorDia,
  getColorForSubject,
  onEditClick,
  onCloneClick,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Horario Semanal</span>
          <Badge variant="secondary" className="ml-2">Vista de Calendario</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!dataLoaded ? (
          <div className="text-center py-12 text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Presiona el botón "Filtrar" para cargar los horarios</p>
            <p className="text-sm">Configura los filtros que necesites y luego haz clic en el botón Filtrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 min-w-[900px]">
              {/* Columna de horas */}
              <div className="col-span-1">
                <div className="h-12 flex items-center justify-center font-semibold text-sm bg-muted rounded">
                  Hora
                </div>
                {HORAS_DIA.map((hora) => (
                  <div
                    key={hora}
                    className="flex items-center justify-center text-sm font-medium text-muted-foreground border-t"
                    style={{ height: `${ALTURA_HORA_PX}px` }}
                  >
                    {hora}
                  </div>
                ))}
              </div>

              {/* Columnas de días */}
              {horariosPorDia.map((diaData) => (
                <div key={diaData.dia} className="col-span-1 relative">
                  <div className="h-12 flex items-center justify-center font-semibold text-sm bg-muted rounded mb-2">
                    {diaData.dia}
                  </div>
                  <div className="relative">
                    {HORAS_DIA.map((hora) => (
                      <div
                        key={hora}
                        className="border-t border-border/50"
                        style={{ height: `${ALTURA_HORA_PX}px` }}
                      />
                    ))}

                    {/* Bloques de horarios con detección de superposición */}
                    {resolveOverlaps(diaData.horarios).map((horarioData) => {
                      const startMinutes = parseMinutes(horarioData.horaInicio);
                      const endMinutes = parseMinutes(horarioData.horaFin);
                      const topPosition = (startMinutes - HORA_INICIO * 60) * (ALTURA_HORA_PX / 60);
                      const height = (endMinutes - startMinutes) * (ALTURA_HORA_PX / 60);
                      const colorClass = getColorForSubject(horarioData.subject_id);
                      const widthPct = horarioData.totalEnGrupo > 1 ? 100 / horarioData.totalEnGrupo : 100;
                      const leftPct = horarioData.totalEnGrupo > 1 ? widthPct * horarioData.posicionEnGrupo : 0;

                      return (
                        <div
                          key={horarioData.id}
                          className={`absolute rounded-lg border-2 p-2 ${colorClass} overflow-hidden cursor-pointer hover:opacity-100 hover:z-50 hover:scale-105 transition-all duration-200`}
                          style={{
                            top: `${topPosition}px`,
                            height: `${height}px`,
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            zIndex: 10,
                          }}
                          onClick={(e) => { e.stopPropagation(); onEditClick(horarioData); }}
                          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onCloneClick(horarioData); }}
                          title={`${horarioData.materia} - ${horarioData.curso} ${horarioData.grupo}\nClic izquierdo: Editar | Clic derecho: Clonar`}
                        >
                          <div className="text-xs font-semibold truncate">
                            📚 {horarioData.materia} - {horarioData.curso} {horarioData.grupo}
                          </div>
                          <div className="text-xs truncate">
                            🕐 {horarioData.horaInicio.substring(0, 5)} - {horarioData.horaFin.substring(0, 5)} | {horarioData.profesor}
                          </div>
                          <div className="text-xs truncate opacity-70">
                            📍 {horarioData.aula}
                          </div>
                          {horarioData.superpuestos > 0 && (
                            <div className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                              {horarioData.totalEnGrupo}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type HorarioWithOverlap = ScheduleWithDetails & {
  superpuestos: number;
  posicionEnGrupo: number;
  totalEnGrupo: number;
};

function resolveOverlaps(horarios: ScheduleWithDetails[]): HorarioWithOverlap[] {
  return horarios.map((horario, index) => {
    const start = parseMinutes(horario.horaInicio);
    const end = parseMinutes(horario.horaFin);

    const superpuestos = horarios.filter((otro, otroIndex) => {
      if (index === otroIndex) return false;
      const oStart = parseMinutes(otro.horaInicio);
      const oEnd = parseMinutes(otro.horaFin);
      return start < oEnd && end > oStart;
    });

    let posicionEnGrupo = 0;
    for (let i = 0; i < index; i++) {
      const otro = horarios[i];
      const oStart = parseMinutes(otro.horaInicio);
      const oEnd = parseMinutes(otro.horaFin);
      if (start < oEnd && end > oStart) posicionEnGrupo++;
    }

    return {
      ...horario,
      superpuestos: superpuestos.length,
      posicionEnGrupo,
      totalEnGrupo: superpuestos.length + 1,
    };
  });
}
