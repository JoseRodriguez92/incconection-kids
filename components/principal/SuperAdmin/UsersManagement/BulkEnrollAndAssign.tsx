"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  FileDown,
  PartyPopper,
  CircleDot,
  GraduationCap,
  Info,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type RowStatus = "pending" | "processing" | "success" | "error" | "skipped";

interface ProcessedRow {
  email: string;
  status: RowStatus;
  message: string;
  userName?: string;
  currentGroup?: string;
  step?: string; // qué paso del proceso está corriendo
}

type WizardStep = 1 | 2 | 3 | 4;

interface PeriodOption {
  id: string;
  name: string;
  is_active?: boolean;
}

interface CourseOption {
  id: string;
  name: string;
}

interface GroupOption {
  id: string;
  name: string;
  max_students: number | null;
  current_count: number;
}

interface BulkEnrollAndAssignProps {
  periodos: PeriodOption[];
}

// ── CSV helpers ───────────────────────────────────────────────────────────────

function downloadTemplate() {
  const csv = "email\ncarlos.perez@colegio.edu.co\nmaria.lopez@colegio.edu.co";
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "plantilla_matricula_completa.csv"; a.click();
  URL.revokeObjectURL(url);
}

function downloadErrorCsv(rows: ProcessedRow[]) {
  const failed = rows.filter((r) => r.status === "error");
  if (!failed.length) return;
  const lines = failed.map((r) => `"${r.email}","${r.message}"`);
  const blob = new Blob(["\uFEFF" + ["email,error", ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "errores_matricula.csv"; a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): string[] {
  const lines = text.trim().split(/\r?\n/);
  const first = lines[0].replace(/"/g, "").trim().toLowerCase().replace(/^\uFEFF/, "");
  const data = first === "email" ? lines.slice(1) : lines;
  return data.map((l) => l.replace(/"/g, "").trim()).filter(Boolean);
}

function validateEmails(emails: string[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  emails.forEach((e, i) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      errors.push(`Fila ${i + 1}: email inválido — ${e}`);
    if (seen.has(e.toLowerCase()))
      errors.push(`Fila ${i + 1}: duplicado — ${e}`);
    seen.add(e.toLowerCase());
  });
  return errors;
}

// ── Capacity bar ──────────────────────────────────────────────────────────────

function CapacityBar({ current, max, incoming = 0 }: {
  current: number; max: number | null; incoming?: number;
}) {
  if (max === null) return (
    <span className="text-xs text-muted-foreground">
      {current} estudiantes · capacidad <strong>∞</strong>
    </span>
  );
  const afterImport = current + incoming;
  const pct = Math.min(Math.round((current / max) * 100), 100);
  const pctAfter = Math.min(Math.round((afterImport / max) * 100), 100);
  const overflow = afterImport > max;
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between text-xs">
        <span className={cn(overflow ? "text-red-600 font-medium" : "text-muted-foreground")}>
          {current}/{max} estudiantes
          {incoming > 0 && (
            <span className={cn("ml-1 font-semibold", overflow ? "text-red-600" : "text-emerald-600")}>
              (+{incoming} → {afterImport})
            </span>
          )}
        </span>
        <span className={cn("text-xs", overflow ? "text-red-500" : "text-muted-foreground")}>
          {overflow ? `${afterImport - max} excedente(s)` : `${max - current} cupo(s) libre(s)`}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("absolute top-0 left-0 h-full rounded-full",
            pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500")}
          style={{ width: `${pct}%` }}
        />
        {incoming > 0 && pctAfter > pct && (
          <div
            className={cn("absolute top-0 h-full rounded-full opacity-50",
              overflow ? "bg-red-400" : "bg-emerald-400")}
            style={{ left: `${pct}%`, width: `${Math.max(pctAfter - pct, 1)}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "CSV" },
  { n: 2, label: "Configurar" },
  { n: 3, label: "Procesando" },
  { n: 4, label: "Resultado" },
];

function StepIndicator({ current }: { current: WizardStep }) {
  return (
    <div className="flex items-center w-full px-1">
      {STEPS.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                done && "bg-emerald-500 text-white",
                active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                !done && !active && "bg-muted text-muted-foreground",
              )}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
              </div>
              <span className={cn(
                "text-[10px] font-medium whitespace-nowrap",
                active ? "text-primary" : done ? "text-emerald-600" : "text-muted-foreground",
              )}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-1 mb-4", done ? "bg-emerald-400" : "bg-muted")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function BulkEnrollAndAssign({ periodos }: BulkEnrollAndAssignProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);

  // Selecciones
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Datos cargados dinámicamente
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // CSV
  const [emails, setEmails] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Proceso
  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Derivados
  const selectedPeriod = periodos.find((p) => p.id === selectedPeriodId);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const processed = rows.filter((r) => r.status !== "pending").length;
  const successCount = rows.filter((r) => r.status === "success").length;
  const skippedCount = rows.filter((r) => r.status === "skipped").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const progress = rows.length ? Math.round((processed / rows.length) * 100) : 0;

  // Auto-scroll feed
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [processed]);

  // Cargar cursos cuando cambia el período
  useEffect(() => {
    if (!selectedPeriodId) { setCourses([]); setSelectedCourseId(""); return; }
    const load = async () => {
      setLoadingCourses(true);
      setSelectedCourseId(""); setSelectedGroupId("");
      // Cursos que tienen grupos en este período
      const { data } = await supabase
        .from("groups")
        .select("courses:course_id(id, name)")
        .eq("year", selectedPeriodId);
      const unique = new Map<string, CourseOption>();
      (data || []).forEach((g: any) => {
        if (g.courses) unique.set(g.courses.id, g.courses);
      });
      setCourses(Array.from(unique.values()));
      setLoadingCourses(false);
    };
    load();
  }, [selectedPeriodId]);

  // Cargar grupos cuando cambia el curso
  useEffect(() => {
    if (!selectedCourseId || !selectedPeriodId) { setGroups([]); setSelectedGroupId(""); return; }
    const load = async () => {
      setLoadingGroups(true);
      setSelectedGroupId("");
      const { data } = await supabase
        .from("groups")
        .select("id, name, max_students")
        .eq("course_id", selectedCourseId)
        .eq("year", selectedPeriodId);
      const options: GroupOption[] = await Promise.all(
        (data || []).map(async (g: any) => {
          const { count } = await supabase
            .from("group_has_students")
            .select("id", { count: "exact", head: true })
            .eq("group_id", g.id);
          return { id: g.id, name: g.name, max_students: g.max_students, current_count: count ?? 0 };
        }),
      );
      setGroups(options);
      setLoadingGroups(false);
    };
    load();
  }, [selectedCourseId, selectedPeriodId]);

  // ── Cargar CSV ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCsv(ev.target?.result as string);
      setValidationErrors(validateEmails(parsed));
      setEmails(parsed);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  // ── Actualizar fila ──────────────────────────────────────────────────────────
  const updateRow = (index: number, patch: Partial<ProcessedRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  // ── Procesar una fila ────────────────────────────────────────────────────────
  const processRow = async (email: string, index: number) => {
    updateRow(index, { status: "processing", step: "Buscando usuario..." });

    try {
      // 1 — Buscar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, first_name, last_name")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (!profile) throw new Error("Usuario no encontrado en el sistema");

      const userName =
        profile.full_name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        email;

      // 2 — Verificar o crear matrícula en el período
      updateRow(index, { step: "Verificando matrícula...", userName });

      let enrollmentId: string;

      const { data: existing } = await supabase
        .from("student_enrolled")
        .select("id")
        .eq("user_id", profile.id)
        .eq("academic_period_id", selectedPeriodId)
        .maybeSingle();

      if (existing) {
        enrollmentId = existing.id;
      } else {
        updateRow(index, { step: "Matriculando en período..." });
        const newId = crypto.randomUUID();
        const { error: enrollError } = await supabase
          .from("student_enrolled")
          .insert({
            id: newId,
            user_id: profile.id,
            academic_period_id: selectedPeriodId,
            enrolled_at: new Date().toISOString(),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        if (enrollError) throw new Error(`Matrícula: ${enrollError.message}`);
        enrollmentId = newId;
      }

      // 3 — Verificar si ya está en algún grupo del período
      updateRow(index, { step: "Verificando grupo..." });

      const { data: existingGroup } = await supabase
        .from("group_has_students")
        .select("id, groups:group_id(name)")
        .eq("student_enrolled_id", enrollmentId)
        .maybeSingle();

      if (existingGroup) {
        const gName = (existingGroup as any).groups?.name ?? "desconocido";
        updateRow(index, {
          status: "skipped",
          message: `Ya asignado al grupo ${gName}`,
          currentGroup: gName,
          userName,
          step: undefined,
        });
        return;
      }

      // 4 — Asignar al grupo
      updateRow(index, { step: "Asignando al grupo..." });

      const { error: groupError } = await supabase
        .from("group_has_students")
        .insert({
          id: crypto.randomUUID(),
          group_id: selectedGroupId,
          student_enrolled_id: enrollmentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (groupError) throw new Error(`Grupo: ${groupError.message}`);

      updateRow(index, { status: "success", message: "Matriculado y asignado", userName, step: undefined });
    } catch (err: any) {
      updateRow(index, { status: "error", message: err.message ?? "Error desconocido", step: undefined });
    }
  };

  // ── Iniciar proceso ──────────────────────────────────────────────────────────
  const handleProcess = async () => {
    const initialRows: ProcessedRow[] = emails.map((e) => ({
      email: e, status: "pending", message: "",
    }));
    setRows(initialRows);
    setStep(3);
    setIsProcessing(true);
    for (let i = 0; i < emails.length; i++) await processRow(emails[i], i);
    setIsProcessing(false);
    setStep(4);
  };

  const handleClose = () => {
    if (isProcessing) return;
    setOpen(false);
    setTimeout(() => {
      setStep(1); setEmails([]); setRows([]);
      setSelectedPeriodId(""); setSelectedCourseId(""); setSelectedGroupId("");
      setValidationErrors([]); setFileName("");
      setCourses([]); setGroups([]);
    }, 300);
  };

  const handleRetryErrors = () => {
    const failedEmails = rows.filter((r) => r.status === "error").map((r) => r.email);
    setEmails(failedEmails);
    setFileName(`${failedEmails.length} usuarios con error`);
    setRows([]);
    setSelectedCourseId(""); setSelectedGroupId("");
    setStep(1);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <GraduationCap className="w-4 h-4 mr-2" />
        Matrícula masiva
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">

          {/* ── Header ── */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold leading-tight">
                  Matrícula masiva completa
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Matricula estudiantes al período y asígnalos a su grupo en un solo flujo
                </p>
              </div>
            </div>
            <StepIndicator current={step} />
          </DialogHeader>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ───── PASO 1: CSV ───── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 rounded-xl border p-4 bg-muted/20">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">¿Qué hace este proceso?</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>① Matricula al estudiante en el período académico seleccionado</p>
                      <p>② Lo asigna al grupo del curso que elijas</p>
                      <p className="text-amber-600">⚠ Si ya está matriculado reutiliza esa matrícula · Si ya tiene grupo, lo omite</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadTemplate} className="shrink-0">
                    <Download className="w-4 h-4 mr-2" />
                    Plantilla
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Sube el CSV con los emails</p>
                  {emails.length === 0 ? (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/40 hover:bg-muted/20 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5 group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                        Haz clic para seleccionar el archivo
                      </p>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-emerald-50 border-emerald-200">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-emerald-800 truncate">{fileName}</p>
                          <p className="text-xs text-emerald-600">{emails.length} estudiantes detectados</p>
                        </div>
                        <button onClick={() => fileRef.current?.click()} className="text-xs text-emerald-700 hover:underline shrink-0">
                          Cambiar
                        </button>
                      </div>
                      {validationErrors.length > 0 && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 space-y-2">
                          <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
                            <AlertTriangle className="w-4 h-4" />{validationErrors.length} error(es) encontrados
                          </p>
                          <ul className="space-y-1">
                            {validationErrors.map((e, i) => (
                              <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />{e}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                </div>
              </div>
            )}

            {/* ───── PASO 2: Configurar (período + curso + grupo) ───── */}
            {step === 2 && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Configura dónde se matricularán los <strong>{emails.length}</strong> estudiantes.
                </p>

                {/* Select período */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Período académico</label>
                  <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="— Selecciona un período —" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            {p.name}
                            {p.is_active && <Badge className="text-[10px] h-4 bg-emerald-500">Activo</Badge>}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select curso */}
                <div className="space-y-1.5">
                  <label className={cn("text-sm font-medium", !selectedPeriodId && "text-muted-foreground")}>
                    Curso
                  </label>
                  <Select
                    value={selectedCourseId}
                    onValueChange={setSelectedCourseId}
                    disabled={!selectedPeriodId || loadingCourses}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        !selectedPeriodId ? "Primero selecciona un período" :
                        loadingCourses ? "Cargando cursos..." :
                        courses.length === 0 ? "Sin cursos en este período" :
                        "— Selecciona un curso —"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select grupo */}
                <div className="space-y-1.5">
                  <label className={cn("text-sm font-medium", !selectedCourseId && "text-muted-foreground")}>
                    Grupo
                  </label>
                  <Select
                    value={selectedGroupId}
                    onValueChange={setSelectedGroupId}
                    disabled={!selectedCourseId || loadingGroups}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        !selectedCourseId ? "Primero selecciona un curso" :
                        loadingGroups ? "Cargando grupos..." :
                        groups.length === 0 ? "Sin grupos para este curso" :
                        "— Selecciona un grupo —"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => {
                        const full = g.max_students !== null && g.current_count >= g.max_students;
                        return (
                          <SelectItem key={g.id} value={g.id} disabled={full}>
                            <span className="flex items-center gap-2">
                              <span>Grupo {g.name}</span>
                              <span className={cn("text-xs", full ? "text-red-500" : "text-muted-foreground")}>
                                {g.max_students === null
                                  ? `${g.current_count} / ∞`
                                  : `${g.current_count}/${g.max_students}`}
                                {full && " · Lleno"}
                              </span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Barra de capacidad + resumen (aparece al elegir grupo) */}
                {selectedGroup && (
                  <div className="rounded-xl border p-4 space-y-3 bg-muted/20">
                    <CapacityBar
                      current={selectedGroup.current_count}
                      max={selectedGroup.max_students}
                      incoming={emails.length}
                    />
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        { label: "Estudiantes", value: emails.length },
                        { label: "Período", value: selectedPeriod?.name ?? "—" },
                        { label: "Curso · Grupo", value: `${selectedCourse?.name} · ${selectedGroup.name}` },
                      ].map((s) => (
                        <div key={s.label} className="rounded-lg border bg-background p-2 text-center">
                          <p className="text-sm font-semibold truncate">{s.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {selectedGroup.max_students !== null &&
                      selectedGroup.current_count + emails.length > selectedGroup.max_students && (
                        <p className="text-xs text-amber-600 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          El grupo quedará por encima de su capacidad. Puedes continuar igualmente.
                        </p>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* ───── PASO 3: Procesando ───── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-2">
                      {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      {isProcessing ? "Procesando estudiantes..." : "Proceso completado"}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">{processed}/{rows.length}</span>
                  </div>
                  <Progress value={progress} className="h-2.5" />
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />{successCount} completados
                    </span>
                    {skippedCount > 0 && (
                      <span className="flex items-center gap-1.5 text-amber-500">
                        <AlertTriangle className="w-3.5 h-3.5" />{skippedCount} omitidos
                      </span>
                    )}
                    {errorCount > 0 && (
                      <span className="flex items-center gap-1.5 text-red-500">
                        <XCircle className="w-3.5 h-3.5" />{errorCount} errores
                      </span>
                    )}
                    <span className="ml-auto text-muted-foreground">{progress}%</span>
                  </div>
                </div>

                {/* Feed en vivo */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Registro en tiempo real
                  </p>
                  <div
                    ref={feedRef}
                    className="h-72 overflow-y-auto rounded-xl border bg-zinc-950 p-3 space-y-0.5 font-mono"
                  >
                    {rows.map((row, i) => {
                      if (row.status === "pending") return null;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-2 text-xs py-1 px-1.5 rounded",
                            row.status === "processing" && "bg-blue-950/40 text-blue-300",
                            row.status === "success" && "text-emerald-400",
                            row.status === "error" && "text-red-400",
                            row.status === "skipped" && "text-amber-400",
                          )}
                        >
                          <span className="shrink-0 mt-0.5 w-3.5">
                            {row.status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
                            {row.status === "success" && <CheckCircle2 className="w-3 h-3" />}
                            {row.status === "error" && <XCircle className="w-3 h-3" />}
                            {row.status === "skipped" && <AlertTriangle className="w-3 h-3" />}
                          </span>
                          <span className="text-zinc-500 shrink-0 w-5 text-right">{String(i + 1).padStart(2, "0")}</span>
                          <span className="text-zinc-300 truncate flex-1">{row.userName || row.email}</span>
                          <span className="shrink-0 text-right ml-2">
                            {row.status === "processing" && (
                              <span className="text-blue-400 text-[10px]">{row.step}</span>
                            )}
                            {row.status === "success" && <span className="text-emerald-500">✓ listo</span>}
                            {row.status === "skipped" && <span className="text-amber-400 text-[10px]">{row.message}</span>}
                            {row.status === "error" && <span className="text-red-400 text-[10px] max-w-[180px] truncate block">{row.message}</span>}
                          </span>
                        </div>
                      );
                    })}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-xs text-zinc-600 py-1 px-1.5">
                        <CircleDot className="w-3 h-3 animate-pulse" />
                        <span>Esperando siguiente estudiante...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ───── PASO 4: Resultado ───── */}
            {step === 4 && (
              <div className="space-y-4">
                {/* Banner */}
                <div className={cn(
                  "rounded-xl p-5 flex items-center gap-4",
                  errorCount === 0 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200",
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                    errorCount === 0 ? "bg-emerald-100" : "bg-amber-100",
                  )}>
                    {errorCount === 0
                      ? <PartyPopper className="w-6 h-6 text-emerald-600" />
                      : <AlertTriangle className="w-6 h-6 text-amber-600" />}
                  </div>
                  <div>
                    <p className={cn("font-semibold", errorCount === 0 ? "text-emerald-800" : "text-amber-800")}>
                      {errorCount === 0 ? "¡Matrícula completada!" : "Proceso finalizado con observaciones"}
                    </p>
                    <p className={cn("text-sm mt-0.5", errorCount === 0 ? "text-emerald-700" : "text-amber-700")}>
                      {successCount} matriculados en <strong>{selectedPeriod?.name}</strong> · Grupo {selectedGroup?.name} · {selectedCourse?.name}
                      {skippedCount > 0 && ` · ${skippedCount} omitidos`}
                      {errorCount > 0 && ` · ${errorCount} errores`}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total", value: rows.length, cls: "" },
                    { label: "Completados", value: successCount, cls: "border-emerald-200 bg-emerald-50 text-emerald-600" },
                    { label: "Omitidos", value: skippedCount, cls: skippedCount > 0 ? "border-amber-200 bg-amber-50 text-amber-500" : "" },
                    { label: "Errores", value: errorCount, cls: errorCount > 0 ? "border-red-200 bg-red-50 text-red-500" : "" },
                  ].map((s) => (
                    <div key={s.label} className={cn("rounded-xl border p-3 text-center", s.cls)}>
                      <p className={cn("text-2xl font-bold", s.cls.includes("text-") ? "" : "text-foreground")}>{s.value}</p>
                      <p className="text-xs mt-0.5 text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Omitidos (ya tenían grupo) */}
                {skippedCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          {skippedCount} estudiante(s) NO fueron reasignados de grupo
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Ya estaban asignados a un grupo en este período. Su matrícula al período sí fue procesada (o ya existía).
                          Para moverlos de grupo hazlo manualmente.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-amber-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-amber-50">
                            <TableHead className="text-amber-800">Estudiante</TableHead>
                            <TableHead className="text-amber-800">Email</TableHead>
                            <TableHead className="text-amber-800">Grupo actual</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.filter((r) => r.status === "skipped").map((row, i) => (
                            <TableRow key={i} className="bg-amber-50/40">
                              <TableCell className="text-sm">{row.userName || "—"}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{row.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                                  {row.currentGroup ?? "desconocido"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Errores */}
                {errorCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-red-700">Estudiantes con error</p>
                      <Button variant="outline" size="sm" onClick={() => downloadErrorCsv(rows)} className="h-7 text-xs">
                        <FileDown className="w-3.5 h-3.5 mr-1.5" />Descargar CSV errores
                      </Button>
                    </div>
                    <div className="rounded-xl border border-red-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-red-50">
                            <TableHead className="text-red-700">Email</TableHead>
                            <TableHead className="text-red-700">Motivo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.filter((r) => r.status === "error").map((row, i) => (
                            <TableRow key={i} className="bg-red-50/40">
                              <TableCell className="text-sm">{row.email}</TableCell>
                              <TableCell className="text-xs text-red-600">{row.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between gap-3 shrink-0">
            <div>
              {step === 2 && (
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step !== 3 && (
                <Button variant="outline" size="sm" onClick={handleClose} disabled={isProcessing}>
                  {step === 4 ? "Cerrar" : "Cancelar"}
                </Button>
              )}
              {step === 1 && (
                <Button size="sm" onClick={() => setStep(2)}
                  disabled={emails.length === 0 || validationErrors.length > 0}>
                  Continuar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {step === 2 && (
                <Button size="sm" onClick={handleProcess} disabled={!selectedGroupId}>
                  Matricular {emails.length} estudiantes <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {step === 4 && errorCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleRetryErrors}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reintentar errores
                </Button>
              )}
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}
