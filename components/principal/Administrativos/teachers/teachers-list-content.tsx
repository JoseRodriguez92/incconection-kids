"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Calendar,
  GraduationCap,
  Phone,
  Mail,
  User,
  Briefcase,
  Building,
  Clock,
  Award,
  CheckCircle,
  X,
  FileCheck,
  CalendarClock,
  DollarSign,
  School,
  Pause,
} from "lucide-react"

export function TeachersListContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedContract, setSelectedContract] = useState("all")

  // Estados para controlar la apertura de los modales
  const [viewProfileOpen, setViewProfileOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [viewScheduleOpen, setViewScheduleOpen] = useState(false)
  const [generateContractOpen, setGenerateContractOpen] = useState(false)
  const [sendEmailOpen, setSendEmailOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)

  const teachers = [
    {
      id: 1,
      name: "Ana García Pérez",
      document: "1234567890",
      position: "Docente",
      subjects: ["Matemáticas", "Física"],
      degree: "Licenciatura en Matemáticas",
      university: "Universidad Nacional",
      experience: "8 años",
      contractType: "Indefinido",
      workload: "40 horas",
      status: "Activo",
      hireDate: "2020-02-15",
      phone: "300-123-4567",
      email: "ana.garcia@colegio.edu.co",
      salary: 3500000,
      address: "Calle 123 #45-67, Bogotá",
      birthDate: "1985-05-12",
      gender: "Femenino",
      schedule: {
        monday: [
          { time: "7:00 - 9:00", subject: "Matemáticas", grade: "10°A" },
          { time: "9:30 - 11:30", subject: "Física", grade: "11°B" },
          { time: "12:30 - 2:30", subject: "Matemáticas", grade: "9°C" },
        ],
        tuesday: [
          { time: "7:00 - 9:00", subject: "Física", grade: "10°B" },
          { time: "9:30 - 11:30", subject: "Matemáticas", grade: "11°A" },
        ],
        wednesday: [
          { time: "7:00 - 9:00", subject: "Matemáticas", grade: "10°A" },
          { time: "9:30 - 11:30", subject: "Física", grade: "9°A" },
          { time: "12:30 - 2:30", subject: "Matemáticas", grade: "11°C" },
        ],
        thursday: [
          { time: "7:00 - 9:00", subject: "Física", grade: "10°C" },
          { time: "9:30 - 11:30", subject: "Matemáticas", grade: "9°B" },
        ],
        friday: [
          { time: "7:00 - 9:00", subject: "Matemáticas", grade: "11°B" },
          { time: "9:30 - 11:30", subject: "Física", grade: "10°A" },
        ],
      },
      observations: [
        {
          id: 1,
          date: "2024-01-15",
          type: "Incapacidad",
          description: "Incapacidad médica por gripe - 3 días",
          status: "Resuelto",
          severity: "low",
        },
        {
          id: 2,
          date: "2023-11-20",
          type: "Capacitación",
          description: "Asistió a capacitación en nuevas metodologías pedagógicas",
          status: "Completado",
          severity: "info",
        },
        {
          id: 3,
          date: "2023-09-10",
          type: "Reconocimiento",
          description: "Reconocimiento por excelencia académica en el área de matemáticas",
          status: "Activo",
          severity: "success",
        },
      ],
    },
    {
      id: 2,
      name: "Carlos Rodríguez López",
      document: "0987654321",
      position: "Coordinador",
      subjects: ["Ciencias Naturales", "Química"],
      degree: "Licenciatura en Química",
      university: "Universidad de los Andes",
      experience: "12 años",
      contractType: "Indefinido",
      workload: "40 horas",
      status: "Activo",
      hireDate: "2018-01-10",
      phone: "301-234-5678",
      email: "carlos.rodriguez@colegio.edu.co",
      salary: 4200000,
      address: "Carrera 45 #12-34, Bogotá",
      birthDate: "1980-08-23",
      gender: "Masculino",
      schedule: {
        monday: [
          { time: "7:00 - 9:00", subject: "Química", grade: "11°A" },
          { time: "9:30 - 11:30", subject: "Ciencias", grade: "8°B" },
          { time: "12:30 - 2:30", subject: "Coordinación", grade: "N/A" },
        ],
        tuesday: [
          { time: "7:00 - 10:00", subject: "Coordinación", grade: "N/A" },
          { time: "10:30 - 12:30", subject: "Química", grade: "10°B" },
        ],
        wednesday: [
          { time: "7:00 - 9:00", subject: "Ciencias", grade: "9°A" },
          { time: "9:30 - 2:30", subject: "Coordinación", grade: "N/A" },
        ],
        thursday: [
          { time: "7:00 - 9:00", subject: "Química", grade: "11°C" },
          { time: "9:30 - 2:30", subject: "Coordinación", grade: "N/A" },
        ],
        friday: [
          { time: "7:00 - 9:00", subject: "Ciencias", grade: "8°A" },
          { time: "9:30 - 2:30", subject: "Coordinación", grade: "N/A" },
        ],
      },
      observations: [
        {
          id: 1,
          date: "2024-02-01",
          type: "Promoción",
          description: "Promoción a Coordinador Académico",
          status: "Activo",
          severity: "success",
        },
        {
          id: 2,
          date: "2023-12-15",
          type: "Pausa",
          description: "Pausa administrativa por reorganización de horarios - 1 semana",
          status: "Resuelto",
          severity: "medium",
        },
      ],
    },
    {
      id: 3,
      name: "María López Martínez",
      document: "1122334455",
      position: "Docente",
      subjects: ["Español", "Literatura"],
      degree: "Licenciatura en Lenguas Modernas",
      university: "Universidad Javeriana",
      experience: "5 años",
      contractType: "Término Fijo",
      workload: "30 horas",
      status: "Activo",
      hireDate: "2022-02-20",
      phone: "302-345-6789",
      email: "maria.lopez@colegio.edu.co",
      salary: 2800000,
      address: "Avenida 34 #56-78, Bogotá",
      birthDate: "1990-11-05",
      gender: "Femenino",
      schedule: {
        monday: [
          { time: "7:00 - 9:00", subject: "Español", grade: "7°A" },
          { time: "9:30 - 11:30", subject: "Literatura", grade: "10°B" },
        ],
        tuesday: [
          { time: "7:00 - 9:00", subject: "Español", grade: "8°B" },
          { time: "9:30 - 11:30", subject: "Literatura", grade: "11°A" },
        ],
        wednesday: [
          { time: "7:00 - 9:00", subject: "Español", grade: "9°A" },
          { time: "9:30 - 11:30", subject: "Literatura", grade: "10°A" },
        ],
        thursday: [
          { time: "7:00 - 9:00", subject: "Español", grade: "7°B" },
          { time: "9:30 - 11:30", subject: "Literatura", grade: "11°B" },
        ],
        friday: [{ time: "7:00 - 9:00", subject: "Español", grade: "8°A" }],
      },
      observations: [
        {
          id: 1,
          date: "2024-01-08",
          type: "Incapacidad",
          description: "Licencia de maternidad - 3 meses",
          status: "En curso",
          severity: "medium",
        },
      ],
    },
    {
      id: 4,
      name: "Juan Martínez Silva",
      document: "5544332211",
      position: "Docente",
      subjects: ["Educación Física"],
      degree: "Licenciatura en Educación Física",
      university: "Universidad Pedagógica",
      experience: "3 años",
      contractType: "Prestación de Servicios",
      workload: "20 horas",
      status: "Inactivo",
      hireDate: "2023-01-15",
      phone: "303-456-7890",
      email: "juan.martinez@colegio.edu.co",
      salary: 1500000,
      address: "Calle 78 #90-12, Bogotá",
      birthDate: "1992-03-18",
      gender: "Masculino",
      schedule: {
        monday: [
          { time: "7:00 - 9:00", subject: "Educación Física", grade: "6°A" },
          { time: "9:30 - 11:30", subject: "Educación Física", grade: "7°B" },
        ],
        tuesday: [],
        wednesday: [
          { time: "7:00 - 9:00", subject: "Educación Física", grade: "8°A" },
          { time: "9:30 - 11:30", subject: "Educación Física", grade: "9°B" },
        ],
        thursday: [],
        friday: [
          { time: "7:00 - 9:00", subject: "Educación Física", grade: "10°A" },
          { time: "9:30 - 11:30", subject: "Educación Física", grade: "11°B" },
        ],
      },
      observations: [
        {
          id: 1,
          date: "2024-03-01",
          type: "Suspensión",
          description: "Suspensión temporal por reorganización presupuestal",
          status: "Activo",
          severity: "high",
        },
        {
          id: 2,
          date: "2023-08-15",
          type: "Advertencia",
          description: "Llamado de atención por retrasos frecuentes",
          status: "Resuelto",
          severity: "medium",
        },
      ],
    },
  ]

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.document.includes(searchTerm) ||
      teacher.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = selectedSubject === "all" || teacher.subjects.includes(selectedSubject)
    const matchesStatus = selectedStatus === "all" || teacher.status === selectedStatus
    const matchesContract = selectedContract === "all" || teacher.contractType === selectedContract

    return matchesSearch && matchesSubject && matchesStatus && matchesContract
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedSubject("all")
    setSelectedStatus("all")
    setSelectedContract("all")
  }
  //@ts-ignore
  const handleAction = (action, teacher) => {
    setSelectedTeacher(teacher)

    switch (action) {
      case "viewProfile":
        setViewProfileOpen(true)
        break
      case "editProfile":
        setEditProfileOpen(true)
        break
      case "viewSchedule":
        setViewScheduleOpen(true)
        break
      case "generateContract":
        setGenerateContractOpen(true)
        break
      case "sendEmail":
        setSendEmailOpen(true)
        break
      case "pauseTeacher":
        // Lógica para pausar profesor (por ahora solo console.log)
        console.log("Pausando profesor:", teacher.name)
        break
      default:
        break
    }
  }

  // Función para formatear moneda colombiana
  //@ts-ignore
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  // Función para obtener color de fondo según la materia
  //@ts-ignore
  const getSubjectColor = (subject) => {
    const colors = {
      Matemáticas: "bg-blue-100 text-blue-800",
      Física: "bg-purple-100 text-purple-800",
      Química: "bg-green-100 text-green-800",
      Ciencias: "bg-emerald-100 text-emerald-800",
      Español: "bg-yellow-100 text-yellow-800",
      Literatura: "bg-amber-100 text-amber-800",
      "Educación Física": "bg-red-100 text-red-800",
      Coordinación: "bg-gray-100 text-gray-800",
    }
    //@ts-ignore
    return colors[subject] || "bg-gray-100 text-gray-800"
  }

  // Función para obtener color según el tipo de observación
  //@ts-ignore
  const getObservationColor = (severity) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      info: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300",
      success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    }
    //@ts-ignore
    return colors[severity] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
  }

  // Función para obtener icono según el tipo de observación
  //@ts-ignore
  const getObservationIcon = (type) => {
    const icons = {
      Incapacidad: "🏥",
      Capacitación: "📚",
      Reconocimiento: "🏆",
      Promoción: "⬆️",
      Pausa: "⏸️",
      Suspensión: "⛔",
      Advertencia: "⚠️",
      Renuncia: "📤",
      Licencia: "📋",
    }
    //@ts-ignore
    return icons[type] || "📝"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lista de Docentes</h2>
          <p className="text-muted-foreground">Gestiona la información del personal docente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{teachers.length}</div>
            <div className="text-sm text-muted-foreground">Total Docentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {teachers.filter((t) => t.status === "Activo").length}
            </div>
            <div className="text-sm text-muted-foreground">Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {teachers.filter((t) => t.position === "Coordinador").length}
            </div>
            <div className="text-sm text-muted-foreground">Coordinadores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(teachers.reduce((sum, t) => sum + Number.parseInt(t.experience), 0) / teachers.length)}
            </div>
            <div className="text-sm text-muted-foreground">Años Promedio Exp.</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5 md:items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, documento o materia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Materia</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Matemáticas">Matemáticas</SelectItem>
                  <SelectItem value="Español">Español</SelectItem>
                  <SelectItem value="Inglés">Inglés</SelectItem>
                  <SelectItem value="Ciencias Naturales">Ciencias Naturales</SelectItem>
                  <SelectItem value="Educación Física">Educación Física</SelectItem>
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
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Licencia">En Licencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Contrato</label>
              <Select value={selectedContract} onValueChange={setSelectedContract}>
                <SelectTrigger>
                  <SelectValue placeholder="Contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Indefinido">Indefinido</SelectItem>
                  <SelectItem value="Término Fijo">Término Fijo</SelectItem>
                  <SelectItem value="Prestación de Servicios">Prestación de Servicios</SelectItem>
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

      {/* Tabla de docentes */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Docente</CardTitle>
          <CardDescription>{filteredTeachers.length} docente(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Docente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Materias</TableHead>
                <TableHead>Formación</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {teacher.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{teacher.document}</TableCell>
                  <TableCell>
                    <Badge variant={teacher.position === "Coordinador" ? "default" : "outline"}>
                      {teacher.position}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{teacher.degree}</div>
                      <div className="text-xs text-muted-foreground">{teacher.university}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {teacher.experience} experiencia
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">{teacher.contractType}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{teacher.workload}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={teacher.status === "Activo" ? "default" : "secondary"}>{teacher.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction("viewProfile", teacher)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("pauseTeacher", teacher)}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar profesor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Ver Perfil */}
      {selectedTeacher && (
        <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
          <DialogContent className="max-w-[95vw] w-full lg:max-w-6xl max-h-[90vh] overflow-hidden p-0 m-4 [&>button]:hidden">
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Header del Modal */}
              <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-900 text-white p-4 md:p-6 flex-shrink-0">
                <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
                    {/* Avatar y Info Principal */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 lg:gap-4 w-full lg:w-auto">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl md:text-2xl font-bold border-3 border-white/30">
                          {getInitials(selectedTeacher.name)}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${selectedTeacher.status === "Activo" ? "bg-green-500" : "bg-red-500"
                            }`}
                        ></div>
                      </div>

                      <div className="text-center sm:text-left flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold mb-2 truncate">{selectedTeacher.name}</h2>
                        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mb-2">
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                            {selectedTeacher.position}
                          </Badge>
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                            {selectedTeacher.contractType}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${selectedTeacher.status === "Activo"
                              ? "bg-green-500/20 text-green-100 border-green-300/30"
                              : "bg-red-500/20 text-red-100 border-red-300/30"
                              }`}
                          >
                            {selectedTeacher.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 text-xs text-white/90">
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{selectedTeacher.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{selectedTeacher.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Rápidas */}
                    <div className="w-full lg:w-auto lg:ml-auto">
                      <div className="grid grid-cols-3 gap-2 lg:gap-3 text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-white/20">
                          <div className="text-lg lg:text-xl font-bold">{selectedTeacher.experience}</div>
                          <div className="text-xs text-white/80">Experiencia</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-white/20">
                          <div className="text-lg lg:text-xl font-bold">{selectedTeacher.subjects.length}</div>
                          <div className="text-xs text-white/80">Materias</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-white/20">
                          <div className="text-lg lg:text-xl font-bold">{selectedTeacher.workload}</div>
                          <div className="text-xs text-white/80">Carga Horaria</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido Scrollable */}
              <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-6">
                <div className="max-w-5xl mx-auto">
                  <Tabs defaultValue="information" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="information" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Información
                      </TabsTrigger>
                      <TabsTrigger value="observer" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Observador
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="information" className="space-y-6">
                      {/* Materias que Enseña */}
                      <div className="mb-4">
                        <h3 className="text-base font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          Materias que Enseña
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTeacher.subjects.map((subject, index) => (
                            <Badge key={index} className={`${getSubjectColor(subject)} px-2 py-1 text-xs font-medium`}>
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Grid de Información */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {/* Información Personal */}
                        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3">
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                              <User className="h-4 w-4" />
                              Información Personal
                            </CardTitle>
                          </div>
                          <CardContent className="p-4 space-y-3">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Documento</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedTeacher.document}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Género</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedTeacher.gender}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Fecha Nacimiento
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedTeacher.birthDate}
                                </span>
                              </div>
                              <div className="py-1.5">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                  Dirección
                                </span>
                                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 break-words">
                                  {selectedTeacher.address}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Información Académica */}
                        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 p-3">
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                              <GraduationCap className="h-4 w-4" />
                              Formación Académica
                            </CardTitle>
                          </div>
                          <CardContent className="p-4 space-y-3">
                            <div className="space-y-2">
                              <div className="py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                  Título
                                </span>
                                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 break-words">
                                  {selectedTeacher.degree}
                                </span>
                              </div>
                              <div className="py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                  Universidad
                                </span>
                                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 break-words">
                                  {selectedTeacher.university}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Experiencia
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 text-xs"
                                >
                                  {selectedTeacher.experience}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Información Laboral */}
                        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow lg:col-span-2 xl:col-span-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-3">
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                              <Briefcase className="h-4 w-4" />
                              Información Laboral
                            </CardTitle>
                          </div>
                          <CardContent className="p-4 space-y-3">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Cargo</span>
                                <Badge
                                  variant={selectedTeacher.position === "Coordinador" ? "default" : "outline"}
                                  className="text-xs"
                                >
                                  {selectedTeacher.position}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Tipo Contrato
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedTeacher.contractType}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Carga Horaria
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedTeacher.workload}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Fecha Ingreso
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedTeacher.hireDate}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Salario</span>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(selectedTeacher.salary)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Horario Semanal Compacto */}
                      <Card className="overflow-hidden shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 p-3">
                          <CardTitle className="text-white flex items-center gap-2 text-base">
                            <Calendar className="h-4 w-4" />
                            Resumen de Horario Semanal
                          </CardTitle>
                        </div>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {Object.entries(selectedTeacher.schedule).map(([day, classes]) => (
                              <div key={day} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                  {day === "monday"
                                    ? "Lunes"
                                    : day === "tuesday"
                                      ? "Martes"
                                      : day === "wednesday"
                                        ? "Miércoles"
                                        : day === "thursday"
                                          ? "Jueves"
                                          : "Viernes"}
                                </h4>
                                <div className="space-y-1.5">
                                  {classes.length > 0 ? (
                                    classes.map((classItem, index) => (
                                      <div
                                        key={index}
                                        className={`p-1.5 rounded text-xs ${getSubjectColor(classItem.subject)}`}
                                      >
                                        <div className="font-medium text-xs">{classItem.subject}</div>
                                        <div className="text-xs opacity-80">{classItem.grade}</div>
                                        <div className="text-xs opacity-70">{classItem.time}</div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-xs text-gray-400 dark:text-gray-500 italic">Sin clases</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction("viewSchedule", selectedTeacher)}
                              className="w-full sm:w-auto text-xs"
                            >
                              <Calendar className="h-3 w-3 mr-1.5" />
                              Ver Horario Completo
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="observer" className="space-y-6">
                      {/* Observaciones y Eventos */}
                      <Card className="overflow-hidden shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 p-3">
                          <CardTitle className="text-white flex items-center gap-2 text-base">
                            <Eye className="h-4 w-4" />
                            Historial de Eventos y Observaciones
                          </CardTitle>
                        </div>
                        <CardContent className="p-4">
                          {selectedTeacher.observations && selectedTeacher.observations.length > 0 ? (
                            <div className="space-y-4">
                              {/* Estadísticas rápidas */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {selectedTeacher.observations.length}
                                  </div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400">Total Eventos</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {selectedTeacher.observations.filter((o) => o.severity === "success").length}
                                  </div>
                                  <div className="text-xs text-green-600 dark:text-green-400">Positivos</div>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                    {
                                      selectedTeacher.observations.filter(
                                        (o) => o.status === "En curso" || o.status === "Activo",
                                      ).length
                                    }
                                  </div>
                                  <div className="text-xs text-yellow-600 dark:text-yellow-400">En Curso</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg text-center">
                                  <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                    {
                                      selectedTeacher.observations.filter(
                                        (o) => o.status === "Resuelto" || o.status === "Completado",
                                      ).length
                                    }
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Resueltos</div>
                                </div>
                              </div>

                              {/* Timeline de eventos */}
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {selectedTeacher.observations
                                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                                  .map((observation, index) => (
                                    <div
                                      key={observation.id}
                                      className="relative flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                                    >
                                      {/* Timeline line */}
                                      {index < selectedTeacher.observations.length - 1 && (
                                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
                                      )}

                                      {/* Icon */}
                                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm">
                                        {getObservationIcon(observation.type)}
                                      </div>

                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge
                                            className={`${getObservationColor(observation.severity)} text-xs font-medium`}
                                          >
                                            {observation.type}
                                          </Badge>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(observation.date).toLocaleDateString("es-ES", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                          {observation.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="outline"
                                            className={`text-xs ${observation.status === "Activo" || observation.status === "En curso"
                                              ? "border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300"
                                              : observation.status === "Completado" ||
                                                observation.status === "Resuelto"
                                                ? "border-green-300 text-green-700 dark:border-green-600 dark:text-green-300"
                                                : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                                              }`}
                                          >
                                            {observation.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <h3 className="text-lg font-medium mb-2">No hay observaciones registradas</h3>
                              <p className="text-sm">
                                El historial de eventos aparecerá aquí cuando se registren observaciones.
                              </p>
                            </div>
                          )}

                          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs">
                              <FileText className="h-3 w-3 mr-1.5" />
                              Agregar Observación
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              <Download className="h-3 w-3 mr-1.5" />
                              Exportar Historial
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Footer con Acciones */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 md:p-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("editProfile", selectedTeacher)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("generateContract", selectedTeacher)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5"
                    >
                      <FileText className="h-3 w-3" />
                      Contrato
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("sendEmail", selectedTeacher)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5"
                    >
                      <Mail className="h-3 w-3" />
                      Email
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setViewProfileOpen(false)}
                    className="w-full sm:w-auto text-xs px-4 py-1.5"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Editar Perfil */}
      {selectedTeacher && (
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Editar Docente</DialogTitle>
              <DialogDescription>Modifica la información de {selectedTeacher.name}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="personal" className="mt-4">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Información Personal</span>
                  <span className="sm:hidden">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="academic" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Información Académica</span>
                  <span className="sm:hidden">Académica</span>
                </TabsTrigger>
                <TabsTrigger value="work" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Información Laboral</span>
                  <span className="sm:hidden">Laboral</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="name" defaultValue={selectedTeacher.name} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">Documento</Label>
                    <div className="relative">
                      <FileCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="document" defaultValue={selectedTeacher.document} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" defaultValue={selectedTeacher.phone} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" defaultValue={selectedTeacher.email} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <div className="relative">
                      <CalendarClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="birthDate" type="date" defaultValue={selectedTeacher.birthDate} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Género</Label>
                    <Select defaultValue={selectedTeacher.gender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="address" defaultValue={selectedTeacher.address} className="pl-10" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="academic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="degree">Título</Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="degree" defaultValue={selectedTeacher.degree} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">Universidad</Label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="university" defaultValue={selectedTeacher.university} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experiencia</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="experience" defaultValue={selectedTeacher.experience} className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Materias</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="subject-math"
                        className="rounded border-gray-300"
                        defaultChecked={selectedTeacher.subjects.includes("Matemáticas")}
                      />
                      <Label htmlFor="subject-math" className="font-normal">
                        Matemáticas
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="subject-physics"
                        className="rounded border-gray-300"
                        defaultChecked={selectedTeacher.subjects.includes("Física")}
                      />
                      <Label htmlFor="subject-physics" className="font-normal">
                        Física
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="subject-chemistry"
                        className="rounded border-gray-300"
                        defaultChecked={selectedTeacher.subjects.includes("Química")}
                      />
                      <Label htmlFor="subject-chemistry" className="font-normal">
                        Química
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="subject-spanish"
                        className="rounded border-gray-300"
                        defaultChecked={selectedTeacher.subjects.includes("Español")}
                      />
                      <Label htmlFor="subject-spanish" className="font-normal">
                        Español
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="subject-literature"
                        className="rounded border-gray-300"
                        defaultChecked={selectedTeacher.subjects.includes("Literatura")}
                      />
                      <Label htmlFor="subject-literature" className="font-normal">
                        Literatura
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="subject-pe"
                        className="rounded border-gray-300"
                        defaultChecked={selectedTeacher.subjects.includes("Educación Física")}
                      />
                      <Label htmlFor="subject-pe" className="font-normal">
                        Educación Física
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="work" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Select defaultValue={selectedTeacher.position}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Docente">Docente</SelectItem>
                        <SelectItem value="Coordinador">Coordinador</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Tipo de Contrato</Label>
                    <Select defaultValue={selectedTeacher.contractType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indefinido">Indefinido</SelectItem>
                        <SelectItem value="Término Fijo">Término Fijo</SelectItem>
                        <SelectItem value="Prestación de Servicios">Prestación de Servicios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workload">Carga Horaria</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="workload" defaultValue={selectedTeacher.workload} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Fecha de Ingreso</Label>
                    <div className="relative">
                      <CalendarClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="hireDate" type="date" defaultValue={selectedTeacher.hireDate} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salario</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="salary" type="number" defaultValue={selectedTeacher.salary} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select defaultValue={selectedTeacher.status}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Licencia">En Licencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setEditProfileOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button className="flex-1 sm:flex-none" onClick={() => setEditProfileOpen(false)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Ver Horario */}
      {selectedTeacher && (
        <Dialog open={viewScheduleOpen} onOpenChange={setViewScheduleOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Horario Semanal
              </DialogTitle>
              <DialogDescription>Horario de clases de {selectedTeacher.name}</DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <CardTitle>Distribución de Carga Académica</CardTitle>
                    <Badge variant="secondary" className="mt-2 md:mt-0">
                      {selectedTeacher.workload}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[100px]">Hora</TableHead>
                          <TableHead>Lunes</TableHead>
                          <TableHead>Martes</TableHead>
                          <TableHead>Miércoles</TableHead>
                          <TableHead>Jueves</TableHead>
                          <TableHead>Viernes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">7:00 - 9:00</TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.monday.find((s) => s.time === "7:00 - 9:00") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.monday.find((s) => s.time === "7:00 - 9:00").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.monday.find((s) => s.time === "7:00 - 9:00").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.monday.find((s) => s.time === "7:00 - 9:00").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.tuesday.find((s) => s.time === "7:00 - 9:00") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.tuesday.find((s) => s.time === "7:00 - 9:00").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.tuesday.find((s) => s.time === "7:00 - 9:00").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.tuesday.find((s) => s.time === "7:00 - 9:00").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.wednesday.find((s) => s.time === "7:00 - 9:00") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.wednesday.find((s) => s.time === "7:00 - 9:00").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.wednesday.find((s) => s.time === "7:00 - 9:00").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.wednesday.find((s) => s.time === "7:00 - 9:00").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.thursday.find((s) => s.time === "7:00 - 9:00") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.thursday.find((s) => s.time === "7:00 - 9:00").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.thursday.find((s) => s.time === "7:00 - 9:00").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.thursday.find((s) => s.time === "7:00 - 9:00").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.friday.find((s) => s.time === "7:00 - 9:00") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.friday.find((s) => s.time === "7:00 - 9:00").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.friday.find((s) => s.time === "7:00 - 9:00").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.friday.find((s) => s.time === "7:00 - 9:00").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">9:30 - 11:30</TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.monday.find((s) => s.time === "9:30 - 11:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.monday.find((s) => s.time === "9:30 - 11:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.monday.find((s) => s.time === "9:30 - 11:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.monday.find((s) => s.time === "9:30 - 11:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.tuesday.find((s) => s.time === "9:30 - 11:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.tuesday.find((s) => s.time === "9:30 - 11:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.tuesday.find((s) => s.time === "9:30 - 11:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.tuesday.find((s) => s.time === "9:30 - 11:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.wednesday.find((s) => s.time === "9:30 - 11:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.wednesday.find((s) => s.time === "9:30 - 11:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.wednesday.find((s) => s.time === "9:30 - 11:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.wednesday.find((s) => s.time === "9:30 - 11:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.thursday.find((s) => s.time === "9:30 - 11:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.thursday.find((s) => s.time === "9:30 - 11:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.thursday.find((s) => s.time === "9:30 - 11:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.thursday.find((s) => s.time === "9:30 - 11:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.friday.find((s) => s.time === "9:30 - 11:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.friday.find((s) => s.time === "9:30 - 11:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.friday.find((s) => s.time === "9:30 - 11:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.friday.find((s) => s.time === "9:30 - 11:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">12:30 - 2:30</TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.monday.find((s) => s.time === "12:30 - 2:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.monday.find((s) => s.time === "12:30 - 2:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.monday.find((s) => s.time === "12:30 - 2:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.monday.find((s) => s.time === "12:30 - 2:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.tuesday.find((s) => s.time === "12:30 - 2:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.tuesday.find((s) => s.time === "12:30 - 2:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.tuesday.find((s) => s.time === "12:30 - 2:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.tuesday.find((s) => s.time === "12:30 - 2:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.wednesday.find((s) => s.time === "12:30 - 2:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.wednesday.find((s) => s.time === "12:30 - 2:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.wednesday.find((s) => s.time === "12:30 - 2:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.wednesday.find((s) => s.time === "12:30 - 2:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.thursday.find((s) => s.time === "12:30 - 2:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.thursday.find((s) => s.time === "12:30 - 2:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.thursday.find((s) => s.time === "12:30 - 2:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.thursday.find((s) => s.time === "12:30 - 2:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedTeacher.schedule.friday.find((s) => s.time === "12:30 - 2:30") ? (
                              <div
                                className={`p-2 rounded-md ${getSubjectColor(selectedTeacher.schedule.friday.find((s) => s.time === "12:30 - 2:30").subject)}`}
                              >
                                <div className="font-medium">
                                  {selectedTeacher.schedule.friday.find((s) => s.time === "12:30 - 2:30").subject}
                                </div>
                                <div className="text-xs">
                                  {selectedTeacher.schedule.friday.find((s) => s.time === "12:30 - 2:30").grade}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 flex flex-wrap gap-2 p-4">
                  <h4 className="text-sm font-medium w-full">Leyenda de Materias:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(
                        [].concat(
                          ...Object.values(selectedTeacher.schedule).map((day) => day.map((slot) => slot.subject)),
                        ),
                      ),
                    ).map((subject, index) => (
                      <Badge key={index} className={getSubjectColor(subject)}>
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setViewScheduleOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Generar Contrato */}
      {selectedTeacher && (
        <Dialog open={generateContractOpen} onOpenChange={setGenerateContractOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generar Contrato</DialogTitle>
              <DialogDescription>Generar un contrato para {selectedTeacher.name}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Esta funcionalidad está en desarrollo.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateContractOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Enviar Correo */}
      {selectedTeacher && (
        <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Correo Electrónico</DialogTitle>
              <DialogDescription>Enviar un correo electrónico a {selectedTeacher.name}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Esta funcionalidad está en desarrollo.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendEmailOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
