"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

export type MethodologySkill = Database['public']['Tables']['methodology_skill']['Row'];
export type MethodologySkillInsert = Database['public']['Tables']['methodology_skill']['Insert'];
export type MethodologySkillUpdate = Database['public']['Tables']['methodology_skill']['Update'];

type MethodologySkillStoreProps = {
  skills: MethodologySkill[];
  loading: boolean;
  error: string | null;

  fetchSkills: () => Promise<void>;
  fetchSkillsByCategory: (categoryId: string) => Promise<MethodologySkill[]>;
  fetchActiveSkills: () => Promise<MethodologySkill[]>;
  addSkill: (skill: MethodologySkillInsert) => Promise<void>;
  updateSkill: (id: string, data: MethodologySkillUpdate) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  clear: () => void;
};

export const MethodologySkillStore = create<MethodologySkillStoreProps>()(
  persist(
    (set, get) => ({
      skills: [],
      loading: false,
      error: null,

      fetchSkills: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("methodology_skill")
            .select("*")
            .order("name");

          if (error) throw error;
          set({ skills: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchSkillsByCategory: async (categoryId) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("methodology_skill")
            .select("*")
            .eq("category_id", categoryId)
            .eq("is_active", true)
            .order("name");

          if (error) throw error;
          return data || [];
        } catch (err: any) {
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      fetchActiveSkills: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("methodology_skill")
            .select("*")
            .eq("is_active", true)
            .order("name");

          if (error) throw error;
          set({ skills: data || [] });
          return data || [];
        } catch (err: any) {
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      addSkill: async (skill) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("methodology_skill")
            .insert(skill)
            .select();

          if (error) throw error;
          set({ skills: [...get().skills, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      updateSkill: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("methodology_skill")
            .update(data)
            .eq("id", id)
            .select();

          if (error) throw error;
          set({
            skills: get().skills.map((s) =>
              s.id === id ? { ...s, ...updated?.[0] } : s
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteSkill: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("methodology_skill")
            .delete()
            .eq("id", id);

          if (error) throw error;
          set({ skills: get().skills.filter((s) => s.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ skills: [], error: null }),
    }),
    {
      name: "methodology-skill-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ skills: state.skills }),
      version: 1,
    }
  )
);
