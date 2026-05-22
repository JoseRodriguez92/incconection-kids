"use client";

import { useState } from "react";
import { BarChart2, BookOpen, Loader2, Users, GraduationCap, AlertCircle } from "lucide-react";
import { StudentGradesDialog } from "@/components/principal/Profesor/StudentGradesDialog";
import { GroupCard } from "@/app/usuario/profesor/director-grupo/components/GroupCard";
import { useResultadosData } from "./Resultados/hooks/useResultadosData";
import { useGradeEditor } from "./Resultados/hooks/useGradeEditor";
import { ResultadosFilters } from "./Resultados/ResultadosFilters";
import { UserInfoStore } from "@/Stores/UserInfoStore";
import type { GroupWithStudents, StudentInGroup } from "./Resultados/types";
import type { GradeEditParams } from "./Resultados/hooks/useGradeEditor";
import { cn } from "@/lib/utils";

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
    setOpenGroups(new Set());
  };

  const totalStudents = groups.reduce((acc, g) => acc + g.students.length, 0);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="min-w-0 w-full bg-transparent flex flex-col h-full">

      {/* ── Header ── */}
      <div className="bg-white/70 backdrop-blur-sm border-b px-4 py-3 sm:px-6 sm:py-4 relative z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                Resultados Académicos
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
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

        {/* Stat chips — solo cuando hay curso seleccionado con datos */}
        {selectedCourseId && !loading && groups.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 mt-3 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground">
              {selectedCourse?.name}
            </p>
            <div className="h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GraduationCap className="w-3.5 h-3.5" />
              <span><strong className="text-foreground">{groups.length}</strong> {groups.length === 1 ? "grupo" : "grupos"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span><strong className="text-foreground">{totalStudents}</strong> {totalStudents === 1 ? "estudiante" : "estudiantes"}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Contenido ── */}
      <div className="flex-1 p-4 sm:p-6 relative z-10">

        {/* Empty state — sin curso seleccionado */}
        {!selectedCourseId && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[420px] gap-8">
            {/* Mensaje principal */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Selecciona un curso</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Elige uno de los cursos disponibles para ver los resultados académicos de sus grupos.
              </p>
            </div>

            {/* Cursos como cards clickeables */}
            {courses.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleCourseChange(course.id)}
                    className={cn(
                      "group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 bg-white/80",
                      "text-sm font-medium transition-all duration-200",
                      "border-border/60 text-muted-foreground",
                      "hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-sm",
                    )}
                  >
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <GraduationCap className="w-3.5 h-3.5 text-primary/70" />
                    </div>
                    {course.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
            <p className="text-sm text-muted-foreground">Cargando resultados...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Sin grupos */}
        {!loading && !error && selectedCourseId && groups.length === 0 && (
          <div className="flex items-center justify-center min-h-[320px]">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                <BarChart2 className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Sin grupos registrados</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Este curso no tiene grupos en el período académico activo.
              </p>
            </div>
          </div>
        )}

        {/* Grupos con tablas de notas */}
        {!loading && !error && groups.length > 0 && (
          <div className="space-y-4">
            {groups.map((group, groupIdx) => (
              <GroupCard
                key={group.id}
                group={group}
                groupIdx={groupIdx}
                isOpen={openGroups.has(group.id)}
                onToggle={() => toggleGroup(group.id)}
                onViewGrades={(student, grp) => setGradesTarget({ student, group: grp })}
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
