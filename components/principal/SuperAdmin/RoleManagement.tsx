"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, ShieldAlert, Users, Layers } from "lucide-react";

// Hooks
import { useRoleManagement } from "./UsersManagement/hooks/useRoleManagement";

// Components
import { RoleCard } from "./UsersManagement/components/cards/RoleCard";

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 shadow-sm">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground leading-none">{label}</p>
        <p className="text-lg font-bold leading-tight tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function RoleSkeletons() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-l-4 border-l-muted p-4"
        >
          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-10 shrink-0" />
        </div>
      ))}
    </>
  );
}

export function RoleManagement() {
  const [searchRoles, setSearchRoles] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { rolesList, loading: rolesLoading, createRole } = useRoleManagement();

  const filteredRoles = rolesList.filter(
    (role) =>
      role.name.toLowerCase().includes(searchRoles.toLowerCase()) ||
      role.slug.toLowerCase().includes(searchRoles.toLowerCase()),
  );

  const totalUsers = rolesList.reduce(
    (sum, r) => sum + parseInt(r.users_count[0]?.count ?? "0"),
    0,
  );

  const handleCreateRole = async () => {
    if (!newRoleName.trim() || !newRoleDescription.trim()) return;

    setIsCreating(true);
    const success = await createRole(newRoleName, newRoleDescription);
    setIsCreating(false);

    if (success) {
      setNewRoleName("");
      setNewRoleDescription("");
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 w-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Roles</h2>
        <p className="text-sm text-muted-foreground">
          Administra los roles del sistema y los usuarios asignados a cada uno.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <StatChip
          icon={Layers}
          label="Roles definidos"
          value={rolesLoading ? "—" : rolesList.length}
        />
        <StatChip
          icon={Users}
          label="Usuarios totales"
          value={rolesLoading ? "—" : totalUsers}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre o slug..."
            value={searchRoles}
            onChange={(e) => setSearchRoles(e.target.value)}
            className="pl-9"
          />
        </div>

        {searchRoles && !rolesLoading && (
          <span className="text-sm text-muted-foreground shrink-0">
            {filteredRoles.length} resultado
            {filteredRoles.length !== 1 ? "s" : ""}
          </span>
        )}

        <div className="ml-auto">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                Nuevo rol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear nuevo rol</DialogTitle>
                <DialogDescription>
                  Define el nombre y el slug que identificará este rol en el
                  sistema.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Nombre del rol</Label>
                  <Input
                    id="role-name"
                    placeholder="Ej: Coordinador Académico"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-description">
                    Slug{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (identificador interno)
                    </span>
                  </Label>
                  <Input
                    id="role-description"
                    placeholder="Ej: coordinador-academico"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    disabled={isCreating}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usa letras minúsculas y guiones. Se usará en el middleware
                    de acceso.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={
                    isCreating ||
                    !newRoleName.trim() ||
                    !newRoleDescription.trim()
                  }
                >
                  {isCreating ? "Creando..." : "Crear rol"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Role list */}
      <div className="space-y-2.5">
        {rolesLoading ? (
          <RoleSkeletons />
        ) : filteredRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-muted/20">
            <ShieldAlert className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {searchRoles
                ? `Sin resultados para "${searchRoles}"`
                : "No hay roles registrados"}
            </p>
            {!searchRoles && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                Crea el primer rol con el botón de arriba.
              </p>
            )}
          </div>
        ) : (
          filteredRoles.map((rol) => <RoleCard key={rol.id} role={rol} />)
        )}
      </div>
    </div>
  );
}
