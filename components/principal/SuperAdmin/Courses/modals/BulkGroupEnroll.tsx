"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
  FileDown,
  PartyPopper,
  CircleDot,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { GroupHasStudentsStore } from "@/Stores/groupHasStudentsStore";

// ── Types ──────────────────────────────────────────────────────────────────────

type RowStatus = "pending" | "processing" | "success" | "error" | "skipped";

interface ProcessedRow {
  email: string;
  status: RowStatus;
  message: string;
  userName?: string;
  currentGroup?: string;
  step?: string;
}

type WizardStep = 1 | 2 | 3;

interface BulkGroupEnrollProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: {
    id: string;
    name: string;
    year: string;       // academic_period_id
    course_id: string;
    max_students?: number | null;
  };
}

// ── CSV helpers ────────────────────────────────────────────────────────────────

function downloadTemplate() {
  const csv = "email\ncarlos.perez@colegio.edu.co\nmaria.lopez@colegio.edu.co";
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_estudiantes_grupo.csv";
  a.click();
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
  a.href = url;
  a.download = "errores_asignacion.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): string[] {
  const lines = text.trim().split(/\r?\n/);
  const first = lines[0]
    .replace(/"/g, "")
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, "");
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

// ── Step indicator ─────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "CSV" },
  { n: 2, label: "Procesando" },
  { n: 3, label: "Resultado" },
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
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  done && "bg-emerald-500 text-white",
                  active &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  active
                    ? "text-primary"
                    : done
                      ? "text-emerald-600"
                      : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1 mb-4",
                  done ? "bg-emerald-400" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Row status icon ────────────────────────────────────────────────────────────

function RowIcon({ status }: { status: RowStatus }) {
  if (status === "success")
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
  if (status === "error")
    return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
  if (status === "skipped")
    return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  if (status === "processing")
    return (
      <Loader2 className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-spin" />
    );
  return <CircleDot className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BulkGroupEnroll({
  open,
  onOpenChange,
  group,
}: BulkGroupEnrollProps) {
  const { fetchGroupHasStudents } = GroupHasStudentsStore();

  const [step, setStep] = useState<WizardStep>(1);
  const [emails, setEmails] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  const processed = rows.filter((r) => r.status !== "pending").length;
  const successCount = rows.filter((r) => r.status === "success").length;
  const skippedCount = rows.filter((r) => r.status === "skipped").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const progress = rows.length
    ? Math.round((processed / rows.length) * 100)
    : 0;

  // Auto-scroll feed
  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [processed]);

  // Reset on close
  const handleClose = () => {
    if (isProcessing) return;
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setEmails([]);
      setRows([]);
      setValidationErrors([]);
      setFileName("");
    }, 300);
  };

  // ── CSV ────────────────────────────────────────────────────────────────────
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

  // ── Update row ─────────────────────────────────────────────────────────────
  const updateRow = (index: number, patch: Partial<ProcessedRow>) =>
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );

  // ── Process one row ────────────────────────────────────────────────────────
  const processRow = async (email: string, index: number) => {
    updateRow(index, { status: "processing", step: "Buscando usuario..." });

    try {
      // 1 — Find profile
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

      // 2 — Check or create enrollment for the group's period
      updateRow(index, { step: "Verificando matrícula...", userName });

      let enrollmentId: string;

      const { data: existing } = await supabase
        .from("student_enrolled")
        .select("id")
        .eq("user_id", profile.id)
        .eq("academic_period_id", group.year)
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
            academic_period_id: group.year,
            enrolled_at: new Date().toISOString(),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        if (enrollError) throw new Error(`Matrícula: ${enrollError.message}`);
        enrollmentId = newId;
      }

      // 3 — Check if already in any group this period
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

      // 4 — Assign to this group
      updateRow(index, { step: "Asignando al grupo..." });

      const { error: groupError } = await supabase
        .from("group_has_students")
        .insert({
          id: crypto.randomUUID(),
          group_id: group.id,
          student_enrolled_id: enrollmentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (groupError) throw new Error(`Grupo: ${groupError.message}`);

      updateRow(index, {
        status: "success",
        message: "Matriculado y asignado al grupo",
        userName,
        step: undefined,
      });
    } catch (err: any) {
      updateRow(index, {
        status: "error",
        message: err.message ?? "Error desconocido",
        step: undefined,
      });
    }
  };

  // ── Start processing ───────────────────────────────────────────────────────
  const handleProcess = async () => {
    const initialRows: ProcessedRow[] = emails.map((e) => ({
      email: e,
      status: "pending",
      message: "",
    }));
    setRows(initialRows);
    setStep(2);
    setIsProcessing(true);
    for (let i = 0; i < emails.length; i++) await processRow(emails[i], i);
    setIsProcessing(false);
    await fetchGroupHasStudents();
    setStep(3);
  };

  const handleRetryErrors = () => {
    const failedEmails = rows
      .filter((r) => r.status === "error")
      .map((r) => r.email);
    setEmails(failedEmails);
    setFileName(`${failedEmails.length} usuario(s) con error`);
    setRows([]);
    setStep(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0 pr-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-tight">
                Carga masiva — Grupo {group.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Solo necesitas el CSV con emails. El período y el grupo ya están
                configurados.
              </p>
            </div>
          </div>
          <StepIndicator current={step} />
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── Step 1: CSV upload ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Context info */}
              <div className="rounded-lg border bg-muted/30 p-4 flex items-start gap-3">
                <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm space-y-0.5">
                  <p className="font-medium">
                    Asignando al Grupo{" "}
                    <span className="text-primary">{group.name}</span>
                  </p>
                  {group.max_students && (
                    <p className="text-xs text-muted-foreground">
                      Capacidad máxima: {group.max_students} estudiantes
                    </p>
                  )}
                </div>
              </div>

              {/* Template download */}
              <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">Plantilla CSV</p>
                    <p className="text-xs text-muted-foreground">
                      Una columna: <code className="font-mono">email</code>
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="shrink-0"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>

              {/* Upload zone */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                  emails.length > 0
                    ? "border-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10"
                    : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/20",
                )}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {emails.length === 0 ? (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground/40" />
                    <p className="text-sm font-medium">
                      Haz clic para seleccionar el CSV
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Solo archivos .csv
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {emails.length} email(s) detectado(s) · clic para cambiar
                    </p>
                  </div>
                )}
              </div>

              {/* Validation errors */}
              {validationErrors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 p-4 space-y-1.5">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {validationErrors.length} error(es) en el CSV
                  </p>
                  <ul className="space-y-0.5">
                    {validationErrors.slice(0, 5).map((e, i) => (
                      <li
                        key={i}
                        className="text-xs text-red-600 dark:text-red-400 font-mono"
                      >
                        {e}
                      </li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li className="text-xs text-red-500">
                        +{validationErrors.length - 5} más...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Email preview */}
              {emails.length > 0 && validationErrors.length === 0 && (
                <div className="rounded-lg border p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Preview ({emails.length} registros)
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-0.5">
                    {emails.slice(0, 8).map((e, i) => (
                      <p key={i} className="text-xs font-mono text-foreground">
                        {e}
                      </p>
                    ))}
                    {emails.length > 8 && (
                      <p className="text-xs text-muted-foreground">
                        ...y {emails.length - 8} más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Processing ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {processed} / {rows.length} procesados
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Live feed */}
              <div
                ref={feedRef}
                className="rounded-xl bg-zinc-950 p-4 h-72 overflow-y-auto space-y-0.5 font-mono text-xs"
              >
                {rows.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 py-0.5">
                    <RowIcon status={r.status} />
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "font-medium",
                          r.status === "success" && "text-emerald-400",
                          r.status === "error" && "text-red-400",
                          r.status === "skipped" && "text-amber-400",
                          r.status === "processing" && "text-blue-300",
                          r.status === "pending" && "text-zinc-600",
                        )}
                      >
                        {r.email}
                      </span>
                      {r.userName && r.status !== "pending" && (
                        <span className="text-zinc-400 ml-1">
                          ({r.userName})
                        </span>
                      )}
                      {r.step && (
                        <span className="text-zinc-500 ml-1">— {r.step}</span>
                      )}
                      {r.message && !r.step && (
                        <span
                          className={cn(
                            "ml-1",
                            r.status === "success" && "text-emerald-600",
                            r.status === "error" && "text-red-600",
                            r.status === "skipped" && "text-amber-600",
                          )}
                        >
                          — {r.message}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isProcessing && (
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Procesando... no cierres esta ventana
                </p>
              )}
            </div>
          )}

          {/* ── Step 3: Results ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <PartyPopper className="w-10 h-10 mx-auto mb-3 text-primary" />
                <p className="text-lg font-bold">Proceso completado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Grupo {group.name}
                </p>
              </div>

              {/* Summary badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {successCount}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Asignados
                  </p>
                </div>
                <div className="rounded-xl border bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {skippedCount}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    Omitidos
                  </p>
                </div>
                <div className="rounded-xl border bg-red-50 dark:bg-red-900/20 p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {errorCount}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                    Errores
                  </p>
                </div>
              </div>

              {/* Skipped explanation */}
              {skippedCount > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 dark:bg-amber-900/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-semibold mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {skippedCount} estudiante(s) omitido(s) — NO fueron
                    reasignados
                  </p>
                  <p>
                    Ya pertenecen a un grupo en este período académico. Si
                    necesitas moverlos, primero retíralos del grupo actual.
                  </p>
                  <div className="mt-2 space-y-0.5">
                    {rows
                      .filter((r) => r.status === "skipped")
                      .map((r, i) => (
                        <p key={i} className="font-mono">
                          {r.email}
                          {r.currentGroup && (
                            <span className="text-amber-600">
                              {" "}
                              → grupo actual: {r.currentGroup}
                            </span>
                          )}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {errorCount > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50/60 dark:bg-red-900/10 p-3 text-xs text-red-800 dark:text-red-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    {errorCount} error(es)
                  </p>
                  {rows
                    .filter((r) => r.status === "error")
                    .map((r, i) => (
                      <p key={i} className="font-mono">
                        {r.email} — {r.message}
                      </p>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            {step === 3 && errorCount > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleRetryErrors}>
                  <Loader2 className="w-4 h-4 mr-2" />
                  Reintentar errores
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadErrorCsv(rows)}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar errores
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {step === 1 && (
              <>
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={
                    emails.length === 0 || validationErrors.length > 0
                  }
                  onClick={handleProcess}
                >
                  Procesar {emails.length > 0 ? `(${emails.length})` : ""}
                </Button>
              </>
            )}
            {step === 2 && (
              <Button variant="outline" size="sm" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Espera..."
                )}
              </Button>
            )}
            {step === 3 && (
              <Button size="sm" onClick={handleClose}>
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
