"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

type EventStoreProps = {
  events: Event[];
  loading: boolean;
  error: string | null;

  fetchEvents: () => Promise<void>;
  fetchEventsByPeriod: (academicPeriodId: string) => Promise<void>;
  addEvent: (event: EventInsert) => Promise<void>;
  updateEvent: (id: string, data: EventUpdate) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  clear: () => void;
};

export const EventStore = create<EventStoreProps>()(
  persist(
    (set, get) => ({
      events: [],
      loading: false,
      error: null,

      fetchEvents: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from("events").select("*");
          if (error) throw error;
          set({ events: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchEventsByPeriod: async (academicPeriodId: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("academic_period_id", academicPeriodId);
          if (error) throw error;
          set({ events: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      addEvent: async (event) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("events")
            .insert(event)
            .select();
          if (error) throw error;
          set({ events: [...get().events, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateEvent: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("events")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            events: get().events.map((e) =>
              e.id === id ? { ...e, ...updated?.[0] } : e
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteEvent: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from("events").delete().eq("id", id);
          if (error) throw error;
          set({ events: get().events.filter((e) => e.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ events: [], error: null }),
    }),
    {
      name: "event-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ events: state.events }),
      version: 1,
    }
  )
);
