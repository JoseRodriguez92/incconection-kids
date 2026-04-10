"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { BookOpen, ChevronDown, ClipboardList, Pencil } from "lucide-react";
import type { GroupWithStudents, StudentInGroup, SubjectReport } from "../types";
import { getGradeLevel } from "@/lib/gradeLevel";
import type { GradeEditParams } from "@/components/principal/SuperAdmin/Resultados/hooks/useGradeEditor";
import type { FinalGradeEditParams } from "@/components/principal/SuperAdmin/Resultados/hooks/useFinalGradeEditor";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Offsets de las columnas fijas (deben coincidir con minWidth de cada una)
const COL = {
  num: { left: 0, minWidth: 36 },
  name: { left: 36, minWidth: 210 },
  cond: { left: 246, minWidth: 150 },
} as const;

const BG_HEADER = "white";
const BG_BODY = "white";

// Paleta de colores para los badges de materias (activo / inactivo)
const SUBJECT_COLORS = [
  { dot: "bg-blue-500", row: "bg-blue-500/10" },
  { dot: "bg-violet-500", row: "bg-violet-500/10" },
  { dot: "bg-amber-500", row: "bg-amber-500/10" },
  { dot: "bg-emerald-500", row: "bg-emerald-500/10" },
  { dot: "bg-rose-500", row: "bg-rose-500/10" },
  { dot: "bg-cyan-500", row: "bg-cyan-500/10" },
  { dot: "bg-orange-500", row: "bg-orange-500/10" },
  { dot: "bg-indigo-500", row: "bg-indigo-500/10" },
] as const;

/** Celdas sticky fijas del header — se repiten en cada fila para que sticky funcione */
function StickyHeaderCells({
  row,
}: {
  row: "label" | "empty-mid" | "empty-last";
}) {
  const borderB = row === "empty-last" ? "border-b border-border" : "";

  return (
    <>
      <th
        className={`sticky left-0 z-20 border-r border-border ${borderB}`}
        style={{ minWidth: COL.num.minWidth, backgroundColor: BG_HEADER }}
      >
        {row === "label" && (
          <span className="px-2 py-2 block text-center font-semibold">#</span>
        )}
      </th>
      <th
        className={`sticky z-20 border-r border-border ${borderB} whitespace-nowrap`}
        style={{
          left: COL.name.left,
          minWidth: COL.name.minWidth,
          backgroundColor: BG_HEADER,
        }}
      >
        {row === "label" && (
          <span className="px-3 py-2 block text-left font-semibold">
            Nombre
          </span>
        )}
      </th>
      <th
        className={`sticky z-20 border-r border-border ${borderB} whitespace-nowrap`}
        style={{
          left: COL.cond.left,
          minWidth: COL.cond.minWidth,
          backgroundColor: BG_HEADER,
        }}
      >
        {row === "label" && (
          <span className="px-3 py-2 block text-left font-semibold">
            Condición
          </span>
        )}
      </th>
    </>
  );
}

type Props = {
  group: GroupWithStudents;
  groupIdx: number;
  onViewGrades: (student: StudentInGroup, group: GroupWithStudents) => void;
  /** Si se pasa, las celdas Nota por trimestre se vuelven editables */
  onGradeEdit?: (params: GradeEditParams) => Promise<void>;
  /** Si se pasa, la celda N.F. se vuelve editable (solo super-admin) */
  onFinalGradeEdit?: (params: FinalGradeEditParams) => Promise<void>;
};

export function GradeTable({ group, groupIdx, onViewGrades, onGradeEdit, onFinalGradeEdit }: Props) {
  const allSubjects: SubjectReport[] =
    group.students.length > 0
      ? (group.students[0]?.subjects ?? [])
      : group.groupSubjects.map((gs) => ({
          groupHasClassId: gs.groupHasClassId,
          subjectId: gs.subjectId,
          subjectName: gs.subjectName,
          cycles: group.groupCycles.map((c) => ({
            cycleId: c.cycleId,
            cycleName: c.cycleName,
            grade: null,
            absences: 0,
          })),
          finalGrade: null,
        }));

  // 🔍 DEBUG — quitar cuando se resuelva el duplicado
  if (groupIdx === 0) {
    console.log(
      `[GradeTable] grupo="${group.name}" — ${allSubjects.length} materias:`,
      allSubjects.map((s) => ({
        groupHasClassId: s.groupHasClassId,
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        cycles: s.cycles.length,
      })),
    );
  }

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allSubjects.map((s) => s.groupHasClassId)),
  );

  const toggleSubject = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () =>
    setSelectedIds(
      allSelected
        ? new Set()
        : new Set(allSubjects.map((s) => s.groupHasClassId)),
    );

  const allSelected = selectedIds.size === allSubjects.length;
  const noneSelected = selectedIds.size === 0;

  // Solo las materias visibles se renderizan en la tabla
  const subjects = allSubjects.filter((s) =>
    selectedIds.has(s.groupHasClassId),
  );

  // Nombres para mostrar: si hay duplicados añade (1), (2)…
  const displayNames = (() => {
    const totals: Record<string, number> = {};
    allSubjects.forEach((s) => {
      totals[s.subjectName] = (totals[s.subjectName] ?? 0) + 1;
    });
    const seen: Record<string, number> = {};
    return allSubjects.map((s) => {
      if (totals[s.subjectName] <= 1) return s.subjectName;
      seen[s.subjectName] = (seen[s.subjectName] ?? 0) + 1;
      return `${s.subjectName} (${seen[s.subjectName]})`;
    });
  })();

  // ── Estado del editor de notas por trimestre ────────────────────────────
  type EditCell = { key: string; enrolledId: string; ghcId: string; cycleId: string; value: string };
  const [editCell, setEditCell] = useState<EditCell | null>(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (enrolledId: string, ghcId: string, cycleId: string, current: number | null) =>
    setEditCell({ key: `${enrolledId}:${ghcId}:${cycleId}`, enrolledId, ghcId, cycleId, value: current?.toString() ?? "" });

  const handleSave = async () => {
    if (!editCell || !onGradeEdit) return;
    const raw = parseFloat(editCell.value);
    if (isNaN(raw) || raw < 0 || raw > 120) {
      alert("La nota debe estar entre 0 y 120");
      return;
    }
    const grade = Math.round(raw);
    setSaving(true);
    try {
      await onGradeEdit({ enrolledId: editCell.enrolledId, groupHasClassId: editCell.ghcId, cycleId: editCell.cycleId, grade });
      setEditCell(null);
    } catch (e: any) {
      alert(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ── Estado del editor de nota final ─────────────────────────────────────
  type EditFinal = { key: string; enrolledId: string; ghcId: string; academicPeriodId: string; value: string };
  const [editFinal, setEditFinal] = useState<EditFinal | null>(null);
  const [savingFinal, setSavingFinal] = useState(false);

  const openFinalEdit = (enrolledId: string, ghcId: string, current: number | null) =>
    setEditFinal({ key: `${enrolledId}:${ghcId}:nf`, enrolledId, ghcId, academicPeriodId: group.year ?? "", value: current?.toString() ?? "" });

  const handleFinalSave = async () => {
    if (!editFinal || !onFinalGradeEdit) return;
    const raw = parseFloat(editFinal.value);
    if (isNaN(raw) || raw < 0 || raw > 120) {
      alert("La nota debe estar entre 0 y 120");
      return;
    }
    const grade = Math.round(raw);
    setSavingFinal(true);
    try {
      await onFinalGradeEdit({ enrolledId: editFinal.enrolledId, groupHasClassId: editFinal.ghcId, academicPeriodId: editFinal.academicPeriodId, grade });
      setEditFinal(null);
    } catch (e: any) {
      alert(e.message ?? "Error al guardar");
    } finally {
      setSavingFinal(false);
    }
  };

  return (
    <div className="mt-2 rounded-xl border border-border bg-white/70 overflow-hidden">
      {/* ── Filtro de materias ── */}
      {allSubjects.length > 1 && (
        <div className="px-4 py-2.5 border-b border-border flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors shrink-0">
                {/* Ícono libro con fondo del color primario */}
                <span className="flex items-center justify-center w-5 h-5 rounded bg-primary shrink-0">
                  <BookOpen className="w-3 h-3 text-white" />
                </span>
                <span>Materias</span>
                {!allSelected && (
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">
                    {selectedIds.size}/{allSubjects.length}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 opacity-40" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-2" align="start">
              {/* Fila "Todas" */}
              <label className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-muted cursor-pointer select-none">
                <Checkbox
                  checked={
                    allSelected ? true : noneSelected ? false : "indeterminate"
                  }
                  onCheckedChange={() => toggleAll()}
                />
                <span className="text-sm font-semibold">
                  Todas las materias
                </span>
              </label>

              <Separator className="my-1.5" />

              <div className="overflow-y-auto max-h-56 space-y-0.5">
                {allSubjects.map((subject, i) => {
                  const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                  const isOn = selectedIds.has(subject.groupHasClassId);
                  return (
                    <label
                      key={subject.groupHasClassId}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer select-none transition-colors ${
                        isOn ? color.row : "hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={isOn}
                        onCheckedChange={() =>
                          toggleSubject(subject.groupHasClassId)
                        }
                      />
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`}
                      />
                      <span className="text-sm truncate">
                        {displayNames[i]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* ── Estado vacío ── */}
      {noneSelected && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Selecciona al menos una materia para ver las notas.
        </div>
      )}

      {/* ── Tabla ── */}
      {!noneSelected && (
        <div className="overflow-x-auto">
          {/*
          border-separate + border-spacing-0:
          Necesario para que z-index funcione correctamente en celdas sticky.
          Con border-collapse el navegador ignora z-index en <th>/<td> sticky
          y las columnas desplazables se superponen a las fijas.
        */}
          <table className="text-xs border-separate border-spacing-0 w-full">
            <thead>
              {/* ── Fila 1: etiquetas fijas + nombre de cada materia ── */}
              <tr style={{ backgroundColor: "red" }}>
                <StickyHeaderCells row="label" />
                {subjects.map((subject) => (
                  <th
                    key={subject.groupHasClassId}
                    colSpan={subject.cycles.length * 2 + 1}
                    className="px-3 py-1.5 text-center font-bold border-b border-r border-border uppercase tracking-wide whitespace-nowrap"
                    style={{ backgroundColor: BG_HEADER }}
                  >
                    {subject.subjectName}
                  </th>
                ))}
              </tr>

              {/* ── Fila 2: vacío fijo + nombre de ciclos ── */}
              <tr style={{ backgroundColor: BG_HEADER }}>
                <StickyHeaderCells row="empty-mid" />
                {subjects.flatMap((subject) => [
                  ...subject.cycles.map((cycle) => (
                    <th
                      key={`${subject.groupHasClassId}-${cycle.cycleId}-ch`}
                      colSpan={2}
                      className="px-2 py-1 text-center border-b border-r border-border font-semibold whitespace-nowrap"
                      style={{ backgroundColor: BG_HEADER }}
                    >
                      Trimestre {cycle.cycleName}
                    </th>
                  )),
                  <th
                    key={`${subject.groupHasClassId}-nf-ch`}
                    className="px-2 py-1 text-center border-b border-r border-border font-semibold"
                    style={{ backgroundColor: BG_HEADER }}
                  >
                    N.F.
                  </th>,
                ])}
              </tr>

              {/* ── Fila 3: vacío fijo + Falla / Nota por ciclo ── */}
              <tr style={{ backgroundColor: BG_HEADER }}>
                <StickyHeaderCells row="empty-last" />
                {subjects.flatMap((subject) => [
                  ...subject.cycles.flatMap((cycle) => [
                    <th
                      key={`${subject.groupHasClassId}-${cycle.cycleId}-fh`}
                      className="px-2 py-1 text-center border-b border-r border-border text-rose-600 font-semibold whitespace-nowrap bg-rose-500/10"
                    >
                      Falla
                    </th>,
                    <th
                      key={`${subject.groupHasClassId}-${cycle.cycleId}-nh`}
                      className="px-2 py-1 text-center border-b border-r border-border whitespace-nowrap"
                      style={{ backgroundColor: BG_HEADER }}
                    >
                      Nota
                    </th>,
                  ]),
                  <th
                    key={`${subject.groupHasClassId}-nfh`}
                    className="px-2 py-1 text-center border-b border-r border-border w-12"
                    style={{ backgroundColor: BG_HEADER }}
                  >
                    —
                  </th>,
                ])}
              </tr>
            </thead>

            <tbody>
              {group.students.length === 0 && (
                <tr>
                  <td
                    colSpan={3 + subjects.reduce((acc, s) => acc + s.cycles.length * 2 + 1, 0)}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No hay estudiantes en este grupo.
                  </td>
                </tr>
              )}
              {group.students.map((student, idx) => {
                // Con border-separate, border-b en <tr> no funciona → va en cada <td>
                const isLast = idx === group.students.length - 1;
                const bB = isLast ? "" : " border-b border-border";
                const visibleSubjects = student.subjects.filter((s) =>
                  selectedIds.has(s.groupHasClassId),
                );

                return (
                  <tr
                    key={student.id}
                    id={
                      groupIdx === 0 && idx === 0
                        ? "tour-dg-estudiante"
                        : undefined
                    }
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {/* # */}
                    <td
                      className={`sticky left-0 z-10 px-2 py-2.5 text-center border-r border-border text-muted-foreground font-medium${bB}`}
                      style={{
                        minWidth: COL.num.minWidth,
                        backgroundColor: BG_BODY,
                      }}
                    >
                      {idx + 1}
                    </td>

                    {/* Nombre */}
                    <td
                      className={`sticky z-10 px-3 py-2 border-r border-border${bB}`}
                      style={{
                        left: COL.name.left,
                        minWidth: COL.name.minWidth,
                        backgroundColor: BG_BODY,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage
                            src={student.avatar_url ?? undefined}
                            alt={student.full_name}
                          />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {getInitials(student.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate leading-tight">
                            {student.full_name}
                          </p>
                          {!student.is_active && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-amber-600 border-amber-300 mt-0.5"
                            >
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          id={
                            groupIdx === 0 && idx === 0
                              ? "tour-dg-ver-notas"
                              : undefined
                          }
                          className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-primary"
                          title="Ver notas detalladas"
                          onClick={() => onViewGrades(student, group)}
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>

                    {/* Condición de aprendizaje */}
                    <td
                      className={`sticky z-10 px-3 py-2 border-r border-border${bB}`}
                      style={{
                        left: COL.cond.left,
                        minWidth: COL.cond.minWidth,
                        backgroundColor: BG_BODY,
                      }}
                    >
                      {student.learning_conditions.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {student.learning_conditions.map((lc) => (
                            <span
                              key={lc.id}
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium border"
                              style={
                                lc.color
                                  ? {
                                      backgroundColor: lc.color + "20",
                                      borderColor: lc.color,
                                      color: lc.color,
                                    }
                                  : {}
                              }
                            >
                              {lc.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Notas por materia (solo visibles) */}
                    {visibleSubjects.flatMap((subject) => [
                      ...subject.cycles.flatMap((cycle) => [
                        <td
                          key={`${subject.groupHasClassId}-${cycle.cycleId}-f`}
                          className={`px-3 py-2.5 text-center border-r border-border bg-rose-500/5${bB}`}
                        >
                          {cycle.absences > 0 ? (
                            <span className="text-orange-500 font-semibold">
                              {cycle.absences}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>,
                        <td
                          key={`${subject.groupHasClassId}-${cycle.cycleId}-n`}
                          className={`text-center border-r border-border font-semibold${bB} ${onGradeEdit ? "p-0" : "px-3 py-2.5"}`}
                        >
                          {onGradeEdit ? (() => {
                            const cellKey = `${student.enrolledId}:${subject.groupHasClassId}:${cycle.cycleId}`;
                            const isOpen = editCell?.key === cellKey;
                            return (
                              <Popover open={isOpen} onOpenChange={(o) => { if (!o) setEditCell(null); }}>
                                <PopoverTrigger asChild>
                                  <button
                                    className="w-full h-full px-3 py-2.5 flex items-center justify-center gap-1 group/edit hover:bg-primary/5 transition-colors"
                                    onClick={() => openEdit(student.enrolledId, subject.groupHasClassId, cycle.cycleId, cycle.grade)}
                                  >
                                    {cycle.grade !== null ? (
                                      <span className={getGradeLevel(cycle.grade).text}>{cycle.grade}</span>
                                    ) : (
                                      <span className="text-muted-foreground/50">—</span>
                                    )}
                                    <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/edit:opacity-40 shrink-0" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-44 p-3" align="center">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Nota (0 – 120)</p>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={120}
                                    value={editCell?.value ?? ""}
                                    onChange={(e) => setEditCell((prev) => prev ? { ...prev, value: e.target.value } : null)}
                                    className="h-8 text-sm mb-2"
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditCell(null); }}
                                  />
                                  <div className="flex gap-1.5">
                                    <Button size="sm" className="flex-1 h-7 text-xs" disabled={saving} onClick={handleSave}>
                                      {saving ? "..." : "Guardar"}
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setEditCell(null)}>✕</Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            );
                          })() : (
                            cycle.grade !== null ? (
                              <span className={getGradeLevel(cycle.grade).text}>{cycle.grade}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )
                          )}
                        </td>,
                      ]),
                      <td
                        key={`${subject.groupHasClassId}-nf`}
                        className={`text-center border-r border-border${bB} ${onFinalGradeEdit ? "p-0" : "px-2 py-1.5"}`}
                      >
                        {onFinalGradeEdit ? (() => {
                          const finalKey = `${student.enrolledId}:${subject.groupHasClassId}:nf`;
                          const isFinalOpen = editFinal?.key === finalKey;
                          return (
                            <Popover open={isFinalOpen} onOpenChange={(o) => { if (!o) setEditFinal(null); }}>
                              <PopoverTrigger asChild>
                                <button
                                  className="w-full h-full px-2 py-1.5 flex flex-col items-center justify-center gap-0.5 group/nf hover:bg-primary/5 transition-colors"
                                  onClick={() => openFinalEdit(student.enrolledId, subject.groupHasClassId, subject.finalGrade)}
                                >
                                  {subject.finalGrade !== null ? (() => {
                                    const lvl = getGradeLevel(subject.finalGrade);
                                    return (
                                      <>
                                        <span className={`font-bold text-sm ${lvl.text}`}>{subject.finalGrade}</span>
                                        <span className={`text-[9px] px-1.5 py-px rounded-full font-semibold leading-tight ${lvl.bg} ${lvl.text}`}>{lvl.label}</span>
                                      </>
                                    );
                                  })() : (
                                    <span className="text-muted-foreground/50">—</span>
                                  )}
                                  <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/nf:opacity-40 shrink-0" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-44 p-3" align="center">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Nota Final (0 – 120)</p>
                                <Input
                                  type="number"
                                  min={0}
                                  max={120}
                                  value={editFinal?.value ?? ""}
                                  onChange={(e) => setEditFinal((prev) => prev ? { ...prev, value: e.target.value } : null)}
                                  className="h-8 text-sm mb-2"
                                  autoFocus
                                  onKeyDown={(e) => { if (e.key === "Enter") handleFinalSave(); if (e.key === "Escape") setEditFinal(null); }}
                                />
                                <div className="flex gap-1.5">
                                  <Button size="sm" className="flex-1 h-7 text-xs" disabled={savingFinal} onClick={handleFinalSave}>
                                    {savingFinal ? "..." : "Guardar"}
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setEditFinal(null)}>✕</Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })() : subject.finalGrade !== null ? (() => {
                          const lvl = getGradeLevel(subject.finalGrade);
                          return (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`font-bold text-sm ${lvl.text}`}>{subject.finalGrade}</span>
                              <span className={`text-[9px] px-1.5 py-px rounded-full font-semibold leading-tight ${lvl.bg} ${lvl.text}`}>{lvl.label}</span>
                            </div>
                          );
                        })() : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>,
                    ])}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
