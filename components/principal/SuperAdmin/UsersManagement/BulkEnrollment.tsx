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
  ClipboardList,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
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
}

type WizardStep = 1 | 2 | 3 | 4;

interface BulkEnrollmentProps {
  rolesList: Array<{ id: string; name: string; slug: string }>;
  periodos: Array<{ id: string; name: string; is_active?: boolean }>;
}

// ── Helpers CSV ───────────────────────────────────────────────────────────────

function downloadTemplate() {
  const csv = "email\ncarlos.perez@colegio.edu.co\nmaria.lopez@colegio.edu.co";
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_matricula.csv";
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
  a.download = "errores_matricula.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  // Detectar si la primera línea es encabezado
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

function resolveTable(roleName: string): string | null {
  const n = roleName.toLowerCase();
  if (n.includes("estudiante") || n.includes("student")) return "student_enrolled";
  if (n.includes("profesor") || n.includes("teacher") || n.includes("docente")) return "teacher_enrolled";
  if (n.includes("admin") || n.includes("acceso completo")) return "admin_enrolled";
  if (n.includes("padre") || n.includes("parent")) return "parent_enrolled";
  return null;
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "Cargar" },
  { n: 2, label: "Configurar" },
  { n: 3, label: "Matricular" },
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

export function BulkEnrollment({ rolesList, periodos }: BulkEnrollmentProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const selectedRole = rolesList.find((r) => r.id === selectedRoleId);
  const selectedPeriod = periodos.find((p) => p.id === selectedPeriodId);
  const processed = rows.filter((r) => r.status !== "pending").length;
  const successCount = rows.filter((r) => r.status === "success").length;
  const skippedCount = rows.filter((r) => r.status === "skipped").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const progress = rows.length ? Math.round((processed / rows.length) * 100) : 0;

  // Auto-scroll del feed
  useEffect(() => {
    if (feedRef.current)
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [processed]);

  // ── Cargar CSV ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      const errors = validateRows(parsed);
      setValidationErrors(errors);
      setRows(parsed.map((r) => ({ ...r, status: "pending", message: "" })));
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  // ── Procesar una fila ────────────────────────────────────────────────────────
  const processRow = async (row: CsvRow, index: number) => {
    setRows((prev) =>
      prev.map((r, i) => i === index ? { ...r, status: "processing", message: "Buscando usuario..." } : r),
    );

    try {
      // 1. Buscar usuario por email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, first_name, last_name")
        .eq("email", row.email.toLowerCase())
        .maybeSingle();

      if (profileError) throw new Error(`BD: ${profileError.message}`);
      if (!profile) throw new Error("Usuario no encontrado en el sistema");

      const userName =
        profile.full_name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        row.email;

      // 2. Determinar tabla
      const tableName = resolveTable(selectedRole?.name || "");
      if (!tableName)
        throw new Error(`No se puede determinar la tabla para el rol "${selectedRole?.name}"`);

      // 3. Verificar matrícula duplicada
      const { data: existing } = await supabase
        .from(tableName as any)
        .select("id")
        .eq("user_id", profile.id)
        .eq("academic_period_id", selectedPeriodId)
        .maybeSingle();

      if (existing) {
        setRows((prev) =>
          prev.map((r, i) =>
            i === index ? { ...r, status: "skipped", message: "Ya matriculado en este período", userName } : r,
          ),
        );
        return;
      }

      // 4. Insertar matrícula
      const { error: enrollError } = await supabase
        .from(tableName as any)
        .insert({
          id: crypto.randomUUID(),
          user_id: profile.id,
          academic_period_id: selectedPeriodId,
          enrolled_at: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (enrollError) throw new Error(enrollError.message);

      setRows((prev) =>
        prev.map((r, i) =>
          i === index ? { ...r, status: "success", message: "Matriculado correctamente", userName } : r,
        ),
      );
    } catch (err: any) {
      setRows((prev) =>
        prev.map((r, i) =>
          i === index ? { ...r, status: "error", message: err.message ?? "Error desconocido" } : r,
        ),
      );
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
      setStep(1); setRows([]); setSelectedRoleId("");
      setSelectedPeriodId(""); setValidationErrors("" as any); setFileName("");
    }, 300);
  };

  const handleRetryErrors = () => {
    const failed = rows.filter((r) => r.status === "error");
    setRows(failed.map((r) => ({ ...r, status: "pending", message: "", userName: undefined })));
    setFileName(`${failed.length} usuarios con error`);
    setSelectedRoleId("");
    setSelectedPeriodId("");
    setStep(1);
  };

  // ── Icono de estado ──────────────────────────────────────────────────────────
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
        Matrícula masiva CSV
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">

          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-base font-semibold">
                Matrícula masiva de usuarios
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
                      Solo necesitas el email de cada usuario. El período y el rol se configuran en el siguiente paso.
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
                          <p className="text-xs text-emerald-600">{rows.length} emails detectados</p>
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
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
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
                        <SelectValue placeholder="— Selecciona un período —" />
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
                    <p className="text-sm font-medium">Rol</p>
                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                      <SelectTrigger>
                        <SelectValue placeholder="— Selecciona un rol —" />
                      </SelectTrigger>
                      <SelectContent>
                        {rolesList
                          .filter((r) => resolveTable(r.name) !== null)
                          .map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {selectedRole && (
                      <p className="text-xs text-muted-foreground">
                        Tabla: <code>{resolveTable(selectedRole.name)}</code>
                      </p>
                    )}
                  </div>
                </div>

                {/* Resumen */}
                {selectedRole && selectedPeriod && (
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-xl border bg-muted/30 p-3 text-center">
                      <p className="text-2xl font-bold">{rows.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">usuarios a matricular</p>
                    </div>
                    <div className="flex-1 rounded-xl border bg-muted/30 p-3 text-center">
                      <p className="text-base font-bold mt-1">{selectedPeriod.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">período</p>
                    </div>
                    <div className="flex-1 rounded-xl border bg-muted/30 p-3 text-center">
                      <p className="text-base font-bold mt-1">{selectedRole.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">rol</p>
                    </div>
                  </div>
                )}

                {/* Preview lista de emails */}
                <div>
                  <p className="text-sm font-medium mb-2">Usuarios a matricular</p>
                  <div className="rounded-xl border overflow-hidden">
                    <div className="max-h-52 overflow-y-auto">
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

            {/* ───── PASO 3: Matriculando ───── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-2">
                      {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      {isProcessing ? "Matriculando usuarios..." : "Proceso completado"}
                    </span>
                    <span className="text-muted-foreground font-mono">{processed}/{rows.length}</span>
                  </div>
                  <Progress value={progress} className="h-2.5" />
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />{successCount} matriculados
                    </span>
                    {skippedCount > 0 && (
                      <span className="flex items-center gap-1.5 text-amber-500">
                        <AlertTriangle className="w-3.5 h-3.5" />{skippedCount} ya matriculados
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
                          <span className="shrink-0 ml-auto pl-2">
                            {row.status === "processing" && <span className="text-blue-400">procesando...</span>}
                            {row.status === "success" && <span className="text-emerald-500">✓ matriculado</span>}
                            {row.status === "skipped" && <span className="text-amber-400">⚠ ya matriculado</span>}
                            {row.status === "error" && (
                              <span className="text-red-400 truncate max-w-[200px]">{row.message}</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 py-0.5 px-1">
                        <CircleDot className="w-3 h-3 animate-pulse" />
                        <span>Procesando siguiente usuario...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ───── PASO 4: Resultado ───── */}
            {step === 4 && (
              <div className="space-y-4">
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
                      {errorCount === 0 ? "¡Matrícula completada!" : "Proceso finalizado con errores"}
                    </p>
                    <p className={cn("text-sm mt-0.5", errorCount === 0 ? "text-emerald-700" : "text-amber-700")}>
                      {successCount} matriculado(s) correctamente
                      {skippedCount > 0 && ` · ${skippedCount} ya estaban matriculados`}
                      {errorCount > 0 && ` · ${errorCount} no pudieron procesarse`}
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
                    <p className="text-xs text-emerald-700 mt-0.5">Matriculados</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                    <p className="text-2xl font-bold text-amber-500">{skippedCount}</p>
                    <p className="text-xs text-amber-600 mt-0.5">Ya matriculados</p>
                  </div>
                  <div className={cn("rounded-xl border p-3 text-center", errorCount > 0 ? "border-red-200 bg-red-50" : "")}>
                    <p className={cn("text-2xl font-bold", errorCount > 0 ? "text-red-500" : "text-muted-foreground")}>{errorCount}</p>
                    <p className={cn("text-xs mt-0.5", errorCount > 0 ? "text-red-600" : "text-muted-foreground")}>Errores</p>
                  </div>
                </div>

                {/* Tabla errores */}
                {errorCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-red-700">Usuarios que no pudieron matricularse</p>
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
                  disabled={!selectedRoleId || !selectedPeriodId}
                >
                  Matricular {rows.length} usuarios <ChevronRight className="w-4 h-4 ml-1" />
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
