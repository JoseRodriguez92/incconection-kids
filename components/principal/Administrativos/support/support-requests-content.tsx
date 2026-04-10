"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Tag,
  FileText,
  Send,
  Eye,
  Edit,
} from "lucide-react"

// Datos de ejemplo para solicitudes
const mockRequests = [
  {
    id: "SOL-001",
    title: "Error en sistema de notas",
    description: "No puedo acceder al módulo de registro de notas",
    category: "Técnico",
    priority: "Alta",
    status: "Abierto",
    requester: "María González",
    assignedTo: "Soporte TI",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
    responses: 0,
  },
  {
    id: "SOL-002",
    title: "Solicitud de nuevo usuario",
    description: "Necesito crear acceso para nuevo docente",
    category: "Administrativo",
    priority: "Media",
    status: "En Progreso",
    requester: "Carlos Ruiz",
    assignedTo: "Admin Sistema",
    createdAt: "2024-01-14",
    updatedAt: "2024-01-15",
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
    updatedAt: "2024-01-14",
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
    updatedAt: "2024-01-13",
    responses: 3,
  },
]

const categories = ["Técnico", "Académico", "Administrativo", "Capacitación", "Otro"]
const priorities = ["Baja", "Media", "Alta", "Crítica"]
const statuses = ["Abierto", "En Progreso", "Resuelto", "Cerrado"]

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
    case "Abierto":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "En Progreso":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
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
    case "Abierto":
      return <MessageSquare className="h-4 w-4" />
    case "En Progreso":
      return <Clock className="h-4 w-4" />
    case "Resuelto":
      return <CheckCircle className="h-4 w-4" />
    case "Cerrado":
      return <XCircle className="h-4 w-4" />
    default:
      return <MessageSquare className="h-4 w-4" />
  }
}

export function SupportRequestsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // Formulario para nueva solicitud
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Media",
  })

  const filteredRequests = mockRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || request.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || request.priority === selectedPriority

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  const handleCreateRequest = () => {
    console.log("Nueva solicitud:", newRequest)
    setIsCreateDialogOpen(false)
    setNewRequest({ title: "", description: "", category: "", priority: "Media" })
  }

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request)
    setIsViewDialogOpen(true)
  }

  // Estadísticas rápidas
  const stats = {
    total: mockRequests.length,
    open: mockRequests.filter((r) => r.status === "Abierto").length,
    inProgress: mockRequests.filter((r) => r.status === "En Progreso").length,
    resolved: mockRequests.filter((r) => r.status === "Resuelto").length,
    critical: mockRequests.filter((r) => r.priority === "Crítica").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Soporte</h1>
          <p className="text-muted-foreground">Gestiona y crea tickets de soporte técnico</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Solicitud</DialogTitle>
              <DialogDescription>Completa los detalles de tu solicitud de soporte</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Solicitud</Label>
                <Input
                  id="title"
                  placeholder="Describe brevemente el problema"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newRequest.category}
                    onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={newRequest.priority}
                    onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción Detallada</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el problema con el mayor detalle posible..."
                  rows={4}
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateRequest} className="gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Solicitud
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.open}</p>
                <p className="text-sm text-muted-foreground">Abiertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">En Progreso</p>
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
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-sm text-muted-foreground">Críticas</p>
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
                  placeholder="Buscar por título, descripción o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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

      {/* Lista de Solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Activas</CardTitle>
          <CardDescription>{filteredRequests.length} solicitudes encontradas</CardDescription>
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
                  <TableHead>Asignado a</TableHead>
                  <TableHead>Fecha</TableHead>
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
                    <TableCell>{request.assignedTo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {request.createdAt}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewRequest(request)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
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

      {/* Dialog para ver detalles */}
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
                  Solicitud {selectedRequest.id} - Creada el {selectedRequest.createdAt}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estado</Label>
                    <Badge className={getStatusColor(selectedRequest.status)} variant="outline">
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Prioridad</Label>
                    <Badge className={getPriorityColor(selectedRequest.priority)}>{selectedRequest.priority}</Badge>
                  </div>
                </div>
                <div>
                  <Label>Descripción</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedRequest.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Solicitante</Label>
                    <p className="text-sm mt-1">{selectedRequest.requester}</p>
                  </div>
                  <div>
                    <Label>Asignado a</Label>
                    <p className="text-sm mt-1">{selectedRequest.assignedTo}</p>
                  </div>
                </div>
                <div>
                  <Label>Respuestas</Label>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {selectedRequest.responses} respuestas registradas
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
