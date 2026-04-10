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
  Image,
  Video,
  Music,
  FileArchive,
  File,
  Upload,
  X,
  HeartHandshake,
} from "lucide-react";
import {
  GroupHasMaterialStore,
  type GroupHasMaterial,
} from "@/Stores/groupHasMaterialStore";
import { Switch } from "@/components/ui/switch";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { CycleStore } from "@/Stores/cycleStore";
import { createClient } from "@/lib/supabase/client";

interface ModalEditarMaterialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: GroupHasMaterial | null;
}

export function ModalEditarMaterial({
  open,
  onOpenChange,
  material,
}: ModalEditarMaterialProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetConditionId, setTargetConditionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [conditionsCatalog, setConditionsCatalog] = useState<
    Array<{ id: string; name: string; color: string | null }>
  >([]);

  const { updateMaterial } = GroupHasMaterialStore();
  const { periodos, fetchPeriodos } = PeriodAcademicStore();
  const { cycles, fetchCycles } = CycleStore();
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

  const getFileIcon = (mimeType: string, size = "h-5 w-5") => {
    if (mimeType.startsWith("image/")) return <Image className={`${size} text-blue-500`} />;
    if (mimeType.startsWith("video/")) return <Video className={`${size} text-purple-500`} />;
    if (mimeType.startsWith("audio/")) return <Music className={`${size} text-green-500`} />;
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("compressed"))
      return <FileArchive className={`${size} text-orange-500`} />;
    if (mimeType.includes("pdf")) return <FileText className={`${size} text-red-500`} />;
    if (mimeType.includes("word") || mimeType.includes("document") || mimeType.includes("presentation") || mimeType.includes("spreadsheet"))
      return <FileText className={`${size} text-blue-600`} />;
    return <File className={`${size} text-gray-500`} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCycloName = () => {
    if (!material?.cycle_id) return "No especificado";
    const ciclo = cycles.find((c) => c.id === material.cycle_id);
    return ciclo?.name || "Ciclo no encontrado";
  };

  useEffect(() => {
    supabase
      .from("learning_condition")
      .select("id, name, color")
      .order("name")
      .then(({ data }) => { if (data) setConditionsCatalog(data); });
  }, []);

  useEffect(() => {
    if (open) { fetchPeriodos(); fetchCycles(); }
  }, [open, fetchPeriodos, fetchCycles]);

  useEffect(() => {
    if (open && material) {
      setTitle(material.title);
      setDescription(material.description ?? "");
      setTargetConditionId(material.target_condition_id ?? null);
      setIsActive(material.is_active);
      setNewFile(null);
      setError(null);
    }
  }, [open, material]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setNewFile(f);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setNewFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("El título es requerido"); return; }
    if (!material) { setError("No hay material seleccionado"); return; }

    setUpdating(true);
    try {
      let updateData: any = {
        title: title.trim(),
        description: description.trim() || null,
        target_condition_id: targetConditionId || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (newFile) {
        const fileExt = newFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `materials/${material.group_has_class_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("course-materials")
          .upload(filePath, newFile, { upsert: true });

        if (uploadError) throw new Error(`Error al subir archivo: ${uploadError.message}`);

        if (material.storage_path) {
          await supabase.storage.from("course-materials").remove([material.storage_path]);
        }

        updateData = {
          ...updateData,
          storage_path: filePath,
          original_name: newFile.name,
          mime_type: newFile.type || null,
          file_size: newFile.size,
        };
      }

      await updateMaterial(material.id, updateData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Error al actualizar el material");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => { setError(null); setNewFile(null); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Edit className="h-4 w-4 text-primary" />
            Editar Material
          </DialogTitle>
          <DialogDescription className="text-xs">
            Modifica la información o reemplaza el archivo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Archivo actual — fila compacta */}
          {material && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 border">
              {getFileIcon(material.mime_type || "")}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{material.original_name || "Sin nombre"}</p>
                <p className="text-[11px] text-muted-foreground">
                  {material.file_size ? formatFileSize(material.file_size) : "—"} · {material.mime_type || "Tipo desconocido"}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 px-1.5 py-0.5 bg-muted rounded">
                {getCycloName()}
              </span>
            </div>
          )}

          {/* Nuevo archivo (opcional) */}
          {!newFile ? (
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-3 transition-all duration-200 ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
              } ${updating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={updating}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
              />
              <div className="flex items-center gap-2.5 pointer-events-none">
                <Upload className={`h-4 w-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-xs ${isDragging ? "text-primary" : "text-muted-foreground"}`}>
                  {isDragging ? "Suelta para reemplazar" : "Reemplazar archivo (opcional) — arrastra o haz clic"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 border-2 border-primary/20 rounded-lg bg-primary/5">
              {getFileIcon(newFile.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{newFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(newFile.size)} · Listo para reemplazar</p>
              </div>
              <Button type="button" size="sm" variant="ghost" onClick={() => setNewFile(null)} disabled={updating} className="h-7 w-7 p-0 hover:text-destructive">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Fila: Título + Ciclo (read-only) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">Título *</Label>
              <Input
                id="title"
                placeholder="Guía de estudio..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={updating}
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ciclo</Label>
              <div className="h-8 px-3 flex items-center rounded-md border bg-muted/30 text-sm text-muted-foreground">
                {getCycloName()}
              </div>
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
              disabled={updating}
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Fila: Condición + Estado activo */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="condition" className="text-xs flex items-center gap-1">
                <HeartHandshake className="h-3.5 w-3.5 text-violet-500" />
                Condición <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Select
                value={targetConditionId ?? "none"}
                onValueChange={(v) => setTargetConditionId(v === "none" ? null : v)}
                disabled={updating}
              >
                <SelectTrigger id="condition" className="h-8 text-sm">
                  <SelectValue placeholder="General" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin condición (general)</SelectItem>
                  {conditionsCatalog.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between px-3 py-2 border rounded-lg h-8 bg-muted/20">
              <Label htmlFor="is_active" className="text-xs cursor-pointer">Activo</Label>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={updating}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={updating}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={updating}>
              {updating ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{newFile ? "Subiendo..." : "Guardando..."}</>
              ) : (
                <><Edit className="h-3.5 w-3.5 mr-1.5" />{newFile ? "Guardar y Reemplazar" : "Guardar Cambios"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
