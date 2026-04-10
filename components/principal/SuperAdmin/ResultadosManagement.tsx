"use client";

import { useState } from "react";
import { BarChart2, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StudentGradesDialog } from "@/components/principal/Profesor/StudentGradesDialog";
import { GroupCard } from "@/app/usuario/profesor/director-grupo/components/GroupCard";
import { useResultadosData } from "./Resultados/hooks/useResultadosData";
import { useGradeEditor } from "./Resultados/hooks/useGradeEditor";
import { ResultadosFilters } from "./Resultados/ResultadosFilters";
import { UserInfoStore } from "@/Stores/UserInfoStore";
import type { GroupWithStudents, StudentInGroup } from "./Resultados/types";
import type { GradeEditParams } from "./Resultados/hooks/useGradeEditor";

export function ResultadosManagement() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [gradesTarget, setGradesTarget] = useState<{
    student: StudentInGroup;
    group: GroupWithStudents;
  } | null>(null);

  const { courses, activePeriod, groups, loading, error, refetch } =
    useResultadosData(selectedCourseId);

  const { save: saveGrade } = useGradeEditor(refetch);
  const currentRole = UserInfoStore((s) => s.current_role);
  const canEdit = currentRole === "super-admin" || currentRole === "Coordinadora";

  const handleGradeEdit = canEdit
    ? async (params: GradeEditParams) => { await saveGrade(params); }
    : undefined;

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleCourseChange = (id: string | null) => {
    setSelectedCourseId(id);
    setOpenGroups(new Set()); // colapsar grupos al cambiar curso
  };

  const totalStudents = groups.reduce((acc, g) => acc + g.students.length, 0);

  return (
    <div className="min-w-0 w-full bg-transparent">
      {/* Header */}
      <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b px-6 py-6 relative z-1">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/15 rounded-xl">
              <BarChart2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Resultados Académicos
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Consulta el rendimiento de todos los grupos por curso
              </p>
            </div>
          </div>

          <ResultadosFilters
            courses={courses}
            selectedCourseId={selectedCourseId}
            onCourseChange={handleCourseChange}
            activePeriod={activePeriod}
            totalGroups={groups.length}
            totalStudents={totalStudents}
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-5 relative z-1">
        {/* Estado: sin curso seleccionado */}
        {!selectedCourseId && !loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="p-5 bg-muted/40 rounded-full inline-flex">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-semibold">Selecciona un curso</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                  Elige un curso en el filtro superior para ver los resultados
                  académicos de sus grupos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado: cargando */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Cargando resultados...</p>
          </div>
        )}

        {/* Estado: error */}
        {!loading && error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center text-red-700 text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Estado: sin grupos en el curso */}
        {!loading && !error && selectedCourseId && groups.length === 0 && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-3">
              <div className="p-5 bg-muted/40 rounded-full inline-flex">
                <BarChart2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Sin grupos</h3>
                <p className="text-muted-foreground text-sm">
                  Este curso no tiene grupos en el período académico activo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grupos con tablas de notas */}
        {!loading && !error && groups.length > 0 && (
          <div className="space-y-5">
            {groups.map((group, groupIdx) => (
              <GroupCard
                key={group.id}
                group={group}
                groupIdx={groupIdx}
                isOpen={openGroups.has(group.id)}
                onToggle={() => toggleGroup(group.id)}
                onViewGrades={(student, grp) =>
                  setGradesTarget({ student, group: grp })
                }
                onGradeEdit={handleGradeEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal notas */}
      {gradesTarget && (
        <StudentGradesDialog
          open={!!gradesTarget}
          onClose={() => setGradesTarget(null)}
          studentName={gradesTarget.student.full_name}
          enrolledId={gradesTarget.student.enrolledId}
          groupId={gradesTarget.group.id}
          academicPeriodId={gradesTarget.group.year ?? ""}
        />
      )}
    </div>
  );
}
