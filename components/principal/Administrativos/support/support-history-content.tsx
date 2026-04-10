"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Tag,
  FileText,
  Eye,
  Download,
  BarChart3,
  TrendingUp,
} from "lucide-react"

// Datos de ejemplo para historial completo
const mockHistoryRequests = [
  {
    id: "SOL-001",
    title: "Error en sistema de notas",
    description: "No puedo acceder al módulo de registro de notas",
    category: "Técnico",
    priority: "Alta",
    status: "Resuelto",
    requester: "María González",
    assignedTo: "Soporte TI",
    createdAt: "2024-01-15",
    resolvedAt: "2024-01-16",
    resolutionTime: "1 día",
    satisfaction: 5,
    responses: 3,
  },
  {
    id: "SOL-002",
    title: "Solicitud de nuevo usuario",
    description: "Necesito crear acceso para nuevo docente",
    category: "Administrativo",
    priority: "Media",
    status: "Cerrado",
    requester: "Carlos Ruiz",
    assignedTo: "Admin Sistema",
    createdAt: "2024-01-14",
    resolvedAt: "2024-01-15",
    resolutionTime: "1 día",
    satisfaction: 4,
    responses: 2,
  },
  {
    id: "SOL-003",
    title: "Problema con certificados",
    description: "Los certificados no se generan correctamente",
    category: "Académico",
    priority: "Crítica",
    status: "Resuelto",
    requester: "Ana Martínez",
    assignedTo: "Soporte Académico",
    createdAt: "2024-01-13",
    resolvedAt: "2024-01-14",
    resolutionTime: "1 día",
    satisfaction: 5,
    responses: 5,
  },
  {
    id: "SOL-004",
    title: "Capacitación en nuevo módulo",
    description: "Solicito capacitación para el módulo de tesorería",
    category: "Capacitación",
    priority: "Baja",
    status: "Cerrado",
    requester: "Luis Pérez",
    assignedTo: "Capacitación",
    createdAt: "2024-01-12",
    resolvedAt: "2024-01-13",
    resolutionTime: "1 día",
    satisfaction: 4,
    responses: 3,
  },
  {
    id: "SOL-005",
    title: "Error de conexión a base de datos",
    description: "Sistema presenta intermitencias en la conexión",
    category: "Técnico",
    priority: "Crítica",
    status: "Resuelto",
    requester: "Sistema Automático",
    assignedTo: "Soporte TI",
    createdAt: "2024-01-11",
    resolvedAt: "2024-01-11",
    resolutionTime: "4 horas",
    satisfaction: 5,
    responses: 1,
  },
  {
    id: "SOL-006",
    title: "Actualización de datos personales",
    description: "Necesito actualizar mi información de contacto",
    category: "Administrativo",
    priority: "Baja",
    status: "Cerrado",
    requester: "Patricia Silva",
    assignedTo: "RRHH",
    createdAt: "2024-01-10",
    resolvedAt: "2024-01-11",
    resolutionTime: "1 día",
    satisfaction: 3,
    responses: 2,
  },
]

const categories = ["Técnico", "Académico", "Administrativo", "Capacitación", "Otro"]
const priorities = ["Baja", "Media", "Alta", "Crítica"]
const statuses = ["Resuelto", "Cerrado"]
const timeRanges = ["Última semana", "Último mes", "Últimos 3 meses", "Último año", "Todo"]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Crítica":
      return "bg-red-100 text-red-800 border-red-200"
    case "Alta":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "Media":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Baja":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Resuelto":
      return "bg-green-100 text-green-800 border-green-200"
    case "Cerrado":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Resuelto":
      return <CheckCircle className="h-4 w-4" />
    case "Cerrado":
      return <XCircle className="h-4 w-4" />
    default:
      return <CheckCircle className="h-4 w-4" />
  }
}

const getSatisfactionColor = (rating: number) => {
  if (rating >= 4) return "text-green-600"
  if (rating >= 3) return "text-yellow-600"
  return "text-red-600"
}

export function SupportHistoryContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredRequests = mockHistoryRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || request.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || request.priority === selectedPriority

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request)
    setIsViewDialogOpen(true)
  }

  // Estadísticas del historial
  const stats = {
    total: mockHistoryRequests.length,
    resolved: mockHistoryRequests.filter((r) => r.status === "Resuelto").length,
    closed: mockHistoryRequests.filter((r) => r.status === "Cerrado").length,
    avgSatisfaction: (
      mockHistoryRequests.reduce((acc, r) => acc + r.satisfaction, 0) / mockHistoryRequests.length
    ).toFixed(1),
    avgResolutionTime: "1.2 días",
    criticalResolved: mockHistoryRequests.filter((r) => r.priority === "Crítica" && r.status === "Resuelto").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Soporte</h1>
          <p className="text-muted-foreground">Consulta el historial completo de solicitudes resueltas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </Button>
        </div>
      </div>

      {/* Estadísticas del Historial */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resueltas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{stats.closed}</p>
                <p className="text-sm text-muted-foreground">Cerradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.avgSatisfaction}</p>
                <p className="text-sm text-muted-foreground">Satisfacción</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.avgResolutionTime}</p>
                <p className="text-sm text-muted-foreground">Tiempo Prom.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.criticalResolved}</p>
                <p className="text-sm text-muted-foreground">Críticas OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en historial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el historial</SelectItem>
                {timeRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Completo</CardTitle>
          <CardDescription>{filteredRequests.length} solicitudes en el historial</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Tiempo Resolución</TableHead>
                  <TableHead>Satisfacción</TableHead>
                  <TableHead>Fecha Resolución</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{request.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {request.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)} variant="outline">
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {request.requester}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{request.resolutionTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${getSatisfactionColor(request.satisfaction)}`}>
                          {"★".repeat(request.satisfaction)}
                          {"☆".repeat(5 - request.satisfaction)}
                        </span>
                        <span className="text-xs text-muted-foreground">({request.satisfaction}/5)</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {request.resolvedAt}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewRequest(request)}>
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

      {/* Dialog para ver detalles del historial */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.title}
                </DialogTitle>
                <DialogDescription>
                  Solicitud {selectedRequest.id} - Resuelta el {selectedRequest.resolvedAt}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge className={getStatusColor(selectedRequest.status)} variant="outline">
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prioridad</p>
                    <Badge className={getPriorityColor(selectedRequest.priority)}>{selectedRequest.priority}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                    <Badge variant="outline">{selectedRequest.category}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Descripción</p>
                  <p className="text-sm p-3 bg-muted rounded-md">{selectedRequest.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Solicitante</p>
                    <p className="text-sm mt-1">{selectedRequest.requester}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Asignado a</p>
                    <p className="text-sm mt-1">{selectedRequest.assignedTo}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tiempo de Resolución</p>
                    <p className="text-sm mt-1 font-medium">{selectedRequest.resolutionTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Respuestas</p>
                    <p className="text-sm mt-1">{selectedRequest.responses} intercambios</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Satisfacción</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-sm font-medium ${getSatisfactionColor(selectedRequest.satisfaction)}`}>
                        {"★".repeat(selectedRequest.satisfaction)}
                        {"☆".repeat(5 - selectedRequest.satisfaction)}
                      </span>
                      <span className="text-xs text-muted-foreground">({selectedRequest.satisfaction}/5)</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
