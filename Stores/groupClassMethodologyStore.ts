"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

export type GroupClassMethodology = Database['public']['Tables']['group_class_has_methodology']['Row'];
export type GroupClassMethodologyInsert = Database['public']['Tables']['group_class_has_methodology']['Insert'];
export type GroupClassMethodologyUpdate = Database['public']['Tables']['group_class_has_methodology']['Update'];

type GroupClassMethodologyStoreProps = {
  methodologies: GroupClassMethodology[];
  loading: boolean;
  error: string | null;

  fetchMethodologies: () => Promise<void>;
  fetchMethodologyByGroupClassId: (
    groupClassId: string
  ) => Promise<GroupClassMethodology | null>;
  addMethodology: (methodology: GroupClassMethodologyInsert) => Promise<GroupClassMethodology | null>;
  updateMethodology: (id: string, data: GroupClassMethodologyUpdate) => Promise<void>;
  deleteMethodology: (id: string) => Promise<void>;
  clear: () => void;
};

export const GroupClassMethodologyStore = create<GroupClassMethodologyStoreProps>()(
  persist(
    (set, get) => ({
      methodologies: [],
      loading: false,
      error: null,

      fetchMethodologies: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_has_methodology")
            .select("*");

          if (error) throw error;
          set({ methodologies: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchMethodologyByGroupClassId: async (groupClassId) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_has_methodology")
            .select("*")
            .eq("group_has_class_id", groupClassId)
            .single();

          if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
          return data || null;
        } catch (err: any) {
          set({ error: err.message });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      addMethodology: async (methodology) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_has_methodology")
            .insert(methodology)
            .select()
            .single();

          if (error) throw error;

          if (data) {
            set({ methodologies: [...get().methodologies, data] });
          }
          return data || null;
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      updateMethodology: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("group_class_has_methodology")
            .update(data)
            .eq("id", id)
            .select();

          if (error) throw error;
          set({
            methodologies: get().methodologies.map((m) =>
              m.id === id ? { ...m, ...updated?.[0] } : m
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteMethodology: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("group_class_has_methodology")
            .delete()
            .eq("id", id);

          if (error) throw error;
          set({
            methodologies: get().methodologies.filter((m) => m.id !== id),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ methodologies: [], error: null }),
    }),
    {
      name: "group-class-methodology-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ methodologies: state.methodologies }),
      version: 1,
    }
  )
);
