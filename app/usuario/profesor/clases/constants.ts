// Constantes y datos mock para el módulo de clases

import type {
  Estudiante,
  Contenido,
  Actividad,
  Periodo,
  MaterialDidactico,
} from "./types";

export const ESTUDIANTES_MOCK: Estudiante[] = [
  {
    id: "001",
    nombre: "Ana García",
    email: "ana.garcia@universidad.edu",
    promedio: 8.5,
  },
  {
    id: "002",
    nombre: "Carlos López",
    email: "carlos.lopez@universidad.edu",
    promedio: 7.8,
  },
  {
    id: "003",
    nombre: "María Fernández",
    email: "maria.fernandez@universidad.edu",
    promedio: 9.2,
  },
  {
    id: "004",
    nombre: "José Martínez",
    email: "jose.martinez@universidad.edu",
    promedio: 6.9,
  },
];

export const CONTENIDOS_MOCK: Contenido[] = [
  {
    tipo: "Documento",
    nombre: "Syllabus del Curso",
    fecha: "2024-01-15",
    tamaño: "2.3 MB",
  },
  {
    tipo: "Video",
    nombre: "Clase 1: Introducción",
    fecha: "2024-01-16",
    tamaño: "45 MB",
  },
  {
    tipo: "Presentación",
    nombre: "Tema 2: Derivadas",
    fecha: "2024-01-18",
    tamaño: "5.1 MB",
  },
  {
    tipo: "Documento",
    nombre: "Ejercicios Prácticos",
    fecha: "2024-01-20",
    tamaño: "1.8 MB",
  },
];

export const ACTIVIDADES_MOCK: Actividad[] = [
  {
    nombre: "Tarea 1",
    tipo: "Tarea",
    fechaLimite: "2024-01-25",
    entregas: 35,
    total: 45,
  },
  {
    nombre: "Examen Parcial",
    tipo: "Examen",
    fechaLimite: "2024-02-01",
    entregas: 42,
    total: 45,
  },
  {
    nombre: "Proyecto Final",
    tipo: "Proyecto",
    fechaLimite: "2024-02-15",
    entregas: 28,
    total: 45,
  },
];

export const PERIODOS: Periodo[] = [
  { id: "1", nombre: "Período 1", fechas: "Enero - Marzo" },
  { id: "2", nombre: "Período 2", fechas: "Abril - Junio" },
  { id: "3", nombre: "Período 3", fechas: "Julio - Septiembre" },
  { id: "4", nombre: "Período 4", fechas: "Octubre - Diciembre" },
];

export const MATERIALES_DIDACTICOS_MOCK: MaterialDidactico[] = [
  {
    id: 1,
    titulo: "Introducción a la Programación",
    descripcion: "Conceptos básicos de programación y algoritmos",
    categoria: "Documento",
    duracion: "2 horas",
  },
  {
    id: 2,
    titulo: "Estructuras de Datos",
    descripcion: "Explicación visual de arrays, listas y árboles",
    categoria: "Video",
    duracion: "1.5 horas",
  },
  {
    id: 3,
    titulo: "Bases de Datos Relacionales",
    descripcion: "Fundamentos de SQL y diseño de bases de datos",
    categoria: "Presentación",
    duracion: "3 horas",
  },
];

export const DIAS_SEMANA: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const DIAS_SEMANA_CORTO: Record<number, string> = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
};
