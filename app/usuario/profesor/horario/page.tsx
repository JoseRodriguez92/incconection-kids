"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Calendar, Users, BookOpen, MapPin, HelpCircle } from "lucide-react";
import { GroupHasClassStore } from "@/Stores/GroupHasClassStore";
import { GroupClassScheduleStore } from "@/Stores/GroupClassScheduleStore";
import { TeacherEnrrolledStore } from "@/Stores/teacherEnrolledStore";
import { ProfilesStore } from "@/Stores/profilesStore";
import { MateriasStore } from "@/Stores/materiasStore";
import { GroupsStore } from "@/Stores/groupsStore";
import { ClassroomsStore } from "@/Stores/ClassroomsStore";
import { CoursesStore } from "@/Stores/coursesStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage";
import { createClient } from "@/lib/supabase/client";
import "driver.js/dist/driver.css";

export default function SchedulesManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [teacherEnrolledId, setTeacherEnrolledId] = useState<string | null>(
    null,
  );

  // Estado para el modal de crear/editar clase
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null,
  );
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // Estados para el formulario de crear/editar clase
  const [formData, setFormData] = useState({
    className: "",
    subjectId: "",
    teacherId: "",
    courseId: "",
    groupId: "",
    classroomId: "",
  });

  // Estados para manejar múltiples horarios
  const [schedules, setSchedules] = useState<
    Array<{
      id?: string; // Para edición
      dayOfWeek: string;
      startTime: string;
      endTime: string;
    }>
  >([]);

  // Estado temporal para agregar un nuevo horario
  const [tempSchedule, setTempSchedule] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });

  // Consultar los stores
  const { groupHasClasses, fetchGroupHasClasses } = GroupHasClassStore();
  const { groupClassSchedules, fetchGroupClassSchedules } =
    GroupClassScheduleStore();
  const { enrolled: teachersEnrolled, fetchEnrolled: fetchTeachersEnrolled } =
    TeacherEnrrolledStore();
  const { profiles, fetchProfiles } = ProfilesStore();
  const { materias: materiasData, fetchMaterias } = MateriasStore();
  const { groups: groupsData, fetchGroups } = GroupsStore();
  const { classrooms: classroomsData, fetchClassrooms } = ClassroomsStore();
  const { courses: coursesData, fetchCourses } = CoursesStore();
  const { periodos, fetchPeriodos } = PeriodAcademicStore();
  const { addGroupHasClass, updateGroupHasClass } = GroupHasClassStore();
  const { addGroupClassSchedule, updateGroupClassSchedule } =
    GroupClassScheduleStore();

  // useEffect para buscar en teacher_enrolled usando el id_User del perfil
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id_User = ManagmentStorage.getItem("id_User");
        if (!id_User) {
          console.warn("No se encontró id_User en el almacenamiento local");
          return;
        }

        console.log("=== BÚSQUEDA EN TEACHER_ENROLLED ===");
        console.log("id_User del perfil:", id_User);

        const supabase = createClient();

        // Buscar en teacher_enrolled usando el user_id
        const { data, error } = await supabase
          .from("teacher_enrolled")
          .select("*")
          .eq("user_id", id_User);

        if (error) {
          console.error("Error al buscar en teacher_enrolled:", error);
          return;
        }

        console.log("Datos encontrados en teacher_enrolled:", data);
        console.log("Cantidad de registros:", data?.length || 0);

        // Guardar el id de teacher_enrolled si existe
        if (data && data.length > 0) {
          setTeacherEnrolledId(data[0].id);
          console.log("teacher_enrolled_id guardado:", data[0].id);

          // Cargar automáticamente los datos del horario
          loadScheduleData();
        }
      } catch (err) {
        console.error("Error general al buscar en teacher_enrolled:", err);
      }
    };

    fetchUserData();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para cargar los datos del horario
  const loadScheduleData = async () => {
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

  // Función para agregar un horario a la lista
  const handleAddSchedule = () => {
    if (
      !tempSchedule.dayOfWeek ||
      !tempSchedule.startTime ||
      !tempSchedule.endTime
    ) {
      alert("Por favor completa todos los campos del horario");
      return;
    }

    setSchedules([...schedules, { ...tempSchedule }]);
    setTempSchedule({ dayOfWeek: "", startTime: "", endTime: "" });
  };

  // Función para eliminar un horario de la lista
  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  // Función para abrir el modal en modo edición
  const handleEditClick = (horario: any) => {
    // Llenar el formulario con los datos existentes
    const group = groupsData.find((g) => g.id === horario.group_id);

    setFormData({
      className: horario.class_name,
      subjectId: horario.subject_id || "",
      teacherId: horario.teacher_id || "",
      courseId: group?.course_id || "",
      groupId: horario.group_id || "",
      classroomId: horario.classroom_id || "",
    });

    // Cargar todos los horarios de esta clase
    const classSchedules = groupClassSchedules
      .filter((s) => s.group_class_id === horario.class_id)
      .map((s) => ({
        id: s.id,
        dayOfWeek: s.day_of_week.toString(),
        startTime: s.start_time.substring(0, 5),
        endTime: s.end_time.substring(0, 5),
      }));

    setSchedules(classSchedules);
    setEditingScheduleId(horario.id);
    setEditingClassId(horario.class_id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Función para crear o actualizar clase y horario
  const handleCreateOrUpdateClass = async () => {
    try {
      // Validar que todos los campos estén completos
      if (
        !formData.className ||
        !formData.subjectId ||
        !formData.teacherId ||
        !formData.groupId ||
        !formData.classroomId
      ) {
        alert("Por favor completa todos los campos de la clase");
        return;
      }

      // Validar que haya al menos un horario
      if (schedules.length === 0) {
        alert("Por favor agrega al menos un horario para la clase");
        return;
      }

      // Obtener el período académico activo
      const activePeriod = periodos.find((p) => p.is_active);
      if (!activePeriod) {
        alert(
          "No hay un período académico activo. Por favor activa uno primero.",
        );
        return;
      }
      const academicPeriodId = activePeriod.id;

      if (isEditing && editingClassId) {
        // MODO EDICIÓN
        // 1. Actualizar group_has_class
        await updateGroupHasClass(editingClassId, {
          name: formData.className,
          teacher_enrolled_id: formData.teacherId,
          classroom_id: formData.classroomId,
          subject_id: formData.subjectId,
          group_id: formData.groupId,
          updated_at: new Date().toISOString(),
        });

        // 2. Actualizar o crear los horarios
        for (const schedule of schedules) {
          if (schedule.id) {
            // Actualizar horario existente
            await updateGroupClassSchedule(schedule.id, {
              day_of_week: parseInt(schedule.dayOfWeek),
              start_time: schedule.startTime + ":00",
              end_time: schedule.endTime + ":00",
              classroom_id: formData.classroomId,
              updated_at: new Date().toISOString(),
            });
          } else {
            // Crear nuevo horario
            const newSchedule = {
              id: crypto.randomUUID(),
              group_class_id: editingClassId,
              day_of_week: parseInt(schedule.dayOfWeek),
              start_time: schedule.startTime + ":00",
              end_time: schedule.endTime + ":00",
              classroom_id: formData.classroomId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            await addGroupClassSchedule(newSchedule);
          }
        }

        alert("Clase actualizada exitosamente");
      } else {
        // MODO CREACIÓN
        // 1. Crear el group_has_class
        const newGroupClass = {
          id: crypto.randomUUID(),
          name: formData.className,
          teacher_enrolled_id: formData.teacherId,
          classroom_id: formData.classroomId,
          subject_id: formData.subjectId,
          group_id: formData.groupId,
          academic_period_id: academicPeriodId,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await addGroupHasClass(newGroupClass);

        // 2. Crear todos los horarios
        for (const schedule of schedules) {
          const newSchedule = {
            id: crypto.randomUUID(),
            group_class_id: newGroupClass.id,
            day_of_week: parseInt(schedule.dayOfWeek),
            start_time: schedule.startTime + ":00",
            end_time: schedule.endTime + ":00",
            classroom_id: formData.classroomId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          await addGroupClassSchedule(newSchedule);
        }

        alert("Clase creada exitosamente con múltiples horarios");
      }

      // 3. Recargar los datos
      await fetchGroupHasClasses();
      await fetchGroupClassSchedules();
      setDataLoaded(true);

      // 4. Limpiar el formulario y cerrar el modal
      setFormData({
        className: "",
        subjectId: "",
        teacherId: "",
        courseId: "",
        groupId: "",
        classroomId: "",
      });
      setSchedules([]);
      setTempSchedule({ dayOfWeek: "", startTime: "", endTime: "" });
      setIsEditing(false);
      setEditingScheduleId(null);
      setEditingClassId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar la clase:", error);
      alert("Error al guardar la clase. Por favor intenta de nuevo.");
    }
  };

  // Mapear días de la semana (solo Lunes a Viernes)
  const diasSemana = ["Día 1", "Día 2", "Día 3", "Día 4", "Día 5"];

  // Combinar horarios con detalles de clase (joins manuales)
  const schedulesWithDetails = groupClassSchedules.map((schedule) => {
    // 1. Buscar la clase (group_has_class)
    const groupClass = groupHasClasses.find(
      (ghc) => ghc.id === schedule.group_class_id,
    );

    // 2. Buscar el profesor: teacher_enrolled → profiles
    const teacher = teachersEnrolled.find(
      (t) => t.id === groupClass?.teacher_enrolled_id,
    );
    const teacherProfile = profiles.find((p) => p.id === teacher?.user_id);
    const teacherName = teacherProfile?.full_name || "Sin profesor";

    // 3. Buscar la materia
    const materia = materiasData.find((m) => m.id === groupClass?.subject_id);

    // 4. Buscar el grupo
    const group = groupsData.find((g) => g.id === groupClass?.group_id);

    // 5. Buscar el curso (a través del grupo)
    const course = coursesData.find((c) => c.id === group?.course_id);

    // 6. Buscar el aula
    const classroom = classroomsData.find(
      (c) => c.id === (schedule.classroom_id || groupClass?.classroom_id),
    );

    return {
      // Datos del horario
      id: schedule.id,
      day_of_week: schedule.day_of_week,
      dia: diasSemana[schedule.day_of_week - 1] || "Sin día",
      horaInicio: schedule.start_time,
      horaFin: schedule.end_time,

      // Datos de la clase
      class_id: groupClass?.id,
      class_name: groupClass?.name || "Sin nombre",

      // Datos del profesor
      teacher_id: groupClass?.teacher_enrolled_id,
      profesor: teacherName,

      // Datos de la materia
      subject_id: groupClass?.subject_id,
      materia: materia?.name || "Sin materia",

      // Datos del grupo
      group_id: groupClass?.group_id,
      grupo: group?.name || "Sin grupo",

      // Datos del curso
      course_id: group?.course_id,
      curso: course?.name || "Sin curso",

      // Datos del aula
      classroom_id: schedule.classroom_id || groupClass?.classroom_id,
      aula: classroom?.name || "Sin aula",
    };
  });

  // Obtener el período académico activo
  const activePeriod = periodos.find((p) => p.is_active);

  // Filtrar horarios solo del profesor actual Y del período académico activo
  const filteredHorarios = schedulesWithDetails.filter((schedule) => {
    // 1. Filtrar solo por el teacher_enrolled_id del profesor actual
    if (teacherEnrolledId && schedule.teacher_id !== teacherEnrolledId) {
      return false;
    }

    // 2. Filtrar por período académico activo
    if (activePeriod) {
      // Buscar el group_has_class para obtener el academic_period_id
      const groupClass = groupHasClasses.find(
        (ghc) => ghc.id === schedule.class_id,
      );

      // Buscar el grupo para obtener el año (academic_period_id)
      const group = groupsData.find((g) => g.id === groupClass?.group_id);

      // Verificar que el grupo pertenezca al período activo
      if (!group || group.year !== activePeriod.id) {
        return false;
      }
    }

    return true;
  });

  // Filtrar grupos según el curso seleccionado en el formulario
  const gruposFiltrados = formData.courseId
    ? groupsData.filter((g) => g.course_id === formData.courseId)
    : groupsData;

  // Generar horas del día (6 AM - 8 PM)
  const horasDelDia = Array.from({ length: 15 }, (_, i) => {
    const hora = i + 6; // Empezar en 6 AM
    return `${hora.toString().padStart(2, "0")}:00`;
  });

  // Agrupar horarios por día de la semana
  const horariosPorDia = diasSemana.map((dia, index) => {
    return {
      dia,
      dayNumber: index + 1,
      horarios: filteredHorarios.filter((h) => h.day_of_week === index + 1),
    };
  });

  // Colores para diferentes materias
  const coloresMaterias = [
    "bg-blue-100 border-blue-300 text-blue-900",
    "bg-green-100 border-green-300 text-green-900",
    "bg-purple-100 border-purple-300 text-purple-900",
    "bg-yellow-100 border-yellow-300 text-yellow-900",
    "bg-pink-100 border-pink-300 text-pink-900",
    "bg-indigo-100 border-indigo-300 text-indigo-900",
    "bg-orange-100 border-orange-300 text-orange-900",
    "bg-teal-100 border-teal-300 text-teal-900",
  ];

  // Asignar color a cada materia
  const getColorForSubject = (subjectId: string | undefined) => {
    if (!subjectId) return coloresMaterias[0];
    const index =
      [...new Set(schedulesWithDetails.map((h) => h.subject_id))].indexOf(
        subjectId,
      ) % coloresMaterias.length;
    return coloresMaterias[index];
  };

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    const hasSchedules = filteredHorarios.length > 0;

    const steps: any[] = [
      {
        element: "#tour-horario-header",
        popover: {
          title: "🗓️ Gestión de Horarios",
          description:
            "Aquí puedes visualizar tu horario semanal completo. Solo se muestran las clases del período académico activo que tienes asignadas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-horario-periodo",
        popover: {
          title: "📅 Período académico activo",
          description:
            "Este badge indica el período académico activo. Tu horario se filtra automáticamente para mostrar solo las clases de este período.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-horario-vista",
        popover: {
          title: "🔀 Cambiar vista",
          description:
            "Puedes ver tu horario en dos formatos: «Calendario Semanal» muestra una cuadrícula con bloques de color por hora, y «Lista de Horarios» agrupa las clases por día de forma más compacta.",
          side: "bottom",
        },
      },
    ];

    if (hasSchedules) {
      steps.push(
        {
          element: "#tour-horario-calendario",
          popover: {
            title: "📆 Vista de calendario",
            description:
              "Cada bloque de color representa una clase: muestra la materia, el curso, el grupo, el horario y el aula. Los colores se asignan automáticamente por materia para diferenciarlas fácilmente.",
            side: "top",
          },
        },
        {
          element: "#tour-horario-lista",
          popover: {
            title: "📋 Vista de lista",
            description:
              "Las clases se agrupan por día de la semana. Cada tarjeta muestra la materia, el profesor, el grupo, el curso y el aula. Haz clic en cualquier tarjeta para ver más detalles.",
            side: "top",
          },
        },
      );
    }

    steps.push({
      element: "#tour-horario-boton",
      popover: {
        title: "❓ Tour de ayuda",
        description: "Puedes relanzar este recorrido en cualquier momento haciendo clic aquí.",
        side: "bottom",
        align: "end",
      },
    });

    const driverObj = driver({
      animate: true,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "¡Entendido!",
      progressText: "{{current}} de {{total}}",
      steps,
    });
    driverObj.drive();
  }, [filteredHorarios]);

  // // Debug: Ver qué datos están llegando
  // useEffect(() => {
  //   console.log("=== DEBUG HORARIOS ===");
  //   console.log("groupHasClasses:", groupHasClasses);
  //   console.log("groupClassSchedules:", groupClassSchedules);
  //   console.log("teachersEnrolled:", teachersEnrolled);
  //   console.log("profiles:", profiles);
  //   console.log("materiasData:", materiasData);
  //   console.log("groupsData:", groupsData);
  //   console.log("classroomsData:", classroomsData);
  //   console.log("schedulesWithDetails:", schedulesWithDetails);
  // }, [
  //   groupHasClasses,
  //   groupClassSchedules,
  //   teachersEnrolled,
  //   profiles,
  //   materiasData,
  //   groupsData,
  //   classroomsData,
  // ]);

  return (
    <div className="space-y-6 p-4 md:p-8 min-w-0 w-full pb-20">
      <div id="tour-horario-header" className="space-y-2 relative z-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Gestión de Horarios
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-muted-foreground">
                Horarios de tus clases del período actual
              </p>
              {activePeriod && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge id="tour-horario-periodo" className="text-sm bg-green-600 hover:bg-green-700 text-white cursor-default">
                    <span className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-100"></span>
                      </span>
                      📅 {activePeriod.name}
                    </span>
                  </Badge>
                </>
              )}
            </div>
          </div>

          <Button
            id="tour-horario-boton"
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={startTour}
          >
            <HelpCircle className="w-4 h-4" />
            Tour de la sección
          </Button>
        </div>
      </div>

      {/* Botones para cambiar vista */}
      <Card id="tour-horario-vista">
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              Vista:
            </span>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Calendario Semanal
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Lista de Horarios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendario semanal */}
      {viewMode === "calendar" && (
        <Card id="tour-horario-calendario">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Horario Semanal</span>
              <Badge variant="secondary" className="ml-2">
                Vista de Calendario
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!dataLoaded ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  Cargando tu horario...
                </p>
                <p className="text-sm">
                  Por favor espera mientras cargamos tus horarios
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-2 min-w-[800px]">
                  {/* Columna de horas */}
                  <div className="col-span-1">
                    <div className="h-12 flex items-center justify-center font-semibold text-sm bg-muted rounded">
                      Hora
                    </div>
                    {horasDelDia.map((hora) => (
                      <div
                        key={hora}
                        className="h-20 flex items-center justify-center text-sm font-medium text-muted-foreground border-t"
                      >
                        {hora}
                      </div>
                    ))}
                  </div>

                  {/* Columnas de días */}
                  {horariosPorDia.map((diaData) => (
                    <div key={diaData.dia} className="col-span-1 relative">
                      {/* Encabezado del día */}
                      <div className="h-12 flex items-center justify-center font-semibold text-sm bg-muted rounded mb-2">
                        {diaData.dia}
                      </div>

                      {/* Grid de horas */}
                      <div className="relative">
                        {horasDelDia.map((hora) => (
                          <div
                            key={hora}
                            className="h-20 border-t border-border/50"
                          />
                        ))}

                        {/* Bloques de horarios posicionados absolutamente */}
                        {diaData.horarios.map((horario) => {
                          const startHour = parseInt(
                            horario.horaInicio.split(":")[0],
                          );
                          const startMinute = parseInt(
                            horario.horaInicio.split(":")[1],
                          );
                          const endHour = parseInt(
                            horario.horaFin.split(":")[0],
                          );
                          const endMinute = parseInt(
                            horario.horaFin.split(":")[1],
                          );

                          // Calcular posición y altura
                          const topPosition =
                            (startHour - 6) * 80 + (startMinute / 60) * 80;
                          const duration =
                            (endHour - startHour) * 60 +
                            (endMinute - startMinute);
                          const height = (duration / 60) * 80;

                          const colorClass = getColorForSubject(
                            horario.subject_id,
                          );

                          return (
                            <div
                              key={horario.id}
                              className={`absolute left-0 right-0 mx-1 rounded-lg border-2 p-2 ${colorClass} overflow-hidden cursor-pointer hover:opacity-80 transition-opacity`}
                              style={{
                                top: `${topPosition}px`,
                                height: `${height}px`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(horario);
                              }}
                            >
                              <div className="text-xs font-semibold truncate">
                                {horario.materia} - {horario.curso}{" "}
                                {horario.grupo}
                              </div>
                              <div className="text-xs truncate">
                                {horario.horaInicio.substring(0, 5)} -{" "}
                                {horario.horaFin.substring(0, 5)} |{" "}
                                {horario.profesor}
                              </div>
                              <div className="text-xs truncate opacity-70">
                                {horario.aula}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de horarios */}
      {viewMode === "list" && (
        <Card id="tour-horario-lista">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Lista de Horarios</span>
              {dataLoaded && (
                <Badge variant="secondary" className="ml-2">
                  {filteredHorarios.length} horarios
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!dataLoaded ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  Cargando tu horario...
                </p>
                <p className="text-sm">
                  Por favor espera mientras cargamos tus horarios
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredHorarios.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tienes horarios asignados.
                  </div>
                ) : (
                  <>
                    {/* Agrupar horarios por día */}
                    {horariosPorDia.map((diaData) => {
                      // Filtrar solo los horarios que corresponden a este día
                      const horariosDelDia = filteredHorarios.filter(
                        (h) => h.day_of_week === diaData.dayNumber,
                      );

                      // Solo mostrar el día si tiene horarios
                      if (horariosDelDia.length === 0) return null;

                      return (
                        <div key={diaData.dia} className="space-y-3">
                          {/* Encabezado del día */}
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">
                              {diaData.dia}
                            </h3>
                            <Badge variant="secondary" className="ml-2">
                              {horariosDelDia.length}{" "}
                              {horariosDelDia.length === 1 ? "clase" : "clases"}
                            </Badge>
                          </div>

                          {/* Horarios del día */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {horariosDelDia.map((horario) => (
                              <Card
                                key={horario.id}
                                className="border border-border cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleEditClick(horario)}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {horario.dia}
                                      </Badge>
                                      <span className="text-sm font-medium text-blue-600">
                                        {horario.horaInicio} - {horario.horaFin}
                                      </span>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2 text-sm">
                                        <BookOpen className="w-4 h-4 text-green-500" />
                                        <span className="font-medium">
                                          {horario.materia}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-2 text-sm">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <span>{horario.profesor}</span>
                                      </div>

                                      <div className="flex items-center space-x-2 text-sm">
                                        <Users className="w-4 h-4 text-purple-500" />
                                        <span>
                                          {horario.curso} - {horario.grupo}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-2 text-sm">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        <span>{horario.aula}</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
