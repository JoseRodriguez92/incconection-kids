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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
  | "period" | "course" | "group" | "cycle"
  | "dateRange" | "psychStatus" | "psychRiskLevel";

interface SelectOption { id: string; name: string }

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
  hidden?: boolean;
}

type StudentRow = { id: string; full_name: string; document_number: string | null };

// ── Constants ──────────────────────────────────────────────────────────────────

const FILTER_LABEL: Record<FilterKey, string> = {
  period: "período",
  course: "curso",
  group: "grupo",
  cycle: "ciclo",
  dateRange: "fechas",
  psychStatus: "estado",
  psychRiskLevel: "riesgo",
};

const CATEGORY_COLOR: Record<string, string> = {
  Académico:      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Administrativo: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Bienestar:      "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

const EMPTY_FILTERS: FilterState = {
  periodId: "", courseId: "", groupId: "", cycleId: "",
  startDate: "", endDate: "", psychStatus: "todos", psychRiskLevelId: "",
};

// ── Report definitions ─────────────────────────────────────────────────────────

const REPORTS: Report[] = [
  {
    id: "students-report",
    title: "Estudiantes",
    description: "Listado completo de estudiantes matriculados con grupo asignado.",
    category: "Académico",
    format: ["PDF"],
    icon: Users,
    colorText: "text-blue-600",
    colorBg: "bg-blue-50 dark:bg-blue-950/30",
    colorBorder: "border-t-blue-500",
    filters: ["period", "course", "group"],
  },
  {
    id: "attendance-report",
    title: "Asistencia",
    description: "Estadísticas de asistencia por estudiante, materia y período.",
    category: "Académico",
    format: ["PDF"],
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
    description: "Profesores matriculados, materias asignadas y grupos a cargo.",
    category: "Administrativo",
    format: ["PDF"],
    icon: GraduationCap,
    colorText: "text-purple-600",
    colorBg: "bg-purple-50 dark:bg-purple-950/30",
    colorBorder: "border-t-purple-500",
    filters: ["period", "course"],
    hidden: true,
  },
  {
    id: "psychology-report",
    title: "Psicología",
    description: "Casos, sesiones, seguimientos y niveles de riesgo por estudiante.",
    category: "Bienestar",
    format: ["PDF"],
    icon: Brain,
    colorText: "text-teal-600",
    colorBg: "bg-teal-50 dark:bg-teal-950/30",
    colorBorder: "border-t-teal-500",
    filters: ["period", "psychStatus", "psychRiskLevel"],
    hidden: true,
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
    hidden: true,
  },
];

const VISIBLE_REPORTS = REPORTS.filter((r) => !r.hidden);
const CATEGORIES = ["Todos", ...Array.from(new Set(VISIBLE_REPORTS.map((r) => r.category)))];

// ── StudentPicker ──────────────────────────────────────────────────────────────

function StudentPicker({
  students, loading, disabled, disabledPlaceholder,
  selectedId, onSelect, onClear,
  selectedBg = "bg-primary/5",
  selectedBorder = "border-primary/20",
  selectedText = "text-foreground",
}: {
  students: StudentRow[];
  loading: boolean;
  disabled?: boolean;
  disabledPlaceholder?: string;
  selectedId: string;
  onSelect: (id: string) => void;
  onClear: () => void;
  selectedBg?: string;
  selectedBorder?: string;
  selectedText?: string;
}) {
  const [search, setSearch] = useState("");
  const [open,   setOpen]   = useState(false);

  const matches = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.document_number?.includes(search),
  );

  if (selectedId) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border", selectedBg, selectedBorder)}>
        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        <span className={cn("text-xs font-medium flex-1 truncate", selectedText)}>
          {students.find((s) => s.id === selectedId)?.full_name}
        </span>
        <button onClick={() => { onClear(); setSearch(""); }} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      <Input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={
          disabled ? (disabledPlaceholder ?? "—")
          : loading ? "Cargando estudiantes..."
          : "Nombre o documento..."
        }
        disabled={disabled || loading}
        className="h-9 pl-8 text-sm"
      />
      {open && search.length >= 1 && (
        <div className="absolute z-10 top-full mt-1 w-full border rounded-md bg-background shadow-md divide-y max-h-44 overflow-y-auto">
          {matches.slice(0, 10).map((s) => (
            <button
              key={s.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onSelect(s.id); setSearch(s.full_name ?? ""); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between gap-2"
            >
              <span className="font-medium truncate">{s.full_name}</span>
              {s.document_number && (
                <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{s.document_number}</span>
              )}
            </button>
          ))}
          {matches.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── GradesFilters ──────────────────────────────────────────────────────────────

function GradesFilters({
  filters, gradesType, gradesScope,
  periods, courses, groups, cycles, students, selectedStudentId,
  loadingCourses, loadingGroups, loadingCycles, loadingStudents,
  showCourseStep,
  onSetFilter, onGradesTypeChange, onGradesScopeChange,
  onSelectStudent, onClearStudent,
}: {
  filters: FilterState;
  gradesType: "parcial" | "completo";
  gradesScope: "grupo" | "estudiante";
  periods: SelectOption[];
  courses: SelectOption[];
  groups: SelectOption[];
  cycles: SelectOption[];
  students: StudentRow[];
  selectedStudentId: string;
  loadingCourses: boolean;
  loadingGroups: boolean;
  loadingCycles: boolean;
  loadingStudents: boolean;
  showCourseStep: boolean;
  onSetFilter: (key: keyof FilterState, value: string) => void;
  onGradesTypeChange: (t: "parcial" | "completo") => void;
  onGradesScopeChange: (s: "grupo" | "estudiante") => void;
  onSelectStudent: (id: string) => void;
  onClearStudent: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Tipo: Parcial / Completo */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Tipo de reporte
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["parcial", "completo"] as const).map((type) => (
            <button
              key={type}
              onClick={() => onGradesTypeChange(type)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all",
                gradesType === type
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border",
              )}
            >
              {type === "parcial"
                ? <RefreshCw   className={cn("w-4 h-4", gradesType === type ? "text-primary" : "text-muted-foreground")} />
                : <CalendarRange className={cn("w-4 h-4", gradesType === type ? "text-primary" : "text-muted-foreground")} />
              }
              <span className={cn("text-xs font-semibold", gradesType === type ? "text-primary" : "text-muted-foreground")}>
                {type === "parcial" ? "Parcial" : "Completo"}
              </span>
              <span className="text-[9px] text-muted-foreground/70 leading-tight text-center">
                {type === "parcial" ? "Un trimestre" : "Todos los ciclos"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border/40" />

      {/* Período + Ciclo */}
      <div className={cn("grid gap-3", gradesType === "parcial" ? "grid-cols-2" : "grid-cols-1")}>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            Período <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Select value={filters.periodId} onValueChange={(v) => onSetFilter("periodId", v)}>
            <SelectTrigger className="h-9 w-full text-xs">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {gradesType === "parcial" && (
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium">
              <CircleDot className="w-3.5 h-3.5 text-muted-foreground" />
              Trimestre <span className="text-destructive ml-0.5">*</span>
              {loadingCycles && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
            </Label>
            <Select
              value={filters.cycleId}
              onValueChange={(v) => onSetFilter("cycleId", v)}
              disabled={!filters.periodId || loadingCycles}
            >
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue placeholder={
                  !filters.periodId ? "Elige período"
                  : loadingCycles ? "Cargando..."
                  : cycles.length === 0 ? "Sin ciclos"
                  : "Selecciona"
                } />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Curso */}
      {showCourseStep && (
        <>
          <div className="h-px bg-border/40" />
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
              Curso <span className="text-destructive ml-0.5">*</span>
              {loadingCourses && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
            </Label>
            <Select value={filters.courseId} onValueChange={(v) => onSetFilter("courseId", v)} disabled={loadingCourses}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={
                  loadingCourses ? "Cargando cursos..."
                  : courses.length === 0 ? "Sin cursos en este período"
                  : "Selecciona un curso"
                } />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Scope selector + Grupo + Estudiante */}
      {filters.courseId && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {(["grupo", "estudiante"] as const).map((scope) => (
              <button
                key={scope}
                onClick={() => onGradesScopeChange(scope)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all",
                  gradesScope === scope
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:border-border",
                )}
              >
                {scope === "grupo" ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {scope === "grupo" ? "Grupo" : "Estudiante"}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              Grupo <span className="text-destructive ml-0.5">*</span>
              {loadingGroups && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
            </Label>
            <Select value={filters.groupId} onValueChange={(v) => onSetFilter("groupId", v)} disabled={loadingGroups}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={
                  loadingGroups ? "Cargando grupos..."
                  : groups.length === 0 ? "Sin grupos en este curso"
                  : "Selecciona un grupo"
                } />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {gradesScope === "estudiante" && filters.groupId && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Estudiante <span className="text-destructive ml-0.5">*</span>
                {loadingStudents && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
              </Label>
              <StudentPicker
                students={students}
                loading={loadingStudents}
                selectedId={selectedStudentId}
                onSelect={onSelectStudent}
                onClear={onClearStudent}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── GenericFilters ─────────────────────────────────────────────────────────────

function GenericFilters({
  report, filters, attendanceMode,
  periods, courses, groups, cycles, riskLevels, students, selectedStudentId,
  loadingCourses, loadingGroups, loadingCycles, loadingStudents,
  isAttendanceStudent, has,
  onSetFilter, onAttendanceModeChange, onSelectStudent, onClearStudent,
}: {
  report: Report;
  filters: FilterState;
  attendanceMode: "group" | "student";
  periods: SelectOption[];
  courses: SelectOption[];
  groups: SelectOption[];
  cycles: SelectOption[];
  riskLevels: SelectOption[];
  students: StudentRow[];
  selectedStudentId: string;
  loadingCourses: boolean;
  loadingGroups: boolean;
  loadingCycles: boolean;
  loadingStudents: boolean;
  isAttendanceStudent: boolean;
  has: (f: FilterKey) => boolean;
  onSetFilter: (key: keyof FilterState, value: string) => void;
  onAttendanceModeChange: (mode: "group" | "student") => void;
  onSelectStudent: (id: string) => void;
  onClearStudent: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Attendance mode toggle */}
      {report.id === "attendance-report" && (
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {(["group", "student"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onAttendanceModeChange(mode)}
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

      {/* Período */}
      {has("period") && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            Período académico <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Select value={filters.periodId} onValueChange={(v) => onSetFilter("periodId", v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecciona un período" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Attendance student picker */}
      {isAttendanceStudent && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            Estudiante <span className="text-destructive ml-0.5">*</span>
            {loadingStudents && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
          </Label>
          <StudentPicker
            students={students}
            loading={loadingStudents}
            disabled={!filters.periodId}
            disabledPlaceholder="Selecciona un período primero"
            selectedId={selectedStudentId}
            onSelect={onSelectStudent}
            onClear={onClearStudent}
            selectedBg="bg-emerald-50 dark:bg-emerald-950/30"
            selectedBorder="border-emerald-200 dark:border-emerald-800"
            selectedText="text-emerald-700 dark:text-emerald-300"
          />
        </div>
      )}

      {/* Curso */}
      {has("course") && !isAttendanceStudent && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
            Curso <span className="text-muted-foreground font-normal ml-0.5">(opcional)</span>
            {loadingCourses && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
          </Label>
          <Select value={filters.courseId} onValueChange={(v) => onSetFilter("courseId", v)} disabled={!filters.periodId || loadingCourses}>
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
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Grupo */}
      {has("group") && filters.courseId && filters.courseId !== "all" && !isAttendanceStudent && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            Grupo <span className="text-muted-foreground font-normal ml-0.5">(opcional)</span>
            {loadingGroups && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
          </Label>
          <Select value={filters.groupId} onValueChange={(v) => onSetFilter("groupId", v)} disabled={loadingGroups}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder={loadingGroups ? "Cargando grupos..." : "Todos los grupos"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los grupos</SelectItem>
              {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Ciclo */}
      {has("cycle") && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            Ciclo / Trimestre <span className="text-muted-foreground font-normal ml-0.5">(opcional)</span>
            {loadingCycles && <Loader2 className="w-3 h-3 animate-spin ml-auto text-muted-foreground" />}
          </Label>
          <Select value={filters.cycleId} onValueChange={(v) => onSetFilter("cycleId", v)} disabled={!filters.periodId || loadingCycles}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder={
                !filters.periodId ? "Selecciona un período primero"
                : loadingCycles ? "Cargando ciclos..."
                : "Todos los ciclos"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los ciclos</SelectItem>
              {cycles.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
          <Select value={filters.psychStatus} onValueChange={(v) => onSetFilter("psychStatus", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
            Nivel de riesgo <span className="text-muted-foreground font-normal ml-0.5">(opcional)</span>
          </Label>
          <Select value={filters.psychRiskLevelId} onValueChange={(v) => onSetFilter("psychRiskLevelId", v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos los niveles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              {riskLevels.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Rango de fechas */}
      {has("dateRange") && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <CalendarRange className="w-3.5 h-3.5 text-muted-foreground" />
            Rango de fechas <span className="text-destructive ml-0.5">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground pl-0.5">Inicio</p>
              <Input type="date" value={filters.startDate} onChange={(e) => onSetFilter("startDate", e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground pl-0.5">Fin</p>
              <Input type="date" value={filters.endDate} onChange={(e) => onSetFilter("endDate", e.target.value)} className="h-9" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ReportFilterDialog ─────────────────────────────────────────────────────────

function ReportFilterDialog({
  report, open, onClose,
}: {
  report: Report | null;
  open: boolean;
  onClose: () => void;
}) {
  const supabase     = createClient();
  const institute_id = InstituteStore((s) => s.institute?.id ?? "");

  const [filters,    setFilters]    = useState<FilterState>(EMPTY_FILTERS);
  const [loading,    setLoading]    = useState(false);
  const [generating, setGenerating] = useState(false);

  const [attendanceMode, setAttendanceMode] = useState<"group" | "student">("group");
  const [gradesType,     setGradesType]     = useState<"parcial" | "completo">("parcial");
  const [gradesScope,    setGradesScope]    = useState<"grupo" | "estudiante">("grupo");

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [students,          setStudents]          = useState<StudentRow[]>([]);
  const [loadingStudents,   setLoadingStudents]   = useState(false);

  const [periods,       setPeriods]       = useState<SelectOption[]>([]);
  const [courses,       setCourses]       = useState<SelectOption[]>([]);
  const [groups,        setGroups]        = useState<SelectOption[]>([]);
  const [cycles,        setCycles]        = useState<SelectOption[]>([]);
  const [riskLevels,    setRiskLevels]    = useState<SelectOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingGroups,  setLoadingGroups]  = useState(false);
  const [loadingCycles,  setLoadingCycles]  = useState(false);

  const has = (f: FilterKey) => report?.filters.includes(f) ?? false;

  // Reset + initial load
  useEffect(() => {
    if (!open || !institute_id || !report) return;
    setFilters(EMPTY_FILTERS);
    setGroups([]); setCycles([]);
    setAttendanceMode("group");
    setGradesType("parcial"); setGradesScope("grupo");
    setStudents([]); setSelectedStudentId("");

    (async () => {
      setLoading(true);
      const fetches: Promise<void>[] = [];

      if (has("period")) {
        fetches.push(
          Promise.resolve(
            supabase
              .from("academic_period")
              .select("id, name, start_date")
              .eq("institute_id", institute_id)
              .order("name", { ascending: false })
              .then(({ data }) => { if (data) setPeriods(data); }),
          ),
        );
      }

      if (has("psychRiskLevel")) {
        fetches.push(
          Promise.resolve(
            supabase
              .from("psych_risk_level")
              .select("id, name")
              .eq("institute_id", institute_id)
              .eq("is_active", true)
              .order("sort_order", { ascending: true })
              .then(({ data }) => { if (data) setRiskLevels(data); }),
          ),
        );
      }

      await Promise.all(fetches);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, report?.id, institute_id]);

  // Grades + estudiante → students from selected group
  useEffect(() => {
    if (report?.id !== "grades-report" || gradesScope !== "estudiante" || !filters.groupId) {
      if (report?.id === "grades-report") setStudents([]);
      return;
    }
    setLoadingStudents(true);
    supabase
      .from("group_has_students")
      .select("enrollment:student_enrolled_id(profiles:user_id(id, full_name, document_number))")
      .eq("group_id", filters.groupId)
      .then(({ data }) => {
        setStudents(
          (data ?? [])
            .map((r: any) => r.enrollment?.profiles)
            .filter(Boolean)
            .sort((a: any, b: any) => (a.full_name ?? "").localeCompare(b.full_name ?? "")),
        );
        setLoadingStudents(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.groupId, gradesScope, report?.id]);

  // Attendance + student mode → students from selected period
  useEffect(() => {
    if (report?.id !== "attendance-report" || attendanceMode !== "student" || !filters.periodId) {
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
        setStudents(
          (data ?? [])
            .map((r: any) => r.profiles)
            .filter(Boolean)
            .sort((a: any, b: any) => (a.full_name ?? "").localeCompare(b.full_name ?? "")),
        );
        setLoadingStudents(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.periodId, attendanceMode, report?.id]);

  // Período → cursos
  useEffect(() => {
    if (!has("course") || !filters.periodId) { setCourses([]); return; }
    setLoadingCourses(true);
    supabase
      .from("groups")
      .select("courses:course_id(id, name, grade_number)")
      .eq("year", filters.periodId)
      .then(({ data }) => {
        const seen = new Set<string>();
        setCourses(
          (data ?? [])
            .map((r: any) => r.courses)
            .filter((c: any) => c && !seen.has(c.id) && seen.add(c.id))
            .sort((a: any, b: any) => (a.grade_number ?? 0) - (b.grade_number ?? 0)),
        );
        setLoadingCourses(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.periodId]);

  // Curso + período → grupos
  useEffect(() => {
    if (!has("group") || !filters.periodId || !filters.courseId || filters.courseId === "all") {
      setGroups([]); return;
    }
    setLoadingGroups(true);
    supabase
      .from("groups")
      .select("id, name")
      .eq("course_id", filters.courseId)
      .eq("year", filters.periodId)
      .order("name", { ascending: true })
      .then(({ data }) => { setGroups(data ?? []); setLoadingGroups(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.periodId, filters.courseId]);

  // Período → ciclos activos
  useEffect(() => {
    if (!has("cycle") || !filters.periodId) { setCycles([]); return; }
    setLoadingCycles(true);
    supabase
      .from("academic_period_has_cycle")
      .select("id, cycles:cycle_id(name)")
      .eq("academic_period_id", filters.periodId)
      .eq("is_active", true)
      .then(({ data }) => {
        setCycles(
          (data ?? [])
            .map((r: any) => ({ id: r.id, name: r.cycles?.name ?? "—" }))
            .filter((o: any) => o.name !== "—"),
        );
        setLoadingCycles(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.periodId]);

  const setFilter = (key: keyof FilterState, value: string) =>
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "periodId") { next.courseId = ""; next.groupId = ""; next.cycleId = ""; }
      if (key === "courseId") { next.groupId = ""; }
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

  const handleGenerate = async () => {
    if (!canGenerate() || !report) return;
    setGenerating(true);
    const toastId = toast.loading(`Generando reporte de ${report.title}...`);
    try {
      const isAttendanceStudent = report.id === "attendance-report" && attendanceMode === "student";
      const isGradesStudent     = report.id === "grades-report"     && gradesScope === "estudiante";

      const result = await generateReport({
        reportId:       report.id,
        instituteId:    institute_id,
        periodId:       filters.periodId,
        courseId:       isAttendanceStudent ? undefined : (filters.courseId || undefined),
        groupId:        isAttendanceStudent ? undefined : (filters.groupId  || undefined),
        cycleId:        filters.cycleId || undefined,
        studentId:      isAttendanceStudent || isGradesStudent ? selectedStudentId : undefined,
        attendanceMode: report.id === "attendance-report" ? attendanceMode : undefined,
        gradesType:     report.id === "grades-report" ? gradesType  : undefined,
        gradesScope:    report.id === "grades-report" ? gradesScope : undefined,
      });

      if ("error" in result) {
        toast.dismiss(toastId);
        toast.error("Error al generar el reporte", { description: result.error });
        return;
      }

      const bytes = Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0));
      const blob  = new Blob([bytes], { type: result.mimeType });
      const url   = URL.createObjectURL(blob);
      const a     = document.createElement("a");
      a.href = url; a.download = result.filename;
      document.body.appendChild(a); a.click(); a.remove();
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
  const isAttendanceStudent = report.id === "attendance-report" && attendanceMode === "student";
  const showCourseStep = !!filters.periodId && (gradesType === "completo" || !!filters.cycleId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">Generar reporte de {report.title}</DialogTitle>

        {/* Header */}
        <div className={cn("relative px-6 pt-6 pb-5 border-b", report.colorBg)}>
          <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-background/70 shadow-sm flex items-center justify-center shrink-0">
              <Icon className={cn("w-6 h-6", report.colorText)} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-0.5">Generar reporte</p>
              <h2 className="font-bold text-foreground leading-tight">{report.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{report.description}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
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
          ) : report.id === "grades-report" ? (
            <GradesFilters
              filters={filters}
              gradesType={gradesType}
              gradesScope={gradesScope}
              periods={periods}
              courses={courses}
              groups={groups}
              cycles={cycles}
              students={students}
              selectedStudentId={selectedStudentId}
              loadingCourses={loadingCourses}
              loadingGroups={loadingGroups}
              loadingCycles={loadingCycles}
              loadingStudents={loadingStudents}
              showCourseStep={showCourseStep}
              onSetFilter={setFilter}
              onGradesTypeChange={(type) => {
                setGradesType(type);
                setGradesScope("grupo");
                setFilters(EMPTY_FILTERS);
                setSelectedStudentId("");
              }}
              onGradesScopeChange={(scope) => {
                setGradesScope(scope);
                setFilters((prev) => ({ ...prev, groupId: "" }));
                setSelectedStudentId("");
              }}
              onSelectStudent={setSelectedStudentId}
              onClearStudent={() => setSelectedStudentId("")}
            />
          ) : (
            <GenericFilters
              report={report}
              filters={filters}
              attendanceMode={attendanceMode}
              periods={periods}
              courses={courses}
              groups={groups}
              cycles={cycles}
              riskLevels={riskLevels}
              students={students}
              selectedStudentId={selectedStudentId}
              loadingCourses={loadingCourses}
              loadingGroups={loadingGroups}
              loadingCycles={loadingCycles}
              loadingStudents={loadingStudents}
              isAttendanceStudent={isAttendanceStudent}
              has={has}
              onSetFilter={setFilter}
              onAttendanceModeChange={(mode) => {
                setAttendanceMode(mode);
                setSelectedStudentId("");
              }}
              onSelectStudent={setSelectedStudentId}
              onClearStudent={() => setSelectedStudentId("")}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2 border-t pt-4 bg-muted/20">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={handleGenerate} disabled={!canGenerate() || loading || generating} className="flex-1 gap-2">
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

// ── ReportsManagement ──────────────────────────────────────────────────────────

export function ReportsManagement() {
  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedReport,   setSelectedReport]   = useState<Report | null>(null);
  const [configReport,     setConfigReport]     = useState<Report | null>(null);

  const filtered = VISIBLE_REPORTS.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch && (selectedCategory === "Todos" || r.category === selectedCategory);
  });

  return (
    <div className="space-y-6 max-[100dvw]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Genera y descarga reportes del sistema con filtros específicos por tipo.
        </p>
      </div>

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
          {CATEGORIES.map((cat) => (
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
              <Card key={report.id} className={cn("border-t-4", report.colorBorder, "hover:shadow-md transition-all duration-200 flex flex-col")}>
                <CardContent className="p-5 flex flex-col flex-1 gap-4">
                  <div className="flex items-start justify-between">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", report.colorBg)}>
                      <Icon className={cn("w-5 h-5", report.colorText)} />
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", CATEGORY_COLOR[report.category])}>
                      {report.category}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground leading-tight">{report.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{report.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {report.filters.map((f) => (
                        <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                          {FILTER_LABEL[f]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex gap-1">
                      {report.format.map((f) => (
                        <span key={f} className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{f}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Configurar reporte" onClick={() => setConfigReport(report)}>
                        <Settings2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className={cn("h-8 gap-1.5 text-xs", report.colorText)} onClick={() => setSelectedReport(report)}>
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
