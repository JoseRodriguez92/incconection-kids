"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Filter,
  Download,
  FileText,
  Mail,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  AlertCircle,
  FileSpreadsheet,
  Lock,
} from "lucide-react"

interface GradeAuditRecord {
  id: string
  course: string
  subject: string
  teacher: string
  evaluationType: "Actividad" | "Examen"
  gradesLoaded: number
  totalStudents: number
  average: number | null
  lastModified: string | null
  status: "Completo" | "Incompleto" | "Sin notas"
  comment?: string
}

const mockGradeAudit: GradeAuditRecord[] = [
  {
    id: "1",
    course: "10A",
    subject: "Inglés",
    teacher: "Carolina Díaz",
    evaluationType: "Actividad",
    gradesLoaded: 25,
    totalStudents: 25,
    average: 3.9,
    lastModified: "2025-06-04",
    status: "Completo",
    comment: "Todas las notas registradas correctamente",
  },
  {
    id: "2",
    course: "10B",
    subject: "Inglés",
    teacher: "Andrés Martínez",
    evaluationType: "Examen",
    gradesLoaded: 8,
    totalStudents: 27,
    average: null,
    lastModified: "2025-06-01",
    status: "Incompleto",
  },
  {
    id: "3",
    course: "11A",
    subject: "Química",
    teacher: "—",
    evaluationType: "Actividad",
    gradesLoaded: 0,
    totalStudents: 23,
    average: null,
    lastModified: null,
    status: "Sin notas",
  },
  {
    id: "4",
    course: "9C",
    subject: "Matemáticas",
    teacher: "Luis Rodríguez",
    evaluationType: "Examen",
    gradesLoaded: 22,
    totalStudents: 22,
    average: 2.8,
    lastModified: "2025-06-03",
    status: "Completo",
    comment: "Promedio bajo, requiere seguimiento",
  },
  {
    id: "5",
    course: "11B",
    subject: "Física",
    teacher: "María González",
    evaluationType: "Actividad",
    gradesLoaded: 15,
    totalStudents: 24,
    average: 4.2,
    lastModified: "2025-06-02",
    status: "Incompleto",
  },
]

const courses = ["9A", "9B", "9C", "10A", "10B", "10C", "11A", "11B", "11C"]
const subjects = ["Inglés", "Matemáticas", "Ciencias", "Historia", "Español", "Educación Física", "Química", "Física"]
const teachers = ["Carolina Díaz", "Andrés Martínez", "Luis Rodríguez", "María González", "Pedro López"]
const periods = ["Primer Período", "Segundo Período", "Tercer Período", "Cuarto Período"]

export function GradesRegistrationContent() {
  const [filters, setFilters] = useState({
    period: "Primer Período",
    course: "all",
    subject: "all",
    teacher: "all",
    evaluationType: "all",
    status: "all",
  })

  const [selectedRecord, setSelectedRecord] = useState<GradeAuditRecord | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isClosePeriodModalOpen, setIsClosePeriodModalOpen] = useState(false)

  // Filtrar datos según los filtros aplicados
  const filteredRecords = mockGradeAudit.filter((record) => {
    return (
      (filters.course === "all" || record.course === filters.course) &&
      (filters.subject === "all" || record.subject === filters.subject) &&
      (filters.teacher === "all" || record.teacher === filters.teacher) &&
      (filters.evaluationType === "all" || record.evaluationType === filters.evaluationType) &&
      (filters.status === "all" || record.status === filters.status)
    )
  })

  // Calcular KPIs
  const totalSubjects = filteredRecords.length
  const completedSubjects = filteredRecords.filter((r) => r.status === "Completo").length
  const completionPercentage = totalSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : 0

  const teachersWithPending = new Set(
    filteredRecords
      .filter((r) => r.status === "Incompleto" || r.status === "Sin notas")
      .map((r) => r.teacher)
      .filter((t) => t !== "—"),
  ).size

  const lowAverageSubjects = filteredRecords.filter((r) => r.average !== null && r.average < 3.0).length

  const lastGradeDate = filteredRecords
    .filter((r) => r.lastModified)
    .sort((a, b) => new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime())[0]?.lastModified

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Incompleto":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Sin notas":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completo":
        return <CheckCircle className="h-4 w-4" />
      case "Incompleto":
        return <Clock className="h-4 w-4" />
      case "Sin notas":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getPercentage = (loaded: number, total: number) => {
    return total > 0 ? Math.round((loaded / total) * 100) : 0
  }

  const clearFilters = () => {
    setFilters({
      period: "Primer Período",
      course: "all",
      subject: "all",
      teacher: "all",
      evaluationType: "all",
      status: "all",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Panel de Auditoría de Notas</h2>
          <p className="text-muted-foreground">
            Visualización y seguimiento del estado de calificaciones cargadas por docentes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsReminderModalOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Enviar Recordatorio
          </Button>
          <Button size="sm" onClick={() => setIsClosePeriodModalOpen(true)}>
            <Lock className="mr-2 h-4 w-4" />
            Cerrar Período
          </Button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaturas Completas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {completedSubjects} de {totalSubjects} asignaturas
            </p>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docentes con Pendientes</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{teachersWithPending}</div>
            <p className="text-xs text-muted-foreground">Docentes con notas pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Bajo</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowAverageSubjects}</div>
            <p className="text-xs text-muted-foreground">Asignaturas con promedio &lt; 3.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {lastGradeDate
                ? new Date(lastGradeDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Fecha de última nota registrada</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {teachersWithPending > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Hay {teachersWithPending} docente{teachersWithPending > 1 ? "s" : ""} con notas pendientes por cargar.
            Considera enviar recordatorios automáticos.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Auditoría
          </CardTitle>
          <CardDescription>Filtra los datos para análisis específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="period" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período Académico
              </Label>
              <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Curso / Grupo
              </Label>
              <Select value={filters.course} onValueChange={(value) => setFilters({ ...filters, course: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los cursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cursos</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Asignatura
              </Label>
              <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las asignaturas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las asignaturas</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Docente
              </Label>
              <Select value={filters.teacher} onValueChange={(value) => setFilters({ ...filters, teacher: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los docentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los docentes</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher} value={teacher}>
                      {teacher}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evaluationType">Tipo de Evaluación</Label>
              <Select
                value={filters.evaluationType}
                onValueChange={(value) => setFilters({ ...filters, evaluationType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Actividad">Actividad</SelectItem>
                  <SelectItem value="Examen">Examen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Completo">Completo</SelectItem>
                  <SelectItem value="Incompleto">Incompleto</SelectItem>
                  <SelectItem value="Sin notas">Sin notas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredRecords.length} registro{filteredRecords.length !== 1 ? "s" : ""}
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Calificaciones por Asignatura</CardTitle>
          <CardDescription>Tabla dinámica con el estado de carga de notas por docente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Docente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">% Notas Cargadas</TableHead>
                  <TableHead className="text-center">Promedio</TableHead>
                  <TableHead>Última Modificación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge variant="outline" className="font-semibold">
                        {record.course}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{record.subject}</TableCell>
                    <TableCell>
                      {record.teacher !== "—" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {record.teacher
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span>{record.teacher}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.evaluationType === "Examen" ? "default" : "secondary"}>
                        {record.evaluationType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-semibold">
                            {getPercentage(record.gradesLoaded, record.totalStudents)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({record.gradesLoaded}/{record.totalStudents})
                          </span>
                        </div>
                        <Progress
                          value={getPercentage(record.gradesLoaded, record.totalStudents)}
                          className="h-2 w-20 mx-auto"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {record.average !== null ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="outline"
                                className={`font-bold ${
                                  record.average >= 4.0
                                    ? "text-green-600 border-green-600"
                                    : record.average >= 3.0
                                      ? "text-yellow-600 border-yellow-600"
                                      : "text-red-600 border-red-600"
                                }`}
                              >
                                {record.average.toFixed(1)}
                              </Badge>
                            </TooltipTrigger>
                            {record.comment && (
                              <TooltipContent>
                                <p>{record.comment}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.lastModified ? (
                        <span className="text-sm">
                          {new Date(record.lastModified).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(record.status)}
                          {record.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRecord(record)
                              setIsDetailModalOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalle por estudiante
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRecord(record)
                              setIsReminderModalOpen(true)
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar recordatorio
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar por curso
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron registros con los filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Ver Detalle por Estudiante */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Notas por Estudiante</DialogTitle>
            <DialogDescription>
              {selectedRecord && `${selectedRecord.course} - ${selectedRecord.subject} - ${selectedRecord.teacher}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Vista detallada de notas por estudiante en desarrollo</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Enviar Recordatorio */}
      <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Recordatorio</DialogTitle>
            <DialogDescription>Envía un recordatorio automático al docente sobre notas pendientes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reminderSubject">Asunto</Label>
              <Input id="reminderSubject" value="Recordatorio: Notas pendientes por cargar" readOnly />
            </div>
            <div>
              <Label htmlFor="reminderMessage">Mensaje</Label>
              <textarea
                id="reminderMessage"
                className="w-full p-3 border rounded-md resize-none"
                rows={4}
                defaultValue={`Estimado/a docente,

Le recordamos que tiene notas pendientes por cargar en el sistema académico.

Por favor, complete el registro de calificaciones a la brevedad posible.

Saludos cordiales,
Administración Académica`}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsReminderModalOpen(false)}>
                Cancelar
              </Button>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Recordatorio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Cerrar Período */}
      <Dialog open={isClosePeriodModalOpen} onOpenChange={setIsClosePeriodModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cerrar Período Académico</DialogTitle>
            <DialogDescription>
              Esta acción marcará el período como cerrado y no permitirá más modificaciones
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Advertencia:</strong> Esta acción es irreversible. Una vez cerrado el período, no se podrán
                realizar más cambios en las calificaciones.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estado actual del período:</p>
              <ul className="text-sm space-y-1">
                <li>• Asignaturas completas: {completionPercentage}%</li>
                <li>• Docentes con pendientes: {teachersWithPending}</li>
                <li>• Asignaturas con promedio bajo: {lowAverageSubjects}</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsClosePeriodModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive">
                <Lock className="mr-2 h-4 w-4" />
                Cerrar Período
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
