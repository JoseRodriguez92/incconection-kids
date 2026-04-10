"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  CalendarClock,
  ClipboardList,
  HelpCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";
import "driver.js/dist/driver.css";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function Profesor() {
  const router = useRouter();
  const [userData, setUserData] = useState<Profile | null>(null);

  const [cursosActivos, setCursosActivos] = useState<any[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [actFilter, setActFilter] = useState<"pendientes" | "vencidas" | "todas">("pendientes");
  const [cursoFiltro, setCursoFiltro] = useState<string>("todos");
  const [periodoActivo, setPeriodoActivo] = useState<{
    name: string;
    start_date: string | null;
    end_date: string | null;
  } | null>(null);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
          element: "#tour-bienvenida",
          popover: {
            title: "👋 Panel de inicio",
            description:
              "Aquí ves un resumen de tu actividad docente: cursos, estudiantes y actividades del período académico activo.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-periodo",
          popover: {
            title: "📅 Período académico activo",
            description:
              "Este badge indica el período académico en curso. Todos los datos que ves corresponden a este período.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-stat-cursos",
          popover: {
            title: "📚 Mis Cursos",
            description:
              "Aquí ves el resumen de tus cursos activos y el total de estudiantes. Haz clic en cualquier curso para entrar directamente a esa clase.",
            side: "bottom",
          },
        },
        {
          element: "#tour-actividades",
          popover: {
            title: "📋 Mis actividades",
            description:
              "Filtra tus actividades por Pendientes (aún vigentes), Vencidas (fecha pasada) o Todas. Haz clic en una para ir a esa clase.",
            side: "left",
          },
        },
        {
          element: "#tour-boton-tour",
          popover: {
            title: "❓ Tour de ayuda",
            description:
              "Puedes volver a ver este recorrido cuando quieras haciendo clic aquí.",
            side: "bottom",
            align: "end",
          },
        },
      ],
    });
    driverObj.drive();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id_User = ManagmentStorage.getItem("id_User");
        if (!id_User) {
          console.warn("No se encontró id_User en el almacenamiento local");
          return;
        }

        const supabase = createClient();

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id_User)
          .maybeSingle();

        if (profileError) {
          console.error("Error al obtener datos del usuario:", profileError);
        } else {
          setUserData(profileData);
        }

        const { data: activePeriod, error: periodError } = await supabase
          .from("academic_period")
          .select("name, start_date, end_date")
          .eq("is_active", true)
          .maybeSingle();

        if (periodError) {
          console.error(
            "Error al obtener período académico activo:",
            periodError,
          );
        } else if (activePeriod) {
          setPeriodoActivo({
            name: activePeriod.name,
            start_date: activePeriod.start_date,
            end_date: activePeriod.end_date,
          });
        }

        const { data: teacherEnrolled, error: teacherError } = await supabase
          .from("teacher_enrolled")
          .select("id")
          .eq("user_id", id_User)
          .maybeSingle();

        if (teacherError) {
          console.error("Error al obtener teacher_enrolled:", teacherError);
          return;
        }

        if (!teacherEnrolled) {
          console.warn("No se encontró teacher_enrolled para este usuario");
          return;
        }

        const { data: cursos, error: cursosError } = await supabase
          .from("group_has_class")
          .select(
            `
            *,
            subject:subject_id (
              id,
              name
            ),
            group:group_id (
              id,
              name,
              students:group_has_students ( id ),
              course:course_id (
                id,
                name
              ),
              academic_period:year (
                id,
                name,
                is_active,
                start_date,
                end_date
              )
            ),
            classroom:classroom_id (
              id,
              name
            )
          `,
          )
          .eq("teacher_enrolled_id", teacherEnrolled.id)
          .eq("is_active", true);

        if (cursosError) {
          console.error("Error al obtener cursos:", cursosError);
          return;
        }

        const cursosFiltrados =
          cursos?.filter(
            (curso: any) => curso.group?.academic_period?.is_active === true,
          ) || [];

        // Deduplicar por subject_id + group_id antes de mostrar.
        // Pueden existir varios registros group_has_class con la misma
        // combinación (asignaciones duplicadas en BD). Para el display
        // solo mostramos uno; para las actividades usamos cursosFiltrados completo.
        const seenKeys = new Set<string>();
        const cursosUnicos = cursosFiltrados.filter((curso: any) => {
          const key = `${curso.subject_id ?? ""}__${curso.group_id ?? ""}`;
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });

        const cursosFormateados =
          cursosUnicos.map((curso: any) => ({
            id: curso.id,
            nombre: curso.subject?.name || "Sin nombre de materia",
            estudiantes: Array.isArray(curso.group?.students)
              ? curso.group.students.length
              : 0,
            curso: curso.group?.course?.name || "N/A",
            grupo: curso.group?.name || "N/A",
            periodoAcademico: curso.group?.academic_period?.name || "N/A",
            isActivePeriod: curso.group?.academic_period?.is_active || false,
            subject: curso.subject,
            classroom: curso.classroom,
          })) || [];

        setCursosActivos(cursosFormateados);

        const classIds = cursosFiltrados.map((c: any) => c.id);
        if (classIds.length > 0) {
          const { data: actData, error: actError } = await supabase
            .from("group_has_activity")
            .select(
              `
              id, title, description, limit_date, is_active, grade_percentage,
              clase:group_has_class_id (
                id, name,
                subject:subject_id ( name ),
                group:group_id ( name, course:course_id ( name ) )
              )
            `,
            )
            .in("group_has_class_id", classIds)
            .order("created_at", { ascending: false });

          if (actError) {
            console.error("Error al obtener actividades:", actError);
          } else {
            setActividades(actData ?? []);
          }
        }
      } catch (err) {
        console.error("Error general al recuperar datos:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-w-0 space-y-6 p-6 w-full">
      {/* Header de bienvenida */}
      <div id="tour-bienvenida" className="space-y-2 relative z-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              ¡Bienvenido, Profesor
              {userData?.first_name ? ` ${userData.first_name}` : ""}!
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground capitalize">{today}</p>
              {periodoActivo && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge
                    id="tour-periodo"
                    className="text-sm bg-green-600 hover:bg-green-700 text-white cursor-default"
                  >
                    <span className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-100"></span>
                      </span>
                      📅 {periodoActivo.name}
                    </span>
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Botón tour */}
          <Button
            id="tour-boton-tour"
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={startTour}
          >
            <HelpCircle className="w-4 h-4" />
            Tour del panel
          </Button>
        </div>
      </div>

      {/* Panel principal — 2 columnas */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── Card: Mis Cursos ── */}
        <Card id="tour-stat-cursos" className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-primary" />
                Mis Cursos
              </CardTitle>
              {periodoActivo && (
                <span className="text-xs text-muted-foreground">
                  {periodoActivo.name}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-primary">
                  {cursosActivos.length}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                  <BookOpen className="h-3 w-3" /> Cursos activos
                </p>
              </div>
              <div id="tour-stat-estudiantes" className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-primary">
                  {cursosActivos.reduce((acc, c) => acc + c.estudiantes, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" /> Estudiantes
                </p>
              </div>
            </div>

            {/* Lista de cursos */}
            {cursosActivos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No tienes cursos activos.
                </p>
              </div>
            ) : (() => {
              const courseOptions = [
                ...new Set(cursosActivos.map((c) => c.curso)),
              ]
                .filter((v) => v && v !== "N/A")
                .sort((a, b) => a.localeCompare(b, "es"));

              const cursosMostrados =
                cursoFiltro === "todos"
                  ? cursosActivos
                  : cursosActivos.filter((c) => c.curso === cursoFiltro);

              return (
                <div className="space-y-3">
                  {/* Chips de filtro */}
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setCursoFiltro("todos")}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                        cursoFiltro === "todos"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      Todos ({cursosActivos.length})
                    </button>
                    {courseOptions.map((nombre) => {
                      const count = cursosActivos.filter(
                        (c) => c.curso === nombre,
                      ).length;
                      return (
                        <button
                          key={nombre}
                          onClick={() => setCursoFiltro(nombre)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                            cursoFiltro === nombre
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                          )}
                        >
                          {nombre}
                          <span className="ml-1 opacity-60">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Lista filtrada */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                    {cursosMostrados.map((curso, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 hover:border-primary/30 transition-all text-left group"
                        onClick={() =>
                          router.push(
                            `/usuario/profesor/clases?curso=${curso.id}`,
                          )
                        }
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate leading-tight">
                            {curso.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {curso.curso} · Grupo {curso.grupo}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs gap-1"
                          >
                            <Users className="h-2.5 w-2.5" />
                            {curso.estudiantes}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* ── Card: Mis Actividades ── */}
        <Card id="tour-actividades" className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Mis Actividades
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {actividades.length} actividades creadas en tus clases
                </CardDescription>
              </div>

              {/* Filtros tipo tab */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
                {(
                  [
                    {
                      key: "pendientes",
                      label: "Pendientes",
                      icon: <Clock className="h-3 w-3" />,
                      count: actividades.filter((a) => {
                        const diff = a.limit_date
                          ? Math.ceil(
                              (new Date(a.limit_date).getTime() -
                                Date.now()) /
                                86400000,
                            )
                          : 1;
                        return diff >= 0;
                      }).length,
                      activeClass:
                        "bg-emerald-600 text-white shadow-sm",
                    },
                    {
                      key: "vencidas",
                      label: "Vencidas",
                      icon: <AlertTriangle className="h-3 w-3" />,
                      count: actividades.filter((a) => {
                        if (!a.limit_date) return false;
                        const diff = Math.ceil(
                          (new Date(a.limit_date).getTime() - Date.now()) /
                            86400000,
                        );
                        return diff < 0;
                      }).length,
                      activeClass: "bg-red-600 text-white shadow-sm",
                    },
                    {
                      key: "todas",
                      label: "Todas",
                      icon: <CheckCheck className="h-3 w-3" />,
                      count: actividades.length,
                      activeClass: "bg-background shadow-sm text-foreground",
                    },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActFilter(f.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                      actFilter === f.key
                        ? f.activeClass
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.icon}
                    {f.label}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        actFilter === f.key
                          ? "bg-white/20"
                          : "bg-muted-foreground/15"
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 min-h-0">
            {actividades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No has creado actividades aún.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {actividades
                  .filter((act) => {
                    const diff = act.limit_date
                      ? Math.ceil(
                          (new Date(act.limit_date).getTime() - Date.now()) /
                            86400000,
                        )
                      : null;
                    if (actFilter === "pendientes")
                      return diff === null || diff >= 0;
                    if (actFilter === "vencidas")
                      return diff !== null && diff < 0;
                    return true;
                  })
                  .map((act: any) => {
                    const clase = Array.isArray(act.clase)
                      ? act.clase[0]
                      : act.clase;
                    const subject = Array.isArray(clase?.subject)
                      ? clase.subject[0]
                      : clase?.subject;
                    const group = Array.isArray(clase?.group)
                      ? clase.group[0]
                      : clase?.group;
                    const course = Array.isArray(group?.course)
                      ? group.course[0]
                      : group?.course;

                    const limitDate = act.limit_date
                      ? new Date(act.limit_date)
                      : null;
                    const diffDays = limitDate
                      ? Math.ceil(
                          (limitDate.getTime() - Date.now()) / 86400000,
                        )
                      : null;

                    const isOverdue = diffDays !== null && diffDays < 0;
                    const isUrgent =
                      diffDays !== null && diffDays >= 0 && diffDays <= 3;

                    return (
                      <div
                        key={act.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/30 ${
                          isOverdue
                            ? "border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-950/20"
                            : isUrgent
                              ? "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20"
                              : "border-border"
                        }`}
                        onClick={() => {
                          if (clase?.id)
                            router.push(
                              `/usuario/profesor/clases?curso=${clase.id}`,
                            );
                        }}
                      >
                        {/* Indicador lateral */}
                        <div
                          className={`w-1 h-10 rounded-full shrink-0 ${
                            isOverdue
                              ? "bg-red-500"
                              : isUrgent
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                        />

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="font-medium text-sm truncate leading-tight">
                            {act.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {subject?.name ?? "Sin materia"} ·{" "}
                            {course?.name ?? ""} {group?.name ?? ""}
                          </p>
                          {limitDate && (
                            <p
                              className={`text-xs flex items-center gap-1 ${
                                isOverdue
                                  ? "text-red-600 dark:text-red-400"
                                  : isUrgent
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              <CalendarClock className="h-3 w-3 shrink-0" />
                              {diffDays! < 0
                                ? `Venció hace ${Math.abs(diffDays!)} día${Math.abs(diffDays!) !== 1 ? "s" : ""}`
                                : diffDays === 0
                                  ? "Vence hoy"
                                  : `Vence en ${diffDays} día${diffDays !== 1 ? "s" : ""}`}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          {act.grade_percentage != null && (
                            <Badge variant="secondary" className="text-xs">
                              {act.grade_percentage}%
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">
                              Vencida
                            </Badge>
                          )}
                          {isUrgent && !isOverdue && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                              Urgente
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Empty state del filtro */}
                {actividades.filter((act) => {
                  const diff = act.limit_date
                    ? Math.ceil(
                        (new Date(act.limit_date).getTime() - Date.now()) /
                          86400000,
                      )
                    : null;
                  if (actFilter === "pendientes")
                    return diff === null || diff >= 0;
                  if (actFilter === "vencidas")
                    return diff !== null && diff < 0;
                  return true;
                }).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    {actFilter === "vencidas" ? (
                      <>
                        <CheckCheck className="h-8 w-8 text-emerald-500/60" />
                        <p className="text-sm text-muted-foreground">
                          No tienes actividades vencidas. ¡Todo al día!
                        </p>
                      </>
                    ) : (
                      <>
                        <Clock className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          No hay actividades pendientes.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
