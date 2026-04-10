"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "../../../components/principal/SuperAdmin/Sidebar";
import { DashboardHome } from "../../../components/principal/SuperAdmin/DashboardHome";
import { UserListManagement } from "../../../components/principal/SuperAdmin/UserListManagement";
import { RoleManagement } from "../../../components/principal/SuperAdmin/RoleManagement";
import { EnrollmentManagement } from "../../../components/principal/SuperAdmin/EnrollmentManagement";
import { EnrolledListManagement } from "../../../components/principal/SuperAdmin/EnrolledListManagement";
import { ClassroomsManagement } from "../../../components/principal/SuperAdmin/ClassroomsManagement";
import { StoreManagement } from "../../../components/principal/SuperAdmin/StoreManagement";
import EventsManagement from "../../../components/principal/SuperAdmin/EventsManagement";
import SupportManagement from "../../../components/principal/SuperAdmin/SupportManagement";
import CommunicationManagement from "../../../components/principal/SuperAdmin/CommunicationManagement";
import RoutesManagement from "../../../components/principal/SuperAdmin/RoutesManagement";
import PsychologyManagement from "../../../components/principal/SuperAdmin/PsychologyManagement";
import { SchedulesManagement } from "../../../components/principal/SuperAdmin/SchedulesManagement";
import { ReportsManagement } from "../../../components/principal/SuperAdmin/ReportsManagement";
import { CarnetManagement } from "../../../components/principal/SuperAdmin/CarnetManagement";

import { InstituteStore } from "@/Stores/InstituteStore";
import { CoursesManagement } from "@/components/principal/SuperAdmin/CoursesManagement";
import { SubjectsManagement } from "@/components/principal/SuperAdmin/SubjectsManagement";
import PeriodAcademicManagement from "@/components/principal/SuperAdmin/PeriodAcademicManagement";
import { CycleManagement } from "@/components/principal/SuperAdmin/cycleManagement";
import CircularesManagement from "@/components/principal/SuperAdmin/CircularesManagement";
import { LearningConditionManagement } from "@/components/principal/SuperAdmin/LearningConditionManagement";
import { ResultadosManagement } from "@/components/principal/SuperAdmin/ResultadosManagement";

export default function Page() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("inicio");

  /** Información actual de la institución */
  const instituteInfo = InstituteStore((t) => t.institute);

  const handleMenuItemClick = (itemId: string) => {
    setActiveView(itemId);
    setIsMobileMenuOpen(false);
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderDashboardContent = () => {
    switch (activeView) {
      case "inicio":
        return <DashboardHome />;
      case "usuarios":
        return <UserListManagement />;
      case "roles":
        return <RoleManagement />;
      case "matricular":
        return <EnrollmentManagement />;
      case "matriculados":
        return <EnrolledListManagement />;
      case "aulas":
        return <ClassroomsManagement />;
      case "cursos":
        return <CoursesManagement />;
      case "materias":
        return <SubjectsManagement />;
      case "periodo-academico":
        return <PeriodAcademicManagement />;
      case "ciclos":
        return <CycleManagement />;
      case "tienda":
        return <StoreManagement />;
      case "eventos":
        return <EventsManagement />;
      case "soporte":
        return <SupportManagement />;
      case "comunicacion":
        return <CommunicationManagement />;
      case "circulares":
        return <CircularesManagement />;
      case "rutas":
        return <RoutesManagement />;
      case "horarios":
        return <SchedulesManagement />;
      case "psicologia":
        return <PsychologyManagement />;
      case "reportes":
        return <ReportsManagement />;
      case "carnetizacion":
        return <CarnetManagement />;
      case "condiciones-aprendizaje":
        return <LearningConditionManagement />;
      case "resultados":
        return <ResultadosManagement />;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Sección en desarrollo</h2>
            <p>
              Esta sección está siendo desarrollada. Selecciona "Inicio" para
              ver el dashboard principal.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen antialiased flex overflow-hidden w-full relative z-[1]">
      <Sidebar
        isExpanded={isExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        activeView={activeView}
        onMenuItemClick={handleMenuItemClick}
        onToggleExpanded={handleToggleExpanded}
        onCloseMobileMenu={handleCloseMobileMenu}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-[full]">
        {/* Header móvil */}
        <header className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Admin Panel</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </header>

        {/** Header Normal */}
        <main className="flex-1 p-6 bg-muted/30 overflow-y-auto">
          <div className="w-[100%] mx-auto">{renderDashboardContent()}</div>
        </main>
      </div>
    </div>
  );
}
