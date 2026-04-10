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
  BarChart3,
  Users,
  BookOpen,
  Award,
  Download,
  Filter,
  Search,
  GraduationCap,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

// Datos simulados para reportes académicos
const academicData = {
  overview: {
    totalStudents: 1250,
    averageGrade: 4.2,
    approvalRate: 87.5,
    excellentStudents: 156,
  },
  gradesBySubject: [
    { subject: "Matemáticas", average: 4.1, students: 45, approval: 85 },
    { subject: "Español", average: 4.3, students: 45, approval: 90 },
    { subject: "Ciencias", average: 3.9, students: 45, approval: 82 },
    { subject: "Historia", average: 4.0, students: 45, approval: 88 },
    { subject: "Inglés", average: 4.2, students: 45, approval: 89 },
    { subject: "Educación Física", average: 4.5, students: 45, approval: 95 },
  ],
  performanceByGrade: [
    { grade: "6°", students: 180, average: 4.0, approval: 85 },
    { grade: "7°", students: 175, average: 4.1, approval: 87 },
    { grade: "8°", students: 170, average: 4.2, approval: 88 },
    { grade: "9°", students: 165, average: 4.1, approval: 86 },
    { grade: "10°", students: 160, average: 4.3, approval: 90 },
    { grade: "11°", students: 155, average: 4.4, approval: 92 },
  ],
  topStudents: [
    { name: "Ana García", grade: "11°", average: 4.8, subjects: 8 },
    { name: "Carlos López", grade: "10°", average: 4.7, subjects: 8 },
    { name: "María Rodríguez", grade: "11°", average: 4.6, subjects: 8 },
    { name: "Juan Pérez", grade: "9°", average: 4.5, subjects: 7 },
    { name: "Laura Martínez", grade: "10°", average: 4.5, subjects: 8 },
  ],
  riskStudents: [
    { name: "Pedro Sánchez", grade: "8°", average: 2.1, subjects: 5, risk: "Alto" },
    { name: "Sofia Torres", grade: "7°", average: 2.3, subjects: 4, risk: "Alto" },
    { name: "Diego Morales", grade: "9°", average: 2.8, subjects: 6, risk: "Medio" },
    { name: "Camila Ruiz", grade: "6°", average: 2.9, subjects: 3, risk: "Medio" },
  ],
}

export function AcademicReportsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-1")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getPerformanceColor = (average: number) => {
    if (average >= 4.5) return "text-green-600 bg-green-50"
    if (average >= 4.0) return "text-blue-600 bg-blue-50"
    if (average >= 3.5) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Alto":
        return "bg-red-100 text-red-800"
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
          <h1 className="text-3xl font-bold tracking-tight">Reportes Académicos</h1>
          <p className="text-muted-foreground">Análisis detallado del rendimiento académico institucional</p>
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
              <Label htmlFor="period">Período Académico</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-1">2024 - Primer Semestre</SelectItem>
                  <SelectItem value="2024-2">2024 - Segundo Semestre</SelectItem>
                  <SelectItem value="2023-2">2023 - Segundo Semestre</SelectItem>
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
                <BarChart3 className="mr-2 h-4 w-4" />
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
            <div className="text-2xl font-bold">{academicData.overview.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5.2% respecto al período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicData.overview.averageGrade}</div>
            <p className="text-xs text-muted-foreground">+0.3 puntos vs período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicData.overview.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">+2.1% respecto al período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Excelentes</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicData.overview.excellentStudents}</div>
            <p className="text-xs text-muted-foreground">Promedio ≥ 4.5</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Reportes */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subjects">Por Materias</TabsTrigger>
          <TabsTrigger value="grades">Por Grados</TabsTrigger>
          <TabsTrigger value="top">Mejores Estudiantes</TabsTrigger>
          <TabsTrigger value="risk">Estudiantes en Riesgo</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Materias</CardTitle>
              <CardDescription>Análisis del desempeño académico por asignatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {academicData.gradesBySubject.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{subject.subject}</h3>
                        <p className="text-sm text-muted-foreground">{subject.students} estudiantes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Promedio: {subject.average}</div>
                        <div className="text-sm text-muted-foreground">Aprobación: {subject.approval}%</div>
                      </div>
                      <Badge className={getPerformanceColor(subject.average)}>
                        {subject.average >= 4.5
                          ? "Excelente"
                          : subject.average >= 4.0
                            ? "Bueno"
                            : subject.average >= 3.5
                              ? "Regular"
                              : "Bajo"}
                      </Badge>
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
              <CardTitle>Rendimiento por Grados</CardTitle>
              <CardDescription>Comparativo del desempeño académico por nivel educativo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {academicData.performanceByGrade.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Grado {grade.grade}</h3>
                        <p className="text-sm text-muted-foreground">{grade.students} estudiantes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Promedio: {grade.average}</div>
                        <div className="text-sm text-muted-foreground">Aprobación: {grade.approval}%</div>
                      </div>
                      <Badge className={getPerformanceColor(grade.average)}>
                        {grade.average >= 4.5
                          ? "Excelente"
                          : grade.average >= 4.0
                            ? "Bueno"
                            : grade.average >= 3.5
                              ? "Regular"
                              : "Bajo"}
                      </Badge>
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
              <CardTitle>Mejores Estudiantes</CardTitle>
              <CardDescription>Estudiantes con mejor rendimiento académico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {academicData.topStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <span className="text-sm font-medium text-green-800">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {student.grade} - {student.subjects} materias
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Promedio: {student.average}</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Excelente</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estudiantes en Riesgo Académico</CardTitle>
              <CardDescription>Estudiantes que requieren atención especial</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {academicData.riskStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {student.grade} - {student.subjects} materias reprobadas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Promedio: {student.average}</div>
                      </div>
                      <Badge className={getRiskColor(student.risk)}>Riesgo {student.risk}</Badge>
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
