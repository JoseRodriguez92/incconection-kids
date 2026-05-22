import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Profile } from "@/Stores/profilesStore";

export const PAGE_SIZE = 15;

export const useUserManagement = () => {
  const supabase = createClient();
  const [profilesList, setProfilesList] = useState<Profile[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(false);

  // ── Fetch paginado server-side ────────────────────────────────────────────
  const getAllProfiles = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to   = from + PAGE_SIZE - 1;

      let query = supabase
        .from("profiles")
        .select(
          `*,
           profiles_roles(role_id, roles(id, name)),
           profile_has_learning_condition(learning_condition:learning_condition_id(id, name, color))`,
          { count: "exact" },
        )
        .order("full_name", { ascending: true })
        .range(from, to);

      if (search.trim()) {
        query = query.or(
          `full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`,
        );
      }

      const { data, count, error } = await query;

      if (error) {
        toast.error("Error al obtener perfiles desde Supabase");
        return;
      }

      // Normalizar al shape que espera el resto de la app
      const normalized = (data ?? []).map((p: any) => ({
        ...p,
        roles:      (p.profiles_roles ?? []).map((pr: any) => pr.roles).filter(Boolean),
        conditions: p.profile_has_learning_condition ?? [],
      }));

      setProfilesList(normalized as any);
      setTotal(count ?? 0);
    } catch {
      toast.error("Error inesperado al obtener perfiles");
    } finally {
      setLoading(false);
    }
  };

  // ── Crear usuario ─────────────────────────────────────────────────────────
  const createUser = async (nombre: string, correo: string, roleId: string) => {
    try {
      const { data: newUser, error: profileError } = await supabase
        .from("profiles")
        .insert([{ full_name: nombre, email: correo, created_at: new Date().toISOString() }] as any)
        .select()
        .single();

      if (profileError || !newUser) {
        toast.error("No se pudo crear el usuario");
        return false;
      }

      const { error: roleAssignError } = await supabase
        .from("profiles_roles")
        .insert([{ user_id: newUser.id, role_id: roleId }]);

      if (roleAssignError) {
        toast.error("Usuario creado pero no se pudo asignar el rol");
        return false;
      }

      toast.success("Usuario creado y rol asignado correctamente");
      return true;
    } catch {
      toast.error("Error inesperado al crear usuario");
      return false;
    }
  };

  // ── Usuarios por rol ─────────────────────────────────────────────────────
  const getUsersByRole = async (roleName: string): Promise<Profile[]> => {
    try {
      const { data: role } = await supabase
        .from("roles")
        .select("id")
        .eq("name", roleName)
        .single();

      if (!role) return [];

      const { data } = await supabase
        .from("profiles_roles")
        .select("user_id, profiles:profiles!inner(id, full_name, email, avatar_url)")
        .eq("role_id", role.id);

      return (data ?? []).map((item: any) => item.profiles).filter(Boolean);
    } catch {
      return [];
    }
  };

  useEffect(() => {
    getAllProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profilesList, total, loading, getAllProfiles, createUser, getUsersByRole };
};
