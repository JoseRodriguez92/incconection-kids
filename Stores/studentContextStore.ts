"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AcademicPeriod =
  Database["public"]["Tables"]["academic_period"]["Row"];
export type StudentEnrolled =
  Database["public"]["Tables"]["student_enrolled"]["Row"];
export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];

type StudentContextState = {
  // Datos del estudiante
  profile: Profile | null;
  parents: Profile[];

  // Periodo académico activo (is_active = true)
  activePeriod: AcademicPeriod | null;

  // Matrícula activa del estudiante en el periodo
  enrollment: StudentEnrolled | null;

  // Grupo al que pertenece en su matrícula activa
  group: Group | null;

  // ID de la fila group_has_students (usado como student_enrolled_id en submissions)
  groupStudentId: string | null;

  // Curso al que corresponde el grupo
  course: Course | null;

  // Director del grupo
  director: Profile | null;

  loading: boolean;
  error: string | null;

  load: (userId: string) => Promise<void>;
  clear: () => void;
};

export const useStudentContextStore = create<StudentContextState>()(
  persist(
    (set) => ({
      profile: null,
      parents: [],
      activePeriod: null,
      enrollment: null,
      group: null,
      groupStudentId: null,
      course: null,
      director: null,
      loading: false,
      error: null,

      load: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          const supabase = createClient();

          // ── 1. Perfil del estudiante ──────────────────────────────────
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (profileError) throw profileError;

          // ── 2. Padres ─────────────────────────────────────────────────
          const { data: parentRelations, error: relError } = await supabase
            .from("parent_has_student")
            .select("parent_id")
            .eq("student_id", userId);

          if (relError) throw relError;

          const parentIds = (parentRelations ?? [])
            .map((r) => r.parent_id)
            .filter(Boolean) as string[];

          let parents: Profile[] = [];
          if (parentIds.length > 0) {
            const { data: parentProfiles } = await supabase
              .from("profiles")
              .select("*")
              .in("id", parentIds);
            parents = parentProfiles ?? [];
          }

          // ── 3. Periodo académico activo ───────────────────────────────
          const { data: activePeriod } = await supabase
            .from("academic_period")
            .select("*")
            .eq("is_active", true)
            .maybeSingle();

          // ── 4. Matrícula del estudiante ───────────────────────────────
          // Intentamos primero con el periodo activo; si no hay resultado
          // (el admin creó la matrícula sin periodo o con uno diferente)
          // usamos cualquier matrícula del estudiante.
          let enrollment: StudentEnrolled | null = null;

          if (activePeriod) {
            const { data: enrollmentWithPeriod } = await supabase
              .from("student_enrolled")
              .select("*")
              .eq("user_id", userId)
              .eq("academic_period_id", activePeriod.id)
              .maybeSingle();
            enrollment = enrollmentWithPeriod ?? null;
          }

          if (!enrollment) {
            const { data: fallbackEnrollment } = await supabase
              .from("student_enrolled")
              .select("*")
              .eq("user_id", userId)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            enrollment = fallbackEnrollment ?? null;
          }

          console.log("[StudentContext] activePeriod:", activePeriod?.id);
          console.log("[StudentContext] enrollment:", enrollment?.id, "| academic_period_id:", enrollment?.academic_period_id);

          // ── 5. Grupo del estudiante (vía group_has_students) ──────────
          let group: Group | null = null;
          let groupStudentId: string | null = null;
          let course: Course | null = null;
          let director: Profile | null = null;

          if (enrollment) {
            const { data: groupRelations, error: ghrError } = await supabase
              .from("group_has_students")
              .select("id, group_id")
              .eq("student_enrolled_id", enrollment.id);

            console.log("[StudentContext] group_has_students rows:", groupRelations, "| error:", ghrError);

            const groupRelation = groupRelations?.[0] ?? null;

            groupStudentId = groupRelation?.id ?? null;

            if (groupRelation?.group_id) {
              // ── 6. Datos del grupo ──────────────────────────────────
              const { data: groupData } = await supabase
                .from("groups")
                .select("*")
                .eq("id", groupRelation.group_id)
                .single();

              group = groupData ?? null;

              // ── 7. Curso del grupo ──────────────────────────────────
              if (groupData?.course_id) {
                const { data: courseData } = await supabase
                  .from("courses")
                  .select("*")
                  .eq("id", groupData.course_id)
                  .single();

                course = courseData ?? null;
              }

              // ── 8. Director del grupo ───────────────────────────────
              if (groupData?.director_id) {
                const { data: directorData } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", groupData.director_id)
                  .single();

                director = directorData ?? null;
              }
            }
          }

          set({
            profile,
            parents,
            activePeriod: activePeriod ?? null,
            enrollment: enrollment ?? null,
            group,
            groupStudentId,
            course,
            director,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Error desconocido";
          set({ error: message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () =>
        set({
          profile: null,
          parents: [],
          activePeriod: null,
          enrollment: null,
          group: null,
          groupStudentId: null,
          course: null,
          director: null,
          error: null,
        }),
    }),
    {
      name: "student-context-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        parents: state.parents,
        activePeriod: state.activePeriod,
        enrollment: state.enrollment,
        group: state.group,
        groupStudentId: state.groupStudentId,
        course: state.course,
        director: state.director,
      }),
      version: 1,
    }
  )
);
