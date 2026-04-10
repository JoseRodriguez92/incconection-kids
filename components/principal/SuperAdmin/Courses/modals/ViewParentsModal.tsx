"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Plus } from "lucide-react";
import { GroupHasParentStore } from "@/Stores/groupHasParentStore";
import { ParentEnrolledStore } from "@/Stores/parentEnrolledStore";
import { ProfilesStore } from "@/Stores/profilesStore";
import { CoursesStore } from "@/Stores/coursesStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { LinkParentModal } from "./LinkParentModal";

interface ViewParentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: any;
}

export function ViewParentsModal({ open, onOpenChange, group }: ViewParentsModalProps) {
  const { groupHasParents } = GroupHasParentStore();
  const { enrolled: parentEnrolled } = ParentEnrolledStore();
  const { profiles } = ProfilesStore();
  const { courses } = CoursesStore();
  const { periodos } = PeriodAcademicStore();

  const [isLinkParentOpen, setIsLinkParentOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState("");

  const parentsInGroup = groupHasParents.filter(
    (ghp) => ghp.group_id === group?.id,
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between my-4">
              <DialogTitle>Padres del Grupo: {group?.name}</DialogTitle>
              <Button
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => setIsLinkParentOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Vincular Padre</span>
              </Button>
            </div>
          </DialogHeader>
          {group && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Curso:</strong>{" "}
                  {courses.find((c) => c.id === group.course_id)?.name || "N/A"}
                </p>
                <p>
                  <strong>Periodo:</strong>{" "}
                  {periodos.find((p) => p.id === (group.year as any))?.name ||
                    `Año ${group.year}`}
                </p>
              </div>
              <div className="border rounded-lg">
                {parentsInGroup.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserCircle className="w-16 h-16 mx-auto mb-4 opacity-40" />
                    <p className="font-medium">No hay padres asignados</p>
                    <p className="text-sm mt-2">
                      Este grupo aún no tiene padres inscritos
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {parentsInGroup.map((ghp) => {
                      const enrolled = parentEnrolled.find(
                        (e) => e.id === ghp.parent_enrolled_id,
                      );
                      const parent = enrolled
                        ? profiles.find((p) => p.id === enrolled.user_id)
                        : null;
                      return (
                        <div
                          key={ghp.id}
                          className="p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">
                                {parent?.full_name || "Nombre no disponible"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {parent?.email || ghp.parent_enrolled_id}
                              </p>
                            </div>
                            <Badge variant="default">Activo</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Inscrito en el grupo
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Total de padres: <strong>{parentsInGroup.length}</strong>
                </p>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <LinkParentModal
        open={isLinkParentOpen}
        onOpenChange={setIsLinkParentOpen}
        group={group}
        selectedParentId={selectedParentId}
        onParentIdChange={setSelectedParentId}
      />
    </>
  );
}
