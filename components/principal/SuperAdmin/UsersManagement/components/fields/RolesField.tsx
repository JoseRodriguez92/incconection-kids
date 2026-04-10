"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import type { RoleItem } from "../../types";

interface RolesFieldProps {
  roles: RoleItem[];
  rolesList: RoleItem[];
  rolesLoading: boolean;
  selectedRoleId: string;
  onSelectRoleId: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function RolesField({
  roles,
  rolesList,
  rolesLoading,
  selectedRoleId,
  onSelectRoleId,
  onAdd,
  onRemove,
  disabled,
}: RolesFieldProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Roles del usuario</h3>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Roles asignados</Label>
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px] bg-gray-50">
          {roles.length > 0 ? (
            roles.map((role) => (
              <Badge
                key={role.id}
                variant="secondary"
                className="text-sm px-3 py-1 flex items-center gap-2"
              >
                {role.name}
                <button
                  type="button"
                  onClick={() => onRemove(role.id)}
                  disabled={disabled}
                  className="hover:bg-red-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No hay roles asignados</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Agregar rol</Label>
        <div className="flex gap-2">
          <Select
            value={selectedRoleId}
            onValueChange={onSelectRoleId}
            disabled={rolesLoading || disabled}
          >
            <SelectTrigger className="flex-1">
              <SelectValue
                placeholder={rolesLoading ? "Cargando roles..." : "Seleccione un rol"}
              />
            </SelectTrigger>
            <SelectContent>
              {rolesList
                .filter((role) => !roles.some((r) => r.id === role.id))
                .map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAdd}
            disabled={!selectedRoleId || disabled}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
