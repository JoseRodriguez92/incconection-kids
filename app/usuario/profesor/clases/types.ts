// Tipos e interfaces para el módulo de clases

export interface LearningCondition {
  id: string;
  name: string;
  color: string | null;
}

export interface Estudiante {
  id: string;
  ghs_id?: string;
  nombre?: string;
  full_name?: string;
  email: string;
  promedio?: number;
  user_id?: string;
  avatar?: string | null;
  avatar_url?: string | null;
  presente?: boolean;
  observaciones?: string;
  conditions?: LearningCondition[];
}

export interface Contenido {
  tipo: string;
  nombre: string;
  fecha: string;
  tamaño?: string;
  descripcion?: string;
  estado?: string;
  etiquetas?: string;
}

export interface Actividad {
  nombre: string;
  tipo: string;
  fechaLimite: string;
  entregas: number;
  total: number;
  descripcion?: string;
  puntos?: string;
  instrucciones?: string;
}

export interface Periodo {
  id: string;
  nombre: string;
  fechas: string;
}

export interface MaterialDidactico {
  id: number;
  titulo?: string;
  nombre?: string;
  descripcion: string;
  categoria?: string;
  tipo?: string;
  duracion?: string;
  etiquetas?: string;
  autor?: string;
  descargas?: number;
}

export interface HiloDiscusion {
  id: number;
  autor: string;
  mensaje: string;
  fecha: string;
  respuestas: number;
}

export interface ForoDiscusion {
  titulo: string;
  descripcion: string;
  mensajes: number;
  ultimo: string;
  hilos: HiloDiscusion[];
}

export interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface Group {
  id: string;
  name: string;
  course_id: string;
  course: Course;
}

export interface Classroom {
  id: string;
  name: string;
}

export interface Curso {
  // Campos originales del group_has_class
  id: string;
  name: string;
  subject_id: string;
  classroom_id: string;
  teacher_enrolled_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  group_id: string;

  // Relaciones completas
  subject?: Subject;
  group?: Group;
  course?: Course;
  classroom?: Classroom;
  group_class_schedule?: Schedule[];

  // Campos formateados para la UI
  nombre: string;
  estudiantes: Estudiante[];
  cantidadEstudiantes: number;
  grupo: string;
  curso_nombre: string;
  horario: string;
  descripcion: string;
}

export interface NuevoContenido {
  nombre: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  estado: string;
  etiquetas: string;
}

export interface NuevaActividad {
  nombre: string;
  tipo: string;
  descripcion: string;
  fechaLimite: string;
  puntos: string;
  instrucciones: string;
}

export interface NuevoTema {
  titulo: string;
  descripcion: string;
  categoria: string;
}
