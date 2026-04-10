"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  MessageCircle,
  School,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Search,
  Phone,
  User,
  ArrowRight,
  Users,
  FolderOpen,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Filter,
  Download,
  Eye,
  ArrowDown,
} from "lucide-react"

interface Student {
  id: string
  name: string
  document: string
  grade: string
  guardian: string
  phone: string
  email: string
  currentStep: "inscripcion" | "documentacion" | "entrevista" | "prematricula" | "matricula"
  status: "pending" | "in-progress" | "completed" | "rejected"
  dateStarted: string
  lastUpdate: string
  notes?: string
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Ana García Pérez",
    document: "1234567890",
    grade: "10°A",
    guardian: "Carlos García",
    phone: "300-123-4567",
    email: "ana.garcia@email.com",
    currentStep: "matricula",
    status: "in-progress",
    dateStarted: "2024-01-15",
    lastUpdate: "2024-02-10",
  },
  {
    id: "2",
    name: "Carlos Rodríguez López",
    document: "0987654321",
    grade: "11°B",
    guardian: "María López",
    phone: "301-234-5678",
    email: "carlos.rodriguez@email.com",
    currentStep: "entrevista",
    status: "pending",
    dateStarted: "2024-01-20",
    lastUpdate: "2024-02-05",
  },
  {
    id: "3",
    name: "María López Martínez",
    document: "1122334455",
    grade: "9°C",
    guardian: "Juan López",
    phone: "302-345-6789",
    email: "maria.lopez@email.com",
    currentStep: "prematricula",
    status: "completed",
    dateStarted: "2024-01-10",
    lastUpdate: "2024-02-08",
  },
  {
    id: "4",
    name: "Juan Martínez Silva",
    document: "5544332211",
    grade: "10°B",
    guardian: "Ana Silva",
    phone: "303-456-7890",
    email: "juan.martinez@email.com",
    currentStep: "inscripcion",
    status: "in-progress",
    dateStarted: "2024-02-01",
    lastUpdate: "2024-02-12",
  },
  {
    id: "5",
    name: "Sofía Hernández Castro",
    document: "6677889900",
    grade: "11°A",
    guardian: "Pedro Hernández",
    phone: "304-567-8901",
    email: "sofia.hernandez@email.com",
    currentStep: "matricula",
    status: "completed",
    dateStarted: "2024-01-05",
    lastUpdate: "2024-02-15",
  },
  {
    id: "6",
    name: "Diego Ramírez Torres",
    document: "7788990011",
    grade: "9°A",
    guardian: "Carmen Torres",
    phone: "305-678-9012",
    email: "diego.ramirez@email.com",
    currentStep: "documentacion",
    status: "pending",
    dateStarted: "2024-02-03",
    lastUpdate: "2024-02-14",
  },
  {
    id: "7",
    name: "Valentina Morales Cruz",
    document: "2233445566",
    grade: "10°C",
    guardian: "Roberto Morales",
    phone: "306-789-0123",
    email: "valentina.morales@email.com",
    currentStep: "documentacion",
    status: "in-progress",
    dateStarted: "2024-01-28",
    lastUpdate: "2024-02-13",
  },
]

const processSteps = [
  {
    id: "inscripcion",
    title: "Inscripción",
    shortTitle: "Inscripción",
    description: "Registro inicial del aspirante",
    shortDescription: "Registro inicial",
    icon: FileText,
    color: "blue",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
    darkBg: "dark:bg-blue-900/20",
    lightText: "text-blue-700 dark:text-blue-300",
    darkText: "dark:text-blue-400",
    lightBorder: "border-blue-200 dark:border-blue-800",
    darkBorder: "dark:border-blue-700",
    lightRing: "ring-blue-500/20 dark:ring-blue-400/30",
    darkRing: "dark:ring-blue-500/40",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "documentacion",
    title: "Documentación",
    shortTitle: "Docs",
    description: "Revisión y validación de documentos",
    shortDescription: "Validación docs",
    icon: FolderOpen,
    color: "indigo",
    lightBg: "bg-indigo-50 dark:bg-indigo-950/30",
    darkBg: "dark:bg-indigo-900/20",
    lightText: "text-indigo-700 dark:text-indigo-300",
    darkText: "dark:text-indigo-400",
    lightBorder: "border-indigo-200 dark:border-indigo-800",
    darkBorder: "dark:border-indigo-700",
    lightRing: "ring-indigo-500/20 dark:ring-indigo-400/30",
    darkRing: "dark:ring-indigo-500/40",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    id: "entrevista",
    title: "Entrevista",
    shortTitle: "Entrevista",
    description: "Evaluación y entrevista familiar",
    shortDescription: "Evaluación",
    icon: MessageCircle,
    color: "purple",
    lightBg: "bg-purple-50 dark:bg-purple-950/30",
    darkBg: "dark:bg-purple-900/20",
    lightText: "text-purple-700 dark:text-purple-300",
    darkText: "dark:text-purple-400",
    lightBorder: "border-purple-200 dark:border-purple-800",
    darkBorder: "dark:border-purple-700",
    lightRing: "ring-purple-500/20 dark:ring-purple-400/30",
    darkRing: "dark:ring-purple-500/40",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    id: "prematricula",
    title: "Pre-matrícula",
    shortTitle: "Pre-mat",
    description: "Proceso de pre-matrícula",
    shortDescription: "Pre-matrícula",
    icon: School,
    color: "orange",
    lightBg: "bg-orange-50 dark:bg-orange-950/30",
    darkBg: "dark:bg-orange-900/20",
    lightText: "text-orange-700 dark:text-orange-300",
    darkText: "dark:text-orange-400",
    lightBorder: "border-orange-200 dark:border-orange-800",
    darkBorder: "dark:border-orange-700",
    lightRing: "ring-orange-500/20 dark:ring-orange-400/30",
    darkRing: "dark:ring-orange-500/40",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    id: "matricula",
    title: "Matrícula",
    shortTitle: "Matrícula",
    description: "Matrícula oficial",
    shortDescription: "Matrícula final",
    icon: UserCheck,
    color: "green",
    lightBg: "bg-green-50 dark:bg-green-950/30",
    darkBg: "dark:bg-green-900/20",
    lightText: "text-green-700 dark:text-green-300",
    darkText: "dark:text-green-400",
    lightBorder: "border-green-200 dark:border-green-800",
    darkBorder: "dark:border-green-700",
    lightRing: "ring-green-500/20 dark:ring-green-400/30",
    darkRing: "dark:ring-green-500/40",
    gradient: "from-green-500 to-green-600",
  },
]

export function EnrollmentProcessContent() {
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<Student | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedStep, setSelectedStep] = useState<string>("inscripcion") // Por defecto inscripción
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("basica")

  // Calcular estadísticas por paso
  const getStepStats = (stepId: string) => {
    const studentsInStep = mockStudents.filter((s) => s.currentStep === stepId)
    return {
      total: studentsInStep.length,
      pending: studentsInStep.filter((s) => s.status === "pending").length,
      inProgress: studentsInStep.filter((s) => s.status === "in-progress").length,
      completed: studentsInStep.filter((s) => s.status === "completed").length,
      rejected: studentsInStep.filter((s) => s.status === "rejected").length,
    }
  }

  // Filtrar estudiantes según el paso seleccionado
  const getFilteredStudents = () => {
    let filtered = selectedStep ? mockStudents.filter((s) => s.currentStep === selectedStep) : mockStudents

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.document.includes(searchTerm) ||
          s.guardian.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedGrade !== "all") {
      filtered = filtered.filter((s) => s.grade === selectedGrade)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((s) => s.status === selectedStatus)
    }

    return filtered
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "pending":
        return "outline"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "in-progress":
        return "En Proceso"
      case "pending":
        return "Pendiente"
      case "rejected":
        return "Rechazado"
      default:
        return status
    }
  }

  return (
    <div className="w-full max-w-none space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6 absolute">
      {/* Header - Responsive */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Proceso de Matrícula</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Seguimiento completo del proceso desde inscripción hasta matrícula oficial
        </p>
      </div>

      {/* Estadísticas generales - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{mockStudents.length}</div>
            <p className="text-xs text-muted-foreground">En proceso general</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {mockStudents.filter((s) => s.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Proceso finalizado</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">En Proceso</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {mockStudents.filter((s) => s.status === "in-progress").length}
            </div>
            <p className="text-xs text-muted-foreground">Actualmente activos</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pendientes</CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {mockStudents.filter((s) => s.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Línea de tiempo del proceso - VERSIÓN COMPLETA V46 */}
      <Card className="overflow-hidden shadow-sm dark:shadow-lg dark:shadow-primary/5">
        <CardHeader className="bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-green-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-green-950/20 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold">Proceso de Matrícula - Línea de Tiempo</CardTitle>
              <CardDescription className="text-sm">
                Seguimiento visual del proceso completo. Toca cualquier etapa para ver los estudiantes.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs" id="filtros-button">
                <Filter className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Desktop Timeline */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Línea de progreso principal */}
              <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-indigo-200 via-purple-200 via-orange-200 to-green-200 dark:from-blue-800 dark:via-indigo-800 dark:via-purple-800 dark:via-orange-800 dark:to-green-800 rounded-full"></div>

              {/* Contenedor de pasos */}
              <div className="grid grid-cols-5 gap-6">
                {processSteps.map((step, index) => {
                  const stats = getStepStats(step.id)
                  const isSelected = selectedStep === step.id
                  const StepIcon = step.icon
                  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

                  return (
                    <div key={step.id} className="relative flex flex-col items-center justify-start">
                      {/* Círculo del paso - CENTRADO CORREGIDO */}
                      <div className="relative z-10 mb-4 flex items-center justify-center">
                        <Button
                          variant="ghost"
                          className={`
              w-24 h-24 rounded-full p-0 transition-all duration-300 hover:scale-105 flex items-center justify-center
              ${isSelected
                              ? `${step.lightBg} ${step.darkBg} ${step.lightBorder} ${step.darkBorder} border-2 shadow-lg ${step.lightRing} ${step.darkRing} ring-4`
                              : `${step.lightBg} ${step.darkBg} ${step.lightBorder} ${step.darkBorder} border hover:shadow-md dark:hover:shadow-lg`
                            }
            `}
                          onClick={() => setSelectedStep(selectedStep === step.id ? '' : step.id)}
                        >
                          <StepIcon className={`h-8 w-8 ${step.lightText} ${step.darkText}`} />
                        </Button>

                        {/* Indicador de progreso circular */}
                        {stats.total > 0 && (
                          <div className="absolute -top-2 -right-2">
                            <div
                              className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg
                  ${completionRate === 100
                                  ? "bg-green-500 dark:bg-green-600"
                                  : completionRate >= 50
                                    ? "bg-orange-500 dark:bg-orange-600"
                                    : "bg-red-500 dark:bg-red-600"
                                }
                `}
                            >
                              {completionRate}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Título y descripción debajo del círculo */}
                      <div className="text-center space-y-1 mb-4">
                        <div className={`font-semibold text-sm ${step.lightText} ${step.darkText}`}>{step.title}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>

                      {/* Estadísticas del paso */}
                      <div className="text-center space-y-2 min-h-[80px] w-full">
                        <div className="flex justify-center gap-1 flex-wrap">
                          {stats.total > 0 && (
                            <Badge variant="secondary" className="text-xs font-medium">
                              <Users className="h-3 w-3 mr-1" />
                              {stats.total}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {stats.completed > 0 && (
                            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{stats.completed}</span>
                            </div>
                          )}
                          {stats.inProgress > 0 && (
                            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                              <Clock3 className="h-3 w-3" />
                              <span>{stats.inProgress}</span>
                            </div>
                          )}
                          {stats.pending > 0 && (
                            <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{stats.pending}</span>
                            </div>
                          )}
                          {stats.rejected > 0 && (
                            <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                              <AlertCircle className="h-3 w-3" />
                              <span>{stats.rejected}</span>
                            </div>
                          )}
                        </div>

                        {/* Barra de progreso */}
                        {stats.total > 0 && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${completionRate === 100
                                ? "bg-green-500 dark:bg-green-600"
                                : completionRate >= 50
                                  ? "bg-orange-500 dark:bg-orange-600"
                                  : "bg-red-500 dark:bg-red-600"
                                }`}
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        )}
                      </div>

                      {/* Flecha de conexión */}
                      {index < processSteps.length - 1 && (
                        <div className="absolute top-12 -right-3 z-20">
                          <div className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-border">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Timeline - VERTICAL */}
          <div className="lg:hidden">
            <div className="relative">
              {/* Línea vertical de progreso */}
              <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-indigo-200 via-purple-200 via-orange-200 to-green-200 dark:from-blue-800 dark:via-indigo-800 dark:via-purple-800 dark:via-orange-800 dark:to-green-800 rounded-full"></div>

              {/* Contenedor de pasos vertical */}
              <div className="space-y-8">
                {processSteps.map((step, index) => {
                  const stats = getStepStats(step.id)
                  const isSelected = selectedStep === step.id
                  const StepIcon = step.icon
                  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

                  return (
                    <div key={step.id} className="relative flex items-start gap-4">
                      {/* Círculo del paso */}
                      <div className="relative z-10 flex-shrink-0">
                        <Button
                          variant="ghost"
                          className={`
                  w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0 transition-all duration-300 flex items-center justify-center
                  ${isSelected
                              ? `${step.lightBg} ${step.darkBg} ${step.lightBorder} ${step.darkBorder} border-2 shadow-lg ${step.lightRing} ${step.darkRing} ring-2`
                              : `${step.lightBg} ${step.darkBg} ${step.lightBorder} ${step.darkBorder} border hover:shadow-md`
                            }
                `}
                          onClick={() => setSelectedStep(selectedStep === step.id ? '' : step.id)}
                        >
                          <StepIcon className={`h-6 w-6 sm:h-7 sm:w-7 ${step.lightText} ${step.darkText}`} />
                        </Button>

                        {/* Indicador de progreso */}
                        {stats.total > 0 && (
                          <div className="absolute -top-1 -right-1">
                            <div
                              className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg
                      ${completionRate === 100 ? "bg-green-500" : completionRate >= 50 ? "bg-orange-500" : "bg-red-500"}
                    `}
                            >
                              {completionRate}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contenido del paso */}
                      <div className="flex-1 min-w-0 pb-8">
                        {/* Título y descripción */}
                        <div className="mb-3">
                          <div className={`font-semibold text-base sm:text-lg ${step.lightText} ${step.darkText}`}>
                            {step.title}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{step.description}</div>
                        </div>

                        {/* Estadísticas */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {stats.total > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {stats.total} estudiantes
                              </Badge>
                            )}
                            {stats.completed > 0 && (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {stats.completed} completados
                              </Badge>
                            )}
                            {stats.inProgress > 0 && (
                              <Badge
                                variant="default"
                                className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              >
                                <Clock3 className="h-3 w-3 mr-1" />
                                {stats.inProgress} en proceso
                              </Badge>
                            )}
                            {stats.pending > 0 && (
                              <Badge
                                variant="default"
                                className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {stats.pending} pendientes
                              </Badge>
                            )}
                          </div>

                          {/* Barra de progreso */}
                          {stats.total > 0 && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${completionRate === 100
                                  ? "bg-green-500"
                                  : completionRate >= 50
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                                  }`}
                                style={{ width: `${Math.max(completionRate, 5)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Flecha vertical */}
                      {index < processSteps.length - 1 && (
                        <div className="absolute left-8 sm:left-10 top-16 sm:top-20 z-20">
                          <div className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-border">
                            <ArrowDown className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span>Completado</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span>En Proceso</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                <span>Pendiente</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span>Rechazado</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de estudiantes - SIEMPRE VISIBLE */}
      <Card className="shadow-sm dark:shadow-lg dark:shadow-primary/5">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">
                Estudiantes en: {processSteps.find((s) => s.id === selectedStep)?.title}
              </CardTitle>
              <CardDescription>{getFilteredStudents().length} estudiante(s) en esta etapa</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros - Responsive */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:items-end mb-6">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, documento o acudiente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Grado</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="9°A">9°A</SelectItem>
                  <SelectItem value="9°B">9°B</SelectItem>
                  <SelectItem value="9°C">9°C</SelectItem>
                  <SelectItem value="10°A">10°A</SelectItem>
                  <SelectItem value="10°B">10°B</SelectItem>
                  <SelectItem value="11°A">11°A</SelectItem>
                  <SelectItem value="11°B">11°B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in-progress">En Proceso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla responsive */}
          <div className="rounded-md border">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Acudiente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredStudents().map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{student.document}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.guardian}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {student.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(student.status)}>{getStatusText(student.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(student.dateStarted).toLocaleDateString("es-ES")}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(student.lastUpdate).toLocaleDateString("es-ES")}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudentInfo(student)
                                setShowInfoModal(true)
                              }}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Ver información
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudentInfo(student)
                                setShowContactModal(true)
                              }}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Contactar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Vista móvil de estudiantes */}
            <div className="md:hidden space-y-3 p-4">
              {getFilteredStudents().map((student) => (
                <Card key={student.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStudentInfo(student)
                            setShowInfoModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver información
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStudentInfo(student)
                            setShowContactModal(true)
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Contactar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Documento:</span>
                      <p>{student.document}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Grado:</span>
                      <p>
                        <Badge variant="outline" className="text-xs">
                          {student.grade}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Acudiente:</span>
                      <p>{student.guardian}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado:</span>
                      <p>
                        <Badge variant={getStatusColor(student.status)} className="text-xs">
                          {getStatusText(student.status)}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Inicio: {new Date(student.dateStarted).toLocaleDateString("es-ES")}</span>
                      <span>Actualizado: {new Date(student.lastUpdate).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Información del Estudiante */}
      {showInfoModal && selectedStudentInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-7xl h-[95vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex flex-col h-full">
              {/* Header del Modal - Fijo */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="mb-2 sm:mb-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Perfil del Estudiante</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedStudentInfo.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfoModal(false)}
                  className="self-end sm:self-start text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              {/* Navegación por pestañas - Fija */}
              <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {/* Desktop - Grid compacto */}
                <div className="hidden lg:grid grid-cols-7 gap-1 p-2">
                  {[
                    { id: "basica", name: "Información Básica", shortName: "Básica", icon: "👤" },
                    { id: "simat", name: "SIMAT", shortName: "SIMAT", icon: "📋" },
                    { id: "familia", name: "Familia", shortName: "Familia", icon: "👨‍👩‍👧‍👦" },
                    { id: "examen", name: "Examen de Admisión", shortName: "Examen", icon: "📝" },
                    { id: "entrevista", name: "Entrevista", shortName: "Entrevista", icon: "💬" },
                    { id: "documentos", name: "Documentos", shortName: "Docs", icon: "📄" },
                    { id: "pagos", name: "Estado de Pago", shortName: "Pagos", icon: "💳" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${activeTab === tab.id
                        ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                        } p-2 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 text-center min-h-[60px] justify-center`}
                    >
                      <span className="text-base">{tab.icon}</span>
                      <span className="text-xs font-medium leading-tight">{tab.shortName}</span>
                    </button>
                  ))}
                </div>

                {/* Tablet - Scroll horizontal */}
                <div className="lg:hidden md:block hidden">
                  <div className="flex overflow-x-auto p-2 gap-2 scrollbar-hide">
                    {[
                      { id: "basica", name: "Información Básica", shortName: "Básica", icon: "👤" },
                      { id: "simat", name: "SIMAT", shortName: "SIMAT", icon: "📋" },
                      { id: "familia", name: "Familia", shortName: "Familia", icon: "👨‍👩‍👧‍👦" },
                      { id: "examen", name: "Examen de Admisión", shortName: "Examen", icon: "📝" },
                      { id: "entrevista", name: "Entrevista", shortName: "Entrevista", icon: "💬" },
                      { id: "documentos", name: "Documentos", shortName: "Docs", icon: "📄" },
                      { id: "pagos", name: "Estado de Pago", shortName: "Pagos", icon: "💳" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${activeTab === tab.id
                          ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                          } p-2 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 text-center min-h-[60px] min-w-[80px] justify-center flex-shrink-0`}
                      >
                        <span className="text-base">{tab.icon}</span>
                        <span className="text-xs font-medium leading-tight">{tab.shortName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile - Dropdown selector */}
                <div className="md:hidden p-3">
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span>
                            {
                              [
                                { id: "basica", name: "Información Básica", icon: "👤" },
                                { id: "simat", name: "SIMAT", icon: "📋" },
                                { id: "familia", name: "Familia", icon: "👨‍👩‍👧‍👦" },
                                { id: "examen", name: "Examen de Admisión", icon: "📝" },
                                { id: "entrevista", name: "Entrevista", icon: "💬" },
                                { id: "documentos", name: "Documentos", icon: "📄" },
                                { id: "pagos", name: "Estado de Pago", icon: "💳" },
                              ].find((tab) => tab.id === activeTab)?.icon
                            }
                          </span>
                          <span className="font-medium text-sm">
                            {
                              [
                                { id: "basica", name: "Información Básica", icon: "👤" },
                                { id: "simat", name: "SIMAT", icon: "📋" },
                                { id: "familia", name: "Familia", icon: "👨‍👩‍👧‍👦" },
                                { id: "examen", name: "Examen de Admisión", icon: "📝" },
                                { id: "entrevista", name: "Entrevista", icon: "💬" },
                                { id: "documentos", name: "Documentos", icon: "📄" },
                                { id: "pagos", name: "Estado de Pago", icon: "💳" },
                              ].find((tab) => tab.id === activeTab)?.name
                            }
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { id: "basica", name: "Información Básica", icon: "👤" },
                        { id: "simat", name: "SIMAT", icon: "📋" },
                        { id: "familia", name: "Familia", icon: "👨‍👩‍👧‍👦" },
                        { id: "examen", name: "Examen de Admisión", icon: "📝" },
                        { id: "entrevista", name: "Entrevista", icon: "💬" },
                        { id: "documentos", name: "Documentos", icon: "📄" },
                        { id: "pagos", name: "Estado de Pago", icon: "💳" },
                      ].map((tab) => (
                        <SelectItem key={tab.id} value={tab.id}>
                          <div className="flex items-center gap-2">
                            <span>{tab.icon}</span>
                            <span>{tab.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contenido de las pestañas - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 sm:p-4 lg:p-6">
                  {activeTab === "basica" && (
                    <div className="space-y-3 sm:space-y-4">
                      {/* Fotografía del Estudiante */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-purple-500">📸</span>
                          Fotografía del Estudiante
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="relative">
                            <img
                              src={`/placeholder.svg?height=150&width=120&text=${encodeURIComponent(selectedStudentInfo.name)}`}
                              alt={`Foto de ${selectedStudentInfo.name}`}
                              className="w-24 h-32 sm:w-30 sm:h-40 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md"
                            />
                            <div className="absolute -bottom-2 -right-2">
                              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                Verificada
                              </Badge>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2 text-center sm:text-left">
                            <div className="space-y-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
                                Última Actualización:
                              </span>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(selectedStudentInfo.lastUpdate).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
                                Estado de la Foto:
                              </span>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobada
                              </Badge>
                            </div>
                            <div className="flex gap-2 justify-center sm:justify-start">
                              <Button variant="outline" size="sm" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Ver Original
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs">
                                <Download className="h-3 w-3 mr-1" />
                                Descargar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información Personal */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-blue-500">👤</span>
                          Información Personal
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Nombre Completo
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                              {selectedStudentInfo.name}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Identificación</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedStudentInfo.document}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Fecha de Nacimiento
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">15/03/2008</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sexo</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Femenino</p>
                          </div>
                          <div className="space-y-1 sm:col-span-2 xl:col-span-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Lugar de Nacimiento
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Bogotá, Cundinamarca</p>
                          </div>
                        </div>
                      </div>

                      {/* Información de Contacto */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-green-500">📞</span>
                          Información de Contacto
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Teléfono Fijo</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">601-234-5678</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Celular</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedStudentInfo.phone}
                            </p>
                          </div>
                          <div className="space-y-1 sm:col-span-2 xl:col-span-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Correo Electrónico
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                              {selectedStudentInfo.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Información de Ubicación */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-purple-500">📍</span>
                          Información de Ubicación
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Lugar de Residencia
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Bogotá, Cundinamarca</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Barrio</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Chapinero</p>
                          </div>
                          <div className="space-y-1 sm:col-span-2 xl:col-span-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dirección</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Calle 63 #11-45 Apto 301
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Información Académica */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-orange-500">🎓</span>
                          Información Académica
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Grado</span>
                            <div className="flex items-center">
                              <Badge variant="outline" className="text-xs">
                                {selectedStudentInfo.grade}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sede - Jornada</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Principal - Mañana</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Año Lectivo</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">2024</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "simat" && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-blue-500">📋</span>
                        Información SIMAT
                      </h3>

                      {/* Información Básica SIMAT */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
                          Datos Básicos SIMAT
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Código SIMAT:
                              </span>
                              <span className="font-medium text-sm">2024{selectedStudentInfo.document}</span>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Estado en SIMAT:
                              </span>
                              <Badge variant="default" className="bg-green-100 text-green-800 self-start">
                                Activo
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Fecha de Registro:
                              </span>
                              <span className="font-medium text-sm">
                                {new Date(selectedStudentInfo.dateStarted).toLocaleDateString("es-ES")}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Expedición del Documento:
                              </span>
                              <span className="font-medium text-sm">Bogotá D.C.</span>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Modalidad:</span>
                              <span className="font-medium text-sm">Académica</span>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Zona:</span>
                              <span className="font-medium text-sm">Urbana</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información Socioeconómica */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
                          Información Socioeconómica
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Estrato:</span>
                              <span className="font-medium text-sm">3</span>
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Tiene Subsidio:
                              </span>
                              <Badge variant="outline" className="self-start">
                                No
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Número Carnet Sisbén:
                              </span>
                              <span className="font-medium text-sm">123456789</span>
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Grupo Sisbén:
                              </span>
                              <span className="font-medium text-sm">C</span>
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Fuente de Recursos:
                              </span>
                              <span className="font-medium text-sm">Recursos Propios</span>
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Madre Cabeza de Familia:
                              </span>
                              <Badge variant="outline" className="self-start">
                                No
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información de Salud */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
                          Información de Salud
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">EPS:</span>
                              <span className="font-medium text-sm">Compensar</span>
                            </div>
                          </div>
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">ARS:</span>
                              <span className="font-medium text-sm">N/A</span>
                            </div>
                          </div>
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">IPS:</span>
                              <span className="font-medium text-sm">Centro Médico Chapinero</span>
                            </div>
                          </div>
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Tipo de Sangre:
                              </span>
                              <span className="font-medium text-sm">O+</span>
                            </div>
                          </div>
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Tipo de Discapacidad:
                              </span>
                              <span className="font-medium text-sm">Ninguna</span>
                            </div>
                          </div>
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Capacidad Excepcional:
                              </span>
                              <span className="font-medium text-sm">Ninguna</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información Académica Específica */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
                          Información Académica Específica
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Situación Académica Año Anterior:
                              </span>
                              <span className="font-medium text-sm">Promovido</span>
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Apoyo Académico Especial:
                              </span>
                              <span className="font-medium text-sm">No requiere</span>
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Proviene del Sector Privado:
                              </span>
                              <Badge variant="outline" className="self-start">
                                Sí
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Institución de Origen:
                              </span>
                              <span className="font-medium text-sm">Colegio San Patricio</span>
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Trastornos de Aprendizaje:
                              </span>
                              <span className="font-medium text-sm">Ninguno</span>
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Sistema de Responsabilidad Penal:
                              </span>
                              <span className="font-medium text-sm">No aplica</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información Demográfica y Social */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
                          Información Demográfica y Social
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Etnia:</span>
                              <span className="font-medium text-sm">Mestizo</span>
                            </div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Beneficiario Veterano Fuerza Pública:
                              </span>
                              <Badge variant="outline" className="self-start">
                                No
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Beneficiario Madre Cabeza Familia:
                              </span>
                              <Badge variant="outline" className="self-start">
                                No
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Beneficiario Héroe de la Nación:
                              </span>
                              <Badge variant="outline" className="self-start">
                                No
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Proviene de Otro Municipio:
                              </span>
                              <Badge variant="outline" className="self-start">
                                No
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Población Víctima del Conflicto:
                              </span>
                              <Badge variant="outline" className="self-start">
                                No
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Última Actualización */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
                          Control de Cambios
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Última Actualización SIMAT:
                              </span>
                              <span className="font-medium text-sm">
                                {new Date(selectedStudentInfo.lastUpdate).toLocaleDateString("es-ES")}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Usuario Responsable:
                              </span>
                              <span className="font-medium text-sm">Admin Sistema</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "familia" && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-blue-500">👨‍👩‍👧‍👦</span>
                        Información Familiar
                      </h3>

                      {/* Información del Padre */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-blue-500">👨</span>
                          Información del Padre
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Nombre Completo:
                                </span>
                                <span className="font-medium text-sm">{selectedStudentInfo.guardian}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Documento:</span>
                                <span className="font-medium text-sm">12345678</span>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Teléfono:</span>
                                <span className="font-medium text-sm">{selectedStudentInfo.phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Ocupación:</span>
                                <span className="font-medium text-sm">Ingeniero</span>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Nivel Educativo:
                                </span>
                                <span className="font-medium text-sm">Universitario</span>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Email:</span>
                                <span className="font-medium text-sm break-all">{selectedStudentInfo.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información de la Madre */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-pink-500">👩</span>
                          Información de la Madre
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Nombre Completo:
                                </span>
                                <span className="font-medium text-sm">María Elena Pérez Rodríguez</span>
                              </div>
                            </div>
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Documento:</span>
                                <span className="font-medium text-sm">87654321</span>
                              </div>
                            </div>
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Teléfono:</span>
                                <span className="font-medium text-sm">301-987-6543</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Ocupación:</span>
                                <span className="font-medium text-sm">Contadora</span>
                              </div>
                            </div>
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Nivel Educativo:
                                </span>
                                <span className="font-medium text-sm">Universitario</span>
                              </div>
                            </div>
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Email:</span>
                                <span className="font-medium text-sm break-all">maria.perez@email.com</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información de Codeudores */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-purple-500">🤝</span>
                          Información de Codeudores
                        </h4>
                        <div className="space-y-4">
                          {/* Codeudor 1 */}
                          <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-2">
                              <span className="text-purple-500">👤</span>
                              Codeudor Principal
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Nombre:</span>
                                  <span className="font-medium text-sm">Roberto García Martínez</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Documento:
                                  </span>
                                  <span className="font-medium text-sm">11223344</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Parentesco:
                                  </span>
                                  <span className="font-medium text-sm">Abuelo</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Teléfono:
                                  </span>
                                  <span className="font-medium text-sm">302-111-2222</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Ocupación:
                                  </span>
                                  <span className="font-medium text-sm">Pensionado</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Estado:</span>
                                  <Badge variant="default" className="bg-green-100 text-green-800 self-start">
                                    Activo
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Codeudor 2 */}
                          <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-2">
                              <span className="text-purple-500">👤</span>
                              Codeudor Secundario
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Nombre:</span>
                                  <span className="font-medium text-sm">Carmen Rodríguez López</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Documento:
                                  </span>
                                  <span className="font-medium text-sm">55667788</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Parentesco:
                                  </span>
                                  <span className="font-medium text-sm">Tía</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Teléfono:
                                  </span>
                                  <span className="font-medium text-sm">303-333-4444</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Ocupación:
                                  </span>
                                  <span className="font-medium text-sm">Profesora</span>
                                </div>
                              </div>
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Estado:</span>
                                  <Badge variant="default" className="bg-green-100 text-green-800 self-start">
                                    Activo
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información Socioeconómica */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-green-500">💰</span>
                          Información Socioeconómica Familiar
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Estrato:</span>
                                <span className="font-medium text-sm">3</span>
                              </div>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Tipo de Vivienda:
                                </span>
                                <span className="font-medium text-sm">Propia</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Personas en el Hogar:
                                </span>
                                <span className="font-medium text-sm">4</span>
                              </div>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Ingresos Familiares:
                                </span>
                                <span className="font-medium text-sm">2-3 SMLV</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "examen" && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-blue-500">📝</span>
                        Resultados del Examen de Admisión
                      </h3>

                      {/* Resumen General del Examen */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-blue-500">🎯</span>
                          Resumen General del Examen
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">85.8</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Puntaje Total</div>
                            <div className="text-xs text-gray-500 mt-1">sobre 100</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">APROBADO</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Estado</div>
                            <div className="text-xs text-gray-500 mt-1">Puntaje mínimo: 70</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">6/6</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Áreas Evaluadas</div>
                            <div className="text-xs text-gray-500 mt-1">Todas aprobadas</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">2h 30m</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Tiempo Total</div>
                            <div className="text-xs text-gray-500 mt-1">Límite: 3 horas</div>
                          </div>
                        </div>

                        {/* Barra de progreso general */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full flex items-center justify-end pr-2"
                            style={{ width: "85.8%" }}
                          >
                            <span className="text-xs text-white font-medium">85.8%</span>
                          </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                          Excelente desempeño - Estudiante recomendada para admisión
                        </p>
                      </div>

                      {/* Resultados por Área */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-green-500">📊</span>
                          Resultados Detallados por Área
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Matemáticas */}
                          <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Matemáticas</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Álgebra, Geometría, Aritmética
                                </p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">85/100</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Álgebra</div>
                                  <div className="text-gray-500">88/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Geometría</div>
                                  <div className="text-gray-500">82/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Aritmética</div>
                                  <div className="text-gray-500">85/100</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Lenguaje */}
                          <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Lenguaje</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Comprensión, Gramática, Redacción
                                </p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">92/100</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Comprensión</div>
                                  <div className="text-gray-500">95/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Gramática</div>
                                  <div className="text-gray-500">90/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Redacción</div>
                                  <div className="text-gray-500">91/100</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Ciencias */}
                          <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Ciencias</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Biología, Química, Física</p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">78/100</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Biología</div>
                                  <div className="text-gray-500">82/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Química</div>
                                  <div className="text-gray-500">75/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Física</div>
                                  <div className="text-gray-500">77/100</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Inglés */}
                          <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Inglés</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Reading, Listening, Grammar</p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">88/100</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "88%" }}></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Reading</div>
                                  <div className="text-gray-500">90/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Listening</div>
                                  <div className="text-gray-500">85/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Grammar</div>
                                  <div className="text-gray-500">89/100</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Sociales */}
                          <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Ciencias Sociales</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Historia, Geografía, Cívica</p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">82/100</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: "82%" }}></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Historia</div>
                                  <div className="text-gray-500">85/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Geografía</div>
                                  <div className="text-gray-500">80/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Cívica</div>
                                  <div className="text-gray-500">81/100</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Razonamiento Lógico */}
                          <div className="border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Razonamiento Lógico</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Análisis, Síntesis, Deducción
                                </p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">90/100</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "90%" }}></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Análisis</div>
                                  <div className="text-gray-500">92/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Síntesis</div>
                                  <div className="text-gray-500">88/100</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Deducción</div>
                                  <div className="text-gray-500">90/100</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información del Examen */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-purple-500">📅</span>
                          Información del Examen
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Fecha del Examen:
                              </span>
                              <span className="font-medium text-sm">20/01/2024</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Lugar:</span>
                              <span className="font-medium text-sm">Salón de Actos</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Aplicador:</span>
                              <span className="font-medium text-sm">Dra. Ana Pérez</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Observaciones:
                              </span>
                              <span className="font-medium text-sm">Ninguna</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones Adicionales */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-green-500">⚙️</span>
                          Acciones Adicionales
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Descargar Resultados
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Examen Original
                          </Button>
                          <Button variant="secondary" size="sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Validar Resultados
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "entrevista" && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-blue-500">💬</span>
                        Información de la Entrevista
                      </h3>

                      {/* Resumen de la Entrevista */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-blue-500">🎯</span>
                          Resumen General de la Entrevista
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">8.5</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Calificación</div>
                            <div className="text-xs text-gray-500 mt-1">sobre 10</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">APROBADO</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Resultado</div>
                            <div className="text-xs text-gray-500 mt-1">Recomendado</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">1h 15m</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Duración</div>
                            <div className="text-xs text-gray-500 mt-1">Aprox.</div>
                          </div>
                        </div>

                        {/* Barra de progreso general */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full flex items-center justify-end pr-2"
                            style={{ width: "85%" }}
                          >
                            <span className="text-xs text-white font-medium">85%</span>
                          </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                          Entrevista exitosa - Familia comprometida con el proceso
                        </p>
                      </div>

                      {/* Áreas Evaluadas */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-green-500">📊</span>
                          Áreas Evaluadas
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Nivel Socioeconómico */}
                          <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Nivel Socioeconómico</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Estabilidad, Ingresos</p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">9/10</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: "90%" }}></div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Estabilidad</div>
                                  <div className="text-gray-500">9/10</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Ingresos</div>
                                  <div className="text-gray-500">9/10</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Dinámica Familiar */}
                          <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Dinámica Familiar</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Relaciones, Comunicación</p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">8/10</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Relaciones</div>
                                  <div className="text-gray-500">8/10</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Comunicación</div>
                                  <div className="text-gray-500">8/10</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Compromiso Familiar */}
                          <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Compromiso Familiar</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Apoyo, Interés</p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">9/10</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "90%" }}></div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Apoyo</div>
                                  <div className="text-gray-500">9/10</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Interés</div>
                                  <div className="text-gray-500">9/10</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expectativas */}
                          <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">Expectativas</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Realistas, Alineadas</p>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Aprobado
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Puntaje:</span>
                                <span className="font-semibold">8/10</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium">Realistas</div>
                                  <div className="text-gray-500">8/10</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">Alineadas</div>
                                  <div className="text-gray-500">8/10</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información de la Entrevista */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-purple-500">📅</span>
                          Información de la Entrevista
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Fecha:</span>
                              <span className="font-medium text-sm">25/01/2024</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Hora:</span>
                              <span className="font-medium text-sm">10:00 AM</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Entrevistador:
                              </span>
                              <span className="font-medium text-sm">Dra. Sofía Gómez</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Modalidad:</span>
                              <span className="font-medium text-sm">Virtual</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Observaciones */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-green-500">📝</span>
                          Observaciones
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Generales:</span>
                              <span className="font-medium text-sm">
                                Familia muy colaboradora y con altas expectativas.
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Recomendaciones:
                              </span>
                              <span className="font-medium text-sm">Seguimiento cercano al proceso de adaptación.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones Adicionales */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-green-500">⚙️</span>
                          Acciones Adicionales
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Descargar Informe
                          </Button>
                          <Button variant="secondary" size="sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Validar Entrevista
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "documentos" && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-blue-500">📄</span>
                        Documentos Requeridos
                      </h3>

                      {/* Lista de Documentos */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-blue-500">📝</span>
                          Lista de Documentos Requeridos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Documento 1 - Cédula del Padre */}
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Cédula del Padre:
                              </span>
                              <span className="font-medium text-sm">Documento de identidad</span>
                              <Badge variant="default" className="bg-green-100 text-green-800 self-start">
                                Entregado
                              </Badge>
                            </div>
                          </div>

                          {/* Documento 2 - Cédula de la Madre */}
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Cédula de la Madre:
                              </span>
                              <span className="font-medium text-sm">Documento de identidad</span>
                              <Badge variant="default" className="bg-green-100 text-green-800 self-start">
                                Entregado
                              </Badge>
                            </div>
                          </div>

                          {/* Documento 3 - Fotografías 3x4 */}
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Fotografías 3x4:
                              </span>
                              <span className="font-medium text-sm">Dos fotos recientes</span>
                              <Badge variant="default" className="bg-green-100 text-green-800 self-start">
                                Entregado
                              </Badge>
                            </div>
                          </div>

                          {/* Documento 4 - Examen Médico */}
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Examen Médico:
                              </span>
                              <span className="font-medium text-sm">Certificado médico</span>
                              <Badge variant="outline" className="self-start">
                                Pendiente
                              </Badge>
                            </div>
                          </div>

                          {/* Documento 5 - Formulario de Procedencia */}
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Formulario de Procedencia:
                              </span>
                              <span className="font-medium text-sm">Institución anterior</span>
                              <Badge variant="outline" className="self-start">
                                Pendiente
                              </Badge>
                            </div>
                          </div>

                          {/* Documento 6 - Certificado de Notas */}
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Certificado de Notas:
                              </span>
                              <span className="font-medium text-sm">Último año cursado</span>
                              <Badge variant="default" className="bg-green-100 text-green-800 self-start">
                                Entregado
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estado de los Documentos */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-green-500">📊</span>
                          Estado de los Documentos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">4</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Documentos</div>
                            <div className="text-xs text-gray-500 mt-1">Entregados</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">2</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Documentos</div>
                            <div className="text-xs text-gray-500 mt-1">Pendientes</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">67%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Completado</div>
                            <div className="text-xs text-gray-500 mt-1">Del proceso</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">0</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Rechazados</div>
                            <div className="text-xs text-gray-500 mt-1">Ninguno</div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones Adicionales */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-green-500">⚙️</span>
                          Acciones Adicionales
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Descargar Lista
                          </Button>
                          <Button variant="secondary" size="sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Validar Documentos
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "pagos" && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-blue-500">💳</span>
                        Estado de Pago
                      </h3>

                      {/* Resumen de Pagos */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-blue-500">🎯</span>
                          Resumen General de Pagos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$500.000</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total a Pagar</div>
                            <div className="text-xs text-gray-500 mt-1">COP</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">$500.000</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Pagado</div>
                            <div className="text-xs text-gray-500 mt-1">COP</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">0</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Pendiente</div>
                            <div className="text-xs text-gray-500 mt-1">COP</div>
                          </div>
                        </div>

                        {/* Barra de progreso general */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full flex items-center justify-end pr-2"
                            style={{ width: "100%" }}
                          >
                            <span className="text-xs text-white font-medium">100%</span>
                          </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                          Pago completado - Estudiante al día con sus obligaciones
                        </p>
                      </div>

                      {/* Información de Pagos */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-purple-500">📅</span>
                          Información de Pagos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Concepto:</span>
                              <span className="font-medium text-sm">Inscripción</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Fecha:</span>
                              <span className="font-medium text-sm">15/01/2024</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Método:</span>
                              <span className="font-medium text-sm">Transferencia</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Referencia:</span>
                              <span className="font-medium text-sm">1234567890</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones Adicionales */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-green-500">⚙️</span>
                          Acciones Adicionales
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Descargar Recibo
                          </Button>
                          <Button variant="secondary" size="sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Validar Pago
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer del Modal - Opcional */}
              {/* <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <Button onClick={() => setShowInfoModal(false)}>Cerrar</Button>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contacto */}
      {showContactModal && selectedStudentInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex flex-col">
              {/* Header del Modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contactar a {selectedStudentInfo.name}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowContactModal(false)} className="h-8 w-8 p-0">
                  ✕
                </Button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Selecciona el método de contacto:</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Phone className="h-4 w-4" />
                      Llamar al acudiente ({selectedStudentInfo.guardian})
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Enviar mensaje al acudiente
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Phone className="h-4 w-4" />
                      Llamar al estudiante
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Información de contacto:</p>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Acudiente:</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedStudentInfo.guardian}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Teléfono:</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudentInfo.phone}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Email:</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudentInfo.email}</div>
                  </div>
                </div>
              </div>

              {/* Footer del Modal */}
              <div className="flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="ghost" onClick={() => setShowContactModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
