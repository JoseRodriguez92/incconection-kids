"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

const supabase = createClient();

// Usar tipos generados de Supabase
export type GroupHasMaterial = Database['public']['Tables']['group_has_material']['Row'];
export type GroupHasMaterialInsert = Database['public']['Tables']['group_has_material']['Insert'];
export type GroupHasMaterialUpdate = Database['public']['Tables']['group_has_material']['Update'];

type GroupHasMaterialStoreProps = {
  materials: GroupHasMaterial[];
  loading: boolean;
  error: string | null;

  fetchMaterials: () => Promise<void>;
  fetchMaterialsByGroupClassId: (
    groupHasClassId: string
  ) => Promise<GroupHasMaterial[]>;
  addMaterial: (material: GroupHasMaterialInsert) => Promise<void>;
  updateMaterial: (
    id: string,
    data: GroupHasMaterialUpdate
  ) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  clear: () => void;
};

export const GroupHasMaterialStore = create<GroupHasMaterialStoreProps>()(
  persist(
    (set, get) => ({
      materials: [],
      loading: false,
      error: null,

      fetchMaterials: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("group_has_material")
            .select("*");

          console.log(data);
          if (error) throw error;
          set({ materials: data || [] });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchMaterialsByGroupClassId: async (groupHasClassId) => {
        console.log('🔄 [MaterialStore] Iniciando fetchMaterialsByGroupClassId con ID:', groupHasClassId);
        set({ loading: true, error: null });
        try {
          console.log('📡 [MaterialStore] Haciendo petición a Supabase...');
          const { data, error } = await supabase
            .from("group_has_material")
            .select(`
              *,
              learning_condition:target_condition_id(id, name, color)
            `)
            .eq("group_has_class_id", groupHasClassId);

          console.log('📥 [MaterialStore] Respuesta de Supabase:', { data, error });

          if (error) {
            console.error('❌ [MaterialStore] Error en la petición:', error);
            throw error;
          }

          console.log('✅ [MaterialStore] Materiales obtenidos exitosamente:', data);
          console.log('📊 [MaterialStore] Cantidad de materiales:', data?.length || 0);

          // Log detallado de los cycle_id de cada material
          if (data && data.length > 0) {
            console.log('🔑 [MaterialStore] IDs de ciclos en los materiales:');
            data.forEach((material, index) => {
              console.log(`  Material ${index + 1}: "${material.title}" -> cycle_id: "${material.cycle_id}"`);
            });
          }

          set({ materials: data || [] });
          return data || [];
        } catch (err: any) {
          console.error('💥 [MaterialStore] Error capturado:', err);
          set({ error: err.message });
          return [];
        } finally {
          set({ loading: false });
          console.log('✅ [MaterialStore] Petición finalizada');
        }
      },

      addMaterial: async (material) => {
        set({ loading: true, error: null });
        try {
          console.log("📝 Insertando material en BD:", material);
          const { data, error } = await supabase
            .from("group_has_material")
            .insert(material)
            .select();

          if (error) {
            console.error("❌ Error al insertar material:", error);
            throw error;
          }

          console.log("✅ Material insertado exitosamente:", data);
          set({ materials: [...get().materials, ...(data || [])] });
        } catch (err: any) {
          console.error("❌ Error en addMaterial:", err);
          set({ error: err.message });
          throw err; // Re-lanzar el error para que sea capturado en handleSubmit
        } finally {
          set({ loading: false });
        }
      },

      updateMaterial: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { data: updated, error } = await supabase
            .from("group_has_material")
            .update(data)
            .eq("id", id)
            .select();
          if (error) throw error;
          set({
            materials: get().materials.map((m) =>
              m.id === id ? { ...m, ...updated?.[0] } : m
            ),
          });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      deleteMaterial: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("group_has_material")
            .delete()
            .eq("id", id);
          if (error) throw error;
          set({ materials: get().materials.filter((m) => m.id !== id) });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      clear: () => set({ materials: [], error: null }),
    }),
    {
      name: "group-has-material-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ materials: state.materials }),
      version: 1,
    }
  )
);
