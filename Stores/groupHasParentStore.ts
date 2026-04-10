"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type GroupHasParent = {
  id: string;
  group_id: string;
  parent_enrolled_id: string;
  created_at: string;
  updated_at: string;
};

type GroupHasParentStoreProps = {
  groupHasParents: GroupHasParent[];
  loading: boolean;
  error: string | null;

  fetchGroupHasParents: () => Promise<void>;
  addGroupHasParent: (record: GroupHasParent) => Promise<void>;
  updateGroupHasParent: (
    id: string,
    data: Partial<GroupHasParent>
  ) => Promise<void>;
  deleteGroupHasParent: (id: string) => Promise<void>;
  clear: () => void;
};

export const GroupHasParentStore = create<GroupHasParentStoreProps>()(
  persist(
    (set, get) => ({
      groupHasParents: [],
      loading: false,
      error: null,

      fetchGroupHasParents: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_has_parents")
            .select("*");
          if (error) throw error;
          set({ groupHasParents: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      addGroupHasParent: async (record) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_has_parents")
            .insert(record)
            .select();
          if (error) throw error;
          set({
            groupHasParents: [...get().groupHasParents, ...(data || [])],
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateGroupHasParent: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("group_has_parents")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            groupHasParents: get().groupHasParents.map((r) =>
              r.id === id ? { ...r, ...updated?.[0] } : r
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteGroupHasParent: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("group_has_parents")
            .delete()
            .eq("id", id);
          if (error) throw error;
          set({
            groupHasParents: get().groupHasParents.filter((r) => r.id !== id),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ groupHasParents: [], error: null }),
    }),
    {
      name: "group-has-parents-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ groupHasParents: state.groupHasParents }),
      version: 1,
    }
  )
);
