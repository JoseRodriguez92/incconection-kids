"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type Enrolled = {
  id: string;
  user_id: string;
  academic_period_id: string;

  enrolled_at: string; // timestamptz
  is_active: boolean;

  created_at: string;
  updated_at: string;
};

type EnrolledStoreProps = {
  enrolled: Enrolled[];
  loading: boolean;
  error: string | null;

  fetchEnrolled: () => Promise<void>;
  addEnrolled: (enrollment: Enrolled) => Promise<void>;
  updateEnrolled: (id: string, data: Partial<Enrolled>) => Promise<void>;
  deleteEnrolled: (id: string) => Promise<void>;
  clear: () => void;
};

export const ParentEnrolledStore = create<EnrolledStoreProps>()(
  persist(
    (set, get) => ({
      enrolled: [],
      loading: false,
      error: null,

      fetchEnrolled: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("parent_enrolled")
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
            .from("parent_enrolled")
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
            .from("parent_enrolled")
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
            .from("parent_enrolled")
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
      name: "parent-enrolled-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ enrolled: state.enrolled }),
      version: 1,
    }
  )
);
