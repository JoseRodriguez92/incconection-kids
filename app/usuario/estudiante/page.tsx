"use client";

import { useStudentViewStore } from "@/Stores/studentViewStore";
import { DashboardView } from "./views/DashboardView";
import { CursosView } from "./views/CursosView";
import { CalendarioView } from "./views/CalendarioView";
import { RegistroNotasView } from "./views/RegistroNotasView";
import { GruposInteresView } from "./views/GruposInteresView";
import { CarnetView } from "./views/CarnetView";

export default function Page() {
  const { currentView } = useStudentViewStore();

  switch (currentView) {
    case "cursos":
      return <CursosView />;
    case "calendario":
      return <CalendarioView />;
    case "registro-notas":
      return <RegistroNotasView />;
    case "grupos-interes":
      return <GruposInteresView />;
    case "carnet":
      return <CarnetView />;
    default:
      return <DashboardView />;
  }
}
