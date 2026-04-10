import { useState, useEffect } from "react";
import { useStudentContextStore } from "@/Stores/studentContextStore";
import { createClient } from "@/lib/supabase/client";

export type ActividadEstudiante = {
  id: string;
  title: string;
  description: string | null;
  limit_date: string | null;
  is_active: boolean;
  grade_percentage: number | null;
  target_condition_id: string | null;
  subjectName: string | null;
  group_has_class_id: string;
};

export function useActividadesEstudiante() {
  const { profile, group } = useStudentContextStore();
  const [actividades, setActividades] = useState<ActividadEstudiante[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!group?.id || !profile?.id) {
      setActividades([]);
      return;
    }

    const fetchActividades = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        // 1. Condiciones de aprendizaje del estudiante
        const { data: condData } = await supabase
          .from("profile_has_learning_condition")
          .select("learning_condition_id")
          .eq("profile_id", profile.id);

        const studentConditionIds = new Set(
          (condData ?? []).map((c) => c.learning_condition_id),
        );

        // 2. Clases activas del grupo del estudiante
        const { data: classes } = await supabase
          .from("group_has_class")
          .select("id, subject:subject_id(name)")
          .eq("group_id", group.id)
          .eq("is_active", true);

        if (!classes || classes.length === 0) {
          setActividades([]);
          return;
        }

        const classIds = classes.map((c) => c.id);
        const classSubjectMap: Record<string, string | null> = {};
        for (const c of classes) {
          classSubjectMap[c.id] = (c.subject as { name: string } | null)?.name ?? null;
        }

        // 3. Actividades de esas clases (activas, ordenadas por fecha límite)
        const { data: actData } = await supabase
          .from("group_has_activity")
          .select(
            "id, title, description, limit_date, is_active, grade_percentage, target_condition_id, group_has_class_id",
          )
          .in("group_has_class_id", classIds)
          .eq("is_active", true)
          .order("limit_date", { ascending: true });

        if (!actData) {
          setActividades([]);
          return;
        }

        // 4. Filtrar según condiciones del estudiante:
        // - Sin condición propia → solo actividades generales (sin target_condition_id)
        // - Con condición propia → solo actividades que apuntan a esa condición
        const filtered = actData.filter((a) => {
          if (!a.target_condition_id) {
            return studentConditionIds.size === 0;
          }
          return studentConditionIds.has(a.target_condition_id);
        });

        setActividades(
          filtered.map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            limit_date: a.limit_date,
            is_active: a.is_active,
            grade_percentage: a.grade_percentage,
            target_condition_id: a.target_condition_id,
            subjectName: classSubjectMap[a.group_has_class_id] ?? null,
            group_has_class_id: a.group_has_class_id,
          })),
        );
      } catch (err) {
        console.error("[useActividadesEstudiante] Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActividades();
  }, [group?.id, profile?.id]);

  return { actividades, loading };
}
