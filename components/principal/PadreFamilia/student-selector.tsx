"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  gradeEn: string;
  section: string;
  photo: string;
  status: "active" | "inactive";
  notifications: number;
  conditions?: { id: string; name: string; color: string | null }[];
}

interface StudentSelectorProps {
  students: Student[];
  activeStudent: Student;
  onStudentChange: (student: Student) => void;
  language: string;
}

export function StudentSelector({
  students,
  activeStudent,
  onStudentChange,
  language,
}: StudentSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const isSpanish = language === "es";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[280px] justify-between bg-transparent h-[50px]"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={activeStudent.photo || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {activeStudent.firstName[0]}
                {activeStudent.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {activeStudent.firstName} {activeStudent.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {isSpanish ? activeStudent.grade : activeStudent.gradeEn} -{" "}
                {isSpanish ? "Grupo" : "Group"} {activeStudent.section}
              </span>
            </div>
            {activeStudent.notifications > 0 && (
              <Badge
                variant="destructive"
                className="ml-auto h-5 w-5 p-0 text-xs"
              >
                {activeStudent.notifications}
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput
            placeholder={
              isSpanish ? "Buscar estudiante..." : "Search student..."
            }
          />
          <CommandList>
            <CommandEmpty>
              {isSpanish
                ? "No se encontraron estudiantes."
                : "No students found."}
            </CommandEmpty>
            <CommandGroup>
              {students.map((student) => (
                <CommandItem
                  key={student.id}
                  value={`${student.firstName} ${student.lastName}`}
                  onSelect={() => {
                    onStudentChange(student);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.photo || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isSpanish ? student.grade : student.gradeEn} -{" "}
                        {isSpanish ? "Grupo" : "Groupe"} {student.section}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.notifications > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 w-5 p-0 text-xs"
                        >
                          {student.notifications}
                        </Badge>
                      )}
                      <Check
                        className={cn(
                          "h-4 w-4",
                          activeStudent.id === student.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
