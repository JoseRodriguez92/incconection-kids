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
import { GroupHasParentStore } from "@/Stores/groupHasParentStore";
import { ParentEnrolledStore } from "@/Stores/parentEnrolledStore";
import { ProfilesStore } from "@/Stores/profilesStore";

interface LinkParentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: any;
  selectedParentId: string;
  onParentIdChange: (id: string) => void;
}

export function LinkParentModal({
  open,
  onOpenChange,
  group,
  selectedParentId,
  onParentIdChange,
}: LinkParentModalProps) {
  const { groupHasParents, addGroupHasParent, loading } = GroupHasParentStore();
  const { enrolled: parentEnrolled } = ParentEnrolledStore();
  const { profiles } = ProfilesStore();

  const availableParents = parentEnrolled.filter((enrolled) => {
    const isAlreadyAssigned = groupHasParents.some(
      (ghp) =>
        ghp.group_id === group?.id && ghp.parent_enrolled_id === enrolled.id,
    );
    return !isAlreadyAssigned && enrolled.is_active;
  });

  const handleLink = async () => {
    if (!selectedParentId) {
      alert("Por favor selecciona un padre.");
      return;
    }
    if (!group) {
      alert("No hay grupo seleccionado.");
      return;
    }
    const alreadyAssigned = groupHasParents.some(
      (ghp) =>
        ghp.group_id === group.id && ghp.parent_enrolled_id === selectedParentId,
    );
    if (alreadyAssigned) {
      alert("Este padre ya está asignado a este grupo.");
      return;
    }
    try {
      await addGroupHasParent({
        id: crypto.randomUUID(),
        group_id: group.id,
        parent_enrolled_id: selectedParentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      onParentIdChange("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error al vincular padre:", error);
      alert("Hubo un error al vincular el padre. Por favor intenta de nuevo.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular Padre al Grupo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Seleccionar Padre</Label>
            <Select value={selectedParentId} onValueChange={onParentIdChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un padre" />
              </SelectTrigger>
              <SelectContent>
                {availableParents.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No hay padres disponibles para vincular
                  </div>
                ) : (
                  availableParents.map((enrolled) => {
                    const profile = profiles.find((p) => p.id === enrolled.user_id);
                    return (
                      <SelectItem key={enrolled.id} value={enrolled.id}>
                        {profile?.full_name || "Sin nombre"} -{" "}
                        {profile?.email || enrolled.user_id}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onParentIdChange("");
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
