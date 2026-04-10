export const TAB_TYPES = {
  USERS: "usuarios",
  ROLES: "roles",
  ACTIVE: "activos",
} as const;

export const SUBTAB_TYPES = {
  STUDENTS: "estudiantes",
  TEACHERS: "profesores",
  ADMIN: "administracion",
  PARENTS: "padres",
  FAMILY: "familia",
} as const;

export const ROLE_NAMES = {
  SUPER_ADMIN: "super-admin",
  TEACHER: "profesor",
  STUDENT: "estudiante",
  PARENT: "padre-familia",
  STORE: "tienda",
  PSYCHOLOGY: "psicologia",
  ROUTE: "ruta",
} as const;

export type TabType = typeof TAB_TYPES[keyof typeof TAB_TYPES];
export type SubTabType = typeof SUBTAB_TYPES[keyof typeof SUBTAB_TYPES];
