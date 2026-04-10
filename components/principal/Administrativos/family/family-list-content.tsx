"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, Eye, Edit, Phone, Mail, Heart, Users, Shield, Download } from "lucide-react"

export function FamilyListContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRelationship, setSelectedRelationship] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState("all")
  const [selectedGuardian, setSelectedGuardian] = useState("all")
  const [selectedFamily, setSelectedFamily] = useState<any>(null)

  const familyMembers = [
    {
      id: 1,
      name: "Carlos García Martínez",
      document: "12345678",
      relationship: "Padre",
      student: "Ana García Pérez",
      studentGrade: "10°A",
      phone: "300-123-4567",
      email: "carlos.garcia@email.com",
      occupation: "Ingeniero",
      company: "Empresa ABC",
      isGuardian: true,
      isEmergencyContact: true,
      address: "Calle 123 #45-67",
    },
    {
      id: 2,
      name: "María López Rodríguez",
      document: "87654321",
      relationship: "Madre",
      student: "Carlos Rodríguez López",
      studentGrade: "11°B",
      phone: "301-234-5678",
      email: "maria.lopez@email.com",
      occupation: "Contadora",
      company: "Contadores Asociados",
      isGuardian: true,
      isEmergencyContact: false,
      address: "Carrera 45 #12-34",
    },
    {
      id: 3,
      name: "Juan López Hernández",
      document: "11223344",
      relationship: "Padre",
      student: "María López Martínez",
      studentGrade: "9°C",
      phone: "302-345-6789",
      email: "juan.lopez@email.com",
      occupation: "Comerciante",
      company: "Independiente",
      isGuardian: true,
      isEmergencyContact: true,
      address: "Avenida 67 #89-12",
    },
    {
      id: 4,
      name: "Ana Silva Pérez",
      document: "55443322",
      relationship: "Madre",
      student: "Juan Martínez Silva",
      studentGrade: "10°B",
      phone: "303-456-7890",
      email: "ana.silva@email.com",
      occupation: "Profesora",
      company: "Colegio Municipal",
      isGuardian: false,
      isEmergencyContact: true,
      address: "Calle 89 #23-45",
    },
    {
      id: 5,
      name: "Pedro Hernández Castro",
      document: "66778899",
      relationship: "Abuelo",
      student: "Sofía Hernández Castro",
      studentGrade: "11°A",
      phone: "304-567-8901",
      email: "pedro.hernandez@email.com",
      occupation: "Pensionado",
      company: "N/A",
      isGuardian: false,
      isEmergencyContact: false,
      address: "Transversal 12 #34-56",
    },
  ]

  const filteredFamilyMembers = familyMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.document.includes(searchTerm) ||
      member.student.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRelationship = selectedRelationship === "all" || member.relationship === selectedRelationship
    const matchesStudent = selectedStudent === "all" || member.student === selectedStudent
    const matchesGuardian =
      selectedGuardian === "all" ||
      (selectedGuardian === "si" && member.isGuardian) ||
      (selectedGuardian === "no" && !member.isGuardian)

    return matchesSearch && matchesRelationship && matchesStudent && matchesGuardian
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedRelationship("all")
    setSelectedStudent("all")
    setSelectedGuardian("all")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Listado de Familiares</h2>
          <p className="text-muted-foreground">Gestiona la información de los familiares de estudiantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Familiar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{familyMembers.length}</div>
            <div className="text-sm text-muted-foreground">Total Familiares</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{familyMembers.filter((f) => f.isGuardian).length}</div>
            <div className="text-sm text-muted-foreground">Acudientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {familyMembers.filter((f) => f.isEmergencyContact).length}
            </div>
            <div className="text-sm text-muted-foreground">Contactos Emergencia</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {familyMembers.filter((f) => f.relationship === "Padre" || f.relationship === "Madre").length}
            </div>
            <div className="text-sm text-muted-foreground">Padres de Familia</div>
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
                  placeholder="Buscar por nombre, documento o estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Parentesco</label>
              <Select value={selectedRelationship} onValueChange={setSelectedRelationship}>
                <SelectTrigger>
                  <SelectValue placeholder="Parentesco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Padre">Padre</SelectItem>
                  <SelectItem value="Madre">Madre</SelectItem>
                  <SelectItem value="Abuelo">Abuelo</SelectItem>
                  <SelectItem value="Abuela">Abuela</SelectItem>
                  <SelectItem value="Tío">Tío</SelectItem>
                  <SelectItem value="Tía">Tía</SelectItem>
                  <SelectItem value="Hermano">Hermano</SelectItem>
                  <SelectItem value="Hermana">Hermana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estudiante</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Estudiante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ana García Pérez">Ana García Pérez</SelectItem>
                  <SelectItem value="Carlos Rodríguez López">Carlos Rodríguez López</SelectItem>
                  <SelectItem value="María López Martínez">María López Martínez</SelectItem>
                  <SelectItem value="Juan Martínez Silva">Juan Martínez Silva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Acudiente</label>
              <Select value={selectedGuardian} onValueChange={setSelectedGuardian}>
                <SelectTrigger>
                  <SelectValue placeholder="Acudiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="si">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
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

      {/* Tabla de familiares */}
      <Card>
        <CardHeader>
          <CardTitle>Familiares Registrados</CardTitle>
          <CardDescription>{filteredFamilyMembers.length} familiar(es) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Familiar</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Parentesco</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Ocupación</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFamilyMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>{member.document}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {member.relationship}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{member.student}</div>
                      <div className="text-xs text-muted-foreground">{member.studentGrade}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{member.occupation}</div>
                      <div className="text-xs text-muted-foreground">{member.company}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {member.isGuardian && (
                        <Badge variant="default" className="text-xs flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Acudiente
                        </Badge>
                      )}
                      {member.isEmergencyContact && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Emergencia
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedFamily(member)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de perfil del familiar */}
      {selectedFamily && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {selectedFamily.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedFamily.name}</h2>
                    <p className="text-purple-100">
                      {selectedFamily.relationship} de {selectedFamily.student}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {selectedFamily.document}
                      </Badge>
                      {selectedFamily.isGuardian && (
                        <Badge variant="secondary" className="bg-green-500/20 text-white border-green-300/30">
                          <Shield className="h-3 w-3 mr-1" />
                          Acudiente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFamily(null)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="p-6 border-b bg-muted/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">1</div>
                  <div className="text-sm text-muted-foreground">Estudiante</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedFamily.isGuardian ? "Sí" : "No"}</div>
                  <div className="text-sm text-muted-foreground">Acudiente</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedFamily.isEmergencyContact ? "Sí" : "No"}
                  </div>
                  <div className="text-sm text-muted-foreground">Emergencia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">Activo</div>
                  <div className="text-sm text-muted-foreground">Estado</div>
                </div>
              </div>
            </div>

            {/* Contenido con tabs */}
            <div className="flex-1 overflow-hidden">
              <div className="border-b">
                <div className="flex">
                  <button className="px-6 py-3 border-b-2 border-purple-500 text-purple-600 font-medium">
                    Información
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[400px]">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Información Personal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Información Personal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Documento:</span>
                        <span className="font-medium">{selectedFamily.document}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parentesco:</span>
                        <Badge variant="outline">{selectedFamily.relationship}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dirección:</span>
                        <span className="font-medium text-right">{selectedFamily.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teléfono:</span>
                        <span className="font-medium">{selectedFamily.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-right">{selectedFamily.email}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información Laboral */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-5 w-5 text-purple-600" />
                        Información Laboral
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ocupación:</span>
                        <span className="font-medium">{selectedFamily.occupation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empresa:</span>
                        <span className="font-medium text-right">{selectedFamily.company}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información del Estudiante */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Estudiante Asociado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nombre:</span>
                        <span className="font-medium">{selectedFamily.student}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Grado:</span>
                        <Badge variant="outline">{selectedFamily.studentGrade}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Roles y Responsabilidades */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        Roles y Responsabilidades
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Acudiente:</span>
                        <Badge variant={selectedFamily.isGuardian ? "default" : "secondary"}>
                          {selectedFamily.isGuardian ? "Sí" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Contacto de Emergencia:</span>
                        <Badge variant={selectedFamily.isEmergencyContact ? "default" : "secondary"}>
                          {selectedFamily.isEmergencyContact ? "Sí" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="border-t p-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedFamily(null)}>
                Cerrar
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Edit className="h-4 w-4 mr-2" />
                Editar Información
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
