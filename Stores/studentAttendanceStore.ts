"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type StudentAttendance = Database['public']['Tables']['student_attendance']['Row'];
export type StudentAttendanceInsert = Database['public']['Tables']['student_attendance']['Insert'];
export type StudentAttendanceUpdate = Database['public']['Tables']['student_attendance']['Update'];

type StudentAttendanceStoreProps = {
  attendances: StudentAttendance[];
  loading: boolean;
  error: string | null;

  fetchAttendances: () => Promise<void>;
  fetchAttendancesBySessionId: (
    sessionId: string
  ) => Promise<StudentAttendance[]>;
  addAttendance: (attendance: StudentAttendanceInsert) => Promise<void>;
  updateAttendance: (
    id: string,
    data: StudentAttendanceUpdate
  ) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  upsertAttendances: (
    attendances: StudentAttendanceInsert[]
  ) => Promise<void>;
  clear: () => void;
};

export const StudentAttendanceStore = create<StudentAttendanceStoreProps>()(
  persist(
    (set, get) => ({
      attendances: [],
      loading: false,
      error: null,

      fetchAttendances: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("student_attendance")
            .select("*");

          if (error) throw error;
          set({ attendances: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchAttendancesBySessionId: async (sessionId) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("student_attendance")
            .select("*")
            .eq("class_session_id", sessionId);

          if (error) throw error;
          set({ attendances: data || [] });
          return data || [];
        } catch (err: any) {
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      addAttendance: async (attendance) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("student_attendance")
            .insert(attendance)
            .select();

          if (error) throw error;
          set({ attendances: [...get().attendances, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      updateAttendance: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("student_attendance")
            .update(data)
            .eq("id", id)
            .select();

          if (error) throw error;
          set({
            attendances: get().attendances.map((a) =>
              a.id === id ? { ...a, ...updated?.[0] } : a
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteAttendance: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("student_attendance")
            .delete()
            .eq("id", id);

          if (error) throw error;
          set({ attendances: get().attendances.filter((a) => a.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      upsertAttendances: async (attendances) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("student_attendance")
            .upsert(attendances)
            .select();

          if (error) throw error;

          // Actualizar el estado con los registros upserted
          const currentAttendances = get().attendances;
          const updatedAttendances = [...currentAttendances];

          data?.forEach((newAtt) => {
            const existingIndex = updatedAttendances.findIndex(
              (a) => a.id === newAtt.id
            );
            if (existingIndex >= 0) {
              updatedAttendances[existingIndex] = newAtt;
            } else {
              updatedAttendances.push(newAtt);
            }
          });

          set({ attendances: updatedAttendances });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ attendances: [], error: null }),
    }),
    {
      name: "student-attendance-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ attendances: state.attendances }),
      version: 1,
    }
  )
);
