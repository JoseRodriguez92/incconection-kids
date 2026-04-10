"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { RolesField } from "../fields/RolesField";
import { ConditionsField } from "../fields/ConditionsField";
import type { RoleItem, ConditionItem, UserFormData } from "../../types";
import { EMPTY_FORM } from "../../types";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rolesList: RoleItem[];
  rolesLoading: boolean;
  conditionsCatalog: ConditionItem[];
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
  rolesList,
  rolesLoading,
  conditionsCatalog,
}: CreateUserModalProps) {
  const supabase = createClient();

  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [selectedConditionId, setSelectedConditionId] = useState("");

  const resetAndClose = () => {
    setFormData(EMPTY_FORM);
    setShowPassword(false);
    setRoles([]);
    setSelectedRoleId("");
    setConditions([]);
    setSelectedConditionId("");
    onClose();
  };

  const handleField = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRole = () => {
    if (!selectedRoleId) return;
    const role = rolesList.find((r) => r.id === selectedRoleId);
    if (!role) return;
    if (roles.some((r) => r.id === selectedRoleId)) {
      toast.error("Este rol ya está asignado al usuario");
      return;
    }
    setRoles((prev) => [...prev, { id: role.id, name: role.name }]);
    setSelectedRoleId("");
    toast.success(`Rol "${role.name}" agregado`);
  };

  const handleAddCondition = () => {
    const cond = conditionsCatalog.find((c) => c.id === selectedConditionId);
    if (cond) {
      setConditions((prev) => [...prev, cond]);
      setSelectedConditionId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.email || !formData.password) {
        toast.error("El correo y la contraseña son obligatorios");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      const userMetadata: any = {};
      if (formData.role_id) userMetadata.role_id = formData.role_id;
      if (formData.first_name) userMetadata.first_name = formData.first_name;
      if (formData.last_name) userMetadata.last_name = formData.last_name;
      if (formData.phone) userMetadata.phone = formData.phone;
      if (formData.document_type) userMetadata.document_type = formData.document_type;
      if (formData.document_number)
        userMetadata.document_number = formData.document_number;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: userMetadata },
      });

      if (authError) {
        toast.error(`Error al crear usuario: ${authError.message}`);
        return;
      }
      if (!authData.user) {
        toast.error("No se pudo crear el usuario");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const profileData: any = {
        email: formData.email,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        full_name:
          formData.first_name && formData.last_name
            ? `${formData.first_name} ${formData.last_name}`
            : formData.first_name || formData.last_name || null,
        phone: formData.phone || null,
        document_type: formData.document_type || null,
        document_number: formData.document_number || null,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", authData.user.id);

      if (profileError) {
        toast.warning("Usuario creado pero algunos datos del perfil no se guardaron");
      }

      if (roles.length > 0) {
        const { error: roleError } = await supabase.from("profiles_roles").insert(
          roles.map((role) => ({ user_id: authData.user!.id, role_id: role.id })),
        );
        if (roleError) toast.warning("Usuario creado pero algunos roles no se asignaron");
      }

      if (conditions.length > 0) {
        await supabase.from("profile_has_learning_condition").insert(
          conditions.map((c) => ({
            profile_id: authData.user!.id,
            learning_condition_id: c.id,
          })),
        );
      }

      toast.success("Usuario creado exitosamente", {
        description: `${formData.email} ha sido registrado en el sistema`,
      });

      onSuccess();
      resetAndClose();
    } catch (error) {
      console.error("Error inesperado:", error);
      toast.error("Ocurrió un error inesperado al crear el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Crear Nuevo Usuario</span>
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para registrar un nuevo usuario en la plataforma
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Datos de acceso */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Datos de acceso</h3>

            <div className="space-y-2">
              <Label htmlFor="create-email" className="text-sm font-medium">
                Correo electrónico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleField("email", e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-password" className="text-sm font-medium">
                Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleField("password", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Separator />

          <RolesField
            roles={roles}
            rolesList={rolesList}
            rolesLoading={rolesLoading}
            selectedRoleId={selectedRoleId}
            onSelectRoleId={setSelectedRoleId}
            onAdd={handleAddRole}
            onRemove={(id) => setRoles((prev) => prev.filter((r) => r.id !== id))}
            disabled={isSubmitting}
          />

          <Separator />

          {/* Perfil */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Perfil del usuario</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-first_name" className="text-sm font-medium">
                  Nombres
                </Label>
                <Input
                  id="create-first_name"
                  placeholder="Nombres"
                  value={formData.first_name}
                  onChange={(e) => handleField("first_name", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-last_name" className="text-sm font-medium">
                  Apellidos
                </Label>
                <Input
                  id="create-last_name"
                  placeholder="Apellidos"
                  value={formData.last_name}
                  onChange={(e) => handleField("last_name", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-phone" className="text-sm font-medium">
                Teléfono
              </Label>
              <Input
                id="create-phone"
                type="tel"
                placeholder="+57 300 123 4567"
                value={formData.phone}
                onChange={(e) => handleField("phone", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-document_type" className="text-sm font-medium">
                  Tipo de documento
                </Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(v) => handleField("document_type", v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula</SelectItem>
                    <SelectItem value="TI">Tarjeta de identidad</SelectItem>
                    <SelectItem value="CE">Cédula extranjera</SelectItem>
                    <SelectItem value="PA">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-document_number" className="text-sm font-medium">
                  Número de documento
                </Label>
                <Input
                  id="create-document_number"
                  placeholder="123456789"
                  value={formData.document_number}
                  onChange={(e) => handleField("document_number", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <ConditionsField
              conditions={conditions}
              catalog={conditionsCatalog}
              selectedConditionId={selectedConditionId}
              onSelectConditionId={setSelectedConditionId}
              onAdd={handleAddCondition}
              onRemove={(id) => setConditions((prev) => prev.filter((c) => c.id !== id))}
              disabled={isSubmitting}
            />
          </div>

          <Separator />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Creando usuario..." : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
