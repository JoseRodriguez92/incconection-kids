"use client"

import type * as React from "react"
import {
  BookOpen,
  Building2,
  Calculator,
  ChevronRight,
  FileText,
  GraduationCap,
  HeadphonesIcon,
  Home,
  Users,
  UserCheck,
  Heart,
  MessageSquare,
  ClipboardList,
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  UserCog,
  Activity,
  GitBranch,
  Settings,
  Shield,
  Bell,
  FolderOpen,
  UsersIcon,
} from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      tooltip: "Panel principal con estadísticas y resumen general del sistema",
    },
    {
      title: "Institucional",
      url: "#",
      icon: Building2,
      tooltip: "Gestión de personas y comunicaciones de la institución",
      items: [
        {
          title: "Estudiantes",
          url: "#",
          icon: GraduationCap,
          tooltip: "Administración completa del ciclo estudiantil",
          items: [
            {
              title: "Proceso de Matrícula",
              url: "/estudiantes/proceso-matricula",
              icon: GitBranch,
              tooltip: "Vista completa del proceso desde inscripción hasta matrícula",
            },
            {
              title: "Listas Estudiantil",
              url: "/estudiantes/listas-estudiantil",
              icon: UsersIcon,
              tooltip: "Lista completa de estudiantes matriculados con información detallada",
            },
            {
              title: "Graduados",
              url: "/estudiantes/graduados",
              icon: Award,
              tooltip: "Registro y gestión de estudiantes graduados",
            },
          ],
        },
        {
          title: "Docentes",
          url: "/docentes",
          icon: Users,
          tooltip: "Gestión del personal docente de la institución",
          items: [
            {
              title: "Crear Docente",
              url: "/docentes/crear",
              tooltip: "Registro de nuevos docentes con información completa",
            },
            {
              title: "Lista con Filtros",
              url: "/docentes/lista",
              tooltip: "Consulta y gestión de docentes registrados",
            },
          ],
        },
        {
          title: "Administrativos",
          url: "/administrativos",
          icon: UserCog,
          tooltip: "Gestión del personal administrativo",
          items: [
            {
              title: "Crear",
              url: "/administrativos/crear",
              tooltip: "Registro de nuevo personal administrativo",
            },
            {
              title: "Ver Lista",
              url: "/administrativos/lista",
              tooltip: "Consulta y gestión del personal administrativo",
            },
          ],
        },
        {
          title: "Familiares",
          url: "/familiares",
          icon: Heart,
          tooltip: "Gestión de familiares y contactos de estudiantes",
          items: [
            {
              title: "Registro",
              url: "/familiares/registro",
              tooltip: "Registro de familiares y contactos de emergencia",
            },
            {
              title: "Listado",
              url: "/familiares/lista",
              tooltip: "Consulta de familiares registrados",
            },
          ],
        },
        {
          title: "Codeudores",
          url: "/codeudores",
          icon: UserCheck,
          tooltip: "Gestión de codeudores y responsables financieros",
          items: [
            {
              title: "Registro",
              url: "/codeudores/registro",
              tooltip: "Registro de codeudores y garantes financieros",
            },
            {
              title: "Listado",
              url: "/codeudores/lista",
              tooltip: "Consulta de codeudores registrados",
            },
          ],
        },
        {
          title: "Notificaciones",
          url: "/notificaciones",
          icon: MessageSquare,
          tooltip: "Sistema de notificaciones institucionales",
          items: [
            {
              title: "Crear",
              url: "/notificaciones/crear",
              tooltip: "Creación de nuevas notificaciones y anuncios",
            },
            {
              title: "Gestionar",
              url: "/notificaciones/gestionar",
              tooltip: "Administración de notificaciones existentes",
            },
          ],
        },
      ],
    },
    {
      title: "Académico",
      url: "#",
      icon: BookOpen,
      tooltip: "Gestión académica, notas, cursos y certificaciones",
      items: [
        {
          title: "Registro de Notas",
          url: "/notas",
          icon: ClipboardList,
          tooltip: "Auditoría y seguimiento de calificaciones cargadas por docentes",
        },
        {
          title: "Cursos",
          url: "/cursos",
          icon: Calendar,
          tooltip: "Gestión de cursos, materias y asignaciones docentes",
        },
        {
          title: "Matrículas",
          url: "/matriculas",
          icon: Award,
          tooltip: "Proceso de matriculación y asignación de estudiantes",
        },
        {
          title: "Certificaciones",
          url: "/certificaciones",
          icon: FileText,
          tooltip: "Generación y gestión de certificados académicos",
        },
      ],
    },
    {
      title: "Tesorería",
      url: "#",
      icon: Calculator,
      tooltip: "Gestión financiera, ingresos y egresos institucionales",
      items: [
        {
          title: "Ingresos",
          url: "/ingresos",
          icon: TrendingUp,
          tooltip: "Registro y control de ingresos institucionales",
        },
        {
          title: "Egresos",
          url: "/egresos",
          icon: DollarSign,
          tooltip: "Gestión de gastos y egresos institucionales",
        },
      ],
    },
    {
      title: "Informes",
      url: "#",
      icon: BarChart3,
      tooltip: "Reportes y análisis estadísticos institucionales",
      items: [
        {
          title: "Reportes Académicos",
          url: "/reportes/academicos",
          icon: BarChart3,
          tooltip: "Análisis de rendimiento académico y estadísticas estudiantiles",
        },
        {
          title: "Reportes Financieros",
          url: "/reportes/financieros",
          icon: DollarSign,
          tooltip: "Análisis financiero, ingresos, egresos y rentabilidad",
        },
        {
          title: "Asistencia",
          url: "/reportes/asistencia",
          icon: UserCheck,
          tooltip: "Control y análisis de asistencia estudiantil",
        },
        {
          title: "Actividades/Tareas",
          url: "/reportes/actividades",
          icon: ClipboardList,
          tooltip: "Seguimiento de tareas y actividades académicas",
        },
      ],
    },
    {
      title: "Soporte",
      url: "#",
      icon: HeadphonesIcon,
      tooltip: "Sistema de soporte técnico y atención al usuario",
      items: [
        {
          title: "Solicitudes",
          url: "/soporte/solicitudes",
          icon: MessageSquare,
          tooltip: "Gestión de tickets y solicitudes de soporte",
        },
        {
          title: "Historial",
          url: "/soporte/historial",
          icon: Activity,
          tooltip: "Historial de solicitudes resueltas y métricas de soporte",
        },
      ],
    },
    {
      title: "Configuración",
      url: "#",
      icon: Settings,
      tooltip: "Configuración general del sistema y administración",
      items: [
        {
          title: "General",
          url: "/configuracion/general",
          icon: Settings,
          tooltip: "Configuración general del sistema",
        },
        {
          title: "Gestión Documental",
          url: "/configuracion/documentos",
          icon: FolderOpen,
          tooltip: "Administración de documentos y archivos",
        },
        {
          title: "Usuarios y Seguridad",
          url: "/configuracion/usuarios",
          icon: Shield,
          tooltip: "Gestión de usuarios, roles y permisos",
        },
        {
          title: "Alertas",
          url: "/configuracion/alertas",
          icon: Bell,
          tooltip: "Configuración de notificaciones y alertas del sistema",
        },
      ],
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeView: string
  onViewChange: (view: string) => void
  showNotificationPanel: boolean
  onToggleNotificationPanel: (show: boolean) => void
}

export function AppSidebar({
  activeView,
  onViewChange,
  showNotificationPanel,
  onToggleNotificationPanel,
  ...props
}: AppSidebarProps) {
  const handleNavigation = (item: any, subItem?: any, subSubItem?: any) => {
    // Función recursiva para manejar navegación en múltiples niveles
    if (subSubItem) {
      // Navegación de tercer nivel (sub-sub-items)
      onViewChange(subSubItem.url.replace("/", ""))
    } else if (subItem) {
      // Navegación de segundo nivel (sub-items)
      if (subItem.title === "Proceso de Matrícula") onViewChange("estudiantes/proceso-matricula")
      else if (subItem.title === "Listas Estudiantil") onViewChange("estudiantes/listas-estudiantil")
      else if (subItem.title === "Graduados") onViewChange("estudiantes/graduados")
      else if (subItem.title === "Registro de Notas") onViewChange("notas")
      else if (subItem.title === "Cursos") onViewChange("cursos")
      else if (subItem.title === "Matrículas") onViewChange("matriculas")
      else if (subItem.title === "Certificaciones") onViewChange("certificaciones")
      else if (subItem.title === "Ingresos") onViewChange("ingresos")
      else if (subItem.title === "Egresos") onViewChange("egresos")
      else if (subItem.title === "Reportes Académicos") onViewChange("reportes/academicos")
      else if (subItem.title === "Reportes Financieros") onViewChange("reportes/financieros")
      else if (subItem.title === "Asistencia") onViewChange("reportes/asistencia")
      else if (subItem.title === "Actividades/Tareas") onViewChange("reportes/actividades")
      else if (subItem.title === "Solicitudes") onViewChange("soporte/solicitudes")
      else if (subItem.title === "Historial") onViewChange("soporte/historial")
      else if (subItem.title === "Crear Docente") onViewChange("docentes/crear")
      else if (subItem.title === "Lista con Filtros") onViewChange("docentes/lista")
      else if (item.title === "Notificaciones") {
        if (subItem.title === "Crear") {
          onViewChange("notificaciones/crear")
          onToggleNotificationPanel(true)
        } else if (subItem.title === "Gestionar") {
          onViewChange("notificaciones/gestionar")
        }
      } else if (subItem.title === "Crear") {
        if (item.title === "Administrativos") onViewChange("administrativos/crear")
      } else if (subItem.title === "Ver Lista") onViewChange("administrativos/lista")
      else if (subItem.title === "Registro") {
        if (item.title === "Familiares") onViewChange("familiares/registro")
        else if (item.title === "Codeudores") onViewChange("codeudores/registro")
      } else if (subItem.title === "Listado") {
        if (item.title === "Familiares") onViewChange("familiares/lista")
        else if (item.title === "Codeudores") onViewChange("codeudores/lista")
      } else if (subItem.title === "Gestionar") onViewChange("notificaciones/gestionar")
      else if (subItem.title === "General") onViewChange("configuracion/general")
      else if (subItem.title === "Gestión Documental") onViewChange("configuracion/documentos")
      else if (subItem.title === "Usuarios y Seguridad") onViewChange("configuracion/usuarios")
      else if (subItem.title === "Alertas") onViewChange("configuracion/alertas")
      else onViewChange(subItem.url.replace("/", ""))
    } else {
      // Navegación de primer nivel
      if (item.title === "Dashboard") onViewChange("dashboard")
    }
  }

  const renderMenuItems = (items: any[], level = 0) => {
    return items.map((item) => (
      <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.tooltip} onClick={() => handleNavigation(item)} className="cursor-pointer">
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.items && (
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {item.items && (
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items.map((subItem: any) => (
                  <Collapsible key={subItem.title} asChild className="group/collapsible-sub">
                    <SidebarMenuSubItem>
                      {subItem.items ? (
                        <>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton
                              tooltip={subItem.tooltip}
                              onClick={() => handleNavigation(item, subItem)}
                              className="cursor-pointer"
                            >
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible-sub:rotate-90" />
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {subItem.items.map((subSubItem: any) => (
                                <SidebarMenuSubItem key={subSubItem.title}>
                                  <SidebarMenuSubButton
                                    onClick={() => handleNavigation(item, subItem, subSubItem)}
                                    className="cursor-pointer"
                                    tooltip={subSubItem.tooltip}
                                  >
                                    <span>{subSubItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </>
                      ) : (
                        <SidebarMenuSubButton
                          onClick={() => handleNavigation(item, subItem)}
                          className="cursor-pointer"
                          tooltip={subItem.tooltip}
                        >
                          {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      )}
                    </SidebarMenuSubItem>
                  </Collapsible>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
        </SidebarMenuItem>
      </Collapsible>
    ))
  }

  return (
    <Sidebar collapsible="icon" {...props}   >
      <SidebarHeader >
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Panel administrativo</span>
            <span className="truncate text-xs text-muted-foreground">Colegio Jaime Quijano</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(data.navMain)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Users className="h-4 w-4" />
              <span>Admin Usuario</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
}
