"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Settings, Plus } from "lucide-react";

// Hooks
import { useRoleManagement } from "./UsersManagement/hooks/useRoleManagement";

// Components
import { RoleCard } from "./UsersManagement/components/cards/RoleCard";

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

  const handleCreateRole = async () => {
    if (!newRoleName.trim() || !newRoleDescription.trim()) {
      return;
    }

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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Roles</h2>

        {/* Botón para crear rol */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Crear Rol
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Rol</DialogTitle>
              <DialogDescription>
                Ingresa los detalles del nuevo rol para el sistema.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Nombre del Rol</Label>
                <Input
                  id="role-name"
                  placeholder="Ej: Administrador, Profesor, Estudiante..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-description">Descripción</Label>
                <Input
                  id="role-description"
                  placeholder="Ej: admin, profesor, estudiante..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  disabled={isCreating}
                />
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
                disabled={isCreating || !newRoleName.trim() || !newRoleDescription.trim()}
              >
                {isCreating ? "Creando..." : "Crear Rol"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vista de Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Roles del Sistema</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar roles..."
                value={searchRoles}
                onChange={(e) => setSearchRoles(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-3">
              {rolesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Cargando roles...</p>
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay roles disponibles</p>
                </div>
              ) : (
                filteredRoles.map((rol) => <RoleCard key={rol.id} role={rol} />)
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
