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
  Users,
  RotateCcw,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface CsvRow {
  email: string;
}

type RowStatus = "pending" | "processing" | "success" | "error" | "skipped";

interface ProcessedRow extends CsvRow {
  status: RowStatus;
  message: string;
  userName?: string;
  currentGroup?: string; // grupo al que ya pertenece (para skipped)
}

type WizardStep = 1 | 2 | 3 | 4;

interface GroupOption {
  id: string;
  name: string;
  course_name: string;
  max_students: number | null;
  current_count: number;
}

interface BulkGroupAssignmentProps {
  periodos: Array<{ id: string; name: string; is_active?: boolean }>;
}

// ── CSV helpers ───────────────────────────────────────────────────────────────

function downloadTemplate() {
  const csv = "email\ncarlos.perez@colegio.edu.co\nmaria.lopez@colegio.edu.co";
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_asignacion_grupos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadErrorCsv(rows: ProcessedRow[]) {
  const failed = rows.filter((r) => r.status === "error");
  if (!failed.length) return;
  const header = "email,error";
  const lines = failed.map((r) => `"${r.email}","${r.message}"`);
  const blob = new Blob(["\uFEFF" + [header, ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "errores_asignacion_grupos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const first = lines[0].replace(/"/g, "").trim().toLowerCase().replace(/^\uFEFF/, "");
  const dataLines = first === "email" ? lines.slice(1) : lines;
  return dataLines
    .map((l) => ({ email: l.replace(/"/g, "").trim() }))
    .filter((r) => r.email);
}

function validateRows(rows: CsvRow[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  rows.forEach((r, i) => {
    if (!r.email) { errors.push(`Fila ${i + 1}: email vacío`); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))
      errors.push(`Fila ${i + 1}: email inválido — ${r.email}`);
    if (seen.has(r.email.toLowerCase()))
      errors.push(`Fila ${i + 1}: email duplicado — ${r.email}`);
    seen.add(r.email.toLowerCase());
  });
  return errors;
}

// ── Capacity bar ──────────────────────────────────────────────────────────────

function CapacityBar({
  current,
  max,
  incoming = 0,
}: {
  current: number;
  max: number | null;
  incoming?: number;
}) {
  if (max === null) {
    return (
      <span className="text-xs text-muted-foreground">
        {current} estudiantes · capacidad <span className="font-bold">∞</span>
      </span>
    );
  }

  const afterImport = current + incoming;
  const pct = Math.min(Math.round((current / max) * 100), 100);
  const pctAfter = Math.min(Math.round((afterImport / max) * 100), 100);
  const free = max - current;
  const overflow = afterImport > max;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className={cn(overflow ? "text-red-600 font-medium" : "text-muted-foreground")}>
          {current} / {max} estudiantes
          {incoming > 0 && (
            <span className={cn("ml-1 font-semibold", overflow ? "text-red-600" : "text-emerald-600")}>
              (+{incoming} → {afterImport})
            </span>
          )}
        </span>
        <span className={cn("text-xs", overflow ? "text-red-500" : free === 0 ? "text-amber-500" : "text-muted-foreground")}>
          {overflow ? `${afterImport - max} excedente(s)` : free === 0 ? "Lleno" : `${free} cupo(s) libre(s)`}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all",
            pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500",
          )}
          style={{ width: `${pct}%` }}
        />
        {incoming > 0 && pctAfter > pct && (
          <div
            className={cn(
              "absolute top-0 h-full rounded-full opacity-50 transition-all",
              overflow ? "bg-red-400" : "bg-emerald-400",
            )}
            style={{ left: `${pct}%`, width: `${pctAfter - pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "Cargar" },
  { n: 2, label: "Configurar" },
  { n: 3, label: "Asignando" },
  { n: 4, label: "Resultado" },
];

function StepIndicator({ current }: { current: WizardStep }) {
  return (
    <div className="flex items-center w-full px-2">
      {STEPS.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                done && "bg-emerald-500 text-white",
                active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                !done && !active && "bg-muted text-muted-foreground",
              )}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </div>
              <span className={cn(
                "text-[11px] font-medium whitespace-nowrap",
                active ? "text-primary" : done ? "text-emerald-600" : "text-muted-foreground",
              )}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1 mb-4 transition-all",
                done ? "bg-emerald-400" : "bg-muted",
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function BulkGroupAssignment({ periodos }: BulkGroupAssignmentProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const selectedGroup = groupOptions.find((g) => g.id === selectedGroupId);
  const selectedPeriod = periodos.find((p) => p.id === selectedPeriodId);
  const processed = rows.filter((r) => r.status !== "pending").length;
  const successCount = rows.filter((r) => r.status === "success").length;
  const skippedCount = rows.filter((r) => r.status === "skipped").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const progress = rows.length ? Math.round((processed / rows.length) * 100) : 0;

  // Capacidad: ¿cuántos del CSV caben?
  const wouldExceedCapacity =
    selectedGroup?.max_students !== null &&
    selectedGroup !== undefined &&
    selectedGroup.current_count + rows.length > (selectedGroup.max_students ?? Infinity);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current)
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [processed]);

  // Cargar grupos cuando cambia el período
  useEffect(() => {
    if (!selectedPeriodId) { setGroupOptions([]); setSelectedGroupId(""); return; }
    const load = async () => {
      setLoadingGroups(true);
      setSelectedGroupId("");
      try {
        // Grupos del período con su curso
        const { data: groups, error } = await supabase
          .from("groups")
          .select(`id, name, max_students, course_id, courses:course_id(name)`)
          .eq("year", selectedPeriodId);

        if (error) throw error;

        // Contar estudiantes actuales por grupo
        const options: GroupOption[] = await Promise.all(
          (groups || []).map(async (g: any) => {
            const { count } = await supabase
              .from("group_has_students")
              .select("id", { count: "exact", head: true })
              .eq("group_id", g.id);
            return {
              id: g.id,
              name: g.name,
              course_name: g.courses?.name ?? "Sin curso",
              max_students: g.max_students,
              current_count: count ?? 0,
            };
          }),
        );
        setGroupOptions(options);
      } finally {
        setLoadingGroups(false);
      }
    };
    load();
  }, [selectedPeriodId]);

  // ── Cargar CSV ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      setValidationErrors(validateRows(parsed));
      setRows(parsed.map((r) => ({ ...r, status: "pending", message: "" })));
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  // ── Procesar una fila ────────────────────────────────────────────────────────
  const processRow = async (row: CsvRow, index: number) => {
    const update = (patch: Partial<ProcessedRow>) =>
      setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

    update({ status: "processing", message: "Buscando usuario..." });

    try {
      // 1. Buscar perfil por email
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, first_name, last_name")
        .eq("email", row.email.toLowerCase())
        .maybeSingle();

      if (!profile) throw new Error("Usuario no encontrado en el sistema");

      const userName =
        profile.full_name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        row.email;

      // 2. Buscar matrícula activa en el período
      update({ message: "Verificando matrícula...", userName });
      const { data: enrollment } = await supabase
        .from("student_enrolled")
        .select("id")
        .eq("user_id", profile.id)
        .eq("academic_period_id", selectedPeriodId)
        .eq("is_active", true)
        .maybeSingle();

      if (!enrollment)
        throw new Error(`No está matriculado en el período "${selectedPeriod?.name}"`);

      // 3. Verificar si ya está en ALGÚN grupo del mismo período
      update({ message: "Verificando grupos..." });
      const { data: existingAssignment } = await supabase
        .from("group_has_students")
        .select(`id, group_id, groups:group_id(name)`)
        .eq("student_enrolled_id", enrollment.id)
        .maybeSingle();

      if (existingAssignment) {
        const groupName = (existingAssignment as any).groups?.name ?? "desconocido";
        update({
          status: "skipped",
          message: `Ya asignado al grupo ${groupName}`,
          currentGroup: groupName,
          userName,
        });
        return;
      }

      // 4. Insertar en group_has_students
      const { error: insertError } = await supabase
        .from("group_has_students")
        .insert({
          id: crypto.randomUUID(),
          group_id: selectedGroupId,
          student_enrolled_id: enrollment.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw new Error(insertError.message);

      update({ status: "success", message: "Asignado correctamente", userName });
    } catch (err: any) {
      update({ status: "error", message: err.message ?? "Error desconocido" });
    }
  };

  // ── Iniciar proceso ──────────────────────────────────────────────────────────
  const handleProcess = async () => {
    setStep(3);
    setIsProcessing(true);
    for (let i = 0; i < rows.length; i++) await processRow(rows[i], i);
    setIsProcessing(false);
    setStep(4);
  };

  const handleClose = () => {
    if (isProcessing) return;
    setOpen(false);
    setTimeout(() => {
      setStep(1); setRows([]); setSelectedPeriodId("");
      setSelectedGroupId(""); setValidationErrors([]); setFileName("");
    }, 300);
  };

  const handleRetryErrors = () => {
    const failed = rows.filter((r) => r.status === "error");
    setRows(failed.map((r) => ({ ...r, status: "pending", message: "", userName: undefined })));
    setFileName(`${failed.length} usuarios con error`);
    setSelectedGroupId("");
    setStep(2);
  };

  const statusIcon = (status: RowStatus) => {
    if (status === "processing") return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (status === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === "error") return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === "skipped") return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <span className="block w-3 h-3 rounded-full bg-muted-foreground/25 mx-auto" />;
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Asignación masiva a grupo
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">

          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-base font-semibold">
                Asignación masiva a grupo
              </DialogTitle>
            </div>
            <StepIndicator current={step} />
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ───── PASO 1: Cargar CSV ───── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                  <div>
                    <p className="text-sm font-medium">Descarga la plantilla</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Una columna: el email de cada estudiante. El grupo se elige en el siguiente paso.
                    </p>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded mt-2 inline-block">
                      email <span className="text-red-500">*</span>
                    </code>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadTemplate} className="shrink-0">
                    <Download className="w-4 h-4 mr-2" />
                    Plantilla
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Sube el archivo CSV</p>
                  {rows.length === 0 ? (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/40 hover:bg-muted/20 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                          Haz clic para seleccionar el archivo
                        </p>
                        <p className="text-xs mt-0.5">Solo archivos .csv</p>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-emerald-50 border-emerald-200">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-emerald-800 truncate">{fileName}</p>
                          <p className="text-xs text-emerald-600">{rows.length} estudiantes detectados</p>
                        </div>
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="text-xs text-emerald-700 hover:underline shrink-0"
                        >
                          Cambiar
                        </button>
                      </div>

                      {validationErrors.length > 0 && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 space-y-2">
                          <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                            {validationErrors.length} error(es) encontrados
                          </p>
                          <ul className="space-y-1">
                            {validationErrors.map((e, i) => (
                              <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />{e}
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-red-500">Corrige el archivo y vuelve a subirlo.</p>
                        </div>
                      )}
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                </div>
              </div>
            )}

            {/* ───── PASO 2: Configurar ───── */}
            {step === 2 && (
              <div className="space-y-4">

                {/* Selectores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-sm font-medium">Período académico</p>
                    <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                      <SelectTrigger>
                        <SelectValue placeholder="— Selecciona —" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodos.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <span className="flex items-center gap-2">
                              {p.name}
                              {p.is_active && (
                                <Badge className="text-[10px] h-4 bg-emerald-500">Activo</Badge>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-sm font-medium">Grupo</p>
                    {loadingGroups ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Cargando grupos...
                      </div>
                    ) : (
                      <Select
                        value={selectedGroupId}
                        onValueChange={setSelectedGroupId}
                        disabled={!selectedPeriodId || groupOptions.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !selectedPeriodId ? "Primero elige el período" :
                            groupOptions.length === 0 ? "Sin grupos en este período" :
                            "— Selecciona un grupo —"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {groupOptions.map((g) => {
                            const full = g.max_students !== null && g.current_count >= g.max_students;
                            return (
                              <SelectItem key={g.id} value={g.id} disabled={full}>
                                <span className="flex items-center gap-2">
                                  <span>{g.name}</span>
                                  <span className="text-muted-foreground text-xs">· {g.course_name}</span>
                                  <span className={cn(
                                    "text-xs ml-auto",
                                    full ? "text-red-500" : "text-muted-foreground",
                                  )}>
                                    {g.max_students === null ? `${g.current_count} / ∞` : `${g.current_count}/${g.max_students}`}
                                    {full && " · Lleno"}
                                  </span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Barra de capacidad del grupo seleccionado */}
                {selectedGroup && (
                  <div className={cn(
                    "rounded-xl border p-4 space-y-2",
                    wouldExceedCapacity ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50/50",
                  )}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Grupo {selectedGroup.name} — {selectedGroup.course_name}
                      </p>
                      {wouldExceedCapacity && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Capacidad excedida
                        </Badge>
                      )}
                    </div>
                    <CapacityBar
                      current={selectedGroup.current_count}
                      max={selectedGroup.max_students}
                      incoming={rows.length}
                    />
                    {wouldExceedCapacity && selectedGroup.max_students !== null && (
                      <p className="text-xs text-red-600">
                        ⚠ El grupo tiene capacidad para{" "}
                        <strong>{selectedGroup.max_students - selectedGroup.current_count}</strong> cupos libres
                        pero estás importando <strong>{rows.length}</strong> estudiantes.
                        Puedes continuar — los que excedan la capacidad se asignarán igualmente,
                        pero considera ajustar el grupo.
                      </p>
                    )}
                  </div>
                )}

                {/* Resumen */}
                {selectedGroup && selectedPeriod && (
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-xl border bg-muted/30 p-3 text-center">
                      <p className="text-2xl font-bold">{rows.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">a asignar</p>
                    </div>
                    <div className="flex-1 rounded-xl border bg-muted/30 p-3 text-center">
                      <p className="text-base font-bold mt-1">{selectedPeriod.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">período</p>
                    </div>
                    <div className="flex-1 rounded-xl border bg-muted/30 p-3 text-center">
                      <p className="text-base font-bold mt-1">
                        {selectedGroup.name} · {selectedGroup.course_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">grupo destino</p>
                    </div>
                  </div>
                )}

                {/* Preview emails */}
                <div>
                  <p className="text-sm font-medium mb-2">Estudiantes a asignar</p>
                  <div className="rounded-xl border overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                          <TableRow>
                            <TableHead className="w-8">#</TableHead>
                            <TableHead>Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                              <TableCell className="text-sm">{row.email}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───── PASO 3: Asignando (feed en vivo) ───── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-2">
                      {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      {isProcessing ? "Asignando estudiantes..." : "Proceso completado"}
                    </span>
                    <span className="text-muted-foreground font-mono">{processed}/{rows.length}</span>
                  </div>
                  <Progress value={progress} className="h-2.5" />
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />{successCount} asignados
                    </span>
                    {skippedCount > 0 && (
                      <span className="flex items-center gap-1.5 text-amber-500">
                        <AlertTriangle className="w-3.5 h-3.5" />{skippedCount} ya en grupo
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

                {/* Feed */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Registro en tiempo real
                  </p>
                  <div
                    ref={feedRef}
                    className="h-72 overflow-y-auto rounded-xl border bg-zinc-950 p-3 space-y-1 font-mono"
                  >
                    {rows.map((row, i) => {
                      if (row.status === "pending") return null;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-2 text-xs py-0.5 px-1 rounded",
                            row.status === "processing" && "text-blue-300",
                            row.status === "success" && "text-emerald-400",
                            row.status === "error" && "text-red-400",
                            row.status === "skipped" && "text-amber-400",
                          )}
                        >
                          <span className="shrink-0 mt-0.5">
                            {row.status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
                            {row.status === "success" && <CheckCircle2 className="w-3 h-3" />}
                            {row.status === "error" && <XCircle className="w-3 h-3" />}
                            {row.status === "skipped" && <AlertTriangle className="w-3 h-3" />}
                          </span>
                          <span className="text-zinc-400 shrink-0 w-5">{String(i + 1).padStart(2, "0")}</span>
                          <span className="truncate">{row.userName || row.email}</span>
                          <span className="shrink-0 ml-auto pl-2 text-right">
                            {row.status === "processing" && <span className="text-blue-400">procesando...</span>}
                            {row.status === "success" && <span className="text-emerald-500">✓ asignado</span>}
                            {row.status === "skipped" && <span className="text-amber-400">{row.message}</span>}
                            {row.status === "error" && <span className="text-red-400 truncate max-w-[200px]">{row.message}</span>}
                          </span>
                        </div>
                      );
                    })}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 py-0.5 px-1">
                        <CircleDot className="w-3 h-3 animate-pulse" />
                        <span>Procesando siguiente estudiante...</span>
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
                      {errorCount === 0 ? "¡Asignación completada!" : "Proceso finalizado con errores"}
                    </p>
                    <p className={cn("text-sm mt-0.5", errorCount === 0 ? "text-emerald-700" : "text-amber-700")}>
                      {successCount} asignado(s) al grupo {selectedGroup?.name}
                      {skippedCount > 0 && ` · ${skippedCount} omitido(s)`}
                      {errorCount > 0 && ` · ${errorCount} error(es)`}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-xl border p-3 text-center">
                    <p className="text-2xl font-bold">{rows.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Total</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{successCount}</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Asignados</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                    <p className="text-2xl font-bold text-amber-500">{skippedCount}</p>
                    <p className="text-xs text-amber-600 mt-0.5">Omitidos</p>
                  </div>
                  <div className={cn("rounded-xl border p-3 text-center", errorCount > 0 ? "border-red-200 bg-red-50" : "")}>
                    <p className={cn("text-2xl font-bold", errorCount > 0 ? "text-red-500" : "text-muted-foreground")}>{errorCount}</p>
                    <p className={cn("text-xs mt-0.5", errorCount > 0 ? "text-red-600" : "text-muted-foreground")}>Errores</p>
                  </div>
                </div>

                {/* Tabla de omitidos (ya estaban en un grupo) */}
                {skippedCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          {skippedCount} estudiante(s) NO fueron reasignados
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Ya estaban asignados a otro grupo en este período.
                          Si necesitas moverlos, hazlo manualmente desde la gestión de grupos.
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

                {/* Tabla de errores */}
                {errorCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-red-700">Estudiantes con error</p>
                      <Button variant="outline" size="sm" onClick={() => downloadErrorCsv(rows)} className="h-7 text-xs">
                        <FileDown className="w-3.5 h-3.5 mr-1.5" />
                        Descargar CSV errores
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

          {/* Footer */}
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
                <Button
                  size="sm"
                  onClick={() => setStep(2)}
                  disabled={rows.length === 0 || validationErrors.length > 0}
                >
                  Continuar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {step === 2 && (
                <Button
                  size="sm"
                  onClick={handleProcess}
                  disabled={!selectedGroupId || !selectedPeriodId}
                >
                  Asignar {rows.length} estudiantes <ChevronRight className="w-4 h-4 ml-1" />
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
