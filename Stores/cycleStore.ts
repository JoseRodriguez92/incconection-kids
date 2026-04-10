"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type Cycle = Database['public']['Tables']['cycles']['Row'];
export type CycleInsert = Database['public']['Tables']['cycles']['Insert'];
export type CycleUpdate = Database['public']['Tables']['cycles']['Update'];

// Tipo extendido que incluye el ID de la tabla intermedia
export type CycleWithRelation = Cycle & {
  academic_period_has_cycle_id: string;
};

type CycleStoreProps = {
  cycles: Cycle[];
  loading: boolean;
  error: string | null;

  fetchCycles: () => Promise<void>;
  fetchCyclesByAcademicPeriod: (academicPeriodId: string) => Promise<CycleWithRelation[]>;
  addCycle: (cycle: CycleInsert) => Promise<void>;
  updateCycle: (id: string, data: CycleUpdate) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  clear: () => void;
};

export const CycleStore = create<CycleStoreProps>()(
  persist(
    (set, get) => ({
      cycles: [],
      loading: false,
      error: null,

      fetchCycles: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from("cycles").select("*");
          if (error) throw error;
          set({ cycles: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchCyclesByAcademicPeriod: async (academicPeriodId: string) => {
        console.log('🔄 [CycleStore] Iniciando fetchCyclesByAcademicPeriod con ID:', academicPeriodId);
        set({ loading: true, error: null });
        try {
          console.log('📡 [CycleStore] Haciendo petición a Supabase usando tabla intermedia...');

          // Obtenemos los datos de la tabla intermedia con los ciclos relacionados
          // Solo ciclos activos en la tabla intermedia
          const { data: periodCycles, error: periodError } = await supabase
            .from("academic_period_has_cycle")
            .select(`
              id,
              cycle_id,
              is_active,
              cycles (*)
            `)
            .eq("academic_period_id", academicPeriodId)
            .eq("is_active", true);

          console.log('📥 [CycleStore] Ciclos del período:', { periodCycles, periodError });

          if (periodError) {
            console.error('❌ [CycleStore] Error al obtener ciclos del período:', periodError);
            throw periodError;
          }

          if (!periodCycles || periodCycles.length === 0) {
            console.warn('⚠️ [CycleStore] No hay ciclos asociados a este período');
            set({ cycles: [] });
            return [];
          }

          // Combinamos los datos del ciclo con el ID de la relación
          // Filtrar nulos y solo ciclos activos
          const cyclesWithRelation: CycleWithRelation[] = periodCycles
            .filter((pc: any) => pc.cycles && pc.cycles.is_active === true)
            .map((pc: any) => ({
              ...pc.cycles,
              academic_period_has_cycle_id: pc.id, // ID de la tabla intermedia
            }));

          console.log('✅ [CycleStore] Ciclos activos con relación obtenidos:', cyclesWithRelation);
          console.log('📊 [CycleStore] Actualizando store con', cyclesWithRelation.length, 'ciclos activos');

          set({ cycles: cyclesWithRelation });
          return cyclesWithRelation;
        } catch (err: any) {
          console.error('💥 [CycleStore] Error capturado:', err);
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
          console.log('✅ [CycleStore] Petición finalizada');
        }
      },

      addCycle: async (cycle) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("cycles")
            .insert(cycle)
            .select();
          if (error) throw error;
          set({ cycles: [...get().cycles, ...(data || [])] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updateCycle: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("cycles")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            cycles: get().cycles.map((c) =>
              c.id === id ? { ...c, ...updated?.[0] } : c
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteCycle: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from("cycles").delete().eq("id", id);
          if (error) throw error;
          set({ cycles: get().cycles.filter((c) => c.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ cycles: [], error: null }),
    }),
    {
      name: "cycle-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cycles: state.cycles }),
      version: 1,
    }
  )
);