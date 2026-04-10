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
  Bell,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Zap,
  BellRing,
  Archive,
  Star,
  MessageSquare,
} from "lucide-react"

export function NotificationManageContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")

  const notifications = [
    {
      id: 1,
      title: "Reunión de Padres de Familia - Grado 10°",
      type: "info",
      priority: "Alta",
      status: "Enviado",
      author: "Ana García",
      sendDate: "2024-01-15",
      recipients: 45,
      readCount: 38,
      readPercentage: 84,
      channel: "Plataforma + Email",
      expirationDate: "2024-02-15",
      isUrgent: false,
      isPinned: true,
    },
    {
      id: 2,
      title: "Suspensión de Clases por Mantenimiento",
      type: "urgent",
      priority: "Crítica",
      status: "Enviado",
      author: "Carlos Rodríguez",
      sendDate: "2024-01-10",
      recipients: 120,
      readCount: 115,
      readPercentage: 96,
      channel: "Todos los Canales",
      expirationDate: "2024-01-12",
      isUrgent: true,
      isPinned: true,
    },
    {
      id: 3,
      title: "Recordatorio de Pago - Pensión Febrero",
      type: "warning",
      priority: "Media",
      status: "Programado",
      author: "María López",
      sendDate: "2024-01-25",
      recipients: 89,
      readCount: 0,
      readPercentage: 0,
      channel: "Email + SMS",
      expirationDate: "2024-02-28",
      isUrgent: false,
      isPinned: false,
    },
    {
      id: 4,
      title: "Resultados Pruebas Saber 11°",
      type: "success",
      priority: "Media",
      status: "Borrador",
      author: "Juan Martínez",
      sendDate: "",
      recipients: 25,
      readCount: 0,
      readPercentage: 0,
      channel: "Plataforma",
      expirationDate: "",
      isUrgent: false,
      isPinned: false,
    },
    {
      id: 5,
      title: "Protocolo de Bioseguridad Actualizado",
      type: "info",
      priority: "Alta",
      status: "Expirado",
      author: "Laura Hernández",
      sendDate: "2023-12-01",
      recipients: 150,
      readCount: 142,
      readPercentage: 95,
      channel: "Plataforma + Email",
      expirationDate: "2024-01-01",
      isUrgent: false,
      isPinned: false,
    },
  ]

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || notif.type === selectedType
    const matchesStatus = selectedStatus === "all" || notif.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || notif.priority === selectedPriority

    return matchesSearch && matchesType && matchesStatus && matchesPriority
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedType("all")
    setSelectedStatus("all")
    setSelectedPriority("all")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Enviado":
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
      case "Crítica":
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

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "info":
        return { icon: Info, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950" }
      case "warning":
        return { icon: AlertTriangle, color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950" }
      case "success":
        return { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950" }
      case "urgent":
        return { icon: Zap, color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950" }
      default:
        return { icon: Bell, color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-950" }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Enviado":
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gestionar Notificaciones
          </h2>
          <p className="text-muted-foreground">Administra todas las notificaciones enviadas y programadas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Notificación
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Todas
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Enviadas
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Programadas
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Borradores
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Expiradas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Estadísticas */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                    <div className="text-sm text-muted-foreground">Total Notificaciones</div>
                  </div>
                  <Bell className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {notifications.filter((c) => c.status === "Enviado").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Enviadas</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {notifications.filter((c) => c.status === "Programado").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Programadas</div>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(
                        notifications
                          .filter((c) => c.status === "Enviado")
                          .reduce((sum, c) => sum + c.readPercentage, 0) /
                          notifications.filter((c) => c.status === "Enviado").length || 0,
                      )}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">Promedio Lectura</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600 opacity-20" />
                </div>
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
                  <label className="text-sm font-medium mb-2 block">Tipo</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="info">Informativa</SelectItem>
                      <SelectItem value="warning">Advertencia</SelectItem>
                      <SelectItem value="success">Éxito</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
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
                      <SelectItem value="Enviado">Enviado</SelectItem>
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
                      <SelectItem value="Crítica">Crítica</SelectItem>
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

          {/* Tabla de notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>{filteredNotifications.length} notificación(es) encontrada(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notificación</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Destinatarios</TableHead>
                    <TableHead>Efectividad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notif) => {
                    const typeConfig = getTypeConfig(notif.type)
                    return (
                      <TableRow key={notif.id} className={notif.isPinned ? "bg-muted/30" : ""}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                              <typeConfig.icon className={`h-4 w-4 ${typeConfig.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{notif.title}</div>
                                {notif.isPinned && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                                {notif.isUrgent && <Zap className="h-3 w-3 text-red-500" />}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {notif.channel}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${typeConfig.color} border-current`}>
                            {notif.type === "info"
                              ? "Informativa"
                              : notif.type === "warning"
                                ? "Advertencia"
                                : notif.type === "success"
                                  ? "Éxito"
                                  : "Urgente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(notif.status)} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(notif.status)}
                            {notif.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{notif.author}</div>
                            <div className={`text-xs font-medium ${getPriorityColor(notif.priority)}`}>
                              Prioridad: {notif.priority}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="font-medium">{notif.recipients}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {notif.status === "Enviado" ? (
                            <div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span className="font-medium text-green-600">{notif.readPercentage}%</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {notif.readCount}/{notif.recipients} leídos
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {notif.sendDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(notif.sendDate).toLocaleDateString("es-ES")}
                              </div>
                            )}
                            {notif.expirationDate && (
                              <div className="text-xs text-muted-foreground">
                                Expira: {new Date(notif.expirationDate).toLocaleDateString("es-ES")}
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
                              {notif.status === "Borrador" && (
                                <DropdownMenuItem>
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <BellRing className="h-4 w-4 mr-2" />
                                Ver estadísticas
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                {notif.isPinned ? "Desfijar" : "Fijar"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
