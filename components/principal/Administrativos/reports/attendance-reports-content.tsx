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
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Download,
  Filter,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

// Datos simulados para reportes de asistencia
const attendanceData = {
  overview: {
    totalStudents: 1250,
    presentToday: 1180,
    absentToday: 70,
    attendanceRate: 94.4,
  },
  dailyAttendance: [
    { date: "2024-01-15", present: 1180, absent: 70, rate: 94.4 },
    { date: "2024-01-16", present: 1195, absent: 55, rate: 95.6 },
    { date: "2024-01-17", present: 1165, absent: 85, rate: 93.2 },
    { date: "2024-01-18", present: 1205, absent: 45, rate: 96.4 },
    { date: "2024-01-19", present: 1175, absent: 75, rate: 94.0 },
  ],
  attendanceByGrade: [
    { grade: "6°", students: 180, present: 172, absent: 8, rate: 95.6 },
    { grade: "7°", students: 175, present: 168, absent: 7, rate: 96.0 },
    { grade: "8°", students: 170, present: 158, absent: 12, rate: 92.9 },
    { grade: "9°", students: 165, present: 155, absent: 10, rate: 93.9 },
    { grade: "10°", students: 160, present: 152, absent: 8, rate: 95.0 },
    { grade: "11°", students: 155, present: 148, absent: 7, rate: 95.5 },
  ],
  frequentAbsent: [
    { name: "Pedro Sánchez", grade: "8°", absences: 15, rate: 75.0, status: "Crítico" },
    { name: "Sofia Torres", grade: "7°", absences: 12, rate: 80.0, status: "Alto" },
    { name: "Diego Morales", grade: "9°", absences: 10, rate: 83.3, status: "Alto" },
    { name: "Camila Ruiz", grade: "6°", absences: 8, rate: 86.7, status: "Medio" },
    { name: "Andrés López", grade: "10°", absences: 7, rate: 88.3, status: "Medio" },
  ],
  perfectAttendance: [
    { name: "Ana García", grade: "11°", days: 60, rate: 100 },
    { name: "Carlos López", grade: "10°", days: 60, rate: 100 },
    { name: "María Rodríguez", grade: "11°", days: 59, rate: 98.3 },
    { name: "Juan Pérez", grade: "9°", days: 58, rate: 96.7 },
    { name: "Laura Martínez", grade: "10°", days: 57, rate: 95.0 },
  ],
  attendanceBySubject: [
    { subject: "Matemáticas", present: 1150, absent: 100, rate: 92.0 },
    { subject: "Español", present: 1180, absent: 70, rate: 94.4 },
    { subject: "Ciencias", present: 1165, absent: 85, rate: 93.2 },
    { subject: "Historia", present: 1175, absent: 75, rate: 94.0 },
    { subject: "Inglés", present: 1190, absent: 60, rate: 95.2 },
    { subject: "Educación Física", present: 1200, absent: 50, rate: 96.0 },
  ],
}

export function AttendanceReportsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return "text-green-600 bg-green-50"
    if (rate >= 90) return "text-blue-600 bg-blue-50"
    if (rate >= 85) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Crítico":
        return "bg-red-100 text-red-800"
      case "Alto":
        return "bg-orange-100 text-orange-800"
      case "Medio":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Asistencia</h1>
          <p className="text-muted-foreground">Control y análisis detallado de la asistencia estudiantil</p>
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
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="current-week">Esta Semana</SelectItem>
                  <SelectItem value="current-month">Este Mes</SelectItem>
                  <SelectItem value="current-semester">Este Semestre</SelectItem>
                  <SelectItem value="current-year">Este Año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grado</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los grados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  <SelectItem value="6">6° Grado</SelectItem>
                  <SelectItem value="7">7° Grado</SelectItem>
                  <SelectItem value="8">8° Grado</SelectItem>
                  <SelectItem value="9">9° Grado</SelectItem>
                  <SelectItem value="10">10° Grado</SelectItem>
                  <SelectItem value="11">11° Grado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
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
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.overview.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estudiantes matriculados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes Hoy</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceData.overview.presentToday.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Estudiantes en clases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausentes Hoy</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{attendanceData.overview.absentToday}</div>
            <p className="text-xs text-muted-foreground">Estudiantes ausentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceData.overview.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Promedio del mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Reportes */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="daily">Diario</TabsTrigger>
          <TabsTrigger value="grades">Por Grados</TabsTrigger>
          <TabsTrigger value="subjects">Por Materias</TabsTrigger>
          <TabsTrigger value="absent">Ausentismo</TabsTrigger>
          <TabsTrigger value="perfect">Asistencia Perfecta</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asistencia Diaria</CardTitle>
              <CardDescription>Registro de asistencia de los últimos días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.dailyAttendance.map((day, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{day.date}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Presentes</div>
                      <div className="font-medium text-green-600">{day.present}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Ausentes</div>
                      <div className="font-medium text-red-600">{day.absent}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Tasa</div>
                      <Badge className={getAttendanceColor(day.rate)}>{day.rate}%</Badge>
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
              <CardTitle>Asistencia por Grados</CardTitle>
              <CardDescription>Comparativo de asistencia por nivel educativo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.attendanceByGrade.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Grado {grade.grade}</h3>
                        <p className="text-sm text-muted-foreground">{grade.students} estudiantes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Presentes</div>
                        <div className="font-medium text-green-600">{grade.present}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Ausentes</div>
                        <div className="font-medium text-red-600">{grade.absent}</div>
                      </div>
                      <Badge className={getAttendanceColor(grade.rate)}>{grade.rate}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asistencia por Materias</CardTitle>
              <CardDescription>Análisis de asistencia por asignatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.attendanceBySubject.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{subject.subject}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Presentes</div>
                        <div className="font-medium text-green-600">{subject.present}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Ausentes</div>
                        <div className="font-medium text-red-600">{subject.absent}</div>
                      </div>
                      <Badge className={getAttendanceColor(subject.rate)}>{subject.rate}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="absent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estudiantes con Ausentismo Frecuente</CardTitle>
              <CardDescription>Estudiantes que requieren seguimiento por inasistencias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.frequentAbsent.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {student.grade} - {student.absences} ausencias
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Asistencia: {student.rate}%</div>
                      </div>
                      <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estudiantes con Asistencia Perfecta</CardTitle>
              <CardDescription>Estudiantes destacados por su excelente asistencia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.perfectAttendance.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {student.grade} - {student.days} días asistidos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Asistencia: {student.rate}%</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Excelente</Badge>
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
