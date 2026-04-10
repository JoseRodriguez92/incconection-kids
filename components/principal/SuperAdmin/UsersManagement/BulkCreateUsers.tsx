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
  Users,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  FileDown,
  PartyPopper,
  CircleDot,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface CsvRow {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  document_type: string;
  document_number: string;
  learning_condition?: string;
}

type RowStatus = "pending" | "processing" | "success" | "error";

interface ProcessedRow extends CsvRow {
  status: RowStatus;
  message: string;
}

type WizardStep = 1 | 2 | 3 | 4;

interface BulkCreateUsersProps {
  rolesList: Array<{ id: string; name: string; slug: string }>;
  onFinish: () => void;
}

// ── CSV helpers ───────────────────────────────────────────────────────────────

const CSV_HEADERS = [
  "email", "password", "first_name", "last_name",
  "phone", "document_type", "document_number", "learning_condition",
];

const EXAMPLE_ROWS: CsvRow[] = [
  { email: "carlos.perez@colegio.edu.co", password: "Clave123", first_name: "Carlos", last_name: "Pérez", phone: "3001234567", document_type: "CC", document_number: "10234567", learning_condition: "" },
  { email: "maria.lopez@colegio.edu.co", password: "Clave456", first_name: "María", last_name: "López", phone: "3109876543", document_type: "CC", document_number: "20345678", learning_condition: "Síndrome de Down" },
];

function downloadTemplate() {
  const header = CSV_HEADERS.join(",");
  const rows = EXAMPLE_ROWS.map((r) =>
    CSV_HEADERS.map((h) => `"${(r as any)[h] ?? ""}"`).join(","),
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_usuarios.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadErrorCsv(rows: ProcessedRow[]) {
  const failed = rows.filter((r) => r.status === "error");
  if (!failed.length) return;
  const header = [...CSV_HEADERS, "error"].join(",");
  const lines = failed.map((r) =>
    [...CSV_HEADERS.map((h) => `"${(r as any)[h] ?? ""}"`), `"${r.message}"`].join(","),
  );
  const csv = [header, ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "errores_importacion.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/"/g, "").replace(/^\uFEFF/, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let cur = ""; let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { values.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    values.push(cur.trim());
    const row: any = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row as CsvRow;
  });
}

function validateRow(row: CsvRow, index: number): string | null {
  if (!row.email?.trim()) return `Fila ${index + 1}: email obligatorio`;
  if (!row.password?.trim()) return `Fila ${index + 1}: password obligatorio`;
  if (row.password.length < 6) return `Fila ${index + 1}: password mín. 6 caracteres`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
    return `Fila ${index + 1}: email inválido — ${row.email}`;
  return null;
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "Cargar" },
  { n: 2, label: "Revisar" },
  { n: 3, label: "Importar" },
  { n: 4, label: "Resultado" },
];

function StepIndicator({ current }: { current: WizardStep }) {
  return (
    <div className="flex items-center gap-0 w-full px-2">
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

export function BulkCreateUsers({ rolesList, onFinish }: BulkCreateUsersProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [conditionsCatalog, setConditionsCatalog] = useState<Array<{ id: string; name: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Cargar catálogo al abrir
  useEffect(() => {
    if (!open) return;
    supabase.from("learning_condition").select("id, name").then(({ data }) => {
      if (data) setConditionsCatalog(data);
    });
  }, [open]);

  const selectedRole = rolesList.find((r) => r.id === selectedRoleId);
  const processed = rows.filter((r) => r.status !== "pending").length;
  const successCount = rows.filter((r) => r.status === "success").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const progress = rows.length ? Math.round((processed / rows.length) * 100) : 0;

  // Auto-scroll del feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
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
      const errors: string[] = [];
      parsed.forEach((row, i) => {
        const err = validateRow(row, i);
        if (err) errors.push(err);
      });
      setValidationErrors(errors);
      setRows(parsed.map((r) => ({ ...r, status: "pending", message: "" })));
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  // ── Procesar una fila ────────────────────────────────────────────────────────
  const processRow = async (row: CsvRow, index: number) => {
    setRows((prev) =>
      prev.map((r, i) => i === index ? { ...r, status: "processing", message: "Creando usuario..." } : r),
    );
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: row.email,
        password: row.password,
        options: {
          data: {
            first_name: row.first_name || undefined,
            last_name: row.last_name || undefined,
            phone: row.phone || undefined,
            document_type: row.document_type || undefined,
            document_number: row.document_number || undefined,
          },
        },
      });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("No se pudo crear en Auth");

      const userId = authData.user.id;
      await new Promise((r) => setTimeout(r, 600));

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email: row.email,
          first_name: row.first_name || null,
          last_name: row.last_name || null,
          full_name: [row.first_name, row.last_name].filter(Boolean).join(" ") || null,
          phone: row.phone || null,
          document_type: row.document_type || null,
          document_number: row.document_number || null,
        })
        .eq("id", userId);
      if (profileError) throw new Error(`Perfil: ${profileError.message}`);

      // Asignar condición de aprendizaje si viene en el CSV
      if (row.learning_condition?.trim()) {
        const match = conditionsCatalog.find(
          (c) => c.name.toLowerCase() === row.learning_condition!.trim().toLowerCase()
        );
        if (match) {
          await supabase.from("profile_has_learning_condition").insert({
            profile_id: userId,
            learning_condition_id: match.id,
          });
        }
      }

      if (selectedRoleId) {
        const { error: roleError } = await supabase
          .from("profiles_roles")
          .insert({ user_id: userId, role_id: selectedRoleId });
        if (roleError) throw new Error(`Rol: ${roleError.message}`);
      }

      setRows((prev) =>
        prev.map((r, i) => i === index ? { ...r, status: "success", message: "Creado correctamente" } : r),
      );
    } catch (err: any) {
      setRows((prev) =>
        prev.map((r, i) => i === index ? { ...r, status: "error", message: err.message ?? "Error desconocido" } : r),
      );
    }
  };

  // ── Iniciar importación ──────────────────────────────────────────────────────
  const handleProcess = async () => {
    setStep(3);
    setIsProcessing(true);
    for (let i = 0; i < rows.length; i++) await processRow(rows[i], i);
    setIsProcessing(false);
    setStep(4);
    onFinish();
  };

  const handleClose = () => {
    if (isProcessing) return;
    setOpen(false);
    setTimeout(() => {
      setStep(1); setRows([]); setSelectedRoleId("");
      setValidationErrors([]); setFileName("");
    }, 300);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Carga masiva
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">

          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-base font-semibold">Importación masiva de usuarios</DialogTitle>
            </div>
            <StepIndicator current={step} />
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ───── PASO 1: Cargar ───── */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Descargar plantilla */}
                <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                  <div>
                    <p className="text-sm font-medium">Paso 1 — Descarga la plantilla</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Llena las columnas con los datos de cada usuario. El rol se asigna en el siguiente paso.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {CSV_HEADERS.map((h) => (
                        <code key={h} className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          {h}{(h === "email" || h === "password") && <span className="text-red-500 ml-0.5">*</span>}
                        </code>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadTemplate} className="shrink-0">
                    <Download className="w-4 h-4 mr-2" />
                    Plantilla
                  </Button>
                </div>

                {/* Upload area */}
                <div>
                  <p className="text-sm font-medium mb-2">Paso 2 — Sube el archivo CSV</p>
                  {rows.length === 0 ? (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/40 hover:bg-muted/20 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium group-hover:text-foreground transition-colors">Haz clic para seleccionar el archivo</p>
                        <p className="text-xs mt-0.5">Solo archivos .csv</p>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-emerald-50 border-emerald-200">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-emerald-800 truncate">{fileName}</p>
                          <p className="text-xs text-emerald-600">{rows.length} usuarios detectados</p>
                        </div>
                        <button onClick={() => fileRef.current?.click()} className="text-xs text-emerald-700 hover:underline shrink-0">
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

            {/* ───── PASO 2: Revisar ───── */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Selector de rol */}
                <div className="rounded-xl border p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium">Rol para todos los usuarios</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Todos los usuarios del CSV recibirán este rol al ser creados.
                    </p>
                  </div>
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="— Selecciona un rol —" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesList.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resumen */}
                {selectedRole && (
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-xl border bg-muted/30 p-3 text-center">
                      <p className="text-2xl font-bold">{rows.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">usuarios a crear</p>
                    </div>
                    <div className="flex-1 rounded-xl border bg-muted/30 p-3 text-center">
                      <p className="text-lg font-bold mt-0.5">{selectedRole.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">rol asignado</p>
                    </div>
                    <div className="flex-1 rounded-xl border bg-muted/30 p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        {rows.length - validationErrors.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">listos para importar</p>
                    </div>
                  </div>
                )}

                {/* Tabla de revisión */}
                <div>
                  <p className="text-sm font-medium mb-2">Vista previa de los usuarios</p>
                  <div className="rounded-xl border overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                          <TableRow>
                            <TableHead className="w-8">#</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Documento</TableHead>
                            <TableHead>Teléfono</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                              <TableCell className="text-sm">{row.email}</TableCell>
                              <TableCell className="text-sm">
                                {[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {row.document_type && row.document_number
                                  ? `${row.document_type} ${row.document_number}` : "—"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{row.phone || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───── PASO 3: Importando ───── */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Barra de progreso */}
                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-2">
                      {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      {isProcessing ? "Importando usuarios..." : "Importación completa"}
                    </span>
                    <span className="text-muted-foreground font-mono">{processed}/{rows.length}</span>
                  </div>
                  <Progress value={progress} className="h-2.5" />
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />{successCount} exitosos
                    </span>
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
                            "flex items-start gap-2 text-xs py-0.5 px-1 rounded transition-all",
                            row.status === "processing" && "text-blue-300",
                            row.status === "success" && "text-emerald-400",
                            row.status === "error" && "text-red-400",
                          )}
                        >
                          <span className="shrink-0 mt-0.5">
                            {row.status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
                            {row.status === "success" && <CheckCircle2 className="w-3 h-3" />}
                            {row.status === "error" && <XCircle className="w-3 h-3" />}
                          </span>
                          <span className="text-zinc-400 shrink-0 w-5">{String(i + 1).padStart(2, "0")}</span>
                          <span className="truncate">{row.email}</span>
                          <span className="shrink-0 ml-auto pl-2">
                            {row.status === "processing" && <span className="text-blue-400">procesando...</span>}
                            {row.status === "success" && <span className="text-emerald-500">✓ creado</span>}
                            {row.status === "error" && <span className="text-red-400 truncate max-w-[200px]">{row.message}</span>}
                          </span>
                        </div>
                      );
                    })}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 py-0.5 px-1">
                        <CircleDot className="w-3 h-3 animate-pulse" />
                        <span>Esperando siguiente usuario...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ───── PASO 4: Resultado ───── */}
            {step === 4 && (
              <div className="space-y-4">
                {/* Banner resultado */}
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
                      {errorCount === 0 ? "¡Importación completada!" : "Importación finalizada con errores"}
                    </p>
                    <p className={cn("text-sm mt-0.5", errorCount === 0 ? "text-emerald-700" : "text-amber-700")}>
                      {successCount} usuario(s) creados correctamente
                      {errorCount > 0 && ` · ${errorCount} no pudieron crearse`}
                    </p>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border p-3 text-center">
                    <p className="text-2xl font-bold">{rows.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Total procesados</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{successCount}</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Creados</p>
                  </div>
                  <div className={cn("rounded-xl border p-3 text-center", errorCount > 0 ? "border-red-200 bg-red-50" : "")}>
                    <p className={cn("text-2xl font-bold", errorCount > 0 ? "text-red-500" : "text-muted-foreground")}>{errorCount}</p>
                    <p className={cn("text-xs mt-0.5", errorCount > 0 ? "text-red-600" : "text-muted-foreground")}>Errores</p>
                  </div>
                </div>

                {/* Detalle de errores */}
                {errorCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-red-700">Usuarios que no pudieron crearse</p>
                      <Button variant="outline" size="sm" onClick={() => downloadErrorCsv(rows)} className="h-7 text-xs">
                        <FileDown className="w-3.5 h-3.5 mr-1.5" />
                        Descargar CSV de errores
                      </Button>
                    </div>
                    <div className="rounded-xl border border-red-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-red-50">
                            <TableHead className="text-red-700">Email</TableHead>
                            <TableHead className="text-red-700">Motivo del error</TableHead>
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
            {/* Botón atrás */}
            <div>
              {step === 2 && !isProcessing && (
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
                </Button>
              )}
            </div>

            {/* Botones adelante / cerrar */}
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
                  disabled={!selectedRoleId}
                >
                  Importar {rows.length} usuarios <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {step === 4 && errorCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleReset();
                    setStep(1);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reintentar errores
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  function handleReset() {
    const errorRows = rows.filter((r) => r.status === "error");
    setRows(errorRows.map((r) => ({ ...r, status: "pending", message: "" })));
    setSelectedRoleId("");
    setFileName(`${errorRows.length} usuarios con error`);
  }
}
