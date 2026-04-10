"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

type ProfilesStoreProps = {
  profiles: Profile[];
  loading: boolean;
  error: string | null;

  fetchProfiles: () => Promise<void>;
  addProfile: (profile: ProfileInsert) => Promise<void>;
  updateProfile: (id: string, data: ProfileUpdate) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  clear: () => void;
};

export const ProfilesStore = create<ProfilesStoreProps>()(
  persist(
    (set, get) => ({
      profiles: [],
      loading: false,
      error: null,

      fetchProfiles: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from("profiles").select(`
            *,
            conditions:profile_has_learning_condition (
              severity,
              learning_condition:learning_condition_id (
                id,
                name,
                color
              )
            )
          `);
          if (error) throw error;
          set({ profiles: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      addProfile: async (profile) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("profiles")
            .insert(profile)
            .select();
          if (error) throw error;
          set({ profiles: [...get().profiles, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateProfile: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("profiles")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            profiles: get().profiles.map((p) =>
              p.id === id ? { ...p, ...updated?.[0] } : p
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteProfile: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("profiles")
            .delete()
            .eq("id", id);
          if (error) throw error;
          set({ profiles: get().profiles.filter((p) => p.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ profiles: [], error: null }),
    }),
    {
      name: "profiles-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ profiles: state.profiles }),
      version: 1,
    }
  )
);
