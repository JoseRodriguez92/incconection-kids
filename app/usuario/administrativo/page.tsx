"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/principal/Administrativos/app-sidebar"
import { BreadcrumbNav } from "@/components/principal/Administrativos/breadcrumb-nav"
import { DashboardContent } from "@/components/principal/Administrativos/dashboard-content"
import { StudentsListContent } from "@/components/principal/Administrativos/students/students-list-content"
import { StudentRegistrationContent } from "@/components/principal/Administrativos/students/student-registration-content"
import { StudentCSVContent } from "@/components/principal/Administrativos/students/student-csv-content"
import { PreEnrolledContent } from "@/components/principal/Administrativos/students/pre-enrolled-content"
import { GraduatedContent } from "@/components/principal/Administrativos/students/graduated-content"
import { PreRegistrationContent } from "@/components/principal/Administrativos/students/pre-registration-content"
import { EnrollmentHubContent } from "@/components/principal/Administrativos/students/enrollment-hub-content"
import { EnrollmentProcessContent } from "@/components/principal/Administrativos/students/enrollment-process-content"
import { EnrolledStudentsListContent } from "@/components/principal/Administrativos/students/enrolled-students-list-content"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { TeacherRegistrationContent } from "@/components/principal/Administrativos/teachers/teacher-registration-content"
import { TeachersListContent } from "@/components/principal/Administrativos/teachers/teachers-list-content"
import { AdministrativeRegistrationContent } from "@/components/principal/Administrativos/administrative/administrative-registration-content"
import { AdministrativeListContent } from "@/components/principal/Administrativos/administrative/administrative-list-content"
import { FamilyRegistrationContent } from "@/components/principal/Administrativos/family/family-registration-content"
import { FamilyListContent } from "@/components/principal/Administrativos/family/family-list-content"
import { CoDebtorRegistrationContent } from "@/components/principal/Administrativos/codebtors/codebtor-registration-content"
import { CoDebtorListContent } from "@/components/principal/Administrativos/codebtors/codebtor-list-content"
import { GradesRegistrationContent } from "@/components/principal/Administrativos/academic/grades-registration-content"
import { CoursesContent } from "@/components/principal/Administrativos/academic/courses-content"
import { EnrollmentContent } from "@/components/principal/Administrativos/academic/enrollment-content"
import { CertificationsContent } from "@/components/principal/Administrativos/academic/certifications-content"
import { IncomeContent } from "@/components/principal/Administrativos/treasury/income-content"
import { ExpensesContent } from "@/components/principal/Administrativos/treasury/expenses-content"
import { AcademicReportsContent } from "@/components/principal/Administrativos/reports/academic-reports-content"
import { FinancialReportsContent } from "@/components/principal/Administrativos/reports/financial-reports-content"
import { AttendanceReportsContent } from "@/components/principal/Administrativos/reports/attendance-reports-content"
import { ActivitiesReportsContent } from "@/components/principal/Administrativos/reports/activities-reports-content"
import { SupportRequestsContent } from "@/components/principal/Administrativos/support/support-requests-content"
import { SupportHistoryContent } from "@/components/principal/Administrativos/support/support-history-content"
import { NotificationCreateContent } from "@/components/principal/Administrativos/notifications/notification-create-content"
import { NotificationManageContent } from "@/components/principal/Administrativos/notifications/notification-manage-content"
import { NotificationPanel } from "@/components/principal/Administrativos/notifications/notification-panel"

export default function Page() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const { theme, setTheme } = useTheme()

  const breadcrumbItems = {
    dashboard: [{ title: "Inicio" }],
    // Proceso de Matrícula
    "estudiantes/proceso-matricula": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Proceso de Matrícula" },
    ],
    // Listas Estudiantil
    "estudiantes/listas-estudiantil": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Listas Estudiantil" },
    ],
    // Hub de Matrícula
    "estudiantes/matricula-hub": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Centro de Matrícula" },
    ],
    // Estudiantes - rutas directas
    "estudiantes/registro": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Matricular" },
    ],
    "estudiantes/csv": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Matrícula Masiva" },
    ],
    "estudiantes/prematricula": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Prematricular" },
    ],
    "estudiantes/preinscripciones": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Inscripción" },
    ],
    "estudiantes/inscripcion-masiva": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Inscripción Masiva" },
    ],
    "estudiantes/lista": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Lista Estudiantil" },
    ],
    "estudiantes/inscripciones": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Lista Inscripciones" },
    ],
    "estudiantes/matriculas": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Lista Matrículas" },
    ],
    "estudiantes/graduados": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Estudiantes" },
      { title: "Graduados" },
    ],
    // Docentes
    "docentes/crear": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Docentes" },
      { title: "Crear Docente" },
    ],
    "docentes/lista": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Docentes" },
      { title: "Lista con Filtros" },
    ],
    // Administrativos
    "administrativos/crear": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Administrativos" },
      { title: "Crear" },
    ],
    "administrativos/lista": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Administrativos" },
      { title: "Ver Lista" },
    ],
    // Familiares
    "familiares/registro": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Familiares" },
      { title: "Registro" },
    ],
    "familiares/lista": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Familiares" },
      { title: "Listado" },
    ],
    // Codeudores
    "codeudores/registro": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Codeudores" },
      { title: "Registro" },
    ],
    "codeudores/lista": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Codeudores" },
      { title: "Listado" },
    ],
    // Notificaciones
    "notificaciones/crear": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Notificaciones" },
      { title: "Crear" },
    ],
    "notificaciones/gestionar": [
      { title: "Inicio", href: "/" },
      { title: "Institucional" },
      { title: "Notificaciones" },
      { title: "Gestionar" },
    ],
    // Académico
    notas: [{ title: "Inicio", href: "/" }, { title: "Académico" }, { title: "Registro de Notas" }],
    cursos: [{ title: "Inicio", href: "/" }, { title: "Académico" }, { title: "Cursos" }],
    matriculas: [{ title: "Inicio", href: "/" }, { title: "Académico" }, { title: "Matrículas" }],
    certificaciones: [{ title: "Inicio", href: "/" }, { title: "Académico" }, { title: "Certificaciones" }],
    // Tesorería
    ingresos: [{ title: "Inicio", href: "/" }, { title: "Tesorería" }, { title: "Ingresos" }],
    egresos: [{ title: "Inicio", href: "/" }, { title: "Tesorería" }, { title: "Egresos" }],
    // Informes
    "reportes/academicos": [{ title: "Inicio", href: "/" }, { title: "Informes" }, { title: "Reportes Académicos" }],
    "reportes/financieros": [{ title: "Inicio", href: "/" }, { title: "Informes" }, { title: "Reportes Financieros" }],
    "reportes/asistencia": [{ title: "Inicio", href: "/" }, { title: "Informes" }, { title: "Asistencia" }],
    "reportes/actividades": [{ title: "Inicio", href: "/" }, { title: "Informes" }, { title: "Actividades/Tareas" }],
    // Soporte
    "soporte/solicitudes": [{ title: "Inicio", href: "/" }, { title: "Soporte" }, { title: "Solicitudes" }],
    "soporte/historial": [{ title: "Inicio", href: "/" }, { title: "Soporte" }, { title: "Historial" }],
    // Configuración
    "configuracion/general": [{ title: "Inicio", href: "/" }, { title: "Configuración" }, { title: "General" }],
    "configuracion/documentos": [
      { title: "Inicio", href: "/" },
      { title: "Configuración" },
      { title: "Gestión Documental" },
    ],
    "configuracion/usuarios": [
      { title: "Inicio", href: "/" },
      { title: "Configuración" },
      { title: "Usuarios y Seguridad" },
    ],
    "configuracion/alertas": [{ title: "Inicio", href: "/" }, { title: "Configuración" }, { title: "Alertas" }],
  }

  const renderContent = () => {
    console.log("Renderizando vista:", currentView)
    switch (currentView) {
      case "dashboard":
        return <DashboardContent />
      // Estudiantes - Proceso de Matrícula
      case "estudiantes/proceso-matricula":
        return <EnrollmentProcessContent />
      // Estudiantes - Listas Estudiantil
      case "estudiantes/listas-estudiantil":
        return <EnrolledStudentsListContent />
      // Estudiantes - Centro de Matrícula
      case "estudiantes/matricula-hub":
        return <EnrollmentHubContent />
      // Estudiantes - Opciones directas
      case "estudiantes/registro":
        return <StudentRegistrationContent />
      case "estudiantes/csv":
        return <StudentCSVContent />
      case "estudiantes/prematricula":
        return <PreRegistrationContent />
      case "estudiantes/preinscripciones":
        return <PreEnrolledContent />
      case "estudiantes/inscripcion-masiva":
        return <StudentCSVContent />
      case "estudiantes/lista":
        return <StudentsListContent />
      case "estudiantes/inscripciones":
        return <PreEnrolledContent />
      case "estudiantes/matriculas":
        return <StudentsListContent />
      case "estudiantes/graduados":
        return <GraduatedContent />
      // Docentes
      case "docentes/crear":
        return <TeacherRegistrationContent />
      case "docentes/lista":
        return <TeachersListContent />
      // Administrativos
      case "administrativos/crear":
        return <AdministrativeRegistrationContent />
      case "administrativos/lista":
        return <AdministrativeListContent />
      // Familiares
      case "familiares/registro":
        return <FamilyRegistrationContent />
      case "familiares/lista":
        return <FamilyListContent />
      // Codeudores
      case "codeudores/registro":
        return <CoDebtorRegistrationContent />
      case "codeudores/lista":
        return <CoDebtorListContent />
      // Notificaciones
      case "notificaciones/crear":
        return <NotificationCreateContent />
      case "notificaciones/gestionar":
        return <NotificationManageContent />
      // Académico
      case "notas":
        return <GradesRegistrationContent />
      case "cursos":
        return <CoursesContent />
      case "matriculas":
        return <EnrollmentContent />
      case "certificaciones":
        return <CertificationsContent />
      // Tesorería
      case "ingresos":
        return <IncomeContent />
      case "egresos":
        return <ExpensesContent />
      // Informes
      case "reportes/academicos":
        return <AcademicReportsContent />
      case "reportes/financieros":
        return <FinancialReportsContent />
      case "reportes/asistencia":
        return <AttendanceReportsContent />
      case "reportes/actividades":
        return <ActivitiesReportsContent />
      // Soporte
      case "soporte/solicitudes":
        return <SupportRequestsContent />
      case "soporte/historial":
        return <SupportHistoryContent />
      // Configuración - Componentes temporales
      case "configuracion/general":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Configuración General</h2>
            <p className="text-muted-foreground">Configuración general del sistema en desarrollo...</p>
          </div>
        )
      case "configuracion/documentos":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Gestión Documental</h2>
            <p className="text-muted-foreground">Sistema de gestión documental en desarrollo...</p>
          </div>
        )
      case "configuracion/usuarios":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Usuarios y Seguridad</h2>
            <p className="text-muted-foreground">Gestión de usuarios y seguridad en desarrollo...</p>
          </div>
        )
      case "configuracion/alertas":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Configuración de Alertas</h2>
            <p className="text-muted-foreground">Sistema de alertas y notificaciones en desarrollo...</p>
          </div>
        )
      default:
        console.log("Vista no encontrada, mostrando Dashboard")
        return <DashboardContent />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeView={currentView}
        onViewChange={setCurrentView}
        showNotificationPanel={showNotificationPanel}
        onToggleNotificationPanel={setShowNotificationPanel}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbNav items={breadcrumbItems[currentView as keyof typeof breadcrumbItems] || []} />
          </div>
          <div className="ml-auto px-4">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-8 w-8"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </Button> */}
          </div>
        </header>
        <div className="flex flex-1 gap-4 p-4 pt-0">
          {/* Contenido principal */}
          <div className={`flex-1 ${showNotificationPanel ? "pr-4" : ""}`}>{renderContent()}</div>

          {/* Panel de notificaciones integrado */}
          {showNotificationPanel && (
            <div className="w-96 border-l bg-background">
              <NotificationPanel isOpen={true} onClose={() => setShowNotificationPanel(false)} isIntegrated={true} />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
