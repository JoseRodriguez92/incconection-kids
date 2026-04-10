"use client";

import { useState, useEffect, useCallback } from "react";
import { GraduationCap, HelpCircle, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudentGradesDialog } from "@/components/principal/Profesor/StudentGradesDialog";
import { useDirectorGrupoData } from "./hooks/useDirectorGrupoData";
import { GroupCard } from "./components/GroupCard";
import { ComunicadoModal } from "./components/ComunicadoModal";
import type { GroupWithStudents, StudentInGroup } from "./types";
import "driver.js/dist/driver.css";

export default function DirectorGrupoPage() {
  const { groups, loading, error } = useDirectorGrupoData();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [gradesTarget, setGradesTarget] = useState<{
    student: StudentInGroup;
    group: GroupWithStudents;
  } | null>(null);
  const [comunicadoOpen, setComunicadoOpen] = useState(false);

  // Abrir todos los grupos cuando se cargan por primera vez
  useEffect(() => {
    if (!loading && groups.length > 0 && openGroups.size === 0) {
      setOpenGroups(new Set(groups.map((g) => g.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, groups]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    const hasGroups = groups.length > 0;
    const hasStudents = groups.some((g) => g.students.length > 0);

    const steps: any[] = [
      {
        element: "#tour-dg-header",
        popover: {
          title: "🎓 Director de Grupo",
          description:
            "Aquí gestionas y supervisas a los estudiantes de los grupos que tienes asignados como director.",
          side: "bottom",
          align: "start",
        },
      },
    ];

    if (hasGroups) {
      steps.push({
        element: "#tour-dg-grupo",
        popover: {
          title: "📂 Grupos asignados",
          description:
            "Cada grupo muestra el nombre, el curso y la cantidad de estudiantes activos. Haz clic en el encabezado para expandir o colapsar la lista de estudiantes.",
          side: "bottom",
        },
      });
    }

    if (hasStudents) {
      steps.push(
        {
          element: "#tour-dg-estudiante",
          popover: {
            title: "👤 Tarjeta de estudiante",
            description:
              "Cada fila muestra el nombre y estado del estudiante junto con su condición de aprendizaje.",
            side: "top",
          },
        },
        {
          element: "#tour-dg-ver-notas",
          popover: {
            title: "📋 Ver notas",
            description:
              "Abre el boletín completo del estudiante: notas por trimestre en cada materia, promedio general y estado de aprobación.",
            side: "left",
          },
        },
      );
    }

    steps.push(
      {
        element: "#tour-dg-comunicado",
        popover: {
          title: "📣 Crear comunicado",
          description:
            "Envía un mensaje masivo por correo a todos los estudiantes y padres del grupo. Puedes personalizar los destinatarios y adjuntar archivos.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-dg-boton",
        popover: {
          title: "❓ Tour de ayuda",
          description:
            "Puedes relanzar este recorrido en cualquier momento haciendo clic aquí.",
          side: "bottom",
          align: "end",
        },
      },
    );

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
  }, [groups]);

  return (
    <div className="min-w-0 w-full bg-transparent">
      {/* Header */}
      <div
        id="tour-dg-header"
        className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b px-6 py-6 z-1 relative"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/15 rounded-xl">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Director de Grupo
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Gestiona y supervisa a los estudiantes de tu grupo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!loading && groups.length > 0 && (
              <Button
                id="tour-dg-comunicado"
                onClick={() => setComunicadoOpen(true)}
                className="flex items-center gap-2"
              >
                <Megaphone className="h-4 w-4" />
                Crear comunicado
              </Button>
            )}
            <Button
              id="tour-dg-boton"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={startTour}
            >
              <HelpCircle className="h-4 w-4" />
              Tour de la sección
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-5 relative z-1">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Cargando grupos...</p>
          </div>
        )}

        {!loading && error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center text-red-700 text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="p-5 bg-muted/40 rounded-full inline-flex">
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-semibold">Sin grupos asignados</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                  No estás asignado como director de ningún grupo actualmente.
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && groups.length > 0 && (
          <div className="space-y-5">
            {groups.map((group, groupIdx) => (
              <GroupCard
                key={group.id}
                group={group}
                groupIdx={groupIdx}
                isOpen={openGroups.has(group.id)}
                onToggle={() => toggleGroup(group.id)}
                onViewGrades={(student, grp) =>
                  setGradesTarget({ student, group: grp })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal notas */}
      {gradesTarget && (
        <StudentGradesDialog
          open={!!gradesTarget}
          onClose={() => setGradesTarget(null)}
          studentName={gradesTarget.student.full_name}
          enrolledId={gradesTarget.student.enrolledId}
          groupId={gradesTarget.group.id}
          academicPeriodId={gradesTarget.group.year ?? ""}
        />
      )}

      {/* Modal comunicado */}
      <ComunicadoModal
        open={comunicadoOpen}
        onClose={() => setComunicadoOpen(false)}
        groups={groups}
      />
    </div>
  );
}
