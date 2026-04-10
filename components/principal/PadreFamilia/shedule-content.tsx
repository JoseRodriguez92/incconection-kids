"use client";

import { useRef, useLayoutEffect, useMemo, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, BookOpen, User, MapPin, HelpCircle } from "lucide-react";
import "driver.js/dist/driver.css";
import {
  useStudentSchedule,
  type ScheduleItem,
} from "@/components/principal/PadreFamilia/hooks/useStudentSchedule";
import { ClaseDetallePadre } from "@/components/principal/PadreFamilia/ClaseDetallePadre";

interface ScheduleContentProps {
  language: string;
  activeStudent: any;
}

// ── Constantes del calendario ────────────────────────────────────────────────
const DAYS = [
  { number: 1, label: "Día 1" },
  { number: 2, label: "Día 2" },
  { number: 3, label: "Día 3" },
  { number: 4, label: "Día 4" },
  { number: 5, label: "Día 5" },
];

// Rango visible: 6 AM → 21 AM (15 franjas de 1 hora)
const START_HOUR = 6;
const TOTAL_HOURS = 9;
const HOUR_HEIGHT = 80; // px por hora

const HOURS = Array.from(
  { length: TOTAL_HOURS },
  (_, i) => `${(START_HOUR + i).toString().padStart(2, "0")}:00`,
);

const SUBJECT_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-yellow-100 border-yellow-300 text-yellow-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
  "bg-orange-100 border-orange-300 text-orange-900",
  "bg-teal-100 border-teal-300 text-teal-900",
];

// ── Componente ───────────────────────────────────────────────────────────────
export function ScheduleContent({ activeStudent }: ScheduleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { schedule, loading } = useStudentSchedule(activeStudent?.id ?? null);
  const [selectedClass, setSelectedClass] = useState<ScheduleItem | null>(null);

  // Animar columnas cuando los datos ya estén listos
  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".sched-col",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: "power2.out" },
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  // Mapa subjectId → color (estable entre renders)
  const colorMap = useMemo(() => {
    const uniqueIds = [...new Set(schedule.map((s) => s.subjectId))];
    return Object.fromEntries(
      uniqueIds.map((id, i) => [id, SUBJECT_COLORS[i % SUBJECT_COLORS.length]]),
    );
  }, [schedule]);

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    const hasClasses = schedule.length > 0;

    const steps: any[] = [
      {
        element: "#tour-sched-header",
        popover: {
          title: "🗓️ Horario semanal",
          description:
            "Aquí puedes ver el horario completo de tu hijo/a para el período académico activo, organizado por día y hora.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-sched-grid",
        popover: {
          title: "📆 Cuadrícula de horario",
          description:
            "Cada columna representa un día (Día 1 al Día 5) y las filas representan las horas del día. Los bloques de color son las clases asignadas.",
          side: "top",
        },
      },
    ];

    if (hasClasses) {
      steps.push({
        element: "#tour-sched-bloque",
        popover: {
          title: "📚 Bloque de clase",
          description:
            "Cada bloque muestra la materia, el profesor y el aula (dependiendo del espacio disponible). Haz clic en cualquier bloque para ver todos los detalles de esa clase.",
          side: "right",
        },
      });
    }

    steps.push({
      element: "#tour-sched-boton",
      popover: {
        title: "❓ Tour de ayuda",
        description:
          "Puedes relanzar este recorrido en cualquier momento haciendo clic aquí.",
        side: "bottom",
        align: "end",
      },
    });

    const driverObj = driver({
      animate: true,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "¡Entendido!",
      progressText: "{{current}} de {{total}}",
      steps,
    });
    driverObj.drive();
  }, [schedule]);

  // ── Vista detalle de clase ───────────────────────────────────────────────
  if (selectedClass) {
    return (
      <ClaseDetallePadre
        clase={selectedClass}
        onVolver={() => setSelectedClass(null)}
        studentConditions={activeStudent?.conditions ?? []}
        studentId={activeStudent?.id}
      />
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  // ── Sin clases ───────────────────────────────────────────────────────────
  if (schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground p-6">
        <CalendarClock className="w-12 h-12 opacity-30" />
        <p className="text-lg font-medium">Sin horario asignado</p>
        <p className="text-sm text-center">
          {activeStudent.firstName} no tiene clases registradas en el período
          activo.
        </p>
      </div>
    );
  }

  // ── Calendario ───────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-0"
      ref={containerRef}
    >
      {/* Header con botón de tour */}
      <div id="tour-sched-header" className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Horario Semanal</h2>
          <Badge variant="secondary" className="text-xs">
            {schedule.length} {schedule.length === 1 ? "clase" : "clases"}
          </Badge>
        </div>
        <Button
          id="tour-sched-boton"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={startTour}
        >
          <HelpCircle className="w-4 h-4" />
          Tour de la sección
        </Button>
      </div>

      {/* Vista de calendario semanal */}
      <Card id="tour-sched-grid">
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            {/* Grid: columna horas + 5 días */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `56px repeat(5, 1fr)`,
                gap: "6px",
                minWidth: "680px",
              }}
            >
              {/* Fila de encabezados */}
              <div className="h-10" /> {/* esquina vacía */}
              {DAYS.map((day) => (
                <div
                  key={day.number}
                  className="sched-col h-10 flex items-center justify-center font-semibold text-sm bg-muted rounded"
                >
                  {day.label}
                </div>
              ))}
              {/* Columna de horas */}
              <div>
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="flex items-start justify-end pr-2 pt-1 text-[11px] text-muted-foreground border-t border-border/30"
                  >
                    {hour}
                  </div>
                ))}
              </div>
              {/* Columnas de días */}
              {DAYS.map((day, dayIdx) => {
                const dayItems = schedule.filter(
                  (s) => s.dayOfWeek === day.number,
                );

                return (
                  <div key={day.number} className="sched-col relative">
                    {/* Líneas de horas de fondo */}
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        style={{ height: `${HOUR_HEIGHT}px` }}
                        className="border-t border-border/30"
                      />
                    ))}

                    {/* Bloques de clases */}
                    {dayItems.map((item, itemIdx) => {
                      const [sh, sm] = item.startTime.split(":").map(Number);
                      const [eh, em] = item.endTime.split(":").map(Number);

                      const top =
                        (sh - START_HOUR) * HOUR_HEIGHT +
                        (sm / 60) * HOUR_HEIGHT;
                      const height =
                        (((eh - sh) * 60 + (em - sm)) / 60) * HOUR_HEIGHT;

                      const colorClass =
                        colorMap[item.subjectId] ?? SUBJECT_COLORS[0];

                      return (
                        <div
                          key={item.id}
                          id={dayIdx === 0 && itemIdx === 0 ? "tour-sched-bloque" : undefined}
                          className={`absolute inset-x-0.5 rounded border-2 p-1.5 overflow-hidden ${colorClass} cursor-pointer hover:brightness-95 transition-[filter] active:scale-[0.98]`}
                          style={{
                            top: `${top}px`,
                            height: `${Math.max(height, 28)}px`,
                            zIndex: 10,
                          }}
                          title={`${item.subject}\n${item.teacher}\n${item.classroom}\n${item.startTime} – ${item.endTime}`}
                          onClick={() => setSelectedClass(item)}
                        >
                          {/* Materia (siempre visible) */}
                          <div className="flex items-center gap-1 text-[11px] font-semibold leading-tight truncate">
                            <BookOpen className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.subject}</span>
                          </div>

                          {/* Profesor (si hay espacio) */}
                          {height > 50 && (
                            <div className="flex items-center gap-1 text-[10px] opacity-80 truncate mt-0.5">
                              <User className="w-3 h-3 shrink-0" />
                              <span className="truncate">{item.teacher}</span>
                            </div>
                          )}

                          {/* Aula (si hay más espacio) */}
                          {height > 72 && (
                            <div className="flex items-center gap-1 text-[10px] opacity-70 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{item.classroom}</span>
                            </div>
                          )}

                          {/* Hora (al fondo si hay suficiente alto) */}
                          {height > 56 && (
                            <div className="text-[10px] opacity-60 absolute bottom-1 left-1.5">
                              {item.startTime} – {item.endTime}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
