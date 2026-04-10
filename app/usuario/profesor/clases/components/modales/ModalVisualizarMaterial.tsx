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
import { Download, FileText, Loader2, AlertCircle } from "lucide-react";
import type { GroupHasMaterial } from "@/Stores/groupHasMaterialStore";
import { createClient } from "@/lib/supabase/client";

interface ModalVisualizarMaterialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: GroupHasMaterial | null;
}

export function ModalVisualizarMaterial({
  open,
  onOpenChange,
  material,
}: ModalVisualizarMaterialProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Limpiar pointer-events del body cuando el modal se cierra
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
    if (open && material) {
      obtenerUrlArchivo();
    } else {
      // Limpiar cuando se cierra el modal
      setFileUrl(null);
      setError(null);
    }
  }, [open, material]);

  const obtenerUrlArchivo = async () => {
    if (!material) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener URL pública del archivo desde Supabase Storage
      const { data } = supabase.storage
        .from(material.bucket)
        .getPublicUrl(material.storage_path);

      if (data.publicUrl) {
        setFileUrl(data.publicUrl);
      } else {
        setError("No se pudo obtener la URL del archivo");
      }
    } catch (err) {
      console.error("Error al obtener URL del archivo:", err);
      setError("Error al cargar el archivo");
    } finally {
      setLoading(false);
    }
  };

  const descargarArchivo = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const renderizarContenido = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando archivo...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" onClick={obtenerUrlArchivo}>
            Reintentar
          </Button>
        </div>
      );
    }

    if (!fileUrl || !material) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No se pudo cargar el archivo</p>
        </div>
      );
    }

    const mimeType = material.mime_type?.toLowerCase() || "";

    // PDF
    if (mimeType.includes("pdf")) {
      return (
        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <iframe
            src={fileUrl}
            className="w-full h-full"
            title={material.title}
          />
        </div>
      );
    }

    // Imágenes
    if (mimeType.includes("image")) {
      return (
        <div className="w-full flex justify-center items-center bg-muted/30 rounded-lg p-4">
          <img
            src={fileUrl}
            alt={material.title}
            className="max-w-full max-h-[600px] object-contain rounded-lg"
          />
        </div>
      );
    }

    // Videos
    if (mimeType.includes("video")) {
      return (
        <div className="w-full rounded-lg overflow-hidden">
          <video
            src={fileUrl}
            controls
            className="w-full max-h-[600px]"
            controlsList="nodownload"
          >
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      );
    }

    // Audio
    if (mimeType.includes("audio")) {
      return (
        <div className="w-full py-12">
          <audio src={fileUrl} controls className="w-full">
            Tu navegador no soporta la reproducción de audio.
          </audio>
        </div>
      );
    }

    // Documentos de Office (Word, Excel, PowerPoint)
    if (
      mimeType.includes("wordprocessingml") || // .docx
      mimeType.includes("spreadsheetml") || // .xlsx
      mimeType.includes("presentationml") || // .pptx
      mimeType.includes("msword") || // .doc
      mimeType.includes("ms-excel") || // .xls
      mimeType.includes("ms-powerpoint") // .ppt
    ) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      return (
        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <iframe
            src={viewerUrl}
            className="w-full h-full"
            title={material.title}
          />
        </div>
      );
    }

    // Documentos de texto y otros formatos
    if (
      mimeType.includes("text") ||
      mimeType.includes("json") ||
      mimeType.includes("xml")
    ) {
      return (
        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <iframe
            src={fileUrl}
            className="w-full h-full"
            title={material.title}
          />
        </div>
      );
    }

    // Para otros tipos de archivos, mostrar información y botón de descarga
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <p className="font-medium">
            Este tipo de archivo no se puede previsualizar en línea
          </p>
          <p className="text-sm text-muted-foreground">
            Tipo: {material.mime_type || "Desconocido"}
          </p>
        </div>
        <Button onClick={descargarArchivo} className="mt-4">
          <Download className="h-4 w-4 mr-2" />
          Descargar Archivo
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material?.title || "Visualizar Material"}</DialogTitle>
          <DialogDescription>
            {material?.original_name && (
              <span className="block text-sm">
                Archivo: {material.original_name}
              </span>
            )}
            {material?.mime_type && (
              <span className="block text-xs text-muted-foreground">
                Tipo: {material.mime_type}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {renderizarContenido()}

          {/* Botones de acción */}
          {fileUrl && !loading && !error && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={descargarArchivo}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
