"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Award,
  Download,
  FileText,
  Plus,
  Search,
  Edit,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Filter,
  Upload,
  AlertCircle,
} from "lucide-react"

interface Certification {
  id: string
  studentId: string
  studentName: string
  studentCode: string
  type: "bachiller" | "curso" | "asistencia" | "conducta" | "academico"
  title: string
  description: string
  issueDate: string
  certificateNumber: string
  status: "issued" | "pending" | "cancelled" | "draft"
  template: string
  grade?: string
  course?: string
  period: string
  issuedBy: string
  validUntil?: string
  digitalSignature?: boolean
  downloadCount: number
}

interface Template {
  id: string
  name: string
  type: string
  description: string
  isActive: boolean
  lastModified: string
}

interface Student {
  id: string
  name: string
  code: string
  grade: string
  section: string
  email: string
}

const mockTemplates: Template[] = [
  {
    id: "T001",
    name: "Certificado de Bachiller",
    type: "bachiller",
    description: "Plantilla oficial para certificados de bachillerato",
    isActive: true,
    lastModified: "2024-01-15",
  },
  {
    id: "T002",
    name: "Certificado de Curso",
    type: "curso",
    description: "Plantilla para certificados de finalización de curso",
    isActive: true,
    lastModified: "2024-01-10",
  },
  {
    id: "T003",
    name: "Certificado de Asistencia",
    type: "asistencia",
    description: "Plantilla para certificados de asistencia a eventos",
    isActive: true,
    lastModified: "2024-01-08",
  },
  {
    id: "T004",
    name: "Certificado de Conducta",
    type: "conducta",
    description: "Plantilla para certificados de buena conducta",
    isActive: true,
    lastModified: "2024-01-05",
  },
  {
    id: "T005",
    name: "Certificado Académico",
    type: "academico",
    description: "Plantilla para certificados de logros académicos",
    isActive: true,
    lastModified: "2024-01-12",
  },
]

const mockStudents: Student[] = [
  {
    id: "EST001",
    name: "Ana García López",
    code: "2024001",
    grade: "11°",
    section: "A",
    email: "ana.garcia@estudiante.shift.edu.co",
  },
  {
    id: "EST002",
    name: "Carlos Rodríguez",
    code: "2024002",
    grade: "10°",
    section: "A",
    email: "carlos.rodriguez@estudiante.shift.edu.co",
  },
  {
    id: "EST003",
    name: "María Fernández",
    code: "2024003",
    grade: "11°",
    section: "B",
    email: "maria.fernandez@estudiante.shift.edu.co",
  },
  {
    id: "EST004",
    name: "Juan Martínez",
    code: "2024004",
    grade: "10°",
    section: "B",
    email: "juan.martinez@estudiante.shift.edu.co",
  },
  {
    id: "EST005",
    name: "Laura Sánchez",
    code: "2024005",
    grade: "9°",
    section: "A",
    email: "laura.sanchez@estudiante.shift.edu.co",
  },
  {
    id: "EST006",
    name: "Diego Morales",
    code: "2024006",
    grade: "11°",
    section: "A",
    email: "diego.morales@estudiante.shift.edu.co",
  },
]

const mockCertifications: Certification[] = [
  {
    id: "CERT001",
    studentId: "EST001",
    studentName: "Ana García López",
    studentCode: "2024001",
    type: "bachiller",
    title: "Certificado de Bachiller Académico",
    description: "Certificado que acredita la finalización del bachillerato académico con excelencia",
    issueDate: "2024-01-15",
    certificateNumber: "BACH-2024-001",
    status: "issued",
    template: "T001",
    grade: "11°",
    period: "2024-1",
    issuedBy: "Coordinación Académica",
    validUntil: "2029-01-15",
    digitalSignature: true,
    downloadCount: 3,
  },
  {
    id: "CERT002",
    studentId: "EST002",
    studentName: "Carlos Rodríguez",
    studentCode: "2024002",
    type: "curso",
    title: "Certificado de Finalización - Matemáticas Avanzadas",
    description: "Certificado de finalización exitosa del curso de Matemáticas Avanzadas",
    issueDate: "2024-01-20",
    certificateNumber: "CURSO-2024-002",
    status: "issued",
    template: "T002",
    course: "Matemáticas Avanzadas",
    period: "2024-1",
    issuedBy: "Prof. María González",
    digitalSignature: true,
    downloadCount: 1,
  },
  {
    id: "CERT003",
    studentId: "EST003",
    studentName: "María Fernández",
    studentCode: "2024003",
    type: "conducta",
    title: "Certificado de Buena Conducta",
    description: "Certificado que acredita el excelente comportamiento durante el período académico",
    issueDate: "2024-01-18",
    certificateNumber: "COND-2024-003",
    status: "pending",
    template: "T004",
    period: "2024-1",
    issuedBy: "Coordinación de Convivencia",
    digitalSignature: false,
    downloadCount: 0,
  },
  {
    id: "CERT004",
    studentId: "EST004",
    studentName: "Juan Martínez",
    studentCode: "2024004",
    type: "asistencia",
    title: "Certificado de Asistencia - Feria de Ciencias",
    description: "Certificado de participación en la Feria de Ciencias 2024",
    issueDate: "2024-01-22",
    certificateNumber: "ASIST-2024-004",
    status: "issued",
    template: "T003",
    period: "2024-1",
    issuedBy: "Coordinación de Eventos",
    digitalSignature: true,
    downloadCount: 2,
  },
  {
    id: "CERT005",
    studentId: "EST005",
    studentName: "Laura Sánchez",
    studentCode: "2024005",
    type: "academico",
    title: "Certificado de Excelencia Académica",
    description: "Reconocimiento por obtener el primer puesto en su grado",
    issueDate: "2024-01-25",
    certificateNumber: "ACAD-2024-005",
    status: "draft",
    template: "T005",
    period: "2024-1",
    issuedBy: "Rectoría",
    digitalSignature: false,
    downloadCount: 0,
  },
]

const certificationTypes = [
  {
    value: "bachiller",
    label: "Bachiller",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  { value: "curso", label: "Curso", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  {
    value: "asistencia",
    label: "Asistencia",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  {
    value: "conducta",
    label: "Conducta",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
  { value: "academico", label: "Académico", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
]

export function CertificationsContent() {
  const [certifications, setCertifications] = useState<Certification[]>(mockCertifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingCertification, setViewingCertification] = useState<Certification | null>(null)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)

  const [newCertification, setNewCertification] = useState({
    studentId: "",
    type: "",
    title: "",
    description: "",
    template: "",
    course: "",
    period: "2024-1",
    validUntil: "",
  })

  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || cert.type === selectedType
    const matchesStatus = selectedStatus === "all" || cert.status === selectedStatus
    const matchesPeriod = selectedPeriod === "all" || cert.period === selectedPeriod

    return matchesSearch && matchesType && matchesStatus && matchesPeriod
  })

  const generateCertificateNumber = (type: string) => {
    const prefix = type.toUpperCase().substring(0, 4)
    const year = new Date().getFullYear()
    const sequence = certifications.filter((c) => c.type === type).length + 1
    return `${prefix}-${year}-${sequence.toString().padStart(3, "0")}`
  }

  const resetForm = () => {
    setNewCertification({
      studentId: "",
      type: "",
      title: "",
      description: "",
      template: "",
      course: "",
      period: "2024-1",
      validUntil: "",
    })
  }

  const handleCreateCertification = () => {
    if (newCertification.studentId && newCertification.type && newCertification.title) {
      const student = mockStudents.find((s) => s.id === newCertification.studentId)
      const certification: Certification = {
        id: Date.now().toString(),
        studentId: newCertification.studentId,
        studentName: student?.name || "",
        studentCode: student?.code || "",
        type: newCertification.type as any,
        title: newCertification.title,
        description: newCertification.description,
        issueDate: new Date().toISOString().split("T")[0],
        certificateNumber: generateCertificateNumber(newCertification.type),
        status: "draft",
        template: newCertification.template,
        grade: student?.grade,
        course: newCertification.course,
        period: newCertification.period,
        issuedBy: "Sistema Administrativo",
        validUntil: newCertification.validUntil,
        digitalSignature: false,
        downloadCount: 0,
      }

      setCertifications([...certifications, certification])
      resetForm()
      setIsCreateDialogOpen(false)
    }
  }

  const updateCertificationStatus = (certId: string, status: "issued" | "pending" | "cancelled" | "draft") => {
    setCertifications(
      certifications.map((c) =>
        c.id === certId
          ? {
              ...c,
              status,
              issueDate: status === "issued" ? new Date().toISOString().split("T")[0] : c.issueDate,
              digitalSignature: status === "issued" ? true : c.digitalSignature,
            }
          : c,
      ),
    )
  }

  const handleViewCertification = (cert: Certification) => {
    setViewingCertification(cert)
    setIsViewDialogOpen(true)
  }

  const handleDownloadCertification = (certId: string) => {
    setCertifications(certifications.map((c) => (c.id === certId ? { ...c, downloadCount: c.downloadCount + 1 } : c)))
    // Aquí iría la lógica real de descarga
    console.log("Descargando certificado:", certId)
  }

  const getAvailableTemplates = (type: string) => {
    return mockTemplates.filter((template) => template.type === type && template.isActive)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "issued":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Emitido</Badge>
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendiente</Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      case "draft":
        return <Badge variant="secondary">Borrador</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = certificationTypes.find((t) => t.value === type)
    if (!typeConfig) return <Badge variant="outline">{type}</Badge>

    return <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedType("all")
    setSelectedStatus("all")
    setSelectedPeriod("all")
  }

  const getCertificationStats = () => {
    const total = certifications.length
    const issued = certifications.filter((c) => c.status === "issued").length
    const pending = certifications.filter((c) => c.status === "pending").length
    const draft = certifications.filter((c) => c.status === "draft").length
    const thisMonth = certifications.filter((c) => {
      const certDate = new Date(c.issueDate)
      const now = new Date()
      return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear()
    }).length

    return { total, issued, pending, draft, thisMonth }
  }

  const stats = getCertificationStats()

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificaciones</h1>
          <p className="text-muted-foreground">Gestiona y genera certificados académicos</p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Generar Masivo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generación Masiva de Certificados</DialogTitle>
                <DialogDescription>Genera múltiples certificados de forma simultánea</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Certificado</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Grado</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6°</SelectItem>
                        <SelectItem value="7">7°</SelectItem>
                        <SelectItem value="8">8°</SelectItem>
                        <SelectItem value="9">9°</SelectItem>
                        <SelectItem value="10">10°</SelectItem>
                        <SelectItem value="11">11°</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">Lista de Estudiantes</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecciona los estudiantes para generar certificados
                    </p>
                  </div>
                  <Button className="mt-4">Cargar Lista</Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button>
                  <Award className="mr-2 h-4 w-4" />
                  Generar Certificados
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Certificado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Certificado</DialogTitle>
                <DialogDescription>Completa la información para generar un nuevo certificado</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">Estudiante *</Label>
                    <Select
                      value={newCertification.studentId}
                      onValueChange={(value) => setNewCertification({ ...newCertification, studentId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estudiante" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} - {student.code} ({student.grade}
                            {student.section})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Certificado *</Label>
                    <Select
                      value={newCertification.type}
                      onValueChange={(value) => setNewCertification({ ...newCertification, type: value, template: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título del Certificado *</Label>
                  <Input
                    id="title"
                    value={newCertification.title}
                    onChange={(e) => setNewCertification({ ...newCertification, title: e.target.value })}
                    placeholder="Ej: Certificado de Bachiller Académico"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newCertification.description}
                    onChange={(e) => setNewCertification({ ...newCertification, description: e.target.value })}
                    placeholder="Descripción del certificado y logros obtenidos"
                    rows={3}
                  />
                </div>

                {newCertification.type && (
                  <div className="space-y-2">
                    <Label htmlFor="template">Plantilla *</Label>
                    <Select
                      value={newCertification.template}
                      onValueChange={(value) => setNewCertification({ ...newCertification, template: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTemplates(newCertification.type).map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newCertification.type === "curso" && (
                  <div className="space-y-2">
                    <Label htmlFor="course">Curso</Label>
                    <Input
                      id="course"
                      value={newCertification.course}
                      onChange={(e) => setNewCertification({ ...newCertification, course: e.target.value })}
                      placeholder="Nombre del curso completado"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period">Período Académico</Label>
                    <Select
                      value={newCertification.period}
                      onValueChange={(value) => setNewCertification({ ...newCertification, period: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-1">2024-1</SelectItem>
                        <SelectItem value="2024-2">2024-2</SelectItem>
                        <SelectItem value="2025-1">2025-1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Válido Hasta (Opcional)</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={newCertification.validUntil}
                      onChange={(e) => setNewCertification({ ...newCertification, validUntil: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCertification}>Crear Certificado</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todos los tipos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emitidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.issued}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.issued / stats.total) * 100) : 0}% del total
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
            <p className="text-xs text-muted-foreground">Por procesar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">En edición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">Certificados emitidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Certificado</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Estudiante, código o número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeFilter">Tipo de Certificado</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {certificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusFilter">Estado</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="issued">Emitidos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodFilter">Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  <SelectItem value="2024-1">2024-1</SelectItem>
                  <SelectItem value="2024-2">2024-2</SelectItem>
                  <SelectItem value="2025-1">2025-1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Limpiar
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredCertifications.length} de {certifications.length} certificados
            </p>
            {stats.pending > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                {stats.pending} certificados pendientes de emisión
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contenido Principal */}
      <Tabs defaultValue="certificates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Certificados</CardTitle>
              <CardDescription>Gestiona todos los certificados emitidos y pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Fecha Emisión</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Descargas</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertifications.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono font-medium">{cert.certificateNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cert.studentName}</p>
                            <p className="text-sm text-muted-foreground">
                              {cert.studentCode} - {cert.grade}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(cert.type)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cert.title}</p>
                            {cert.course && <p className="text-sm text-muted-foreground">{cert.course}</p>}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span className="text-sm">{cert.downloadCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="outline" size="sm" onClick={() => handleViewCertification(cert)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            {cert.status === "issued" && (
                              <Button variant="outline" size="sm" onClick={() => handleDownloadCertification(cert.id)}>
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                            {cert.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCertificationStatus(cert.id, "issued")}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            {cert.status === "draft" && (
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => updateCertificationStatus(cert.id, "cancelled")}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Certificados</CardTitle>
              <CardDescription>Gestiona las plantillas disponibles para cada tipo de certificado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mockTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Última modificación: {new Date(template.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(template.type)}
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Plantilla
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Certificados por Tipo</CardTitle>
                <CardDescription>Distribución de certificados emitidos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificationTypes.map((type) => {
                    const typeCount = certifications.filter((c) => c.type === type.value).length
                    const percentage = certifications.length > 0 ? (typeCount / certifications.length) * 100 : 0

                    return (
                      <div key={type.value} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getTypeBadge(type.value)}
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-muted-foreground">{typeCount} certificados</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{Math.round(percentage)}%</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia Mensual</CardTitle>
                <CardDescription>Certificados emitidos en los últimos meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Enero", "Febrero", "Marzo", "Abril", "Mayo"].map((month, index) => {
                    // Simulamos datos para los últimos meses
                    const count = Math.floor(Math.random() * 15) + 3

                    return (
                      <div key={month} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{month} 2024</p>
                            <p className="text-sm text-muted-foreground">Certificados emitidos</p>
                          </div>
                        </div>
                        <Badge variant="default">{count}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Vista de Certificado */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Certificado</DialogTitle>
            <DialogDescription>Información completa del certificado seleccionado</DialogDescription>
          </DialogHeader>
          {viewingCertification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Número de Certificado</Label>
                  <p className="text-sm text-muted-foreground font-mono">{viewingCertification.certificateNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-1">{getStatusBadge(viewingCertification.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Estudiante</Label>
                  <p className="text-sm text-muted-foreground">{viewingCertification.studentName}</p>
                  <p className="text-xs text-muted-foreground">{viewingCertification.studentCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <div className="mt-1">{getTypeBadge(viewingCertification.type)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Título</Label>
                <p className="text-sm text-muted-foreground">{viewingCertification.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Descripción</Label>
                <p className="text-sm text-muted-foreground">{viewingCertification.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Fecha de Emisión</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingCertification.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Período</Label>
                  <p className="text-sm text-muted-foreground">{viewingCertification.period}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Descargas</Label>
                  <p className="text-sm text-muted-foreground">{viewingCertification.downloadCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Emitido por</Label>
                  <p className="text-sm text-muted-foreground">{viewingCertification.issuedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Firma Digital</Label>
                  <p className="text-sm text-muted-foreground">{viewingCertification.digitalSignature ? "Sí" : "No"}</p>
                </div>
              </div>

              {viewingCertification.validUntil && (
                <div>
                  <Label className="text-sm font-medium">Válido hasta</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingCertification.validUntil).toLocaleDateString()}
                  </p>
                </div>
              )}

              {viewingCertification.course && (
                <div>
                  <Label className="text-sm font-medium">Curso</Label>
                  <p className="text-sm text-muted-foreground">{viewingCertification.course}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
            {viewingCertification?.status === "issued" && (
              <Button onClick={() => handleDownloadCertification(viewingCertification.id)}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
