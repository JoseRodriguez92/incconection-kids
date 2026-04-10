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
  Upload,
  FileText,
  Loader2,
  X,
  Image,
  Video,
  Music,
  FileArchive,
  File,
  HeartHandshake,
} from "lucide-react";
import { GroupHasMaterialStore } from "@/Stores/groupHasMaterialStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { createClient } from "@/lib/supabase/client";

interface ModalAgregarMaterialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupHasClassId: string;
  cycleId?: string;
}

export function ModalAgregarMaterial({
  open,
  onOpenChange,
  groupHasClassId,
  cycleId,
}: ModalAgregarMaterialProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetConditionId, setTargetConditionId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cicloAcademicoId, setCicloAcademicoId] = useState(cycleId || "");
  const [isDragging, setIsDragging] = useState(false);
  const [conditionsCatalog, setConditionsCatalog] = useState<
    Array<{ id: string; name: string; color: string | null }>
  >([]);
  const [activePeriod, setActivePeriod] = useState<{ id: string; name: string } | null>(null);
  const [cyclesFromPeriod, setCyclesFromPeriod] = useState<
    Array<{ id: string; name: string; description?: string | null; is_active: boolean }>
  >([]);

  const { addMaterial } = GroupHasMaterialStore();
  const { fetchActivePeriodo } = PeriodAcademicStore();
  const supabase = createClient();

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.removeProperty("pointer-events");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const client = createClient();
    client
      .from("learning_condition")
      .select("id, name, color")
      .order("name")
      .then(({ data }) => { if (data) setConditionsCatalog(data); });
  }, []);

  useEffect(() => {
    if (open) {
      fetchActivePeriodo().then(async (period) => {
        if (period) {
          setActivePeriod({ id: period.id, name: period.name });
          const { data: cyclesRelation } = await supabase
            .from("academic_period_has_cycle")
            .select(`id, cycle_id, is_active, cycle:cycle_id (id, name, description, is_active)`)
            .eq("academic_period_id", period.id)
            .eq("is_active", true);

          if (cyclesRelation) {
            const cycles = cyclesRelation
              .map((r: any) => r.cycle)
              .filter((c: any) => c !== null);
            setCyclesFromPeriod(cycles);
          }
        }
      });
    }
  }, [open, fetchActivePeriodo]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith("video/")) return <Video className="h-5 w-5 text-purple-500" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-5 w-5 text-green-500" />;
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("compressed"))
      return <FileArchive className="h-5 w-5 text-orange-500" />;
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes("word") || mimeType.includes("document") || mimeType.includes("presentation") || mimeType.includes("spreadsheet"))
      return <FileText className="h-5 w-5 text-blue-600" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("El título es requerido"); return; }
    if (!activePeriod) { setError("No hay un periodo académico activo"); return; }
    if (!cicloAcademicoId) { setError("Debes seleccionar un ciclo académico"); return; }
    if (!file) { setError("Debes seleccionar un archivo"); return; }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `materials/${groupHasClassId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw new Error(`Error al subir archivo: ${uploadError.message}`);

      await addMaterial({
        id: crypto.randomUUID(),
        group_has_class_id: groupHasClassId,
        cycle_id: cicloAcademicoId,
        title: title.trim(),
        description: description.trim() || null,
        target_condition_id: targetConditionId || null,
        bucket: "course-materials",
        storage_path: filePath,
        original_name: file.name,
        mime_type: file.type || null,
        file_size: file.size,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setTitle(""); setDescription(""); setTargetConditionId(null);
      setFile(null); setCicloAcademicoId(""); setError(null);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Error al agregar el material");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setTitle(""); setDescription(""); setTargetConditionId(null);
    setFile(null); setCicloAcademicoId(""); setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4 text-primary" />
            Agregar Material
          </DialogTitle>
          <DialogDescription className="text-xs">
            Sube documentos, videos o recursos para tus estudiantes
          </DialogDescription>
        </DialogHeader>

        {/* Periodo activo — barra compacta */}
        {activePeriod && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-xs">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            <span className="font-medium text-green-700 dark:text-green-400">{activePeriod.name}</span>
            <span className="text-green-600/70 dark:text-green-500/70">— Periodo activo</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Fila: Título + Ciclo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">Título *</Label>
              <Input
                id="title"
                placeholder="Guía de estudio..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ciclo" className="text-xs">Ciclo *</Label>
              <Select value={cicloAcademicoId} onValueChange={setCicloAcademicoId} disabled={uploading || !activePeriod}>
                <SelectTrigger id="ciclo" className="h-8 text-sm">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {cyclesFromPeriod.length === 0 ? (
                    <div className="py-2 px-2 text-xs text-muted-foreground">Sin ciclos disponibles</div>
                  ) : (
                    cyclesFromPeriod.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">Descripción <span className="text-muted-foreground">(opcional)</span></Label>
            <Textarea
              id="description"
              placeholder="Breve descripción del material..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Condición de aprendizaje */}
          <div className="space-y-1.5">
            <Label htmlFor="condition" className="text-xs flex items-center gap-1">
              <HeartHandshake className="h-3.5 w-3.5 text-violet-500" />
              Condición de aprendizaje <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select
              value={targetConditionId ?? "none"}
              onValueChange={(v) => setTargetConditionId(v === "none" ? null : v)}
              disabled={uploading}
            >
              <SelectTrigger id="condition" className="h-8 text-sm">
                <SelectValue placeholder="Sin condición (general)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin condición (general)</SelectItem>
                {conditionsCatalog.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Archivo */}
          <div className="space-y-1.5">
            <Label className="text-xs">Archivo *</Label>
            {!file ? (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                } ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                />
                <div className="flex items-center gap-3 pointer-events-none">
                  <div className={`p-2 rounded-lg ${isDragging ? "bg-primary/20" : "bg-muted/60"}`}>
                    <Upload className={`h-5 w-5 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDragging ? "text-primary" : "text-foreground"}`}>
                      {isDragging ? "Suelta el archivo aquí" : "Arrastra o haz clic para seleccionar"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, Word, Excel, imágenes, videos...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2.5 border-2 border-primary/20 rounded-lg bg-primary/5">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => setFile(null)} disabled={uploading} className="h-7 w-7 p-0 hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={uploading}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={uploading}>
              {uploading ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Subiendo...</>
              ) : (
                <><Upload className="h-3.5 w-3.5 mr-1.5" />Agregar Material</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
