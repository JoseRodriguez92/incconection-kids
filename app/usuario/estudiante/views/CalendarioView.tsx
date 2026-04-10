"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";
import { EventStore, type Event } from "@/Stores/eventStore";
import { ClassroomsStore } from "@/Stores/ClassroomsStore";
import { useStudentContextStore } from "@/Stores/studentContextStore";

const CATEGORY_COLORS: Record<string, string> = {
  Académico: "bg-blue-500",
  Cultural: "bg-purple-500",
  Deportivo: "bg-green-500",
  Ceremonial: "bg-yellow-500",
  Administrativo: "bg-gray-500",
};

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getCategoryColor(category?: string | null) {
  return CATEGORY_COLORS[category ?? ""] ?? "bg-gray-500";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CalendarioView() {
  const { activePeriod } = useStudentContextStore();
  const { events, loading, fetchEventsByPeriod } = EventStore();
  const { classrooms, fetchClassrooms } = ClassroomsStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activePeriod?.id) {
      fetchEventsByPeriod(activePeriod.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeriod?.id]);

  // ── Calendar helpers ──────────────────────────────────────────
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++)
      days.push(new Date(year, month, d));

    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter((e) => {
      const ed = new Date(e.start_at);
      return (
        ed.getDate() === date.getDate() &&
        ed.getMonth() === date.getMonth() &&
        ed.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthName = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const days = getDaysInMonth(currentDate);

  // Próximos eventos (desde hoy, ordenados)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .filter((e) => new Date(e.start_at) >= today)
    .sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1 relative z-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Calendario Académico
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-sm">
            Eventos del periodo académico actual
          </p>
          {activePeriod && (
            <>
              <span className="text-muted-foreground">•</span>
              <Badge className="text-sm bg-green-600 hover:bg-green-700 text-white">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-100" />
                  </span>
                  📅 {activePeriod.name}
                </span>
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando eventos...</span>
        </div>
      )}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* ── Calendario ── */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="capitalize">{monthName}</span>
                </div>
                <div className="flex items-center gap-2">
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
              {/* Días de la semana */}
              <div className="grid grid-cols-7 mb-2">
                {WEEK_DAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold py-2 text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid de días */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const today_ = isToday(day);

                  return (
                    <div
                      key={idx}
                      className={`min-h-[90px] rounded-lg p-1.5 border text-sm ${
                        day ? "bg-card" : "bg-transparent border-transparent"
                      } ${today_ ? "ring-2 ring-primary" : ""}`}
                    >
                      {day && (
                        <>
                          <div
                            className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                              today_
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {day.getDate()}
                          </div>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setIsSheetOpen(true);
                                }}
                                className={`${getCategoryColor(event.category)} text-white text-[10px] px-1 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity truncate`}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[10px] text-muted-foreground pl-1">
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

          {/* ── Panel lateral ── */}
          <div className="space-y-4">
            {/* Próximos eventos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarIcon className="h-4 w-4" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay eventos próximos
                  </p>
                ) : (
                  upcomingEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsSheetOpen(true);
                      }}
                      className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${getCategoryColor(event.category)}`}
                        />
                        <span className="text-sm font-medium line-clamp-1">
                          {event.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-4">
                        {formatDate(event.start_at)}
                      </p>
                      {event.category && (
                        <Badge variant="secondary" className="text-[10px] ml-4">
                          {event.category}
                        </Badge>
                      )}
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Leyenda */}
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Categorías</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${color}`} />
                    <span className="text-sm">{cat}</span>
                  </div>
                ))}
              </CardContent>
            </Card> */}
          </div>
        </div>
      )}

      {/* ── Modal detalle evento ── */}
      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="w-[80dvw] h-[80dvh] overflow-hidden p-0 gap-0">
          {selectedEvent && (
            <div className="flex flex-col h-full">
              {/* Imagen / banner */}
              <div className="relative h-[30%] w-full shrink-0 bg-gradient-to-br from-primary/30 via-primary/15 to-background overflow-hidden rounded-t-lg">
                {selectedEvent.image_url ? (
                  <img
                    src={selectedEvent.image_url}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CalendarIcon className="h-28 w-28 text-primary/15" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {selectedEvent.category && (
                    <Badge
                      className={`${getCategoryColor(selectedEvent.category)} text-white mb-3 text-xs px-3 py-1`}
                    >
                      {selectedEvent.category}
                    </Badge>
                  )}
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg leading-tight">
                    {selectedEvent.title}
                  </h3>
                </div>
              </div>

              {/* Contenido */}
              <div className="h-1/2 overflow-y-auto px-6 py-5 space-y-4">
                {selectedEvent.description && (
                  <div className="pb-3 border-b">
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* Fecha inicio */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <CalendarIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Inicio</p>
                      <p className="text-sm font-medium">
                        {formatDate(selectedEvent.start_at)}
                      </p>
                    </div>
                  </div>

                  {/* Fecha fin */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <CalendarIcon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fin</p>
                      <p className="text-sm font-medium">
                        {formatDate(selectedEvent.end_at)}
                      </p>
                    </div>
                  </div>

                  {/* Horario */}
                  {!selectedEvent.is_all_day && (
                    <div className="col-span-2 flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                      <Clock className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Horario</p>
                        <p className="text-sm font-medium">
                          {formatTime(selectedEvent.start_at)} —{" "}
                          {formatTime(selectedEvent.end_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.is_all_day && (
                    <div className="col-span-2 flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Clock className="w-4 h-4 text-green-600 shrink-0" />
                      <p className="text-sm font-medium">Todo el día</p>
                    </div>
                  )}

                  {/* Aula */}
                  {selectedEvent.classroom_id && (
                    <div className="col-span-2 flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                      <MapPin className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Lugar</p>
                        <p className="text-sm font-medium">
                          {classrooms.find(
                            (c) => c.id === selectedEvent.classroom_id,
                          )?.name ?? "Aula no encontrada"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
