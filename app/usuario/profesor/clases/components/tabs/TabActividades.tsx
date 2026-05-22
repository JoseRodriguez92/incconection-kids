"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Plus,
  Download,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  ClipboardList,
  Calendar,
  Clock,
  AlertCircle,
  ClipboardCheck,
  HeartHandshake,
  CheckCircle2,
  TriangleAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GroupHasActivity } from "@/Stores/groupHasActivityStore";

interface TabActividadesProps {
  actividades: GroupHasActivity[];
  loading: boolean;
  onAbrirModal: (actividad: GroupHasActivity) => void;
  onAbrirModalEdicion: (actividad: GroupHasActivity) => void;
  onAbrirModalEliminacion: (actividad: GroupHasActivity) => void;
  onAbrirModalAgregar: () => void;
  onVerEntregas?: (actividad: GroupHasActivity) => void;
  onCerrarNotas?: (
    cycleId: string,
    actividadesCiclo: GroupHasActivity[],
  ) => void;
  cycles?: any[]; // Ciclos pasados desde el componente padre
}

export function TabActividades({
  actividades,
  loading,
  onAbrirModal,
  onAbrirModalEdicion,
  onAbrirModalEliminacion,
  onAbrirModalAgregar,
  onVerEntregas,
  onCerrarNotas,
  cycles = [],
}: TabActividadesProps) {
  const [conditionsCatalog, setConditionsCatalog] = useState<Array<{ id: string; name: string; color: string | null }>>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("learning_condition")
      .select("id, name, color")
      .order("name")
      .then(({ data }) => { if (data) setConditionsCatalog(data); });
  }, []);

  const getCondition = (id: string | null) =>
    id ? conditionsCatalog.find((c) => c.id === id) ?? null : null;

  const sumPercentage = (acts: GroupHasActivity[]) =>
    acts.reduce((acc, a) => acc + (a.grade_percentage ?? 0), 0);

  const PercentageBadge = ({ acts }: { acts: GroupHasActivity[] }) => {
    const hasPercentages = acts.some((a) => a.grade_percentage !== null);
    if (!hasPercentages) return null;
    const total = sumPercentage(acts);
    const isOk = total === 100;
    const isOver = total > 100;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          isOk
            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            : isOver
              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        }`}
        title={
          isOk
            ? "Los porcentajes suman 100%"
            : isOver
              ? `Excede el 100% (${total}%)`
              : `Faltan ${100 - total}% para completar el 100%`
        }
      >
        {isOk ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          <TriangleAlert className="w-3 h-3" />
        )}
        {total}%
      </span>
    );
  };

  // Función para obtener el nombre del ciclo por ID
  const getCycleName = (cycleId: string) => {
    if (cycleId === "sin-ciclo") {
      return "Sin ciclo asignado";
    }
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!cycle) return "Ciclo desconocido";

    // Si el nombre es solo un número, agregar "Trimestre"
    const nombre = cycle.name?.trim() || "";

    // Verificar si es solo un número (con o sin espacios)
    if (/^\d+$/.test(nombre)) {
      return `Trimestre ${nombre}`;
    }

    // Si ya tiene "Trimestre" al inicio, devolverlo tal cual
    if (nombre.toLowerCase().startsWith("trimestre")) {
      return nombre;
    }

    return nombre || "Sin nombre";
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Desconocido";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Fecha desconocida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Función para formatear la fecha límite con hora
  const formatLimitDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para verificar el estado de la fecha límite
  const getLimitDateStatus = (limitDate: string | null) => {
    if (!limitDate) return null;

    const now = new Date();
    const limit = new Date(limitDate);
    const diffTime = limit.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return {
        status: "expired",
        text: "Vencida",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        icon: AlertCircle,
      };
    } else if (diffDays <= 2) {
      return {
        status: "urgent",
        text: "Próxima a vencer",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-950",
        icon: Clock,
      };
    } else {
      return {
        status: "active",
        text: "Activa",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-950",
        icon: Calendar,
      };
    }
  };

  // ── Render de una tarjeta de actividad ─────────────────────
  const renderCard = (actividad: GroupHasActivity) => {
    const cond = getCondition(actividad.target_condition_id ?? null);
    return (
      <div
        key={actividad.id}
        className="flex items-start justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            {/* Fila 1: título */}
            <p className="font-medium text-sm sm:text-base leading-snug">{actividad.title}</p>

            {/* Fila 2: estado + condición + peso — todos compactos */}
            <div className="flex items-center gap-1 flex-wrap mt-1">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  actividad.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {actividad.is_active ? "Activa" : "Inactiva"}
              </span>
              {cond && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    backgroundColor: cond.color ? `${cond.color}20` : undefined,
                    color: cond.color ?? undefined,
                    border: `1px solid ${cond.color ?? "currentColor"}40`,
                  }}
                >
                  <HeartHandshake className="h-3 w-3 shrink-0" />
                  {cond.name}
                </span>
              )}
              {actividad.grade_percentage !== null && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400">
                  {actividad.grade_percentage}%
                </span>
              )}
            </div>

            {actividad.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {actividad.description}
              </p>
            )}

            {/* Metadata en una sola línea truncada */}
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
              {[
                actividad.mime_type?.split("/")[1]?.toUpperCase(),
                formatDate(actividad.created_at),
                actividad.file_size ? formatFileSize(actividad.file_size) : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {actividad.original_name && (
              <p className="text-[10px] text-muted-foreground truncate">
                📎 {actividad.original_name}
              </p>
            )}

            {actividad.limit_date && (
              <div className="mt-1">
                {(() => {
                  const status = getLimitDateStatus(actividad.limit_date);
                  if (!status) return null;
                  const Icon = status.icon;
                  const d = new Date(actividad.limit_date);
                  const compactDate = d.toLocaleString("es-ES", {
                    day: "2-digit", month: "2-digit",
                    hour: "2-digit", minute: "2-digit",
                  });
                  return (
                    <div
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${status.bgColor} ${status.color}`}
                    >
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{status.text}: {compactDate}</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2 ml-2 sm:ml-4 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAbrirModal(actividad)}
            title="Ver actividad"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onVerEntregas?.(actividad)}
            className="gap-2"
            title="Ver entregas"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Entregas</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onAbrirModalEdicion(actividad)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => onAbrirModalEliminacion(actividad)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  // Agrupar actividades por ciclo
  const actividadesPorCiclo = actividades.reduce(
    (acc, actividad) => {
      // Si el cycle_id es null, usar 'sin-ciclo' como clave
      const cycleId = actividad.cycle_id || "sin-ciclo";
      if (!acc[cycleId]) {
        acc[cycleId] = [];
      }
      acc[cycleId].push(actividad);
      return acc;
    },
    {} as Record<string, GroupHasActivity[]>,
  );

  // Ordenar ciclos de forma ascendente por nombre
  const ciclosOrdenados = Object.entries(actividadesPorCiclo).sort(
    ([idA], [idB]) => {
      const nombreA = getCycleName(idA);
      const nombreB = getCycleName(idB);
      return nombreA.localeCompare(nombreB, "es", { numeric: true });
    },
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Actividades del Curso</CardTitle>
            <CardDescription>
              Tareas, exámenes y proyectos para los estudiantes
            </CardDescription>
          </div>
          <Button onClick={onAbrirModalAgregar} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Actividad</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando actividades...</p>
          </div>
        ) : actividades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <ClipboardList className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">
                No hay actividades disponibles
              </h3>
              <p className="text-muted-foreground max-w-md">
                Aún no se han creado actividades para este curso. Comienza
                agregando tareas, exámenes o proyectos para tus estudiantes.
              </p>
            </div>
            <Button onClick={onAbrirModalAgregar} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Agregar primera actividad
            </Button>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {ciclosOrdenados.map(([cycleId, actividadesCiclo]) => (
              <AccordionItem
                key={cycleId}
                value={cycleId}
                className="border rounded-lg px-4"
              >
                <div className="flex items-center gap-2 justify-between">
                  <AccordionTrigger className="hover:no-underline flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-semibold text-sm sm:text-lg truncate">
                          {getCycleName(cycleId)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {actividadesCiclo.length}{" "}
                          {actividadesCiclo.length === 1
                            ? "actividad"
                            : "actividades"}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2"
                    onClick={() => {
                      if (onCerrarNotas) {
                        onCerrarNotas(cycleId, actividadesCiclo);
                      }
                    }}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Cerrar Notas</span>
                  </Button>
                </div>

                <AccordionContent>
                  {(() => {
                    const generales = actividadesCiclo.filter(
                      (a) => !a.target_condition_id,
                    );
                    const conCondicion = actividadesCiclo.filter(
                      (a) => !!a.target_condition_id,
                    );
                    return (
                      <div className="pt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* ── Columna General ── */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-1 pb-2 border-b">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">
                              General
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {generales.length}
                            </span>
                            <PercentageBadge acts={generales} />
                          </div>
                          {generales.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">
                              Sin actividades generales en este ciclo.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {generales.map((a) => renderCard(a))}
                            </div>
                          )}
                        </div>

                        {/* ── Columna Con condición ── */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-1 pb-2 border-b">
                            <HeartHandshake className="h-4 w-4 text-violet-500" />
                            <span className="text-sm font-semibold text-foreground">
                              Con condición de aprendizaje
                            </span>
                            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                              {conCondicion.length}
                            </span>
                          </div>
                          {conCondicion.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">
                              Sin actividades diferenciadas en este ciclo.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {/* Agrupar por condición para mostrar % por condición */}
                              {Object.entries(
                                conCondicion.reduce((acc, a) => {
                                  const key = a.target_condition_id!;
                                  if (!acc[key]) acc[key] = [];
                                  acc[key].push(a);
                                  return acc;
                                }, {} as Record<string, GroupHasActivity[]>),
                              ).map(([condId, acts]) => {
                                const cond = getCondition(condId);
                                return (
                                  <div key={condId} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{
                                          backgroundColor: cond?.color ? `${cond.color}20` : undefined,
                                          color: cond?.color ?? undefined,
                                          border: `1px solid ${cond?.color ?? "currentColor"}40`,
                                        }}
                                      >
                                        {cond?.name ?? condId}
                                      </span>
                                      <PercentageBadge acts={acts} />
                                    </div>
                                    {acts.map((a) => renderCard(a))}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
