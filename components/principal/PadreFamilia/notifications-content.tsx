"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Bell,
    BellRing,
    Check,
    Trash2,
    Settings,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    BookOpen,
    CreditCard,
    Users,
} from "lucide-react"
import { useState } from "react"

interface NotificationsContentProps {
    language: string
    activeStudent: any
}

const notificationsData = [
    {
        id: 1,
        type: "grade",
        title: "Nueva calificación disponible",
        message: "Se ha registrado la calificación del examen de Matemáticas",
        subject: "Matemáticas",
        date: "2024-03-25T10:30:00",
        read: false,
        priority: "normal",
        icon: BookOpen,
    },
    {
        id: 2,
        type: "payment",
        title: "Recordatorio de pago",
        message: "La pensión de abril vence el 5 de abril",
        subject: "Pagos",
        date: "2024-03-24T09:00:00",
        read: false,
        priority: "high",
        icon: CreditCard,
    },
    {
        id: 3,
        type: "event",
        title: "Reunión de padres",
        message: "Reunión programada para el 30 de marzo a las 6:00 PM",
        subject: "Eventos",
        date: "2024-03-23T14:15:00",
        read: true,
        priority: "normal",
        icon: Users,
    },
    {
        id: 4,
        type: "assignment",
        title: "Nueva tarea asignada",
        message: "Tarea de Ciencias Naturales: Proyecto del sistema solar",
        subject: "Ciencias Naturales",
        date: "2024-03-22T16:45:00",
        read: true,
        priority: "normal",
        icon: BookOpen,
    },
    {
        id: 5,
        type: "schedule",
        title: "Cambio de horario",
        message: "La clase de Educación Física del viernes se trasladó a las 10:00 AM",
        subject: "Horarios",
        date: "2024-03-21T11:20:00",
        read: false,
        priority: "normal",
        icon: Calendar,
    },
    {
        id: 6,
        type: "grade",
        title: "Calificación actualizada",
        message: "Se actualizó la calificación del ensayo de Español",
        subject: "Español",
        date: "2024-03-20T13:30:00",
        read: true,
        priority: "low",
        icon: BookOpen,
    },
]

export function NotificationsContent({ language, activeStudent }: NotificationsContentProps) {
    const [notifications, setNotifications] = useState(notificationsData)
    const [filter, setFilter] = useState("all")
    const isSpanish = language === "es"

    const unreadCount = notifications.filter((n) => !n.read).length

    const getNotificationIcon = (type: string, priority: string) => {
        const iconMap = {
            grade: BookOpen,
            payment: CreditCard,
            event: Users,
            assignment: BookOpen,
            schedule: Calendar,
            general: Bell,
        }

        const IconComponent = iconMap[type as keyof typeof iconMap] || Bell

        const colorMap = {
            high: "text-red-500",
            normal: "text-blue-500",
            low: "text-gray-500",
        }

        return { Icon: IconComponent, color: colorMap[priority as keyof typeof colorMap] }
    }

    const getPriorityBadge = (priority: string) => {
        const variants = {
            high: { variant: "destructive" as const, label: isSpanish ? "Alta" : "High" },
            normal: { variant: "default" as const, label: isSpanish ? "Normal" : "Normal" },
            low: { variant: "secondary" as const, label: isSpanish ? "Baja" : "Low" },
        }
        return variants[priority as keyof typeof variants] || variants.normal
    }

    const markAsRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    }

    const deleteNotification = (id: number) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }

    const filteredNotifications = notifications.filter((notification) => {
        if (filter === "all") return true
        if (filter === "unread") return !notification.read
        return notification.type === filter
    })

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) return isSpanish ? "Hace menos de 1 hora" : "Less than 1 hour ago"
        if (diffInHours < 24) return isSpanish ? `Hace ${diffInHours} horas` : `${diffInHours} hours ago`

        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays === 1) return isSpanish ? "Ayer" : "Yesterday"
        if (diffInDays < 7) return isSpanish ? `Hace ${diffInDays} días` : `${diffInDays} days ago`

        return date.toLocaleDateString()
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Bell className="h-8 w-8" />
                        {isSpanish ? "Notificaciones" : "Notifications"}
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {unreadCount}
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSpanish
                            ? `Mantente al día con las actividades de ${activeStudent.firstName}`
                            : `Stay updated with ${activeStudent.firstName}'s activities`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        {isSpanish ? "Configurar" : "Settings"}
                    </Button>
                    {unreadCount > 0 && (
                        <Button onClick={markAllAsRead} size="sm">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {isSpanish ? "Marcar todas como leídas" : "Mark all as read"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Sin Leer" : "Unread"}</CardTitle>
                        <BellRing className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{unreadCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Total" : "Total"}</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notifications.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Prioridad Alta" : "High Priority"}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {notifications.filter((n) => n.priority === "high").length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Hoy" : "Today"}</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                            {
                                notifications.filter((n) => {
                                    const notificationDate = new Date(n.date)
                                    const today = new Date()
                                    return notificationDate.toDateString() === today.toDateString()
                                }).length
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications List */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="all" onClick={() => setFilter("all")}>
                        {isSpanish ? "Todas" : "All"}
                    </TabsTrigger>
                    <TabsTrigger value="unread" onClick={() => setFilter("unread")}>
                        {isSpanish ? "Sin leer" : "Unread"}
                    </TabsTrigger>
                    <TabsTrigger value="grade" onClick={() => setFilter("grade")}>
                        {isSpanish ? "Notas" : "Grades"}
                    </TabsTrigger>
                    <TabsTrigger value="payment" onClick={() => setFilter("payment")}>
                        {isSpanish ? "Pagos" : "Payments"}
                    </TabsTrigger>
                    <TabsTrigger value="event" onClick={() => setFilter("event")}>
                        {isSpanish ? "Eventos" : "Events"}
                    </TabsTrigger>
                    <TabsTrigger value="assignment" onClick={() => setFilter("assignment")}>
                        {isSpanish ? "Tareas" : "Tasks"}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={filter} className="space-y-4">
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {filteredNotifications.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>{isSpanish ? "No hay notificaciones" : "No notifications"}</p>
                                    </div>
                                ) : (
                                    filteredNotifications.map((notification) => {
                                        const { Icon, color } = getNotificationIcon(notification.type, notification.priority)
                                        const priorityBadge = getPriorityBadge(notification.priority)

                                        return (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-accent/50 transition-colors ${!notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2 rounded-full bg-accent ${color}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>

                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className={`font-semibold ${!notification.read ? "text-primary" : ""}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                                            </div>
                                                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {notification.subject}
                                                                </Badge>
                                                                <Badge variant={priorityBadge.variant} className="text-xs">
                                                                    {priorityBadge.label}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {!notification.read && (
                                                                    <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <Button variant="outline" size="sm" onClick={() => deleteNotification(notification.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
