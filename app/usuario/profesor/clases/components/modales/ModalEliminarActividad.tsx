"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Loader2, AlertTriangle, FileText } from "lucide-react";
import {
  GroupHasActivityStore,
  type GroupHasActivity,
} from "@/Stores/groupHasActivityStore";
import { createClient } from "@/lib/supabase/client";

interface ModalEliminarActividadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actividad: GroupHasActivity | null;
}

export function ModalEliminarActividad({
  open,
  onOpenChange,
  actividad,
}: ModalEliminarActividadProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deleteActivity } = GroupHasActivityStore();
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

  const handleDelete = async () => {
    if (!actividad) {
      setError("No hay actividad seleccionada");
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      // Eliminar el archivo del storage
      const { error: storageError } = await supabase.storage
        .from(actividad.bucket)
        .remove([actividad.storage_path]);

      if (storageError) {
        console.warn("Error al eliminar archivo del storage:", storageError);
        // Continuar con la eliminación del registro aunque falle el storage
      }

      // Eliminar el registro de la base de datos
      await deleteActivity(actividad.id);

      // Cerrar modal
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error al eliminar actividad:", err);
      setError(err.message || "Error al eliminar la actividad");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Actividad
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La actividad y el archivo asociado
            serán eliminados permanentemente.
          </DialogDescription>
        </DialogHeader>

        {actividad && (
          <div className="space-y-4">
            {/* Información de la actividad a eliminar */}
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-sm">{actividad.title}</p>
                  {actividad.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {actividad.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {actividad.original_name || "Sin nombre"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {actividad.mime_type || "Tipo desconocido"} •{" "}
                    {actividad.file_size
                      ? `${(actividad.file_size / 1024).toFixed(2)} KB`
                      : "Tamaño desconocido"}
                  </p>
                </div>
              </div>
            </div>

            {/* Advertencia */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                Los estudiantes ya no podrán acceder a esta actividad. Todas las
                entregas y calificaciones asociadas podrían verse afectadas. Esta
                acción es permanente y no se puede revertir.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Actividad
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
