export type ScheduleItem = {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

export type TempSchedule = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

export type ClassFormData = {
  className: string;
  subjectId: string;
  teacherId: string;
  courseId: string;
  groupId: string;
  classroomId: string;
};

export type ScheduleWithDetails = {
  id: string;
  day_of_week: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  class_id: string | undefined;
  class_name: string;
  teacher_id: string | undefined;
  profesor: string;
  subject_id: string | undefined;
  materia: string;
  group_id: string | undefined;
  grupo: string;
  course_id: string | undefined;
  curso: string;
  classroom_id: string | undefined;
  aula: string;
};

export type DayWithSchedules = {
  dia: string;
  dayNumber: number;
  horarios: ScheduleWithDetails[];
};
