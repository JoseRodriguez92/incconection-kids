export const DIAS_SEMANA = ["Día 1", "Día 2", "Día 3", "Día 4", "Día 5"];

export const HORAS_DIA = Array.from({ length: 15 }, (_, i) =>
  `${(i + 6).toString().padStart(2, "0")}:00`,
);

export const HORA_INICIO = 6; // 6 AM
export const ALTURA_HORA_PX = 80;

export const COLORES_MATERIAS = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-yellow-100 border-yellow-300 text-yellow-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
  "bg-orange-100 border-orange-300 text-orange-900",
  "bg-teal-100 border-teal-300 text-teal-900",
];
