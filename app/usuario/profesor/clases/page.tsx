"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, AlertCircle, HelpCircle, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCursos } from "./hooks/useCursos";
import { CursoCard } from "./components/CursoCard";
import { CursoDetalle } from "./components/CursoDetalle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import "driver.js/dist/driver.css";

function CursosPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cursos, loading, error } = useCursos();
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string | null>(
    searchParams.get("curso"),
  );
  const [cursoExpandido, setCursoExpandido] = useState<string | null>(null);
  const [cursoFiltro, setCursoFiltro] = useState<string>("todos");
  const [periodoActivo, setPeriodoActivo] = useState<{
    name: string;
    start_date: string | null;
    end_date: string | null;
  } | null>(null);

  useEffect(() => {
    const id = searchParams.get("curso");
    if (id && !loading && cursos.length > 0) {
      setCursoSeleccionado(id);
    }
  }, [searchParams, loading, cursos]);

  useEffect(() => {
    const fetchPeriodoActivo = async () => {
      try {
        const supabase = createClient();
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
      } catch (err) {
        console.error("Error general al obtener período activo:", err);
      }
    };
    fetchPeriodoActivo();
  }, []);

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    const hasCards = cursos.length > 0;

    const steps: any[] = [
      {
        element: "#tour-clases-header",
        popover: {
          title: "📚 Mis Clases",
          description:
            "Aquí encuentras todas las clases que tienes asignadas en el período académico activo. Cada tarjeta representa una clase con su materia, grupo y horario.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-clases-periodo",
        popover: {
          title: "📅 Período activo",
          description:
            "Solo ves las clases del período académico en curso. Si no aparece una clase, puede que esté en un período diferente o esté inactiva.",
          side: "bottom",
          align: "start",
        },
      },
    ];

    if (hasCards) {
      steps.push(
        {
          element: "#tour-clases-filtros",
          popover: {
            title: "🎓 Filtrar por curso",
            description:
              "Usa estos botones para ver solo las clases de un curso específico (Quinto, Séptimo, Décimo…). El número entre paréntesis indica cuántas clases hay en cada curso.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-clases-grid",
          popover: {
            title: "🗂️ Tarjetas de clase",
            description:
              "Cada tarjeta muestra la materia, el curso, el aula, el número de estudiantes y el horario semanal de esa clase.",
            side: "top",
          },
        },
        {
          element: "#tour-primera-card",
          popover: {
            title: "📖 Acciones de la clase",
            description:
              "«Acceder al Aula Virtual» abre la clase completa: contenidos, actividades, calificaciones y entregas. El botón de personas al lado despliega la lista de estudiantes matriculados con su condición de aprendizaje.",
            side: "right",
          },
        },
      );
    }

    steps.push({
      element: "#tour-clases-boton",
      popover: {
        title: "❓ Tour de ayuda",
        description:
          "Puedes relanzar este recorrido en cualquier momento haciendo clic aquí.",
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
  }, [cursos]);

  // Vista de detalle
  if (cursoSeleccionado) {
    const curso = cursos.find((c) => c.id === cursoSeleccionado);

    if (!curso) {
      return (
        <div className="flex-1 p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Curso no encontrado</p>
            <button
              onClick={() => setCursoSeleccionado(null)}
              className="mt-4 text-primary hover:underline"
            >
              Volver a Mis Cursos
            </button>
          </div>
        </div>
      );
    }

    return (
      <CursoDetalle
        curso={curso}
        onVolver={() => {
          setCursoSeleccionado(null);
          router.replace("/usuario/profesor/clases");
        }}
      />
    );
  }

  // Vista principal
  return (
    <div className="min-w-0 space-y-6 p-6">
      {/* Header */}
      <div id="tour-clases-header" className="space-y-2 relative z-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Clases</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">
                Gestiona tus clases del periodo actual
              </p>
              {periodoActivo && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge
                    id="tour-clases-periodo"
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

          <Button
            id="tour-clases-boton"
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

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <BookOpen className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Cargando tus cursos...</p>
            <p className="text-sm text-muted-foreground">
              Obteniendo la información del período académico activo
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-red-900">
                  Error al cargar los cursos
                </h3>
                <p className="text-sm text-red-700">{error.message}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Intentar nuevamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vacío */}
      {!loading && !error && cursos.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  No hay cursos disponibles
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No tienes cursos asignados en el período académico activo.
                  Contacta con el administrador si crees que esto es un error.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros por curso + grid */}
      {!loading &&
        !error &&
        cursos.length > 0 &&
        (() => {
          // Opciones únicas de curso ordenadas alfabéticamente
          const courseOptions = [...new Set(cursos.map((c) => c.curso_nombre))]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, "es"));

          const cursosMostrados =
            cursoFiltro === "todos"
              ? cursos
              : cursos.filter((c) => c.curso_nombre === cursoFiltro);

          return (
            <>
              {/* Chips de filtro */}
              <div id="tour-clases-filtros" className="space-y-2 relative z-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground font-medium shrink-0">
                    Filtrar por curso:
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setCursoFiltro("todos")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                      cursoFiltro === "todos"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    Todos ({cursos.length})
                  </button>
                  {courseOptions.map((nombre) => {
                    const count = cursos.filter(
                      (c) => c.curso_nombre === nombre,
                    ).length;
                    return (
                      <button
                        key={nombre}
                        onClick={() => setCursoFiltro(nombre)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                          cursoFiltro === nombre
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                        )}
                      >
                        {nombre}
                        <span className="ml-1.5 text-xs opacity-70">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resultado del filtro */}
              {cursosMostrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No hay clases para el curso seleccionado.
                  </p>
                </div>
              ) : (
                <div
                  id="tour-clases-grid"
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {cursosMostrados.map((curso, index) => (
                    <div
                      key={curso.id}
                      id={index === 0 ? "tour-primera-card" : undefined}
                    >
                      <CursoCard
                        curso={curso}
                        onSelect={setCursoSeleccionado}
                        isExpanded={cursoExpandido === curso.id}
                        onToggleExpand={(e) => {
                          e.stopPropagation();
                          setCursoExpandido(
                            cursoExpandido === curso.id ? null : curso.id,
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}
    </div>
  );
}

export default function CursosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <CursosPageInner />
    </Suspense>
  );
}
