"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { InstituteStore } from "@/Stores/InstituteStore";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText, Download, Calendar, Users, Brain, Search,
  GraduationCap, ClipboardList, BookOpen, Loader2,
  CalendarDays, RefreshCw, CalendarRange, CircleDot,
  AlertTriangle, X, Settings2, User, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportConfigModal } from "./reports/ReportConfigModal";
import type { ReportId } from "./reports/reportConfig.types";
import { generateReport } from "@/app/actions/generate-report";

// ── Types ──────────────────────────────────────────────────────────────────────

type FilterKey =
  | "period"
  | "course"
  | "group"
  | "cycle"
  | "dateRange"
  | "psychStatus"
  | "psychRiskLevel";

interface SelectOption {
  id: string;
  name: string;
}

interface FilterState {
  periodId: string;
  courseId: string;
  groupId: string;
  cycleId: string;
  startDate: string;
  endDate: string;
  psychStatus: string;
  psychRiskLevelId: string;
}

interface Report {
  id: ReportId;
  title: string;
  description: string;
  category: string;
  format: string[];
  icon: LucideIcon;
  colorText: string;
  colorBg: string;
  colorBorder: string;
  filters: FilterKey[];
}

// ── Report definitions ─────────────────────────────────────────────────────────

const reports: Report[] = [
  {
    id: "students-report",
    title: "Estudiantes",
    description:
      "Listado completo de estudiantes matriculados con grupo asignado.",
    category: "Académico",
    format: ["PDF", "Excel"],
    icon: Users,
    colorText: "text-blue-600",
    colorBg: "bg-blue-50 dark:bg-blue-950/30",
    colorBorder: "border-t-blue-500",
    filters: ["period", "course", "group"],
  },
  {
    id: "attendance-report",
    title: "Asistencia",
    description:
      "Estadísticas de asistencia por estudiante, materia y período.",
    category: "Académico",
    format: ["PDF", "Excel"],
    icon: ClipboardList,
    colorText: "text-emerald-600",
    colorBg: "bg-emerald-50 dark:bg-emerald-950/30",
    colorBorder: "border-t-emerald-500",
    filters: ["period", "course", "group"],
  },
  {
    id: "grades-report",
    title: "Calificaciones",
    description: "Notas por ciclo y nota final por estudiante y materia.",
    category: "Académico",
    format: ["PDF", "Excel"],
    icon: BookOpen,
    colorText: "text-indigo-600",
    colorBg: "bg-indigo-50 dark:bg-indigo-950/30",
    colorBorder: "border-t-indigo-500",
    filters: ["period", "course", "group", "cycle"],
  },
  {
    id: "teachers-report",
    title: "Docentes",
    description:
      "Profesores matriculados, materias asignadas y grupos a cargo.",
    category: "Administrativo",
    format: ["PDF", "Excel"],
    icon: GraduationCap,
    colorText: "text-purple-600",
    colorBg: "bg-purple-50 dark:bg-purple-950/30",
    colorBorder: "border-t-purple-500",
    filters: ["period", "course"],
  },
  {
    id: "psychology-report",
    title: "Psicología",
    description:
      "Casos, sesiones, seguimientos y niveles de riesgo por estudiante.",
    category: "Bienestar",
    format: ["PDF"],
    icon: Brain,
    colorText: "text-teal-600",
    colorBg: "bg-teal-50 dark:bg-teal-950/30",
    colorBorder: "border-t-teal-500",
    filters: ["period", "psychStatus", "psychRiskLevel"],
  },
  {
    id: "events-report",
    title: "Eventos",
    description: "Eventos institucionales registrados, fechas y estadísticas.",
    category: "Administrativo",
    format: ["PDF"],
    icon: Calendar,
    colorText: "text-amber-600",
    colorBg: "bg-amber-50 dark:bg-amber-950/30",
    colorBorder: "border-t-amber-500",
    filters: ["dateRange"],
  },
];

const categories = ["Todos", "Académico", "Administrativo", "Bienestar"];

const categoryColor: Record<string, string> = {
  Académico: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Administrativo:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Bienestar: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

const EMPTY_FILTERS: FilterState = {
  periodId: "",
  courseId: "",
  groupId: "",
  cycleId: "",
  startDate: "",
  endDate: "",
  psychStatus: "todos",
  psychRiskLevelId: "",
};

// ── Filter Dialog ──────────────────────────────────────────────────────────────

function ReportFilterDialog({
  report,
  open,
  onClose,
}: {
  report: Report | null;
  open: boolean;
  onClose: () => void;
}) {
  const supabase = createClient();
  const institute_id = InstituteStore((s) => s.institute?.id ?? "");

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);

  // Attendance mode toggle
  const [attendanceMode, setAttendanceMode] = useState<"group" | "student">("group");

  // Grades: tipo (Parcial / Completo) y scope (Grupo / Estudiante dentro de Parcial)
  const [gradesType,  setGradesType]  = useState<"parcial" | "completo">("parcial");
  const [gradesScope, setGradesScope] = useState<"grupo" | "estudiante">("grupo");

  // Student search (attendance student mode + grades estudiante scope)
  const [studentSearch,     setStudentSearch]     = useState("");
  const [students,          setStudents]          = useState<{ id: string; full_name: string; document_number: string | null }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loadingStudents,   setLoadingStudents]   = useState(false);
  const [showStudentList,   setShowStudentList]   = useState(false);

  // Options
  const [periods, setPeriods] = useState<SelectOption[]>([]);
  const [courses, setCourses] = useState<SelectOption[]>([]);
  const [groups, setGroups] = useState<SelectOption[]>([]);
  const [cycles, setCycles] = useState<SelectOption[]>([]);
  const [riskLevels, setRiskLevels] = useState<SelectOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingCycles, setLoadingCycles] = useState(false);

  const has = (f: FilterKey) => report?.filters.includes(f) ?? false;

  // Load base options when dialog opens
  useEffect(() => {
    if (!open || !institute_id || !report) return;
    setFilters(EMPTY_FILTERS);
    setGroups([]);
    setCycles([]);
    setAttendanceMode("group");
    setGradesType("parcial");
    setGradesScope("grupo");
    setStudentSearch("");
    setStudents([]);
    setSelectedStudentId("");
    setShowStudentList(false);

    const load = async () => {
      setLoading(true);
      const fetches: Promise<void>[] = [];

      if (has("period")) {
        fetches.push(
          (async () => {
            const { data } = await supabase
              .from("academic_period")
              .select("id, name")
              .eq("institute_id", institute_id)
              .order("start_date", { ascending: false });
            if (data) setPeriods(data);
          })(),
        );
      }

      if (has("psychRiskLevel")) {
        fetches.push(
          (async () => {
            const { data } = await supabase
              .from("psych_risk_level")
              .select("id, name")
              .eq("institute_id", institute_id)
              .eq("is_active", true)
              .order("sort_order", { ascending: true });
            if (data) setRiskLevels(data);
          })(),
        );
      }

      await Promise.all(fetches);
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, report?.id, institute_id]);

  // Grades + estudiante scope — load students by selected group
  useEffect(() => {
    const active = report?.id === "grades-report" && gradesScope === "estudiante";
    if (!active || !filters.groupId) {
      if (report?.id === "grades-report") setStudents([]);
      return;
    }
    setLoadingStudents(true);
    supabase
      .from("group_has_students")
      .select("enrollment:student_enrolled_id(profiles:user_id(id, full_name, document_number))")
      .eq("group_id", filters.groupId)
      .then(({ data }) => {
        const list = (data ?? [])
          .map((r: any) => r.enrollment?.profiles)
          .filter(Boolean)
          .sort((a: any, b: any) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));
        setStudents(list);
        setLoadingStudents(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.groupId, gradesScope, report?.id]);

  // Student mode: load students when period changes (attendance only)
  useEffect(() => {
    const isAttendanceStudent = report?.id === "attendance-report" && attendanceMode === "student";
    if (!isAttendanceStudent || !filters.periodId) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    supabase
      .from("student_enrolled")
      .select("profiles:user_id(id, full_name, document_number)")
      .eq("academic_period_id", filters.periodId)
      .eq("is_active", true)
      .then(({ data }) => {
        const list = (data ?? [])
          .map((r: any) => r.profiles)
          .filter(Boolean)
          .sort((a: any, b: any) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));
        setStudents(list);
        setLoadingStudents(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.periodId, attendanceMode, report?.id]);

  // Cascada 1: período → cursos que tienen grupos en ese período
  useEffect(() => {
    if (!has("course") || !filters.periodId) {
      setCourses([]);
      return;
    }
    setLoadingCourses(true);
    supabase
      .from("groups")
      .select("courses:course_id(id, name, grade_number)")
      .eq("year", filters.periodId)
      .then(({ data }) => {
        // Deduplicar por course id
        const seen = new Set<string>();
        const unique = (data ?? [])
          .map((r: any) => r.courses)
          .filter((c: any) => c && !seen.has(c.id) && seen.add(c.id))
          .sort((a: any, b: any) => (a.grade_number ?? 0) - (b.grade_number ?? 0));
        setCourses(unique);
        setLoadingCourses(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.periodId]);

  // Cascada 2: curso + período → grupos
  useEffect(() => {
    if (!has("group") || !filters.periodId || !filters.courseId || filters.courseId === "all") {
      setGroups([]);
      return;
    }
    setLoadingGroups(true);
    supabase
      .from("groups")
      .select("id, name")
      .eq("course_id", filters.courseId)
      .eq("year", filters.periodId)
      .order("name", { ascending: true })
      .then(({ data }) => {
        setGroups(data ?? []);
        setLoadingGroups(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.periodId, filters.courseId]);

  // Cascada 3: período → ciclos de ese período
  useEffect(() => {
    if (!has("cycle") || !filters.periodId) {
      setCycles([]);
      return;
    }
    setLoadingCycles(true);
    supabase
      .from("academic_period_has_cycle")
      .select("id, cycles:cycle_id(name)")
      .eq("academic_period_id", filters.periodId)
      .then(({ data }) => {
        const opts = (data ?? [])
          .map((r: any) => ({ id: r.id, name: r.cycles?.name ?? "—" }))
          .filter((o: any) => o.name !== "—") as SelectOption[];
        setCycles(opts);
        setLoadingCycles(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.periodId]);

  const set = (key: keyof FilterState, value: string) =>
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Reset en cascada
      if (key === "periodId") {
        next.courseId = "";
        next.groupId = "";
        next.cycleId = "";
      }
      if (key === "courseId") {
        next.groupId = "";
      }
      return next;
    });

  const canGenerate = () => {
    if (!report) return false;
    if (report.id === "grades-report") {
      if (!filters.periodId || !filters.courseId || !filters.groupId) return false;
      if (gradesType === "parcial" && (!filters.cycleId || filters.cycleId === "all")) return false;
      if (gradesScope === "estudiante" && !selectedStudentId) return false;
      return true;
    }
    if (has("period") && !filters.periodId) return false;
    if (has("dateRange") && (!filters.startDate || !filters.endDate)) return false;
    if (report.id === "attendance-report" && attendanceMode === "student" && !selectedStudentId) return false;
    return true;
  };

  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!canGenerate() || !report) return;
    setGenerating(true);

    const toastId = toast.loading(`Generando reporte de ${report.title}...`);

    try {
      const isAttendanceStudent = report.id === "attendance-report" && attendanceMode === "student";
      const isGradesStudent     = report.id === "grades-report"     && gradesScope === "estudiante";

      const result = await generateReport({
        reportId: report.id,
        instituteId: institute_id,
        periodId: filters.periodId,
        courseId:   isAttendanceStudent ? undefined : (filters.courseId || undefined),
        groupId:    isAttendanceStudent ? undefined : (filters.groupId  || undefined),
        cycleId:    filters.cycleId || undefined,
        studentId:  isAttendanceStudent || isGradesStudent ? selectedStudentId : undefined,
        attendanceMode: report.id === "attendance-report" ? attendanceMode : undefined,
        gradesType:  report.id === "grades-report" ? gradesType  : undefined,
        gradesScope: report.id === "grades-report" ? gradesScope : undefined,
      });

      if ("error" in result) {
        toast.dismiss(toastId);
        toast.error("Error al generar el reporte", { description: result.error });
        setGenerating(false);
        return;
      }

      // Convert base64 → Blob → download
      const bytes = Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success(`Reporte de ${report.title} descargado`);
      onClose();
    } catch {
      toast.dismiss(toastId);
      toast.error("Error inesperado al generar el reporte");
    } finally {
      setGenerating(false);
    }
  };

  if (!report) return null;
  const Icon = report.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">
          Generar reporte de {report.title}
        </DialogTitle>

        {/* ── Header coloreado ── */}
        <div className={`relative px-6 pt-6 pb-5 ${report.colorBg} border-b`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-background/70 shadow-sm flex items-center justify-center shrink-0">
              <Icon className={`w-6 h-6 ${report.colorText}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Generar reporte
              </p>
              <h2 className="font-bold text-foreground leading-tight">{report.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                {report.description}
              </p>
            </div>
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">

              {report.id === "grades-report" ? (
                /* ══════════════════════════════════════════
                   CALIFICACIONES — UI rediseñada
                   ══════════════════════════════════════════ */
                <>
                  {/* Parcial | Completo */}
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    {(["parcial", "completo"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setGradesType(type);
                          setGradesScope("grupo");
                          setFilters(EMPTY_FILTERS);
                          setSelectedStudentId("");
                          setStudentSearch("");
                          setShowStudentList(false);
                        }}
                        className={cn(
                          "flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                          gradesType === type
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {type === "parcial" ? "Parcial" : "Completo"}
                      </button>
                    ))}
                  </div>

                  {/* Período — shared by both Parcial and Completo */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs font-medium">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                      Período académico
                      <span className="text-destructive ml-0.5">*</span>
                    </Label>
                    <Select value={filters.periodId} onValueChange={(v) => set("periodId", v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecciona un período" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ciclo / Trimestre — Parcial only, required */}
                  {gradesType === "parcial" && filters.periodId && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                        Ciclo / Trimestre
                        <span className="text-destructive ml-0.5">*</span>
                        {loadingCycles && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
                      </Label>
                      <Select
                        value={filters.cycleId}
                        onValueChange={(v) => set("cycleId", v)}
                        disabled={loadingCycles}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={loadingCycles ? "Cargando ciclos..." : cycles.length === 0 ? "Sin ciclos en este período" : "Selecciona un ciclo"} />
                        </SelectTrigger>
                        <SelectContent>
                          {cycles.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Curso — aparece cuando hay período */}
                  {filters.periodId && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                        Curso
                        <span className="text-destructive ml-0.5">*</span>
                        {loadingCourses && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
                      </Label>
                      <Select
                        value={filters.courseId}
                        onValueChange={(v) => set("courseId", v)}
                        disabled={loadingCourses}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={
                            loadingCourses ? "Cargando cursos..."
                            : courses.length === 0 ? "Sin cursos en este período"
                            : "Selecciona un curso"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Grupo | Estudiante toggle — aparece cuando hay curso */}
                  {filters.courseId && (
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                      {(["grupo", "estudiante"] as const).map((scope) => (
                        <button
                          key={scope}
                          onClick={() => {
                            setGradesScope(scope);
                            setFilters((prev) => ({ ...prev, groupId: "" }));
                            setSelectedStudentId("");
                            setStudentSearch("");
                            setShowStudentList(false);
                          }}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                            gradesScope === scope
                              ? "bg-background shadow-sm text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {scope === "grupo" ? "Grupo" : "Estudiante"}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Grupo — aparece cuando hay curso */}
                  {filters.courseId && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        Grupo
                        <span className="text-destructive ml-0.5">*</span>
                        {loadingGroups && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
                      </Label>
                      <Select
                        value={filters.groupId}
                        onValueChange={(v) => set("groupId", v)}
                        disabled={loadingGroups}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={
                            loadingGroups ? "Cargando grupos..."
                            : groups.length === 0 ? "Sin grupos en este curso"
                            : "Selecciona un grupo"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((g) => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Estudiante — solo en scope "estudiante" y con grupo seleccionado */}
                  {gradesScope === "estudiante" && filters.groupId && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Estudiante
                        <span className="text-destructive ml-0.5">*</span>
                        {loadingStudents && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
                      </Label>
                      {selectedStudentId ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-md border border-indigo-200 dark:border-indigo-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium flex-1 truncate">
                            {students.find((s) => s.id === selectedStudentId)?.full_name}
                          </span>
                          <button
                            onClick={() => { setSelectedStudentId(""); setStudentSearch(""); setShowStudentList(false); }}
                            className="text-indigo-400 hover:text-indigo-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                          <Input
                            value={studentSearch}
                            onChange={(e) => { setStudentSearch(e.target.value); setShowStudentList(true); }}
                            onFocus={() => setShowStudentList(true)}
                            placeholder={loadingStudents ? "Cargando estudiantes..." : "Buscar por nombre o documento..."}
                            disabled={loadingStudents}
                            className="h-9 pl-8 text-sm"
                          />
                          {showStudentList && studentSearch.length >= 1 && (
                            <div className="absolute z-10 top-full mt-1 w-full border rounded-md bg-background shadow-md divide-y max-h-44 overflow-y-auto">
                              {students
                                .filter((s) =>
                                  s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                  s.document_number?.includes(studentSearch),
                                )
                                .slice(0, 10)
                                .map((s) => (
                                  <button
                                    key={s.id}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      setSelectedStudentId(s.id);
                                      setStudentSearch(s.full_name ?? "");
                                      setShowStudentList(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between gap-2"
                                  >
                                    <span className="font-medium truncate">{s.full_name}</span>
                                    {s.document_number && (
                                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{s.document_number}</span>
                                    )}
                                  </button>
                                ))}
                              {students.filter((s) =>
                                s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                s.document_number?.includes(studentSearch),
                              ).length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* ══════════════════════════════════════════
                   RESTO DE REPORTES — filtros genéricos
                   ══════════════════════════════════════════ */
                <>
                  {/* Attendance mode toggle */}
                  {report.id === "attendance-report" && (
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                      {(["group", "student"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setAttendanceMode(mode);
                            setSelectedStudentId("");
                            setStudentSearch("");
                            setShowStudentList(false);
                          }}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                            attendanceMode === mode
                              ? "bg-background shadow-sm text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {mode === "group" ? "Por grupo" : "Por alumno"}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Período académico */}
                  {has("period") && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                        Período académico
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Select value={filters.periodId} onValueChange={(v) => set("periodId", v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecciona un período" />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Student selector (attendance – student mode) */}
                  {(report.id === "attendance-report" && attendanceMode === "student") && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Estudiante
                        <span className="text-destructive ml-0.5">*</span>
                        {loadingStudents && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
                      </Label>
                      {selectedStudentId ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex-1 truncate">
                            {students.find((s) => s.id === selectedStudentId)?.full_name}
                          </span>
                          <button
                            onClick={() => { setSelectedStudentId(""); setStudentSearch(""); setShowStudentList(false); }}
                            className="text-emerald-400 hover:text-emerald-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                          <Input
                            value={studentSearch}
                            onChange={(e) => { setStudentSearch(e.target.value); setShowStudentList(true); }}
                            onFocus={() => setShowStudentList(true)}
                            placeholder={
                              !filters.periodId ? "Selecciona un período primero"
                              : loadingStudents ? "Cargando estudiantes..."
                              : "Buscar por nombre o documento..."
                            }
                            disabled={!filters.periodId || loadingStudents}
                            className="h-9 pl-8 text-sm"
                          />
                          {showStudentList && studentSearch.length >= 1 && (
                            <div className="absolute z-10 top-full mt-1 w-full border rounded-md bg-background shadow-md divide-y max-h-44 overflow-y-auto">
                              {students
                                .filter((s) =>
                                  s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                  s.document_number?.includes(studentSearch),
                                )
                                .slice(0, 10)
                                .map((s) => (
                                  <button
                                    key={s.id}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      setSelectedStudentId(s.id);
                                      setStudentSearch(s.full_name ?? "");
                                      setShowStudentList(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between gap-2"
                                  >
                                    <span className="font-medium truncate">{s.full_name}</span>
                                    {s.document_number && (
                                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{s.document_number}</span>
                                    )}
                                  </button>
                                ))}
                              {students.filter((s) =>
                                s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                s.document_number?.includes(studentSearch),
                              ).length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Curso */}
                  {has("course") && !(report.id === "attendance-report" && attendanceMode === "student") && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                        Curso
                        <span className="text-muted-foreground font-normal ml-0.5">(opcional)</span>
                        {loadingCourses && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
                      </Label>
                      <Select
                        value={filters.courseId}
                        onValueChange={(v) => set("courseId", v)}
                        disabled={!filters.periodId || loadingCourses}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={
                            !filters.periodId ? "Selecciona un período primero"
                            : loadingCourses ? "Cargando cursos..."
                            : courses.length === 0 ? "Sin cursos en este período"
                            : "Todos los cursos"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los cursos</SelectItem>
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Grupo */}
                  {has("group") && filters.courseId && filters.courseId !== "all" && !(report.id === "attendance-report" && attendanceMode === "student") && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        Grupo
                        <span className="text-muted-foreground font-normal ml-0.5">(opcional)</span>
                        {loadingGroups && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
                      </Label>
                      <Select
                        value={filters.groupId}
                        onValueChange={(v) => set("groupId", v)}
                        disabled={loadingGroups}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={loadingGroups ? "Cargando grupos..." : "Todos los grupos"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los grupos</SelectItem>
                          {groups.map((g) => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Ciclo / Trimestre */}
                  {has("cycle") && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                        Ciclo / Trimestre
                        <span className="text-muted-foreground font-normal ml-0.5">(opcional)</span>
                        {loadingCycles && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
                      </Label>
                      <Select
                        value={filters.cycleId}
                        onValueChange={(v) => set("cycleId", v)}
                        disabled={!filters.periodId || loadingCycles}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={
                            !filters.periodId ? "Selecciona un período primero"
                            : loadingCycles ? "Cargando ciclos..."
                            : "Todos los ciclos"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los ciclos</SelectItem>
                          {cycles.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Estado psicológico */}
                  {has("psychStatus") && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <CircleDot className="w-3.5 h-3.5 text-muted-foreground" />
                        Estado del caso
                      </Label>
                      <Select value={filters.psychStatus} onValueChange={(v) => set("psychStatus", v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="activo">Activos</SelectItem>
                          <SelectItem value="cerrado">Cerrados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Nivel de riesgo */}
                  {has("psychRiskLevel") && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                        Nivel de riesgo
                        <span className="text-muted-foreground font-normal ml-0.5">(opcional)</span>
                      </Label>
                      <Select value={filters.psychRiskLevelId} onValueChange={(v) => set("psychRiskLevelId", v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Todos los niveles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los niveles</SelectItem>
                          {riskLevels.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Rango de fechas */}
                  {has("dateRange") && (
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <CalendarRange className="w-3.5 h-3.5 text-muted-foreground" />
                        Rango de fechas
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground pl-0.5">Inicio</p>
                          <Input
                            id="start-date"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => set("startDate", e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground pl-0.5">Fin</p>
                          <Input
                            id="end-date"
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => set("endDate", e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 flex gap-2 border-t pt-4 bg-muted/20">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate() || loading || generating}
            className="flex-1 gap-2"
          >
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generando...</>
              : <><Download className="w-4 h-4" />Generar reporte</>
            }
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ReportsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [configReport, setConfigReport] = useState<Report | null>(null);

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat =
      selectedCategory === "Todos" || r.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 max-[100dvw]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Genera y descarga reportes del sistema con filtros específicos por
          tipo.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <Input
            placeholder="Buscar reporte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-xl bg-muted/20 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Sin resultados para &quot;{searchTerm}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className={`border-t-4 ${report.colorBorder} hover:shadow-md transition-all duration-200 flex flex-col`}
              >
                <CardContent className="p-5 flex flex-col flex-1 gap-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl ${report.colorBg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${report.colorText}`} />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${categoryColor[report.category]}`}
                    >
                      {report.category}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground leading-tight">
                      {report.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {report.description}
                    </p>
                    {/* Filter tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {report.filters.map((f) => (
                        <span
                          key={f}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize"
                        >
                          {f === "period"
                            ? "período"
                            : f === "course"
                              ? "curso"
                              : f === "group"
                                ? "grupo"
                                : f === "cycle"
                                  ? "ciclo"
                                  : f === "dateRange"
                                    ? "fechas"
                                    : f === "psychStatus"
                                      ? "estado"
                                      : f === "psychRiskLevel"
                                        ? "riesgo"
                                        : f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex gap-1">
                      {report.format.map((f) => (
                        <span
                          key={f}
                          className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        title="Configurar reporte"
                        onClick={() => setConfigReport(report)}
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-8 gap-1.5 text-xs ${report.colorText}`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Generar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ReportFilterDialog
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      <ReportConfigModal
        report={configReport}
        open={!!configReport}
        onClose={() => setConfigReport(null)}
      />
    </div>
  );
}
