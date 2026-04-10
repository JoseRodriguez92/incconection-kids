"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type AdminEnrolled = Database['public']['Tables']['admin_enrolled']['Row'];
export type AdminEnrolledInsert = Database['public']['Tables']['admin_enrolled']['Insert'];
export type AdminEnrolledUpdate = Database['public']['Tables']['admin_enrolled']['Update'];

type EnrolledStoreProps = {
  enrolled: AdminEnrolled[];
  loading: boolean;
  error: string | null;

  fetchEnrolled: () => Promise<void>;
  addEnrolled: (enrollment: AdminEnrolledInsert) => Promise<void>;
  updateEnrolled: (id: string, data: AdminEnrolledUpdate) => Promise<void>;
  deleteEnrolled: (id: string) => Promise<void>;
  clear: () => void;
};

export const AdminEnrrolledStore = create<EnrolledStoreProps>()(
  persist(
    (set, get) => ({
      enrolled: [],
      loading: false,
      error: null,

      fetchEnrolled: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("admin_enrolled")
            .select("*");
          if (error) throw error;
          set({ enrolled: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      addEnrolled: async (enrollment) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("admin_enrolled")
            .insert(enrollment)
            .select();
          if (error) throw error;
          set({ enrolled: [...get().enrolled, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateEnrolled: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("admin_enrolled")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            enrolled: get().enrolled.map((e) =>
              e.id === id ? { ...e, ...updated?.[0] } : e
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteEnrolled: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("admin_enrolled")
            .delete()
            .eq("id", id);
          if (error) throw error;
          set({ enrolled: get().enrolled.filter((e) => e.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ enrolled: [], error: null }),
    }),
    {
      name: "admin-enrrolled-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ enrolled: state.enrolled }),
      version: 1,
    }
  )
);
