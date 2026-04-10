"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type GroupHasClass = Database['public']['Tables']['group_has_class']['Row'];
export type GroupHasClassInsert = Database['public']['Tables']['group_has_class']['Insert'];
export type GroupHasClassUpdate = Database['public']['Tables']['group_has_class']['Update'];

// Tipo extendido con relaciones opcionales
export type GroupHasClassWithRelations = GroupHasClass & {
  teacher?: {
    id: string;
    user?: {
      first_name: string;
      last_name: string;
    };
  };
  subject?: {
    id: string;
    name: string;
  };
  group?: {
    id: string;
    name: string;
  };
  classroom?: {
    id: string;
    name: string;
  };
};

type GroupHasClassStoreProps = {
  groupHasClasses: GroupHasClass[];
  loading: boolean;
  error: string | null;

  fetchGroupHasClasses: () => Promise<void>;
  addGroupHasClass: (groupHasClass: GroupHasClass) => Promise<void>;
  updateGroupHasClass: (
    id: string,
    data: Partial<GroupHasClass>
  ) => Promise<void>;
  deleteGroupHasClass: (id: string) => Promise<void>;
  clear: () => void;
};

export const GroupHasClassStore = create<GroupHasClassStoreProps>()(
  persist(
    (set, get) => ({
      groupHasClasses: [],
      loading: false,
      error: null,

      fetchGroupHasClasses: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_has_class")
            .select(`*`);

          if (error) throw error;
          set({ groupHasClasses: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      addGroupHasClass: async (groupHasClass) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_has_class")
            .insert(groupHasClass)
            .select();
          if (error) throw error;
          set({ groupHasClasses: [...get().groupHasClasses, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateGroupHasClass: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("group_has_class")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            groupHasClasses: get().groupHasClasses.map((g) =>
              g.id === id ? { ...g, ...updated?.[0] } : g
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteGroupHasClass: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("group_has_class")
            .delete()
            .eq("id", id);
          if (error) throw error;
          set({
            groupHasClasses: get().groupHasClasses.filter((g) => g.id !== id),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ groupHasClasses: [], error: null }),
    }),
    {
      name: "group-has-class-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ groupHasClasses: state.groupHasClasses }),
      version: 1,
    }
  )
);
