"use client";

import { useEffect, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Edit, UserCircle, Plus, Upload } from "lucide-react";
import { GroupsStore } from "@/Stores/groupsStore";
import { GroupHasStudentsStore } from "@/Stores/groupHasStudentsStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { ProfilesStore } from "@/Stores/profilesStore";
import { CreateGroupModal } from "./CreateGroupModal";
import { BulkGroupEnroll } from "./BulkGroupEnroll";

interface ViewGroupsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
  onEditGroup: (group: any) => void;
  onViewStudents: (group: any) => void;
  onViewParents: (group: any) => void;
}

export function ViewGroupsModal({
  open,
  onOpenChange,
  course,
  onEditGroup,
  onViewStudents,
  onViewParents,
}: ViewGroupsModalProps) {
  const { groups } = GroupsStore();
  const { groupHasStudents } = GroupHasStudentsStore();
  const { periodos } = PeriodAcademicStore();
  const { profiles } = ProfilesStore();

  const [filterPeriodId, setFilterPeriodId] = useState("todos");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [bulkEnrollGroup, setBulkEnrollGroup] = useState<any>(null);

  useEffect(() => {
    if (open) setFilterPeriodId("todos");
  }, [open]);

  const filteredGroups = groups
    .filter((group) => {
      if (group.course_id !== course?.id) return false;
      if (filterPeriodId !== "todos" && group.year !== (filterPeriodId as any)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[100%] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grupos del Curso: {course?.name}</DialogTitle>
          </DialogHeader>
          {course && (
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-3">
                <Select value={filterPeriodId} onValueChange={setFilterPeriodId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filtrar por periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los periodos</SelectItem>
                    {periodos.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setIsCreateGroupOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Grupo</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGroups.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">
                      {filterPeriodId !== "todos"
                        ? "No se encontraron grupos para este periodo académico"
                        : "Este curso aún no tiene grupos asignados"}
                    </p>
                  </div>
                ) : (
                  filteredGroups.map((group) => {
                    const studentsInGroup = groupHasStudents.filter(
                      (ghs) => ghs.group_id === group.id,
                    ).length;
                    const capacityPercentage = group.max_students
                      ? (studentsInGroup / group.max_students) * 100
                      : 0;

                    return (
                      <Card
                        key={group.id}
                        className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600"
                      >
                        <CardContent className="p-5">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between pb-3 border-b">
                              <div className="space-y-1">
                                <h4 className="font-bold text-xl text-foreground flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                      {group.name}
                                    </span>
                                  </div>
                                  Grupo {group.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  ID: {group.id.slice(0, 8)}...
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {periodos.find((p) => p.id === (group.year as any))
                                  ?.name || `Año ${group.year}`}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-start space-x-3 p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors">
                                <UserCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Director
                                  </p>
                                  <p className="text-sm font-semibold truncate">
                                    {group.director_id
                                      ? profiles.find((p) => p.id === group.director_id)
                                          ?.full_name ||
                                        profiles.find((p) => p.id === group.director_id)
                                          ?.email ||
                                        "No asignado"
                                      : "No asignado"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start space-x-3 p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors">
                                <Users className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Capacidad
                                  </p>
                                  <div className="space-y-1.5">
                                    <p className="text-sm font-semibold">
                                      {studentsInGroup} /{" "}
                                      {group.max_students || "∞"} estudiantes
                                    </p>
                                    {group.max_students && (
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                        <div
                                          className={`h-1.5 rounded-full transition-all ${
                                            capacityPercentage >= 90
                                              ? "bg-red-500"
                                              : capacityPercentage >= 70
                                                ? "bg-yellow-500"
                                                : "bg-green-500"
                                          }`}
                                          style={{
                                            width: `${Math.min(capacityPercentage, 100)}%`,
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 transition-all"
                                onClick={() => onEditGroup(group)}
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                                <span className="text-xs">Editar</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950 transition-all"
                                onClick={() => onViewStudents(group)}
                              >
                                <Users className="w-4 h-4 text-green-600" />
                                <span className="text-xs">Estudiantes</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950 transition-all"
                                onClick={() => setBulkEnrollGroup(group)}
                              >
                                <Upload className="w-4 h-4 text-violet-600" />
                                <span className="text-xs">Carga CSV</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CreateGroupModal
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        courseId={course?.id ?? ""}
      />

      {bulkEnrollGroup && (
        <BulkGroupEnroll
          open={!!bulkEnrollGroup}
          onOpenChange={(v) => !v && setBulkEnrollGroup(null)}
          group={bulkEnrollGroup}
        />
      )}
    </>
  );
}
