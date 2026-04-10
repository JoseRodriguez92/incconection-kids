"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import "driver.js/dist/driver.css";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

type Event = Database["public"]["Tables"]["events"]["Row"];
type Classroom = Database["public"]["Tables"]["classrooms"]["Row"];

interface CalendarContentProps {
  language: string;
  activeStudent: any;
}

const categoriaColors: { [key: string]: string } = {
  Académico: "bg-blue-500",
  Cultural: "bg-purple-500",
  Deportivo: "bg-green-500",
  Ceremonial: "bg-yellow-500",
  Administrativo: "bg-gray-500",
};

export function CalendarContent({ activeStudent }: CalendarContentProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [periodoActivo, setPeriodoActivo] = useState<{
    name: string;
    start_date: string | null;
    end_date: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: activePeriod, error: periodError } = await supabase
          .from("academic_period")
          .select("id, name, start_date, end_date")
          .eq("is_active", true)
          .single();

        if (periodError) throw periodError;

        if (activePeriod) {
          setPeriodoActivo({
            name: activePeriod.name,
            start_date: activePeriod.start_date,
            end_date: activePeriod.end_date,
          });

          const { data: eventsData, error: eventsError } = await supabase
            .from("events")
            .select("*")
            .eq("academic_period_id", activePeriod.id)
            .order("start_at", { ascending: true });

          if (eventsError) throw eventsError;
          setEvents(eventsData || []);
        }

        const { data: classroomsData } = await supabase
          .from("classrooms")
          .select("*");
        setClassrooms(classroomsData || []);

        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryColor = (categoria?: string | null) =>
    categoriaColors[categoria ?? ""] || "bg-gray-500";

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++)
      days.push(new Date(year, month, day));
    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter((event) => {
      const d = new Date(event.start_at);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthName = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    const hasEvents = events.length > 0;

    const steps: any[] = [
      {
        element: "#tour-cal-header",
        popover: {
          title: "📅 Eventos del período",
          description:
            "Aquí puedes ver todos los eventos institucionales del período académico activo: actos culturales, deportivos, ceremonias y más.",
          side: "bottom",
          align: "start",
        },
      },
    ];

    if (hasEvents) {
      steps.push(
        {
          element: "#tour-cal-calendario",
          popover: {
            title: "🗓️ Calendario mensual",
            description:
              "Cada día muestra los eventos programados con un bloque de color según su categoría (Académico, Cultural, Deportivo, Ceremonial, Administrativo). El día de hoy aparece resaltado con un borde. Haz clic en cualquier evento para ver el detalle completo.",
            side: "top",
          },
        },
        {
          element: "#tour-cal-nav",
          popover: {
            title: "◀ ▶ Navegar meses",
            description:
              "Usa estas flechas para moverte entre meses y revisar eventos pasados o futuros dentro del período.",
            side: "bottom",
            align: "end",
          },
        },
      );
    }

    steps.push({
      element: "#tour-cal-boton",
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
  }, [events]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <CalendarIcon className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-lg font-medium">Cargando eventos...</p>
        <p className="text-sm text-muted-foreground">
          Obteniendo eventos del período académico activo
        </p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex flex-col items-center py-8 gap-3">
            <AlertCircle className="w-10 h-10 text-red-600" />
            <p className="font-semibold text-red-900">
              Error al cargar eventos
            </p>
            <p className="text-sm text-red-700">{error.message}</p>
            <Button
              variant="outline"
              className="border-red-300 text-red-700"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-0">
      {/* Header */}
      <div id="tour-cal-header" className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Eventos</h2>
          {periodoActivo && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white cursor-default">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-100" />
                </span>
                {periodoActivo.name}
              </span>
            </Badge>
          )}
        </div>
        <Button
          id="tour-cal-boton"
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={startTour}
        >
          <HelpCircle className="w-4 h-4" />
          Tour de la sección
        </Button>
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <CalendarIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="font-semibold">No hay eventos programados</p>
            <p className="text-sm text-muted-foreground">
              No hay eventos disponibles para el período académico activo.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Calendario */}
      {events.length > 0 && (
        <Card id="tour-cal-calendario">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <span className="capitalize">{monthName}</span>
              </div>
              <div id="tour-cal-nav" className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="text-center font-semibold text-sm py-2 text-muted-foreground"
                >
                  {d}
                </div>
              ))}
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day && day.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] border rounded-lg p-2 ${
                      day ? "bg-card" : "bg-muted/30"
                    } ${isToday ? "ring-2 ring-primary" : ""}`}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-sm font-medium mb-1 ${
                            isToday ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsSheetOpen(true);
                              }}
                              className={`${getCategoryColor(
                                event.category,
                              )} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal detalle evento */}
      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="max-w-7xl h-[90dvh] overflow-hidden p-0 gap-0">
          {selectedEvent && (
            <div className="flex flex-col h-full">
              <div className="relative h-[60vh] md:h-[75dvh] w-full bg-linear-to-br from-primary/30 via-primary/20 to-primary/10 overflow-hidden">
                {selectedEvent.image_url ? (
                  <>
                    <img
                      src={selectedEvent.image_url}
                      alt={selectedEvent.title}
                      className="w-auto h-full object-cover m-auto"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                    <div className="rounded-full bg-white/10 p-8 backdrop-blur-sm">
                      <BookOpen className="w-24 h-24 text-white/80" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="space-y-3">
                    {selectedEvent.category && (
                      <Badge
                        className={`${getCategoryColor(selectedEvent.category)} text-white border-0 shadow-lg px-4 py-1.5 text-sm`}
                      >
                        {selectedEvent.category}
                      </Badge>
                    )}
                    <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl leading-tight">
                      {selectedEvent.title}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="h-auto md:h-[25dvh] overflow-y-auto bg-background">
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {selectedEvent.description && (
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-xs text-muted-foreground mb-1">
                          Descripción
                        </p>
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {selectedEvent.description}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                      <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Fecha
                        </p>
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {formatDate(selectedEvent.start_at)}
                          {formatDate(selectedEvent.start_at) !==
                            formatDate(selectedEvent.end_at) && (
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              - {formatDate(selectedEvent.end_at)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Horario
                        </p>
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {selectedEvent.is_all_day ? (
                            "Todo el día"
                          ) : (
                            <>
                              {formatTime(selectedEvent.start_at)} –{" "}
                              {formatTime(selectedEvent.end_at)}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {selectedEvent.classroom_id && (
                      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                        <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                        <div>
                          <p className="text-xs text-purple-600 dark:text-purple-400">
                            Ubicación
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {classrooms.find(
                              (c) => c.id === selectedEvent.classroom_id,
                            )?.name || "Aula no encontrada"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
