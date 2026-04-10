"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type GroupClassSchedule = Database['public']['Tables']['group_class_schedule']['Row'];
export type GroupClassScheduleInsert = Database['public']['Tables']['group_class_schedule']['Insert'];
export type GroupClassScheduleUpdate = Database['public']['Tables']['group_class_schedule']['Update'];

type GroupClassScheduleStoreProps = {
  groupClassSchedules: GroupClassSchedule[];
  loading: boolean;
  error: string | null;

  fetchGroupClassSchedules: () => Promise<void>;
  addGroupClassSchedule: (schedule: GroupClassScheduleInsert) => Promise<void>;
  updateGroupClassSchedule: (
    id: string,
    data: GroupClassScheduleUpdate
  ) => Promise<void>;
  deleteGroupClassSchedule: (id: string) => Promise<void>;
  clear: () => void;
};

export const GroupClassScheduleStore = create<GroupClassScheduleStoreProps>()(
  persist(
    (set, get) => ({
      groupClassSchedules: [],
      loading: false,
      error: null,

      fetchGroupClassSchedules: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_schedule")
            .select("*");
          if (error) throw error;
          set({ groupClassSchedules: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      addGroupClassSchedule: async (schedule) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_schedule")
            .insert(schedule)
            .select();
          if (error) throw error;
          set({
            groupClassSchedules: [
              ...get().groupClassSchedules,
              ...(data || []),
            ],
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateGroupClassSchedule: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("group_class_schedule")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            groupClassSchedules: get().groupClassSchedules.map((s) =>
              s.id === id ? { ...s, ...updated?.[0] } : s
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteGroupClassSchedule: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("group_class_schedule")
            .delete()
            .eq("id", id);
          if (error) throw error;
          set({
            groupClassSchedules: get().groupClassSchedules.filter(
              (s) => s.id !== id
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ groupClassSchedules: [], error: null }),
    }),
    {
      name: "group-class-schedule-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        groupClassSchedules: state.groupClassSchedules,
      }),
      version: 1,
    }
  )
);
