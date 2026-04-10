"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  GroupWithStudents,
  ParentInfo,
  LearningCondition,
  SubjectReport,
  CycleGrade,
} from "../types";

export function useDirectorGrupoData() {
  const [groups, setGroups] = useState<GroupWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");

        // ── Grupos con estudiantes ──────────────────────────────
        const { data, error: dbError } = await supabase
          .from("groups")
          .select(
            `
            id, name, year,
            course:course_id ( id, name ),
            students:group_has_students (
              id,
              enrollment:student_enrolled_id (
                id, is_active, user_id,
                profile:user_id ( id, full_name, email, avatar_url )
              )
            )
          `,
          )
          .eq("director_id", user.id);

        if (dbError) throw dbError;

        type RawStudent = {
          id: string;
          enrolledId: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          is_active: boolean;
        };
        type RawGroup = {
          id: string;
          name: string;
          year: string | null;
          course: { id: string; name: string } | null;
          students: RawStudent[];
        };

        const parsedRaw: RawGroup[] = (data ?? []).map((g) => {
          const course = Array.isArray(g.course) ? g.course[0] : g.course;
          const students: RawStudent[] = ((g.students ?? []) as any[])
            .map((ghs) => {
              const enrollment = Array.isArray(ghs.enrollment)
                ? ghs.enrollment[0]
                : ghs.enrollment;
              if (!enrollment) return null;
              const profile = Array.isArray(enrollment.profile)
                ? enrollment.profile[0]
                : enrollment.profile;
              if (!profile) return null;
              return {
                id: profile.id as string,
                enrolledId: enrollment.id as string,
                full_name: profile.full_name as string,
                email: profile.email as string,
                avatar_url: profile.avatar_url as string | null,
                is_active: enrollment.is_active as boolean,
              };
            })
            .filter((s): s is RawStudent => s !== null);

          return {
            id: g.id,
            name: g.name,
            year: g.year,
            course: course
              ? { id: (course as any).id, name: (course as any).name }
              : null,
            students,
          };
        });

        const allStudentIds = parsedRaw.flatMap((g) => g.students.map((s) => s.id));
        const allEnrolledIds = parsedRaw.flatMap((g) =>
          g.students.map((s) => s.enrolledId),
        );
        const groupIds = parsedRaw.map((g) => g.id);

        // ── Padres ─────────────────────────────────────────────
        const parentsMap = new Map<string, ParentInfo[]>();
        if (allStudentIds.length > 0) {
          const { data: parentRows } = await supabase
            .from("parent_has_student")
            .select(
              "student_id, parent:parent_id ( id, full_name, email, avatar_url )",
            )
            .in("student_id", allStudentIds);

          for (const row of parentRows ?? []) {
            if (!row.student_id) continue;
            const parent = Array.isArray(row.parent) ? row.parent[0] : row.parent;
            if (!parent) continue;
            const list = parentsMap.get(row.student_id) ?? [];
            list.push({
              id: (parent as any).id,
              full_name: (parent as any).full_name,
              email: (parent as any).email,
              avatar_url: (parent as any).avatar_url,
            });
            parentsMap.set(row.student_id, list);
          }
        }

        // ── Materias por grupo ──────────────────────────────────
        type GHCInfo = { id: string; subjectId: string; subjectName: string };
        const classesPerGroup = new Map<string, GHCInfo[]>();
        if (groupIds.length > 0) {
          const { data: classData } = await supabase
            .from("group_has_class")
            .select("id, group_id, subject_id, subject:subject_id ( name )")
            .in("group_id", groupIds)
            .eq("is_active", true);

          for (const cls of classData ?? []) {
            const subject = Array.isArray(cls.subject) ? cls.subject[0] : cls.subject;
            const subjectName = (subject as any)?.name as string | undefined;
            if (!subjectName) continue;
            const list = classesPerGroup.get(cls.group_id) ?? [];
            list.push({ id: cls.id, subjectId: cls.subject_id as string, subjectName });
            classesPerGroup.set(cls.group_id, list);
          }
        }

        // ── Ciclos del período académico ────────────────────────
        const academicPeriodIds = [
          ...new Set(parsedRaw.map((g) => g.year).filter(Boolean)),
        ] as string[];
        const cycleInfoMap = new Map<string, { name: string; startDate: string | null }>();
        // cycleId → academic_period_id (para poder agrupar ciclos por período)
        const cyclePeriodMap = new Map<string, string>();
        if (academicPeriodIds.length > 0) {
          const { data: apCyclesData } = await supabase
            .from("academic_period_has_cycle")
            .select("id, start_date, academic_period_id, cycle:cycle_id ( name )")
            .in("academic_period_id", academicPeriodIds)
            .eq("is_active", true);
          for (const apc of apCyclesData ?? []) {
            const cycle = Array.isArray(apc.cycle) ? apc.cycle[0] : apc.cycle;
            if (!cycle) continue;
            cycleInfoMap.set(apc.id, {
              name: (cycle as any).name,
              startDate: apc.start_date,
            });
            if (apc.academic_period_id) {
              cyclePeriodMap.set(apc.id, apc.academic_period_id as string);
            }
          }
        }
        const sortedCycleIds = Array.from(cycleInfoMap.keys()).sort((a, b) =>
          (cycleInfoMap.get(a)?.startDate ?? "").localeCompare(
            cycleInfoMap.get(b)?.startDate ?? "",
          ),
        );

        // ── Notas por estudiante/materia/ciclo ──────────────────
        const gradesMap = new Map<string, Map<string, Map<string, number>>>();
        if (allEnrolledIds.length > 0) {
          const { data: gradesData } = await supabase
            .from("student_cycle_grade")
            .select(
              "grade, student_enrolled_id, group_has_class_id, academic_period_has_cycle_id",
            )
            .in("student_enrolled_id", allEnrolledIds);
          for (const row of gradesData ?? []) {
            if (!gradesMap.has(row.student_enrolled_id))
              gradesMap.set(row.student_enrolled_id, new Map());
            const byGhc = gradesMap.get(row.student_enrolled_id)!;
            if (!byGhc.has(row.group_has_class_id))
              byGhc.set(row.group_has_class_id, new Map());
            byGhc
              .get(row.group_has_class_id)!
              .set(row.academic_period_has_cycle_id, row.grade);
          }
        }

        // ── Notas finales por estudiante/materia ────────────────
        // enrolledId → ghcId → final_grade
        const finalGradeMap = new Map<string, Map<string, number>>();
        if (allEnrolledIds.length > 0) {
          const { data: finalGradesData } = await supabase
            .from("student_final_grade")
            .select("final_grade, student_enrolled_id, group_has_class_id")
            .in("student_enrolled_id", allEnrolledIds);
          for (const row of finalGradesData ?? []) {
            if (!finalGradeMap.has(row.student_enrolled_id))
              finalGradeMap.set(row.student_enrolled_id, new Map());
            finalGradeMap.get(row.student_enrolled_id)!.set(row.group_has_class_id, row.final_grade);
          }
        }

        // ── Fallas por estudiante/materia/ciclo ─────────────────
        const absencesMap = new Map<string, Map<string, Map<string, number>>>();
        if (allEnrolledIds.length > 0) {
          const { data: absenceData } = await supabase
            .from("student_attendance")
            .select(
              "student_enrolled_id, session:class_session_id ( academic_period_has_cycle_id, group_has_class_id )",
            )
            .in("student_enrolled_id", allEnrolledIds)
            .eq("status", "absent");
          for (const row of absenceData ?? []) {
            const session = Array.isArray(row.session) ? row.session[0] : row.session;
            const cycleId = (session as any)?.academic_period_has_cycle_id as string | null;
            const ghcId = (session as any)?.group_has_class_id as string | null;
            if (!cycleId || !ghcId) continue;
            if (!absencesMap.has(row.student_enrolled_id))
              absencesMap.set(row.student_enrolled_id, new Map());
            const byGhc = absencesMap.get(row.student_enrolled_id)!;
            if (!byGhc.has(ghcId)) byGhc.set(ghcId, new Map());
            byGhc.get(ghcId)!.set(cycleId, (byGhc.get(ghcId)!.get(cycleId) ?? 0) + 1);
          }
        }

        // ── Condiciones de aprendizaje ──────────────────────────
        const lcMap = new Map<string, LearningCondition[]>();
        if (allStudentIds.length > 0) {
          const { data: lcData } = await supabase
            .from("profile_has_learning_condition")
            .select("profile_id, condition:learning_condition_id ( id, name, color )")
            .in("profile_id", allStudentIds);
          for (const row of lcData ?? []) {
            const condition = Array.isArray(row.condition)
              ? row.condition[0]
              : row.condition;
            if (!condition) continue;
            const list = lcMap.get(row.profile_id) ?? [];
            list.push({
              id: (condition as any).id,
              name: (condition as any).name,
              color: (condition as any).color,
            });
            lcMap.set(row.profile_id, list);
          }
        }

        // ── Construcción final ──────────────────────────────────
        const parsed: GroupWithStudents[] = parsedRaw.map((g) => {
          const groupClasses = classesPerGroup.get(g.id) ?? [];
          return {
            id: g.id,
            name: g.name,
            year: g.year,
            course: g.course,
            groupSubjects: groupClasses.map((cls) => ({
              groupHasClassId: cls.id,
              subjectId: cls.subjectId,
              subjectName: cls.subjectName,
            })),
            groupCycles: sortedCycleIds
              .filter((cycleId) => cyclePeriodMap.get(cycleId) === g.year)
              .map((cycleId) => ({
                cycleId,
                cycleName: cycleInfoMap.get(cycleId)?.name ?? cycleId,
              })),
            students: g.students.map((s) => {
              const subjects: SubjectReport[] = groupClasses.map((cls) => {
                const cycleGrades = gradesMap.get(s.enrolledId)?.get(cls.id);
                const cycleAbsences = absencesMap.get(s.enrolledId)?.get(cls.id);
                const cycles: CycleGrade[] = sortedCycleIds.map((cycleId) => ({
                  cycleId,
                  cycleName: cycleInfoMap.get(cycleId)?.name ?? cycleId,
                  grade: cycleGrades?.get(cycleId) ?? null,
                  absences: cycleAbsences?.get(cycleId) ?? 0,
                }));
                const finalGrade = finalGradeMap.get(s.enrolledId)?.get(cls.id) ?? null;
                return {
                  groupHasClassId: cls.id,
                  subjectId: cls.subjectId,
                  subjectName: cls.subjectName,
                  cycles,
                  finalGrade,
                };
              });
              return {
                ...s,
                parents: parentsMap.get(s.id) ?? [],
                learning_conditions: lcMap.get(s.id) ?? [],
                subjects,
              };
            }),
          };
        });

        setGroups(parsed);
      } catch (err: any) {
        setError(err.message ?? "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { groups, loading, error };
}
