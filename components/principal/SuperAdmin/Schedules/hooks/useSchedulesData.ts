"use client";

import { useState, useEffect, useMemo } from "react";
import { GroupHasClassStore } from "@/Stores/GroupHasClassStore";
import { GroupClassScheduleStore } from "@/Stores/GroupClassScheduleStore";
import { TeacherEnrrolledStore } from "@/Stores/teacherEnrolledStore";
import { ProfilesStore } from "@/Stores/profilesStore";
import { MateriasStore } from "@/Stores/materiasStore";
import { GroupsStore } from "@/Stores/groupsStore";
import { ClassroomsStore } from "@/Stores/ClassroomsStore";
import { CoursesStore } from "@/Stores/coursesStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { DIAS_SEMANA, COLORES_MATERIAS } from "../constants";
import type { ScheduleWithDetails, DayWithSchedules } from "../types";

export function useSchedulesData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfesor, setSelectedProfesor] = useState("Todos los profesores");
  const [selectedMateria, setSelectedMateria] = useState("Todas las materias");
  const [selectedDia, setSelectedDia] = useState("Todos los días");
  const [selectedCurso, setSelectedCurso] = useState("Todos los cursos");
  const [selectedGrupo, setSelectedGrupo] = useState("Todos los grupos");
  const [selectedPeriodo, setSelectedPeriodo] = useState("Todos los periodos");
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { groupHasClasses, fetchGroupHasClasses } = GroupHasClassStore();
  const { groupClassSchedules, fetchGroupClassSchedules } = GroupClassScheduleStore();
  const { enrolled: teachersEnrolled, fetchEnrolled: fetchTeachersEnrolled } = TeacherEnrrolledStore();
  const { profiles, fetchProfiles } = ProfilesStore();
  const { materias: materiasData, fetchMaterias } = MateriasStore();
  const { groups: groupsData, fetchGroups } = GroupsStore();
  const { classrooms: classroomsData, fetchClassrooms } = ClassroomsStore();
  const { courses: coursesData, fetchCourses } = CoursesStore();
  const { periodos: periodosData, fetchPeriodos } = PeriodAcademicStore();

  useEffect(() => {
    fetchMaterias();
    fetchCourses();
    fetchClassrooms();
    fetchPeriodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (periodosData.length > 0 && selectedPeriodo === "Todos los periodos") {
      const active = periodosData.find((p) => p.is_active === true);
      if (active) setSelectedPeriodo(active.id);
    }
  }, [periodosData, selectedPeriodo]);

  const schedulesWithDetails = useMemo<ScheduleWithDetails[]>(() => {
    return groupClassSchedules.map((schedule) => {
      const groupClass = groupHasClasses.find((ghc) => ghc.id === schedule.group_class_id);
      const teacher = teachersEnrolled.find((t) => t.id === groupClass?.teacher_enrolled_id);
      const teacherProfile = profiles.find((p) => p.id === teacher?.user_id);
      const materia = materiasData.find((m) => m.id === groupClass?.subject_id);
      const group = groupsData.find((g) => g.id === groupClass?.group_id);
      const course = coursesData.find((c) => c.id === group?.course_id);
      const classroom = classroomsData.find(
        (c) => c.id === (schedule.classroom_id || groupClass?.classroom_id),
      );

      return {
        id: schedule.id,
        day_of_week: schedule.day_of_week,
        dia: DIAS_SEMANA[schedule.day_of_week - 1] || "Sin día",
        horaInicio: schedule.start_time,
        horaFin: schedule.end_time,
        class_id: groupClass?.id,
        class_name: groupClass?.name || "Sin nombre",
        teacher_id: groupClass?.teacher_enrolled_id,
        profesor: teacherProfile?.full_name || "Sin profesor",
        subject_id: groupClass?.subject_id,
        materia: materia?.name || "Sin materia",
        group_id: groupClass?.group_id,
        grupo: group?.name || "Sin grupo",
        course_id: group?.course_id,
        curso: course?.name || "Sin curso",
        classroom_id: schedule.classroom_id || groupClass?.classroom_id,
        aula: classroom?.name || "Sin aula",
      };
    });
  }, [
    groupClassSchedules,
    groupHasClasses,
    teachersEnrolled,
    profiles,
    materiasData,
    groupsData,
    coursesData,
    classroomsData,
  ]);

  const filteredHorarios = useMemo(() => {
    return schedulesWithDetails.filter((s) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const hit =
          s.class_name.toLowerCase().includes(q) ||
          s.profesor.toLowerCase().includes(q) ||
          s.materia.toLowerCase().includes(q) ||
          s.curso.toLowerCase().includes(q) ||
          s.grupo.toLowerCase().includes(q) ||
          s.aula.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (selectedProfesor !== "Todos los profesores" && s.profesor !== selectedProfesor) return false;
      if (selectedMateria !== "Todas las materias" && s.materia !== selectedMateria) return false;
      if (selectedDia !== "Todos los días" && s.dia !== selectedDia) return false;
      if (selectedCurso !== "Todos los cursos" && s.curso !== selectedCurso) return false;
      if (selectedGrupo !== "Todos los grupos" && s.grupo !== selectedGrupo) return false;
      if (selectedPeriodo !== "Todos los periodos") {
        const group = groupsData.find((g) => g.id === s.group_id);
        if (!group || group.year !== selectedPeriodo) return false;
      }
      return true;
    });
  }, [
    schedulesWithDetails,
    searchTerm,
    selectedProfesor,
    selectedMateria,
    selectedDia,
    selectedCurso,
    selectedGrupo,
    selectedPeriodo,
    groupsData,
  ]);

  const horariosPorDia = useMemo<DayWithSchedules[]>(() => {
    return DIAS_SEMANA.map((dia, index) => ({
      dia,
      dayNumber: index + 1,
      horarios: filteredHorarios.filter((h) => h.day_of_week === index + 1),
    }));
  }, [filteredHorarios]);

  const profesoresList = useMemo(
    () => [...new Set(schedulesWithDetails.map((h) => h.profesor))].filter((p) => p !== "Sin profesor"),
    [schedulesWithDetails],
  );

  const materias = useMemo(
    () => [...new Set(schedulesWithDetails.map((h) => h.materia))].filter((m) => m !== "Sin materia"),
    [schedulesWithDetails],
  );

  const cursos = useMemo(
    () => [...new Set(schedulesWithDetails.map((h) => h.curso))].filter((c) => c !== "Sin curso"),
    [schedulesWithDetails],
  );

  const grupos = useMemo(
    () => [...new Set(schedulesWithDetails.map((h) => h.grupo))].filter((g) => g !== "Sin grupo"),
    [schedulesWithDetails],
  );

  const getColorForSubject = (subjectId: string | undefined) => {
    if (!subjectId) return COLORES_MATERIAS[0];
    const uniqueIds = [...new Set(schedulesWithDetails.map((h) => h.subject_id))];
    const index = uniqueIds.indexOf(subjectId) % COLORES_MATERIAS.length;
    return COLORES_MATERIAS[index];
  };

  const handleFilterClick = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchGroupHasClasses(),
        fetchGroupClassSchedules(),
        fetchTeachersEnrolled(),
        fetchProfiles(),
        fetchMaterias(),
        fetchGroups(),
        fetchClassrooms(),
        fetchCourses(),
        fetchPeriodos(),
      ]);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      alert("Error al cargar los datos. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Store data (needed by form hook and modal)
    teachersEnrolled,
    profiles,
    materiasData,
    groupsData,
    classroomsData,
    coursesData,
    periodosData,
    // Filter state
    searchTerm, setSearchTerm,
    selectedProfesor, setSelectedProfesor,
    selectedMateria, setSelectedMateria,
    selectedDia, setSelectedDia,
    selectedCurso, setSelectedCurso,
    selectedGrupo, setSelectedGrupo,
    selectedPeriodo, setSelectedPeriodo,
    // Derived data
    schedulesWithDetails,
    filteredHorarios,
    horariosPorDia,
    profesoresList,
    materias,
    cursos,
    grupos,
    getColorForSubject,
    // Loading
    isLoading,
    dataLoaded,
    setDataLoaded,
    handleFilterClick,
  };
}
