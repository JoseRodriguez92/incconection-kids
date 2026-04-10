"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserInfoStore } from "@/Stores/UserInfoStore";
import type { Student } from "@/components/principal/PadreFamilia/student-selector";

/** Clave de sessionStorage para el caché de hijos del padre autenticado */
export const PARENT_STUDENTS_SESSION_KEY = "parent_students_cache_v4";

/**
 * Carga los estudiantes (hijos) vinculados al padre actualmente autenticado.
 *
 * Estrategia de cache:
 *  1. Si existe datos válidos en sessionStorage, los usa de inmediato (sin red).
 *  2. Si no, consulta Supabase en dos pasos:
 *     a. parent_has_student → profiles  (nombre, avatar)
 *     b. student_enrolled → group_has_students → groups → courses  (grado, sección)
 *  3. Guarda el resultado enriquecido en sessionStorage para la misma sesión.
 *
 * Expone `refresh()` para forzar una recarga desde Supabase
 * (útil si se asigna un nuevo hijo al padre en la misma sesión).
 */
export function useParentStudents() {
  const user = UserInfoStore((s) => s.user);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const fetchFromServer = useCallback(async (parentId: string) => {
    setLoading(true);
    const supabase = createClient();

    try {
      // ── Paso 1: perfiles de los hijos ──────────────────────────────────────
      const { data, error } = await supabase
        .from("parent_has_student")
        .select(
          `
          student_id,
          profiles!parent_has_student_student_id_fkey (
            id,
            full_name,
            first_name,
            last_name,
            avatar_url
          )
        `
        )
        .eq("parent_id", parentId);

      if (error) throw error;

      const profileRows = (data ?? []).filter((r: any) => r.profiles);
      const studentIds = profileRows.map((r: any) => (r.profiles as any).id as string);

      // ── Paso 2: condiciones de aprendizaje por estudiante ──────────────────
      type Condition = { id: string; name: string; color: string | null };
      const conditionsMap: Record<string, Condition[]> = {};

      if (studentIds.length > 0) {
        const { data: condData } = await supabase
          .from("profile_has_learning_condition")
          .select("profile_id, learning_condition:learning_condition_id(id, name, color)")
          .in("profile_id", studentIds);

        for (const row of condData ?? []) {
          const c = (row as any).learning_condition;
          if (!c) continue;
          if (!conditionsMap[(row as any).profile_id]) conditionsMap[(row as any).profile_id] = [];
          conditionsMap[(row as any).profile_id].push(c);
        }
      }

      // ── Paso 3: grado y sección desde student_enrolled → groups → courses ──
      type GradeInfo = { grade: string; gradeEn: string; section: string };
      const gradeMap: Record<string, GradeInfo> = {};

      if (studentIds.length > 0) {
        const { data: enrollData } = await supabase
          .from("student_enrolled")
          .select(
            `
            user_id,
            academic_period!student_enrolled_academic_period_id_fkey (
              is_active
            ),
            group_has_students!grupo_tiene_estudiante_student_enrolled_id_fkey (
              groups!grupo_tiene_estudiante_group_id_fkey (
                name,
                courses!groups_course_id_fkey (
                  name,
                  grade_number
                )
              )
            )
          `
          )
          .in("user_id", studentIds)
          .eq("is_active", true);

        // Solo tomar inscripciones cuyo período académico también esté activo
        const activeEnroll = (enrollData ?? []).filter(
          (r: any) => r.academic_period?.is_active === true
        );

        for (const row of activeEnroll) {
          const ghs: any[] = (row as any).group_has_students ?? [];
          if (ghs.length === 0) continue;

          const firstGroup: any = ghs[0]?.groups;
          if (!firstGroup) continue;

          const course: any = firstGroup.courses;
          const gradeName: string =
            course?.name ??
            (course?.grade_number != null ? `Grado ${course.grade_number}` : "Sin grado");

          gradeMap[(row as any).user_id] = {
            grade: gradeName,
            gradeEn: gradeName, // se usa el mismo nombre; ajustar si hay traducción
            section: firstGroup.name ?? "—",
          };
        }
      }

      // ── Mapeo final ────────────────────────────────────────────────────────
      const mapped: Student[] = profileRows.map((r: any): Student => {
        const p = r.profiles as any;
        const firstName = p.first_name || p.full_name?.split(" ")[0] || "Sin";
        const lastName =
          p.last_name || p.full_name?.split(" ").slice(1).join(" ") || "Nombre";
        const info = gradeMap[p.id];

        return {
          id: p.id,
          firstName,
          lastName,
          grade: info?.grade ?? "Sin grado",
          gradeEn: info?.gradeEn ?? "No grade",
          section: info?.section ?? "—",
          photo: p.avatar_url || "/placeholder.svg",
          status: "active",
          notifications: 0,
          conditions: conditionsMap[p.id] ?? [],
        };
      });

      // Persistir en sessionStorage para el resto de la sesión
      sessionStorage.setItem(
        PARENT_STUDENTS_SESSION_KEY,
        JSON.stringify({ parentId, students: mapped })
      );

      setStudents(mapped);
      setActiveStudent((prev) => prev ?? mapped[0] ?? null);
    } catch (err) {
      console.error("[useParentStudents] Error al cargar hijos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Intentar leer desde sessionStorage primero
    try {
      const raw = sessionStorage.getItem(PARENT_STUDENTS_SESSION_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as {
          parentId: string;
          students: Student[];
        };
        // Solo usar el caché si pertenece al mismo padre
        if (cached.parentId === user.id && cached.students.length > 0) {
          setStudents(cached.students);
          setActiveStudent(cached.students[0]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // caché corrupto → ignorar y re-fetch
    }

    fetchFromServer(user.id);
  }, [user?.id, fetchFromServer]);

  /** Fuerza recarga desde Supabase e invalida el caché */
  const refresh = useCallback(() => {
    if (!user?.id) return;
    sessionStorage.removeItem(PARENT_STUDENTS_SESSION_KEY);
    fetchFromServer(user.id);
  }, [user?.id, fetchFromServer]);

  return {
    students,
    loading,
    activeStudent,
    setActiveStudent,
    refresh,
  };
}
