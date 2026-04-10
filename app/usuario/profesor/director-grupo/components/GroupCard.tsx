"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { GradeTable } from "./GradeTable";
import type { GroupWithStudents, StudentInGroup } from "../types";
import type { GradeEditParams } from "@/components/principal/SuperAdmin/Resultados/hooks/useGradeEditor";

type Props = {
  group: GroupWithStudents;
  groupIdx: number;
  isOpen: boolean;
  onToggle: () => void;
  onViewGrades: (student: StudentInGroup, group: GroupWithStudents) => void;
  onGradeEdit?: (params: GradeEditParams) => Promise<void>;
};

export function GroupCard({
  group,
  groupIdx,
  isOpen,
  onToggle,
  onViewGrades,
  onGradeEdit,
}: Props) {
  const activeCount = group.students.filter((s) => s.is_active).length;

  return (
    <Collapsible
      id={groupIdx === 0 ? "tour-dg-grupo" : undefined}
      open={isOpen}
      onOpenChange={onToggle}
    >
      <CollapsibleTrigger asChild>
        <div className="cursor-pointer select-none group rounded-xl bg-muted/50 border border-border px-5 py-4 hover:bg-muted/70 transition-colors">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-primary/15 rounded-lg shrink-0">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                {group.course && (
                  <h2 className="text-lg font-bold text-foreground leading-tight">
                    {group.course.name}
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
                    <BookOpen className="h-3.5 w-3.5" />
                    Grupo: <span className="text-foreground/80 capitalize">{group.name}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border-0 hover:bg-primary/10">
                <Users className="h-3.5 w-3.5" />
                <span className="font-semibold">
                  {activeCount}{" "}
                  {activeCount !== 1 ? "estudiantes" : "estudiante"}
                </span>
              </Badge>
              <div className="p-1.5 rounded-lg text-muted-foreground group-hover:bg-background/60 transition-colors">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <GradeTable
          group={group}
          groupIdx={groupIdx}
          onViewGrades={onViewGrades}
          onGradeEdit={onGradeEdit}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
