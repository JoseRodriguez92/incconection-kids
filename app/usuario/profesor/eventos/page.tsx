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

const categoriaColors: { [key: string]: string } = {
  Académico: "bg-blue-500",
  Cultural: "bg-purple-500",
  Deportivo: "bg-green-500",
  Ceremonial: "bg-yellow-500",
  Administrativo: "bg-gray-500",
};

export default function EventosPage() {
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

        // Obtener período académico activo
        const { data: activePeriod, error: periodError } = await supabase
          .from("academic_period")
          .select("id, name, start_date, end_date")
          .eq("is_active", true)
          .maybeSingle();

        if (periodError) {
          console.error("Error al obtener período activo:", periodError);
          throw periodError;
        }

        if (activePeriod) {
          setPeriodoActivo({
            name: activePeriod.name,
            start_date: activePeriod.start_date,
            end_date: activePeriod.end_date,
          });

          // Obtener eventos del período activo
          const { data: eventsData, error: eventsError } = await supabase
            .from("events")
            .select("*")
            .eq("academic_period_id", activePeriod.id)
            .order("start_at", { ascending: true });

          if (eventsError) {
            console.error("Error al obtener eventos:", eventsError);
            throw eventsError;
          }

          setEvents(eventsData || []);
        }

        // Obtener aulas para mostrar en los detalles
        const { data: classroomsData, error: classroomsError } = await supabase
          .from("classrooms")
          .select("*");

        if (classroomsError) {
          console.error("Error al obtener aulas:", classroomsError);
        } else {
          setClassrooms(classroomsData || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error general al cargar datos:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryColor = (categoria?: string | null) => {
    return categoriaColors[categoria ?? ""] || "bg-gray-500";
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generar días del calendario
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.start_at);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsSheetOpen(true);
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
        element: "#tour-eventos-header",
        popover: {
          title: "📅 Eventos institucionales",
          description:
            "Aquí encuentras todos los eventos programados para el período académico activo: actos culturales, deportivos, ceremonias y más.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-eventos-periodo",
        popover: {
          title: "🟢 Período académico activo",
          description:
            "Los eventos que ves corresponden a este período. Solo se muestran eventos del período en curso.",
          side: "bottom",
        },
      },
    ];

    if (hasEvents) {
      steps.push(
        {
          element: "#tour-eventos-calendario",
          popover: {
            title: "🗓️ Calendario mensual",
            description:
              "Navega mes a mes con las flechas. Cada día muestra los eventos programados con un color según su categoría (Académico, Cultural, Deportivo, Ceremonial, Administrativo). El día de hoy aparece resaltado con un borde.",
            side: "top",
          },
        },
        {
          element: "#tour-eventos-navegacion",
          popover: {
            title: "◀ ▶ Navegar meses",
            description:
              "Usa estas flechas para moverte entre meses y revisar eventos pasados o futuros del período.",
            side: "bottom",
            align: "end",
          },
        },
      );
    }

    steps.push({
      element: "#tour-eventos-boton",
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

  return (
    <div className="min-w-0 space-y-6 p-6">
      {/* Header */}
      <div id="tour-eventos-header" className="space-y-2 relative z-1">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <Button
            id="tour-eventos-boton"
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={startTour}
          >
            <HelpCircle className="w-4 h-4" />
            Tour de la sección
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground">
            Calendario de eventos institucionales
          </p>
          {periodoActivo && (
            <>
              <span className="text-muted-foreground">•</span>
              <Badge id="tour-eventos-periodo" className="text-sm bg-green-600 hover:bg-green-700 text-white cursor-default">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-100"></span>
                  </span>
                  📅 {periodoActivo.name}
                </span>
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <CalendarIcon className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Cargando eventos...</p>
            <p className="text-sm text-muted-foreground">
              Obteniendo eventos del período académico activo
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-red-900">
                  Error al cargar los eventos
                </h3>
                <p className="text-sm text-red-700">{error.message}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Intentar nuevamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && events.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <CalendarIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  No hay eventos programados
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No hay eventos disponibles para el período académico activo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      {!loading && !error && events.length > 0 && (
        <Card id="tour-eventos-calendario">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span className="capitalize">{monthName}</span>
              </div>
              <div id="tour-eventos-navegacion" className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Encabezados de días */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm py-2 text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Días del calendario */}
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day &&
                  day.getDate() === new Date().getDate() &&
                  day.getMonth() === new Date().getMonth() &&
                  day.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border rounded-lg p-2 ${
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
                              onClick={() => handleEventClick(event)}
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

      {/* Event Details Modal */}
      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="max-w-7xl h-[90dvh] overflow-hidden p-0 gap-0">
          {selectedEvent && (
            <div className="flex flex-col h-full">
              {/* Imagen con título superpuesto - Grande en Desktop */}
              <div className="relative h-[60vh] md:h-[75dvh] w-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 overflow-hidden">
                {selectedEvent.image_url ? (
                  <>
                    <img
                      src={selectedEvent.image_url}
                      alt={selectedEvent.title}
                      className="w-auto h-full object-cover m-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
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

              {/* Contenido compacto - 15dvh en Desktop */}
              <div className="h-auto md:h-[25dvh] overflow-y-auto bg-background">
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {/* Descripción y detalles en línea horizontal para desktop */}
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

                    {/* Fecha */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                      <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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

                    {/* Horario */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Horario
                        </p>
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {selectedEvent.is_all_day ? (
                            "Todo el día"
                          ) : (
                            <>
                              {formatTime(selectedEvent.start_at)} -{" "}
                              {formatTime(selectedEvent.end_at)}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Ubicación */}
                    {selectedEvent.classroom_id && (
                      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                        <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
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
