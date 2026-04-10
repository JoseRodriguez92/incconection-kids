"use client";

import "./index.css";
import * as React from "react";
import {
  CalendarClock,
  BookOpen,
  CalendarDays,
  CreditCard,
  Newspaper,
  Menu,
  TicketCheck,
} from "lucide-react";

import { GradesContent } from "@/components/principal/PadreFamilia/grades-content";
import { PadreFamiliaTickets } from "@/components/principal/PadreFamilia/PadreFamiliaTickets";
import { ScheduleContent } from "@/components/principal/PadreFamilia/shedule-content";
import { CalendarContent } from "@/components/principal/PadreFamilia/calendar-content";
import { DocumentsContent } from "@/components/principal/PadreFamilia/documents-content";
import { PaymentsContent } from "@/components/principal/PadreFamilia/payments-content";
import { StudentSelector } from "@/components/principal/PadreFamilia/student-selector";
import { useParentStudents } from "@/components/principal/PadreFamilia/hooks/useParentStudents";
import { useStudentContextStore } from "@/Stores/studentContextStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar, type MenuCategory } from "@/components/principal/SuperAdmin/Sidebar";

// ── Menú específico de Padre de Familia ──────────────────────────────────────
const padreFamiliaMenu: MenuCategory[] = [
  {
    id: "schedule",
    label: "Horario y clases",
    icon: CalendarClock,
    items: [{ id: "schedule", label: "Horario y clases", icon: CalendarClock, href: "#" }],
  },
  {
    id: "grades",
    label: "Notas del estudiante",
    icon: BookOpen,
    items: [{ id: "grades", label: "Notas del estudiante", icon: BookOpen, href: "#" }],
  },
  {
    id: "calendar",
    label: "Eventos",
    icon: CalendarDays,
    items: [{ id: "calendar", label: "Eventos", icon: CalendarDays, href: "#" }],
  },
  {
    id: "payments",
    label: "Pagos",
    icon: CreditCard,
    items: [{ id: "payments", label: "Pagos", icon: CreditCard, href: "#" }],
  },
  {
    id: "circulars",
    label: "Circulares",
    icon: Newspaper,
    items: [{ id: "circulars", label: "Circulares", icon: Newspaper, href: "#" }],
  },
  {
    id: "tickets",
    label: "Soporte",
    icon: TicketCheck,
    items: [{ id: "tickets", label: "Soporte", icon: TicketCheck, href: "#" }],
  },
];

const sectionTitles: Record<string, string> = {
  schedule:  "Horario y clases",
  grades:    "Notas del estudiante",
  calendar:  "Eventos",
  payments:  "Pagos",
  circulars: "Circulares",
  tickets:   "Soporte",
};

export default function PadreFamilia() {
  const [activeSection, setActiveSection] = React.useState("schedule");
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Hijos del padre autenticado — cargados desde Supabase y cacheados en sessionStorage
  const {
    students,
    loading: studentsLoading,
    activeStudent,
    setActiveStudent,
  } = useParentStudents();

  // Sincronizar el store de contexto del estudiante cuando cambia el hijo seleccionado
  const loadStudentContext = useStudentContextStore((s) => s.load);
  React.useEffect(() => {
    if (activeStudent?.id) loadStudentContext(activeStudent.id);
  }, [activeStudent?.id, loadStudentContext]);

  // Escuchar eventos de navegación desde otros componentes
  React.useEffect(() => {
    const handleNavigationEvent = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };
    window.addEventListener("navigate-to-section", handleNavigationEvent as EventListener);
    return () => {
      window.removeEventListener("navigate-to-section", handleNavigationEvent as EventListener);
    };
  }, []);

  const renderContent = () => {
    if (!activeStudent) return null;
    const commonProps = { language: "es", activeStudent };
    switch (activeSection) {
      case "grades":     return <GradesContent />;
      case "calendar":   return <CalendarContent {...commonProps} />;
      case "payments":   return <PaymentsContent {...commonProps} />;
      case "circulars":  return <DocumentsContent {...commonProps} />;
      case "tickets":    return <PadreFamiliaTickets />;
      default:           return <ScheduleContent {...commonProps} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#ffffff00] backdrop-blur-lg w-full">
      {/* Sidebar compartido con SuperAdmin */}
      <Sidebar
        isExpanded={isExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        activeView={activeSection}
        onMenuItemClick={(id) => {
          setActiveSection(id);
          setIsMobileMenuOpen(false);
        }}
        onToggleExpanded={() => setIsExpanded((v) => !v)}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        menuCategories={padreFamiliaMenu}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh">
        {/* Header */}
        <header className="p-4 border-b border-border/40 bg-background/60 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Botón hamburger solo en mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-semibold truncate">
                {sectionTitles[activeSection] ?? activeSection}
              </h2>
            </div>

            {/* Selector de estudiante */}
            {studentsLoading ? (
              <Skeleton className="h-[50px] w-[280px] rounded-md" />
            ) : students.length > 0 && activeStudent ? (
              <StudentSelector
                students={students}
                activeStudent={activeStudent}
                onStudentChange={setActiveStudent}
                language="es"
              />
            ) : (
              <span className="text-sm text-muted-foreground">
                Sin estudiantes vinculados
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto custom-scrollbar">
          {studentsLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-2/3 rounded-xl" />
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
