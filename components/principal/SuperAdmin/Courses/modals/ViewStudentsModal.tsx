"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCircle,
  ChevronDown,
  Plus,
  UserMinus,
  BookOpen,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import { GroupHasStudentsStore } from "@/Stores/groupHasStudentsStore";
import { EstudenteEnrrolledStore } from "@/Stores/studentEnrolledStore";
import { ProfilesStore } from "@/Stores/profilesStore";
import { CoursesStore } from "@/Stores/coursesStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { ParentHasStudentStore } from "@/Stores/ParentHasStudentStore";
import { LinkStudentModal } from "./LinkStudentModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ViewStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: any;
}

export function ViewStudentsModal({
  open,
  onOpenChange,
  group,
}: ViewStudentsModalProps) {
  const { groupHasStudents, fetchGroupHasStudents } = GroupHasStudentsStore();
  const { enrolled: studentEnrolled } = EstudenteEnrrolledStore();
  const { profiles } = ProfilesStore();
  const { courses } = CoursesStore();
  const { periodos } = PeriodAcademicStore();
  const { relations: parentHasStudent } = ParentHasStudentStore();

  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null,
  );
  const [isLinkStudentOpen, setIsLinkStudentOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Para el confirm de eliminar
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!open) {
      setExpandedStudentId(null);
      setPendingRemoveId(null);
    }
  }, [open]);

  const getParentInfo = (studentUserId: string) => {
    const rel = parentHasStudent.find((r) => r.student_id === studentUserId);
    if (!rel) return null;
    return profiles.find((p) => p.id === rel.parent_id) ?? null;
  };

  const studentsInGroup = groupHasStudents.filter(
    (ghs) => ghs.group_id === group?.id,
  );
  const course = courses.find((c) => c.id === group?.course_id);
  const period = periodos.find((p) => p.id === (group?.year as any));

  // ── Eliminar estudiante del grupo ──────────────────────────────────────────
  const handleRemove = async (ghsId: string) => {
    setRemovingId(ghsId);
    try {
      const { error } = await supabase
        .from("group_has_students")
        .delete()
        .eq("id", ghsId);

      if (error) throw error;

      await fetchGroupHasStudents();
      toast.success("Estudiante removido del grupo");
    } catch (err: any) {
      toast.error(`Error al remover: ${err.message}`);
    } finally {
      setRemovingId(null);
      setPendingRemoveId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          {/* ── Header ── */}
          <DialogHeader className="px-6 pt-5 pb-4 pr-12 border-b shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold leading-tight">
                    Grupo {group?.name}
                  </DialogTitle>
                  <div className="flex items-center gap-3 mt-1">
                    {course && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="w-3 h-3" />
                        {course.name}
                      </span>
                    )}
                    {period && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="w-3 h-3" />
                        {period.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setIsLinkStudentOpen(true)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Vincular estudiante
              </Button>
            </div>

            {/* Capacidad */}
            {group && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {studentsInGroup.length}
                  </span>
                  {group.max_students && (
                    <span className="text-muted-foreground">
                      / {group.max_students} cupos
                    </span>
                  )}
                </div>
                {group.max_students && (
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        studentsInGroup.length / group.max_students >= 1
                          ? "bg-red-500"
                          : studentsInGroup.length / group.max_students >= 0.8
                            ? "bg-amber-400"
                            : "bg-emerald-500",
                      )}
                      style={{
                        width: `${Math.min((studentsInGroup.length / group.max_students) * 100, 100)}%`,
                      }}
                    />
                  </div>
                )}
                {studentsInGroup.length === 0 && (
                  <Badge variant="outline" className="text-xs">
                    Sin estudiantes
                  </Badge>
                )}
                {group.max_students &&
                  studentsInGroup.length >= group.max_students && (
                    <Badge variant="destructive" className="text-xs">
                      Grupo lleno
                    </Badge>
                  )}
              </div>
            )}
          </DialogHeader>

          {/* ── Lista de estudiantes ── */}
          <div className="flex-1 overflow-y-auto">
            {studentsInGroup.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-medium">Sin estudiantes asignados</p>
                <p className="text-sm mt-1 text-center max-w-xs">
                  Este grupo aún no tiene estudiantes. Usa "Vincular estudiante"
                  para agregar.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {studentsInGroup.map((ghs, index) => {
                  const enrolled = studentEnrolled.find(
                    (e) => e.id === ghs.student_enrolled_id,
                  );
                  const student = enrolled
                    ? profiles.find((p) => p.id === enrolled.user_id)
                    : null;
                  const parentInfo = enrolled
                    ? getParentInfo(enrolled.user_id)
                    : null;
                  const isExpanded = expandedStudentId === ghs.id;
                  const isRemoving = removingId === ghs.id;

                  return (
                    <div
                      key={ghs.id}
                      className={cn(
                        "px-6 py-4 transition-colors",
                        isRemoving
                          ? "opacity-50 pointer-events-none bg-red-50/50"
                          : "hover:bg-muted/30",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                          {(student?.full_name || "?")[0].toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {student?.full_name || "Nombre no disponible"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student?.email || "Sin correo"}
                          </p>
                          <ConditionBadges
                            conditions={(student as any)?.conditions}
                            className="mt-1"
                          />
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={() => setPendingRemoveId(ghs.id)}
                            title="Remover del grupo"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Padre/Tutor accordion */}
                      <div className="mt-2 ml-12">
                        <button
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-purple-600 transition-colors"
                          onClick={() =>
                            setExpandedStudentId(isExpanded ? null : ghs.id)
                          }
                        >
                          <UserCircle className="w-3.5 h-3.5 text-purple-400" />
                          <span>Padre / Tutor</span>
                          <ChevronDown
                            className={cn(
                              "w-3 h-3 transition-transform duration-200",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </button>

                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-200",
                            isExpanded
                              ? "max-h-32 opacity-100 mt-2"
                              : "max-h-0 opacity-0",
                          )}
                        >
                          <div className="p-3 rounded-lg bg-purple-50/60 border border-purple-100 text-sm">
                            {parentInfo ? (
                              <div className="flex gap-6">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">
                                    Nombre
                                  </p>
                                  <p className="font-medium text-sm">
                                    {parentInfo.full_name || "—"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">
                                    Correo
                                  </p>
                                  <p className="text-sm">
                                    {parentInfo.email || "—"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-1">
                                Sin padre/tutor asignado
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between shrink-0">
            <p className="text-xs text-muted-foreground">
              {studentsInGroup.length} estudiante(s)
              {group?.max_students &&
                ` · ${group.max_students - studentsInGroup.length} cupos disponibles`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm remover ── */}
      <AlertDialog
        open={!!pendingRemoveId}
        onOpenChange={(v) => !v && setPendingRemoveId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Remover estudiante del grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              El estudiante será removido de este grupo. Su matrícula al período
              académico
              <strong> no se eliminará</strong> — solo se quita la asignación al
              grupo. Podrás volver a asignarlo cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => pendingRemoveId && handleRemove(pendingRemoveId)}
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Sí, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Link student modal ── */}
      <LinkStudentModal
        open={isLinkStudentOpen}
        onOpenChange={setIsLinkStudentOpen}
        group={group}
        selectedStudentId={selectedStudentId}
        onStudentIdChange={setSelectedStudentId}
      />
    </>
  );
}
