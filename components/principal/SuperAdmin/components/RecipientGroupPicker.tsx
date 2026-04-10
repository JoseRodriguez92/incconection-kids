"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  ChevronDown,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────────────────────
type CourseOption = {
  id: string;
  name: string;
  gradeNumber: number | null;
};

type GroupOption = {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  directorId: string | null;
};

type RecipientType = "parents" | "students" | "teachers";

const RECIPIENT_OPTIONS: { key: RecipientType; label: string }[] = [
  { key: "parents", label: "Padres de familia" },
  { key: "students", label: "Estudiantes" },
  { key: "teachers", label: "Director de grupo" },
];

interface RecipientGroupPickerProps {
  /** Recibe los emails resueltos y la etiqueta del grupo para mostrar al usuario */
  onAdd: (emails: string[], label: string) => void;
}

// ── Componente ───────────────────────────────────────────────────────────────
export function RecipientGroupPicker({ onAdd }: RecipientGroupPickerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos cargados desde Supabase
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [allGroups, setAllGroups] = useState<GroupOption[]>([]);

  // Selección del usuario
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [recipientTypes, setRecipientTypes] = useState<Set<RecipientType>>(
    new Set(["parents"])
  );

  // Derivados
  const filteredGroups = allGroups.filter((g) => g.courseId === selectedCourseId);
  const selectedGroup = allGroups.find((g) => g.id === selectedGroupId);
  const canAdd = selectedGroupId !== "" && recipientTypes.size > 0;

  // ── Cargar datos cuando se abre el popover ────────────────────────────────
  useEffect(() => {
    if (!open || allGroups.length > 0) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        // 1. Período académico activo
        const { data: period, error: periodErr } = await supabase
          .from("academic_period")
          .select("id")
          .eq("is_active", true)
          .single();

        if (periodErr || !period) throw new Error("No hay período académico activo");
        setActivePeriodId(period.id);

        // 2. Grupos del período activo (groups.year = academic_period.id)
        //    con join a courses para nombre y grado
        const { data: groupData, error: groupErr } = await supabase
          .from("groups")
          .select(
            `id, name, director_id,
             courses!groups_course_id_fkey (id, name, grade_number)`
          )
          .eq("year", period.id)
          .order("name");

        if (groupErr) throw groupErr;

        const mapped: GroupOption[] = (groupData ?? []).map((g: any) => ({
          id: g.id,
          name: g.name,
          courseId: g.courses?.id ?? "",
          courseName: g.courses?.name ?? "Sin curso",
          directorId: g.director_id ?? null,
        }));

        // Cursos únicos derivados de los grupos, ordenados por grado
        const courseMap = new Map<string, CourseOption>();
        for (const g of mapped) {
          if (g.courseId && !courseMap.has(g.courseId)) {
            const raw = (groupData ?? []).find((r: any) => r.courses?.id === g.courseId);
            courseMap.set(g.courseId, {
              id: g.courseId,
              name: g.courseName,
              gradeNumber: raw?.courses?.grade_number ?? null,
            });
          }
        }

        const sortedCourses = Array.from(courseMap.values()).sort(
          (a, b) =>
            (a.gradeNumber ?? 99) - (b.gradeNumber ?? 99) ||
            a.name.localeCompare(b.name)
        );

        setAllGroups(mapped);
        setCourses(sortedCourses);
      } catch (err: any) {
        setError(err.message ?? "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, allGroups.length]);

  // Limpiar grupo cuando cambia el curso
  useEffect(() => {
    setSelectedGroupId("");
  }, [selectedCourseId]);

  // ── Toggle tipo de destinatario ───────────────────────────────────────────
  const toggleType = (type: RecipientType) => {
    setRecipientTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  // ── Resolver correos y llamar a onAdd ─────────────────────────────────────
  const handleAdd = async () => {
    if (!canAdd || !activePeriodId) return;
    setResolving(true);
    setError(null);

    try {
      const supabase = createClient();
      const allEmails = new Set<string>();

      // Obtener estudiantes activos del grupo en el período activo
      const { data: ghs } = await supabase
        .from("group_has_students")
        .select(
          `student_enrolled!group_has_students_student_enrolled_id_fkey (
            id, user_id, academic_period_id, is_active
          )`
        )
        .eq("group_id", selectedGroupId);

      const activeStudentUserIds = (ghs ?? [])
        .map((r: any) => r.student_enrolled)
        .filter(
          (se: any) =>
            se &&
            se.is_active === true &&
            se.academic_period_id === activePeriodId
        )
        .map((se: any) => se.user_id as string);

      // ── Padres ────────────────────────────────────────────────────────────
      if (recipientTypes.has("parents") && activeStudentUserIds.length > 0) {
        const { data: phsRows } = await supabase
          .from("parent_has_student")
          .select("parent_id")
          .in("student_id", activeStudentUserIds);

        const parentIds = (phsRows ?? [])
          .map((r: any) => r.parent_id as string)
          .filter(Boolean);

        if (parentIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("email")
            .in("id", parentIds);

          for (const p of profiles ?? []) {
            if (p.email) allEmails.add(p.email.toLowerCase());
          }
        }
      }

      // ── Estudiantes ───────────────────────────────────────────────────────
      if (recipientTypes.has("students") && activeStudentUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("email")
          .in("id", activeStudentUserIds);

        for (const p of profiles ?? []) {
          if (p.email) allEmails.add(p.email.toLowerCase());
        }
      }

      // ── Director de grupo ─────────────────────────────────────────────────
      if (recipientTypes.has("teachers") && selectedGroup?.directorId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", selectedGroup.directorId)
          .single();

        if (profile?.email) allEmails.add(profile.email.toLowerCase());
      }

      if (allEmails.size === 0) {
        setError("No se encontraron correos para la selección");
        return;
      }

      // Etiqueta descriptiva
      const typeLabels: Record<RecipientType, string> = {
        parents: "padres",
        students: "estudiantes",
        teachers: "director",
      };
      const typeParts = Array.from(recipientTypes)
        .map((t) => typeLabels[t])
        .join(", ");
      const label = `${selectedGroup?.courseName} – ${selectedGroup?.name} (${typeParts})`;

      onAdd(Array.from(allEmails), label);

      // Resetear selección
      setSelectedCourseId("");
      setSelectedGroupId("");
      setOpen(false);
    } catch (err: any) {
      setError(err.message ?? "Error al resolver correos");
    } finally {
      setResolving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <GraduationCap className="w-4 h-4 mr-2" />
          Agregar por grupo
          <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Grupos del período activo</span>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Cargando...</span>
          </div>
        ) : error && courses.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2 px-4 text-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Selección de curso */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Curso
              </Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selección de grupo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Grupo
              </Label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
                disabled={!selectedCourseId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedCourseId
                        ? "Selecciona un grupo"
                        : "Selecciona un curso primero"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de destinatarios */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Destinatarios
              </Label>
              <div className="space-y-2 pt-0.5">
                {RECIPIENT_OPTIONS.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2.5 cursor-pointer text-sm select-none"
                  >
                    <Checkbox
                      checked={recipientTypes.has(key)}
                      onCheckedChange={() => toggleType(key)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Error inline */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && courses.length > 0 && (
          <>
            <Separator />
            <div className="p-3 flex justify-end">
              <Button
                size="sm"
                disabled={!canAdd || resolving}
                onClick={handleAdd}
              >
                {resolving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                {resolving ? "Resolviendo..." : "Agregar emails"}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
