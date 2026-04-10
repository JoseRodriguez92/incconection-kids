"use client";

import { useState } from "react";
import { SubmissionComments } from "@/app/usuario/profesor/clases/components/SubmissionComments";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { GroupHasActivity } from "@/Stores/groupHasActivityStore";
import type { CycleWithRelation } from "@/Stores/cycleStore";
import type { Database } from "@/src/types/database.types";
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Eye,
  Loader2,
  Upload,
} from "lucide-react";

type Submission =
  Database["public"]["Tables"]["student_activity_submission"]["Row"];

interface TabActividadesEstudianteProps {
  actividades: GroupHasActivity[];
  loading: boolean;
  cycles: CycleWithRelation[];
  submissions: Record<string, Submission>;
  groupStudentId: string | null;
  profileId: string | null;
  onSubmissionAdded: (actividadId: string, submission: Submission) => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getCycleName(cycleId: string, cycles: CycleWithRelation[]) {
  const cycle = cycles.find((c) => c.id === cycleId);
  return cycle ? cycle.name : "Trimestre";
}

function sortedCycleEntries<T>(
  map: Record<string, T[]>,
  cycles: CycleWithRelation[],
) {
  return Object.entries(map).sort(([idA], [idB]) => {
    const nameA = cycles.find((c) => c.id === idA)?.name ?? "";
    const nameB = cycles.find((c) => c.id === idB)?.name ?? "";
    return nameA.localeCompare(nameB, undefined, { numeric: true });
  });
}

function getLimitDateStatus(limitDate: string | null) {
  if (!limitDate) return null;
  const now = new Date();
  const limit = new Date(limitDate);
  const diffDays = Math.ceil(
    (limit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0)
    return { label: `Venció hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? "s" : ""}`, color: "text-red-500" };
  if (diffDays === 0) return { label: "Vence hoy", color: "text-amber-500" };
  if (diffDays <= 3)
    return { label: `Vence en ${diffDays} día${diffDays !== 1 ? "s" : ""}`, color: "text-amber-500" };
  return {
    label: `Vence en ${diffDays} día${diffDays !== 1 ? "s" : ""}`,
    color: "text-emerald-600",
  };
}

function getSubmissionUrl(submission: Submission) {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(submission.bucket)
    .getPublicUrl(submission.storage_path);
  return data.publicUrl;
}

export function TabActividadesEstudiante({
  actividades,
  loading,
  cycles,
  submissions,
  groupStudentId,
  profileId,
  onSubmissionAdded,
}: TabActividadesEstudianteProps) {
  const [submittingActivity, setSubmittingActivity] =
    useState<GroupHasActivity | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadComment, setUploadComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!uploadFile || !submittingActivity || !groupStudentId) return;
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const ext = uploadFile.name.split(".").pop() ?? "bin";
      const path = `${groupStudentId}/${submittingActivity.id}/${Date.now()}.${ext}`;
      const bucket = "submissions";

      const { error: storageError } = await supabase.storage
        .from(bucket)
        .upload(path, uploadFile, { upsert: true });
      if (storageError) throw storageError;

      const existing = submissions[submittingActivity.id];
      const { data: newSub, error: dbError } = await supabase
        .from("student_activity_submission")
        .insert({
          group_has_activity_id: submittingActivity.id,
          student_enrolled_id: groupStudentId,
          storage_path: path,
          bucket,
          original_name: uploadFile.name,
          mime_type: uploadFile.type,
          file_size: uploadFile.size,
          comment: uploadComment || null,
          status: "submitted",
          attempt_number: existing ? existing.attempt_number + 1 : 1,
        })
        .select()
        .single();
      if (dbError) throw dbError;

      onSubmissionAdded(submittingActivity.id, newSub);
      setSubmittingActivity(null);
      setUploadFile(null);
      setUploadComment("");
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const actividadesPorCiclo = actividades.reduce(
    (acc, a) => {
      const key = a.cycle_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    },
    {} as Record<string, GroupHasActivity[]>,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actividades</CardTitle>
          <CardDescription>
            Tareas y evaluaciones asignadas por el docente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                Cargando actividades...
              </p>
            </div>
          ) : actividades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="rounded-full bg-muted p-6">
                <ClipboardList className="h-14 w-14 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg">
                  No hay actividades disponibles
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  El docente aún no ha creado actividades para esta clase.
                </p>
              </div>
            </div>
          ) : (
            <Accordion
              type="multiple"
              className="space-y-4"
              defaultValue={Object.keys(actividadesPorCiclo)}
            >
              {sortedCycleEntries(actividadesPorCiclo, cycles).map(
                ([cycleId, acts]) => (
                  <AccordionItem
                    key={cycleId}
                    value={cycleId}
                    className="border rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-base">
                              Trimestre {getCycleName(cycleId, cycles)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {acts.length} actividad
                              {acts.length !== 1 ? "es" : ""}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-auto mr-2">
                          {acts.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <div className="space-y-3">
                        {acts.map((actividad) => {
                          const submission = submissions[actividad.id];
                          const dateStatus = getLimitDateStatus(actividad.limit_date);
                          const isGraded = submission?.grade != null;
                          const isSubmitted = !!submission && !isGraded;

                          return (
                            <div
                              key={actividad.id}
                              className="border rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                            >
                              {/* Franja superior de estado */}
                              <div className={`h-1 w-full ${isGraded ? "bg-blue-500" : isSubmitted ? "bg-emerald-500" : dateStatus?.color === "text-red-500" ? "bg-red-400" : "bg-muted"}`} />

                              <div className="p-4 space-y-3">
                                {/* Título + badges estado */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div className={`p-2 rounded-lg shrink-0 ${isGraded ? "bg-blue-100 dark:bg-blue-950" : isSubmitted ? "bg-emerald-100 dark:bg-emerald-950" : "bg-muted"}`}>
                                      <ClipboardList className={`h-4 w-4 ${isGraded ? "text-blue-600" : isSubmitted ? "text-emerald-600" : "text-muted-foreground"}`} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm leading-snug">{actividad.title}</p>
                                      {actividad.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                          {actividad.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {/* Badge estado */}
                                  {isGraded ? (
                                    <Badge className="shrink-0 bg-blue-100 text-blue-700 border-blue-200 text-xs gap-1 dark:bg-blue-950 dark:text-blue-300">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Calificado
                                    </Badge>
                                  ) : isSubmitted ? (
                                    <Badge className="shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1 dark:bg-emerald-950 dark:text-emerald-300">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Entregado
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="shrink-0 text-xs">
                                      Pendiente
                                    </Badge>
                                  )}
                                </div>

                                {/* Fila de metadatos */}
                                <div className="flex flex-wrap gap-2">
                                  {/* Fecha límite */}
                                  {actividad.limit_date && (
                                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                                      dateStatus?.color === "text-red-500"
                                        ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                                        : dateStatus?.color === "text-amber-500"
                                          ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                                    }`}>
                                      <CalendarClock className="h-3 w-3 shrink-0" />
                                      {dateStatus?.label ?? formatDate(actividad.limit_date)}
                                    </div>
                                  )}
                                  {/* Peso en la nota */}
                                  {actividad.grade_percentage != null && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                      <span className="font-bold">{actividad.grade_percentage}%</span>
                                      <span className="text-primary/70">del ciclo</span>
                                    </div>
                                  )}
                                  {/* Nota obtenida */}
                                  {isGraded && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white">
                                      Nota: {submission.grade}
                                    </div>
                                  )}
                                </div>

                                {/* Info de entrega */}
                                {submission && (
                                  <div className="flex items-center gap-2 pt-1 border-t text-xs text-muted-foreground">
                                    <span>Intento #{submission.attempt_number}</span>
                                    <span>·</span>
                                    <span>{formatDate(submission.submitted_at)}</span>
                                    {submission.original_name && (
                                      <>
                                        <span>·</span>
                                        <span className="truncate max-w-[140px]">📎 {submission.original_name}</span>
                                      </>
                                    )}
                                  </div>
                                )}

                                {/* Acciones */}
                                <div className="flex justify-end gap-2">
                                  {submission && (
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={getSubmissionUrl(submission)} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                                        <Eye className="h-3.5 w-3.5" />
                                        Ver entrega
                                      </a>
                                    </Button>
                                  )}
                                  {!isGraded && (
                                    <Button
                                      size="sm"
                                      variant={submission ? "outline" : "default"}
                                      onClick={() => {
                                        setSubmittingActivity(actividad);
                                        setUploadFile(null);
                                        setUploadComment("");
                                        setUploadError(null);
                                      }}
                                      className="gap-1.5"
                                    >
                                      <Upload className="h-3.5 w-3.5" />
                                      {submission ? "Re-entregar" : "Subir entrega"}
                                    </Button>
                                  )}
                                </div>

                                {/* Comentarios del hilo — solo si hay entrega */}
                                {submission && profileId && (
                                  <div className="pt-3 border-t">
                                    <SubmissionComments
                                      submissionId={submission.id}
                                      profileId={profileId}
                                      authorType="student"
                                      compact
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Dialog subir entrega */}
      <Dialog
        open={!!submittingActivity}
        onOpenChange={(open) => {
          if (!open) {
            setSubmittingActivity(null);
            setUploadFile(null);
            setUploadComment("");
            setUploadError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Subir Entrega
            </DialogTitle>
            {submittingActivity && (
              <p className="text-sm text-muted-foreground pt-1">
                {submittingActivity.title}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="upload-file">Archivo *</Label>
              <label
                htmlFor="upload-file"
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  uploadFile
                    ? "border-green-400 bg-green-50"
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                {uploadFile ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium truncate max-w-[280px]">
                      {uploadFile.name}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Haz clic para seleccionar un archivo
                    </p>
                  </div>
                )}
                <input
                  id="upload-file"
                  type="file"
                  className="sr-only"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="upload-comment">Comentario (opcional)</Label>
              <Textarea
                id="upload-comment"
                placeholder="Agrega una nota para el docente..."
                value={uploadComment}
                onChange={(e) => setUploadComment(e.target.value)}
                rows={3}
              />
            </div>

            {uploadError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {uploadError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubmittingActivity(null)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!uploadFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Entregar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
