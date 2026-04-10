"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Phone,
  Mail,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"

export function CoDebtorListContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedGuaranteeType, setSelectedGuaranteeType] = useState("all")
  const [selectedCoDebtor, setSelectedCoDebtor] = useState<any>(null)

  const coDebtors = [
    {
      id: 1,
      name: "Carlos García Martínez",
      document: "12345678",
      student: "Ana García Pérez",
      studentGrade: "10°A",
      relationship: "Padre",
      phone: "300-123-4567",
      email: "carlos.garcia@email.com",
      occupation: "Ingeniero",
      company: "Empresa ABC",
      monthlyIncome: 5000000,
      guaranteeType: "Solidaria",
      guaranteeAmount: 10000000,
      status: "Aprobado",
      creditScore: "A",
      registrationDate: "2024-01-15",
    },
    {
      id: 2,
      name: "María López Rodríguez",
      document: "87654321",
      student: "Carlos Rodríguez López",
      studentGrade: "11°B",
      relationship: "Tía",
      phone: "301-234-5678",
      email: "maria.lopez@email.com",
      occupation: "Contadora",
      company: "Contadores Asociados",
      monthlyIncome: 4200000,
      guaranteeType: "Subsidiaria",
      guaranteeAmount: 8000000,
      status: "En Revisión",
      creditScore: "B",
      registrationDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Juan López Hernández",
      document: "11223344",
      student: "María López Martínez",
      studentGrade: "9°C",
      relationship: "Abuelo",
      phone: "302-345-6789",
      email: "juan.lopez@email.com",
      occupation: "Comerciante",
      company: "Independiente",
      monthlyIncome: 3500000,
      guaranteeType: "Solidaria",
      guaranteeAmount: 6000000,
      status: "Aprobado",
      creditScore: "A",
      registrationDate: "2024-02-10",
    },
    {
      id: 4,
      name: "Pedro Hernández Castro",
      document: "66778899",
      student: "Sofía Hernández Castro",
      studentGrade: "11°A",
      relationship: "Amigo de la familia",
      phone: "304-567-8901",
      email: "pedro.hernandez@email.com",
      occupation: "Empresario",
      company: "Empresa XYZ",
      monthlyIncome: 8000000,
      guaranteeType: "Hipotecaria",
      guaranteeAmount: 15000000,
      status: "Rechazado",
      creditScore: "C",
      registrationDate: "2024-02-15",
    },
  ]

  const filteredCoDebtors = coDebtors.filter((coDebtor) => {
    const matchesSearch =
      coDebtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coDebtor.document.includes(searchTerm) ||
      coDebtor.student.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStudent = selectedStudent === "all" || coDebtor.student === selectedStudent
    const matchesStatus = selectedStatus === "all" || coDebtor.status === selectedStatus
    const matchesGuarantee = selectedGuaranteeType === "all" || coDebtor.guaranteeType === selectedGuaranteeType

    return matchesSearch && matchesStudent && matchesStatus && matchesGuarantee
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedStudent("all")
    setSelectedStatus("all")
    setSelectedGuaranteeType("all")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprobado":
        return "default"
      case "En Revisión":
        return "secondary"
      case "Rechazado":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getCreditScoreColor = (score: string) => {
    switch (score) {
      case "A":
        return "text-green-600"
      case "B":
        return "text-yellow-600"
      case "C":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Listado de Codeudores</h2>
          <p className="text-muted-foreground">Gestiona la información de los codeudores financieros</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Codeudor
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{coDebtors.length}</div>
            <div className="text-sm text-muted-foreground">Total Codeudores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {coDebtors.filter((c) => c.status === "Aprobado").length}
            </div>
            <div className="text-sm text-muted-foreground">Aprobados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {coDebtors.filter((c) => c.status === "En Revisión").length}
            </div>
            <div className="text-sm text-muted-foreground">En Revisión</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ${(coDebtors.reduce((sum, c) => sum + c.guaranteeAmount, 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-muted-foreground">Total Garantías</div>
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
                  <SelectItem value="Sofía Hernández Castro">Sofía Hernández Castro</SelectItem>
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
                  <SelectItem value="Aprobado">Aprobado</SelectItem>
                  <SelectItem value="En Revisión">En Revisión</SelectItem>
                  <SelectItem value="Rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Garantía</label>
              <Select value={selectedGuaranteeType} onValueChange={setSelectedGuaranteeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Solidaria">Solidaria</SelectItem>
                  <SelectItem value="Subsidiaria">Subsidiaria</SelectItem>
                  <SelectItem value="Hipotecaria">Hipotecaria</SelectItem>
                  <SelectItem value="Prendaria">Prendaria</SelectItem>
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

      {/* Tabla de codeudores */}
      <Card>
        <CardHeader>
          <CardTitle>Codeudores Registrados</CardTitle>
          <CardDescription>{filteredCoDebtors.length} codeudor(es) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codeudor</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Información Laboral</TableHead>
                <TableHead>Capacidad Financiera</TableHead>
                <TableHead>Garantía</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoDebtors.map((coDebtor) => (
                <TableRow key={coDebtor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{coDebtor.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {coDebtor.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{coDebtor.document}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{coDebtor.student}</div>
                      <div className="text-xs text-muted-foreground">{coDebtor.studentGrade}</div>
                      <div className="text-xs text-muted-foreground">{coDebtor.relationship}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{coDebtor.occupation}</div>
                      <div className="text-xs text-muted-foreground">{coDebtor.company}</div>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />${(coDebtor.monthlyIncome / 1000000).toFixed(1)}M/mes
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-lg ${getCreditScoreColor(coDebtor.creditScore)}`}>
                        {coDebtor.creditScore}
                      </span>
                      <div className="text-xs">
                        <div>Score crediticio</div>
                        {coDebtor.creditScore === "C" && (
                          <div className="text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Riesgo alto
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">{coDebtor.guaranteeType}</Badge>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />${(coDebtor.guaranteeAmount / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(coDebtor.status)}>{coDebtor.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedCoDebtor(coDebtor)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de perfil del codeudor */}
      {selectedCoDebtor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {selectedCoDebtor.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCoDebtor.name}</h2>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {selectedCoDebtor.document}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {selectedCoDebtor.relationship}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCoDebtor(null)}
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
                  <div className="text-2xl font-bold text-green-600">
                    ${(selectedCoDebtor.monthlyIncome / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-muted-foreground">Ingresos Mensuales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${(selectedCoDebtor.guaranteeAmount / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-muted-foreground">Valor Garantía</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${selectedCoDebtor.creditScore === "A" ? "text-green-600" : selectedCoDebtor.creditScore === "B" ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {selectedCoDebtor.creditScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Score Crediticio</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${selectedCoDebtor.status === "Aprobado" ? "text-green-600" : selectedCoDebtor.status === "En Revisión" ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {selectedCoDebtor.status}
                  </div>
                  <div className="text-sm text-muted-foreground">Estado</div>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Información Personal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Documento</label>
                        <p className="font-medium">{selectedCoDebtor.document}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Parentesco</label>
                        <p className="font-medium">{selectedCoDebtor.relationship}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedCoDebtor.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedCoDebtor.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
                      <p className="font-medium">{selectedCoDebtor.registrationDate}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Información Laboral */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Información Laboral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ocupación</label>
                      <p className="font-medium">{selectedCoDebtor.occupation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                      <p className="font-medium">{selectedCoDebtor.company}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ingresos Mensuales</label>
                      <p className="font-medium text-green-600 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />${selectedCoDebtor.monthlyIncome.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Información del Estudiante */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Estudiante Asociado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nombre del Estudiante</label>
                      <p className="font-medium">{selectedCoDebtor.student}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Grado</label>
                      <p className="font-medium">{selectedCoDebtor.studentGrade}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relación</label>
                      <Badge variant="outline">{selectedCoDebtor.relationship}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Información Financiera */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Información Financiera
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipo de Garantía</label>
                      <Badge variant="outline" className="ml-2">
                        {selectedCoDebtor.guaranteeType}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Valor de Garantía</label>
                      <p className="font-medium text-blue-600 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />${selectedCoDebtor.guaranteeAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Score Crediticio</label>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-2xl ${selectedCoDebtor.creditScore === "A" ? "text-green-600" : selectedCoDebtor.creditScore === "B" ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {selectedCoDebtor.creditScore}
                        </span>
                        {selectedCoDebtor.creditScore === "C" && (
                          <div className="text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Riesgo alto</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado</label>
                      <Badge
                        variant={
                          selectedCoDebtor.status === "Aprobado"
                            ? "default"
                            : selectedCoDebtor.status === "En Revisión"
                              ? "secondary"
                              : "destructive"
                        }
                        className="ml-2"
                      >
                        {selectedCoDebtor.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedCoDebtor(null)}>
                Cerrar
              </Button>
              <Button>
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
