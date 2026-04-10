"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Calendar, Clock, MapPin, Users } from "lucide-react";
import { DIAS_SEMANA } from "./constants";
import type { ClassFormData, ScheduleItem, TempSchedule } from "./types";

type TeacherOption = { id: string; user_id: string | null };
type ProfileOption = { id: string; full_name: string | null };
type SubjectOption = { id: string; name: string };
type CourseOption = { id: string; name: string };
type GroupOption = { id: string; name: string; course_id?: string | null };
type ClassroomOption = { id: string; name: string };

type Props = {
  isOpen: boolean;
  isEditing: boolean;
  isCloning: boolean;
  formData: ClassFormData;
  setFormData: (data: ClassFormData) => void;
  schedules: ScheduleItem[];
  tempSchedule: TempSchedule;
  setTempSchedule: (t: TempSchedule) => void;
  editingScheduleIndex: number | null;
  onClose: () => void;
  onSave: (onSuccess?: () => void) => void;
  onAddSchedule: () => void;
  onEditSchedule: (index: number) => void;
  onCancelEditSchedule: () => void;
  onRemoveSchedule: (index: number) => void;
  onSuccess?: () => void;
  classId?: string | null;
  // Data for selects
  materiasData: SubjectOption[];
  teachersEnrolled: TeacherOption[];
  profiles: ProfileOption[];
  coursesData: CourseOption[];
  groupsData: GroupOption[];
  classroomsData: ClassroomOption[];
};

export function SchedulesModal({
  isOpen,
  isEditing,
  isCloning,
  formData,
  setFormData,
  schedules,
  tempSchedule,
  setTempSchedule,
  editingScheduleIndex,
  onClose,
  onSave,
  onAddSchedule,
  onEditSchedule,
  onCancelEditSchedule,
  onRemoveSchedule,
  onSuccess,
  classId,
  materiasData,
  teachersEnrolled,
  profiles,
  coursesData,
  groupsData,
  classroomsData,
}: Props) {
  const gruposFiltrados = formData.courseId
    ? groupsData.filter((g) => g.course_id === formData.courseId)
    : groupsData;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {isEditing ? (
              <><Clock className="w-6 h-6 text-blue-600" />Editar Clase y Horario</>
            ) : isCloning ? (
              <><Calendar className="w-6 h-6 text-purple-600" />Clonar Clase y Horario</>
            ) : (
              <><Calendar className="w-6 h-6 text-green-600" />Crear Nueva Clase y Horario</>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información de la Clase */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold">Información de la Clase</h3>
            </div>

            {classId && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/60">
                <span className="text-xs font-medium text-muted-foreground shrink-0">group_has_class_id</span>
                <code className="text-xs font-mono text-foreground/70 truncate">{classId}</code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(classId)}
                  className="ml-auto shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar ID"
                >
                  copiar
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Materia */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  Materia
                </Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(v) => setFormData({ ...formData, subjectId: v })}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Seleccionar materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {materiasData.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Profesor */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  Profesor
                </Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(v) => setFormData({ ...formData, teacherId: v })}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Seleccionar profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachersEnrolled.map((t) => {
                      const profile = profiles.find((p) => p.id === t.user_id);
                      return (
                        <SelectItem key={t.id} value={t.id}>
                          {profile?.full_name || "Sin nombre"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Curso */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  Curso
                </Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(v) => setFormData({ ...formData, courseId: v, groupId: "" })}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Seleccionar curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesData.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grupo */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Grupo
                </Label>
                <Select
                  value={formData.groupId}
                  onValueChange={(v) => setFormData({ ...formData, groupId: v })}
                  disabled={!formData.courseId}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue
                      placeholder={formData.courseId ? "Seleccionar grupo" : "Primero selecciona un curso"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {gruposFiltrados.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Aula */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Aula
                </Label>
                <Select
                  value={formData.classroomId}
                  onValueChange={(v) => setFormData({ ...formData, classroomId: v })}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Seleccionar aula" />
                  </SelectTrigger>
                  <SelectContent>
                    {classroomsData.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold">Horarios de la Clase</h3>
              {schedules.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {schedules.length} {schedules.length === 1 ? "horario" : "horarios"}
                </Badge>
              )}
            </div>

            {/* Lista de horarios agregados */}
            {schedules.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {schedules.map((schedule, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      editingScheduleIndex === index
                        ? "bg-blue-50 border-blue-400 shadow-md"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          editingScheduleIndex === index ? "bg-blue-100" : "bg-gradient-to-br from-purple-50 to-blue-50"
                        }`}
                      >
                        <Calendar
                          className={`w-5 h-5 ${editingScheduleIndex === index ? "text-blue-600" : "text-purple-600"}`}
                        />
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className={`mb-1 ${
                            editingScheduleIndex === index
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {DIAS_SEMANA[parseInt(schedule.dayOfWeek) - 1]}
                        </Badge>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-sm">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                      </div>
                      {editingScheduleIndex === index && (
                        <Badge className="bg-blue-600 text-white text-xs animate-pulse">Editando</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSchedule(index)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        disabled={editingScheduleIndex === index}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveSchedule(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <span className="mr-1">✕</span>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar horario */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <Label className="text-sm font-semibold text-gray-700">
                  {editingScheduleIndex !== null ? "Modificar horario" : "Agregar nuevo horario"}
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  Día de la Semana
                </Label>
                <Select
                  value={tempSchedule.dayOfWeek}
                  onValueChange={(v) => setTempSchedule({ ...tempSchedule, dayOfWeek: v })}
                >
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAS_SEMANA.map((dia, index) => (
                      <SelectItem key={dia} value={(index + 1).toString()}>{dia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-green-500" />
                    Hora de Inicio
                  </Label>
                  <Input
                    type="time"
                    value={tempSchedule.startTime}
                    onChange={(e) => setTempSchedule({ ...tempSchedule, startTime: e.target.value })}
                    className="h-10 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-red-500" />
                    Hora de Fin
                  </Label>
                  <Input
                    type="time"
                    value={tempSchedule.endTime}
                    onChange={(e) => setTempSchedule({ ...tempSchedule, endTime: e.target.value })}
                    className="h-10 bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {editingScheduleIndex !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancelEditSchedule}
                    className="flex-1 h-10 border-2"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="button"
                  className={`flex-1 h-10 ${
                    editingScheduleIndex !== null
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  }`}
                  onClick={onAddSchedule}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {editingScheduleIndex !== null ? "Actualizar Horario" : "Agregar Horario"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-4 gap-2">
          <Button variant="outline" onClick={onClose} className="h-10 px-5 border-2">
            <span className="mr-2">✕</span>
            Cancelar
          </Button>
          <Button
            onClick={() => onSave(onSuccess)}
            className={`h-10 px-6 ${
              isEditing
                ? "bg-blue-600 hover:bg-blue-700"
                : isCloning
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            }`}
          >
            {isEditing ? (
              <><Clock className="w-4 h-4 mr-2" />Actualizar Clase</>
            ) : isCloning ? (
              <><Calendar className="w-4 h-4 mr-2" />Clonar Clase</>
            ) : (
              <><Calendar className="w-4 h-4 mr-2" />Crear Clase</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
