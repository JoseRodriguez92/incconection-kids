"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { UserPlus, Upload, Search, CheckCircle, Clock, XCircle, FileText, Users, Calendar } from "lucide-react"

interface Enrollment {
  id: string
  studentId: string
  studentName: string
  grade: string
  courses: string[]
  status: "completed" | "pending" | "rejected"
  enrollmentDate: string
  paymentStatus: "paid" | "pending" | "overdue"
  period: string
  totalCredits: number
}

interface Course {
  id: string
  code: string
  name: string
  credits: number
  capacity: number
  enrolled: number
  grade: string
}

const mockCourses: Course[] = [
  { id: "C001", code: "MAT-10A", name: "Matemáticas Básicas", credits: 4, capacity: 30, enrolled: 28, grade: "10°" },
  { id: "C002", code: "CIE-10A", name: "Ciencias Naturales", credits: 3, capacity: 25, enrolled: 23, grade: "10°" },
  { id: "C003", code: "ESP-10A", name: "Español", credits: 3, capacity: 35, enrolled: 32, grade: "10°" },
  { id: "C004", code: "ING-10A", name: "Inglés", credits: 2, capacity: 30, enrolled: 25, grade: "10°" },
  { id: "C005", code: "HIS-11A", name: "Historia", credits: 3, capacity: 28, enrolled: 26, grade: "11°" },
  { id: "C006", code: "FIS-11A", name: "Física", credits: 4, capacity: 25, enrolled: 22, grade: "11°" },
]

const mockEnrollments: Enrollment[] = [
  {
    id: "E001",
    studentId: "EST001",
    studentName: "Ana García López",
    grade: "10°",
    courses: ["C001", "C002", "C003", "C004"],
    status: "completed",
    enrollmentDate: "2024-01-15",
    paymentStatus: "paid",
    period: "2024-1",
    totalCredits: 12,
  },
  {
    id: "E002",
    studentId: "EST002",
    studentName: "Carlos Rodríguez",
    grade: "10°",
    courses: ["C001", "C002", "C003"],
    status: "pending",
    enrollmentDate: "2024-01-16",
    paymentStatus: "pending",
    period: "2024-1",
    totalCredits: 10,
  },
  {
    id: "E003",
    studentId: "EST003",
    studentName: "María Fernández",
    grade: "11°",
    courses: ["C005", "C006"],
    status: "completed",
    enrollmentDate: "2024-01-14",
    paymentStatus: "paid",
    period: "2024-1",
    totalCredits: 7,
  },
]

const mockStudents = [
  { id: "EST001", name: "Ana García López", grade: "10°", section: "A" },
  { id: "EST002", name: "Carlos Rodríguez", grade: "10°", section: "A" },
  { id: "EST003", name: "María Fernández", grade: "11°", section: "A" },
  { id: "EST004", name: "Juan Martínez", grade: "11°", section: "B" },
  { id: "EST005", name: "Laura Sánchez", grade: "10°", section: "B" },
]

export function EnrollmentContent() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("Todos los grados")
  const [selectedStatus, setSelectedStatus] = useState("Todos los estados")
  const [selectedPeriod, setSelectedPeriod] = useState("2024-1")
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [newEnrollment, setNewEnrollment] = useState({
    studentId: "",
    selectedCourses: [] as string[],
    period: "2024-1",
  })

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGrade === "Todos los grados" || enrollment.grade === selectedGrade) &&
      (selectedStatus === "Todos los estados" || enrollment.status === selectedStatus) &&
      enrollment.period === selectedPeriod,
  )

  const getEnrollmentStats = () => {
    const total = enrollments.filter((e) => e.period === selectedPeriod).length
    const completed = enrollments.filter((e) => e.period === selectedPeriod && e.status === "completed").length
    const pending = enrollments.filter((e) => e.period === selectedPeriod && e.status === "pending").length
    const rejected = enrollments.filter((e) => e.period === selectedPeriod && e.status === "rejected").length

    return { total, completed, pending, rejected }
  }

  const stats = getEnrollmentStats()

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    if (checked) {
      setNewEnrollment({
        ...newEnrollment,
        selectedCourses: [...newEnrollment.selectedCourses, courseId],
      })
    } else {
      setNewEnrollment({
        ...newEnrollment,
        selectedCourses: newEnrollment.selectedCourses.filter((id) => id !== courseId),
      })
    }
  }

  const handleCreateEnrollment = () => {
    if (newEnrollment.studentId && newEnrollment.selectedCourses.length > 0) {
      const student = mockStudents.find((s) => s.id === newEnrollment.studentId)
      const totalCredits = newEnrollment.selectedCourses.reduce((sum, courseId) => {
        const course = mockCourses.find((c) => c.id === courseId)
        return sum + (course?.credits || 0)
      }, 0)

      const enrollment: Enrollment = {
        id: Date.now().toString(),
        studentId: newEnrollment.studentId,
        studentName: student?.name || "",
        grade: student?.grade || "",
        courses: newEnrollment.selectedCourses,
        status: "pending",
        enrollmentDate: new Date().toISOString().split("T")[0],
        paymentStatus: "pending",
        period: newEnrollment.period,
        totalCredits,
      }

      setEnrollments([...enrollments, enrollment])
      setNewEnrollment({
        studentId: "",
        selectedCourses: [],
        period: "2024-1",
      })
      setIsEnrollDialogOpen(false)
    }
  }

  const updateEnrollmentStatus = (enrollmentId: string, status: "completed" | "pending" | "rejected") => {
    setEnrollments(enrollments.map((e) => (e.id === enrollmentId ? { ...e, status } : e)))
  }

  const getAvailableCoursesForStudent = (studentGrade: string) => {
    return mockCourses.filter((course) => course.grade === studentGrade)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sistema de Matrículas</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Matrícula Masiva
          </Button>
          <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nueva Matrícula
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Matricular Estudiante</DialogTitle>
                <DialogDescription>Selecciona el estudiante y los cursos para la matrícula</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">Estudiante</Label>
                    <Select
                      value={newEnrollment.studentId}
                      onValueChange={(value) =>
                        setNewEnrollment({ ...newEnrollment, studentId: value, selectedCourses: [] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estudiante" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} - {student.grade}
                            {student.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period">Período Académico</Label>
                    <Select
                      value={newEnrollment.period}
                      onValueChange={(value) => setNewEnrollment({ ...newEnrollment, period: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-1">2024-1</SelectItem>
                        <SelectItem value="2024-2">2024-2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newEnrollment.studentId && (
                  <div className="space-y-4">
                    <Label>Cursos Disponibles</Label>
                    <div className="grid gap-3 max-h-60 overflow-y-auto">
                      {getAvailableCoursesForStudent(
                        mockStudents.find((s) => s.id === newEnrollment.studentId)?.grade || "",
                      ).map((course) => (
                        <div key={course.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={course.id}
                            checked={newEnrollment.selectedCourses.includes(course.id)}
                            onCheckedChange={(checked) => handleCourseSelection(course.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={course.id} className="font-medium cursor-pointer">
                              {course.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {course.code} • {course.credits} créditos • {course.enrolled}/{course.capacity} inscritos
                            </p>
                          </div>
                          <Badge variant={course.enrolled >= course.capacity ? "destructive" : "default"}>
                            {course.enrolled >= course.capacity ? "Lleno" : "Disponible"}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {newEnrollment.selectedCourses.length > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">
                          Total de créditos:{" "}
                          {newEnrollment.selectedCourses.reduce((sum, courseId) => {
                            const course = mockCourses.find((c) => c.id === courseId)
                            return sum + (course?.credits || 0)
                          }, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {newEnrollment.selectedCourses.length} cursos seleccionados
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateEnrollment}
                  disabled={!newEnrollment.studentId || newEnrollment.selectedCourses.length === 0}
                >
                  Matricular
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="matriculas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matriculas">Matrículas</TabsTrigger>
          <TabsTrigger value="progreso">Progreso</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="matriculas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Matrículas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Período {selectedPeriod}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Requieren revisión</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">No aprobadas</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Matrículas</CardTitle>
              <CardDescription>Gestiona las matrículas de estudiantes por período académico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar estudiante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-1">2024-1</SelectItem>
                    <SelectItem value="2024-2">2024-2</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por grado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos los grados">Todos los grados</SelectItem>
                    <SelectItem value="10°">10° Grado</SelectItem>
                    <SelectItem value="11°">11° Grado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos los estados">Todos los estados</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Cursos</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">{enrollment.studentName}</TableCell>
                      <TableCell>{enrollment.grade}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {enrollment.courses.slice(0, 2).map((courseId) => {
                            const course = mockCourses.find((c) => c.id === courseId)
                            return (
                              <Badge key={courseId} variant="outline" className="text-xs">
                                {course?.code}
                              </Badge>
                            )
                          })}
                          {enrollment.courses.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{enrollment.courses.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.totalCredits}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enrollment.status === "completed"
                              ? "default"
                              : enrollment.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {enrollment.status === "completed"
                            ? "Completada"
                            : enrollment.status === "pending"
                              ? "Pendiente"
                              : "Rechazada"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enrollment.paymentStatus === "paid"
                              ? "default"
                              : enrollment.paymentStatus === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {enrollment.paymentStatus === "paid"
                            ? "Pagado"
                            : enrollment.paymentStatus === "pending"
                              ? "Pendiente"
                              : "Vencido"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {enrollment.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateEnrollmentStatus(enrollment.id, "completed")}
                              >
                                Aprobar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateEnrollmentStatus(enrollment.id, "rejected")}
                              >
                                Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progreso" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progreso de Matrículas por Grado</CardTitle>
                <CardDescription>Avance del proceso de matriculación por nivel académico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["10°", "11°"].map((grade) => {
                  const gradeEnrollments = enrollments.filter((e) => e.grade === grade && e.period === selectedPeriod)
                  const completed = gradeEnrollments.filter((e) => e.status === "completed").length
                  const total = gradeEnrollments.length
                  const percentage = total > 0 ? (completed / total) * 100 : 0

                  return (
                    <div key={grade} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{grade} Grado</span>
                        <span className="text-sm text-muted-foreground">
                          {completed}/{total} completadas
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{Math.round(percentage)}% completado</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Pagos</CardTitle>
                <CardDescription>Seguimiento de pagos de matrícula</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["paid", "pending", "overdue"].map((status) => {
                    const statusCount = enrollments.filter(
                      (e) => e.paymentStatus === status && e.period === selectedPeriod,
                    ).length
                    const statusLabel = status === "paid" ? "Pagado" : status === "pending" ? "Pendiente" : "Vencido"
                    const variant = status === "paid" ? "default" : status === "pending" ? "secondary" : "destructive"

                    return (
                      <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{statusLabel}</p>
                          <p className="text-sm text-muted-foreground">Estado de pago</p>
                        </div>
                        <Badge variant={variant}>{statusCount}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reportes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Matrícula</CardTitle>
              <CardDescription>Genera reportes detallados del proceso de matriculación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Reporte General
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Por Estudiante
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Por Período
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
