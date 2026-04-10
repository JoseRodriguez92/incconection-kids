"use client";

import {
  BookOpen,
  AlertCircle,
  LayoutGrid,
  List,
  Calendar,
  DoorOpen,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClasesEstudiante } from "./hooks/useClasesEstudiante";
import { ClaseCard } from "./components/ClaseCard";
import { ClaseDetalle } from "./components/ClaseDetalle";
import { useStudentContextStore } from "@/Stores/studentContextStore";
import { useStudentViewStore } from "@/Stores/studentViewStore";
import type { ClaseEstudiante } from "./hooks/useClasesEstudiante";

export function CursosView() {
  const { activePeriod } = useStudentContextStore();
  const { pendingClaseId, clearPendingClase } = useStudentViewStore();
  const { clases, loading, error } = useClasesEstudiante();
  const [claseSeleccionada, setClaseSeleccionada] = useState<string | null>(
    null,
  );

  // Auto-seleccionar clase si viene navegación desde el dashboard
  useEffect(() => {
    if (pendingClaseId && !loading && clases.length > 0) {
      setClaseSeleccionada(pendingClaseId);
      clearPendingClase();
    }
  }, [pendingClaseId, loading, clases]);
  const [vista, setVista] = useState<"cards" | "lista" | "calendario">("cards");
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  const term = busqueda.toLowerCase().trim();
  const clasesFiltradas = clases.filter(
    (c) =>
      !term ||
      (c.subject?.name ?? c.name).toLowerCase().includes(term) ||
      c.teacher_enrolled?.profiles?.full_name?.toLowerCase().includes(term) ||
      c.classroom?.name?.toLowerCase().includes(term),
  );

  const ITEMS_CARDS = 6;
  const ITEMS_LISTA = 8;
  const itemsPorPagina = vista === "cards" ? ITEMS_CARDS : ITEMS_LISTA;
  const totalPaginas = Math.max(
    1,
    Math.ceil(clasesFiltradas.length / itemsPorPagina),
  );
  const clasesPaginadas = clasesFiltradas.slice(
    (pagina - 1) * itemsPorPagina,
    pagina * itemsPorPagina,
  );

  const cambiarVista = (v: "cards" | "lista" | "calendario") => {
    setVista(v);
    setPagina(1);
  };

  const cambiarBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPagina(1);
  };

  // Vista detalle
  if (claseSeleccionada) {
    const clase = clases.find((c) => c.id === claseSeleccionada);

    if (!clase) {
      return (
        <div className="flex-1 p-6 text-center">
          <p className="text-muted-foreground">Clase no encontrada</p>
          <button
            onClick={() => setClaseSeleccionada(null)}
            className="mt-4 text-primary hover:underline"
          >
            Volver a Mis Clases
          </button>
        </div>
      );
    }

    return (
      <ClaseDetalle clase={clase} onVolver={() => setClaseSeleccionada(null)} />
    );
  }

  // Vista principal
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-1">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Mis Clases</h1>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground text-sm">
              Clases del periodo académico actual
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

        {/* Buscador + Toggle vista */}
        {!loading && !error && clases.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative bg-white border rounded-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar clase..."
                value={busqueda}
                onChange={(e) => cambiarBusqueda(e.target.value)}
                className="pl-8 h-9 w-44 text-sm"
              />
            </div>
            <div className="flex border rounded-md overflow-hidden shrink-0">
              <button
                onClick={() => cambiarVista("cards")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                  vista === "cards"
                    ? "bg-[#343c63] text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => cambiarVista("lista")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                  vista === "lista"
                    ? "bg-[#343c63] text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                onClick={() => cambiarVista("calendario")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                  vista === "calendario"
                    ? "bg-[#343c63] text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendario</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <BookOpen className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Cargando tus clases...</p>
            <p className="text-sm text-muted-foreground">
              Obteniendo la información del periodo académico activo
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-red-900">
                  Error al cargar las clases
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

      {/* Empty */}
      {!loading && !error && clases.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  No hay clases disponibles
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No tienes clases asignadas en el periodo académico activo.
                  Contacta con el administrador si crees que esto es un error.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sin resultados de búsqueda */}
      {!loading &&
        !error &&
        clases.length > 0 &&
        clasesFiltradas.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No se encontraron clases para &quot;{busqueda}&quot;
          </p>
        )}

      {/* ── Vista Cards ── */}
      {!loading &&
        !error &&
        clasesFiltradas.length > 0 &&
        vista === "cards" && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clasesPaginadas.map((clase) => (
                <ClaseCard
                  key={clase.id}
                  clase={clase}
                  onSelect={setClaseSeleccionada}
                />
              ))}
            </div>
            <Paginacion
              pagina={pagina}
              total={totalPaginas}
              onChange={setPagina}
            />
          </>
        )}

      {/* ── Vista Lista ── */}
      {!loading &&
        !error &&
        clasesFiltradas.length > 0 &&
        vista === "lista" && (
          <>
            <div className="space-y-3 relative z-1">
              {clasesPaginadas.map((clase) => (
                <ClaseListaItem
                  key={clase.id}
                  clase={clase}
                  onSelect={setClaseSeleccionada}
                />
              ))}
            </div>
            <Paginacion
              pagina={pagina}
              total={totalPaginas}
              onChange={setPagina}
            />
          </>
        )}

      {/* ── Vista Calendario ── */}
      {!loading && !error && vista === "calendario" && (
        <CalendarioSemanal clases={clases} onSelect={setClaseSeleccionada} />
      )}
    </div>
  );
}

/* ── Componente fila de lista ── */
function ClaseListaItem({
  clase,
  onSelect,
}: {
  clase: ClaseEstudiante;
  onSelect: (id: string) => void;
}) {
  const subjectName = clase.subject?.name ?? clase.name;
  const subjectCode = clase.subject?.code;
  const teacherName =
    clase.teacher_enrolled?.profiles?.full_name ?? "Docente no asignado";
  const teacherAvatar = clase.teacher_enrolled?.profiles?.avatar_url;
  const teacherInitials = teacherName
    .split(" ")
    .map((n: any) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-4 p-4 border-white rounded-xl bg-white/40 hover:shadow-sm transition-shadow relative z-1">
      {/* Icono */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <BookOpen className="h-5 w-5 text-primary" />
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">{subjectName}</span>
          {subjectCode && (
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
              {subjectCode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Docente */}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Avatar className="h-4 w-4">
              {teacherAvatar && <AvatarImage src={teacherAvatar} />}
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                {teacherInitials}
              </AvatarFallback>
            </Avatar>
            {teacherName}
          </span>

          {/* Aula */}
          {clase.classroom?.name && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <DoorOpen className="h-3 w-3" />
              {clase.classroom.name}
            </span>
          )}
        </div>
      </div>

      {/* Horarios */}
      {clase.group_class_schedule && clase.group_class_schedule.length > 0 && (
        <div className="hidden md:flex items-center gap-1.5 flex-wrap shrink-0">
          {clase.group_class_schedule.map((s: any, i: any) => (
            <Badge key={i} variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {`Día ${s.day_of_week}`} {s.start_time?.substring(0, 5)}
            </Badge>
          ))}
        </div>
      )}

      {/* Acción */}
      <Button size="sm" className="shrink-0" onClick={() => onSelect(clase.id)}>
        Acceder
      </Button>
    </div>
  );
}

/* ── Calendario Semanal ── */
const COLORES_CLASE = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-yellow-100 border-yellow-300 text-yellow-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
  "bg-orange-100 border-orange-300 text-orange-900",
  "bg-teal-100 border-teal-300 text-teal-900",
];

function CalendarioSemanal({
  clases,
  onSelect,
}: {
  clases: ClaseEstudiante[];
  onSelect: (id: string) => void;
}) {
  // Aplanar todos los horarios de todas las clases
  const entries = clases.flatMap((clase, claseIdx) =>
    (clase.group_class_schedule ?? []).map((s: any) => ({
      claseId: clase.id,
      subjectName: clase.subject?.name ?? clase.name,
      teacherName:
        clase.teacher_enrolled?.profiles?.full_name ?? "Docente no asignado",
      aula: clase.classroom?.name ?? "",
      day_of_week: s.day_of_week,
      start_time: s.start_time ?? "00:00:00",
      end_time: s.end_time ?? "00:00:00",
      colorClass: COLORES_CLASE[claseIdx % COLORES_CLASE.length],
    })),
  );

  // Días con actividad (mín 1, máx del mayor day_of_week)
  const maxDay =
    entries.length > 0 ? Math.max(...entries.map((e) => e.day_of_week)) : 5;
  const days = Array.from({ length: Math.max(maxDay, 5) }, (_, i) => i + 1);

  // Franja horaria 6:00 – hasta donde lleguen las clases (mín 14:00)
  const allEndHours = entries.map((e) => parseInt(e.end_time.split(":")[0]));
  const maxHour = allEndHours.length
    ? Math.max(14, Math.max(...allEndHours) + 1)
    : 14;
  const horasDelDia = Array.from(
    { length: maxHour - 6 + 1 },
    (_, i) => `${(i + 6).toString().padStart(2, "0")}:00`,
  );

  if (clases.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Calendar className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay clases para mostrar en el calendario
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-6">
        <div className="overflow-x-auto">
          <div
            className="grid gap-2 min-w-[700px]"
            style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}
          >
            {/* Cabecera hora */}
            <div className="h-10 flex items-center justify-center text-xs font-semibold text-muted-foreground bg-muted rounded">
              Hora
            </div>
            {/* Cabeceras de días */}
            {days.map((d) => (
              <div
                key={d}
                className="h-10 flex items-center justify-center text-sm font-semibold bg-muted rounded"
              >
                Día {d}
              </div>
            ))}

            {/* Columna horas */}
            <div>
              {horasDelDia.map((h) => (
                <div
                  key={h}
                  className="h-20 flex items-center justify-center text-xs text-muted-foreground border-t"
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Columnas por día */}
            {days.map((d) => {
              const entriesDelDia = entries.filter((e) => e.day_of_week === d);
              return (
                <div key={d} className="relative">
                  {/* Filas de fondo */}
                  {horasDelDia.map((h) => (
                    <div key={h} className="h-20 border-t border-border/40" />
                  ))}

                  {/* Bloques de clases */}
                  {entriesDelDia.map((entry, idx) => {
                    const [sh, sm] = entry.start_time.split(":").map(Number);
                    const [eh, em] = entry.end_time.split(":").map(Number);
                    const clampedSh = Math.max(6, sh);
                    const top = (clampedSh - 6) * 80 + (sm / 60) * 80;
                    const height = Math.max(
                      20,
                      (((eh - sh) * 60 + (em - sm)) / 60) * 80,
                    );

                    // Superposición simple: dividir ancho si hay conflicto
                    const conflicts = entriesDelDia.filter((o, oi) => {
                      if (oi === idx) return false;
                      const [os, om2] = o.start_time.split(":").map(Number);
                      const [oe, oem] = o.end_time.split(":").map(Number);
                      const oStart = os * 60 + om2;
                      const oEnd = oe * 60 + oem;
                      const myStart = sh * 60 + sm;
                      const myEnd = eh * 60 + em;
                      return myStart < oEnd && myEnd > oStart;
                    });
                    const total = conflicts.length + 1;
                    const pos = entriesDelDia.slice(0, idx).filter((o) => {
                      const [os, om2] = o.start_time.split(":").map(Number);
                      const [oe, oem] = o.end_time.split(":").map(Number);
                      const oStart = os * 60 + om2;
                      const oEnd = oe * 60 + oem;
                      const myStart = sh * 60 + sm;
                      const myEnd = eh * 60 + em;
                      return myStart < oEnd && myEnd > oStart;
                    }).length;

                    return (
                      <div
                        key={`${entry.claseId}-${idx}`}
                        className={`absolute rounded-md border-2 p-1.5 overflow-hidden cursor-pointer hover:z-50 hover:scale-[1.03] transition-all duration-150 ${entry.colorClass}`}
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 20)}px`,
                          left: `${(pos / total) * 100}%`,
                          width: `${(1 / total) * 100}%`,
                          zIndex: 10,
                        }}
                        onClick={() => onSelect(entry.claseId)}
                        title={`${entry.subjectName}\n${entry.start_time.substring(0, 5)} – ${entry.end_time.substring(0, 5)}`}
                      >
                        <p className="text-xs font-semibold leading-tight truncate">
                          {entry.subjectName}
                        </p>
                        <p className="text-xs opacity-75 truncate">
                          {entry.start_time.substring(0, 5)}–
                          {entry.end_time.substring(0, 5)}
                        </p>
                        {entry.aula && (
                          <p className="text-xs opacity-60 truncate">
                            {entry.aula}
                          </p>
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
  );
}

/* ── Paginación ── */
function Paginacion({
  pagina,
  total,
  onChange,
}: {
  pagina: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-2 relative z-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(pagina - 1)}
        disabled={pagina === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        {pagina} / {total}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(pagina + 1)}
        disabled={pagina === total}
      >
        Siguiente
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
