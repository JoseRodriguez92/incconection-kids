"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Calendar, DoorOpen } from "lucide-react";
import type { ClaseEstudiante } from "../hooks/useClasesEstudiante";


interface ClaseCardProps {
  clase: ClaseEstudiante;
  onSelect: (claseId: string) => void;
}

export function ClaseCard({ clase, onSelect }: ClaseCardProps) {
  const teacherName =
    clase.teacher_enrolled?.profiles?.full_name ?? "Docente no asignado";
  const teacherAvatar = clase.teacher_enrolled?.profiles?.avatar_url;
  const teacherInitials = teacherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const subjectName = clase.subject?.name ?? clase.name;
  const subjectCode = clase.subject?.code;

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <BookOpen className="h-8 w-8 text-primary" />
          <div className="flex flex-col items-end gap-1">
            {subjectCode && (
              <Badge variant="outline" className="text-xs font-mono">
                {subjectCode}
              </Badge>
            )}
            <Badge variant={clase.is_active ? "default" : "destructive"}>
              {clase.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-xl mt-3">{subjectName}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Docente */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {teacherAvatar && (
              <AvatarImage src={teacherAvatar} alt={teacherName} />
            )}
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {teacherInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{teacherName}</span>
        </div>

        {/* Aula */}
        {clase.classroom?.name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DoorOpen className="h-4 w-4" />
            <span>Aula: {clase.classroom.name}</span>
          </div>
        )}

        {/* Horarios */}
        {clase.group_class_schedule &&
        clase.group_class_schedule.length > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Horarios:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {clase.group_class_schedule.map((schedule, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-1"
                >
                  {`Día ${schedule.day_of_week}`}{" "}
                  {schedule.start_time?.substring(0, 5) ?? "N/A"}-
                  {schedule.end_time?.substring(0, 5) ?? "N/A"}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Horario no disponible
          </p>
        )}

        <Button className="w-full" onClick={() => onSelect(clase.id)}>
          Acceder al Aula Virtual
        </Button>
      </CardContent>
    </Card>
  );
}
