"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type Materia = Database['public']['Tables']['materias']['Row'];
export type MateriaInsert = Database['public']['Tables']['materias']['Insert'];
export type MateriaUpdate = Database['public']['Tables']['materias']['Update'];

export type KnowledgeArea = Database['public']['Tables']['knowledge_areas']['Row'];
export type KnowledgeAreaInsert = Database['public']['Tables']['knowledge_areas']['Insert'];
export type KnowledgeAreaUpdate = Database['public']['Tables']['knowledge_areas']['Update'];

type MateriasStoreProps = {
  materias: Materia[];
  knowledge_areas: KnowledgeArea[];
  loading: boolean;
  error: string | null;

  fetchMaterias: () => Promise<void>;
  fetchKnowAreas: () => Promise<void>;
  addMateria: (materia: MateriaInsert) => Promise<void>;
  updateMateria: (id: string, data: MateriaUpdate) => Promise<void>;
  deleteMateria: (id: string) => Promise<void>;
  clear: () => void;
};

export const MateriasStore = create<MateriasStoreProps>()(
  persist(
    (set, get) => ({
      materias: [],
      knowledge_areas: [],
      loading: false,
      error: null,

      fetchMaterias: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from("materias").select(`
            *,
            knowledge_area:knowledge_areas (
              id,
              name,
              description,
              is_active
            )
          `);

          if (error) console.error(error);

          console.log(error);
          if (error) throw error;
          set({ materias: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      addMateria: async (materia) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("materias")
            .insert(materia)
            .select();
          if (error) throw error;
          set({ materias: [...get().materias, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateMateria: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("materias")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            materias: get().materias.map((m) =>
              m.id === id ? { ...m, ...updated?.[0] } : m,
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteMateria: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("materias")
            .delete()
            .eq("id", id);
          if (error) throw error;
          set({ materias: get().materias.filter((m) => m.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchKnowAreas: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("knowledge_areas")
            .select("*");
          console.log(error);
          if (error) throw error;
          set({ knowledge_areas: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ materias: [], error: null }),
    }),
    {
      name: "materias-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ materias: state.materias }),
      version: 1,
    },
  ),
);
