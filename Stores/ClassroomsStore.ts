"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type Classroom = Database['public']['Tables']['classrooms']['Row'];
export type ClassroomInsert = Database['public']['Tables']['classrooms']['Insert'];
export type ClassroomUpdate = Database['public']['Tables']['classrooms']['Update'];

type ClassroomsStoreProps = {
  classrooms: Classroom[];
  loading: boolean;
  error: string | null;

  fetchClassrooms: () => Promise<void>;
  addClassroom: (classroom: ClassroomInsert) => Promise<void>;
  updateClassroom: (id: string, data: ClassroomUpdate) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;
  clear: () => void;
};

export const ClassroomsStore = create<ClassroomsStoreProps>()(
  persist(
    (set, get) => ({
      classrooms: [],
      loading: false,
      error: null,

      fetchClassrooms: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from("classrooms").select("*");
          if (error) throw error;
          set({ classrooms: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      addClassroom: async (classroom) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("classrooms")
            .insert(classroom)
            .select();
          if (error) throw error;
          set({ classrooms: [...get().classrooms, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateClassroom: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("classrooms")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            classrooms: get().classrooms.map((c) =>
              c.id === id ? { ...c, ...updated?.[0] } : c
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteClassroom: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("classrooms")
            .delete()
            .eq("id", id);
          if (error) throw error;
          set({ classrooms: get().classrooms.filter((c) => c.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ classrooms: [], error: null }),
    }),
    {
      name: "classrooms-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ classrooms: state.classrooms }),
      version: 1,
    }
  )
);
