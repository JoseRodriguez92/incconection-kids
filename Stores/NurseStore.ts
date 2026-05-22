"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";

type VisitRow = Database["public"]["Tables"]["nurse_visit"]["Row"];
type MedRow = Database["public"]["Tables"]["nurse_visit_medication"]["Row"];
type SupplyRow = Database["public"]["Tables"]["nurse_supply"]["Row"];
type HealthRow = Database["public"]["Tables"]["student_health_profile"]["Row"];

export type NurseVisitFull = VisitRow & { student_name: string };
export type NurseVisitMedication = MedRow;
export type NurseSupply = SupplyRow;
export type StudentHealthProfileFull = HealthRow & {
  student_name: string;
  student_enrolled_id: string;
};

interface NurseStoreState {
  visits: NurseVisitFull[];
  visitsLoading: boolean;
  medications: Record<string, MedRow[]>;
  medicationsLoading: boolean;
  supplies: NurseSupply[];
  suppliesLoading: boolean;
  healthProfiles: StudentHealthProfileFull[];
  healthProfilesLoading: boolean;
  loading: boolean;

  fetchVisits: (periodId: string) => Promise<void>;
  createVisit: (visit: Database["public"]["Tables"]["nurse_visit"]["Insert"]) => Promise<VisitRow | null>;
  updateVisit: (id: string, updates: Database["public"]["Tables"]["nurse_visit"]["Update"]) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;

  fetchMedications: (visitId: string) => Promise<void>;
  addMedication: (med: Database["public"]["Tables"]["nurse_visit_medication"]["Insert"]) => Promise<void>;
  deleteMedication: (id: string, visitId: string) => Promise<void>;

  fetchSupplies: (instituteId: string) => Promise<void>;
  createSupply: (supply: Database["public"]["Tables"]["nurse_supply"]["Insert"]) => Promise<void>;
  updateSupply: (id: string, updates: Database["public"]["Tables"]["nurse_supply"]["Update"]) => Promise<void>;
  deleteSupply: (id: string) => Promise<void>;

  fetchHealthProfiles: () => Promise<void>;
  upsertHealthProfile: (profile: Database["public"]["Tables"]["student_health_profile"]["Insert"]) => Promise<void>;
}

const getStudentName = (enrolled: any): string => {
  const p = enrolled?.profiles;
  if (!p) return "Desconocido";
  if (p.full_name) return p.full_name;
  return [p.first_name, p.last_name].filter(Boolean).join(" ") || "Desconocido";
};

export const NurseStore = create<NurseStoreState>()((set, get) => {
  const supabase = createClient();

  return {
    visits: [],
    visitsLoading: false,
    medications: {},
    medicationsLoading: false,
    supplies: [],
    suppliesLoading: false,
    healthProfiles: [],
    healthProfilesLoading: false,
    loading: false,

    fetchVisits: async (periodId) => {
      set({ visitsLoading: true });
      try {
        const { data, error } = await supabase
          .from("nurse_visit")
          .select(`
            *,
            student_enrolled (
              user_id,
              profiles:user_id (first_name, last_name, full_name)
            )
          `)
          .eq("academic_period_id", periodId)
          .order("visit_date", { ascending: false });
        if (error) throw error;
        set({
          visits: (data || []).map((v: any) => ({
            ...v,
            student_name: getStudentName(v.student_enrolled),
          })),
        });
      } finally {
        set({ visitsLoading: false });
      }
    },

    createVisit: async (visit) => {
      set({ loading: true });
      try {
        const { data, error } = await supabase
          .from("nurse_visit")
          .insert(visit)
          .select()
          .single();
        if (error) throw error;
        return data;
      } finally {
        set({ loading: false });
      }
    },

    updateVisit: async (id, updates) => {
      set({ loading: true });
      try {
        const { error } = await supabase.from("nurse_visit").update(updates).eq("id", id);
        if (error) throw error;
        set({ visits: get().visits.map((v) => (v.id === id ? { ...v, ...updates } : v)) });
      } finally {
        set({ loading: false });
      }
    },

    deleteVisit: async (id) => {
      set({ loading: true });
      try {
        const { error } = await supabase.from("nurse_visit").delete().eq("id", id);
        if (error) throw error;
        set({ visits: get().visits.filter((v) => v.id !== id) });
      } finally {
        set({ loading: false });
      }
    },

    fetchMedications: async (visitId) => {
      set({ medicationsLoading: true });
      try {
        const { data, error } = await supabase
          .from("nurse_visit_medication")
          .select("*")
          .eq("visit_id", visitId)
          .order("administered_at");
        if (error) throw error;
        set({ medications: { ...get().medications, [visitId]: data || [] } });
      } finally {
        set({ medicationsLoading: false });
      }
    },

    addMedication: async (med) => {
      const { data, error } = await supabase
        .from("nurse_visit_medication")
        .insert(med)
        .select()
        .single();
      if (error) throw error;
      const vid = med.visit_id;
      set({
        medications: {
          ...get().medications,
          [vid]: [...(get().medications[vid] || []), data],
        },
      });
    },

    deleteMedication: async (id, visitId) => {
      const { error } = await supabase.from("nurse_visit_medication").delete().eq("id", id);
      if (error) throw error;
      set({
        medications: {
          ...get().medications,
          [visitId]: (get().medications[visitId] || []).filter((m) => m.id !== id),
        },
      });
    },

    fetchSupplies: async (instituteId) => {
      set({ suppliesLoading: true });
      try {
        const { data, error } = await supabase
          .from("nurse_supply")
          .select("*")
          .eq("institute_id", instituteId)
          .order("name");
        if (error) throw error;
        set({ supplies: data || [] });
      } finally {
        set({ suppliesLoading: false });
      }
    },

    createSupply: async (supply) => {
      set({ loading: true });
      try {
        const { data, error } = await supabase
          .from("nurse_supply")
          .insert(supply)
          .select()
          .single();
        if (error) throw error;
        set({ supplies: [...get().supplies, data].sort((a, b) => a.name.localeCompare(b.name)) });
      } finally {
        set({ loading: false });
      }
    },

    updateSupply: async (id, updates) => {
      set({ loading: true });
      try {
        const { error } = await supabase.from("nurse_supply").update(updates).eq("id", id);
        if (error) throw error;
        set({ supplies: get().supplies.map((s) => (s.id === id ? { ...s, ...updates } : s)) });
      } finally {
        set({ loading: false });
      }
    },

    deleteSupply: async (id) => {
      set({ loading: true });
      try {
        const { error } = await supabase.from("nurse_supply").delete().eq("id", id);
        if (error) throw error;
        set({ supplies: get().supplies.filter((s) => s.id !== id) });
      } finally {
        set({ loading: false });
      }
    },

    fetchHealthProfiles: async () => {
      set({ healthProfilesLoading: true });
      try {
        const { data, error } = await supabase
          .from("student_health_profile")
          .select(`
            *,
            student_enrolled:student_enrolled_id (
              user_id,
              profiles:user_id (first_name, last_name, full_name)
            )
          `)
          .order("created_at", { ascending: false });
        if (error) throw error;
        set({
          healthProfiles: (data || []).map((h: any) => ({
            ...h,
            student_name: getStudentName(h.student_enrolled),
          })),
        });
      } finally {
        set({ healthProfilesLoading: false });
      }
    },

    upsertHealthProfile: async (profile) => {
      set({ loading: true });
      try {
        const { data, error } = await supabase
          .from("student_health_profile")
          .upsert(profile, { onConflict: "student_enrolled_id" })
          .select()
          .single();
        if (error) throw error;
        const profiles = get().healthProfiles;
        const exists = profiles.find((h) => h.student_enrolled_id === profile.student_enrolled_id);
        if (exists) {
          set({ healthProfiles: profiles.map((h) => (h.student_enrolled_id === profile.student_enrolled_id ? { ...h, ...data } : h)) });
        } else {
          set({ healthProfiles: [{ ...data, student_name: "" }, ...profiles] });
        }
      } finally {
        set({ loading: false });
      }
    },
  };
});
