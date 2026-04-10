"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Loader2 } from "lucide-react";

// ── Upload Dialog ──────────────────────────────────────────────────────────────

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fileForm: { title: string; academic_period_has_cycle_id: string };
  setFileForm: (form: any) => void;
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingFile: boolean;
  onUpload: () => void;
  academicCycles: any[];
  loadingCycles: boolean;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  fileForm,
  setFileForm,
  selectedFile,
  onFileChange,
  uploadingFile,
  onUpload,
  academicCycles,
  loadingCycles,
}: FileUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subir Archivo</DialogTitle>
          <DialogDescription>Sube un archivo relacionado con este caso psicológico</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-title">Título del Archivo (Opcional)</Label>
            <Input
              id="file-title"
              placeholder="Ej: Evaluación inicial, Informe médico..."
              value={fileForm.title}
              onChange={(e) => setFileForm({ ...fileForm, title: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Si no ingresas un título, se usará el nombre del archivo</p>
          </div>

          {/* Periodo / Ciclo */}
          <div className="space-y-2">
            <Label htmlFor="cycle-select">Periodo · Ciclo</Label>
            {loadingCycles ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />Cargando ciclos...
              </div>
            ) : (
              <Select
                value={fileForm.academic_period_has_cycle_id}
                onValueChange={(v) =>
                  setFileForm({ ...fileForm, academic_period_has_cycle_id: v === "__none__" ? "" : v })
                }
              >
                <SelectTrigger id="cycle-select">
                  <SelectValue placeholder="Sin clasificar (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin clasificar</SelectItem>
                  {academicCycles.map((ac: any) => (
                    <SelectItem key={ac.id} value={ac.id}>
                      {ac.academic_period?.name ?? "—"} · {ac.cycle?.name ?? "—"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              Asocia el archivo a un periodo y ciclo académico para facilitar la organización
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Seleccionar Archivo *</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={onFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </p>
            )}
            <p className="text-xs text-muted-foreground">Formatos permitidos: PDF, Word, Imágenes, TXT</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploadingFile}>Cancelar</Button>
          <Button onClick={onUpload} disabled={uploadingFile}>
            {uploadingFile ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Subiendo...</>
            ) : (
              "Subir Archivo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Preview Dialog ─────────────────────────────────────────────────────────────

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  previewFile: any;
  previewUrl: string;
  onDownload: (file: any) => void;
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  previewFile,
  previewUrl,
  onDownload,
}: FilePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{previewFile?.title || previewFile?.original_name || "Vista Previa"}</DialogTitle>
          <DialogDescription>
            {previewFile?.mime_type} • {previewFile?.file_size ? (previewFile.file_size / 1024).toFixed(0) : 0} KB
          </DialogDescription>
        </DialogHeader>

        <div className="w-full h-[70vh] overflow-auto">
          {previewFile?.mime_type?.startsWith("image/") ? (
            <div className="flex items-center justify-center h-full bg-muted/10 rounded">
              <img
                src={previewUrl}
                alt={previewFile?.original_name || "Preview"}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : previewFile?.mime_type === "application/pdf" ? (
            <iframe src={previewUrl} className="w-full h-full border-0 rounded" title="PDF Preview" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Vista previa no disponible</p>
              <p className="text-sm text-muted-foreground mb-4">Este tipo de archivo no se puede previsualizar en el navegador</p>
              <Button onClick={() => onDownload(previewFile)}>Descargar Archivo</Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button onClick={() => onDownload(previewFile)}>Descargar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
