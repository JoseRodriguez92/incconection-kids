"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GroupHasStudentsStore } from "@/Stores/groupHasStudentsStore";
import { EstudenteEnrrolledStore } from "@/Stores/studentEnrolledStore";
import { ProfilesStore } from "@/Stores/profilesStore";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface LinkStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: any;
  selectedStudentId: string;
  onStudentIdChange: (id: string) => void;
}

export function LinkStudentModal({
  open,
  onOpenChange,
  group,
  selectedStudentId,
  onStudentIdChange,
}: LinkStudentModalProps) {
  const { groupHasStudents, addGroupHasStudent, loading } =
    GroupHasStudentsStore();
  const { enrolled: studentEnrolled } = EstudenteEnrrolledStore();
  const { profiles } = ProfilesStore();

  // Estudiantes ya asignados a CUALQUIER grupo
  const enrolledInAnyGroup = new Set(
    groupHasStudents.map((ghs) => ghs.student_enrolled_id),
  );

  const availableStudents = studentEnrolled.filter(
    (enrolled) => enrolled.is_active && !enrolledInAnyGroup.has(enrolled.id),
  );

  const alreadyInOtherGroup = studentEnrolled.filter(
    (enrolled) =>
      enrolled.is_active &&
      enrolledInAnyGroup.has(enrolled.id) &&
      !groupHasStudents.some(
        (ghs) => ghs.group_id === group?.id && ghs.student_enrolled_id === enrolled.id,
      ),
  );

  const handleLink = async () => {
    if (!selectedStudentId) {
      toast.error("Por favor selecciona un estudiante.");
      return;
    }
    if (!group) {
      toast.error("No hay grupo seleccionado.");
      return;
    }
    // Doble verificación: no debe estar ya en ningún grupo
    if (enrolledInAnyGroup.has(selectedStudentId)) {
      toast.error("Este estudiante ya está asignado a otro grupo.");
      return;
    }
    try {
      await addGroupHasStudent({
        id: crypto.randomUUID(),
        group_id: group.id,
        student_enrolled_id: selectedStudentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      toast.success("Estudiante vinculado al grupo correctamente.");
      onStudentIdChange("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error al vincular estudiante:", error);
      toast.error("Hubo un error al vincular el estudiante.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular Estudiante al Grupo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Seleccionar Estudiante</Label>
            <Select value={selectedStudentId} onValueChange={onStudentIdChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estudiante" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No hay estudiantes disponibles para vincular
                  </div>
                ) : (
                  availableStudents.map((enrolled) => {
                    const profile = profiles.find(
                      (p) => p.id === enrolled.user_id,
                    );
                    return (
                      <SelectItem key={enrolled.id} value={enrolled.id}>
                        {profile?.full_name || "Sin nombre"}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>

            {alreadyInOtherGroup.length > 0 && (
              <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                <p>
                  <span className="font-semibold">{alreadyInOtherGroup.length} estudiante(s)</span> no aparecen porque ya están asignados a otro grupo del periodo activo.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onStudentIdChange("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleLink} disabled={loading}>
              {loading ? "Vinculando..." : "Vincular"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
