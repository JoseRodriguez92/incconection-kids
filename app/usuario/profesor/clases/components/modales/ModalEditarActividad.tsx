"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Loader2,
  FileText,
  Calendar,
  X,
  Upload,
  File,
  Image,
  Video,
  Music,
  FileArchive,
  FileSpreadsheet,
  Presentation,
  HeartHandshake,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  GroupHasActivityStore,
  type GroupHasActivity,
} from "@/Stores/groupHasActivityStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { Switch } from "@/components/ui/switch";

interface ModalEditarActividadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actividad: GroupHasActivity | null;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Función para convertir fecha ISO a formato datetime-local
const formatDateTimeLocal = (isoDate: string | null) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Función para obtener el icono según el tipo de archivo
const getFileIcon = (mimeType: string, fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Video;
  if (mimeType.startsWith("audio/")) return Music;
  if (ext === "pdf") return FileText;
  if (["doc", "docx"].includes(ext || "")) return FileText;
  if (["xls", "xlsx"].includes(ext || "")) return FileSpreadsheet;
  if (["ppt", "pptx"].includes(ext || "")) return Presentation;
  if (["zip", "rar", "7z"].includes(ext || "")) return FileArchive;

  return File;
};

// Función para formatear el tamaño del archivo
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export function ModalEditarActividad({
  open,
  onOpenChange,
  actividad,
}: ModalEditarActividadProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [limitDate, setLimitDate] = useState<string>("");
  const [isActive, setIsActive] = useState(true || null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [gradePercentage, setGradePercentage] = useState<number | null>(null);
  const [targetConditionId, setTargetConditionId] = useState<string | null>(null);
  const [conditionsCatalog, setConditionsCatalog] = useState<
    Array<{ id: string; name: string; color: string | null }>
  >([]);
  const [activePeriod, setActivePeriod] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [cyclesFromPeriod, setCyclesFromPeriod] = useState<
    Array<{
      id: string;
      name: string;
      description?: string | null;
      is_active: boolean;
    }>
  >([]);

  const { updateActivity } = GroupHasActivityStore();
  const { fetchActivePeriodo } = PeriodAcademicStore();
  const supabase = createClient();

  // Cargar catálogo de condiciones al abrir el modal
  useEffect(() => {
    if (open) {
      supabase
        .from("learning_condition")
        .select("id, name, color")
        .order("name")
        .then(({ data }) => { if (data) setConditionsCatalog(data); });
    }
  }, [open]);

  // Cargar periodo activo y sus ciclos al abrir el modal
  useEffect(() => {
    if (open) {
      fetchActivePeriodo().then(async (period) => {
        if (period) {
          setActivePeriod({
            id: period.id,
            name: period.name,
          });

          // Consultar ciclos del periodo activo desde academic_period_has_cycle
          const { data: cyclesRelation, error: cyclesError } = await supabase
            .from("academic_period_has_cycle")
            .select(
              `
              id,
              cycle_id,
              is_active,
              cycle:cycle_id (
                id,
                name,
                description,
                is_active
              )
            `,
            )
            .eq("academic_period_id", period.id)
            .eq("is_active", true);

          if (cyclesError) {
            console.error("Error al obtener ciclos:", cyclesError);
          } else if (cyclesRelation) {
            const cycles = cyclesRelation
              .map((relation: any) => relation.cycle)
              .filter((cycle: any) => cycle !== null);
            setCyclesFromPeriod(cycles);
          }
        }
      });
    }
  }, [open, fetchActivePeriodo]);

  // Cargar los datos de la actividad cuando se abre el modal
  useEffect(() => {
    if (open && actividad) {
      setTitle(actividad.title);
      setDescription(actividad.description || "");
      setLimitDate(
        actividad.limit_date ? formatDateTimeLocal(actividad.limit_date) : "",
      );
      setIsActive(actividad.is_active ?? false);
      setSelectedCycleId(actividad.cycle_id);
      setGradePercentage(actividad.grade_percentage ?? null);
      setTargetConditionId(actividad.target_condition_id ?? null);
      setNewFile(null);
      setError(null);
    }
  }, [open, actividad]);

  // Limpiar pointer-events del body cuando el modal se cierra
  useEffect(() => {
    if (!open) {
      // Delay de 2 segundos para asegurar que la animación del modal termine
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.removeProperty("pointer-events");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const validateFile = (selectedFile: File): string | null => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      return `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(MAX_FILE_SIZE)}`;
    }

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "xls",
      "xlsx",
      "txt",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "mp4",
      "webm",
      "mp3",
      "wav",
      "zip",
      "rar",
      "7z",
    ];

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return "Formato de archivo no soportado";
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setNewFile(selectedFile);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setNewFile(droppedFile);
      setError(null);
    }
  };

  const removeNewFile = () => {
    setNewFile(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("El título es requerido");
      return;
    }

    if (!selectedCycleId) {
      setError("Debes seleccionar un ciclo académico");
      return;
    }

    if (!actividad) {
      setError("No hay actividad seleccionada");
      return;
    }

    setUpdating(true);

    try {
      let updatedData: Partial<GroupHasActivity> = {
        title: title.trim(),
        description: description.trim() || null,
        cycle_id: selectedCycleId,
        limit_date: limitDate ? new Date(limitDate).toISOString() : null,
        is_active: isActive,
        grade_percentage: gradePercentage,
        target_condition_id: targetConditionId,
        updated_at: new Date().toISOString(),
      };

      // Si hay un nuevo archivo, subirlo y actualizar la información
      if (newFile) {
        const fileExt = newFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `activities/${actividad.group_has_class_id}/${fileName}`;

        // Subir el nuevo archivo
        const { error: uploadError } = await supabase.storage
          .from("course-activity")
          .upload(filePath, newFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Error al subir archivo: ${uploadError.message}`);
        }

        // Eliminar el archivo anterior si existe
        if (actividad.storage_path) {
          await supabase.storage
            .from("course-activity")
            .remove([actividad.storage_path]);
        }

        // Actualizar la información del archivo
        updatedData = {
          ...updatedData,
          storage_path: filePath,
          original_name: newFile.name,
          mime_type: newFile.type || null,
          file_size: newFile.size,
        };
      }

      await updateActivity(actividad.id, updatedData);

      // Cerrar modal
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error al actualizar actividad:", err);
      setError(err.message || "Error al actualizar la actividad");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setNewFile(null);
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !updating) {
      // Resetear el estado cuando se cierra el modal
      setNewFile(null);
      setError(null);
      setIsDragging(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (updating) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (updating) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Editar Actividad
          </DialogTitle>
          <DialogDescription>
            Modifica la información de la actividad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del archivo actual */}
          {actividad && (
            <div className="space-y-2">
              <Label>Archivo actual</Label>
              <div className="p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {(() => {
                    const FileIcon = getFileIcon(
                      actividad.mime_type || "",
                      actividad.original_name || "",
                    );
                    return (
                      <div className="flex-shrink-0 p-2 rounded-lg bg-background">
                        <FileIcon className="h-5 w-5 text-primary" />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {actividad.original_name || "Sin nombre"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {actividad.mime_type || "Tipo desconocido"} •{" "}
                      {actividad.file_size
                        ? formatFileSize(actividad.file_size)
                        : "Tamaño desconocido"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cambiar archivo */}
          <div className="space-y-2">
            <Label>Cambiar archivo (opcional)</Label>
            {!newFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
                  ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[0.98]"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
                  }
                  ${updating ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={updating}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mp3,.wav,.zip,.rar,.7z"
                />
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <div
                    className={`
                    p-2 rounded-full transition-all duration-200
                    ${isDragging ? "bg-primary/20 scale-110" : "bg-primary/10"}
                  `}
                  >
                    <Upload
                      className={`h-6 w-6 transition-colors ${
                        isDragging ? "text-primary" : "text-primary/70"
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">
                      {isDragging
                        ? "¡Suelta el archivo aquí!"
                        : "Arrastra un nuevo archivo o haz clic"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tamaño máximo: {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="group relative flex items-center justify-between p-3 border-2 border-primary/20 rounded-lg bg-primary/5 transition-all hover:border-primary/40">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {(() => {
                    const FileIcon = getFileIcon(newFile.type, newFile.name);
                    return (
                      <div className="flex-shrink-0 p-2 rounded-lg bg-background">
                        <FileIcon className="h-5 w-5 text-primary" />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      title={newFile.name}
                    >
                      {newFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(newFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={removeNewFile}
                  disabled={updating}
                  className="flex-shrink-0 h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Si no seleccionas un nuevo archivo, se mantendrá el archivo actual
            </p>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título de la actividad *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Ej: Tarea 1 - Introducción a la programación"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={updating}
              required
            />
          </div>

          {/* Periodo Académico (solo lectura) */}
          <div className="space-y-2">
            <Label>Periodo Académico *</Label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-md border bg-muted/50">
              {activePeriod ? (
                <>
                  <span className="text-sm font-medium flex-1">
                    {activePeriod.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Periodo Activo
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No hay periodo académico activo
                </span>
              )}
            </div>
          </div>

          {/* Ciclo Académico */}
          <div className="space-y-2">
            <Label htmlFor="ciclo">Ciclo Académico *</Label>
            <Select
              value={selectedCycleId}
              onValueChange={setSelectedCycleId}
              disabled={updating || !activePeriod}
            >
              <SelectTrigger id="ciclo">
                <SelectValue placeholder="Selecciona un ciclo académico" />
              </SelectTrigger>
              <SelectContent>
                {!activePeriod ? (
                  <div className="py-2 px-2 text-sm text-muted-foreground">
                    No hay periodo académico activo
                  </div>
                ) : cyclesFromPeriod.length === 0 ? (
                  <div className="py-2 px-2 text-sm text-muted-foreground">
                    No hay ciclos disponibles para este periodo
                  </div>
                ) : (
                  cyclesFromPeriod.map((ciclo) => (
                    <SelectItem key={ciclo.id} value={ciclo.id}>
                      {ciclo.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción de la actividad, objetivos, instrucciones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={updating}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Porcentaje del ciclo */}
          <div className="space-y-2">
            <Label htmlFor="gradePercentage">
              Peso de la actividad en el ciclo (%)
            </Label>
            <Input
              id="gradePercentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Ej: 25"
              value={gradePercentage ?? ""}
              onChange={(e) =>
                setGradePercentage(
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              disabled={updating}
            />
            <p className="text-xs text-muted-foreground">
              Define qué porcentaje del ciclo representa esta actividad (0-100).
              Dejar vacío si no aplica.
            </p>
          </div>

          {/* Fecha límite */}
          <div className="space-y-2">
            <Label htmlFor="limitDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Fecha límite de entrega (opcional)
            </Label>
            <div className="relative">
              <Input
                id="limitDate"
                type="datetime-local"
                value={limitDate}
                onChange={(e) => setLimitDate(e.target.value)}
                disabled={updating}
                className="cursor-pointer pr-10"
              />
              {limitDate && !updating && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setLimitDate("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                  title="Quitar fecha límite"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {limitDate
                ? "Haz clic en la X para quitar la fecha límite"
                : "Si no se establece, la actividad no tendrá fecha límite"}
            </p>
          </div>

          {/* Condición de aprendizaje objetivo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-violet-500" />
              Condición de aprendizaje objetivo
            </Label>
            <Select
              value={targetConditionId ?? "none"}
              onValueChange={(v) => setTargetConditionId(v === "none" ? null : v)}
              disabled={updating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una condición..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">— Ninguna (para todos)</span>
                </SelectItem>
                {conditionsCatalog.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.color ?? "#7c3aed" }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Si seleccionas una condición, esta actividad estará dirigida específicamente a esos estudiantes.
            </p>
          </div>

          {/* Estado activo/inactivo */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Actividad activa</Label>
              <p className="text-xs text-muted-foreground">
                Las actividades inactivas no serán visibles para los estudiantes
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={updating}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
