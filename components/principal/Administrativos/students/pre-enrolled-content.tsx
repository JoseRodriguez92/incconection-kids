"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, UserCheck, FileText, Phone, Mail, Calendar, Clock } from "lucide-react"

export function PreEnrolledContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const preEnrolledStudents = [
    {
      id: 1,
      name: "Ana García Pérez",
      document: "1234567890",
      grade: "10°A",
      status: "Documentos Completos",
      preEnrollmentDate: "2024-01-15",
      guardian: "Carlos García",
      phone: "300-123-4567",
      email: "carlos.garcia@email.com",
      pendingDocuments: [],
      daysRemaining: 15,
    },
    {
      id: 2,
      name: "Carlos Rodríguez López",
      document: "0987654321",
      grade: "11°B",
      status: "Documentos Pendientes",
      preEnrollmentDate: "2024-01-20",
      guardian: "María López",
      phone: "301-234-5678",
      email: "maria.lopez@email.com",
      pendingDocuments: ["Certificado médico", "Foto 3x4"],
      daysRemaining: 10,
    },
    {
      id: 3,
      name: "María López Martínez",
      document: "1122334455",
      grade: "9°C",
      status: "Listo para Matrícula",
      preEnrollmentDate: "2024-01-10",
      guardian: "Juan López",
      phone: "302-345-6789",
      email: "juan.lopez@email.com",
      pendingDocuments: [],
      daysRemaining: 20,
    },
    {
      id: 4,
      name: "Juan Martínez Silva",
      document: "5544332211",
      grade: "10°B",
      status: "Documentos Pendientes",
      preEnrollmentDate: "2024-01-25",
      guardian: "Ana Silva",
      phone: "303-456-7890",
      email: "ana.silva@email.com",
      pendingDocuments: ["Certificado de notas"],
      daysRemaining: 5,
    },
  ]

  const filteredStudents = preEnrolledStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.document.includes(searchTerm) ||
      student.guardian.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = selectedGrade === "all" || student.grade === selectedGrade
    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus

    return matchesSearch && matchesGrade && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Listo para Matrícula":
        return "default"
      case "Documentos Completos":
        return "secondary"
      case "Documentos Pendientes":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getDaysRemainingColor = (days: number) => {
    if (days <= 5) return "text-red-600"
    if (days <= 10) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estudiantes Prematriculados</h2>
          <p className="text-muted-foreground">Gestiona los estudiantes en proceso de prematrícula</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Enviar Recordatorios
          </Button>
          <Button size="sm">
            <UserCheck className="h-4 w-4 mr-2" />
            Matricular Seleccionados
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{preEnrolledStudents.length}</div>
            <div className="text-sm text-muted-foreground">Total Prematriculados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {preEnrolledStudents.filter((s) => s.status === "Listo para Matrícula").length}
            </div>
            <div className="text-sm text-muted-foreground">Listos para Matrícula</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {preEnrolledStudents.filter((s) => s.status === "Documentos Completos").length}
            </div>
            <div className="text-sm text-muted-foreground">Documentos Completos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {preEnrolledStudents.filter((s) => s.status === "Documentos Pendientes").length}
            </div>
            <div className="text-sm text-muted-foreground">Documentos Pendientes</div>
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
                  <SelectItem value="Listo para Matrícula">Listo para Matrícula</SelectItem>
                  <SelectItem value="Documentos Completos">Documentos Completos</SelectItem>
                  <SelectItem value="Documentos Pendientes">Documentos Pendientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de prematriculados */}
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes Prematriculados</CardTitle>
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
                <TableHead>Documentos Pendientes</TableHead>
                <TableHead>Tiempo Restante</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Prematrícula: {new Date(student.preEnrollmentDate).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.document}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.grade}</Badge>
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
                    <Badge variant={getStatusColor(student.status)}>{student.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {student.pendingDocuments.length > 0 ? (
                      <div className="space-y-1">
                        {student.pendingDocuments.map((doc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-green-600 text-sm">Completos</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className={`text-sm font-medium ${getDaysRemainingColor(student.daysRemaining)}`}>
                        {student.daysRemaining} días
                      </span>
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
                          <UserCheck className="h-4 w-4 mr-2" />
                          Matricular
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver documentos
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Contactar acudiente
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar recordatorio
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
    </div>
  )
}
