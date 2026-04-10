"use client";

import { useState } from "react";
import { GroupHasClassStore } from "@/Stores/GroupHasClassStore";
import { GroupClassScheduleStore } from "@/Stores/GroupClassScheduleStore";
import { GroupsStore } from "@/Stores/groupsStore";
import type { ClassFormData, ScheduleItem, TempSchedule, ScheduleWithDetails } from "../types";

const EMPTY_FORM: ClassFormData = {
  className: "",
  subjectId: "",
  teacherId: "",
  courseId: "",
  groupId: "",
  classroomId: "",
};

const EMPTY_TEMP: TempSchedule = { dayOfWeek: "", startTime: "", endTime: "" };

export function useScheduleForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClassFormData>(EMPTY_FORM);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [tempSchedule, setTempSchedule] = useState<TempSchedule>(EMPTY_TEMP);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);
  const [schedulesToDelete, setSchedulesToDelete] = useState<string[]>([]);

  const { groupClassSchedules, addGroupClassSchedule, updateGroupClassSchedule, deleteGroupClassSchedule, fetchGroupClassSchedules } =
    GroupClassScheduleStore();
  const { addGroupHasClass, updateGroupHasClass, fetchGroupHasClasses } = GroupHasClassStore();
  const { groups: groupsData } = GroupsStore();

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setSchedules([]);
    setTempSchedule(EMPTY_TEMP);
    setEditingScheduleIndex(null);
    setSchedulesToDelete([]);
    setIsEditing(false);
    setIsCloning(false);
    setEditingClassId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleAddSchedule = () => {
    if (!tempSchedule.dayOfWeek || !tempSchedule.startTime || !tempSchedule.endTime) {
      alert("Por favor completa todos los campos del horario");
      return;
    }
    if (editingScheduleIndex !== null) {
      const updated = [...schedules];
      updated[editingScheduleIndex] = { ...tempSchedule, id: updated[editingScheduleIndex].id };
      setSchedules(updated);
      setEditingScheduleIndex(null);
    } else {
      setSchedules([...schedules, { ...tempSchedule }]);
    }
    setTempSchedule(EMPTY_TEMP);
  };

  const handleEditSchedule = (index: number) => {
    const s = schedules[index];
    setTempSchedule({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime });
    setEditingScheduleIndex(index);
  };

  const handleCancelEditSchedule = () => {
    setTempSchedule(EMPTY_TEMP);
    setEditingScheduleIndex(null);
  };

  const handleRemoveSchedule = (index: number) => {
    const toRemove = schedules[index];
    if (toRemove.id) setSchedulesToDelete([...schedulesToDelete, toRemove.id]);
    setSchedules(schedules.filter((_, i) => i !== index));
    if (editingScheduleIndex === index) handleCancelEditSchedule();
  };

  const handleEditClick = (horario: ScheduleWithDetails) => {
    const group = groupsData.find((g) => g.id === horario.group_id);
    setFormData({
      className: horario.class_name,
      subjectId: horario.subject_id || "",
      teacherId: horario.teacher_id || "",
      courseId: (group as any)?.course_id || "",
      groupId: horario.group_id || "",
      classroomId: horario.classroom_id || "",
    });
    const classSchedules = groupClassSchedules
      .filter((s) => s.group_class_id === horario.class_id)
      .map((s) => ({
        id: s.id,
        dayOfWeek: s.day_of_week.toString(),
        startTime: s.start_time.substring(0, 5),
        endTime: s.end_time.substring(0, 5),
      }));
    setSchedules(classSchedules);
    setSchedulesToDelete([]);
    setEditingClassId(horario.class_id || null);
    setIsEditing(true);
    setIsCloning(false);
    setIsModalOpen(true);
  };

  const handleCloneClick = (horario: ScheduleWithDetails) => {
    const group = groupsData.find((g) => g.id === horario.group_id);
    setFormData({
      className: `${horario.class_name} (Copia)`,
      subjectId: horario.subject_id || "",
      teacherId: horario.teacher_id || "",
      courseId: (group as any)?.course_id || "",
      groupId: horario.group_id || "",
      classroomId: horario.classroom_id || "",
    });
    const classSchedules = groupClassSchedules
      .filter((s) => s.group_class_id === horario.class_id)
      .map((s) => ({
        dayOfWeek: s.day_of_week.toString(),
        startTime: s.start_time.substring(0, 5),
        endTime: s.end_time.substring(0, 5),
      }));
    setSchedules(classSchedules);
    setSchedulesToDelete([]);
    setEditingClassId(null);
    setIsEditing(false);
    setIsCloning(true);
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateClass = async (onSuccess?: () => void) => {
    try {
      if (!formData.subjectId || !formData.teacherId || !formData.groupId || !formData.classroomId) {
        alert("Por favor completa todos los campos de la clase");
        return;
      }
      if (schedules.length === 0) {
        alert("Por favor agrega al menos un horario para la clase");
        return;
      }

      if (isEditing && editingClassId && !isCloning) {
        await updateGroupHasClass(editingClassId, {
          name: formData.className,
          teacher_enrolled_id: formData.teacherId,
          classroom_id: formData.classroomId,
          subject_id: formData.subjectId,
          group_id: formData.groupId,
          updated_at: new Date().toISOString(),
        });
        for (const scheduleId of schedulesToDelete) {
          await deleteGroupClassSchedule(scheduleId);
        }
        for (const schedule of schedules) {
          if (schedule.id) {
            await updateGroupClassSchedule(schedule.id, {
              day_of_week: parseInt(schedule.dayOfWeek),
              start_time: schedule.startTime + ":00",
              end_time: schedule.endTime + ":00",
              classroom_id: formData.classroomId,
              updated_at: new Date().toISOString(),
            });
          } else {
            await addGroupClassSchedule({
              id: crypto.randomUUID(),
              group_class_id: editingClassId,
              day_of_week: parseInt(schedule.dayOfWeek),
              start_time: schedule.startTime + ":00",
              end_time: schedule.endTime + ":00",
              classroom_id: formData.classroomId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
        alert("Clase actualizada exitosamente");
      } else {
        const newGroupClass = {
          id: crypto.randomUUID(),
          name: formData.className,
          teacher_enrolled_id: formData.teacherId,
          classroom_id: formData.classroomId,
          subject_id: formData.subjectId,
          group_id: formData.groupId,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await addGroupHasClass(newGroupClass);
        for (const schedule of schedules) {
          await addGroupClassSchedule({
            id: crypto.randomUUID(),
            group_class_id: newGroupClass.id,
            day_of_week: parseInt(schedule.dayOfWeek),
            start_time: schedule.startTime + ":00",
            end_time: schedule.endTime + ":00",
            classroom_id: formData.classroomId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        alert(isCloning ? "Clase clonada exitosamente" : "Clase creada exitosamente con múltiples horarios");
      }

      await fetchGroupHasClasses();
      await fetchGroupClassSchedules();
      onSuccess?.();
      closeModal();
    } catch (error) {
      console.error("Error al guardar la clase:", error);
      alert("Error al guardar la clase. Por favor intenta de nuevo.");
    }
  };

  return {
    isModalOpen,
    isEditing,
    isCloning,
    editingClassId,
    formData, setFormData,
    schedules,
    tempSchedule, setTempSchedule,
    editingScheduleIndex,
    openCreateModal,
    closeModal,
    handleAddSchedule,
    handleEditSchedule,
    handleCancelEditSchedule,
    handleRemoveSchedule,
    handleEditClick,
    handleCloneClick,
    handleCreateOrUpdateClass,
  };
}
