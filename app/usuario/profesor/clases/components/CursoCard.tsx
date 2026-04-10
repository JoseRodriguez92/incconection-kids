"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Calendar,
  MapPin,
  GraduationCap,
  ChevronRight,
  Hash,
} from "lucide-react";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import type { Curso } from "../types";
import { DIAS_SEMANA_CORTO } from "../constants";

interface CursoCardProps {
  curso: Curso;
  onSelect: (cursoId: string) => void;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
}

export function CursoCard({
  curso,
  onSelect,
  isExpanded,
  onToggleExpand,
}: CursoCardProps) {
  const isActive = curso.is_active !== false;

  return (
    <div className="space-y-2">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 group border-[hsl(var(--brand-blue))]/30 p-0 m-0">
        {/* Encabezado con degradado azul → negro */}
        <div
          className="px-5 pt-4 pb-5 space-y-3"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--brand-blue)) 0%, hsl(228,50%,14%) 60%, hsl(228,40%,8%) 100%)",
          }}
        >
          {/* Fila superior: ícono + estado */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-base leading-tight text-white line-clamp-2">
                  {curso.subject?.name || curso.nombre}
                </p>
                <p className="text-xs text-white/70 mt-0.5 flex items-center gap-1 truncate">
                  <GraduationCap className="h-3 w-3 shrink-0" />
                  {curso.group?.course?.name ?? curso.curso_nombre}
                  {" · "}Grupo {curso.grupo}
                </p>
              </div>
            </div>

            {/* Estado activo/inactivo */}
            <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
                <span className="relative flex h-2 w-2">
                  {isActive ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                  )}
                </span>
                <span className="text-xs font-semibold text-white">
                  {isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              {curso.course?.code && (
                <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20 text-[10px] px-1.5 py-0">
                  {curso.course.code}
                </Badge>
              )}
            </div>
          </div>

          {/* ID de la clase */}
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5 w-fit">
            <Hash className="h-3 w-3 text-white/60 shrink-0" />
            <span className="text-[10px] text-white/60 font-mono">
              ID clase:
            </span>
            <span className="text-[10px] text-white/90 font-mono font-semibold break-all">
              {curso.id}
            </span>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* ── Stats chips ── */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-primary/8 rounded-xl p-2.5 border border-primary/15">
              <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <Users className="h-3 w-3 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight text-primary">
                  {curso.cantidadEstudiantes}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Estudiantes
                </p>
              </div>
            </div>

            {curso.classroom?.name ? (
              <div className="flex items-center gap-2 bg-primary/8 rounded-xl p-2.5 border border-primary/15">
                <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight truncate text-primary">
                    {curso.classroom.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Aula
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-muted/30 rounded-xl p-2.5 border border-dashed border-border/40">
                <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="h-3 w-3 text-muted-foreground/50" />
                </div>
                <p className="text-[10px] text-muted-foreground/60">
                  Sin aula asignada
                </p>
              </div>
            )}
          </div>

          {/* ── Horarios ── */}
          {curso.group_class_schedule &&
          curso.group_class_schedule.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Horario semanal
              </div>
              <div className="flex flex-wrap gap-1.5">
                {curso.group_class_schedule.map(
                  (schedule: any, index: number) => (
                    <Badge
                      key={index}
                      className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-[11px] px-2 py-0.5 font-medium"
                    >
                      {DIAS_SEMANA_CORTO[schedule.day_of_week] || "N/A"}{" "}
                      {schedule.start_time?.substring(0, 5) || "N/A"}–
                      {schedule.end_time?.substring(0, 5) || "N/A"}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Horario no disponible
            </p>
          )}

          {/* ── Acciones ── */}
          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1 gap-2 group/btn text-white"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--brand-blue)) 0%, hsl(228,40%,14%) 100%)",
              }}
              onClick={() => onSelect(curso.id)}
            >
              Acceder al Aula Virtual
              <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleExpand}
              title="Ver estudiantes"
              className={
                isExpanded
                  ? "border-[hsl(var(--brand-blue))]/50 text-[hsl(var(--brand-blue))] bg-[hsl(var(--brand-blue))]/10"
                  : "border-[hsl(var(--brand-blue))]/30 text-[hsl(var(--brand-blue))]/70 hover:bg-[hsl(var(--brand-blue))]/10 hover:text-[hsl(var(--brand-blue))]"
              }
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Acordeón de estudiantes ── */}
      {isExpanded && (
        <Card className="border-l-4 border-l-primary overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="font-semibold text-sm text-primary">
                Estudiantes matriculados
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  ({curso.cantidadEstudiantes})
                </span>
              </p>
            </div>

            {curso.estudiantes && curso.estudiantes.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                {curso.estudiantes.map((estudiante: any) => (
                  <div
                    key={estudiante.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    {estudiante.avatar_url ? (
                      <img
                        src={estudiante.avatar_url}
                        alt={estudiante.full_name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary/15 rounded-full flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                        <span className="text-xs font-bold text-primary">
                          {estudiante.full_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate leading-tight">
                        {estudiante.full_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {estudiante.email}
                      </p>
                      <ConditionBadges
                        conditions={estudiante.conditions}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No hay estudiantes inscritos</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
