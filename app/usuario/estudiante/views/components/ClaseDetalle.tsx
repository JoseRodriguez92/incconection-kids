"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  ClipboardList,
  Clock,
  DoorOpen,
  FileText,
  GraduationCap,
  User,
} from "lucide-react";
import type { ClaseEstudiante } from "../hooks/useClasesEstudiante";
import {
  GroupHasMaterialStore,
  type GroupHasMaterial,
} from "@/Stores/groupHasMaterialStore";
import {
  GroupHasActivityStore,
  type GroupHasActivity,
} from "@/Stores/groupHasActivityStore";
import { CycleStore, type CycleWithRelation } from "@/Stores/cycleStore";
import { useStudentContextStore } from "@/Stores/studentContextStore";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";
import { TabContenidoEstudiante } from "./tabs/TabContenidoEstudiante";
import { TabActividadesEstudiante } from "./tabs/TabActividadesEstudiante";
import { TabMetodologiaEstudiante } from "./tabs/TabMetodologiaEstudiante";

type Submission =
  Database["public"]["Tables"]["student_activity_submission"]["Row"];
type Methodology =
  Database["public"]["Tables"]["group_class_has_methodology"]["Row"];

const DIAS_SEMANA: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  0: "Dom",
};

interface ClaseDetalleProps {
  clase: ClaseEstudiante;
  onVolver: () => void;
}

export function ClaseDetalle({ clase, onVolver }: ClaseDetalleProps) {
  const { activePeriod, groupStudentId, profile } = useStudentContextStore();

  const [materiales, setMateriales] = useState<GroupHasMaterial[]>([]);
  const [actividades, setActividades] = useState<GroupHasActivity[]>([]);
  const [studentConditionIds, setStudentConditionIds] = useState<Set<string>>(
    new Set(),
  );
  const [cycles, setCycles] = useState<CycleWithRelation[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(
    {},
  );
  const [metodologia, setMetodologia] = useState<Methodology | null>(null);

  const [loadingMateriales, setLoadingMateriales] = useState(false);
  const [loadingActividades, setLoadingActividades] = useState(false);
  const [loadingMetodologia, setLoadingMetodologia] = useState(false);

  const { fetchMaterialsByGroupClassId } = GroupHasMaterialStore();
  const { fetchActivitiesByGroupClassId } = GroupHasActivityStore();
  const { fetchCyclesByAcademicPeriod } = CycleStore();

  useEffect(() => {
    const loadData = async () => {
      if (activePeriod?.id) {
        const cyclesData = await fetchCyclesByAcademicPeriod(activePeriod.id);
        setCycles(cyclesData);
      }

      setLoadingMetodologia(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("group_class_has_methodology")
          .select("*")
          .eq("group_has_class_id", clase.id)
          .eq("is_active", true)
          .maybeSingle();
        setMetodologia(data ?? null);
      } finally {
        setLoadingMetodologia(false);
      }

      setLoadingMateriales(true);
      try {
        const mats = await fetchMaterialsByGroupClassId(clase.id);
        setMateriales(mats);
      } finally {
        setLoadingMateriales(false);
      }

      setLoadingActividades(true);
      try {
        const acts = await fetchActivitiesByGroupClassId(clase.id);
        setActividades(acts);

        if (groupStudentId && acts.length > 0) {
          const supabase = createClient();
          const { data: subs } = await supabase
            .from("student_activity_submission")
            .select("*")
            .in(
              "group_has_activity_id",
              acts.map((a) => a.id),
            )
            .eq("student_enrolled_id", groupStudentId)
            .order("submitted_at", { ascending: false });

          const subsMap: Record<string, Submission> = {};
          for (const s of subs ?? []) {
            if (!subsMap[s.group_has_activity_id]) {
              subsMap[s.group_has_activity_id] = s;
            }
          }
          setSubmissions(subsMap);
        }
      } finally {
        setLoadingActividades(false);
      }
    };

    loadData();
  }, [clase.id, activePeriod?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    const supabase = createClient();
    supabase
      .from("profile_has_learning_condition")
      .select("learning_condition_id")
      .eq("profile_id", profile.id)
      .then(({ data }) => {
        setStudentConditionIds(
          new Set((data ?? []).map((r) => r.learning_condition_id)),
        );
      });
  }, [profile?.id]);

  // Sin condición propia → solo generales; con condición → solo las de su condición
  const actividadesFiltradas = actividades.filter((a) => {
    if (!a.target_condition_id) return studentConditionIds.size === 0;
    return studentConditionIds.has(a.target_condition_id);
  });

  const materialesFiltrados = materiales.filter((m) => {
    if (!m.target_condition_id) return studentConditionIds.size === 0;
    return studentConditionIds.has(m.target_condition_id);
  });

  const teacherName =
    clase.teacher_enrolled?.profiles?.full_name ?? "Docente no asignado";
  const teacherAvatar = clase.teacher_enrolled?.profiles?.avatar_url;
  const teacherInitials = teacherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const subjectName = clase.subject?.name ?? clase.name;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* ── Botón volver ── */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onVolver}
        className="gap-2 text-muted-foreground hover:text-foreground -ml-2 relative z-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Mis Clases
      </Button>

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/5 to-background p-6 md:p-8">
        {/* Decorativo */}
        <BookOpen className="absolute -right-4 -bottom-4 h-40 w-40 text-primary/6 pointer-events-none rotate-12" />

        <div className="relative space-y-4">
          {/* Fila superior: badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {clase.subject?.code && (
              <span className="font-mono text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full tracking-widest uppercase">
                {clase.subject.code}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                clase.is_active
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {clase.is_active && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
              )}
              {clase.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Nombre de la materia */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {subjectName}
          </h1>

          {/* Info inline: docente · aula · horarios */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Docente */}
            <div className="flex items-center gap-2 bg-background/70 backdrop-blur-sm border rounded-full px-3 py-1.5">
              <Avatar className="h-6 w-6">
                {teacherAvatar && <AvatarImage src={teacherAvatar} />}
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                  {teacherInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{teacherName}</span>
            </div>

            {/* Aula */}
            {clase.classroom?.name && (
              <div className="flex items-center gap-1.5 bg-background/70 backdrop-blur-sm border rounded-full px-3 py-1.5">
                <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {clase.classroom.name}
                </span>
              </div>
            )}

            {/* Horarios */}
            {clase.group_class_schedule?.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-background/70 backdrop-blur-sm border rounded-full px-3 py-1.5"
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {DIAS_SEMANA[s.day_of_week] ?? `Día ${s.day_of_week}`}{" "}
                  {s.start_time?.substring(0, 5)}–{s.end_time?.substring(0, 5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="metodologia" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger
            value="metodologia"
            className="flex items-center gap-2 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            <BookMarked className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Metodología</span>
          </TabsTrigger>
          <TabsTrigger
            value="contenido"
            className="flex items-center gap-2 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Contenido</span>
            {materialesFiltrados.length > 0 && (
              <span className="ml-0.5 bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {materialesFiltrados.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="actividades"
            className="flex items-center gap-2 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Actividades</span>
            {actividadesFiltradas.length > 0 && (
              <span className="ml-0.5 bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {actividadesFiltradas.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metodologia" className="mt-4">
          <TabMetodologiaEstudiante
            metodologia={metodologia}
            loading={loadingMetodologia}
          />
        </TabsContent>

        <TabsContent value="contenido" className="mt-4">
          <TabContenidoEstudiante
            materiales={materialesFiltrados}
            loading={loadingMateriales}
            cycles={cycles}
          />
        </TabsContent>

        <TabsContent value="actividades" className="mt-4">
          <TabActividadesEstudiante
            actividades={actividadesFiltradas}
            loading={loadingActividades}
            cycles={cycles}
            submissions={submissions}
            groupStudentId={groupStudentId}
            profileId={profile?.id ?? null}
            onSubmissionAdded={(actividadId, submission) =>
              setSubmissions((prev) => ({ ...prev, [actividadId]: submission }))
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
