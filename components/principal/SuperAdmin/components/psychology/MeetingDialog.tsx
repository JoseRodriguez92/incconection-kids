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

interface MeetingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingMeeting: any;
  meetingForm: {
    meeting_at: string;
    attendees: string;
    notes: string;
    agreements: string;
    url_link: string;
  };
  setMeetingForm: (form: any) => void;
  onSave: () => void;
}

export function MeetingDialog({
  open,
  onOpenChange,
  editingMeeting,
  meetingForm,
  setMeetingForm,
  onSave,
}: MeetingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingMeeting ? "Editar Reunión con Padres" : "Nueva Reunión con Padres"}</DialogTitle>
          <DialogDescription>
            {editingMeeting
              ? "Modifica los datos de la reunión"
              : "Registra una nueva reunión con los padres del estudiante"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meeting-date">Fecha de la Reunión *</Label>
            <Input
              id="meeting-date"
              type="date"
              value={meetingForm.meeting_at}
              onChange={(e) => setMeetingForm({ ...meetingForm, meeting_at: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-attendees">Asistentes</Label>
            <Input
              id="meeting-attendees"
              placeholder="Nombres de los asistentes..."
              value={meetingForm.attendees}
              onChange={(e) => setMeetingForm({ ...meetingForm, attendees: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-url">Enlace de Reunión Virtual</Label>
            <Input
              id="meeting-url"
              type="url"
              placeholder="https://meet.google.com/xxx o https://zoom.us/j/xxx"
              value={meetingForm.url_link}
              onChange={(e) => setMeetingForm({ ...meetingForm, url_link: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Si la reunión es virtual, agrega el enlace aquí</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-notes">Notas de la Reunión</Label>
            <Textarea
              id="meeting-notes"
              placeholder="Temas discutidos, observaciones..."
              value={meetingForm.notes}
              onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-agreements">Acuerdos</Label>
            <Textarea
              id="meeting-agreements"
              placeholder="Acuerdos alcanzados durante la reunión..."
              value={meetingForm.agreements}
              onChange={(e) => setMeetingForm({ ...meetingForm, agreements: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>{editingMeeting ? "Actualizar" : "Crear"} Reunión</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
