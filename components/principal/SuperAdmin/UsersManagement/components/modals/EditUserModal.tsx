"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Edit, Loader2 } from "lucide-react";

const LocationPicker = dynamic(
  () => import("../LocationPicker").then((m) => ({ default: m.LocationPicker })),
  { ssr: false }
);
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { RolesField } from "../fields/RolesField";
import { ConditionsField } from "../fields/ConditionsField";
import type { RoleItem, ConditionItem, UserFormData } from "../../types";
import { EMPTY_FORM } from "../../types";

interface EditUserModalProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rolesList: RoleItem[];
  rolesLoading: boolean;
  conditionsCatalog: ConditionItem[];
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onSuccess,
  rolesList,
  rolesLoading,
  conditionsCatalog,
}: EditUserModalProps) {
  const supabase = createClient();

  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [selectedConditionId, setSelectedConditionId] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<{
    address: string;
    latitude: number | null;
    longitude: number | null;
  }>({ address: "", latitude: null, longitude: null });

  useEffect(() => {
    if (!user) return;
    setFormData({
      email: user.email || "",
      password: "",
      role_id: user.roles?.[0]?.id || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      document_type: user.document_type || "",
      document_number: user.document_number || "",
    });
    setRoles(user.roles || []);
    const existingConditions = (user.conditions || [])
      .map((c: any) => c.learning_condition)
      .filter(Boolean);
    setConditions(existingConditions);
    setLocalAvatarUrl(user.avatar_url || null);
    setLocationData({
      address: user.address || "",
      latitude: user.latitude ?? null,
      longitude: user.longitude ?? null,
    });
  }, [user]);

  const resetAndClose = () => {
    setFormData(EMPTY_FORM);
    setRoles([]);
    setSelectedRoleId("");
    setConditions([]);
    setSelectedConditionId("");
    setUploadingAvatar(false);
    setShowAvatarUrlInput(false);
    setAvatarUrlInput("");
    setLocalAvatarUrl(null);
    setLocationData({ address: "", latitude: null, longitude: null });
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profiles-avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        let errorMessage = uploadError.message;
        if (uploadError.message.includes("Bucket not found")) {
          errorMessage =
            "El bucket 'profiles-avatars' no existe. Por favor, créalo en Supabase Storage o usa la opción de URL.";
        }
        throw new Error(errorMessage);
      }

      const { data: publicUrlData } = supabase.storage
        .from("profiles-avatars")
        .getPublicUrl(uploadData.path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlData.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setLocalAvatarUrl(publicUrlData.publicUrl);
      toast.success("Foto de perfil actualizada");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "No se pudo subir la imagen");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarUrlSave = async () => {
    if (!user || !avatarUrlInput.trim()) {
      toast.error("Por favor ingresa una URL válida");
      return;
    }
    setUploadingAvatar(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrlInput.trim(), updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      setLocalAvatarUrl(avatarUrlInput.trim());
      toast.success("Foto de perfil actualizada");
      setShowAvatarUrlInput(false);
      setAvatarUrlInput("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "No se pudo guardar la URL");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const profileData: any = {};
      if (formData.first_name) profileData.first_name = formData.first_name;
      if (formData.last_name) profileData.last_name = formData.last_name;
      if (formData.phone) profileData.phone = formData.phone;
      if (formData.document_type) profileData.document_type = formData.document_type;
      if (formData.document_number) profileData.document_number = formData.document_number;
      if (locationData.address) profileData.address = locationData.address;
      if (locationData.latitude != null) profileData.latitude = locationData.latitude;
      if (locationData.longitude != null) profileData.longitude = locationData.longitude;

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (profileError) {
        toast.error("Error al actualizar perfil");
        return;
      }

      await supabase.from("profiles_roles").delete().eq("user_id", user.id);

      if (roles.length > 0) {
        const { error: roleError } = await supabase.from("profiles_roles").insert(
          roles.map((role) => ({ user_id: user.id, role_id: role.id })),
        );
        if (roleError) toast.error("Error al actualizar roles");
      }

      await supabase
        .from("profile_has_learning_condition")
        .delete()
        .eq("profile_id", user.id);

      if (conditions.length > 0) {
        await supabase.from("profile_has_learning_condition").insert(
          conditions.map((c) => ({ profile_id: user.id, learning_condition_id: c.id })),
        );
      }

      toast.success("Usuario actualizado exitosamente");
      onSuccess();
      resetAndClose();
    } catch (error) {
      console.error("Error inesperado:", error);
      toast.error("Error al actualizar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
    : "?";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="w-5 h-5" />
            <span>Editar Usuario</span>
          </DialogTitle>
          <DialogDescription>Modifica la información del usuario</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Información</TabsTrigger>
              <TabsTrigger value="location" className="flex-1">Dirección / Ruta</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 pt-4">
          {/* Foto de perfil */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Foto de perfil</h3>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={localAvatarUrl || "/placeholder.svg"} alt={user?.full_name || "Usuario"} />
                <AvatarFallback className="text-lg">{avatarInitials}</AvatarFallback>
              </Avatar>

              {!showAvatarUrlInput ? (
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="avatar-upload-edit"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("avatar-upload-edit")?.click()}
                    disabled={uploadingAvatar}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {uploadingAvatar ? "Subiendo..." : "Subir foto"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAvatarUrlInput(true)}
                    disabled={uploadingAvatar}
                  >
                    Usar URL
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-md space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://ejemplo.com/foto.jpg"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      disabled={uploadingAvatar}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAvatarUrlSave}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowAvatarUrlInput(false); setAvatarUrlInput(""); }}
                    disabled={uploadingAvatar}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Datos de acceso (solo lectura) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Datos de acceso</h3>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input id="edit-email" type="email" value={formData.email} disabled className="bg-gray-100" />
              <p className="text-xs text-muted-foreground">El correo no se puede modificar</p>
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
            onRemove={(id) => { setRoles((prev) => prev.filter((r) => r.id !== id)); toast.success("Rol eliminado"); }}
            disabled={isSubmitting}
          />

          <Separator />

          {/* Perfil */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Perfil del usuario</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first_name" className="text-sm font-medium">Nombres</Label>
                <Input
                  id="edit-first_name"
                  placeholder="Nombres"
                  value={formData.first_name}
                  onChange={(e) => handleField("first_name", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-last_name" className="text-sm font-medium">Apellidos</Label>
                <Input
                  id="edit-last_name"
                  placeholder="Apellidos"
                  value={formData.last_name}
                  onChange={(e) => handleField("last_name", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-sm font-medium">Teléfono</Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+57 300 123 4567"
                value={formData.phone}
                onChange={(e) => handleField("phone", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-document_type" className="text-sm font-medium">
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
                <Label htmlFor="edit-document_number" className="text-sm font-medium">
                  Número de documento
                </Label>
                <Input
                  id="edit-document_number"
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
            </TabsContent>

            <TabsContent value="location" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Haz clic en el mapa o arrastra el pin para marcar la dirección del usuario.
              </p>
              <LocationPicker
                initialLat={locationData.latitude}
                initialLng={locationData.longitude}
                initialAddress={locationData.address}
                onLocationChange={(lat, lng, address) =>
                  setLocationData({ latitude: lat, longitude: lng, address })
                }
                disabled={isSubmitting}
              />
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Actualizando..." : "Actualizar Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
