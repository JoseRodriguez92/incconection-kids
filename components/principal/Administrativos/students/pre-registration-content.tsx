"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MoreHorizontal, UserPlus, Phone, Mail, Calendar, CheckCircle, X } from "lucide-react"

export function PreRegistrationContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const preRegistrations = [
    {
      id: 1,
      name: "Ana García Pérez",
      document: "1234567890",
      grade: "10°",
      status: "Pendiente Revisión",
      registrationDate: "2024-01-15",
      guardian: "Carlos García",
      phone: "300-123-4567",
      email: "carlos.garcia@email.com",
      priority: "Alta",
      source: "Página Web",
      notes: "Estudiante transferido de otra institución",
    },
    {
      id: 2,
      name: "Carlos Rodríguez López",
      document: "0987654321",
      grade: "11°",
      status: "Aprobado",
      registrationDate: "2024-01-20",
      guardian: "María López",
      phone: "301-234-5678",
      email: "maria.lopez@email.com",
      priority: "Media",
      source: "Referido",
      notes: "Hermano de estudiante actual",
    },
    {
      id: 3,
      name: "María López Martínez",
      document: "1122334455",
      grade: "9°",
      status: "En Entrevista",
      registrationDate: "2024-01-10",
      guardian: "Juan López",
      phone: "302-345-6789",
      email: "juan.lopez@email.com",
      priority: "Alta",
      source: "Visita Directa",
      notes: "Excelente rendimiento académico",
    },
    {
      id: 4,
      name: "Juan Martínez Silva",
      document: "5544332211",
      grade: "10°",
      status: "Rechazado",
      registrationDate: "2024-01-25",
      guardian: "Ana Silva",
      phone: "303-456-7890",
      email: "ana.silva@email.com",
      priority: "Baja",
      source: "Página Web",
      notes: "No cumple con requisitos académicos",
    },
  ]

  const filteredPreRegistrations = preRegistrations.filter((registration) => {
    const matchesSearch =
      registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.document.includes(searchTerm) ||
      registration.guardian.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = selectedGrade === "all" || registration.grade === selectedGrade
    const matchesStatus = selectedStatus === "all" || registration.status === selectedStatus

    return matchesSearch && matchesGrade && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprobado":
        return "default"
      case "En Entrevista":
        return "secondary"
      case "Pendiente Revisión":
        return "outline"
      case "Rechazado":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "text-red-600"
      case "Media":
        return "text-yellow-600"
      case "Baja":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Preinscripciones</h2>
          <p className="text-muted-foreground">Gestiona las solicitudes de preinscripción de nuevos estudiantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Enviar Notificaciones
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Nueva Preinscripción
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas</TabsTrigger>
          <TabsTrigger value="interview">En Entrevista</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Estadísticas */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{preRegistrations.length}</div>
                <div className="text-sm text-muted-foreground">Total Preinscripciones</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {preRegistrations.filter((p) => p.status === "Pendiente Revisión").length}
                </div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {preRegistrations.filter((p) => p.status === "Aprobado").length}
                </div>
                <div className="text-sm text-muted-foreground">Aprobadas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {preRegistrations.filter((p) => p.status === "En Entrevista").length}
                </div>
                <div className="text-sm text-muted-foreground">En Entrevista</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 md:items-end">
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
                      <SelectItem value="9°">9°</SelectItem>
                      <SelectItem value="10°">10°</SelectItem>
                      <SelectItem value="11°">11°</SelectItem>
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
                      <SelectItem value="Pendiente Revisión">Pendiente</SelectItem>
                      <SelectItem value="Aprobado">Aprobado</SelectItem>
                      <SelectItem value="En Entrevista">En Entrevista</SelectItem>
                      <SelectItem value="Rechazado">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de preinscripciones */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Preinscripción</CardTitle>
              <CardDescription>{filteredPreRegistrations.length} solicitud(es) encontrada(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Acudiente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPreRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{registration.name}</div>
                          <div className="text-sm text-muted-foreground">{registration.notes}</div>
                        </div>
                      </TableCell>
                      <TableCell>{registration.document}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{registration.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{registration.guardian}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {registration.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(registration.status)}>{registration.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getPriorityColor(registration.priority)}`}>
                          {registration.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{registration.source}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(registration.registrationDate).toLocaleDateString("es-ES")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aprobar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Programar entrevista
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" />
                              Contactar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar información
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <X className="h-4 w-4 mr-2" />
                              Rechazar
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
