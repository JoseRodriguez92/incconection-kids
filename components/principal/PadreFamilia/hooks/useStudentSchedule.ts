"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type ScheduleItem = {
  id: string;
  groupClassId: string; // group_has_class.id — para cargar metodología, actividades y contenido
  dayOfWeek: number;   // 1 = Lunes … 5 = Viernes
  startTime: string;   // "HH:MM"
  endTime: string;     // "HH:MM"
  subject: string;
  teacher: string;
  classroom: string;
  subjectId: string;   // para asignar color por materia
};

/**
 * Carga el horario real del estudiante seleccionado.
 *
 * Cadena de consultas:
 *   student_enrolled (user_id, is_active, academic_period activo)
 *     → group_has_students → group_id
 *       → group_has_class (activa, group_id) → subject, teacher, classroom
 *         → group_class_schedule → day_of_week, start_time, end_time
 */
export function useStudentSchedule(studentId: string | null) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!studentId) {
      setSchedule([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // ── Paso 1: inscripciones activas + grupos del estudiante ──────────────
      const { data: enrollments } = await supabase
        .from("student_enrolled")
        .select(
          `
          id,
          academic_period!student_enrolled_academic_period_id_fkey (is_active),
          group_has_students!grupo_tiene_estudiante_student_enrolled_id_fkey (
            group_id
          )
        `
        )
        .eq("user_id", studentId)
        .eq("is_active", true);

      // Solo períodos académicos activos
      const activeEnrollments = (enrollments ?? []).filter(
        (e: any) => e.academic_period?.is_active === true
      );

      const groupIds: string[] = activeEnrollments.flatMap((e: any) =>
        (e.group_has_students ?? []).map((g: any) => g.group_id as string)
      );

      if (groupIds.length === 0) {
        setSchedule([]);
        setLoading(false);
        return;
      }

      // ── Paso 2: clases del grupo con horarios, materia, profesor y aula ────
      const { data: classData } = await supabase
        .from("group_has_class")
        .select(
          `
          id,
          subject_id,
          materias!group_has_class_subject_id_fkey (name),
          teacher_enrolled!group_has_class_teacher_enrolled_id_fkey (
            user_id,
            profiles!teachers_enrolled_user_id_fkey (full_name)
          ),
          classrooms!group_has_class_classroom_id_fkey (name),
          group_class_schedule!group_class_schedule_group_class_id_fkey (
            id,
            day_of_week,
            start_time,
            end_time,
            classrooms!group_class_schedule_classroom_id_fkey (name)
          )
        `
        )
        .in("group_id", groupIds)
        .eq("is_active", true);

      // ── Paso 3: aplanar a lista de ScheduleItem ────────────────────────────
      const items: ScheduleItem[] = [];

      for (const cls of classData ?? []) {
        const c = cls as any;
        const subjectName: string = c.materias?.name ?? "Sin materia";
        const teacherName: string =
          c.teacher_enrolled?.profiles?.full_name ?? "Sin profesor";
        const defaultClassroom: string = c.classrooms?.name ?? "Sin aula";

        for (const sched of c.group_class_schedule ?? []) {
          // El horario puede tener su propio aula; si no, usa la de la clase
          const classroomName: string =
            sched.classrooms?.name ?? defaultClassroom;

          items.push({
            id: sched.id,
            groupClassId: c.id,
            dayOfWeek: sched.day_of_week,
            startTime: (sched.start_time as string).substring(0, 5),
            endTime: (sched.end_time as string).substring(0, 5),
            subject: subjectName,
            teacher: teacherName,
            classroom: classroomName,
            subjectId: c.subject_id ?? c.id,
          });
        }
      }

      // Ordenar por día y luego por hora de inicio
      items.sort((a, b) =>
        a.dayOfWeek !== b.dayOfWeek
          ? a.dayOfWeek - b.dayOfWeek
          : a.startTime.localeCompare(b.startTime)
      );

      setSchedule(items);
    } catch (err) {
      console.error("[useStudentSchedule]", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { schedule, loading, refresh: fetch };
}
