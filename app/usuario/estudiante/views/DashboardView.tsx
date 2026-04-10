"use client";

import { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Search,
  List,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  HeartHandshake,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStudentContextStore } from "@/Stores/studentContextStore";
import { useStudentViewStore } from "@/Stores/studentViewStore";
import { useClasesEstudiante } from "./hooks/useClasesEstudiante";
import { useActividadesEstudiante } from "./hooks/useActividadesEstudiante";

const CLASS_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
];

const CLASS_COLORS_HEX = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
];

const HOUR_HEIGHT = 72; // px por hora
const ITEMS_POR_PAGINA = 5;

export function DashboardView() {
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [vistaClases, setVistaClases] = useState<"lista" | "calendario">(
    "lista",
  );

  const {
    profile,
    course,
    group,
    activePeriod,
    loading: loadingContext,
  } = useStudentContextStore();
  const { navigateToClase } = useStudentViewStore();
  const { clases, loading: loadingClases } = useClasesEstudiante();
  const { actividades, loading: loadingActividades } =
    useActividadesEstudiante();

  const isLoading = loadingContext || loadingClases;

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  // ── Datos filtrados (lista) ──────────────────────────────────────────────
  const diasDisponibles = Array.from(
    new Set(
      clases.flatMap((c) => c.group_class_schedule.map((s) => s.day_of_week)),
    ),
  ).sort((a, b) => a - b);

  const term = busqueda.toLowerCase().trim();
  const clasesFiltradas = clases.filter(
    (c) =>
      !term ||
      (c.subject?.name ?? c.name).toLowerCase().includes(term) ||
      c.teacher_enrolled?.profiles?.full_name?.toLowerCase().includes(term),
  );
  const totalPaginas = Math.max(
    1,
    Math.ceil(clasesFiltradas.length / ITEMS_POR_PAGINA),
  );
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const clasesVisibles = clasesFiltradas.slice(
    inicio,
    inicio + ITEMS_POR_PAGINA,
  );

  // ── Datos para vista calendario ──────────────────────────────────────────
  const allTimes = clases.flatMap((c) =>
    c.group_class_schedule.flatMap((s) => [s.start_time, s.end_time]),
  );
  const minHour = allTimes.length
    ? Math.max(6, Math.min(...allTimes.map((t) => parseInt(t.split(":")[0]))))
    : 6;
  const maxHour = allTimes.length
    ? Math.max(
        14,
        Math.max(...allTimes.map((t) => parseInt(t.split(":")[0]))) + 1,
      )
    : 14;
  const horasCalendario = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => `${String(minHour + i).padStart(2, "0")}:00`,
  );
  const slotsPorDia = diasDisponibles.map((dia) => ({
    dia,
    slots: clases.flatMap((clase, claseIndex) =>
      clase.group_class_schedule
        .filter((s) => s.day_of_week === dia)
        .map((s) => ({
          id: `${clase.id}-${s.day_of_week}-${s.start_time}`,
          claseId: clase.id,
          materia: clase.subject?.name ?? clase.name,
          docente: clase.teacher_enrolled?.profiles?.full_name ?? null,
          horaInicio: s.start_time,
          horaFin: s.end_time,
          colorIndex: claseIndex,
        })),
    ),
  }));

  return (
    <SidebarInset>
      <div className="flex h-screen w-full flex-col overflow-y-scroll">
        <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Panel Principal</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Bienvenida */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card className="md:col-span-3">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={
                        profile?.avatar_url ??
                        "/placeholder.svg?height=64&width=64"
                      }
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      ¡Bienvenido, {profile?.full_name ?? "—"}!
                    </CardTitle>
                    <CardDescription>
                      {[course?.name, group?.name, activePeriod?.name]
                        .filter(Boolean)
                        .join(" · ") || "Sin información académica disponible"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Banners */}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* ── Cursos Activos ── */}
            <Card
              className={
                vistaClases === "calendario" ? "lg:col-span-3" : "lg:col-span-2"
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Mis Cursos Activos
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Buscador — solo en vista lista */}
                    {vistaClases === "lista" && (
                      <div className="relative w-44">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Buscar materia..."
                          value={busqueda}
                          onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(1);
                          }}
                          className="pl-8 h-8 text-sm"
                        />
                      </div>
                    )}
                    {/* Toggle vista */}
                    <div className="flex border rounded-md overflow-hidden">
                      <button
                        onClick={() => setVistaClases("lista")}
                        className={`px-2.5 py-1.5 transition-colors ${
                          vistaClases === "lista"
                            ? "bg-[#343c63] text-white"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        title="Vista lista"
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setVistaClases("calendario")}
                        className={`px-2.5 py-1.5 transition-colors ${
                          vistaClases === "calendario"
                            ? "bg-[#343c63] text-white"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        title="Vista calendario"
                      >
                        <CalendarDays className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Cargando clases...
                  </p>
                ) : clases.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay clases activas en este momento
                  </p>
                ) : vistaClases === "lista" ? (
                  /* ── VISTA LISTA ── */
                  <>
                    {clasesFiltradas.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No se encontraron resultados
                      </p>
                    ) : (
                      <div className="divide-y">
                        {clasesVisibles.map((clase, index) => (
                          <div
                            key={clase.id}
                            className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                            onClick={() => navigateToClase(clase.id)}
                          >
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${CLASS_COLORS[(inicio + index) % CLASS_COLORS.length]}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {clase.subject?.name ?? clase.name}
                              </p>
                              {clase.group_class_schedule.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {clase.group_class_schedule.map((slot, i) => (
                                    <span
                                      key={i}
                                      className="text-xs bg-muted px-1.5 py-0.5 rounded"
                                    >
                                      <span className="font-semibold text-foreground">
                                        Día {slot.day_of_week}
                                      </span>
                                      <span className="mx-1 text-muted-foreground">
                                        ·
                                      </span>
                                      {slot.start_time.slice(0, 5)}–
                                      {slot.end_time.slice(0, 5)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {clase.teacher_enrolled?.profiles && (
                              <div className="flex items-center gap-2 shrink-0">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage
                                    src={
                                      clase.teacher_enrolled.profiles
                                        .avatar_url ?? undefined
                                    }
                                  />
                                  <AvatarFallback className="text-[10px]">
                                    {clase.teacher_enrolled.profiles.full_name
                                      .split(" ")
                                      .slice(0, 2)
                                      .map((w) => w[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-xs text-muted-foreground hidden lg:block max-w-[120px] truncate">
                                  {clase.teacher_enrolled.profiles.full_name}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {totalPaginas > 1 && (
                      <div className="flex items-center justify-between px-6 py-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPaginaActual((p) => Math.max(1, p - 1))
                          }
                          disabled={paginaActual === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {paginaActual} / {totalPaginas}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPaginaActual((p) =>
                              Math.min(totalPaginas, p + 1),
                            )
                          }
                          disabled={paginaActual === totalPaginas}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  /* ── VISTA CALENDARIO ── */
                  <div className="overflow-x-auto bg-transparent">
                    <div
                      className="grid gap-px  bg-transparent"
                      style={{
                        gridTemplateColumns: `56px repeat(${diasDisponibles.length}, minmax(120px, 1fr))`,
                        minWidth: `${56 + diasDisponibles.length * 130}px`,
                      }}
                    >
                      {/* Header: esquina vacía + encabezados de días */}
                      <div className="bg-transparent h-10" />
                      {diasDisponibles.map((dia) => (
                        <div
                          key={dia}
                          className="bg-muted h-10 flex items-center justify-center font-semibold text-sm"
                        >
                          Día {dia}
                        </div>
                      ))}

                      {/* Columna de horas */}
                      <div className="bg-background">
                        {horasCalendario.map((hora) => (
                          <div
                            key={hora}
                            style={{ height: HOUR_HEIGHT }}
                            className="flex items-start justify-end pr-2 pt-1 text-xs text-muted-foreground border-t border-border/40"
                          >
                            {hora}
                          </div>
                        ))}
                      </div>

                      {/* Columnas de días */}
                      {slotsPorDia.map(({ dia, slots }) => (
                        <div key={dia} className="bg-transparent relative">
                          {/* Grid de fondo */}
                          {horasCalendario.map((hora) => (
                            <div
                              key={hora}
                              style={{ height: HOUR_HEIGHT }}
                              className="border-t border-border/40"
                            />
                          ))}

                          {/* Bloques de clases */}
                          {slots.map((slot) => {
                            const [sH, sM] = slot.horaInicio
                              .split(":")
                              .map(Number);
                            const [eH, eM] = slot.horaFin
                              .split(":")
                              .map(Number);
                            const top =
                              (sH - minHour) * HOUR_HEIGHT +
                              (sM / 60) * HOUR_HEIGHT;
                            const height =
                              ((eH * 60 + eM - (sH * 60 + sM)) / 60) *
                              HOUR_HEIGHT;
                            const color =
                              CLASS_COLORS_HEX[
                                slot.colorIndex % CLASS_COLORS_HEX.length
                              ];
                            return (
                              <div
                                key={slot.id}
                                className="absolute inset-x-1 rounded-md px-2 py-1 overflow-hidden text-white text-xs cursor-pointer hover:brightness-110 transition-all"
                                style={{
                                  top: `${top}px`,
                                  height: `${height}px`,
                                  backgroundColor: color,
                                  zIndex: 10,
                                  border: `1px solid #ffffff`,
                                }}
                                onClick={() => navigateToClase(slot.claseId)}
                              >
                                <p className="font-semibold truncate leading-tight">
                                  {slot.materia}
                                </p>
                                <p className="opacity-80 truncate">
                                  {slot.horaInicio.slice(0, 5)}–
                                  {slot.horaFin.slice(0, 5)}
                                </p>
                                {slot.docente && height > 52 && (
                                  <p className="opacity-70 truncate">
                                    {slot.docente}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Próximas Entregas — se oculta en modo calendario para dar espacio */}
            {vistaClases === "lista" && (
              <Card className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Mis Actividades
                  </CardTitle>
                  <CardDescription>
                    Tareas y entregas de tus materias
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  {loadingActividades ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Cargando actividades...
                    </p>
                  ) : actividades.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                      <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        No hay actividades pendientes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {actividades.map((act) => {
                        const limitDate = act.limit_date
                          ? new Date(act.limit_date)
                          : null;
                        const now = new Date();
                        const diffDays = limitDate
                          ? Math.ceil(
                              (limitDate.getTime() - now.getTime()) /
                                (1000 * 60 * 60 * 24),
                            )
                          : null;

                        const dateColor =
                          diffDays === null
                            ? "text-muted-foreground"
                            : diffDays < 0
                              ? "text-red-500"
                              : diffDays <= 3
                                ? "text-amber-500"
                                : "text-emerald-600";

                        return (
                          <div
                            key={act.id}
                            className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() =>
                              navigateToClase(act.group_has_class_id)
                            }
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className="font-medium text-sm truncate">
                                {act.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {act.subjectName ?? "Sin materia"}
                              </p>
                              {limitDate && (
                                <p
                                  className={`text-xs flex items-center gap-1 ${dateColor}`}
                                >
                                  <CalendarClock className="h-3 w-3 shrink-0" />
                                  {diffDays !== null && diffDays < 0
                                    ? `Venció hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? "s" : ""}`
                                    : diffDays === 0
                                      ? "Vence hoy"
                                      : `Vence en ${diffDays} día${diffDays !== 1 ? "s" : ""}`}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              {act.grade_percentage != null && (
                                <Badge variant="secondary" className="text-xs">
                                  {act.grade_percentage}%
                                </Badge>
                              )}
                              {act.target_condition_id && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-violet-600 border-violet-300 gap-1"
                                >
                                  <HeartHandshake className="h-3 w-3" />
                                  NEE
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
