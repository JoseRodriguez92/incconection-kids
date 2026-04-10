"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type GroupClassSession = Database['public']['Tables']['group_class_has_session']['Row'];
export type GroupClassSessionInsert = Database['public']['Tables']['group_class_has_session']['Insert'];
export type GroupClassSessionUpdate = Database['public']['Tables']['group_class_has_session']['Update'];

type GroupClassSessionStoreProps = {
  sessions: GroupClassSession[];
  loading: boolean;
  error: string | null;

  fetchSessions: () => Promise<void>;
  fetchSessionsByGroupClassId: (
    groupHasClassId: string
  ) => Promise<GroupClassSession[]>;
  fetchSessionByDateAndGroupClass: (
    groupHasClassId: string,
    sessionDate: string
  ) => Promise<GroupClassSession | null>;
  addSession: (session: GroupClassSessionInsert) => Promise<GroupClassSession | null>;
  updateSession: (
    id: string,
    data: GroupClassSessionUpdate
  ) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  clear: () => void;
};

export const GroupClassSessionStore = create<GroupClassSessionStoreProps>()(
  persist(
    (set, get) => ({
      sessions: [],
      loading: false,
      error: null,

      fetchSessions: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_has_session")
            .select("*")
            .order("session_date", { ascending: false });

          if (error) throw error;
          set({ sessions: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchSessionsByGroupClassId: async (groupHasClassId) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_has_session")
            .select("*")
            .eq("group_has_class_id", groupHasClassId)
            .order("session_date", { ascending: false });

          if (error) throw error;
          set({ sessions: data || [] });
          return data || [];
        } catch (err: any) {
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      fetchSessionByDateAndGroupClass: async (groupHasClassId, sessionDate) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_has_session")
            .select("*")
            .eq("group_has_class_id", groupHasClassId)
            .eq("session_date", sessionDate)
            .single();

          if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
          return data || null;
        } catch (err: any) {
          set({ error: err.message });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      addSession: async (session) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_class_has_session")
            .insert(session)
            .select()
            .single();

          if (error) throw error;

          if (data) {
            set({ sessions: [data, ...get().sessions] });
          }
          return data || null;
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      updateSession: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("group_class_has_session")
            .update(data)
            .eq("id", id)
            .select();

          if (error) throw error;
          set({
            sessions: get().sessions.map((s) =>
              s.id === id ? { ...s, ...updated?.[0] } : s
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteSession: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("group_class_has_session")
            .delete()
            .eq("id", id);

          if (error) throw error;
          set({ sessions: get().sessions.filter((s) => s.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ sessions: [], error: null }),
    }),
    {
      name: "group-class-session-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sessions: state.sessions }),
      version: 1,
    }
  )
);
