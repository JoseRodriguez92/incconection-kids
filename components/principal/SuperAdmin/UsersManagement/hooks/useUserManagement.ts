import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Profile } from "@/Stores/profilesStore";

export const useUserManagement = () => {
  const supabase = createClient();
  const [profilesList, setProfilesList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Obtener todos los perfiles de usuarios con sus roles
   */
  const getAllProfiles = async () => {
    setLoading(true);
    try {
      // Obtener perfiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Error al obtener perfiles:", profilesError);
        toast.error("Error al obtener perfiles desde Supabase");
        return;
      }

      // Para cada perfil, obtener sus roles y condiciones de aprendizaje
      const profilesWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [rolesResult, conditionsResult] = await Promise.all([
            supabase
              .from("profiles_roles")
              .select("role_id, roles:roles(id, name)")
              .eq("user_id", profile.id),
            supabase
              .from("profile_has_learning_condition")
              .select("learning_condition:learning_condition_id(id, name, color)")
              .eq("profile_id", profile.id),
          ]);

          return {
            ...profile,
            roles: rolesResult.data?.map((pr: any) => pr.roles).filter(Boolean) || [],
            conditions: conditionsResult.data || [],
          };
        })
      );

      setProfilesList(profilesWithRoles as any);
    } catch (err) {
      console.error("Error inesperado al obtener perfiles:", err);
      toast.error("Error inesperado al obtener perfiles");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear un nuevo usuario en Supabase
   */
  const createUser = async (
    nombre: string,
    correo: string,
    roleId: string
  ) => {
    try {
      const { data: newUser, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            full_name: nombre,
            email: correo,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (profileError || !newUser) {
        console.error("Error al crear usuario:", profileError);
        toast.error("No se pudo crear el usuario");
        return false;
      }

      const { error: roleAssignError } = await supabase
        .from("profiles_roles")
        .insert([
          {
            profile_id: newUser.id,
            role_id: parseInt(roleId),
          },
        ]);

      if (roleAssignError) {
        console.error("Error al asignar rol:", roleAssignError);
        toast.error("Usuario creado pero no se pudo asignar el rol");
        await getAllProfiles();
        return false;
      }

      toast.success("Usuario creado y rol asignado correctamente");
      await getAllProfiles();
      return true;
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al crear usuario");
      return false;
    }
  };

  /**
   * Obtener usuarios con un rol específico
   */
  const getUsersByRole = async (roleName: string): Promise<Profile[]> => {
    try {
      const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", roleName)
        .single();

      if (rolesError || !roles) {
        console.error(`Error al obtener rol ${roleName}:`, rolesError);
        return [];
      }

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
        .eq("role_id", roles.id);

      if (error) {
        console.error(`Error al obtener usuarios ${roleName}:`, error);
        toast.error(`Error al obtener usuarios con rol ${roleName}`);
        return [];
      }

      const users =
        data?.map((item: any) => item.profiles).filter(Boolean) || [];
      return users;
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al obtener usuarios");
      return [];
    }
  };

  useEffect(() => {
    getAllProfiles();
  }, []);

  return {
    profilesList,
    loading,
    getAllProfiles,
    createUser,
    getUsersByRole,
  };
};
