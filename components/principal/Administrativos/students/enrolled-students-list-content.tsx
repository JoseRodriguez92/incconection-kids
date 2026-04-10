"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Eye, Phone } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface EnrolledStudent {
  id: string
  name: string
  document: string
  course: string
  group: string
  grade: string
  section: string
  guardian: string
  phone: string
  email: string
  enrollmentDate: string
  paymentStatus: "Al día" | "Pendiente" | "Vencido"
  academicStatus: "Activo" | "Inactivo" | "Suspendido"
  attendance: number
  averageGrade: number
  address: string
  birthDate: string
  emergencyContact: string
  emergencyPhone: string
  medicalInfo?: string
  subjects: string[]
  lastPayment: string
  nextPayment: string
  observations: TeacherObservation[]
}

interface TeacherObservation {
  id: string
  teacherName: string
  subject: string
  date: string
  type: "positiva" | "negativa" | "neutral"
  observation: string
  category: "Académico" | "Disciplinario" | "Participación" | "Actitud" | "Asistencia"
}

const mockEnrolledStudents: EnrolledStudent[] = [
  {
    id: "EST001",
    name: "Ana García Pérez",
    document: "1234567890",
    course: "Décimo",
    group: "A",
    grade: "10°",
    section: "A",
    guardian: "Carlos García",
    phone: "300-123-4567",
    email: "ana.garcia@email.com",
    enrollmentDate: "2024-02-15",
    paymentStatus: "Al día",
    academicStatus: "Activo",
    attendance: 95,
    averageGrade: 4.2,
    address: "Calle 123 #45-67, Bogotá",
    birthDate: "2008-05-15",
    emergencyContact: "María García",
    emergencyPhone: "301-987-6543",
    subjects: ["Matemáticas", "Español", "Ciencias", "Inglés", "Sociales"],
    lastPayment: "2024-02-01",
    nextPayment: "2024-03-01",
    observations: [
      {
        id: "OBS001",
        teacherName: "Prof. María Rodríguez",
        subject: "Matemáticas",
        date: "2024-02-20",
        type: "positiva",
        observation:
          "Excelente participación en clase y comprensión de los temas. Siempre dispuesta a ayudar a sus compañeros.",
        category: "Académico",
      },
      {
        id: "OBS002",
        teacherName: "Prof. Carlos López",
        subject: "Español",
        date: "2024-02-18",
        type: "positiva",
        observation: "Destacada en análisis literario. Sus ensayos demuestran pensamiento crítico avanzado.",
        category: "Académico",
      },
      {
        id: "OBS003",
        teacherName: "Prof. Ana Martínez",
        subject: "Ciencias",
        date: "2024-02-15",
        type: "neutral",
        observation: "Buen desempeño general, aunque podría mejorar en la presentación de laboratorios.",
        category: "Académico",
      },
    ],
  },
  {
    id: "EST002",
    name: "Carlos Rodríguez López",
    document: "0987654321",
    course: "Undécimo",
    group: "B",
    grade: "11°",
    section: "B",
    guardian: "María López",
    phone: "301-234-5678",
    email: "carlos.rodriguez@email.com",
    enrollmentDate: "2024-02-10",
    paymentStatus: "Pendiente",
    academicStatus: "Activo",
    attendance: 88,
    averageGrade: 3.8,
    address: "Carrera 45 #12-34, Medellín",
    birthDate: "2007-08-22",
    emergencyContact: "Pedro López",
    emergencyPhone: "302-876-5432",
    subjects: ["Matemáticas", "Física", "Química", "Inglés", "Filosofía"],
    lastPayment: "2024-01-15",
    nextPayment: "2024-02-15",
    observations: [
      {
        id: "OBS004",
        teacherName: "Prof. Roberto Silva",
        subject: "Física",
        date: "2024-02-22",
        type: "negativa",
        observation:
          "Falta de atención en clase y no entrega tareas a tiempo. Necesita mejorar su compromiso académico.",
        category: "Académico",
      },
      {
        id: "OBS005",
        teacherName: "Prof. Laura Gómez",
        subject: "Química",
        date: "2024-02-19",
        type: "neutral",
        observation: "Comprende los conceptos básicos pero debe practicar más los ejercicios complejos.",
        category: "Académico",
      },
      {
        id: "OBS006",
        teacherName: "Prof. Miguel Torres",
        subject: "Matemáticas",
        date: "2024-02-16",
        type: "negativa",
        observation: "Actitud disruptiva durante la clase. Interrumpe constantemente las explicaciones.",
        category: "Disciplinario",
      },
    ],
  },
  {
    id: "EST003",
    name: "María López Martínez",
    document: "1122334455",
    course: "Noveno",
    group: "C",
    grade: "9°",
    section: "C",
    guardian: "Juan López",
    phone: "302-345-6789",
    email: "maria.lopez@email.com",
    enrollmentDate: "2024-02-20",
    paymentStatus: "Al día",
    academicStatus: "Activo",
    attendance: 92,
    averageGrade: 4.5,
    address: "Avenida 80 #23-45, Cali",
    birthDate: "2009-03-10",
    emergencyContact: "Ana Martínez",
    emergencyPhone: "303-765-4321",
    subjects: ["Matemáticas", "Español", "Ciencias", "Inglés", "Educación Física"],
    lastPayment: "2024-02-20",
    nextPayment: "2024-03-20",
    observations: [
      {
        id: "OBS007",
        teacherName: "Prof. Carmen Ruiz",
        subject: "Español",
        date: "2024-02-21",
        type: "positiva",
        observation: "Excelente liderazgo en trabajos grupales. Motiva a sus compañeros y presenta ideas creativas.",
        category: "Participación",
      },
      {
        id: "OBS008",
        teacherName: "Prof. Diego Herrera",
        subject: "Educación Física",
        date: "2024-02-17",
        type: "positiva",
        observation: "Destacada en deportes y siempre con actitud positiva. Ejemplo para sus compañeros.",
        category: "Actitud",
      },
    ],
  },
  {
    id: "EST004",
    name: "Juan Martínez Silva",
    document: "5544332211",
    course: "Décimo",
    group: "B",
    grade: "10°",
    section: "B",
    guardian: "Ana Silva",
    phone: "303-456-7890",
    email: "juan.martinez@email.com",
    enrollmentDate: "2024-01-15",
    paymentStatus: "Vencido",
    academicStatus: "Suspendido",
    attendance: 75,
    averageGrade: 3.2,
    address: "Calle 67 #89-12, Barranquilla",
    birthDate: "2008-11-05",
    emergencyContact: "Roberto Silva",
    emergencyPhone: "304-654-3210",
    subjects: ["Matemáticas", "Español", "Ciencias", "Inglés", "Sociales"],
    lastPayment: "2023-12-01",
    nextPayment: "2024-01-01",
    observations: [
      {
        id: "OBS009",
        teacherName: "Prof. Patricia Vega",
        subject: "Sociales",
        date: "2024-02-14",
        type: "negativa",
        observation: "Múltiples faltas sin justificar. No participa en clase y muestra desinterés por la materia.",
        category: "Asistencia",
      },
      {
        id: "OBS010",
        teacherName: "Prof. Fernando Castro",
        subject: "Matemáticas",
        date: "2024-02-12",
        type: "negativa",
        observation:
          "No entrega trabajos y tiene dificultades para seguir el ritmo de la clase. Requiere apoyo adicional.",
        category: "Académico",
      },
      {
        id: "OBS011",
        teacherName: "Prof. Isabel Moreno",
        subject: "Español",
        date: "2024-02-08",
        type: "negativa",
        observation: "Comportamiento inadecuado en clase. Falta de respeto hacia compañeros y docentes.",
        category: "Disciplinario",
      },
    ],
  },
  {
    id: "EST005",
    name: "Sofía Hernández Castro",
    document: "6677889900",
    course: "Undécimo",
    group: "A",
    grade: "11°",
    section: "A",
    guardian: "Pedro Hernández",
    phone: "304-567-8901",
    email: "sofia.hernandez@email.com",
    enrollmentDate: "2024-02-25",
    paymentStatus: "Al día",
    academicStatus: "Activo",
    attendance: 97,
    averageGrade: 4.7,
    address: "Transversal 15 #34-56, Bucaramanga",
    birthDate: "2007-01-18",
    emergencyContact: "Carmen Castro",
    emergencyPhone: "305-543-2109",
    subjects: ["Matemáticas", "Física", "Química", "Inglés", "Filosofía"],
    lastPayment: "2024-02-25",
    nextPayment: "2024-03-25",
    observations: [
      {
        id: "OBS012",
        teacherName: "Prof. Andrés Jiménez",
        subject: "Filosofía",
        date: "2024-02-23",
        type: "positiva",
        observation:
          "Reflexiones profundas y argumentos sólidos en debates. Demuestra pensamiento crítico excepcional.",
        category: "Académico",
      },
      {
        id: "OBS013",
        teacherName: "Prof. Lucía Ramírez",
        subject: "Química",
        date: "2024-02-20",
        type: "positiva",
        observation: "Excelente en prácticas de laboratorio. Siempre sigue protocolos de seguridad y ayuda a otros.",
        category: "Participación",
      },
    ],
  },
  {
    id: "EST006",
    name: "Diego Ramírez Torres",
    document: "7788990011",
    course: "Noveno",
    group: "A",
    grade: "9°",
    section: "A",
    guardian: "Carmen Torres",
    phone: "305-678-9012",
    email: "diego.ramirez@email.com",
    enrollmentDate: "2024-02-03",
    paymentStatus: "Pendiente",
    academicStatus: "Activo",
    attendance: 85,
    averageGrade: 3.9,
    address: "Diagonal 25 #78-90, Pereira",
    birthDate: "2009-07-12",
    emergencyContact: "Luis Ramírez",
    emergencyPhone: "306-432-1098",
    subjects: ["Matemáticas", "Español", "Ciencias", "Inglés", "Educación Física"],
    lastPayment: "2024-01-03",
    nextPayment: "2024-02-03",
    observations: [
      {
        id: "OBS014",
        teacherName: "Prof. Sandra Pérez",
        subject: "Inglés",
        date: "2024-02-19",
        type: "neutral",
        observation: "Progreso constante en el idioma. Necesita más práctica en conversación pero muestra interés.",
        category: "Académico",
      },
      {
        id: "OBS015",
        teacherName: "Prof. Mario Delgado",
        subject: "Ciencias",
        date: "2024-02-16",
        type: "positiva",
        observation:
          "Curiosidad científica notable. Hace preguntas inteligentes y participa activamente en experimentos.",
        category: "Participación",
      },
    ],
  },
]

export function EnrolledStudentsListContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all")
  const [selectedAcademicStatus, setSelectedAcademicStatus] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<EnrolledStudent | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  const filteredStudents = mockEnrolledStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.document.includes(searchTerm) ||
      student.guardian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCourse = selectedCourse === "all" || student.course === selectedCourse
    const matchesGroup = selectedGroup === "all" || student.group === selectedGroup
    const matchesPayment = selectedPaymentStatus === "all" || student.paymentStatus === selectedPaymentStatus
    const matchesAcademic = selectedAcademicStatus === "all" || student.academicStatus === selectedAcademicStatus

    return matchesSearch && matchesCourse && matchesGroup && matchesPayment && matchesAcademic
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCourse("all")
    setSelectedGroup("all")
    setSelectedPaymentStatus("all")
    setSelectedAcademicStatus("all")
  }

  const handleViewProfile = (student: EnrolledStudent) => {
    setSelectedStudent(student)
    setShowProfileModal(true)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Al día":
        return "default"
      case "Pendiente":
        return "secondary"
      case "Vencido":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getAcademicStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "default"
      case "Inactivo":
        return "secondary"
      case "Suspendido":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600 dark:text-green-400"
    if (attendance >= 80) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 4.0) return "text-green-600 dark:text-green-400"
    if (grade >= 3.5) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Listas Estudiantil</h2>
          <p className="text-muted-foreground">
            Lista completa de estudiantes matriculados con información académica y administrativa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{mockEnrolledStudents.length}</div>
            <div className="text-sm text-muted-foreground">Total Matriculados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockEnrolledStudents.filter((s) => s.academicStatus === "Activo").length}
            </div>
            <div className="text-sm text-muted-foreground">Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockEnrolledStudents.filter((s) => s.paymentStatus === "Al día").length}
            </div>
            <div className="text-sm text-muted-foreground">Al Día en Pagos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {mockEnrolledStudents.filter((s) => s.paymentStatus === "Pendiente").length}
            </div>
            <div className="text-sm text-muted-foreground">Pagos Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {mockEnrolledStudents.filter((s) => s.academicStatus === "Suspendido").length}
            </div>
            <div className="text-sm text-muted-foreground">Suspendidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6 md:items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, documento, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Curso</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Noveno">Noveno</SelectItem>
                  <SelectItem value="Décimo">Décimo</SelectItem>
                  <SelectItem value="Undécimo">Undécimo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Grupo</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado Pago</label>
              <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pagos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Al día">Al día</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado Académico</label>
              <Select value={selectedAcademicStatus} onValueChange={setSelectedAcademicStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Académico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de estudiantes */}
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes Matriculados</CardTitle>
          <CardDescription>{filteredStudents.length} estudiante(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Curso/Grupo</TableHead>
                  <TableHead>Acudiente</TableHead>
                  <TableHead>Estado Académico</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead>Asistencia</TableHead>
                  <TableHead>Promedio</TableHead>
                  <TableHead>Fecha Matrícula</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{student.document}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant="outline">{student.grade}</Badge>
                        <Badge variant="secondary">{student.group}</Badge>
                      </div>
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
                      <Badge variant={getAcademicStatusColor(student.academicStatus)}>{student.academicStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusColor(student.paymentStatus)}>{student.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                        {student.attendance}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getGradeColor(student.averageGrade)}`}>
                        {student.averageGrade.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(student.enrollmentDate).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleViewProfile(student)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Perfil Completo */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header del Modal - Fijo */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="mb-2 sm:mb-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Perfil del Estudiante</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedStudent?.name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileModal(false)}
                className="self-end sm:self-start text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            {/* Navegación por pestañas - Fija */}
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* Desktop - Grid compacto */}
              <div className="hidden lg:grid grid-cols-6 gap-1 p-2">
                {[
                  { id: "personal", name: "Información Personal", shortName: "Personal", icon: "👤" },
                  { id: "academico", name: "Académico", shortName: "Académico", icon: "🎓" },
                  { id: "contacto", name: "Contacto", shortName: "Contacto", icon: "📞" },
                  { id: "financiero", name: "Financiero", shortName: "Financiero", icon: "💳" },
                  { id: "materias", name: "Materias", shortName: "Materias", icon: "📚" },
                  { id: "observador", name: "Observador", shortName: "Observador", icon: "👁️" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    } p-2 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 text-center min-h-[60px] justify-center`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="text-xs font-medium leading-tight">{tab.shortName}</span>
                  </button>
                ))}
              </div>

              {/* Mobile - Dropdown selector */}
              <div className="lg:hidden p-3">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span>
                          {
                            [
                              { id: "personal", name: "Información Personal", icon: "👤" },
                              { id: "academico", name: "Académico", icon: "🎓" },
                              { id: "contacto", name: "Contacto", icon: "📞" },
                              { id: "financiero", name: "Financiero", icon: "💳" },
                              { id: "materias", name: "Materias", icon: "📚" },
                              { id: "observador", name: "Observador", icon: "👁️" },
                            ].find((tab) => tab.id === activeTab)?.icon
                          }
                        </span>
                        <span className="font-medium text-sm">
                          {
                            [
                              { id: "personal", name: "Información Personal", icon: "👤" },
                              { id: "academico", name: "Académico", icon: "🎓" },
                              { id: "contacto", name: "Contacto", icon: "📞" },
                              { id: "financiero", name: "Financiero", icon: "💳" },
                              { id: "materias", name: "Materias", icon: "📚" },
                              { id: "observador", name: "Observador", icon: "👁️" },
                            ].find((tab) => tab.id === activeTab)?.name
                          }
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { id: "personal", name: "Información Personal", icon: "👤" },
                      { id: "academico", name: "Académico", icon: "🎓" },
                      { id: "contacto", name: "Contacto", icon: "📞" },
                      { id: "financiero", name: "Financiero", icon: "💳" },
                      { id: "materias", name: "Materias", icon: "📚" },
                      { id: "observador", name: "Observador", icon: "👁️" },
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
                {selectedStudent && (
                  <>
                    {activeTab === "personal" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-blue-500">👤</span>
                          Información Personal
                        </h3>

                        {/* Fotografía del Estudiante */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-24 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                              {selectedStudent.name.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  Nombre Completo:
                                </span>
                                <p className="font-medium">{selectedStudent.name}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Documento:</span>
                                <p className="font-medium font-mono">{selectedStudent.document}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  Fecha de Nacimiento:
                                </span>
                                <p className="font-medium">
                                  {new Date(selectedStudent.birthDate).toLocaleDateString("es-ES")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Información de Ubicación */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Información de Ubicación</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Dirección:</span>
                              <p className="font-medium">{selectedStudent.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "academico" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-purple-500">🎓</span>
                          Información Académica
                        </h3>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Curso y Grupo:
                              </span>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline">{selectedStudent.grade}</Badge>
                                <Badge variant="secondary">{selectedStudent.group}</Badge>
                              </div>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Estado Académico:
                              </span>
                              <div className="mt-1">
                                <Badge variant={getAcademicStatusColor(selectedStudent.academicStatus)}>
                                  {selectedStudent.academicStatus}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Asistencia:</span>
                              <p className={`font-medium ${getAttendanceColor(selectedStudent.attendance)}`}>
                                {selectedStudent.attendance}%
                              </p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Promedio General:
                              </span>
                              <p className={`font-medium ${getGradeColor(selectedStudent.averageGrade)}`}>
                                {selectedStudent.averageGrade.toFixed(1)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "contacto" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-green-500">📞</span>
                          Información de Contacto
                        </h3>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Email:</span>
                              <p className="font-medium">{selectedStudent.email}</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Teléfono:</span>
                              <p className="font-medium">{selectedStudent.phone}</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Acudiente:</span>
                              <p className="font-medium">{selectedStudent.guardian}</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Contacto de Emergencia:
                              </span>
                              <p className="font-medium">{selectedStudent.emergencyContact}</p>
                              <p className="text-sm text-muted-foreground">{selectedStudent.emergencyPhone}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "financiero" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-yellow-500">💳</span>
                          Estado Financiero
                        </h3>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Estado de Pago:
                              </span>
                              <div className="mt-1">
                                <Badge variant={getPaymentStatusColor(selectedStudent.paymentStatus)}>
                                  {selectedStudent.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Último Pago:</span>
                              <p className="font-medium">
                                {new Date(selectedStudent.lastPayment).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Próximo Pago:
                              </span>
                              <p className="font-medium">
                                {new Date(selectedStudent.nextPayment).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "materias" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-indigo-500">📚</span>
                          Materias Cursadas
                        </h3>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedStudent.subjects.map((subject, index) => (
                              <Badge key={index} variant="outline" className="text-sm">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "observador" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-blue-500">👁️</span>
                          Observador del Estudiante
                        </h3>

                        {/* Resumen de Observaciones */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {selectedStudent.observations.filter((obs) => obs.type === "positiva").length}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">Observaciones Positivas</div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {selectedStudent.observations.filter((obs) => obs.type === "negativa").length}
                            </div>
                            <div className="text-sm text-red-700 dark:text-red-300">Observaciones Negativas</div>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                              {selectedStudent.observations.filter((obs) => obs.type === "neutral").length}
                            </div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-300">Observaciones Neutrales</div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {selectedStudent.observations.length}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">Total Observaciones</div>
                          </div>
                        </div>

                        {/* Indicador de Tendencia */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tendencia General</h4>
                          <div className="flex items-center gap-4">
                            {(() => {
                              const positivas = selectedStudent.observations.filter(
                                (obs) => obs.type === "positiva",
                              ).length
                              const negativas = selectedStudent.observations.filter(
                                (obs) => obs.type === "negativa",
                              ).length
                              const neutrales = selectedStudent.observations.filter(
                                (obs) => obs.type === "neutral",
                              ).length

                              if (positivas > negativas) {
                                return (
                                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-medium">Tendencia Positiva</span>
                                    <span className="text-sm">
                                      ({positivas} positivas vs {negativas} negativas)
                                    </span>
                                  </div>
                                )
                              } else if (negativas > positivas) {
                                return (
                                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="font-medium">Requiere Atención</span>
                                    <span className="text-sm">
                                      ({negativas} negativas vs {positivas} positivas)
                                    </span>
                                  </div>
                                )
                              } else {
                                return (
                                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="font-medium">Tendencia Equilibrada</span>
                                    <span className="text-sm">
                                      ({positivas} positivas, {negativas} negativas)
                                    </span>
                                  </div>
                                )
                              }
                            })()}
                          </div>
                        </div>

                        {/* Lista de Observaciones */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Observaciones Recientes</h4>
                          {selectedStudent.observations
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((observation) => (
                              <div
                                key={observation.id}
                                className={`border rounded-lg p-4 ${
                                  observation.type === "positiva"
                                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                                    : observation.type === "negativa"
                                      ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                                      : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        observation.type === "positiva"
                                          ? "default"
                                          : observation.type === "negativa"
                                            ? "destructive"
                                            : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {observation.type === "positiva"
                                        ? "✓ Positiva"
                                        : observation.type === "negativa"
                                          ? "✗ Negativa"
                                          : "◐ Neutral"}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {observation.category}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(observation.date).toLocaleDateString("es-ES")}
                                  </div>
                                </div>

                                <div className="mb-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      {observation.teacherName}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">•</span>
                                    <span className="text-gray-600 dark:text-gray-400">{observation.subject}</span>
                                  </div>
                                </div>

                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                                  {observation.observation}
                                </p>
                              </div>
                            ))}

                          {selectedStudent.observations.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <div className="text-4xl mb-2">📝</div>
                              <p>No hay observaciones registradas para este estudiante.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
