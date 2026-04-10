"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarCheck } from "lucide-react";

type CourseOption = { id: string; name: string };
type PeriodOption = { id: string; name: string } | null;

type Props = {
  courses: CourseOption[];
  selectedCourseId: string | null;
  onCourseChange: (id: string | null) => void;
  activePeriod: PeriodOption;
  totalGroups: number;
  totalStudents: number;
};

export function ResultadosFilters({
  courses,
  selectedCourseId,
  onCourseChange,
  activePeriod,
  totalGroups,
  totalStudents,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Período activo — solo informativo */}
      {activePeriod && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm font-medium shrink-0">
          <CalendarCheck className="w-3.5 h-3.5" />
          {activePeriod.name}
        </div>
      )}

      {/* Select de curso */}
      <Select
        value={selectedCourseId ?? ""}
        onValueChange={(v) => onCourseChange(v || null)}
      >
        <SelectTrigger className="w-56">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Seleccionar curso" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {courses.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Conteos */}
      {selectedCourseId && totalGroups > 0 && (
        <div className="flex items-center gap-2 ml-1">
          <Badge variant="secondary">
            {totalGroups} {totalGroups === 1 ? "grupo" : "grupos"}
          </Badge>
          <Badge variant="secondary">
            {totalStudents} {totalStudents === 1 ? "estudiante" : "estudiantes"}
          </Badge>
        </div>
      )}
    </div>
  );
}
