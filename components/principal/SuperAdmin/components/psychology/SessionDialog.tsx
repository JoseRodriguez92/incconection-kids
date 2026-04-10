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

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingSession: any;
  sessionForm: {
    session_at: string;
    reason: string;
    assessment: string;
    intervention: string;
    plan: string;
    observations: string;
    modality: string;
    is_internal: boolean;
    professional_id: string;
  };
  setSessionForm: (form: any) => void;
  currentUser: { id: string; name: string } | null;
  onSave: () => void;
}

export function SessionDialog({
  open,
  onOpenChange,
  editingSession,
  sessionForm,
  setSessionForm,
  currentUser,
  onSave,
}: SessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSession ? "Editar Sesión" : "Nueva Sesión"}</DialogTitle>
          <DialogDescription>
            {editingSession ? "Modifica los datos de la sesión" : "Registra una nueva sesión psicológica"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-date">Fecha de la Sesión *</Label>
            <Input
              id="session-date"
              type="date"
              value={sessionForm.session_at}
              onChange={(e) => setSessionForm({ ...sessionForm, session_at: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="modality">Modalidad</Label>
              <Select
                value={sessionForm.modality}
                onValueChange={(value) => setSessionForm({ ...sessionForm, modality: value })}
              >
                <SelectTrigger id="modality">
                  <SelectValue placeholder="Selecciona modalidad" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hibrida">Híbrida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is-internal">Tipo</Label>
              <Select
                value={sessionForm.is_internal ? "true" : "false"}
                onValueChange={(value) => setSessionForm({ ...sessionForm, is_internal: value === "true" })}
              >
                <SelectTrigger id="is-internal"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Interna</SelectItem>
                  <SelectItem value="false">Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional">Profesional que atiende</Label>
              <Input id="professional" value={currentUser?.name || "Cargando..."} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Automáticamente asignado al usuario actual</p>
            </div>
          </div>

          {(["reason", "assessment", "intervention", "plan", "observations"] as const).map((field) => {
            const labels: Record<string, string> = {
              reason: "Motivo",
              assessment: "Evaluación",
              intervention: "Intervención",
              plan: "Plan",
              observations: "Observaciones",
            };
            const placeholders: Record<string, string> = {
              reason: "Describe el motivo de la sesión...",
              assessment: "Evaluación del estudiante...",
              intervention: "Intervención realizada...",
              plan: "Plan de acción...",
              observations: "Observaciones adicionales...",
            };
            return (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{labels[field]}</Label>
                <Textarea
                  id={field}
                  placeholder={placeholders[field]}
                  value={sessionForm[field]}
                  onChange={(e) => setSessionForm({ ...sessionForm, [field]: e.target.value })}
                  rows={2}
                />
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>{editingSession ? "Actualizar" : "Crear"} Sesión</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
