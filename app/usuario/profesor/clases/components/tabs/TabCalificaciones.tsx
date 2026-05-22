"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import { Zap, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Estudiante } from "../../types";
import type { CycleWithRelation } from "@/Stores/cycleStore";
import type { GroupHasActivity } from "@/Stores/groupHasActivityStore";

interface TabCalificacionesProps {
  estudiantes: Estudiante[];
  ciclos?: CycleWithRelation[];
  actividades?: GroupHasActivity[];
  groupHasClassId?: string;
}

export function TabCalificaciones({
  estudiantes,
  ciclos = [],
  actividades = [],
  groupHasClassId,
}: TabCalificacionesProps) {
  // Clave: `${ghs_id}-${academic_period_has_cycle_id}`
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [calculatingCycle, setCalculatingCycle] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Cargar notas existentes de BD
  useEffect(() => {
    if (!groupHasClassId || estudiantes.length === 0 || ciclos.length === 0) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("student_cycle_grade")
        .select("student_enrolled_id, academic_period_has_cycle_id, grade")
        .eq("group_has_class_id", groupHasClassId);
      if (data) {
        const map: Record<string, string> = {};
        for (const row of data) {
          map[`${row.student_enrolled_id}-${row.academic_period_has_cycle_id}`] = String(row.grade);
        }
        setGrades(map);
      }
    };
    load();
  }, [groupHasClassId, estudiantes.length, ciclos.length]);

  const getGrade = (ghs_id: string, apCycleId: string) =>
    grades[`${ghs_id}-${apCycleId}`] ?? "";

  const setGrade = (ghs_id: string, apCycleId: string, value: string) =>
    setGrades((prev) => ({ ...prev, [`${ghs_id}-${apCycleId}`]: value }));

  // Nota final = promedio de los ciclos con nota cargada
  const getNotaFinal = (ghs_id: string) => {
    const vals = ciclos
      .map((c) => parseFloat(grades[`${ghs_id}-${c.academic_period_has_cycle_id}`] ?? ""))
      .filter((v) => !isNaN(v));
    if (vals.length === 0) return "—";
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  // ── Calcular nota parcial de un ciclo desde las actividades ──
  const calcularNotaParcial = async (ciclo: CycleWithRelation) => {
    // cycle_id puede ser cycles.id O academic_period_has_cycle_id según cómo se guardó la actividad
    const actsCiclo = actividades.filter(
      (a) => a.cycle_id === ciclo.id || a.cycle_id === ciclo.academic_period_has_cycle_id,
    );
    if (actsCiclo.length === 0) {
      toast.warning(`No hay actividades en ${ciclo.name}`);
      return;
    }

    setCalculatingCycle(ciclo.academic_period_has_cycle_id);
    try {
      const supabase = createClient();
      const { data: subs } = await supabase
        .from("student_activity_submission")
        .select("student_enrolled_id, group_has_activity_id, grade")
        .in("group_has_activity_id", actsCiclo.map((a) => a.id));

      const submissions = subs ?? [];
      const updates: Record<string, string> = {};
      const hasPercentages = actsCiclo.some((a) => a.grade_percentage !== null);

      for (const est of estudiantes) {
        const ghs_id = est.ghs_id ?? est.id;

        let weightedSum = 0;
        let totalWeight = 0;
        let simpleSum = 0;
        let simpleCount = 0;

        for (const act of actsCiclo) {
          const sub = submissions.find(
            (s) => s.group_has_activity_id === act.id && s.student_enrolled_id === ghs_id,
          );
          if (sub?.grade !== null && sub?.grade !== undefined) {
            simpleSum += sub.grade;
            simpleCount++;
            if (hasPercentages && act.grade_percentage) {
              weightedSum += sub.grade * act.grade_percentage;
              totalWeight += act.grade_percentage;
            }
          }
        }

        let nota: number;
        if (hasPercentages && totalWeight > 0) {
          nota = weightedSum / totalWeight;
        } else if (simpleCount > 0) {
          nota = simpleSum / simpleCount;
        } else {
          nota = 0;
        }

        updates[`${ghs_id}-${ciclo.academic_period_has_cycle_id}`] = nota.toFixed(1);
      }

      setGrades((prev) => ({ ...prev, ...updates }));
      toast.success(`Notas de ${ciclo.name} calculadas`);
    } catch {
      toast.error("Error al calcular notas");
    } finally {
      setCalculatingCycle(null);
    }
  };

  // ── Guardar todas las notas a BD ──
  const guardarNotas = async () => {
    if (!groupHasClassId) return;
    setSaving(true);
    try {
      const supabase = createClient();

      // Construir filas a guardar
      const rows: {
        student_enrolled_id: string;
        academic_period_has_cycle_id: string;
        group_has_class_id: string;
        grade: number;
        is_active: boolean;
        updated_at: string;
      }[] = [];

      for (const est of estudiantes) {
        const ghs_id = est.ghs_id ?? est.id;
        for (const ciclo of ciclos) {
          const val = grades[`${ghs_id}-${ciclo.academic_period_has_cycle_id}`];
          if (val === undefined || val === "") continue;
          const grade = parseFloat(val);
          if (isNaN(grade)) continue;
          rows.push({
            student_enrolled_id: ghs_id,
            academic_period_has_cycle_id: ciclo.academic_period_has_cycle_id,
            group_has_class_id: groupHasClassId,
            grade,
            is_active: true,
            updated_at: new Date().toISOString(),
          });
        }
      }

      if (rows.length === 0) {
        toast.warning("No hay notas para guardar");
        return;
      }

      // Borrar existentes y reinsertar (evita conflictos de constraint desconocido)
      await supabase
        .from("student_cycle_grade")
        .delete()
        .eq("group_has_class_id", groupHasClassId);

      const { error } = await supabase.from("student_cycle_grade").insert(rows);
      if (error) throw error;

      toast.success("Notas guardadas correctamente");
    } catch (err: any) {
      toast.error("Error al guardar: " + (err?.message ?? ""));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabla de Calificaciones</CardTitle>
        <CardDescription>
          {ciclos.length > 0
            ? "Calificaciones por ciclo y estudiante"
            : "No hay ciclos disponibles para el periodo académico actual"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ciclos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron ciclos para mostrar calificaciones.</p>
            <p className="text-sm mt-2">
              Por favor, configure los ciclos del periodo académico.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10">
                      Estudiante
                    </TableHead>
                    {ciclos.map((ciclo) => (
                      <TableHead
                        key={ciclo.id}
                        className="text-center min-w-[130px]"
                      >
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <span className="font-semibold">{ciclo.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] gap-1 px-2 font-normal"
                            disabled={
                              calculatingCycle === ciclo.academic_period_has_cycle_id
                            }
                            onClick={() => calcularNotaParcial(ciclo)}
                            title={`Calcular nota parcial del ${ciclo.name} desde actividades`}
                          >
                            {calculatingCycle === ciclo.academic_period_has_cycle_id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3" />
                            )}
                            Calcular
                          </Button>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold bg-primary/5 min-w-[100px]">
                      Nota Final
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiantes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={ciclos.length + 2}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No hay estudiantes inscritos en este curso
                      </TableCell>
                    </TableRow>
                  ) : (
                    estudiantes.map((estudiante) => {
                      const ghs_id = estudiante.ghs_id ?? estudiante.id;
                      return (
                        <TableRow key={estudiante.id}>
                          <TableCell className="sticky left-0 bg-background z-10">
                            <p className="font-medium text-sm">
                              {estudiante.nombre || estudiante.full_name}
                            </p>
                            <ConditionBadges
                              conditions={estudiante.conditions}
                              className="mt-0.5"
                            />
                          </TableCell>
                          {ciclos.map((ciclo) => (
                            <TableCell key={ciclo.id} className="text-center">
                              <Input
                                className="w-20 text-center mx-auto"
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="—"
                                value={getGrade(ghs_id, ciclo.academic_period_has_cycle_id)}
                                onChange={(e) =>
                                  setGrade(
                                    ghs_id,
                                    ciclo.academic_period_has_cycle_id,
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                          ))}
                          <TableCell className="text-center bg-primary/5">
                            <Badge variant="outline" className="font-semibold">
                              {getNotaFinal(ghs_id)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Total de estudiantes: <strong>{estudiantes.length}</strong>
              </p>
              <Button
                disabled={estudiantes.length === 0 || saving || !groupHasClassId}
                onClick={guardarNotas}
                className="gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar notas
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
