"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteTarget {
  id: string;
  name: string;
  email: string;
}

interface DeleteUserDialogProps {
  target: DeleteTarget | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteUserDialog({
  target,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteUserDialogProps) {
  return (
    <Dialog
      open={!!target}
      onOpenChange={(o) => {
        if (!o && !isDeleting) onCancel();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Eliminar usuario
          </DialogTitle>
          <DialogDescription className="pt-1">
            Esta acción es <strong>irreversible</strong>. Se eliminarán todos los datos del
            usuario del sistema.
          </DialogDescription>
        </DialogHeader>

        {target && (
          <div className="rounded-xl border bg-muted/40 p-3 space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Nombre:</span>{" "}
              <strong>{target.name}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {target.email}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Se eliminarán: sus <strong>roles</strong> en <code>profiles_roles</code>, su{" "}
          <strong>perfil</strong> en <code>profiles</code> y su <strong>cuenta</strong> en
          Base de datos.
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
