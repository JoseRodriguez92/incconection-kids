"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type GroupHasActivity = Database['public']['Tables']['group_has_activity']['Row'];
export type GroupHasActivityInsert = Database['public']['Tables']['group_has_activity']['Insert'];
export type GroupHasActivityUpdate = Database['public']['Tables']['group_has_activity']['Update'];

type GroupHasActivityStoreProps = {
  activities: GroupHasActivity[];
  loading: boolean;
  error: string | null;

  fetchActivities: () => Promise<void>;
  fetchActivitiesByGroupClassId: (
    groupHasClassId: string
  ) => Promise<GroupHasActivity[]>;
  addActivity: (activity: GroupHasActivityInsert) => Promise<void>;
  updateActivity: (
    id: string,
    data: GroupHasActivityUpdate
  ) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  clear: () => void;
};

export const GroupHasActivityStore = create<GroupHasActivityStoreProps>()(
  persist(
    (set, get) => ({
      activities: [],
      loading: false,
      error: null,

      fetchActivities: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_has_activity")
            .select("*");

          if (error) throw error;
          set({ activities: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchActivitiesByGroupClassId: async (groupHasClassId) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_has_activity")
            .select(`
              *,
              learning_condition:target_condition_id(id, name, color)
            `)
            .eq("group_has_class_id", groupHasClassId);

          if (error) throw error;
          set({ activities: data || [] });
          return data || [];
        } catch (err: any) {
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      addActivity: async (activity) => {
        set({ loading: true, error: null });
        try {
          console.log("📝 Insertando actividad en BD:", activity);
          const { data, error } = await supabase
            .from("group_has_activity")
            .insert(activity)
            .select();

          if (error) {
            console.error("❌ Error al insertar actividad:", error);
            throw error;
          }

          console.log("✅ Actividad insertada exitosamente:", data);
          set({ activities: [...get().activities, ...(data || [])] });
        } catch (err: any) {
          console.error("❌ Error en addActivity:", err);
          set({ error: err.message });
          throw err; // Re-lanzar el error para que sea capturado en handleSubmit
        } finally {
          set({ loading: false });
        }
      },

      updateActivity: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("group_has_activity")
            .update(data)
            .eq("id", id)
            .select();

          if (error) throw error;
          set({
            activities: get().activities.map((a) =>
              a.id === id ? { ...a, ...(updated?.[0] || {}) } : a
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteActivity: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("group_has_activity")
            .delete()
            .eq("id", id);

          if (error) throw error;
          set({
            activities: get().activities.filter((a) => a.id !== id),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ activities: [], error: null }),
    }),
    {
      name: "group-has-activity-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activities: state.activities }),
      version: 1,
    }
  )
);
