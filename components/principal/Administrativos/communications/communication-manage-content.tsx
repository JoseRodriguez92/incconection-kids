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
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Download,
  Eye,
  Edit,
  Send,
  Trash2,
  MessageSquare,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

export function CommunicationManageContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")

  const communications = [
    {
      id: 1,
      title: "Reunión de Padres de Familia - Grado 10°",
      category: "Eventos",
      priority: "Alta",
      status: "Publicado",
      author: "Ana García",
      publishDate: "2024-01-15",
      recipients: 45,
      readCount: 38,
      readPercentage: 84,
      channel: "Plataforma + Email",
      expirationDate: "2024-02-15",
    },
    {
      id: 2,
      title: "Suspensión de Clases por Mantenimiento",
      category: "Administrativo",
      priority: "Urgente",
      status: "Publicado",
      author: "Carlos Rodríguez",
      publishDate: "2024-01-10",
      recipients: 120,
      readCount: 115,
      readPercentage: 96,
      channel: "Plataforma + Email + SMS",
      expirationDate: "2024-01-12",
    },
    {
      id: 3,
      title: "Recordatorio de Pago - Pensión Febrero",
      category: "Financiero",
      priority: "Media",
      status: "Programado",
      author: "María López",
      publishDate: "2024-01-25",
      recipients: 89,
      readCount: 0,
      readPercentage: 0,
      channel: "Email",
      expirationDate: "2024-02-28",
    },
    {
      id: 4,
      title: "Resultados Pruebas Saber 11°",
      category: "Académico",
      priority: "Media",
      status: "Borrador",
      author: "Juan Martínez",
      publishDate: "",
      recipients: 25,
      readCount: 0,
      readPercentage: 0,
      channel: "Plataforma",
      expirationDate: "",
    },
    {
      id: 5,
      title: "Protocolo de Bioseguridad Actualizado",
      category: "General",
      priority: "Alta",
      status: "Expirado",
      author: "Laura Hernández",
      publishDate: "2023-12-01",
      recipients: 150,
      readCount: 142,
      readPercentage: 95,
      channel: "Plataforma + Email",
      expirationDate: "2024-01-01",
    },
  ]

  const filteredCommunications = communications.filter((comm) => {
    const matchesSearch =
      comm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || comm.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || comm.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || comm.priority === selectedPriority

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSelectedPriority("all")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Publicado":
        return "default"
      case "Programado":
        return "secondary"
      case "Borrador":
        return "outline"
      case "Expirado":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgente":
        return "text-red-600"
      case "Alta":
        return "text-orange-600"
      case "Media":
        return "text-yellow-600"
      case "Baja":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Publicado":
        return <CheckCircle className="h-3 w-3" />
      case "Programado":
        return <Clock className="h-3 w-3" />
      case "Borrador":
        return <Edit className="h-3 w-3" />
      case "Expirado":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestionar Comunicados</h2>
          <p className="text-muted-foreground">Administra todos los comunicados enviados y programados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Comunicado
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="published">Publicados</TabsTrigger>
          <TabsTrigger value="scheduled">Programados</TabsTrigger>
          <TabsTrigger value="drafts">Borradores</TabsTrigger>
          <TabsTrigger value="expired">Expirados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Estadísticas */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{communications.length}</div>
                <div className="text-sm text-muted-foreground">Total Comunicados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {communications.filter((c) => c.status === "Publicado").length}
                </div>
                <div className="text-sm text-muted-foreground">Publicados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {communications.filter((c) => c.status === "Programado").length}
                </div>
                <div className="text-sm text-muted-foreground">Programados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    communications
                      .filter((c) => c.status === "Publicado")
                      .reduce((sum, c) => sum + c.readPercentage, 0) /
                      communications.filter((c) => c.status === "Publicado").length || 0,
                  )}
                  %
                </div>
                <div className="text-sm text-muted-foreground">Promedio Lectura</div>
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
                      placeholder="Buscar por título o autor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoría</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Académico">Académico</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Eventos">Eventos</SelectItem>
                      <SelectItem value="Financiero">Financiero</SelectItem>
                      <SelectItem value="General">General</SelectItem>
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
                      <SelectItem value="Publicado">Publicado</SelectItem>
                      <SelectItem value="Programado">Programado</SelectItem>
                      <SelectItem value="Borrador">Borrador</SelectItem>
                      <SelectItem value="Expirado">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Prioridad</label>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Baja">Baja</SelectItem>
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

          {/* Tabla de comunicados */}
          <Card>
            <CardHeader>
              <CardTitle>Comunicados</CardTitle>
              <CardDescription>{filteredCommunications.length} comunicado(s) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comunicado</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Destinatarios</TableHead>
                    <TableHead>Efectividad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommunications.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{comm.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {comm.channel}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{comm.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(comm.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(comm.status)}
                          {comm.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{comm.author}</div>
                          <div className={`text-xs font-medium ${getPriorityColor(comm.priority)}`}>
                            Prioridad: {comm.priority}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="font-medium">{comm.recipients}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {comm.status === "Publicado" ? (
                          <div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="font-medium text-green-600">{comm.readPercentage}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {comm.readCount}/{comm.recipients} leídos
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {comm.publishDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(comm.publishDate).toLocaleDateString("es-ES")}
                            </div>
                          )}
                          {comm.expirationDate && (
                            <div className="text-xs text-muted-foreground">
                              Expira: {new Date(comm.expirationDate).toLocaleDateString("es-ES")}
                            </div>
                          )}
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
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {comm.status === "Borrador" && (
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Publicar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              Ver estadísticas
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
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
