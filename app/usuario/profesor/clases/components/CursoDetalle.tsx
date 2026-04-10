"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  ClipboardList,
  Users,
  BarChart3,
  MessageSquare,
  Calendar,
  UserCheck,
  Clock,
  DoorOpen,
  Hash,
  BookOpen,
  UsersRound,
  GraduationCap,
  HelpCircle,
} from "lucide-react";
import "driver.js/dist/driver.css";
import type { Curso } from "../types";
import { TabContenido } from "./tabs/TabContenido";
import { TabActividades } from "./tabs/TabActividades";
import { TabEstudiantes } from "./tabs/TabEstudiantes";
import { TabCalificaciones } from "./tabs/TabCalificaciones";
import { TabMetodologia } from "./tabs/TabMetodologia";
import { ModalAsistencia } from "./modales/ModalAsistencia";
import { ModalAgregarMaterial } from "./modales/ModalAgregarMaterial";
import { ModalVisualizarMaterial } from "./modales/ModalVisualizarMaterial";
import { ModalEditarMaterial } from "./modales/ModalEditarMaterial";
import { ModalEliminarMaterial } from "./modales/ModalEliminarMaterial";
import { ModalAgregarActivity } from "./modales/ModalAgregarActivity";
import { ModalVisualizarActividad } from "./modales/ModalVisualizarActividad";
import { ModalEditarActividad } from "./modales/ModalEditarActividad";
import { ModalEliminarActividad } from "./modales/ModalEliminarActividad";
import { EntregasModal } from "./EntregasModal";
import {
  PeriodAcademicStore,
  type PeriodoAcademico,
} from "@/Stores/periodAcademicStore";
import { CycleStore, type CycleWithRelation } from "@/Stores/cycleStore";
import {
  GroupHasMaterialStore,
  type GroupHasMaterial,
} from "@/Stores/groupHasMaterialStore";
import {
  GroupHasActivityStore,
  type GroupHasActivity,
} from "@/Stores/groupHasActivityStore";

interface CursoDetalleProps {
  curso: Curso;
  onVolver: () => void;
}

export function CursoDetalle({ curso, onVolver }: CursoDetalleProps) {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("1");
  const [actividadEntregas, setActividadEntregas] = useState<GroupHasActivity | null>(null);
  const [modalAsistencia, setModalAsistencia] = useState(false);
  const [modalAgregarMaterial, setModalAgregarMaterial] = useState(false);
  const [modalVisualizarMaterial, setModalVisualizarMaterial] = useState(false);
  const [modalEditarMaterial, setModalEditarMaterial] = useState(false);
  const [modalEliminarMaterial, setModalEliminarMaterial] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<GroupHasMaterial | null>(null);
  const [materialAEditar, setMaterialAEditar] =
    useState<GroupHasMaterial | null>(null);
  const [materialAEliminar, setMaterialAEliminar] =
    useState<GroupHasMaterial | null>(null);

  // Estados para modales de actividades
  const [modalAgregarActividad, setModalAgregarActividad] = useState(false);
  const [modalVisualizarActividad, setModalVisualizarActividad] =
    useState(false);
  const [modalEditarActividad, setModalEditarActividad] = useState(false);
  const [modalEliminarActividad, setModalEliminarActividad] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] =
    useState<GroupHasActivity | null>(null);
  const [actividadAEditar, setActividadAEditar] =
    useState<GroupHasActivity | null>(null);
  const [actividadAEliminar, setActividadAEliminar] =
    useState<GroupHasActivity | null>(null);

  // Estados para período académico y ciclos
  const [periodoAcademico, setPeriodoAcademico] =
    useState<PeriodoAcademico | null>(null);
  const [ciclos, setCiclos] = useState<CycleWithRelation[]>([]);
  const [cicloSeleccionado, setCicloSeleccionado] = useState<string>("");

  // Zustand stores
  const { fetchActivePeriodo } = PeriodAcademicStore();
  const { fetchCyclesByAcademicPeriod } = CycleStore();
  const { materials, loading, fetchMaterialsByGroupClassId } =
    GroupHasMaterialStore();
  const {
    activities,
    loading: loadingActivities,
    fetchActivitiesByGroupClassId,
  } = GroupHasActivityStore();

  // Cargar período académico activo y sus ciclos
  useEffect(() => {
    const loadAcademicData = async () => {
      console.log("🔄 [CursoDetalle] Iniciando carga de datos académicos...");

      const activePeriod = await fetchActivePeriodo();
      console.log("📅 [CursoDetalle] Período activo obtenido:", activePeriod);

      if (activePeriod) {
        setPeriodoAcademico(activePeriod);
        console.log(
          "🔍 [CursoDetalle] Buscando ciclos para período ID:",
          activePeriod.id,
        );

        const cyclesList = await fetchCyclesByAcademicPeriod(activePeriod.id);
        console.log("📚 [CursoDetalle] Ciclos obtenidos:", cyclesList);
        console.log("📊 [CursoDetalle] Cantidad de ciclos:", cyclesList.length);

        setCiclos(cyclesList);
        if (cyclesList.length > 0) {
          // Usar el ID de la tabla intermedia (academic_period_has_cycle_id)
          setCicloSeleccionado(cyclesList[0].academic_period_has_cycle_id);
          console.log(
            "✅ [CursoDetalle] Ciclo seleccionado por defecto:",
            cyclesList[0],
            "con academic_period_has_cycle_id:",
            cyclesList[0].academic_period_has_cycle_id,
          );
        } else {
          console.warn(
            "⚠️ [CursoDetalle] No se encontraron ciclos para este período",
          );
        }
      } else {
        console.warn("⚠️ [CursoDetalle] No hay período académico activo");
      }
    };
    loadAcademicData();
  }, [fetchActivePeriodo, fetchCyclesByAcademicPeriod]);

  // Cargar materiales del curso
  useEffect(() => {
    if (curso?.id) {
      console.log(
        "📦 [CursoDetalle] Cargando materiales para curso ID:",
        curso.id,
      );
      fetchMaterialsByGroupClassId(curso.id);
    }
  }, [curso?.id, fetchMaterialsByGroupClassId]);

  // Cargar actividades del curso
  useEffect(() => {
    if (curso?.id) {
      fetchActivitiesByGroupClassId(curso.id);
    }
  }, [curso?.id, fetchActivitiesByGroupClassId]);

  // Handlers para modales
  const abrirModalAsistencia = () => {
    setModalAsistencia(true);
  };

  // Handlers para contenido
  const abrirModal = (material: GroupHasMaterial) => {
    setMaterialSeleccionado(material);
    setModalVisualizarMaterial(true);
  };

  const abrirModalEdicion = (material: GroupHasMaterial) => {
    setMaterialAEditar(material);
    setModalEditarMaterial(true);
  };

  const abrirModalEliminacion = (material: GroupHasMaterial) => {
    setMaterialAEliminar(material);
    setModalEliminarMaterial(true);
  };

  const abrirModalAgregar = () => {
    setModalAgregarMaterial(true);
  };

  // Handlers para actividades
  const abrirModalActividad = (actividad: GroupHasActivity) => {
    setActividadSeleccionada(actividad);
    setModalVisualizarActividad(true);
  };

  const abrirModalEdicionActividad = (actividad: GroupHasActivity) => {
    setActividadAEditar(actividad);
    setModalEditarActividad(true);
  };

  const abrirModalEliminacionActividad = (actividad: GroupHasActivity) => {
    setActividadAEliminar(actividad);
    setModalEliminarActividad(true);
  };

  const abrirModalAgregarActividad = () => {
    setModalAgregarActividad(true);
  };

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    const driverObj = driver({
      animate: true,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "¡Entendido!",
      progressText: "{{current}} de {{total}}",
      steps: [
        {
          element: "#tour-detalle-header",
          popover: {
            title: "📖 Detalle de la clase",
            description:
              "Estás dentro del aula virtual de esta clase. Aquí ves el nombre de la materia, el grupo, el horario, el aula asignada y el código del curso.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-detalle-periodo",
          popover: {
            title: "🎓 Año académico",
            description:
              "Indica el período académico al que pertenece esta clase. Todos los contenidos, actividades y calificaciones están ligados a este período.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#tour-detalle-asistencia",
          popover: {
            title: "✅ Tomar asistencia",
            description:
              "Abre el modal para registrar la asistencia de los estudiantes en la sesión de hoy. Puedes marcar cada estudiante como presente, ausente o tardanza.",
            side: "bottom",
          },
        },
        {
          element: "#tour-tab-metodologia",
          popover: {
            title: "📘 Metodología",
            description:
              "Define la metodología de evaluación: las habilidades y condiciones de aprendizaje que usarás para calificar a los estudiantes de esta clase.",
            side: "bottom",
          },
        },
        {
          element: "#tour-tab-estudiantes",
          popover: {
            title: "👥 Estudiantes",
            description:
              "Lista completa de estudiantes matriculados con su perfil, condición de aprendizaje y datos de contacto.",
            side: "bottom",
          },
        },
        {
          element: "#tour-tab-contenido",
          popover: {
            title: "📄 Contenido",
            description:
              "Sube y organiza los materiales de la clase (PDFs, documentos, imágenes) por ciclo y por condición de aprendizaje. Los estudiantes los verán desde su portal.",
            side: "bottom",
          },
        },
        {
          element: "#tour-tab-actividades",
          popover: {
            title: "📋 Actividades",
            description:
              "Crea y gestiona actividades evaluables: asigna porcentaje de nota, fecha límite, ciclo y condición de aprendizaje. Desde aquí también puedes ver las entregas de los estudiantes.",
            side: "bottom",
          },
        },
        {
          element: "#tour-tab-calificaciones",
          popover: {
            title: "📊 Calificaciones",
            description:
              "Consulta las notas de los estudiantes organizadas por ciclo. Las calificaciones las genera el sistema automáticamente al cerrar cada ciclo — aquí solo puedes visualizarlas, no editarlas.",
            side: "bottom",
          },
        },
        {
          element: "#tour-detalle-boton",
          popover: {
            title: "❓ Tour de ayuda",
            description:
              "Puedes volver a ver este recorrido en cualquier momento haciendo clic aquí.",
            side: "bottom",
            align: "end",
          },
        },
      ],
    });
    driverObj.drive();
  }, []);

  return (
    <div className="min-w-0 space-y-6 p-6 w-full">
      <div id="tour-detalle-header" className="flex items-center justify-between relative z-1">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {curso.subject?.name}
            </h1>
            {curso?.is_active !== undefined && (
              <Badge variant={curso.is_active ? "default" : "destructive"}>
                {curso.is_active ? "Activo" : "Inactivo"}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Grupo */}
            <Badge className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
              <UsersRound className="h-3.5 w-3.5" />
              <span className="font-medium">
                {curso.course?.name} Grupo {curso?.grupo}
              </span>
            </Badge>

            {/* Separador visual */}
            <div className="h-6 w-px bg-border" />

            {/* Horarios */}
            <div className="flex flex-wrap gap-2">
              {curso?.horario?.split(",").map((horario, index) => (
                <Badge
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 border-0"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">{horario.trim()}</span>
                </Badge>
              ))}
            </div>

            {/* Aula */}
            {curso?.classroom?.name && (
              <>
                <div className="h-6 w-px bg-border" />
                <Badge className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 border-0">
                  <DoorOpen className="h-3.5 w-3.5" />
                  <span className="font-medium">{curso.classroom.name}</span>
                </Badge>
              </>
            )}

            {/* Código del curso */}
            {curso?.course?.code && (
              <>
                <div className="h-6 w-px bg-border" />
                <Badge className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">
                  <Hash className="h-3.5 w-3.5" />
                  <span className="font-medium">{curso.course.code}</span>
                </Badge>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Año Académico */}
          {periodoAcademico && (
            <div id="tour-detalle-periodo" className="relative flex items-center gap-3 px-5 py-3 bg-white/30  rounded-xl  border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 backdrop-blur-sm">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Año Académico
                </span>
                <span className="text-base font-bold text-primary leading-tight">
                  {periodoAcademico.name}
                </span>
              </div>
              <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full blur-xl -z-10" />
            </div>
          )}

          <Button
            id="tour-detalle-asistencia"
            onClick={abrirModalAsistencia}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Tomar Asistencia
          </Button>
          <Button variant="outline" onClick={onVolver}>
            Volver a Mis Cursos
          </Button>
          <Button
            id="tour-detalle-boton"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={startTour}
          >
            <HelpCircle className="w-4 h-4" />
            Tour
          </Button>
        </div>
      </div>

      <Tabs defaultValue="contenido" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 relative z-1 h-12 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger id="tour-tab-metodologia" value="metodologia" className="flex items-center gap-2 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Metodología</span>
          </TabsTrigger>
          <TabsTrigger id="tour-tab-estudiantes" value="estudiantes" className="flex items-center gap-2 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold">
            <Users className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Estudiantes</span>
          </TabsTrigger>
          <TabsTrigger id="tour-tab-contenido" value="contenido" className="flex items-center gap-2 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Contenido</span>
          </TabsTrigger>
          <TabsTrigger id="tour-tab-actividades" value="actividades" className="flex items-center gap-2 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold">
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Actividades</span>
          </TabsTrigger>
          <TabsTrigger id="tour-tab-calificaciones" value="calificaciones" className="flex items-center gap-2 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold">
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Calificaciones</span>
          </TabsTrigger>
          {/* <TabsTrigger value="foros" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Foros
          </TabsTrigger>
          <TabsTrigger
            value="planificacion"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Planificación
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="contenido" className="space-y-4">
          <TabContenido
            materiales={materials}
            loading={loading}
            onAbrirModal={abrirModal}
            onAbrirModalEdicion={abrirModalEdicion}
            onAbrirModalEliminacion={abrirModalEliminacion}
            onAbrirModalAgregar={abrirModalAgregar}
            cycles={ciclos}
          />
        </TabsContent>

        <TabsContent value="actividades" className="space-y-4">
          <TabActividades
            actividades={activities}
            loading={loadingActivities}
            onAbrirModal={abrirModalActividad}
            onAbrirModalEdicion={abrirModalEdicionActividad}
            onAbrirModalEliminacion={abrirModalEliminacionActividad}
            onAbrirModalAgregar={abrirModalAgregarActividad}
            onVerEntregas={(actividad) => setActividadEntregas(actividad)}
            cycles={ciclos}
          />
        </TabsContent>

        <TabsContent value="metodologia" className="space-y-4">
          <TabMetodologia grupoId={curso.id} />
        </TabsContent>

        <TabsContent value="estudiantes" className="space-y-4">
          <TabEstudiantes curso={curso} />
        </TabsContent>

        <TabsContent value="calificaciones" className="space-y-4">
          <TabCalificaciones
            estudiantes={curso?.estudiantes || []}
            ciclos={ciclos}
          />
        </TabsContent>

        <TabsContent value="foros" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Funcionalidad de foros en desarrollo
          </div>
        </TabsContent>

        <TabsContent value="planificacion" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Funcionalidad de planificación en desarrollo
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de asistencia */}
      <ModalAsistencia
        open={modalAsistencia}
        onOpenChange={setModalAsistencia}
        curso={curso}
        cycleId={cicloSeleccionado}
      />

      {/* Modal de agregar material */}
      <ModalAgregarMaterial
        open={modalAgregarMaterial}
        onOpenChange={setModalAgregarMaterial}
        groupHasClassId={curso.id}
        cycleId={cicloSeleccionado}
      />

      {/* Modal de visualizar material */}
      <ModalVisualizarMaterial
        open={modalVisualizarMaterial}
        onOpenChange={setModalVisualizarMaterial}
        material={materialSeleccionado}
      />

      {/* Modal de editar material */}
      <ModalEditarMaterial
        open={modalEditarMaterial}
        onOpenChange={setModalEditarMaterial}
        material={materialAEditar}
      />

      {/* Modal de eliminar material */}
      <ModalEliminarMaterial
        open={modalEliminarMaterial}
        onOpenChange={setModalEliminarMaterial}
        material={materialAEliminar}
      />

      {/* Modal de agregar actividad */}
      <ModalAgregarActivity
        open={modalAgregarActividad}
        onOpenChange={setModalAgregarActividad}
        groupHasClassId={curso.id}
        cycleId={cicloSeleccionado}
      />

      {/* Modal de visualizar actividad */}
      <ModalVisualizarActividad
        open={modalVisualizarActividad}
        onOpenChange={setModalVisualizarActividad}
        actividad={actividadSeleccionada}
      />

      {/* Modal de editar actividad */}
      <ModalEditarActividad
        open={modalEditarActividad}
        onOpenChange={setModalEditarActividad}
        actividad={actividadAEditar}
      />

      {/* Modal de eliminar actividad */}
      <ModalEliminarActividad
        open={modalEliminarActividad}
        onOpenChange={setModalEliminarActividad}
        actividad={actividadAEliminar}
      />

      {actividadEntregas && (
        <EntregasModal
          open={!!actividadEntregas}
          onOpenChange={(v) => !v && setActividadEntregas(null)}
          actividad={actividadEntregas}
          estudiantes={curso.estudiantes || []}
        />
      )}
    </div>
  );
}
