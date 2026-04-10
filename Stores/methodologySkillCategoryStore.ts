"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

export type MethodologySkillCategory = Database['public']['Tables']['methodology_skill_category']['Row'];
export type MethodologySkillCategoryInsert = Database['public']['Tables']['methodology_skill_category']['Insert'];
export type MethodologySkillCategoryUpdate = Database['public']['Tables']['methodology_skill_category']['Update'];

type MethodologySkillCategoryStoreProps = {
  categories: MethodologySkillCategory[];
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  fetchActiveCategories: () => Promise<MethodologySkillCategory[]>;
  addCategory: (category: MethodologySkillCategoryInsert) => Promise<void>;
  updateCategory: (id: string, data: MethodologySkillCategoryUpdate) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clear: () => void;
};

export const MethodologySkillCategoryStore = create<MethodologySkillCategoryStoreProps>()(
  persist(
    (set, get) => ({
      categories: [],
      loading: false,
      error: null,

      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("methodology_skill_category")
            .select("*")
            .order("name");

          if (error) throw error;
          set({ categories: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchActiveCategories: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("methodology_skill_category")
            .select("*")
            .eq("is_active", true)
            .order("name");

          if (error) throw error;
          set({ categories: data || [] });
          return data || [];
        } catch (err: any) {
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      addCategory: async (category) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("methodology_skill_category")
            .insert(category)
            .select();

          if (error) throw error;
          set({ categories: [...get().categories, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      updateCategory: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("methodology_skill_category")
            .update(data)
            .eq("id", id)
            .select();

          if (error) throw error;
          set({
            categories: get().categories.map((c) =>
              c.id === id ? { ...c, ...updated?.[0] } : c
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("methodology_skill_category")
            .delete()
            .eq("id", id);

          if (error) throw error;
          set({ categories: get().categories.filter((c) => c.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ categories: [], error: null }),
    }),
    {
      name: "methodology-skill-category-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ categories: state.categories }),
      version: 1,
    }
  )
);
