"use client";

import { createClient } from "@/lib/supabase/client";

export type GradeEditParams = {
  enrolledId: string;
  groupHasClassId: string;
  cycleId: string;
  grade: number;
};

export function useGradeEditor(onSuccess?: () => void) {
  const save = async ({ enrolledId, groupHasClassId, cycleId, grade }: GradeEditParams) => {
    const supabase = createClient();

    // Verificar si ya existe el registro
    const { data: existing } = await supabase
      .from("student_cycle_grade")
      .select("id")
      .eq("student_enrolled_id", enrolledId)
      .eq("group_has_class_id", groupHasClassId)
      .eq("academic_period_has_cycle_id", cycleId)
      .maybeSingle();

    let error;

    if (existing?.id) {
      // Actualizar registro existente
      ({ error } = await supabase
        .from("student_cycle_grade")
        .update({ grade })
        .eq("id", existing.id));
    } else {
      // Crear nuevo registro
      ({ error } = await supabase
        .from("student_cycle_grade")
        .insert({
          student_enrolled_id: enrolledId,
          group_has_class_id: groupHasClassId,
          academic_period_has_cycle_id: cycleId,
          grade,
        }));
    }

    if (error) throw error;
    onSuccess?.();
  };

  return { save };
}
