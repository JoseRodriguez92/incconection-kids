import { useState, useEffect } from "react";
import { useStudentContextStore } from "@/Stores/studentContextStore";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

export type ClaseEstudiante = Database["public"]["Tables"]["group_has_class"]["Row"] & {
  subject: { id: string; name: string; code: string | null } | null;
  teacher_enrolled: {
    profiles: { full_name: string; avatar_url: string | null } | null;
  } | null;
  group_class_schedule: Array<{
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
  classroom: {
    id: string;
    name: string;
    capacity: number | null;
    location: string | null;
  } | null;
};

export function useClasesEstudiante() {
  const { group } = useStudentContextStore();
  const [clases, setClases] = useState<ClaseEstudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!group?.id) {
      setClases([]);
      return;
    }

    const fetchClases = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("group_has_class")
          .select(`
            *,
            subject:subject_id (id, name, code),
            teacher_enrolled:teacher_enrolled_id (
              profiles:user_id (full_name, avatar_url)
            ),
            group_class_schedule!group_class_schedule_group_class_id_fkey (
              id, day_of_week, start_time, end_time
            ),
            classroom:classroom_id (id, name, capacity, location)
          `)
          .eq("group_id", group.id)
          .eq("is_active", true);

        if (fetchError) throw fetchError;

        // Deduplicar: primero por subject_id (misma materia duplicada en DB),
        // luego por id (duplicados por join)
        const seenSubjects = new Set<string>();
        const unique = ((data as ClaseEstudiante[]) ?? []).filter((c) => {
          const key = c.subject_id ?? c.id;
          if (seenSubjects.has(key)) return false;
          seenSubjects.add(key);
          return true;
        });
        setClases(unique);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchClases();
  }, [group?.id]);

  return { clases, loading, error };
}
