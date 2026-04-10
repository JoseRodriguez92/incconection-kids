"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface FollowupDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingFollowup: any;
  followupForm: {
    action: string;
    status: string;
    due_at: string;
    responsible: string;
    completion_notes: string;
  };
  setFollowupForm: (form: any) => void;
  onSave: () => void;
}

export function FollowupDialog({
  open,
  onOpenChange,
  editingFollowup,
  followupForm,
  setFollowupForm,
  onSave,
}: FollowupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingFollowup ? "Editar Seguimiento" : "Nuevo Seguimiento"}</DialogTitle>
          <DialogDescription>
            {editingFollowup ? "Modifica los datos del seguimiento" : "Registra un nuevo seguimiento para el caso"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="followup-action">Acción *</Label>
            <Textarea
              id="followup-action"
              placeholder="Describe la acción de seguimiento..."
              value={followupForm.action}
              onChange={(e) => setFollowupForm({ ...followupForm, action: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followup-status">Estado</Label>
              <Select
                value={followupForm.status}
                onValueChange={(value) => setFollowupForm({ ...followupForm, status: value })}
              >
                <SelectTrigger id="followup-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-due">Fecha de Vencimiento</Label>
              <Input
                id="followup-due"
                type="date"
                value={followupForm.due_at}
                onChange={(e) => setFollowupForm({ ...followupForm, due_at: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup-responsible">Responsable</Label>
            <Input
              id="followup-responsible"
              placeholder="Nombre del responsable del seguimiento"
              value={followupForm.responsible}
              onChange={(e) => setFollowupForm({ ...followupForm, responsible: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup-notes">Notas de Completación</Label>
            <Textarea
              id="followup-notes"
              placeholder="Notas adicionales sobre el seguimiento..."
              value={followupForm.completion_notes}
              onChange={(e) => setFollowupForm({ ...followupForm, completion_notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>{editingFollowup ? "Actualizar" : "Crear"} Seguimiento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
