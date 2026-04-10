"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

export type GroupClassMethodologySkill = Database['public']['Tables']['group_class_methodology_skill']['Row'];
export type GroupClassMethodologySkillInsert = Database['public']['Tables']['group_class_methodology_skill']['Insert'];
export type GroupClassMethodologySkillUpdate = Database['public']['Tables']['group_class_methodology_skill']['Update'];

type GroupClassMethodologySkillStoreProps = {
  methodologySkills: GroupClassMethodologySkill[];
  loading: boolean;
  error: string | null;

  fetchMethodologySkills: () => Promise<void>;
  fetchSkillsByMethodologyId: (
    methodologyId: string
  ) => Promise<GroupClassMethodologySkill[]>;
  addMethodologySkill: (skill: GroupClassMethodologySkillInsert) => Promise<void>;
  removeMethodologySkill: (id: string) => Promise<void>;
  updateMethodologySkills: (
    methodologyId: string,
    skillIds: string[]
  ) => Promise<void>;
  clear: () => void;
};

export const GroupClassMethodologySkillStore = create<GroupClassMethodologySkillStoreProps>()(
  persist(
    (set, get) => ({
      methodologySkills: [],
      loading: false,
      error: null,

      fetchMethodologySkills: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_methodology_skill")
            .select("*");

          if (error) throw error;
          set({ methodologySkills: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchSkillsByMethodologyId: async (methodologyId) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_methodology_skill")
            .select("*")
            .eq("methodology_id", methodologyId);

          if (error) throw error;
          set({ methodologySkills: data || [] });
          return data || [];
        } catch (err: any) {
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      addMethodologySkill: async (skill) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_methodology_skill")
            .insert(skill)
            .select();

          if (error) throw error;
          set({
            methodologySkills: [...get().methodologySkills, ...(data || [])],
          });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      removeMethodologySkill: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("group_class_methodology_skill")
            .delete()
            .eq("id", id);

          if (error) throw error;
          set({
            methodologySkills: get().methodologySkills.filter(
              (s) => s.id !== id
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateMethodologySkills: async (methodologyId, skillIds) => {
        set({ loading: true, error: null });
        try {
          // 1. Eliminar todas las habilidades actuales de esta metodología
          await supabase
            .from("group_class_methodology_skill")
            .delete()
            .eq("methodology_id", methodologyId);

          // 2. Insertar las nuevas habilidades
          if (skillIds.length > 0) {
            const newSkills = skillIds.map((skillId) => ({
              methodology_id: methodologyId,
              skill_id: skillId,
            }));

            const { data, error } = await supabase
              .from("group_class_methodology_skill")
              .insert(newSkills)
              .select();

            if (error) throw error;

            // Actualizar el estado con las nuevas habilidades
            const currentSkills = get().methodologySkills.filter(
              (s) => s.methodology_id !== methodologyId
            );
            set({ methodologySkills: [...currentSkills, ...(data || [])] });
          } else {
            // Si no hay habilidades, solo eliminar las existentes
            set({
              methodologySkills: get().methodologySkills.filter(
                (s) => s.methodology_id !== methodologyId
              ),
            });
          }
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ methodologySkills: [], error: null }),
    }),
    {
      name: "group-class-methodology-skill-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ methodologySkills: state.methodologySkills }),
      version: 1,
    }
  )
);
