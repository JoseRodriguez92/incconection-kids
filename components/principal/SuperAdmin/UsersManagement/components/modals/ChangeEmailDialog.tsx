"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail } from "lucide-react";
import { updateUserEmail } from "@/app/actions/update-user-email";
import { toast } from "sonner";

interface EmailChangeUser {
  id: string;
  email: string;
  name: string;
}

interface ChangeEmailDialogProps {
  user: EmailChangeUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangeEmailDialog({ user, onClose, onSuccess }: ChangeEmailDialogProps) {
  const [newEmail, setNewEmail] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const handleClose = () => {
    setNewEmail("");
    onClose();
  };

  const handleConfirm = async () => {
    if (!user || !newEmail.trim()) return;
    const trimmed = newEmail.trim().toLowerCase();
    if (trimmed === user.email.toLowerCase()) return;

    setIsChanging(true);
    try {
      const result = await updateUserEmail(user.id, trimmed);
      if (!result.success) throw new Error(result.error);
      toast.success("Correo actualizado correctamente");
      setNewEmail("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cambiar el correo";
      toast.error(msg);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Cambiar correo electrónico
          </DialogTitle>
          <DialogDescription>
            Actualizando correo de{" "}
            <span className="font-medium text-foreground">{user?.name}</span>. El cambio se
            aplica de inmediato.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Correo actual</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-email">Nuevo correo</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="nuevo@correo.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            />
          </div>
        </div>

        <Separator className="mt-4" />

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !newEmail.trim() ||
              isChanging ||
              newEmail.trim().toLowerCase() === user?.email.toLowerCase()
            }
          >
            {isChanging ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            {isChanging ? "Actualizando..." : "Actualizar correo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
