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

export type AcademicPeriod = Database['public']['Tables']['academic_period']['Row'];
export type AcademicPeriodInsert = Database['public']['Tables']['academic_period']['Insert'];
export type AcademicPeriodUpdate = Database['public']['Tables']['academic_period']['Update'];

export type AcademicPeriodHasCycleRow = Database['public']['Tables']['academic_period_has_cycle']['Row'];
export type AcademicPeriodHasCycleInsert = Database['public']['Tables']['academic_period_has_cycle']['Insert'];
export type AcademicPeriodHasCycleUpdate = Database['public']['Tables']['academic_period_has_cycle']['Update'];

// Tipo para la relación entre periodo académico y ciclo con datos del ciclo
export type AcademicPeriodHasCycle = {
  id?: string;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  cycle: Partial<Cycle>;
};

// Tipo para el periodo académico completo con sus ciclos
export type PeriodoAcademico = AcademicPeriod & {
  academic_period_has_cycle: AcademicPeriodHasCycle[];
};

type PeriodAcademicStoreProps = {
  periodos: PeriodoAcademico[];
  loading: boolean;
  error: string | null;

  fetchPeriodos: () => Promise<PeriodoAcademico[]>;
  fetchActivePeriodo: () => Promise<PeriodoAcademico | null>;
  fetchCycles: () => Promise<Cycle[]>;
  addPeriodo: (periodo: AcademicPeriodInsert) => Promise<void>;
  updatePeriodo: (id: string, data: AcademicPeriodUpdate) => Promise<void>;
  deletePeriodo: (id: string) => Promise<void>;

  // Funciones para gestionar ciclos
  addCycleToPeriod: (
    periodId: string,
    cycleId: string,
    data?: {
      isActive?: boolean;
      start_date?: string | null;
      end_date?: string | null;
    },
  ) => Promise<void>;
  updateCycleInPeriod: (
    periodId: string,
    cycleId: string,
    data: CycleUpdate,
  ) => Promise<void>;
  updateCycleRelation: (
    periodId: string,
    cycleId: string,
    data: AcademicPeriodHasCycleUpdate,
  ) => Promise<void>;
  removeCycleFromPeriod: (periodId: string, cycleId: string) => Promise<void>;

  clear: () => void;
};

export const PeriodAcademicStore = create<PeriodAcademicStoreProps>()(
  persist(
    (set, get) => ({
      periodos: [],
      loading: false,
      error: null,

      // Obtener todos los periodos académicos con sus ciclos
      fetchPeriodos: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("academic_period")
            .select(
              `
                *,
                academic_period_has_cycle (
                  id,
                  is_active,
                  start_date,
                  end_date,
                  cycle:cycle_id (
                    id,
                    name,
                    description,
                    is_active
                  )
                )
              `,
            )
            .order("name", { ascending: true });

          if (error) throw error;

          const periods = (data ?? []).map((p: any) => ({
            ...p,
            academic_period_has_cycle: p.academic_period_has_cycle ?? [],
          })) as PeriodoAcademico[];

          set({ periodos: periods });
          return periods;
        } catch (err: any) {
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      // Obtener el periodo académico activo con sus ciclos
      fetchActivePeriodo: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("academic_period")
            .select(
              `
              *,
              academic_period_has_cycle (
                id,
                is_active,
                start_date,
                end_date,
                cycle:cycle_id (
                  id,
                  name,
                  description,
                  is_active
                )
              )
            `,
            )
            .eq("is_active", true)
            .single();
          if (error) throw error;
          return data;
        } catch (err: any) {
          set({ error: err.message });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      // Obtener todos los ciclos disponibles
      fetchCycles: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("cycles")
            .select("*")
            .order("name", { ascending: true });
          if (error) throw error;
          return data || [];
        } catch (err: any) {
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      // Agregar un nuevo periodo académico
      addPeriodo: async (periodo) => {
        set({ loading: true, error: null });
        try {
          // Insertar el periodo académico
          const periodoData: any = { ...periodo };
          delete periodoData.academic_period_has_cycle; // Remover ciclos del insert inicial

          const { data: insertedData, error: insertError } = await supabase
            .from("academic_period")
            .insert(periodoData)
            .select()
            .single();

          if (insertError) throw insertError;

          // Obtener el periodo completo con sus ciclos
          const { data: fullPeriodo, error: fetchError } = await supabase
            .from("academic_period")
            .select(
              `
              *,
              academic_period_has_cycle (
                id,
                is_active,
                start_date,
                end_date,
                cycle:cycle_id (
                  id,
                  name,
                  description,
                  is_active
                )
              )
            `,
            )
            .eq("id", insertedData.id)
            .single();

          if (fetchError) throw fetchError;

          set({ periodos: [...get().periodos, fullPeriodo] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      updatePeriodo: async (id, data) => {
        set({ loading: true, error: null });
        try {
          // Actualizar el periodo académico
          const { error: periodoError } = await supabase
            .from("academic_period")
            .update(data)
            .eq("id", id);

          if (periodoError) throw periodoError;

          // Obtener el periodo actualizado con sus ciclos
          const { data: updatedPeriodo, error: fetchError } = await supabase
            .from("academic_period")
            .select(
              `
              *,
              academic_period_has_cycle (
                id,
                is_active,
                start_date,
                end_date,
                cycle:cycle_id (
                  id,
                  name,
                  description,
                  is_active
                )
              )
            `,
            )
            .eq("id", id)
            .single();

          if (fetchError) throw fetchError;

          // Paso 4: Actualizar el estado con el periodo completo
          set({
            periodos: get().periodos.map((p) =>
              p.id === id ? updatedPeriodo : p,
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deletePeriodo: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("academic_period")
            .delete()
            .eq("id", id);
          if (error) throw error;
          set({ periodos: get().periodos.filter((p) => p.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // Asociar un ciclo existente a un periodo académico
      addCycleToPeriod: async (periodId, cycleId, data = {}) => {
        set({ loading: true, error: null });
        try {
          // Crear la relación entre periodo y ciclo
          const { error: relationError } = await supabase
            .from("academic_period_has_cycle")
            .insert({
              academic_period_id: periodId,
              cycle_id: cycleId,
              is_active: data.isActive ?? true,
              start_date: data.start_date || null,
              end_date: data.end_date || null,
            });

          if (relationError) throw relationError;

          // Obtener el periodo actualizado con sus ciclos
          const { data: updatedPeriodo, error: fetchError } = await supabase
            .from("academic_period")
            .select(
              `
              *,
              academic_period_has_cycle (
                id,
                is_active,
                start_date,
                end_date,
                cycle:cycle_id (
                  id,
                  name,
                  description,
                  is_active
                )
              )
            `,
            )
            .eq("id", periodId)
            .single();

          if (fetchError) throw fetchError;

          // Actualizar el estado
          set({
            periodos: get().periodos.map((p) =>
              p.id === periodId ? updatedPeriodo : p,
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // Actualizar un ciclo específico de un periodo
      updateCycleInPeriod: async (periodId, cycleId, data) => {
        set({ loading: true, error: null });
        try {
          // Paso 1: Actualizar el ciclo
          const { error: cycleError } = await supabase
            .from("cycles")
            .update(data)
            .eq("id", cycleId);

          if (cycleError) throw cycleError;

          // Paso 2: Obtener el periodo actualizado con sus ciclos
          const { data: updatedPeriodo, error: fetchError } = await supabase
            .from("academic_period")
            .select(
              `
              *,
              academic_period_has_cycle (
                id,
                is_active,
                start_date,
                end_date,
                cycle:cycle_id (
                  id,
                  name,
                  description,
                  is_active
                )
              )
            `,
            )
            .eq("id", periodId)
            .single();

          if (fetchError) throw fetchError;

          // Actualizar el estado
          set({
            periodos: get().periodos.map((p) =>
              p.id === periodId ? updatedPeriodo : p,
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // Actualizar la relación entre un periodo y un ciclo
      updateCycleRelation: async (periodId, cycleId, data) => {
        set({ loading: true, error: null });
        try {
          // Actualizar la relación en academic_period_has_cycle
          const { error: relationError } = await supabase
            .from("academic_period_has_cycle")
            .update({
              is_active: data.is_active,
              start_date: data.start_date || null,
              end_date: data.end_date || null,
            })
            .eq("academic_period_id", periodId)
            .eq("cycle_id", cycleId);

          if (relationError) throw relationError;

          // Obtener el periodo actualizado con sus ciclos
          const { data: updatedPeriodo, error: fetchError } = await supabase
            .from("academic_period")
            .select(
              `
              *,
              academic_period_has_cycle (
                id,
                is_active,
                start_date,
                end_date,
                cycle:cycle_id (
                  id,
                  name,
                  description,
                  is_active
                )
              )
            `,
            )
            .eq("id", periodId)
            .single();

          if (fetchError) throw fetchError;

          // Actualizar el estado
          set({
            periodos: get().periodos.map((p) =>
              p.id === periodId ? updatedPeriodo : p,
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // Eliminar un ciclo de un periodo
      removeCycleFromPeriod: async (periodId, cycleId) => {
        set({ loading: true, error: null });
        try {
          // Paso 1: Eliminar la relación
          const { error: relationError } = await supabase
            .from("academic_period_has_cycle")
            .delete()
            .eq("academic_period_id", periodId)
            .eq("cycle_id", cycleId);

          if (relationError) throw relationError;

          // Paso 2: Eliminar el ciclo
          const { error: cycleError } = await supabase
            .from("cycles")
            .delete()
            .eq("id", cycleId);

          if (cycleError) throw cycleError;

          // Paso 3: Obtener el periodo actualizado con sus ciclos
          const { data: updatedPeriodo, error: fetchError } = await supabase
            .from("academic_period")
            .select(
              `
              *,
              academic_period_has_cycle (
                id,
                is_active,
                start_date,
                end_date,
                cycle:cycle_id (
                  id,
                  name,
                  description,
                  is_active
                )
              )
            `,
            )
            .eq("id", periodId)
            .single();

          if (fetchError) throw fetchError;

          // Actualizar el estado
          set({
            periodos: get().periodos.map((p) =>
              p.id === periodId ? updatedPeriodo : p,
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ periodos: [], error: null }),
    }),
    {
      name: "period-academic-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ periodos: state.periodos }),
      version: 1,
    },
  ),
);
