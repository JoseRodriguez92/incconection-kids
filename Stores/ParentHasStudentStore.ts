"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type ParentHasStudent = Database['public']['Tables']['parent_has_student']['Row'];
export type ParentHasStudentInsert = Database['public']['Tables']['parent_has_student']['Insert'];
export type ParentHasStudentUpdate = Database['public']['Tables']['parent_has_student']['Update'];

type ParentHasStudentStoreProps = {
  relations: ParentHasStudent[];
  loading: boolean;
  error: string | null;

  fetchRelations: () => Promise<void>;
  addRelation: (relation: ParentHasStudentInsert) => Promise<void>;
  updateRelation: (
    id: string,
    data: ParentHasStudentUpdate
  ) => Promise<void>;
  deleteRelation: (id: string) => Promise<void>;
  clear: () => void;
};

export const ParentHasStudentStore = create<ParentHasStudentStoreProps>()(
  persist(
    (set, get) => ({
      relations: [],
      loading: false,
      error: null,

      // Obtener todas las relaciones padre-estudiante
      fetchRelations: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("parent_has_student")
            .select("*");

          if (error) throw error;
          set({ relations: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // Crear una nueva relación padre-estudiante
      addRelation: async (relation) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("parent_has_student")
            .insert(relation)
            .select();

          if (error) throw error;
          set({ relations: [...get().relations, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // Actualizar una relación existente
      updateRelation: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("parent_has_student")
            .update(data)
            .eq("id", id)
            .select();

          if (error) throw error;

          set({
            relations: get().relations.map((rel) =>
              rel.id === id ? { ...rel, ...updated?.[0] } : rel
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // Eliminar una relación padre-estudiante
      deleteRelation: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("parent_has_student")
            .delete()
            .eq("id", id);

          if (error) throw error;

          set({
            relations: get().relations.filter((rel) => rel.id !== id),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // Limpiar store en memoria/persistencia
      clear: () => set({ relations: [], error: null }),
    }),
    {
      name: "parent-has-student-store",
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos las relaciones
      partialize: (state) => ({ relations: state.relations }),
      version: 1,
    }
  )
);
