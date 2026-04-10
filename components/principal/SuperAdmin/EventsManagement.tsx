"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { categoriaEventos } from "./data";
import {
  EventStore,
  type Event,
  type EventInsert,
  type EventUpdate,
} from "@/Stores/eventStore";
import { InstituteStore } from "@/Stores/InstituteStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { ClassroomsStore } from "@/Stores/ClassroomsStore";
import { toast } from "sonner";

type EventFormData = {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  classroomId: string;
  categoria: string;
  imagen: string;
};

export default function EventsManagement() {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    loading,
    fetchEventsByPeriod,
  } = EventStore();
  const { institute } = InstituteStore();
  const { fetchActivePeriodo, periodos, fetchPeriodos } = PeriodAcademicStore();
  const { classrooms, fetchClassrooms } = ClassroomsStore();

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [editEventData, setEditEventData] = useState<Event | null>(null);

  const [eventForm, setEventForm] = useState<EventFormData>({
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "",
    horaFin: "",
    classroomId: "",
    categoria: "",
    imagen: "",
  });

  // Cargar periodos académicos y aulas
  useEffect(() => {
    fetchPeriodos();
    fetchClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar eventos del periodo académico activo
  useEffect(() => {
    const loadActiveEvents = async () => {
      try {
        const activePeriod = await fetchActivePeriodo();
        if (activePeriod?.id) {
          setSelectedPeriodId(activePeriod.id);
          await fetchEventsByPeriod(activePeriod.id);
        }
      } catch (error) {
        console.error("Error al cargar eventos del periodo activo:", error);
        toast.error("Error al cargar eventos");
      }
    };
    loadActiveEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryColor = (categoria?: string) => {
    const colors: { [key: string]: string } = {
      Académico: "bg-blue-500",
      Cultural: "bg-purple-500",
      Deportivo: "bg-green-500",
      Ceremonial: "bg-yellow-500",
      Administrativo: "bg-gray-500",
    };
    return colors[categoria ?? ""] || "bg-gray-500";
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

  const handleCreateEvent = async () => {
    if (
      !eventForm.titulo ||
      !eventForm.categoria ||
      !eventForm.fechaInicio ||
      !eventForm.fechaFin
    ) {
      toast.error("Campos requeridos", {
        description:
          "Por favor completa al menos el título, categoría, fecha de inicio y fecha de fin",
      });
      return;
    }

    if (!institute?.id) {
      toast.error("Error", {
        description: "No se encontró el ID del instituto",
      });
      return;
    }

    const instituteId = institute.id;

    if (!selectedPeriodId) {
      toast.error("Error", {
        description: "Por favor selecciona un periodo académico",
      });
      return;
    }

    try {
      const startDateTime = eventForm.horaInicio
        ? new Date(
            `${eventForm.fechaInicio}T${eventForm.horaInicio}:00`,
          ).toISOString()
        : new Date(`${eventForm.fechaInicio}T00:00:00`).toISOString();

      const endDateTime = eventForm.horaFin
        ? new Date(
            `${eventForm.fechaFin}T${eventForm.horaFin}:00`,
          ).toISOString()
        : new Date(`${eventForm.fechaFin}T23:59:59`).toISOString();

      const newEvent: EventInsert = {
        institute_id: instituteId,
        academic_period_id: selectedPeriodId,
        title: eventForm.titulo,
        description: eventForm.descripcion || null,
        category: eventForm.categoria || null,
        classroom_id: eventForm.classroomId || null,
        start_at: startDateTime,
        end_at: endDateTime,
        is_all_day: !eventForm.horaInicio && !eventForm.horaFin,
        image_url: eventForm.imagen || null,
      };

      await addEvent(newEvent);

      setEventForm({
        titulo: "",
        descripcion: "",
        fechaInicio: "",
        fechaFin: "",
        horaInicio: "",
        horaFin: "",
        classroomId: "",
        categoria: "",
        imagen: "",
      });

      setIsCreateEventOpen(false);

      toast.success("Evento creado exitosamente");
    } catch (error) {
      console.error("Error al crear evento:", error);
      toast.error("Error al crear el evento");
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      const updates: EventUpdate = {
        title: selectedEvent.title,
        description: selectedEvent.description,
        category: selectedEvent.category,
        classroom_id: selectedEvent.classroom_id,
        start_at: selectedEvent.start_at,
        end_at: selectedEvent.end_at,
        image_url: selectedEvent.image_url,
      };

      await updateEvent(selectedEvent.id, updates);
      setIsSheetOpen(false);
      toast.success("Evento actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      toast.error("Error al actualizar el evento");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await deleteEvent(selectedEvent.id);
      setIsSheetOpen(false);
      toast.success("Evento eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      toast.error("Error al eliminar el evento");
    }
  };

  const handleOpenEditModal = () => {
    if (selectedEvent) {
      setEditEventData({ ...selectedEvent });
      setIsEditEventOpen(true);
      setIsSheetOpen(false);
    }
  };

  const handleSaveEditedEvent = async () => {
    if (!editEventData) return;

    try {
      const updates: EventUpdate = {
        title: editEventData.title,
        description: editEventData.description,
        category: editEventData.category,
        classroom_id: editEventData.classroom_id,
        academic_period_id: editEventData.academic_period_id,
        start_at: editEventData.start_at,
        end_at: editEventData.end_at,
        is_all_day: editEventData.is_all_day,
        image_url: editEventData.image_url,
      };

      await updateEvent(editEventData.id, updates);
      setIsEditEventOpen(false);
      setEditEventData(null);
      toast.success("Evento actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      toast.error("Error al actualizar el evento");
    }
  };

  const monthName = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Gestión de Eventos
        </h2>
        <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nuevo Evento</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Evento</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Título del Evento</label>
                <Input
                  value={eventForm.titulo}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, titulo: e.target.value })
                  }
                  placeholder="Ej: Reunión de Padres"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={eventForm.descripcion}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, descripcion: e.target.value })
                  }
                  placeholder="Descripción detallada del evento"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fecha de Inicio</label>
                <Input
                  type="date"
                  value={eventForm.fechaInicio}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, fechaInicio: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fecha de Fin</label>
                <Input
                  type="date"
                  value={eventForm.fechaFin}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, fechaFin: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Hora de Inicio</label>
                <Input
                  type="time"
                  value={eventForm.horaInicio}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, horaInicio: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Hora de Fin</label>
                <Input
                  type="time"
                  value={eventForm.horaFin}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, horaFin: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Aula</label>
                <select
                  value={eventForm.classroomId}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, classroomId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Seleccionar aula (opcional)</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Periodo Académico</label>
                <select
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Seleccionar periodo</option>
                  {periodos.map((periodo) => (
                    <option key={periodo.id} value={periodo.id}>
                      {periodo.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Categoría</label>
                <select
                  value={eventForm.categoria}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, categoria: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Seleccionar categoría</option>
                  {categoriaEventos.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">
                  URL de Imagen (opcional)
                </label>
                <Input
                  value={eventForm.imagen}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, imagen: e.target.value })
                  }
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div className="col-span-2 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateEventOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateEvent} disabled={loading}>
                  {loading ? "Creando..." : "Crear Evento"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span className="capitalize">{monthName}</span>
            </div>
            <div className="flex items-center space-x-2">
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
                              event.category || undefined,
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

      {/* Side Panel */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-0">
          {selectedEvent && (
            <div className="h-full flex flex-col">
              {/* Imagen con título superpuesto */}
              <div className="relative h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5">
                <img
                  src={
                    selectedEvent.image_url ||
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60"
                  }
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <Badge
                    className={`${getCategoryColor(selectedEvent.category || undefined)} text-white mb-2`}
                  >
                    {selectedEvent.category}
                  </Badge>
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                    {selectedEvent.title}
                  </h3>
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 px-5 py-4 space-y-4">
                {/* Descripción */}
                {selectedEvent.description && (
                  <div className="pb-3 border-b">
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {/* Información en Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Fecha inicio */}
                  <div className="flex items-start space-x-2 p-3 rounded-lg bg-muted/50">
                    <CalendarIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Inicio</p>
                      <p className="text-sm font-medium truncate">
                        {formatDate(selectedEvent.start_at)}
                      </p>
                    </div>
                  </div>

                  {/* Fecha fin */}
                  <div className="flex items-start space-x-2 p-3 rounded-lg bg-muted/50">
                    <CalendarIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Fin</p>
                      <p className="text-sm font-medium truncate">
                        {formatDate(selectedEvent.end_at)}
                      </p>
                    </div>
                  </div>

                  {/* Horario */}
                  <div className="flex items-start space-x-2 p-3 rounded-lg bg-muted/50 col-span-2">
                    <Clock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Horario</p>
                      <p className="text-sm font-medium">
                        {formatTime(selectedEvent.start_at)} -{" "}
                        {formatTime(selectedEvent.end_at)}
                      </p>
                    </div>
                  </div>

                  {/* Aula */}
                  {selectedEvent.classroom_id && (
                    <div className="flex items-start space-x-2 p-3 rounded-lg bg-muted/50 col-span-2">
                      <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Aula</p>
                        <p className="text-sm font-medium">
                          {classrooms.find(
                            (c) => c.id === selectedEvent.classroom_id,
                          )?.name || "Aula no encontrada"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones fijas en el fondo */}
              <div className="border-t p-4 bg-background">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleOpenEditModal}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteEvent}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de Edición de Evento */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          {editEventData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Título */}
                <div className="col-span-2">
                  <label className="text-sm font-medium">Título *</label>
                  <Input
                    value={editEventData.title || ""}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        title: e.target.value,
                      })
                    }
                    placeholder="Título del evento"
                  />
                </div>

                {/* Descripción */}
                <div className="col-span-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea
                    value={editEventData.description || ""}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descripción del evento"
                    rows={3}
                  />
                </div>

                {/* Fecha Inicio */}
                <div>
                  <label className="text-sm font-medium">Fecha Inicio *</label>
                  <Input
                    type="date"
                    value={editEventData.start_at?.split("T")[0] || ""}
                    onChange={(e) => {
                      const currentTime =
                        editEventData.start_at?.split("T")[1] || "00:00:00";
                      setEditEventData({
                        ...editEventData,
                        start_at: `${e.target.value}T${currentTime}`,
                      });
                    }}
                  />
                </div>

                {/* Hora Inicio */}
                <div>
                  <label className="text-sm font-medium">Hora Inicio</label>
                  <Input
                    type="time"
                    value={
                      editEventData.start_at?.split("T")[1]?.substring(0, 5) ||
                      ""
                    }
                    onChange={(e) => {
                      const currentDate =
                        editEventData.start_at?.split("T")[0] ||
                        new Date().toISOString().split("T")[0];
                      setEditEventData({
                        ...editEventData,
                        start_at: `${currentDate}T${e.target.value}:00`,
                        is_all_day: false,
                      });
                    }}
                  />
                </div>

                {/* Fecha Fin */}
                <div>
                  <label className="text-sm font-medium">Fecha Fin *</label>
                  <Input
                    type="date"
                    value={editEventData.end_at?.split("T")[0] || ""}
                    onChange={(e) => {
                      const currentTime =
                        editEventData.end_at?.split("T")[1] || "23:59:59";
                      setEditEventData({
                        ...editEventData,
                        end_at: `${e.target.value}T${currentTime}`,
                      });
                    }}
                  />
                </div>

                {/* Hora Fin */}
                <div>
                  <label className="text-sm font-medium">Hora Fin</label>
                  <Input
                    type="time"
                    value={
                      editEventData.end_at?.split("T")[1]?.substring(0, 5) || ""
                    }
                    onChange={(e) => {
                      const currentDate =
                        editEventData.end_at?.split("T")[0] ||
                        new Date().toISOString().split("T")[0];
                      setEditEventData({
                        ...editEventData,
                        end_at: `${currentDate}T${e.target.value}:00`,
                        is_all_day: false,
                      });
                    }}
                  />
                </div>

                {/* Aula */}
                <div>
                  <label className="text-sm font-medium">Aula</label>
                  <select
                    value={editEventData.classroom_id || ""}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        classroom_id: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Sin aula asignada</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Periodo Académico */}
                <div>
                  <label className="text-sm font-medium">
                    Periodo Académico
                  </label>
                  <select
                    value={editEventData.academic_period_id || ""}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        academic_period_id: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Sin periodo académico</option>
                    {periodos.map((periodo) => (
                      <option key={periodo.id} value={periodo.id}>
                        {periodo.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categoría */}
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <select
                    value={editEventData.category || ""}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        category: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categoriaEventos.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URL Imagen */}
                <div>
                  <label className="text-sm font-medium">URL Imagen</label>
                  <Input
                    value={editEventData.image_url || ""}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        image_url: e.target.value || null,
                      })
                    }
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                {/* Todo el día */}
                <div className="col-span-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_all_day"
                    checked={editEventData.is_all_day || false}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        is_all_day: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_all_day" className="text-sm font-medium">
                    Evento de todo el día
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditEventOpen(false);
                    setEditEventData(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEditedEvent}
                  disabled={
                    loading || !editEventData.title || !editEventData.start_at
                  }
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
