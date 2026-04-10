"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
  Star,
  Save,
  History,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { GroupHasActivity } from "@/Stores/groupHasActivityStore";
import { cn } from "@/lib/utils";
import { SubmissionComments } from "./SubmissionComments";

interface Estudiante {
  id: string;
  ghs_id?: string;
  full_name?: string;
  email: string;
  avatar_url?: string | null;
  conditions?: { id: string; name: string; color: string | null }[];
}

interface Submission {
  id: string;
  student_enrolled_id: string;
  grade: number | null;
  comment?: string | null;
  status: string;
  submitted_at: string;
  original_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  storage_path: string;
  bucket: string;
  graded_at: string | null;
  attempt_number: number | null;
}

interface GradeInput {
  grade: string;
  saving: boolean;
}

interface EntregasModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  actividad: GroupHasActivity;
  estudiantes: Estudiante[];
}

const supabase = createClient();

export function EntregasModal({
  open,
  onOpenChange,
  actividad,
  estudiantes,
}: EntregasModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<Record<string, GradeInput>>({});
  const [preview, setPreview] = useState<{
    url: string;
    mime: string | null;
    name: string | null;
  } | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setProfileId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchSubmissions();
  }, [open, actividad.id]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_activity_submission")
        .select("*")
        .eq("group_has_activity_id", actividad.id);

      if (error) throw error;
      const subs = data || [];
      setSubmissions(subs);

      // Inicializar inputs: todos los estudiantes del grupo (con o sin entrega)
      setGrades((prev) => {
        const next = { ...prev };
        // Estudiantes que entregaron — usar su nota existente
        for (const sub of subs) {
          next[sub.student_enrolled_id] = {
            grade: sub.grade !== null ? String(sub.grade) : "",
            saving: false,
          };
        }
        // Estudiantes sin entrega — asegurarse de que tengan una entrada vacía
        for (const est of estudiantes) {
          const key = est.ghs_id ?? "";
          if (key && !next[key]) {
            next[key] = { grade: "", saving: false };
          }
        }
        return next;
      });
    } catch {
      toast.error("Error al cargar entregas");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async (submission: Submission) => {
    const input = grades[submission.student_enrolled_id];
    if (!input) return;

    const gradeNum = input.grade !== "" ? Number(input.grade) : null;
    if (
      gradeNum !== null &&
      (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10)
    ) {
      toast.error("La nota debe estar entre 0 y 10");
      return;
    }

    setGrades((prev) => ({
      ...prev,
      [submission.student_enrolled_id]: { ...input, saving: true },
    }));

    try {
      const { error } = await supabase
        .from("student_activity_submission")
        .update({
          grade: gradeNum,
          graded_at: new Date().toISOString(),
          status: gradeNum !== null ? "graded" : submission.status,
        })
        .eq("id", submission.id);

      if (error) throw error;

      // Actualizar local
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submission.id
            ? { ...s, grade: gradeNum, graded_at: new Date().toISOString() }
            : s,
        ),
      );
      toast.success("Nota guardada");
    } catch {
      toast.error("Error al guardar nota");
    } finally {
      setGrades((prev) => ({
        ...prev,
        [submission.student_enrolled_id]: { ...input, saving: false },
      }));
    }
  };

  // Guardar nota para estudiante que NO entregó → INSERT
  const handleSaveManualGrade = async (studentEnrolledId: string) => {
    const input = grades[studentEnrolledId];
    if (!input) return;

    const gradeNum = input.grade !== "" ? Number(input.grade) : null;
    if (gradeNum !== null && (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10)) {
      toast.error("La nota debe estar entre 0 y 10");
      return;
    }

    setGrades((prev) => ({
      ...prev,
      [studentEnrolledId]: { ...input, saving: true },
    }));

    try {
      const { data: inserted, error } = await supabase
        .from("student_activity_submission")
        .insert({
          group_has_activity_id: actividad.id,
          student_enrolled_id: studentEnrolledId,
          grade: gradeNum,
          status: gradeNum !== null ? "graded" : "submitted",
          submitted_at: new Date().toISOString(),
          graded_at: gradeNum !== null ? new Date().toISOString() : null,
          storage_path: "",
          bucket: "",
          attempt_number: 1,
        })
        .select()
        .single();

      if (error) throw error;
      setSubmissions((prev) => [...prev, inserted]);
      toast.success("Nota guardada");
    } catch {
      toast.error("Error al guardar nota");
    } finally {
      setGrades((prev) => ({
        ...prev,
        [studentEnrolledId]: { ...input, saving: false },
      }));
    }
  };

  const getSignedUrl = async (submission: Submission) => {
    const { data } = await supabase.storage
      .from(submission.bucket)
      .createSignedUrl(submission.storage_path, 120);
    return data?.signedUrl ?? null;
  };

  const handleDownload = async (submission: Submission) => {
    try {
      const url = await getSignedUrl(submission);
      if (url) window.open(url, "_blank");
    } catch {
      toast.error("No se pudo generar el enlace de descarga");
    }
  };

  const handlePreview = async (submission: Submission) => {
    try {
      const url = await getSignedUrl(submission);
      if (!url) return toast.error("No se pudo generar la previsualización");
      const mime = submission.mime_type ?? "";
      // Si el navegador puede renderizarlo inline, abrimos el dialog
      if (
        mime.startsWith("image/") ||
        mime === "application/pdf" ||
        mime.startsWith("video/") ||
        mime.startsWith("audio/")
      ) {
        setPreview({ url, mime, name: submission.original_name });
      } else {
        // Para otros formatos (Word, Excel, etc.) abrimos en nueva pestaña
        window.open(url, "_blank");
      }
    } catch {
      toast.error("No se pudo previsualizar el archivo");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filtrar estudiantes según la condición de aprendizaje de la actividad
  const estudiantesFiltrados = actividad.target_condition_id
    ? estudiantes.filter((e) =>
        e.conditions?.some((c) => c.id === actividad.target_condition_id),
      )
    : estudiantes.filter((e) => !e.conditions || e.conditions.length === 0);

  const entregados = submissions.length;
  const calificados = submissions.filter((s) => s.grade !== null).length;

  const p = preview; // narrowing para TypeScript

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[860px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-8">
              <Star className="w-5 h-5 text-orange-500" />
              Entregas — {actividad.title}
            </DialogTitle>
            <DialogDescription className="flex gap-4 text-xs mt-1">
              <span>
                <span className="font-semibold text-foreground">
                  {estudiantesFiltrados.length}
                </span>{" "}
                estudiantes
              </span>
              <span>
                <span className="font-semibold text-green-600">
                  {entregados}
                </span>{" "}
                entregaron
              </span>
              <span>
                <span className="font-semibold text-blue-600">
                  {calificados}
                </span>{" "}
                calificados
              </span>
              {actividad.grade_percentage !== null && (
                <span>
                  Peso:{" "}
                  <span className="font-semibold">
                    {actividad.grade_percentage}%
                  </span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Cargando entregas...
              </div>
            ) : (
              <div className="space-y-3 py-2">
                {estudiantesFiltrados.map((est) => {
                  // Todos los intentos del estudiante, ordenados de más nuevo a más viejo
                  const allSubs = est.ghs_id
                    ? submissions
                        .filter((s) => s.student_enrolled_id === est.ghs_id)
                        .sort(
                          (a, b) =>
                            (b.attempt_number ?? 0) - (a.attempt_number ?? 0),
                        )
                    : [];
                  const latestSub = allSubs[0];
                  const prevSubs = allSubs.slice(1);
                  // gradeInput siempre existe: para estudiantes sin entrega
                  // se inicializa vacío en fetchSubmissions
                  const gradeInput = grades[est.ghs_id ?? ""] ?? { grade: "", saving: false };

                  const isExpanded = expandedStudents.has(est.ghs_id ?? "");
                  const toggleExpanded = () =>
                    setExpandedStudents((prev) => {
                      const next = new Set(prev);
                      const key = est.ghs_id ?? "";
                      next.has(key) ? next.delete(key) : next.add(key);
                      return next;
                    });

                  return (
                    <div
                      key={est.ghs_id}
                      className={cn(
                        "rounded-xl border overflow-hidden transition-colors",
                        latestSub
                          ? "border-green-200 dark:border-green-900"
                          : "border-border",
                      )}
                    >
                      {/* Franja superior */}
                      <div
                        className={`h-1 w-full ${latestSub?.grade != null ? "bg-blue-500" : latestSub ? "bg-emerald-500" : "bg-muted"}`}
                      />

                      {/* Cabecera clickeable (acordeón) */}
                      <button
                        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors"
                        onClick={toggleExpanded}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {(est.full_name || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {est.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {est.email}
                            </p>
                            <ConditionBadges
                              conditions={est.conditions}
                              className="mt-0.5"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {allSubs.length > 1 && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              <History className="w-3 h-3" />
                              {allSubs.length} intentos
                            </span>
                          )}
                          {latestSub ? (
                            latestSub.grade != null ? (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Nota: {latestSub.grade}
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Entregó
                              </Badge>
                            )
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Pendiente
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      </button>

                      {/* Cuerpo colapsable — visible siempre que se expanda */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t pt-3">

                          {/* Archivo de entrega (solo si entregó) */}
                          {latestSub && latestSub.storage_path && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border">
                              <div className="flex items-center gap-2 min-w-0">
                                {allSubs.length > 1 && (
                                  <span className="shrink-0 font-semibold text-primary text-[10px] bg-primary/10 px-1.5 py-0.5 rounded">
                                    #{latestSub.attempt_number ?? 1}
                                  </span>
                                )}
                                <span className="font-medium text-foreground truncate">
                                  {latestSub.original_name || "Archivo sin nombre"}
                                </span>
                                {latestSub.file_size && (
                                  <span className="shrink-0">
                                    {formatSize(latestSub.file_size)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span>{formatDate(latestSub.submitted_at)}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handlePreview(latestSub)}
                                  title="Previsualizar"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleDownload(latestSub)}
                                  title="Descargar"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Sin entrega — aviso informativo */}
                          {!latestSub && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-dashed">
                              <XCircle className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                              <span>Este estudiante no ha entregado la actividad.</span>
                            </div>
                          )}

                          {/* Historial de intentos anteriores */}
                          {prevSubs.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1">
                                <History className="w-3 h-3" />
                                Intentos anteriores
                              </p>
                              {prevSubs.map((s) => (
                                <div
                                  key={s.id}
                                  className="flex items-center justify-between text-xs text-muted-foreground bg-muted/20 rounded-md px-3 py-1.5 border border-dashed"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="shrink-0 text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                      #{s.attempt_number ?? "—"}
                                    </span>
                                    <span className="truncate">
                                      {s.original_name || "Archivo"}
                                    </span>
                                    {s.file_size && (
                                      <span className="shrink-0">
                                        {formatSize(s.file_size)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 ml-2">
                                    <span>{formatDate(s.submitted_at)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handlePreview(s)}
                                      title="Previsualizar"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleDownload(s)}
                                      title="Descargar"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Calificación — siempre visible */}
                          <div className="pt-3 border-t">
                            <div className="flex items-center gap-3 bg-muted/30 rounded-lg px-4 py-3">
                              <Star className="w-4 h-4 text-orange-500 shrink-0" />
                              <span className="text-sm font-medium text-foreground">
                                Nota
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (0 – 10)
                              </span>
                              <Input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                placeholder="—"
                                value={gradeInput.grade}
                                onChange={(e) =>
                                  setGrades((prev) => ({
                                    ...prev,
                                    [est.ghs_id ?? ""]: {
                                      ...prev[est.ghs_id ?? ""],
                                      grade: e.target.value,
                                    },
                                  }))
                                }
                                className="h-8 w-24 text-sm ml-1"
                              />
                              <div className="flex-1" />
                              {latestSub?.graded_at && (
                                <span className="text-xs text-muted-foreground shrink-0">
                                  Calificado: {formatDate(latestSub.graded_at)}
                                </span>
                              )}
                              <Button
                                size="sm"
                                className="gap-1.5 shrink-0"
                                disabled={gradeInput.saving}
                                onClick={() =>
                                  latestSub
                                    ? handleSaveGrade(latestSub)
                                    : handleSaveManualGrade(est.ghs_id ?? "")
                                }
                              >
                                {gradeInput.saving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Save className="w-3.5 h-3.5" />
                                )}
                                Guardar
                              </Button>
                            </div>
                          </div>

                          {/* Comentarios del hilo (solo si hay entrega real) */}
                          {profileId && latestSub && latestSub.storage_path && (
                            <div className="pt-3 border-t mt-2">
                              <SubmissionComments
                                submissionId={latestSub.id}
                                profileId={profileId}
                                authorType="teacher"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Dialog de previsualización ── */}
      {p && (
        <Dialog open={true} onOpenChange={() => setPreview(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
              <DialogTitle className="text-sm font-medium truncate pr-8">
                {p.name ?? "Previsualización"}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 shrink-0"
                onClick={() => setPreview(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogHeader>
            <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center min-h-[400px]">
              {p.mime?.startsWith("image/") ? (
                <img
                  src={p.url}
                  alt={p.name ?? "imagen"}
                  className="max-w-full max-h-[70vh] object-contain rounded"
                />
              ) : p.mime === "application/pdf" ? (
                <iframe
                  src={p.url}
                  className="w-full h-[70vh] border-0"
                  title={p.name ?? "PDF"}
                />
              ) : p.mime?.startsWith("video/") ? (
                <video
                  src={p.url}
                  controls
                  className="max-w-full max-h-[70vh] rounded"
                />
              ) : p.mime?.startsWith("audio/") ? (
                <div className="p-8">
                  <audio src={p.url} controls className="w-full" />
                </div>
              ) : null}
            </div>
            <div className="px-4 py-2 border-t flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(p.url, "_blank")}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Descargar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
