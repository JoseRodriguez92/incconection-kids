"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ClipboardList,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Target,
  Users,
  FileText,
} from "lucide-react"

// Datos simulados para reportes de actividades/tareas
const activitiesData = {
  overview: {
    totalActivities: 156,
    completedActivities: 132,
    pendingActivities: 24,
    completionRate: 84.6,
  },
  activitiesBySubject: [
    { subject: "Matemáticas", total: 28, completed: 24, pending: 4, rate: 85.7 },
    { subject: "Español", total: 26, completed: 23, pending: 3, rate: 88.5 },
    { subject: "Ciencias", total: 24, completed: 19, pending: 5, rate: 79.2 },
    { subject: "Historia", total: 22, completed: 18, pending: 4, rate: 81.8 },
    { subject: "Inglés", total: 25, completed: 22, pending: 3, rate: 88.0 },
    { subject: "Educación Física", total: 31, completed: 26, pending: 5, rate: 83.9 },
  ],
  activitiesByGrade: [
    { grade: "6°", total: 25, completed: 22, pending: 3, rate: 88.0 },
    { grade: "7°", total: 27, completed: 23, pending: 4, rate: 85.2 },
    { grade: "8°", total: 26, completed: 21, pending: 5, rate: 80.8 },
    { grade: "9°", total: 28, completed: 24, pending: 4, rate: 85.7 },
    { grade: "10°", total: 25, completed: 21, pending: 4, rate: 84.0 },
    { grade: "11°", total: 25, completed: 21, pending: 4, rate: 84.0 },
  ],
  topPerformers: [
    { name: "Ana García", grade: "11°", completed: 28, total: 30, rate: 93.3 },
    { name: "Carlos López", grade: "10°", completed: 27, total: 29, rate: 93.1 },
    { name: "María Rodríguez", grade: "11°", completed: 26, total: 28, rate: 92.9 },
    { name: "Juan Pérez", grade: "9°", completed: 25, total: 27, rate: 92.6 },
    { name: "Laura Martínez", grade: "10°", completed: 24, total: 26, rate: 92.3 },
  ],
  lowPerformers: [
    { name: "Pedro Sánchez", grade: "8°", completed: 12, total: 26, rate: 46.2, status: "Crítico" },
    { name: "Sofia Torres", grade: "7°", completed: 15, total: 27, rate: 55.6, status: "Bajo" },
    { name: "Diego Morales", grade: "9°", completed: 18, total: 28, rate: 64.3, status: "Bajo" },
    { name: "Camila Ruiz", grade: "6°", completed: 16, total: 25, rate: 64.0, status: "Bajo" },
  ],
  recentActivities: [
    {
      title: "Ensayo sobre la Independencia",
      subject: "Historia",
      grade: "9°",
      dueDate: "2024-01-20",
      submitted: 28,
      total: 32,
      status: "Activa",
    },
    {
      title: "Problemas de Álgebra",
      subject: "Matemáticas",
      grade: "8°",
      dueDate: "2024-01-18",
      submitted: 30,
      total: 30,
      status: "Completada",
    },
    {
      title: "Experimento de Química",
      subject: "Ciencias",
      grade: "10°",
      dueDate: "2024-01-22",
      submitted: 15,
      total: 28,
      status: "Activa",
    },
    {
      title: "Análisis Literario",
      subject: "Español",
      grade: "11°",
      dueDate: "2024-01-19",
      submitted: 25,
      total: 26,
      status: "Activa",
    },
  ],
  weeklyProgress: [
    { week: "Semana 1", assigned: 32, completed: 28, rate: 87.5 },
    { week: "Semana 2", assigned: 35, completed: 31, rate: 88.6 },
    { week: "Semana 3", assigned: 38, completed: 32, rate: 84.2 },
    { week: "Semana 4", assigned: 41, completed: 35, rate: 85.4 },
  ],
}

export function ActivitiesReportsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-50"
    if (rate >= 80) return "text-blue-600 bg-blue-50"
    if (rate >= 70) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completada":
        return "bg-green-100 text-green-800"
      case "Activa":
        return "bg-blue-100 text-blue-800"
      case "Vencida":
        return "bg-red-100 text-red-800"
      case "Crítico":
        return "bg-red-100 text-red-800"
      case "Bajo":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Actividades y Tareas</h1>
          <p className="text-muted-foreground">Seguimiento y análisis del cumplimiento de actividades académicas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-week">Esta Semana</SelectItem>
                  <SelectItem value="current-month">Este Mes</SelectItem>
                  <SelectItem value="current-semester">Este Semestre</SelectItem>
                  <SelectItem value="current-year">Este Año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Materia</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las materias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las materias</SelectItem>
                  <SelectItem value="matematicas">Matemáticas</SelectItem>
                  <SelectItem value="espanol">Español</SelectItem>
                  <SelectItem value="ciencias">Ciencias</SelectItem>
                  <SelectItem value="historia">Historia</SelectItem>
                  <SelectItem value="ingles">Inglés</SelectItem>
                  <SelectItem value="educacion-fisica">Educación Física</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar actividad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <ClipboardList className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actividades</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activitiesData.overview.totalActivities}</div>
            <p className="text-xs text-muted-foreground">Actividades asignadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activitiesData.overview.completedActivities}</div>
            <p className="text-xs text-muted-foreground">Tareas entregadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activitiesData.overview.pendingActivities}</div>
            <p className="text-xs text-muted-foreground">Por entregar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cumplimiento</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activitiesData.overview.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Promedio general</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Reportes */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="subjects">Por Materias</TabsTrigger>
          <TabsTrigger value="grades">Por Grados</TabsTrigger>
          <TabsTrigger value="recent">Actividades Recientes</TabsTrigger>
          <TabsTrigger value="top">Mejores Estudiantes</TabsTrigger>
          <TabsTrigger value="low">Bajo Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cumplimiento por Materias</CardTitle>
              <CardDescription>Análisis del cumplimiento de tareas por asignatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesData.activitiesBySubject.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{subject.subject}</h3>
                        <p className="text-sm text-muted-foreground">{subject.total} actividades asignadas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Completadas</div>
                        <div className="font-medium text-green-600">{subject.completed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Pendientes</div>
                        <div className="font-medium text-orange-600">{subject.pending}</div>
                      </div>
                      <Badge className={getPerformanceColor(subject.rate)}>{subject.rate}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cumplimiento por Grados</CardTitle>
              <CardDescription>Comparativo del cumplimiento de tareas por nivel educativo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesData.activitiesByGrade.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Grado {grade.grade}</h3>
                        <p className="text-sm text-muted-foreground">{grade.total} actividades asignadas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Completadas</div>
                        <div className="font-medium text-green-600">{grade.completed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Pendientes</div>
                        <div className="font-medium text-orange-600">{grade.pending}</div>
                      </div>
                      <Badge className={getPerformanceColor(grade.rate)}>{grade.rate}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
              <CardDescription>Estado actual de las actividades más recientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.subject} - {activity.grade} - Vence: {activity.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Entregadas</div>
                        <div className="font-medium">
                          {activity.submitted}/{activity.total}
                        </div>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estudiantes con Mejor Cumplimiento</CardTitle>
              <CardDescription>Estudiantes destacados por su responsabilidad académica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesData.topPerformers.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <span className="text-sm font-medium text-green-800">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {student.grade} - {student.completed}/{student.total} tareas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Cumplimiento: {student.rate}%</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Excelente</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estudiantes con Bajo Cumplimiento</CardTitle>
              <CardDescription>Estudiantes que requieren seguimiento académico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesData.lowPerformers.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {student.grade} - {student.completed}/{student.total} tareas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Cumplimiento: {student.rate}%</div>
                      </div>
                      <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
