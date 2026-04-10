"use client";

import { createClient } from "@/lib/supabase/client";

export type FinalGradeEditParams = {
  enrolledId: string;
  groupHasClassId: string;
  academicPeriodId: string;
  grade: number;
};

export function useFinalGradeEditor(onSuccess?: () => void) {
  const save = async ({ enrolledId, groupHasClassId, academicPeriodId, grade }: FinalGradeEditParams) => {
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("student_final_grade")
      .select("id")
      .eq("student_enrolled_id", enrolledId)
      .eq("group_has_class_id", groupHasClassId)
      .eq("academic_period_id", academicPeriodId)
      .maybeSingle();

    let error;

    if (existing?.id) {
      ({ error } = await supabase
        .from("student_final_grade")
        .update({ final_grade: grade })
        .eq("id", existing.id));
    } else {
      ({ error } = await supabase
        .from("student_final_grade")
        .insert({
          student_enrolled_id: enrolledId,
          group_has_class_id: groupHasClassId,
          academic_period_id: academicPeriodId,
          final_grade: grade,
        }));
    }

    if (error) throw error;
    onSuccess?.();
  };

  return { save };
}
