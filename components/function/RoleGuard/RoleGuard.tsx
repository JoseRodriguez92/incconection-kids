import type { ReactNode } from "react";

/**
 * Roles disponibles en la aplicación.
 * Sincronizado con ROLE_NAMES en UsersManagement/utils/constants.ts
 */
export type RoleName =
  | "super-admin"
  | "profesor"
  | "estudiante"
  | "padre-familia"
  | "tienda"
  | "psicologia"
  | "ruta"
  | "transito"
  | "Lectores"
  | "Coordinadora"
  | "Rector";

interface RoleGuardProps {
  /** Roles que tienen permiso para ver el contenido */
  allowedRoles: RoleName[];
  /** Rol actual del usuario autenticado */
  currentRole: string | null | undefined;
  /** Contenido a mostrar si el rol está permitido */
  children: ReactNode;
  /** Opcional: qué renderizar si el rol NO está permitido (por defecto: nada) */
  fallback?: ReactNode;
}

/**
 * Renderiza `children` solo si `currentRole` está en `allowedRoles`.
 * Si no tiene permiso, renderiza `fallback` (null por defecto).
 *
 * @example
 * <RoleGuard allowedRoles={["super-admin", "profesor"]} currentRole={userRole}>
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({
  allowedRoles,
  currentRole,
  children,
  fallback = null,
}: RoleGuardProps) {
  if (!currentRole || !allowedRoles.includes(currentRole as RoleName)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
