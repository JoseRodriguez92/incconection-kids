"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

type CycleGrade = Database["public"]["Tables"]["student_cycle_grade"]["Row"];
type FinalGrade = Database["public"]["Tables"]["student_final_grade"]["Row"];

type PeriodCycle = {
  apHasCycleId: string;
  cycleName: string;
};

type SubjectReport = {
  classId: string;
  subjectName: string;
  subjectCode: string | null;
  cycleGrades: Record<string, number>;
  finalGrade: number | null;
  isLocked: boolean;
};

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

interface Props {
  open: boolean;
  onClose: () => void;
  studentName: string;
  enrolledId: string;       // student_enrolled.id
  groupId: string;
  academicPeriodId: string; // group.year (que es el academic_period_id)
}

export function StudentGradesDialog({
  open,
  onClose,
  studentName,
  enrolledId,
  groupId,
  academicPeriodId,
}: Props) {
  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [subjects, setSubjects] = useState<SubjectReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !enrolledId || !groupId || !academicPeriodId) return;

    const fetchNotas = async () => {
      setLoading(true);
      setError(null);
      setCycles([]);
      setSubjects([]);
      try {
        const supabase = createClient();

        // 1. Ciclos activos del período
        const { data: apCycles, error: cyclesErr } = await supabase
          .from("academic_period_has_cycle")
          .select("id, cycles(id, name)")
          .eq("academic_period_id", academicPeriodId)
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
            a.cycleName.localeCompare(b.cycleName, undefined, { numeric: true }),
          );
        setCycles(periodCycles);

        // 2. Clases activas del grupo
        const { data: classes, error: classErr } = await supabase
          .from("group_has_class")
          .select("id, subject:subject_id(id, name, code)")
          .eq("group_id", groupId)
          .eq("is_active", true);
        if (classErr) throw classErr;

        // 3. Notas por ciclo del estudiante
        const apCycleIds = periodCycles.map((c) => c.apHasCycleId);
        const { data: cycleGrades, error: cgErr } =
          apCycleIds.length > 0
            ? await supabase
                .from("student_cycle_grade")
                .select("*")
                .eq("student_enrolled_id", enrolledId)
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
                .eq("student_enrolled_id", enrolledId)
                .eq("academic_period_id", academicPeriodId)
                .in("group_has_class_id", classIds)
            : { data: [] as FinalGrade[], error: null };
        if (fgErr) throw fgErr;

        // 5. Armar reporte por materia
        const reports: SubjectReport[] = (classes ?? []).map((cls: any) => {
          const subject = cls.subject as {
            id: string;
            name: string;
            code: string | null;
          } | null;

          const classCycleGrades: Record<string, number> = {};
          for (const cg of cycleGrades ?? []) {
            if (cg.group_has_class_id === cls.id) {
              classCycleGrades[cg.academic_period_has_cycle_id] = cg.grade;
            }
          }

          const fg = (finalGrades ?? []).find(
            (f: FinalGrade) => f.group_has_class_id === cls.id,
          );

          return {
            classId: cls.id,
            subjectName: subject?.name ?? "Materia sin nombre",
            subjectCode: subject?.code ?? null,
            cycleGrades: classCycleGrades,
            finalGrade: fg?.final_grade ?? null,
            isLocked: fg?.is_locked ?? false,
          };
        });

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
  }, [open, enrolledId, groupId, academicPeriodId]);

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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Registro de notas — {studentName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando notas...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Sin datos */}
          {!loading && !error && subjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="rounded-full bg-muted p-5">
                <ClipboardList className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold">Sin notas registradas</p>
                <p className="text-sm text-muted-foreground">
                  Este estudiante aún no tiene calificaciones en el período activo.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && subjects.length > 0 && (
            <>
              {/* Tarjetas resumen */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Materias</p>
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{subjects.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {withFinal.length} con nota final
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Promedio</p>
                      <Award className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p
                      className={`text-2xl font-bold ${
                        promedio
                          ? gradeColor(parseFloat(promedio))
                          : "text-muted-foreground"
                      }`}
                    >
                      {promedio ?? "—"}
                    </p>
                    {promedio && (
                      <p className="text-xs text-muted-foreground">
                        {calcDesempeño(parseFloat(promedio))}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Aprobadas</p>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{aprobadas}</p>
                    <p className="text-xs text-muted-foreground">
                      de {withFinal.length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Reprobadas</p>
                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{reprobadas}</p>
                    <p className="text-xs text-muted-foreground">
                      {reprobadas === 0 ? "¡Excelente!" : "Requieren atención"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de calificaciones */}
              <Card>
                <CardContent className="p-0">
                  <div className="px-4 py-3 border-b flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">
                      Calificaciones por materia
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      — notas por trimestre y resultado final
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
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
                              <td className="py-4 px-4">
                                <div className="font-medium">{s.subjectName}</div>
                                {s.subjectCode && (
                                  <div className="text-xs text-muted-foreground font-mono">
                                    {s.subjectCode}
                                  </div>
                                )}
                              </td>

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
                  <div className="flex items-center gap-3 flex-wrap px-4 py-3 border-t">
                    <span className="text-xs text-muted-foreground font-medium">
                      Escala de desempeño:
                    </span>
                    {[
                      { label: "SUPERIOR", range: "107–120", color: desempeñoColor("SUPERIOR") },
                      { label: "ALTO", range: "95–106", color: desempeñoColor("ALTO") },
                      { label: "BÁSICO", range: "84–94", color: desempeñoColor("BÁSICO") },
                      { label: "BAJO", range: "< 84", color: desempeñoColor("BAJO") },
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
      </DialogContent>
    </Dialog>
  );
}
