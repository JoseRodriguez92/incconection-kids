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
  Plus,
  MoreHorizontal,
  Download,
  Eye,
  Edit,
  FileText,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  Pause,
} from "lucide-react"
import { User, GraduationCap } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdministrativeListContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedContract, setSelectedContract] = useState("all")

  // Estados para controlar la apertura de los modales
  const [viewProfileOpen, setViewProfileOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)

  const administrativeStaff = [
    {
      id: 1,
      name: "Ana García Pérez",
      document: "1234567890",
      department: "Secretaría Académica",
      position: "Secretario Académico",
      contractType: "Indefinido",
      workload: "Tiempo Completo",
      schedule: "7:00 AM - 3:00 PM",
      status: "Activo",
      hireDate: "2020-02-15",
      phone: "300-123-4567",
      email: "ana.garcia@colegio.edu.co",
      salary: 2800000,
      supervisor: "Rector",
      address: "Dirección del empleado",
      birthDate: "1985-05-12",
      gender: "Femenino", // o "Masculino"
      education: "Título académico",
      university: "Universidad",
      experience: "5 años",
    },
    {
      id: 2,
      name: "Carlos Rodríguez López",
      document: "0987654321",
      department: "Tesorería",
      position: "Tesorero",
      contractType: "Indefinido",
      workload: "Tiempo Completo",
      schedule: "8:00 AM - 4:00 PM",
      status: "Activo",
      hireDate: "2019-01-10",
      phone: "301-234-5678",
      email: "carlos.rodriguez@colegio.edu.co",
      salary: 3200000,
      supervisor: "Rector",
      address: "Dirección del empleado",
      birthDate: "1985-05-12",
      gender: "Masculino", // o "Masculino"
      education: "Título académico",
      university: "Universidad",
      experience: "5 años",
    },
    {
      id: 3,
      name: "María López Martínez",
      document: "1122334455",
      department: "Biblioteca",
      position: "Bibliotecario",
      contractType: "Término Fijo",
      workload: "Tiempo Completo",
      schedule: "7:00 AM - 3:00 PM",
      status: "Activo",
      hireDate: "2022-02-20",
      phone: "302-345-6789",
      email: "maria.lopez@colegio.edu.co",
      salary: 2200000,
      supervisor: "Secretario Académico",
      address: "Dirección del empleado",
      birthDate: "1985-05-12",
      gender: "Femenino", // o "Masculino"
      education: "Título académico",
      university: "Universidad",
      experience: "5 años",
    },
    {
      id: 4,
      name: "Juan Martínez Silva",
      document: "5544332211",
      department: "Mantenimiento",
      position: "Personal de Mantenimiento",
      contractType: "Prestación de Servicios",
      workload: "Tiempo Completo",
      schedule: "6:00 AM - 2:00 PM",
      status: "Activo",
      hireDate: "2023-01-15",
      phone: "303-456-7890",
      email: "juan.martinez@colegio.edu.co",
      salary: 1800000,
      supervisor: "Secretario Académico",
      address: "Dirección del empleado",
      birthDate: "1985-05-12",
      gender: "Masculino", // o "Masculino"
      education: "Título académico",
      university: "Universidad",
      experience: "5 años",
    },
    {
      id: 5,
      name: "Laura Hernández Castro",
      document: "6677889900",
      department: "Psicología",
      position: "Psicólogo",
      contractType: "Indefinido",
      workload: "Medio Tiempo",
      schedule: "8:00 AM - 12:00 PM",
      status: "Licencia",
      hireDate: "2021-03-10",
      phone: "304-567-8901",
      email: "laura.hernandez@colegio.edu.co",
      salary: 2500000,
      supervisor: "Rector",
      address: "Dirección del empleado",
      birthDate: "1985-05-12",
      gender: "Femenino", // o "Masculino"
      education: "Título académico",
      university: "Universidad",
      experience: "5 años",
    },
  ]

  const filteredStaff = administrativeStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.document.includes(searchTerm) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || staff.department === selectedDepartment
    const matchesStatus = selectedStatus === "all" || staff.status === selectedStatus
    const matchesContract = selectedContract === "all" || staff.contractType === selectedContract

    return matchesSearch && matchesDepartment && matchesStatus && matchesContract
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedDepartment("all")
    setSelectedStatus("all")
    setSelectedContract("all")
  }

  //@ts-ignore
  const handleAction = (action, staff) => {
    setSelectedStaff(staff)

    switch (action) {
      case "viewProfile":
        setViewProfileOpen(true)
        break
      case "pauseAdministrative":
        console.log("Pausando administrativo:", staff.name)
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
  //@ts-ignore
  const getInitials = (name) => {

    return name
      .split(" ")
      //@ts-ignore
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personal Administrativo</h2>
          <p className="text-muted-foreground">Gestiona la información del personal administrativo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{administrativeStaff.length}</div>
            <div className="text-sm text-muted-foreground">Total Empleados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {administrativeStaff.filter((s) => s.status === "Activo").length}
            </div>
            <div className="text-sm text-muted-foreground">Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {administrativeStaff.filter((s) => s.contractType === "Indefinido").length}
            </div>
            <div className="text-sm text-muted-foreground">Contrato Indefinido</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(administrativeStaff.map((s) => s.department)).size}
            </div>
            <div className="text-sm text-muted-foreground">Departamentos</div>
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
                  placeholder="Buscar por nombre, documento o cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Departamento</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Rectoría">Rectoría</SelectItem>
                  <SelectItem value="Secretaría Académica">Secretaría Académica</SelectItem>
                  <SelectItem value="Tesorería">Tesorería</SelectItem>
                  <SelectItem value="Biblioteca">Biblioteca</SelectItem>
                  <SelectItem value="Psicología">Psicología</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
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

      {/* Tabla de personal administrativo */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Administrativo</CardTitle>
          <CardDescription>{filteredStaff.length} empleado(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {staff.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{staff.document}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.department}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{staff.position}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {staff.workload}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={staff.contractType === "Indefinido" ? "default" : "outline"}>
                      {staff.contractType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{staff.schedule}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        staff.status === "Activo"
                          ? "default"
                          : staff.status === "Licencia"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction("viewProfile", staff)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("pauseAdministrative", staff)}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar Administrativo
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
      {selectedStaff && (
        <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
          <DialogContent className="max-w-[95vw] w-full lg:max-w-6xl max-h-[90vh] overflow-hidden p-0 m-4 [&>button]:hidden">
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Header del Modal */}
              <div className="relative bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 dark:from-green-700 dark:via-green-800 dark:to-emerald-900 text-white p-4 md:p-6 flex-shrink-0">
                <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
                    {/* Avatar y Info Principal */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 lg:gap-4 w-full lg:w-auto">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl md:text-2xl font-bold border-3 border-white/30">
                          {getInitials(selectedStaff.name)}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${selectedStaff.status === "Activo" ? "bg-green-500" : "bg-red-500"
                            }`}
                        ></div>
                      </div>

                      <div className="text-center sm:text-left flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold mb-2 truncate">{selectedStaff.name}</h2>
                        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mb-2">
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                            {selectedStaff.position}
                          </Badge>
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                            {selectedStaff.contractType}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${selectedStaff.status === "Activo"
                              ? "bg-green-500/20 text-green-100 border-green-300/30"
                              : "bg-red-500/20 text-red-100 border-red-300/30"
                              }`}
                          >
                            {selectedStaff.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 text-xs text-white/90">
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{selectedStaff.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{selectedStaff.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Rápidas */}
                    <div className="w-full lg:w-auto lg:ml-auto">
                      <div className="grid grid-cols-3 gap-2 lg:gap-3 text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-white/20">
                          <div className="text-lg lg:text-xl font-bold">{selectedStaff.experience || "N/A"}</div>
                          <div className="text-xs text-white/80">Experiencia</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-white/20">
                          <div className="text-lg lg:text-xl font-bold">{selectedStaff.department}</div>
                          <div className="text-xs text-white/80">Departamento</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-white/20">
                          <div className="text-lg lg:text-xl font-bold">{selectedStaff.workload}</div>
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
                                  {selectedStaff.document}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Género</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedStaff.gender || "No especificado"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Fecha Nacimiento
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedStaff.birthDate || "No especificado"}
                                </span>
                              </div>
                              <div className="py-1.5">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                  Dirección
                                </span>
                                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 break-words">
                                  {selectedStaff.address || "No especificado"}
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
                                  {selectedStaff.education || "No especificado"}
                                </span>
                              </div>
                              <div className="py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                  Universidad
                                </span>
                                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 break-words">
                                  {selectedStaff.university || "No especificado"}
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
                                  {selectedStaff.experience || "No especificado"}
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
                                <Badge variant="outline" className="text-xs">
                                  {selectedStaff.position}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Departamento
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedStaff.department}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Tipo Contrato
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedStaff.contractType}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Carga Horaria
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedStaff.workload}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Fecha Ingreso
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedStaff.hireDate}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Supervisor</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                  {selectedStaff.supervisor}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Salario</span>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(selectedStaff.salary)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Horario de Trabajo */}
                      <Card className="overflow-hidden shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 p-3">
                          <CardTitle className="text-white flex items-center gap-2 text-base">
                            <Calendar className="h-4 w-4" />
                            Horario de Trabajo
                          </CardTitle>
                        </div>
                        <CardContent className="p-4">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                              {selectedStaff.schedule}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Horario de trabajo asignado</div>
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
                          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No hay observaciones registradas</h3>
                            <p className="text-sm">
                              El historial de eventos aparecerá aquí cuando se registren observaciones.
                            </p>
                          </div>

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
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
                      <FileText className="h-3 w-3" />
                      Contrato
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
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
    </div>
  )
}
