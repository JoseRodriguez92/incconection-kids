export interface User {
  id: number
  nombre: string
  correo: string
  rol: string
  estado: string
}

export interface Role {
  id: number
  nombre: string
  descripcion: string
  permisos: string[]
  usuariosAsignados: number
}

export interface Aula {
  id: number
  nombre: string
  capacidad: number
  ubicacion: string
  tipo: string
  equipamiento: string
  estado: string
}

export interface Route {
  id: number
  nombre: string
  conductor: string
  vehiculo: string
  horarioSalida: string
  horarioRegreso: string
  paradas: string[]
  estudiantes: Array<{
    id: number
    nombre: string
    parada: string
  }>
  capacidad: number
}

export interface PsychologyRecord {
  id: number
  estudiante: string
  grado: string
  motivo: string
  fechaRegistro: string
  sesiones: number
  estado: string
  descripcion: string
}

export type RoleName =
  | "super-admin"
  | "profesor"
  | "estudiante"
  | "padre-familia"
  | "tienda"
  | "psicologia"
  | "ruta";

export interface MenuItem {
  icon: any
  label: string
  href: string
  id: string
  /** Si se define, solo los roles listados verán este item en el sidebar */
  allowedRoles?: RoleName[]
}

export interface rolesListProps {
  id: number;
  users_count: { count: string, value: string }[];
  name: string;
  slug: string;
}