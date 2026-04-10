/**
 * Niveles de desempeño académico.
 * Escala institucional: 0 – 120.
 *
 * | Rango      | Nivel     |
 * |------------|-----------|
 * | < 60       | Reprobado |
 * | 60 – 83    | Bajo      |
 * | 84 – 94    | Básico    |
 * | 95 – 106   | Alto      |
 * | 107 – 120  | Superior  |
 */

export type GradeLevel = {
  label: string;
  /** Clase Tailwind para el color del texto */
  text: string;
  /** Clase Tailwind para el color de fondo (badges, chips) */
  bg: string;
};

export function getGradeLevel(grade: number): GradeLevel {
  if (grade < 60)   return { label: "Reprobado", text: "text-red-600",     bg: "bg-red-100"     };
  if (grade <= 83)  return { label: "Bajo",       text: "text-amber-600",  bg: "bg-amber-100"   };
  if (grade <= 94)  return { label: "Básico",     text: "text-sky-600",    bg: "bg-sky-100"     };
  if (grade <= 106) return { label: "Alto",       text: "text-emerald-600",bg: "bg-emerald-100" };
  return                   { label: "Superior",   text: "text-purple-600", bg: "bg-purple-100"  };
}
