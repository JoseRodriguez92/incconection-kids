"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudentContextStore } from "@/Stores/studentContextStore";
import type { Database } from "@/src/types/database.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type CycleGrade = Database["public"]["Tables"]["student_cycle_grade"]["Row"];
type FinalGrade = Database["public"]["Tables"]["student_final_grade"]["Row"];

type PeriodCycle = {
  apHasCycleId: string; // academic_period_has_cycle.id
  cycleName: string;
};

type SubjectReport = {
  classId: string;
  subjectName: string;
  subjectCode: string | null;
  // keyed by apHasCycleId → grade value
  cycleGrades: Record<string, number>;
  finalGrade: number | null;
  finalObservation: string | null;
  isLocked: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcDesempeño(grade: number): string {
  if (grade >= 107) return "SUPERIOR";
  if (grade >= 95) return "ALTO";
  if (grade >= 84) return "BÁSICO";
  return "BAJO";
}

function desempeñoColor(d: string) {
  if (d === "SUPERIOR") return "bg-purple-100 text-purple-700 border-purple-200";
  if (d === "ALTO") return "bg-blue-100 text-blue-700 border-blue-200";
  if (d === "BÁSICO") return "bg-green-100 text-green-700 border-green-200";
  return "bg-red-100 text-red-700 border-red-200";
}

function gradeColor(grade: number) {
  if (grade >= 107) return "text-purple-700 font-bold";
  if (grade >= 95) return "text-blue-700 font-bold";
  if (grade >= 84) return "text-green-700 font-bold";
  return "text-red-700 font-bold";
}

// ── Componente ────────────────────────────────────────────────────────────────
export function RegistroNotasView() {
  const { enrollment, activePeriod, group } = useStudentContextStore();

  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [subjects, setSubjects] = useState<SubjectReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enrollment?.id || !activePeriod?.id || !group?.id) return;

    const fetchNotas = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        // 1. Ciclos del periodo activo
        const { data: apCycles, error: cyclesErr } = await supabase
          .from("academic_period_has_cycle")
          .select("id, cycles(id, name)")
          .eq("academic_period_id", activePeriod.id)
          .eq("is_active", true)
          .order("id");

        if (cyclesErr) throw cyclesErr;

        const periodCycles: PeriodCycle[] = (apCycles ?? [])
          .filter((r: any) => r.cycles)
          .map((r: any) => ({
            apHasCycleId: r.id,
            cycleName: r.cycles.name as string,
          }))
          .sort((a: PeriodCycle, b: PeriodCycle) =>
            a.cycleName.localeCompare(b.cycleName, undefined, { numeric: true })
          );

        setCycles(periodCycles);

        // 2. Clases del grupo (con materia)
        const { data: classes, error: classErr } = await supabase
          .from("group_has_class")
          .select("id, subject:subject_id(id, name, code)")
          .eq("group_id", group.id)
          .eq("is_active", true);

        if (classErr) throw classErr;

        // 3. Notas por ciclo del estudiante
        const apCycleIds = periodCycles.map((c) => c.apHasCycleId);
        const { data: cycleGrades, error: cgErr } =
          apCycleIds.length > 0
            ? await supabase
                .from("student_cycle_grade")
                .select("*")
                .eq("student_enrolled_id", enrollment.id)
                .in("academic_period_has_cycle_id", apCycleIds)
            : { data: [] as CycleGrade[], error: null };

        if (cgErr) throw cgErr;

        // 4. Notas finales del estudiante
        const classIds = (classes ?? []).map((c: any) => c.id);
        const { data: finalGrades, error: fgErr } =
          classIds.length > 0
            ? await supabase
                .from("student_final_grade")
                .select("*")
                .eq("student_enrolled_id", enrollment.id)
                .eq("academic_period_id", activePeriod.id)
                .in("group_has_class_id", classIds)
            : { data: [] as FinalGrade[], error: null };

        if (fgErr) throw fgErr;

        // 5. Armar reporte por materia
        const reports: SubjectReport[] = (classes ?? []).map((cls: any) => {
          const subject = cls.subject as
            | { id: string; name: string; code: string | null }
            | null;

          // Notas de ciclo para esta clase
          const classCycleGrades: Record<string, number> = {};
          for (const cg of cycleGrades ?? []) {
            if (cg.group_has_class_id === cls.id) {
              classCycleGrades[cg.academic_period_has_cycle_id] = cg.grade;
            }
          }

          // Nota final
          const fg = (finalGrades ?? []).find(
            (f: FinalGrade) => f.group_has_class_id === cls.id
          );

          return {
            classId: cls.id,
            subjectName: subject?.name ?? "Materia sin nombre",
            subjectCode: subject?.code ?? null,
            cycleGrades: classCycleGrades,
            finalGrade: fg?.final_grade ?? null,
            finalObservation: fg?.observation ?? null,
            isLocked: fg?.is_locked ?? false,
          };
        });

        // Ordenar: materias con nota final primero, luego sin datos
        reports.sort((a, b) => {
          const aHas = a.finalGrade !== null ? 0 : 1;
          const bHas = b.finalGrade !== null ? 0 : 1;
          if (aHas !== bHas) return aHas - bHas;
          return a.subjectName.localeCompare(b.subjectName);
        });

        setSubjects(reports);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, [enrollment?.id, activePeriod?.id, group?.id]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const withFinal = subjects.filter((s) => s.finalGrade !== null);
  const aprobadas = withFinal.filter((s) => (s.finalGrade ?? 0) >= 84).length;
  const reprobadas = withFinal.filter((s) => (s.finalGrade ?? 0) < 84).length;
  const promedio =
    withFinal.length > 0
      ? (
          withFinal.reduce((acc, s) => acc + (s.finalGrade ?? 0), 0) /
          withFinal.length
        ).toFixed(1)
      : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1 relative z-1">
        <h1 className="text-3xl font-bold tracking-tight">Registro de Notas</h1>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-sm">
            Calificaciones del periodo académico actual
          </p>
          {activePeriod && (
            <>
              <span className="text-muted-foreground">•</span>
              <Badge className="text-sm bg-green-600 hover:bg-green-700 text-white">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-100" />
                  </span>
                  📅 {activePeriod.name}
                </span>
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Cargando notas...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sin datos */}
      {!loading && !error && subjects.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="rounded-full bg-muted p-6">
                <ClipboardList className="h-14 w-14 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg">
                  No hay notas registradas
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Aún no tienes calificaciones en el periodo activo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && subjects.length > 0 && (
        <>
          {/* Tarjetas resumen */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Materias</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects.length}</div>
                <p className="text-xs text-muted-foreground">
                  {withFinal.length} con nota final
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio Final</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${promedio ? gradeColor(parseFloat(promedio)) : "text-muted-foreground"}`}
                >
                  {promedio ?? "—"}
                </div>
                {promedio && (
                  <p className="text-xs text-muted-foreground">
                    {calcDesempeño(parseFloat(promedio))}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {aprobadas}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {withFinal.length} calificadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reprobadas</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {reprobadas}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reprobadas === 0 ? "¡Excelente!" : "Requieren atención"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Boletín por materia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Calificaciones por Materia
              </CardTitle>
              <CardDescription>
                Notas por trimestre y resultado final del periodo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 pr-4 font-semibold text-muted-foreground">
                        Materia
                      </th>
                      {cycles.map((c) => (
                        <th
                          key={c.apHasCycleId}
                          className="text-center py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap"
                        >
                          {c.cycleName}
                        </th>
                      ))}
                      <th className="text-center py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">
                        Nota Final
                      </th>
                      <th className="text-center py-3 px-3 font-semibold text-muted-foreground">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s) => {
                      const estado =
                        s.finalGrade !== null
                          ? s.finalGrade >= 84
                            ? "APROBADO"
                            : "REPROBADO"
                          : null;

                      return (
                        <tr
                          key={s.classId}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          {/* Materia */}
                          <td className="py-4 pr-4">
                            <div className="font-medium">{s.subjectName}</div>
                            {s.subjectCode && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {s.subjectCode}
                              </div>
                            )}
                          </td>

                          {/* Notas por ciclo */}
                          {cycles.map((c) => {
                            const grade = s.cycleGrades[c.apHasCycleId];
                            return (
                              <td
                                key={c.apHasCycleId}
                                className="text-center py-4 px-3"
                              >
                                {grade !== undefined ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={gradeColor(grade)}>
                                      {grade}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] px-1 py-0 ${desempeñoColor(calcDesempeño(grade))}`}
                                    >
                                      {calcDesempeño(grade)}
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}

                          {/* Nota final */}
                          <td className="text-center py-4 px-3">
                            {s.finalGrade !== null ? (
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`text-base ${gradeColor(s.finalGrade)}`}
                                >
                                  {s.finalGrade}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1 py-0 ${desempeñoColor(calcDesempeño(s.finalGrade))}`}
                                >
                                  {calcDesempeño(s.finalGrade)}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                Pendiente
                              </span>
                            )}
                          </td>

                          {/* Estado */}
                          <td className="text-center py-4 px-3">
                            {estado === "APROBADO" && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Aprobado
                              </Badge>
                            )}
                            {estado === "REPROBADO" && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                                <XCircle className="h-3 w-3" />
                                Reprobado
                              </Badge>
                            )}
                            {estado === null && (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Leyenda desempeño */}
              <div className="flex items-center gap-3 flex-wrap mt-5 pt-4 border-t">
                <span className="text-xs text-muted-foreground font-medium">
                  Escala de desempeño:
                </span>
                {[
                  { label: "SUPERIOR", range: "107–120", color: desempeñoColor("SUPERIOR") },
                  { label: "ALTO",     range: "95–106",  color: desempeñoColor("ALTO") },
                  { label: "BÁSICO",   range: "84–94",   color: desempeñoColor("BÁSICO") },
                  { label: "BAJO",     range: "< 84",    color: desempeñoColor("BAJO") },
                ].map((d) => (
                  <Badge
                    key={d.label}
                    variant="outline"
                    className={`text-xs ${d.color}`}
                  >
                    {d.label} ({d.range})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
