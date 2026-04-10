"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCheck, Filter, Loader2, Eye } from "lucide-react";
import type { Curso } from "../../types";
import { useEffect, useState } from "react";
import { GroupClassSessionStore } from "@/Stores/groupClassSessionStore";
import { StudentAttendanceStore } from "@/Stores/studentAttendanceStore";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const supabase = createClient();

interface StudentWithAttendance {
  id: string; // group_has_students.id
  student_enrolled_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  attendance_id?: string;
  status?: string;
  minutes_late?: number;
  observation?: string;
}

interface ModalAsistenciaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curso: Curso | null;
  cycleId?: string;
}

export function ModalAsistencia({
  open,
  onOpenChange,
  curso,
  cycleId,
}: ModalAsistenciaProps) {
  const { toast } = useToast();
  const [fechaAsistencia, setFechaAsistencia] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [filtroFecha, setFiltroFecha] = useState("");
  const [estudiantes, setEstudiantes] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionStatus, setSessionStatus] = useState<string>("scheduled");
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [viewMode, setViewMode] = useState(false); // true = ver, false = editar
  const [sessionsWithAttendance, setSessionsWithAttendance] = useState<Set<string>>(new Set());

  // Limpiar pointer-events del body cuando el modal se cierra
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.removeProperty("pointer-events");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const {
    fetchSessionByDateAndGroupClass,
    addSession,
    fetchSessionsByGroupClassId,
  } = GroupClassSessionStore();
  const { fetchAttendancesBySessionId, upsertAttendances } =
    StudentAttendanceStore();

  // Cargar sesiones del curso
  useEffect(() => {
    if (!open || !curso) return;

    const loadSessions = async () => {
      setLoading(true);
      try {
        const sessionsData = await fetchSessionsByGroupClassId(curso.id);
        setSessions(sessionsData);

        // Verificar qué sesiones tienen asistencia
        const sessionsWithAttendanceSet = new Set<string>();
        for (const session of sessionsData) {
          const attendances = await fetchAttendancesBySessionId(session.id);
          if (attendances.length > 0) {
            sessionsWithAttendanceSet.add(session.id);
          }
        }
        setSessionsWithAttendance(sessionsWithAttendanceSet);
      } catch (error: any) {
        console.error("Error cargando sesiones:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las sesiones",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [open, curso, fetchSessionsByGroupClassId, fetchAttendancesBySessionId, toast]);

  // Cargar sesión y asistencias cuando cambia la fecha de filtro
  useEffect(() => {
    if (!open || !curso || !filtroFecha) return;

    const loadSessionAndAttendances = async () => {
      setLoading(true);
      try {
        // Buscar sesión existente
        const session = await fetchSessionByDateAndGroupClass(
          curso.id,
          filtroFecha,
        );

        if (session) {
          setCurrentSessionId(session.id);

          // Cargar asistencias de esta sesión
          const attendances = await fetchAttendancesBySessionId(session.id);

          // Actualizar estudiantes con datos de asistencia
          setEstudiantes((prev) =>
            prev.map((student) => {
              const attendance = attendances.find(
                (att) =>
                  att.student_enrolled_id === student.student_enrolled_id,
              );
              if (attendance) {
                return {
                  ...student,
                  attendance_id: attendance.id,
                  status: attendance.status,
                  minutes_late: attendance.minutes_late || undefined,
                  observation: attendance.observation || undefined,
                };
              }
              return student;
            }),
          );
        } else {
          setCurrentSessionId(null);
          // Limpiar datos de asistencia
          setEstudiantes((prev) =>
            prev.map((student) => ({
              id: student.id,
              student_enrolled_id: student.student_enrolled_id,
              full_name: student.full_name,
              email: student.email,
              status: "present",
            })),
          );
        }
      } catch (error: any) {
        console.error("Error cargando sesión:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la sesión",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSessionAndAttendances();
  }, [
    open,
    curso,
    filtroFecha,
    fetchSessionByDateAndGroupClass,
    fetchAttendancesBySessionId,
    toast,
  ]);

  const marcarAsistencia = (
    studentId: string,
    field: keyof StudentWithAttendance,
    value: any,
  ) => {
    setEstudiantes((prev) =>
      prev.map((est) =>
        est.id === studentId ? { ...est, [field]: value } : est,
      ),
    );
  };

  const iniciarAsistencia = async (session: any, modoVista = false) => {
    setSelectedSession(session);
    setViewMode(modoVista);
    setLoading(true);
    try {
      // Cargar estudiantes del grupo
      const { data: groupStudents, error } = await supabase
        .from("group_has_students")
        .select(
          `
          id,
          student_enrolled_id,
          student_enrolled:student_enrolled_id (
            id,
            user_id,
            profiles:user_id (
              full_name,
              email,
              avatar_url
            )
          )
        `,
        )
        .eq("group_id", curso?.group_id);

      if (error) throw error;

      // Cargar asistencias existentes de esta sesión
      const attendances = await fetchAttendancesBySessionId(session.id);

      const studentsData: StudentWithAttendance[] =
        groupStudents?.map((gs: any) => {
          const attendance = attendances.find(
            (att) => att.student_enrolled_id === gs.student_enrolled_id,
          );
          return {
            id: gs.id,
            student_enrolled_id: gs.student_enrolled_id,
            full_name: gs.student_enrolled?.profiles?.full_name || "Sin nombre",
            email: gs.student_enrolled?.profiles?.email || "",
            avatar_url: gs.student_enrolled?.profiles?.avatar_url || "",
            attendance_id: attendance?.id,
            status: attendance?.status || "present",
            minutes_late: attendance?.minutes_late || undefined,
            observation: attendance?.observation || undefined,
          };
        }) || [];

      // Ordenar alfabéticamente por nombre
      studentsData.sort((a, b) => a.full_name.localeCompare(b.full_name));

      setEstudiantes(studentsData);
      setCurrentStudentIndex(0);
      setShowAttendance(true);
    } catch (error: any) {
      console.error("Error cargando estudiantes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const crearSesion = async () => {
    if (!curso || !fechaAsistencia) {
      toast({
        title: "Error",
        description: "Debe seleccionar una fecha",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newSession = await addSession({
        group_has_class_id: curso.id,
        session_date: fechaAsistencia,
        status: sessionStatus,
        academic_period_has_cycle_id: cycleId || null,
      });

      if (!newSession) {
        throw new Error("No se pudo crear la sesión");
      }

      // Recargar sesiones
      const sessionsData = await fetchSessionsByGroupClassId(curso.id);
      setSessions(sessionsData);

      toast({
        title: "Éxito",
        description: "Sesión creada correctamente",
      });

      setShowCreateSession(false);
      setFechaAsistencia(new Date().toISOString().split("T")[0]);
      setSessionStatus("scheduled");
    } catch (error: any) {
      console.error("Error creando sesión:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la sesión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const guardarAsistencia = async () => {
    if (!selectedSession || !curso) return;

    setLoading(true);
    try {
      const attendancesData = estudiantes.map((student) => ({
        ...(student.attendance_id ? { id: student.attendance_id } : {}),
        class_session_id: selectedSession.id,
        student_enrolled_id: student.id, // Usar group_has_students.id, no student_enrolled_id
        status: student.status || "present",
        minutes_late: student.minutes_late || null,
        observation: student.observation || null,
      }));

      await upsertAttendances(attendancesData);

      toast({
        title: "Éxito",
        description: "Asistencia guardada correctamente",
      });

      // Actualizar la lista de sesiones con asistencia
      setSessionsWithAttendance((prev) => {
        const newSet = new Set(prev);
        newSet.add(selectedSession.id);
        return newSet;
      });

      setShowAttendance(false);
      setSelectedSession(null);
      setEstudiantes([]);
      setViewMode(false);
    } catch (error: any) {
      console.error("Error guardando asistencia:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la asistencia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const siguienteEstudiante = () => {
    if (currentStudentIndex < estudiantes.length - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1);
    }
  };

  const anteriorEstudiante = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(currentStudentIndex - 1);
    }
  };

  const currentStudent = estudiantes[currentStudentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Gestión de Sesiones - {curso?.subject?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vista de tomar asistencia */}
          {showAttendance && estudiantes.length > 0 ? (
            <div className="space-y-6">
              {/* Header con información de la sesión */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {viewMode ? "Ver Asistencia - Sesión" : "Sesión"}
                  </p>
                  <p className="font-semibold">
                    {new Date(selectedSession.session_date).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                  {viewMode && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      Modo solo lectura
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Estudiantes</p>
                  <p className="font-semibold text-lg">{estudiantes.length}</p>
                </div>
              </div>

              {/* Vista DESKTOP - Tabla */}
              <div className="hidden md:block space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Estudiante
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          Asistencia
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          Min. Tarde
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Observaciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {estudiantes.map((estudiante, index) => (
                        <tr
                          key={estudiante.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3 text-sm">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                {estudiante.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {estudiante.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {estudiante.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  !viewMode &&
                                  marcarAsistencia(
                                    estudiante.id,
                                    "status",
                                    "present",
                                  )
                                }
                                disabled={viewMode}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  estudiante.status === "present"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                } ${viewMode ? "cursor-not-allowed opacity-70" : ""}`}
                              >
                                ✓
                              </button>
                              <button
                                onClick={() =>
                                  !viewMode &&
                                  marcarAsistencia(
                                    estudiante.id,
                                    "status",
                                    "late",
                                  )
                                }
                                disabled={viewMode}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  estudiante.status === "late"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                } ${viewMode ? "cursor-not-allowed opacity-70" : ""}`}
                              >
                                ⏰
                              </button>
                              <button
                                onClick={() =>
                                  !viewMode &&
                                  marcarAsistencia(
                                    estudiante.id,
                                    "status",
                                    "absent",
                                  )
                                }
                                disabled={viewMode}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  estudiante.status === "absent"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                } ${viewMode ? "cursor-not-allowed opacity-70" : ""}`}
                              >
                                ✗
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {estudiante.status === "late" && (
                              <input
                                type="number"
                                placeholder="Min"
                                className="w-20 px-2 py-1 border rounded text-sm text-center"
                                value={estudiante.minutes_late || ""}
                                onChange={(e) =>
                                  !viewMode &&
                                  marcarAsistencia(
                                    estudiante.id,
                                    "minutes_late",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                disabled={viewMode}
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder="Observaciones..."
                              className="w-full px-2 py-1 border rounded text-sm"
                              value={estudiante.observation || ""}
                              onChange={(e) =>
                                !viewMode &&
                                marcarAsistencia(
                                  estudiante.id,
                                  "observation",
                                  e.target.value,
                                )
                              }
                              disabled={viewMode}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Botones de acción para Desktop */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAttendance(false);
                      setSelectedSession(null);
                      setEstudiantes([]);
                      setViewMode(false);
                    }}
                  >
                    {viewMode ? "Cerrar" : "Cancelar"}
                  </Button>
                  {!viewMode && (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={guardarAsistencia}
                      disabled={loading}
                    >
                      {loading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Guardar Asistencia
                    </Button>
                  )}
                </div>
              </div>

              {/* Vista MOBILE - Slider */}
              <div className="block md:hidden space-y-6">
                {currentStudent && (
                  <>
                    {/* Indicador de progreso mobile */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Progreso</p>
                      <p className="font-semibold text-lg">
                        {currentStudentIndex + 1} / {estudiantes.length}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${((currentStudentIndex + 1) / estudiantes.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Tarjeta del estudiante actual */}
                    <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
                      <div className="flex flex-col items-center space-y-4">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {currentStudent.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </div>

                        {/* Nombre y email */}
                        <div className="text-center">
                          <h3 className="text-2xl font-bold">
                            {currentStudent.full_name}
                          </h3>
                          <p className="text-muted-foreground">
                            {currentStudent.email}
                          </p>
                        </div>

                        {/* Opciones de asistencia */}
                        <div className="w-full space-y-4 mt-6">
                          <p className="text-sm font-medium text-center">
                            {viewMode ? "Asistencia registrada:" : "Marcar asistencia:"}
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            <Button
                              variant={
                                currentStudent.status === "present"
                                  ? "default"
                                  : "outline"
                              }
                              className={`h-16 ${currentStudent.status === "present" ? "bg-green-600 hover:bg-green-700" : ""}`}
                              onClick={() =>
                                !viewMode &&
                                marcarAsistencia(
                                  currentStudent.id,
                                  "status",
                                  "present",
                                )
                              }
                              disabled={viewMode}
                            >
                              ✓ Presente
                            </Button>
                            <Button
                              variant={
                                currentStudent.status === "late"
                                  ? "default"
                                  : "outline"
                              }
                              className={`h-16 ${currentStudent.status === "late" ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
                              onClick={() =>
                                !viewMode &&
                                marcarAsistencia(
                                  currentStudent.id,
                                  "status",
                                  "late",
                                )
                              }
                              disabled={viewMode}
                            >
                              ⏰ Tarde
                            </Button>
                            <Button
                              variant={
                                currentStudent.status === "absent"
                                  ? "default"
                                  : "outline"
                              }
                              className={`h-16 ${currentStudent.status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}`}
                              onClick={() =>
                                !viewMode &&
                                marcarAsistencia(
                                  currentStudent.id,
                                  "status",
                                  "absent",
                                )
                              }
                              disabled={viewMode}
                            >
                              ✗ Ausente
                            </Button>
                          </div>

                          {/* Campo de minutos tarde */}
                          {currentStudent.status === "late" && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Minutos de retraso
                              </label>
                              <input
                                type="number"
                                placeholder="Ej: 15"
                                className="w-full px-4 py-2 border rounded-md"
                                value={currentStudent.minutes_late || ""}
                                onChange={(e) =>
                                  !viewMode &&
                                  marcarAsistencia(
                                    currentStudent.id,
                                    "minutes_late",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                disabled={viewMode}
                              />
                            </div>
                          )}

                          {/* Campo de observaciones */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Observaciones {viewMode ? "" : "(opcional)"}
                            </label>
                            <textarea
                              placeholder="Ej: Llegó con justificación médica..."
                              className="w-full px-4 py-2 border rounded-md resize-none"
                              rows={3}
                              value={currentStudent.observation || ""}
                              onChange={(e) =>
                                !viewMode &&
                                marcarAsistencia(
                                  currentStudent.id,
                                  "observation",
                                  e.target.value,
                                )
                              }
                              disabled={viewMode}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navegación */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={anteriorEstudiante}
                        disabled={currentStudentIndex === 0}
                      >
                        ← Anterior
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAttendance(false);
                            setSelectedSession(null);
                            setEstudiantes([]);
                            setViewMode(false);
                          }}
                        >
                          {viewMode ? "Cerrar" : "Cancelar"}
                        </Button>

                        {currentStudentIndex === estudiantes.length - 1 ? (
                          !viewMode && (
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={guardarAsistencia}
                              disabled={loading}
                            >
                              {loading && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              Guardar Asistencia
                            </Button>
                          )
                        ) : (
                          <Button onClick={siguienteEstudiante}>
                            Siguiente →
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : showCreateSession ? (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4">
              <h3 className="font-semibold">Nueva Sesión</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Fecha</label>
                  <input
                    type="date"
                    value={fechaAsistencia}
                    onChange={(e) => setFechaAsistencia(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <select
                    value={sessionStatus}
                    onChange={(e) => setSessionStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="scheduled">Programada</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateSession(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={crearSesion}
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear Sesión
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Sesiones de Clase ({sessions.length})
              </h3>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowCreateSession(true)}
              >
                + Nueva Sesión
              </Button>
            </div>
          )}

          {/* Lista de sesiones */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay sesiones creadas. Crea una para comenzar.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const hasAttendance = sessionsWithAttendance.has(session.id);

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(session.session_date).toLocaleDateString(
                          "es-ES",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Estado:{" "}
                        {session.status === "scheduled"
                          ? "Programada"
                          : session.status === "completed"
                            ? "Completada"
                            : "Cancelada"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {hasAttendance && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => iniciarAsistencia(session, true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Asistencia
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => iniciarAsistencia(session, false)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        {hasAttendance ? "Editar" : "Tomar Asistencia"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
