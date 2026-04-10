"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupInsert = Database['public']['Tables']['groups']['Insert'];
export type GroupUpdate = Database['public']['Tables']['groups']['Update'];

type GroupsStoreProps = {
  groups: Group[];
  loading: boolean;
  error: string | null;

  fetchGroups: () => Promise<void>;
  addGroup: (group: GroupInsert) => Promise<void>;
  updateGroup: (id: string, data: GroupUpdate) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  clear: () => void;
};

export const GroupsStore = create<GroupsStoreProps>()(
  persist(
    (set, get) => ({
      groups: [],
      loading: false,
      error: null,

      fetchGroups: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from("groups").select("*");
          if (error) throw error;
          set({ groups: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      addGroup: async (group) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("groups")
            .insert(group)
            .select();
          if (error) throw error;
          set({ groups: [...get().groups, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateGroup: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("groups")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            groups: get().groups.map((g) =>
              g.id === id ? { ...g, ...updated?.[0] } : g
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteGroup: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from("groups").delete().eq("id", id);
          if (error) throw error;
          set({ groups: get().groups.filter((g) => g.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ groups: [], error: null }),
    }),
    {
      name: "groups-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ groups: state.groups }),
      version: 1,
    }
  )
);
