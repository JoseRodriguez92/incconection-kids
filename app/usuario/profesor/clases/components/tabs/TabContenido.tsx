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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Plus,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  FolderOpen,
  Calendar,
  HeartHandshake,
} from "lucide-react";
import type { GroupHasMaterial } from "@/Stores/groupHasMaterialStore";
import { Badge } from "@/components/ui/badge";
import { ActiveBadge } from "@/components/ui/ActiveBadge";
import { createClient } from "@/lib/supabase/client";

interface TabContenidoProps {
  materiales: GroupHasMaterial[];
  loading: boolean;
  onAbrirModal: (material: GroupHasMaterial) => void;
  onAbrirModalEdicion: (material: GroupHasMaterial) => void;
  onAbrirModalEliminacion: (material: GroupHasMaterial) => void;
  onAbrirModalAgregar: () => void;
  cycles?: any[];
}

export function TabContenido({
  materiales,
  loading,
  onAbrirModal,
  onAbrirModalEdicion,
  onAbrirModalEliminacion,
  onAbrirModalAgregar,
  cycles = [],
}: TabContenidoProps) {
  const [conditionsCatalog, setConditionsCatalog] = useState<
    Array<{ id: string; name: string; color: string | null }>
  >([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("learning_condition")
      .select("id, name, color")
      .order("name")
      .then(({ data }) => {
        if (data) setConditionsCatalog(data);
      });
  }, []);

  const getCondition = (id: string | null) =>
    id ? (conditionsCatalog.find((c) => c.id === id) ?? null) : null;

  const getCycleName = (cycleId: string) => {
    const cycle = cycles.find((c) => c.id === cycleId);
    return cycle ? cycle.name : "Ciclo desconocido";
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Desconocido";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ── Tarjeta de material ─────────────────────────────────────
  const renderCard = (material: GroupHasMaterial) => {
    const cond = getCondition(material.target_condition_id ?? null);
    const active = material.is_active;
    return (
      <div
        key={material.id}
        className={`border rounded-lg overflow-hidden transition-colors ${active ? "hover:bg-muted/50" : "opacity-60 hover:opacity-80"}`}
      >
        {/* Franja de estado */}
        <div
          className={`h-0.5 w-full ${active ? "bg-blue-500" : "bg-muted-foreground/40"}`}
        />
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0">
            <FileText
              className={`h-8 w-8 shrink-0 ${active ? "text-blue-500" : "text-muted-foreground"}`}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p
                  className={`font-medium truncate ${!active ? "line-through text-muted-foreground" : ""}`}
                >
                  {material.title}
                </p>
                <ActiveBadge active={active} />
                {cond && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium shrink-0"
                    style={{
                      backgroundColor: cond.color
                        ? `${cond.color}20`
                        : undefined,
                      color: cond.color ?? undefined,
                      border: `1px solid ${cond.color ?? "currentColor"}40`,
                    }}
                  >
                    <HeartHandshake className="h-3 w-3" />
                    {cond.name}
                  </span>
                )}
              </div>
              {material.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {material.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {material.mime_type || "Archivo"} •{" "}
                {formatDate(material.created_at)} •{" "}
                {formatFileSize(material.file_size)}
              </p>
              {material.original_name && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  📎 {material.original_name}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0 ml-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAbrirModal(material)}
            >
              <Eye className="h-4 w-4" />
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
                  onClick={() => onAbrirModalEdicion(material)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={() => onAbrirModalEliminacion(material)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  // Agrupar materiales por ciclo
  const materialesPorCiclo = materiales.reduce(
    (acc, material) => {
      const cycleId = material.cycle_id;
      if (!acc[cycleId]) acc[cycleId] = [];
      acc[cycleId].push(material);
      return acc;
    },
    {} as Record<string, GroupHasMaterial[]>,
  );

  const cyclesConMateriales = Object.keys(materialesPorCiclo)
    .map((cycleId) => ({
      id: cycleId,
      name: getCycleName(cycleId),
      materiales: materialesPorCiclo[cycleId],
      cycle: cycles.find((c) => c.id === cycleId),
    }))
    .sort((a, b) => {
      if (a.cycle?.created_at && b.cycle?.created_at) {
        return (
          new Date(a.cycle.created_at).getTime() -
          new Date(b.cycle.created_at).getTime()
        );
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Material del Curso</CardTitle>
            <CardDescription>
              Documentos, videos y recursos de aprendizaje
            </CardDescription>
          </div>
          <Button onClick={onAbrirModalAgregar}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Contenido
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando materiales...</p>
          </div>
        ) : materiales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <FolderOpen className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">
                No hay contenido disponible
              </h3>
              <p className="text-muted-foreground max-w-md">
                Aún no se han agregado materiales a este curso. Comienza
                agregando documentos, videos o recursos de aprendizaje.
              </p>
            </div>
            <Button onClick={onAbrirModalAgregar} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Agregar primer material
            </Button>
          </div>
        ) : (
          <Accordion
            type="multiple"
            className="space-y-4"
            defaultValue={cyclesConMateriales.map((c) => c.id)}
          >
            {cyclesConMateriales.map((cycleGroup) => {
              const generales = cycleGroup.materiales.filter(
                (m) => !m.target_condition_id,
              );
              const conCondicion = cycleGroup.materiales.filter(
                (m) => !!m.target_condition_id,
              );

              return (
                <AccordionItem
                  key={cycleGroup.id}
                  value={cycleGroup.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-base">
                            Grupo: {cycleGroup.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {cycleGroup.materiales.length} material
                            {cycleGroup.materiales.length !== 1 ? "es" : ""}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-auto mr-2">
                        {cycleGroup.materiales.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4 pt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* ── Columna General ── */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1 pb-2 border-b">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            General
                          </span>
                          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {generales.length}
                          </span>
                        </div>
                        {generales.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-6">
                            Sin materiales generales en este ciclo.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {generales.map((m) => renderCard(m))}
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
                            Sin materiales diferenciados en este ciclo.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {Object.entries(
                              conCondicion.reduce(
                                (acc, m) => {
                                  const key = m.target_condition_id!;
                                  if (!acc[key]) acc[key] = [];
                                  acc[key].push(m);
                                  return acc;
                                },
                                {} as Record<string, GroupHasMaterial[]>,
                              ),
                            ).map(([condId, mats]) => {
                              const cond = getCondition(condId);
                              return (
                                <div key={condId} className="space-y-2">
                                  <span
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: cond?.color
                                        ? `${cond.color}20`
                                        : undefined,
                                      color: cond?.color ?? undefined,
                                      border: `1px solid ${cond?.color ?? "currentColor"}40`,
                                    }}
                                  >
                                    <HeartHandshake className="h-3 w-3" />
                                    {cond?.name ?? condId}
                                  </span>
                                  {mats.map((m) => renderCard(m))}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
