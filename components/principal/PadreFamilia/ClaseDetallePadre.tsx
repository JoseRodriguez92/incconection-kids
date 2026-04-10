"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  Users,
  Target,
  Lightbulb,
  Calendar,
  Clock,
  AlertCircle,
  MessageCircle,
  MapPin,
  CheckCircle,
  ChevronRight,
  BookMarked,
  Layers,
  Video,
  ExternalLink,
  Sparkles,
  Download,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GroupClassMethodologyStore } from "@/Stores/groupClassMethodologyStore";
import { GroupClassMethodologySkillStore } from "@/Stores/groupClassMethodologySkillStore";
import { MethodologySkillStore } from "@/Stores/methodologySkillStore";
import { MethodologySkillCategoryStore } from "@/Stores/methodologySkillCategoryStore";
import { GroupHasMaterialStore } from "@/Stores/groupHasMaterialStore";
import { GroupHasActivityStore } from "@/Stores/groupHasActivityStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { CycleStore } from "@/Stores/cycleStore";
import type { ScheduleItem } from "./hooks/useStudentSchedule";

/** Convierte URLs de YouTube/Vimeo a su versión embebible */
function toEmbedUrl(url: string): string {
  // YouTube: watch?v=ID  o  youtu.be/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // URL directa (mp4, etc.) → la devuelve tal cual para usar con <video>
  return url;
}

interface PiarFile {
  id: string;
  title: string | null;
  original_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  bucket: string | null;
  created_at: string | null;
  periodLabel: string | null;
  cycleLabel: string | null;
  groupKey: string; // "Periodo · Ciclo" o "Sin clasificar"
}

interface ClaseDetallePadreProps {
  clase: ScheduleItem;
  onVolver: () => void;
  studentConditions?: { id: string; name: string; color: string | null }[];
  studentId?: string;
}

export function ClaseDetallePadre({ clase, onVolver, studentConditions = [], studentId }: ClaseDetallePadreProps) {
  const hasPiar = studentConditions.length > 0;
  const [methodology, setMethodology] = useState<any>(null);
  const [loadingMethod, setLoadingMethod] = useState(true);
  const [syllabusUrl, setSyllabusUrl] = useState<string | null>(null);
  const [embedVideoUrl, setEmbedVideoUrl] = useState<string | null>(null);
  const [piarFiles, setPiarFiles] = useState<PiarFile[]>([]);
  const [loadingPiar, setLoadingPiar] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [cycles, setCycles] = useState<any[]>([]);

  const {
    materials,
    loading: loadingMaterials,
    fetchMaterialsByGroupClassId,
  } = GroupHasMaterialStore();
  const {
    activities,
    loading: loadingActivities,
    fetchActivitiesByGroupClassId,
  } = GroupHasActivityStore();
  const { fetchMethodologyByGroupClassId } = GroupClassMethodologyStore();
  const { fetchSkillsByMethodologyId } = GroupClassMethodologySkillStore();
  const { fetchSkillsByCategory } = MethodologySkillStore();
  const { fetchActiveCategories } = MethodologySkillCategoryStore();
  const { fetchActivePeriodo } = PeriodAcademicStore();
  const { fetchCyclesByAcademicPeriod } = CycleStore();

  const [skillsByCategory, setSkillsByCategory] = useState<{ category: any; skills: any[] }[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoadingMethod(true);
      const m = await fetchMethodologyByGroupClassId(clase.groupClassId);
      setMethodology(m);
      setLoadingMethod(false);

      // Generar URL del sílabo (PDF en Supabase Storage)
      if (m?.syllabus_path && m?.syllabus_bucket) {
        const supabase = createClient();
        const { data } = supabase.storage
          .from(m.syllabus_bucket)
          .getPublicUrl(m.syllabus_path);
        if (data?.publicUrl) setSyllabusUrl(data.publicUrl);
      }

      // Generar URL embebible del video
      if (m?.welcome_video_url) {
        setEmbedVideoUrl(toEmbedUrl(m.welcome_video_url));
      } else if (m?.welcome_video_path && m?.welcome_video_bucket) {
        const supabase = createClient();
        const { data } = supabase.storage
          .from(m.welcome_video_bucket)
          .getPublicUrl(m.welcome_video_path);
        if (data?.publicUrl) setEmbedVideoUrl(data.publicUrl);
      }

      fetchMaterialsByGroupClassId(clase.groupClassId);
      fetchActivitiesByGroupClassId(clase.groupClassId);

      const period = await fetchActivePeriodo();
      if (period?.id) {
        const c = await fetchCyclesByAcademicPeriod(period.id);
        setCycles(c);
      }

      // Cargar habilidades si existe metodología
      if (m?.id) {
        const assigned = await fetchSkillsByMethodologyId(m.id);
        const assignedIds = assigned.map((s: any) => s.skill_id);
        const categories = await fetchActiveCategories();
        const byCat = await Promise.all(
          categories.map(async (cat: any) => {
            const catSkills = await fetchSkillsByCategory(cat.id);
            return {
              category: cat,
              skills: catSkills.filter((s: any) => assignedIds.includes(s.id)),
            };
          })
        );
        setSkillsByCategory(byCat.filter((sc) => sc.skills.length > 0));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clase.groupClassId]);

  // Carga archivos PIAR del estudiante (solo si tiene condiciones de aprendizaje)
  useEffect(() => {
    if (!hasPiar || !studentId) return;

    const loadPiarFiles = async () => {
      setLoadingPiar(true);
      const supabase = createClient();
      try {
        // Paso 1: obtener student_enrolled.id(s) activos del estudiante
        const { data: enrolled } = await supabase
          .from("student_enrolled")
          .select("id")
          .eq("user_id", studentId)
          .eq("is_active", true);

        const enrolledIds = (enrolled ?? []).map((e: any) => e.id as string);
        if (enrolledIds.length === 0) return;

        // Paso 2: obtener psych_case ids para este estudiante
        const { data: cases } = await supabase
          .from("psych_case")
          .select("id")
          .in("student_enrolled_id", enrolledIds);

        const caseIds = (cases ?? []).map((c: any) => c.id as string);
        if (caseIds.length === 0) return;

        // Paso 3: archivos cuyo título contenga "PIAR" con periodo·ciclo
        const { data: files } = await supabase
          .from("psych_file")
          .select(`
            id, title, original_name, mime_type, file_size, storage_path, bucket, created_at,
            academic_period_has_cycle:academic_period_has_cycle_id(
              academic_period:academic_period_id(name),
              cycle:cycle_id(name)
            )
          `)
          .in("psych_case_id", caseIds)
          .ilike("title", "%piar%")
          .order("created_at", { ascending: false });

        const mapped: PiarFile[] = (files ?? []).map((f: any) => {
          const period = f.academic_period_has_cycle?.academic_period?.name ?? null;
          const cycle  = f.academic_period_has_cycle?.cycle?.name ?? null;
          return {
            id:            f.id,
            title:         f.title,
            original_name: f.original_name,
            mime_type:     f.mime_type,
            file_size:     f.file_size,
            storage_path:  f.storage_path,
            bucket:        f.bucket,
            created_at:    f.created_at,
            periodLabel:   period,
            cycleLabel:    cycle,
            groupKey:      period && cycle ? `${period} · ${cycle}` : "Sin clasificar",
          };
        });

        setPiarFiles(mapped);
      } catch (err) {
        console.error("[PIAR files]", err);
      } finally {
        setLoadingPiar(false);
      }
    };

    loadPiarFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPiar, studentId]);

  const handleDownloadPiar = async (file: PiarFile) => {
    if (!file.storage_path) return;
    setDownloadingId(file.id);
    const supabase = createClient();
    try {
      const { data, error } = await supabase.storage
        .from(file.bucket || "psychology-files")
        .download(file.storage_path);
      if (error) throw error;
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.original_name || file.title || "PIAR";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[PIAR download]", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenPiarInTab = (file: PiarFile) => {
    if (!file.storage_path) return;
    const supabase = createClient();
    const { data } = supabase.storage
      .from(file.bucket || "psychology-files")
      .getPublicUrl(file.storage_path);
    if (data?.publicUrl) window.open(data.publicUrl, "_blank");
  };

  const getCycleName = (cycleId: string | null) => {
    if (!cycleId || cycleId === "sin-ciclo") return "Sin ciclo asignado";
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!cycle) return "Ciclo desconocido";
    const nombre = cycle.name?.trim() || "";
    return /^\d+$/.test(nombre) ? `Trimestre ${nombre}` : nombre;
  };

  // Group by cycle
  const materialesByCycle = (materials as any[])
    .filter((mat) => {
      const cond = mat.learning_condition ?? null;
      if (studentConditions.length > 0) {
        // estudiante con condiciones → solo materiales que coincidan con sus condiciones
        return cond && studentConditions.some((sc) => sc.id === cond.id);
      }
      // estudiante sin condiciones → solo materiales genéricos
      return !cond;
    })
    .reduce(
      (acc: Record<string, any[]>, mat) => {
        const key = mat.cycle_id || "sin-ciclo";
        if (!acc[key]) acc[key] = [];
        acc[key].push(mat);
        return acc;
      },
      {},
    );

  const actividadesByCycle = (activities as any[])
    .filter((act) => {
      const cond = act.learning_condition ?? null;
      if (studentConditions.length > 0) {
        // estudiante con condiciones → solo actividades que coincidan con sus condiciones
        return cond && studentConditions.some((sc) => sc.id === cond.id);
      }
      // estudiante sin condiciones → solo actividades genéricas (sin condición asignada)
      return !cond;
    })
    .reduce(
      (acc: Record<string, any[]>, act) => {
        const key = act.cycle_id || "sin-ciclo";
        if (!acc[key]) acc[key] = [];
        acc[key].push(act);
        return acc;
      },
      {},
    );

  const getActividadStatus = (fechaLimite: string | null) => {
    if (!fechaLimite)
      return { label: "Sin fecha", variant: "secondary" as const };
    const diff =
      (new Date(fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: "Vencida", variant: "destructive" as const };
    if (diff <= 3)
      return { label: "Próxima a vencer", variant: "outline" as const };
    return { label: "Activa", variant: "secondary" as const };
  };

  return (
    <div className="flex flex-col min-h-full bg-transparent">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b bg-card px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onVolver}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{clase.subject}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {clase.teacher}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {clase.classroom}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {clase.startTime} – {clase.endTime}
              </span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">
            Día {clase.dayOfWeek}
          </Badge>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="metodologia">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="metodologia"
              className="flex items-center gap-1.5"
            >
              <Target className="h-4 w-4" />
              Metodología
            </TabsTrigger>
            <TabsTrigger
              value="actividades"
              className="flex items-center gap-1.5"
            >
              <ClipboardList className="h-4 w-4" />
              Actividades
            </TabsTrigger>
            <TabsTrigger
              value="contenido"
              className="flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="atencion" className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              Atención a Padre
            </TabsTrigger>
            {hasPiar && (
              <TabsTrigger value="piar" className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-500" />
                PIAR
              </TabsTrigger>
            )}
          </TabsList>

          {/* ══ METODOLOGÍA ══════════════════════════════════════════════════ */}
          <TabsContent value="metodologia">
            {loadingMethod ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ) : !methodology ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-14 gap-3">
                  <Lightbulb className="h-10 w-10 text-muted-foreground/30" />
                  <p className="font-medium">Sin metodología registrada</p>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    El profesor aún no ha publicado la metodología para esta clase.
                  </p>
                </CardContent>
              </Card>
            ) : (() => {
              // Construir las pestañas disponibles dinámicamente
              const hasGeneral = !!(methodology.objectives || methodology.notes);
              const hasSyllabus = !!syllabusUrl;
              const hasVideo = !!embedVideoUrl;
              const hasSkills = skillsByCategory.length > 0;
              const nothingAvailable = !hasGeneral && !hasSyllabus && !hasVideo && !hasSkills;

              if (nothingAvailable) return (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 gap-2">
                    <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Metodología registrada pero sin contenido visible aún.
                    </p>
                  </CardContent>
                </Card>
              );

              const defaultTab = hasGeneral ? "general"
                : hasSyllabus ? "silabo"
                : hasVideo    ? "video"
                : "habilidades";

              return (
                <Tabs defaultValue={defaultTab}>
                  {/* Pills de navegación interna */}
                  <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-4">
                    {hasGeneral && (
                      <TabsTrigger
                        value="general"
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                          data-[state=inactive]:bg-white data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground
                          data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                      >
                        <Target className="h-4 w-4" />
                        General
                      </TabsTrigger>
                    )}
                    {hasSyllabus && (
                      <TabsTrigger
                        value="silabo"
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                          data-[state=inactive]:bg-white data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground
                          data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                      >
                        <BookMarked className="h-4 w-4" />
                        Malla Curricular
                      </TabsTrigger>
                    )}
                    {hasVideo && (
                      <TabsTrigger
                        value="video"
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                          data-[state=inactive]:bg-white data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground
                          data-[state=active]:bg-[hsl(228,57%,21%)] data-[state=active]:border-[hsl(228,57%,21%)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                      >
                        <Video className="h-4 w-4" />
                        Presentación
                      </TabsTrigger>
                    )}
                    {hasSkills && (
                      <TabsTrigger
                        value="habilidades"
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                          data-[state=inactive]:bg-white data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground
                          data-[state=active]:bg-[hsl(228,57%,21%)] data-[state=active]:border-[hsl(228,57%,21%)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Habilidades
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {/* ── General: objetivos + notas ── */}
                  {hasGeneral && (
                    <TabsContent value="general" className="space-y-4 mt-0">
                      {methodology.objectives && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              Objetivos
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {methodology.objectives}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      {methodology.notes && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Notas del Profesor
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {methodology.notes}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  )}

                  {/* ── Sílabo ── */}
                  {hasSyllabus && (
                    <TabsContent value="silabo" className="mt-0">
                      <Card className="overflow-hidden">
                        <iframe
                          src={syllabusUrl!}
                          className="w-full h-[560px] border-0"
                          title="Programa / Sílabo"
                        />
                      </Card>
                    </TabsContent>
                  )}

                  {/* ── Presentación (video) ── */}
                  {hasVideo && (
                    <TabsContent value="video" className="mt-0">
                      <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Video className="h-4 w-4 text-[hsl(228,57%,21%)]" />
                            Presentación del curso
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="rounded-lg overflow-hidden mx-auto" style={{ maxWidth: "640px" }}>
                            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                              {embedVideoUrl!.match(/\.(mp4|webm|ogg)(\?|$)/i) ? (
                                <video
                                  src={embedVideoUrl!}
                                  controls
                                  className="absolute inset-0 w-full h-full bg-black"
                                />
                              ) : (
                                <iframe
                                  src={embedVideoUrl!}
                                  className="absolute inset-0 w-full h-full border-0"
                                  title="Presentación del curso"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {/* ── Habilidades ── */}
                  {hasSkills && (
                    <TabsContent value="habilidades" className="mt-0">
                      <div className="space-y-3">
                        {skillsByCategory.map(({ category, skills }, catIdx) => {
                          const palettes = [
                            { bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500",   text: "text-blue-700",   label: "bg-blue-100 text-blue-700"   },
                            { bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-500", text: "text-purple-700", label: "bg-purple-100 text-purple-700" },
                            { bg: "bg-green-50",  border: "border-green-200",  dot: "bg-green-500",  text: "text-green-700",  label: "bg-green-100 text-green-700"  },
                            { bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-500",  text: "text-amber-700",  label: "bg-amber-100 text-amber-700"  },
                            { bg: "bg-rose-50",   border: "border-rose-200",   dot: "bg-rose-500",   text: "text-rose-700",   label: "bg-rose-100 text-rose-700"    },
                          ];
                          const p = palettes[catIdx % palettes.length];
                          return (
                            <Card key={category.id} className={`border ${p.border} ${p.bg}`}>
                              <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className={`text-xs font-bold uppercase tracking-widest ${p.text}`}>
                                  {category.name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="px-4 pb-4 space-y-2">
                                {skills.map((skill: any) => (
                                  <div
                                    key={skill.id}
                                    className="flex items-center gap-3 bg-white/70 rounded-lg px-3 py-2.5 border border-white"
                                  >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                                    <span className="text-sm font-medium text-foreground">
                                      {skill.name}
                                    </span>
                                    {skill.description && (
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        {skill.description}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              );
            })()}
          </TabsContent>

          {/* ══ ACTIVIDADES ══════════════════════════════════════════════════ */}
          <TabsContent value="actividades">
            {loadingActivities ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : activities.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-14 gap-3">
                  <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
                  <p className="font-medium">Sin actividades</p>
                  <p className="text-sm text-muted-foreground">
                    No hay actividades asignadas para esta clase.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Accordion
                type="multiple"
                defaultValue={Object.keys(actividadesByCycle)}
                className="space-y-2"
              >
                {Object.entries(actividadesByCycle).map(([cycleId, acts]) => (
                  <AccordionItem
                    key={cycleId}
                    value={cycleId}
                    className="border rounded-xl px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">
                          {getCycleName(cycleId)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {acts.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-1 pb-2">
                        {acts.map((act: any) => {
                          const status = getActividadStatus(
                            act.due_date ?? act.fechaLimite ?? null,
                          );
                          const cond = act.learning_condition ?? null;
                          const isStudentCond = !!(cond && studentConditions.some(
                            (sc) => sc.id === cond.id
                          ));
                          return (
                            <Card
                              key={act.id}
                              className={`shadow-none transition-colors ${isStudentCond ? "border border-l-4" : "border"}`}
                              style={isStudentCond && cond?.color
                                ? { borderLeftColor: cond.color }
                                : undefined}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-medium text-sm">
                                        {act.title ?? act.nombre ?? "Sin título"}
                                      </p>
                                      {cond && (
                                        <span
                                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                          style={{
                                            backgroundColor: cond.color ? `${cond.color}20` : "#f3f4f6",
                                            color: cond.color ?? "#374151",
                                            border: `1px solid ${cond.color ?? "#d1d5db"}`,
                                          }}
                                        >
                                          <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: cond.color ?? "#374151" }}
                                          />
                                          {cond.name}
                                        </span>
                                      )}
                                      {isStudentCond && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                          <Sparkles className="w-3 h-3" />
                                          Ajustada para tu hijo/a
                                        </span>
                                      )}
                                    </div>
                                    {act.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {act.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                      {(act.due_date ?? act.fechaLimite) && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          Entrega:{" "}
                                          {new Date(
                                            act.due_date ?? act.fechaLimite,
                                          ).toLocaleDateString("es-ES", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </span>
                                      )}
                                      {act.max_score != null && (
                                        <span className="flex items-center gap-1">
                                          <CheckCircle className="h-3 w-3" />
                                          {act.max_score} pts
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Badge
                                    variant={status.variant}
                                    className="shrink-0 text-xs"
                                  >
                                    {status.label}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          {/* ══ CONTENIDO ════════════════════════════════════════════════════ */}
          <TabsContent value="contenido">
            {loadingMaterials ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : materials.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-14 gap-3">
                  <FileText className="h-10 w-10 text-muted-foreground/30" />
                  <p className="font-medium">Sin materiales</p>
                  <p className="text-sm text-muted-foreground">
                    El profesor no ha publicado materiales para esta clase.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Accordion
                type="multiple"
                defaultValue={Object.keys(materialesByCycle)}
                className="space-y-2"
              >
                {Object.entries(materialesByCycle).map(([cycleId, mats]) => (
                  <AccordionItem
                    key={cycleId}
                    value={cycleId}
                    className="border rounded-xl px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">
                          {getCycleName(cycleId)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {mats.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-1 pb-2">
                        {mats.map((mat: any) => {
                          const cond = mat.learning_condition ?? null;
                          return (
                            <Card
                              key={mat.id}
                              className={`shadow-none transition-colors ${cond ? "border border-l-4" : "border"}`}
                              style={cond?.color ? { borderLeftColor: cond.color } : undefined}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div
                                    className="p-2 rounded-lg shrink-0"
                                    style={cond?.color
                                      ? { backgroundColor: `${cond.color}20` }
                                      : undefined}
                                  >
                                    <FileText
                                      className="h-4 w-4"
                                      style={cond?.color ? { color: cond.color } : undefined}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                      <p className="font-medium text-sm">
                                        {mat.title ?? mat.nombre ?? "Sin título"}
                                      </p>
                                      {cond && (
                                        <span
                                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                          style={{
                                            backgroundColor: cond.color ? `${cond.color}20` : "#f3f4f6",
                                            color: cond.color ?? "#374151",
                                            border: `1px solid ${cond.color ?? "#d1d5db"}`,
                                          }}
                                        >
                                          <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: cond.color ?? "#374151" }}
                                          />
                                          {cond.name}
                                        </span>
                                      )}
                                    </div>
                                    {mat.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                        {mat.description}
                                      </p>
                                    )}
                                    {mat.created_at && (
                                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(mat.created_at).toLocaleDateString("es-ES", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </p>
                                    )}
                                  </div>
                                  {mat.file_url && (
                                    <a
                                      href={mat.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="shrink-0"
                                    >
                                      <Button variant="outline" size="sm">
                                        Ver
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          {/* ══ PIAR ═════════════════════════════════════════════════════════ */}
          {hasPiar && (
            <TabsContent value="piar">
              <div className="space-y-4">
                {/* Condiciones del estudiante */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Plan Individual de Ajustes Razonables (PIAR)
                    </CardTitle>
                    <CardDescription>
                      Condiciones de aprendizaje registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {studentConditions.map((cond) => (
                      <div
                        key={cond.id}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                        style={cond.color ? { borderLeftColor: cond.color, borderLeftWidth: 3 } : {}}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cond.color ?? "#a855f7" }}
                        />
                        <span className="text-sm font-medium">{cond.name}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Documentos PIAR */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Documentos PIAR
                    </CardTitle>
                    <div className="mt-2 rounded-lg bg-purple-50 border border-purple-100 px-4 py-3 flex gap-3">
                      <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-purple-800 leading-relaxed">
                        Este documento contiene el plan personalizado de aprendizaje de su hijo(a).
                        Léalo para conocer cómo será acompañado y cómo puede apoyarlo desde casa.
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingPiar ? (
                      <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-sm">Cargando documentos...</span>
                      </div>
                    ) : piarFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FolderOpen className="w-8 h-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No hay documentos PIAR subidos aún
                        </p>
                      </div>
                    ) : (() => {
                        // Agrupar por periodo·ciclo
                        const groups = piarFiles.reduce<Record<string, PiarFile[]>>((acc, f) => {
                          if (!acc[f.groupKey]) acc[f.groupKey] = [];
                          acc[f.groupKey].push(f);
                          return acc;
                        }, {});
                        // "Sin clasificar" siempre al final
                        const sortedKeys = Object.keys(groups).sort((a, b) =>
                          a === "Sin clasificar" ? 1 : b === "Sin clasificar" ? -1 : a.localeCompare(b)
                        );
                        return (
                          <div className="space-y-4">
                            {sortedKeys.map((groupKey) => (
                              <div key={groupKey}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                  <span className="text-xs font-semibold text-purple-700">{groupKey}</span>
                                  <div className="flex-1 h-px bg-purple-100" />
                                </div>
                                <div className="space-y-2">
                                  {groups[groupKey].map((file) => (
                                    <div
                                      key={file.id}
                                      className="flex items-center gap-3 p-3 rounded-lg border bg-purple-50/50"
                                    >
                                      <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {file.title || file.original_name || "Documento PIAR"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          {file.mime_type && (
                                            <span className="text-[10px] text-muted-foreground">
                                              {file.mime_type.split("/")[1]?.toUpperCase()}
                                            </span>
                                          )}
                                          {file.file_size && (
                                            <span className="text-[10px] text-muted-foreground">
                                              {(file.file_size / 1024).toFixed(0)} KB
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        {(file.mime_type?.startsWith("image/") ||
                                          file.mime_type === "application/pdf") && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            title="Abrir en nueva pestaña"
                                            onClick={() => handleOpenPiarInTab(file)}
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          title="Descargar"
                                          disabled={downloadingId === file.id}
                                          onClick={() => handleDownloadPiar(file)}
                                        >
                                          {downloadingId === file.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Download className="w-3.5 h-3.5" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    }
                  </CardContent>
                </Card>

                <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                  Información visible solo para el padre de familia
                </Badge>
              </div>
            </TabsContent>
          )}

          {/* ══ ATENCIÓN A PADRE ═════════════════════════════════════════════ */}
          <TabsContent value="atencion">
            <div className="space-y-4">
              {/* Docente info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Comunicación con el Docente
                  </CardTitle>
                  <CardDescription>
                    Información de contacto para {clase.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-full bg-primary/10 shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Docente</p>
                      <p className="text-sm text-muted-foreground">
                        {clase.teacher}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-full bg-blue-100 shrink-0">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Aula</p>
                      <p className="text-sm text-muted-foreground">
                        {clase.classroom}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-full bg-green-100 shrink-0">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Horario de clase</p>
                      <p className="text-sm text-muted-foreground">
                        Día {clase.dayOfWeek} · {clase.startTime} –{" "}
                        {clase.endTime}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Horarios de atención — placeholder */}
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">
                      Horarios de Atención a Padres
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      El docente publicará sus horarios de atención a padres de
                      familia próximamente.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Próximamente disponible
                  </Badge>
                </CardContent>
              </Card>

              {/* Consejos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Información Importante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      Revise regularmente las actividades y sus fechas de
                      entrega en la pestaña{" "}
                      <span className="font-medium text-foreground">
                        Actividades
                      </span>
                      .
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      Los materiales de estudio están disponibles en la pestaña{" "}
                      <span className="font-medium text-foreground">
                        Contenido
                      </span>
                      .
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      Para consultas urgentes, contacte al docente directamente
                      en el aula durante el horario de clase.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      Consulte la metodología de enseñanza en la pestaña{" "}
                      <span className="font-medium text-foreground">
                        Metodología
                      </span>{" "}
                      para apoyar mejor a su hijo/a en casa.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
