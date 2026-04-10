import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { InstituteStore } from "@/Stores/InstituteStore";
import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { Profile } from "@/Stores/profilesStore";

export const useRoleManagement = () => {
  const supabase = createClient();
  const institute_id = InstituteStore((t) => t.institute.id);

  const [rolesList, setRolesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersAssignedToRole, setUsersAssignedToRole] = useState<Profile[]>([]);

  /**
   * Obtener roles actuales de la institución
   */
  const getCurrentRoles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("roles")
        .select(
          `
          id,
          name,
          slug,
          users_count:profiles_roles(count)
        `
        )
        .eq("institute_id", institute_id)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error al obtener roles:", error);
        toast.error("Error al obtener roles");
        return;
      }

      setRolesList(data || []);
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al obtener roles");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear un nuevo rol
   */
  const createRole = async (name: string, description: string) => {
    if (!name || !description) {
      toast.error("El nombre y la descripción son requeridos");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("roles")
        .insert({
          name: name.trim(),
          slug: description.trim(),
          institute_id: institute_id,
        })
        .select();

      if (error) {
        console.error("Error al crear rol:", error);
        toast.error("No se pudo crear el rol");
        return false;
      }

      setTimeout(() => {
        toast.success("Rol creado", {
          description: `El rol "${name}" se creó correctamente.`,
          icon: React.createElement(CheckCircle2, { className: "h-5 w-5" }),
        });
      }, 300);

      await getCurrentRoles();
      return true;
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al crear rol");
      return false;
    }
  };

  /**
   * Obtener usuarios asignados a un rol
   */
  const getUsersAssignedToRole = async (roleId: string): Promise<Profile[]> => {
    try {
      const { data, error } = await supabase
        .from("profiles_roles")
        .select(
          `
          user_id,
          profiles:profiles!inner (
            id,
            full_name,
            email,
            avatar_url
          )
        `
        )
        .eq("role_id", roleId);

      if (error) {
        console.error("Error al obtener usuarios asignados:", error);
        toast.error("Error al cargar usuarios asignados");
        return [];
      }

      const users =
        data?.map((item: any) => item.profiles).filter(Boolean) || [];
      setUsersAssignedToRole(users);
      return users;
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al cargar usuarios");
      return [];
    }
  };

  /**
   * Asignar un usuario a un rol
   */
  const assignUserToRole = async (profileId: string, roleId: number) => {
    try {
      const { error } = await supabase.from("profiles_roles").insert([
        {
          user_id: profileId,
          role_id: roleId,
        },
      ]);

      if (error) {
        console.error("Error al asignar usuario:", error);
        toast.error("No se pudo asignar el usuario al rol");
        return false;
      }

      toast.success("Usuario asignado correctamente");
      return true;
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al asignar usuario");
      return false;
    }
  };

  /**
   * Desasignar un usuario de un rol
   */
  const removeUserFromRole = async (profileId: string, roleId: number) => {
    try {
      const { error } = await supabase
        .from("profiles_roles")
        .delete()
        .eq("user_id", profileId)
        .eq("role_id", roleId);

      if (error) {
        console.error("Error al desasignar usuario:", error);
        toast.error("No se pudo desasignar el usuario del rol");
        return false;
      }

      toast.success("Usuario desasignado correctamente");
      return true;
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al desasignar usuario");
      return false;
    }
  };

  useEffect(() => {
    if (institute_id) {
      getCurrentRoles();
    }
  }, [institute_id]);

  return {
    rolesList,
    loading,
    usersAssignedToRole,
    getCurrentRoles,
    createRole,
    getUsersAssignedToRole,
    assignUserToRole,
    removeUserFromRole,
    setUsersAssignedToRole,
  };
};
