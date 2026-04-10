"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  Edit,
  UserX,
  User,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Users,
  CreditCard,
  FileText,
  Save,
  X,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function StudentsListContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all")

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  const students = [
    {
      id: 1,
      name: "Ana García Pérez",
      document: "1234567890",
      grade: "10°A",
      status: "Activo",
      paymentStatus: "Al día",
      phone: "300-123-4567",
      email: "ana.garcia@email.com",
      enrollmentDate: "2024-02-15",
      guardian: "Carlos García",
    },
    {
      id: 2,
      name: "Carlos Rodríguez López",
      document: "0987654321",
      grade: "11°B",
      status: "Activo",
      paymentStatus: "Pendiente",
      phone: "301-234-5678",
      email: "carlos.rodriguez@email.com",
      enrollmentDate: "2024-02-10",
      guardian: "María López",
    },
    {
      id: 3,
      name: "María López Martínez",
      document: "1122334455",
      grade: "9°C",
      status: "Activo",
      paymentStatus: "Al día",
      phone: "302-345-6789",
      email: "maria.lopez@email.com",
      enrollmentDate: "2024-02-20",
      guardian: "Juan López",
    },
    {
      id: 4,
      name: "Juan Martínez Silva",
      document: "5544332211",
      grade: "10°B",
      status: "Inactivo",
      paymentStatus: "Vencido",
      phone: "303-456-7890",
      email: "juan.martinez@email.com",
      enrollmentDate: "2024-01-15",
      guardian: "Ana Silva",
    },
    {
      id: 5,
      name: "Sofía Hernández Castro",
      document: "6677889900",
      grade: "11°A",
      status: "Activo",
      paymentStatus: "Al día",
      phone: "304-567-8901",
      email: "sofia.hernandez@email.com",
      enrollmentDate: "2024-02-25",
      guardian: "Pedro Hernández",
    },
  ]

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.document.includes(searchTerm) ||
      student.guardian.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = selectedGrade === "all" || student.grade === selectedGrade
    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus
    const matchesPayment = selectedPaymentStatus === "all" || student.paymentStatus === selectedPaymentStatus

    return matchesSearch && matchesGrade && matchesStatus && matchesPayment
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedGrade("all")
    setSelectedStatus("all")
    setSelectedPaymentStatus("all")
  }

  //@ts-ignore
  const handleViewProfile = (student) => {
    setSelectedStudent(student)
    setShowProfileModal(true)
  }

  //@ts-ignore
  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setShowEditModal(true)
  }
  //@ts-ignore
  const handleDeactivateStudent = (student) => {
    setSelectedStudent(student)
    setShowDeactivateModal(true)
  }

  const handleConfirmDeactivate = () => {
    // Aquí iría la lógica para desactivar el estudiante
    //@ts-ignore
    console.log("Desactivando estudiante:", selectedStudent?.name)
    setShowDeactivateModal(false)
    setSelectedStudent(null)
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lista de Estudiantes</h2>
          <p className="text-muted-foreground">Administra y consulta la información de todos los estudiantes activos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-sm text-muted-foreground">Total Estudiantes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {students.filter((s) => s.status === "Activo").length}
            </div>
            <div className="text-sm text-muted-foreground">Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {students.filter((s) => s.paymentStatus === "Al día").length}
            </div>
            <div className="text-sm text-muted-foreground">Al Día en Pagos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {students.filter((s) => s.paymentStatus === "Vencido").length}
            </div>
            <div className="text-sm text-muted-foreground">Con Deuda</div>
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
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Pagos</label>
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
          <CardTitle>Estudiantes Registrados</CardTitle>
          <CardDescription>{filteredStudents.length} estudiante(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Acudiente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Estado de Pago</TableHead>
                <TableHead>Fecha Matrícula</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
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
                  <TableCell>{student.guardian}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === "Activo" ? "default" : "secondary"}>{student.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.paymentStatus === "Al día"
                          ? "default"
                          : student.paymentStatus === "Pendiente"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {student.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(student.enrollmentDate).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProfile(student)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeactivateStudent(student)}>
                          <UserX className="h-4 w-4 mr-2" />
                          Desactivar
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

      {/* Modal Ver Perfil - Diseño Mejorado */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {selectedStudent?.name?.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">{selectedStudent?.name}</DialogTitle>
                <DialogDescription className="text-base">
                  Estudiante de {selectedStudent?.grade} • ID: {selectedStudent?.document}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Información Personal</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Nombre Completo</Label>
                    <p className="text-sm font-medium">{selectedStudent.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Documento</Label>
                    <p className="text-sm font-medium">{selectedStudent.document}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Estado</Label>
                    <Badge variant={selectedStudent.status === "Activo" ? "default" : "secondary"} className="w-fit">
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Información de Contacto</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {selectedStudent.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Teléfono</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {selectedStudent.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Académica */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Información Académica</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Grado</Label>
                    <Badge variant="outline" className="w-fit">
                      {selectedStudent.grade}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Fecha de Matrícula</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(selectedStudent.enrollmentDate).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Acudiente */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                    Información del Acudiente
                  </h3>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Acudiente Responsable</Label>
                  <p className="text-sm font-medium">{selectedStudent.guardian}</p>
                </div>
              </div>

              {/* Estado Financiero */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Estado Financiero</h3>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Estado de Pago</Label>
                  <Badge
                    variant={
                      selectedStudent.paymentStatus === "Al día"
                        ? "default"
                        : selectedStudent.paymentStatus === "Pendiente"
                          ? "secondary"
                          : "destructive"
                    }
                    className="w-fit"
                  >
                    {selectedStudent.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Editar - Diseño Mejorado */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                <Edit className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Editar Estudiante</DialogTitle>
                <DialogDescription className="text-base">
                  Modifica la información de {selectedStudent?.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Información Personal</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-sm font-medium">
                      Nombre Completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="edit-name"
                        defaultValue={selectedStudent.name}
                        className="pl-10"
                        placeholder="Nombre completo del estudiante"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-document" className="text-sm font-medium">
                      Documento
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="edit-document"
                        defaultValue={selectedStudent.document}
                        className="pl-10"
                        placeholder="Número de documento"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Información de Contacto</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="edit-email"
                        type="email"
                        defaultValue={selectedStudent.email}
                        className="pl-10"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-sm font-medium">
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="edit-phone"
                        defaultValue={selectedStudent.phone}
                        className="pl-10"
                        placeholder="300-123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Académica */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Información Académica</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-grade" className="text-sm font-medium">
                      Grado
                    </Label>
                    <Select defaultValue={selectedStudent.grade}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-status" className="text-sm font-medium">
                      Estado
                    </Label>
                    <Select defaultValue={selectedStudent.status}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Información del Acudiente */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                    Información del Acudiente
                  </h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-guardian" className="text-sm font-medium">
                    Acudiente Responsable
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="edit-guardian"
                      defaultValue={selectedStudent.guardian}
                      className="pl-10"
                      placeholder="Nombre del acudiente"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-6 gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 sm:flex-none">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={() => setShowEditModal(false)} className="flex-1 sm:flex-none">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Desactivar - Diseño Mejorado */}
      <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white">
                <UserX className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-red-900 dark:text-red-100">
                  Desactivar Estudiante
                </DialogTitle>
                <DialogDescription className="text-sm">Esta acción cambiará el estado del estudiante</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">¿Estás seguro?</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Vas a desactivar a <strong>{selectedStudent?.name}</strong>. El estudiante no aparecerá en las
                    listas activas pero se mantendrá su historial académico.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deactivate-reason" className="text-sm font-medium">
                Motivo de desactivación *
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="deactivate-reason"
                  placeholder="Describe el motivo de la desactivación..."
                  className="pl-10 min-h-[80px] resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowDeactivateModal(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeactivate} className="flex-1 sm:flex-none">
              <UserX className="h-4 w-4 mr-2" />
              Confirmar Desactivación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
