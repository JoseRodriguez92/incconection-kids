"use client";

import { create } from "zustand";

export type StudentView =
  | "dashboard"
  | "cursos"
  | "calendario"
  | "registro-notas"
  | "grupos-interes"
  | "carnet";

type StudentViewState = {
  currentView: StudentView;
  pendingClaseId: string | null;
  setView: (view: StudentView) => void;
  navigateToClase: (claseId: string) => void;
  clearPendingClase: () => void;
};

export const useStudentViewStore = create<StudentViewState>()((set) => ({
  currentView: "dashboard",
  pendingClaseId: null,
  setView: (view) => set({ currentView: view }),
  navigateToClase: (claseId) =>
    set({ currentView: "cursos", pendingClaseId: claseId }),
  clearPendingClase: () => set({ pendingClaseId: null }),
}));
