import { useState, useEffect } from "react";
import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage";
import { createClient } from "@/lib/supabase/client";
import type { Curso } from "../types";
import { DIAS_SEMANA } from "../constants";

export function useCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);

        // 1. Obtener el id_User del storage
        const id_User = ManagmentStorage.getItem("id_User");
        if (!id_User) {
          console.warn("No se encontró id_User en el storage");
          setLoading(false);
          return;
        }

        // 2. Crear cliente de Supabase
        const supabase = createClient();

        // 3. Consultar teacher_enrolled para obtener el teacher_enrolled_id
        const { data: teacherEnrolled, error: teacherError } = await supabase
          .from("teacher_enrolled")
          .select("id")
          .eq("user_id", id_User)
          .maybeSingle();

        if (teacherError) {
          console.error("Error al obtener teacher_enrolled:", teacherError);
          setError(teacherError);
          setLoading(false);
          return;
        }

        if (!teacherEnrolled) {
          console.warn("No se encontró teacher_enrolled para este usuario");
          setLoading(false);
          return;
        }

        // 4. Consultar group_has_class con el teacher_enrolled_id y obtener group_id
        const { data: cursos, error: cursosError } = await supabase
          .from("group_has_class")
          .select(
            `
            *,
            subject:subject_id (
              id,
              name,
              description
            ),
            group:group_id (
              id,
              name,
              course_id,
              max_students,
              created_at,
              updated_at,
              director_id,
              course:course_id (
                id,
                name,
                code,
                description,
                education_level,
                grade_number,
                max_students
              ),
              academic_period:year (
                id,
                name,
                description,
                start_date,
                end_date,
                is_active
              )
            ),
            classroom:classroom_id (
              id,
              name,
              capacity,
              location,
              room_type,
              equipment,
              status
            ),
            group_class_schedule!group_class_schedule_group_class_id_fkey (
              id,
              day_of_week,
              start_time,
              end_time
            )
          `
          )
          .eq("teacher_enrolled_id", teacherEnrolled.id)
          .eq("is_active", true);

        if (cursosError) {
          console.error("Error al obtener cursos:", cursosError);
          setError(cursosError);
          setLoading(false);
          return;
        }

        // 5. Filtrar por periodo académico activo
        const cursosActivos = cursos?.filter((curso: any) =>
          curso.group?.academic_period?.is_active === true
        ) || [];

        // 5b. Deduplicar por subject_id + group_id.
        // Pueden existir varios registros group_has_class con la misma combinación
        // (asignaciones duplicadas en BD). Mostramos solo el primero.
        const seenKeys = new Set<string>();
        const cursosFiltrados = cursosActivos.filter((curso: any) => {
          const key = `${curso.subject_id ?? ""}__${curso.group_id ?? ""}`;
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });

        // 6. Obtener todos los group_ids únicos de los cursos filtrados
        const groupIds = [
          ...new Set(cursosFiltrados?.map((curso: any) => curso.group_id)),
        ];

        // 7. Consultar todos los estudiantes de todos los grupos filtrados
        const estudiantesPorGrupo: Record<string, any[]> = {};

        for (const groupId of groupIds) {
          const { data: estudiantesGrupo, error: estudiantesError } =
            await supabase
              .from("group_has_students")
              .select(
                `
                id,
                student_enrolled_id,
                group_id,
                student_enrolled:student_enrolled_id (
                  id,
                  user_id,
                  profiles:user_id (
                    id,
                    full_name,
                    email,
                    avatar_url
                  )
                )
              `
              )
              .eq("group_id", groupId);

          if (estudiantesError) {
            console.error(
              "Error al obtener estudiantes del grupo:",
              estudiantesError
            );
          } else {
            estudiantesPorGrupo[groupId] = estudiantesGrupo || [];
          }
        }

        // 7b. Recolectar todos los user_id de estudiantes para cargar sus condiciones en una sola query
        const allUserIds = Object.values(estudiantesPorGrupo)
          .flat()
          .map((est: any) => est.student_enrolled?.user_id)
          .filter(Boolean) as string[];

        const conditionsByProfileId: Record<string, any[]> = {};

        if (allUserIds.length > 0) {
          const { data: conditionsData } = await supabase
            .from("profile_has_learning_condition")
            .select("profile_id, learning_condition:learning_condition_id(id, name, color)")
            .in("profile_id", allUserIds);

          for (const row of conditionsData || []) {
            const pid = (row as any).profile_id;
            if (!conditionsByProfileId[pid]) conditionsByProfileId[pid] = [];
            const lc = (row as any).learning_condition;
            if (lc) conditionsByProfileId[pid].push(lc);
          }
        }

        // 8. Transformar los datos al formato esperado por el UI con los estudiantes incluidos
        const cursosFormateados =
          cursosFiltrados?.map((curso: any) => {
            const estudiantesDelGrupo =
              estudiantesPorGrupo[curso.group_id] || [];

            // Formatear horario desde group_class_schedule
            const formatearHorario = (schedules: any[]) => {
              if (!schedules || schedules.length === 0) {
                return "Horario no disponible";
              }

              return schedules
                .map((schedule: any) => {
                  const dia = DIAS_SEMANA[schedule.day_of_week] || "N/A";
                  const inicio = schedule.start_time || "N/A";
                  const fin = schedule.end_time || "N/A";
                  return `${dia} ${inicio}-${fin}`;
                })
                .join(", ");
            };

            return {
              // Campos originales del group_has_class
              id: curso.id,
              name: curso.name,
              subject_id: curso.subject_id,
              classroom_id: curso.classroom_id,
              teacher_enrolled_id: curso.teacher_enrolled_id,
              is_active: curso.is_active,
              created_at: curso.created_at,
              updated_at: curso.updated_at,
              group_id: curso.group_id,

              // Relaciones completas
              subject: curso.subject,
              group: curso.group,
              course: curso.group?.course,
              classroom: curso.classroom,
              academic_period: curso.group?.academic_period,
              group_class_schedule: curso.group_class_schedule,

              // Campos formateados para la UI
              nombre: curso.name || curso.subject?.name || "Sin nombre",
              estudiantes: estudiantesDelGrupo.map((est: any) => {
                const userId = est.student_enrolled?.user_id;
                return {
                  id: est.student_enrolled?.id,
                  ghs_id: est.id,
                  user_id: userId,
                  full_name: est.student_enrolled?.profiles?.full_name || "Sin nombre",
                  email: est.student_enrolled?.profiles?.email || "Sin email",
                  avatar_url: est.student_enrolled?.profiles?.avatar_url || null,
                  conditions: conditionsByProfileId[userId] || [],
                };
              }),
              cantidadEstudiantes: estudiantesDelGrupo.length,
              maxEstudiantes: curso.group?.max_students || 0,
              grupo: curso.group?.name || "N/A",
              curso_nombre: curso.group?.course?.name || "N/A",
              curso_codigo: curso.group?.course?.code || "N/A",
              nivel_educativo: curso.group?.course?.education_level || "N/A",
              grado: curso.group?.course?.grade_number || "N/A",
              periodo_academico: curso.group?.academic_period?.name || "N/A",
              periodo_activo: curso.group?.academic_period?.is_active || false,
              periodo_fecha_inicio: curso.group?.academic_period?.start_date || null,
              periodo_fecha_fin: curso.group?.academic_period?.end_date || null,
              aula_capacidad: curso.classroom?.capacity || 0,
              aula_ubicacion: curso.classroom?.location || "N/A",
              aula_tipo: curso.classroom?.room_type || "N/A",
              aula_equipamiento: curso.classroom?.equipment || [],
              horario: formatearHorario(curso.group_class_schedule),
              descripcion: curso.subject?.description || "Curso del semestre actual",
            };
          }) || [];

        console.log("Cursos formateados con estudiantes:", cursosFormateados);
        setCursos(cursosFormateados);
        setLoading(false);
      } catch (err) {
        console.error("Error general al recuperar cursos:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  return { cursos, loading, error };
}
