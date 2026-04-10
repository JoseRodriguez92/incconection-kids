"use client"

import { useState } from "react"
import { Bell, Check, Clock, AlertCircle, Info, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  date: string
  time: string
  read: boolean
  category: "academico" | "financiero" | "general"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Calificación Disponible",
    message: "Tu calificación para el examen de Anatomía Humana ya está disponible.",
    type: "success",
    date: "2024-01-15",
    time: "10:30 AM",
    read: false,
    category: "academico",
  },
  {
    id: "2",
    title: "Pago Pendiente",
    message: "Tienes un pago pendiente de matrícula por $450.000. Vence el 20 de enero.",
    type: "warning",
    date: "2024-01-14",
    time: "2:15 PM",
    read: false,
    category: "financiero",
  },
  {
    id: "3",
    title: "Inscripción de Materias",
    message: "El período de inscripción para el próximo semestre inicia el 25 de enero.",
    type: "info",
    date: "2024-01-13",
    time: "9:00 AM",
    read: true,
    category: "academico",
  },
  {
    id: "4",
    title: "Evento Deportivo",
    message: "Torneo interuniversitario de fútbol. Inscripciones abiertas hasta el 18 de enero.",
    type: "info",
    date: "2024-01-12",
    time: "4:45 PM",
    read: true,
    category: "general",
  },
  {
    id: "5",
    title: "Comprobante Aprobado",
    message: "Tu comprobante de pago ha sido aprobado y procesado exitosamente.",
    type: "success",
    date: "2024-01-11",
    time: "11:20 AM",
    read: true,
    category: "financiero",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState("todas")

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "error":
        return <X className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "success":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Éxito
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Importante
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Información
          </Badge>
        )
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const filterNotifications = (category: string) => {
    if (category === "todas") return notifications
    return notifications.filter((notif) => notif.category === category)
  }

  const unreadCount = notifications.filter((notif) => !notif.read).length

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Panel Principal</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Notificaciones</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notificaciones</h1>
              <p className="text-gray-600">
                {unreadCount > 0
                  ? `Tienes ${unreadCount} notificaciones sin leer`
                  : "Todas las notificaciones están al día"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Sin Leer</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Leídas</p>
                  <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Importantes</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter((n) => n.type === "warning" || n.type === "error").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="academico">Académicas</TabsTrigger>
            <TabsTrigger value="financiero">Financieras</TabsTrigger>
            <TabsTrigger value="general">Generales</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-4">
            <div className="space-y-4">
              {filterNotifications("todas").map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${!notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            {getNotificationBadge(notification.type)}
                            <span className="text-xs text-gray-500">
                              {notification.date} • {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="academico" className="space-y-4">
            <div className="space-y-4">
              {filterNotifications("academico").map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${!notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            {getNotificationBadge(notification.type)}
                            <span className="text-xs text-gray-500">
                              {notification.date} • {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="financiero" className="space-y-4">
            <div className="space-y-4">
              {filterNotifications("financiero").map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${!notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            {getNotificationBadge(notification.type)}
                            <span className="text-xs text-gray-500">
                              {notification.date} • {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              {filterNotifications("general").map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${!notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            {getNotificationBadge(notification.type)}
                            <span className="text-xs text-gray-500">
                              {notification.date} • {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
