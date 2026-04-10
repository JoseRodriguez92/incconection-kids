"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type AcademicPeriod = Database['public']['Tables']['academic_period']['Row'];
export type AcademicPeriodInsert = Database['public']['Tables']['academic_period']['Insert'];
export type AcademicPeriodUpdate = Database['public']['Tables']['academic_period']['Update'];

export type Enrolled = Database['public']['Tables']['student_enrolled']['Row'];
export type EnrolledInsert = Database['public']['Tables']['student_enrolled']['Insert'];
export type EnrolledUpdate = Database['public']['Tables']['student_enrolled']['Update'];

// Tipo extendido para cuando se hace JOIN con academic_period
export type EnrolledWithPeriod = Enrolled & {
  academic_period?: Partial<AcademicPeriod>;
};

type EnrolledStoreProps = {
  enrolled: EnrolledWithPeriod[];
  loading: boolean;
  error: string | null;

  fetchEnrolled: () => Promise<void>;
  fetchEnrolledByPeriod: (academicPeriodId: string) => Promise<void>;
  addEnrolled: (enrollment: EnrolledInsert) => Promise<void>;
  updateEnrolled: (id: string, data: EnrolledUpdate) => Promise<void>;
  deleteEnrolled: (id: string) => Promise<void>;
  clear: () => void;
};

export const EstudenteEnrrolledStore = create<EnrolledStoreProps>()(
  persist(
    (set, get) => ({
      enrolled: [],
      loading: false,
      error: null,

      fetchEnrolled: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("student_enrolled")
            .select(`
              *,
              academic_period:academic_period_id (
                id,
                name,
                description,
                start_date,
                end_date,
                is_active
              )
            `);
          if (error) throw error;

          set({ enrolled: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchEnrolledByPeriod: async (academicPeriodId: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("student_enrolled")
            .select(`
              *,
              academic_period:academic_period_id (
                id,
                name,
                description,
                start_date,
                end_date,
                is_active
              )
            `)
            .eq("academic_period_id", academicPeriodId);
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
            .from("student_enrolled")
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
            .from("student_enrolled")
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
            .from("student_enrolled")
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
      name: "estudente-enrrolled-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ enrolled: state.enrolled }),
      version: 1,
    }
  )
);
