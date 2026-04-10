"use client";

import type { ReactNode } from "react";
import { UserInfoStore } from "@/Stores/UserInfoStore";
import { RoleGuard, type RoleName } from "./RoleGuard";

interface CanSeeProps {
  /** Roles que pueden ver el contenido */
  roles: RoleName[];
  /** Contenido a mostrar si el rol está permitido */
  children: ReactNode;
  /** Qué renderizar si no tiene permiso (por defecto: nada) */
  fallback?: ReactNode;
}

/**
 * Guard de UI conectado al store. Renderiza `children` solo si el
 * rol activo del usuario está en `roles`.
 *
 * @example
 * <CanSee roles={["super-admin", "psicologia"]}>
 *   <BotonesDeAdmin />
 * </CanSee>
 *
 * @example con fallback
 * <CanSee roles={["super-admin"]} fallback={<p>Sin permiso</p>}>
 *   <Panel />
 * </CanSee>
 */
export function CanSee({ roles, children, fallback = null }: CanSeeProps) {
  const currentRole = UserInfoStore((s) => s.current_role);

  return (
    <RoleGuard allowedRoles={roles} currentRole={currentRole} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
