"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, GraduationCap, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock, Bell } from "lucide-react"

export function DashboardContent() {
  const stats = [
    {
      title: "Total Estudiantes",
      value: "1,247",
      change: "+12%",
      icon: GraduationCap,
      color: "text-blue-600",
    },
    {
      title: "Docentes Activos",
      value: "89",
      change: "+3%",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Ingresos del Mes",
      value: "$45,230",
      change: "+8%",
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: "Matrículas Pendientes",
      value: "23",
      change: "-5%",
      icon: TrendingUp,
      color: "text-red-600",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      action: "Nueva matrícula registrada",
      student: "Ana García Pérez",
      time: "Hace 2 horas",
      status: "success",
    },
    {
      id: 2,
      action: "Pago pendiente",
      student: "Carlos Rodríguez",
      time: "Hace 4 horas",
      status: "warning",
    },
    {
      id: 3,
      action: "Certificado generado",
      student: "María López",
      time: "Hace 6 horas",
      status: "success",
    },
    {
      id: 4,
      action: "Solicitud de soporte",
      student: "Juan Martínez",
      time: "Hace 1 día",
      status: "pending",
    },
  ]

  const alerts = [
    {
      id: 1,
      title: "Pagos Vencidos",
      description: "15 estudiantes con pagos vencidos",
      type: "error",
      count: 15,
    },
    {
      id: 2,
      title: "Matrículas por Vencer",
      description: "8 matrículas vencen esta semana",
      type: "warning",
      count: 8,
    },
    {
      id: 3,
      title: "Solicitudes Sin Respuesta",
      description: "5 solicitudes pendientes de respuesta",
      type: "info",
      count: 5,
    },
  ]

  return (
    <div className="space-y-6 absolute w-full">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} desde el mes pasado</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Alertas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${alert.type === "error" ? "bg-red-500" : alert.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
                    }`}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <Badge
                  variant={alert.type === "error" ? "destructive" : alert.type === "warning" ? "secondary" : "default"}
                >
                  {alert.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Acción</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.action}</TableCell>
                    <TableCell>{activity.student}</TableCell>
                    <TableCell className="text-muted-foreground">{activity.time}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          activity.status === "success"
                            ? "default"
                            : activity.status === "warning"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {activity.status === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {activity.status === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {activity.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {activity.status === "success"
                          ? "Completado"
                          : activity.status === "warning"
                            ? "Atención"
                            : "Pendiente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Resumen Académico y Financiero */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen Académico</CardTitle>
            <CardDescription>Estado actual del período académico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso del Semestre</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">94%</div>
                <div className="text-xs text-muted-foreground">Asistencia Promedio</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">8.2</div>
                <div className="text-xs text-muted-foreground">Promedio General</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
            <CardDescription>Estado de pagos y finanzas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$128,450</div>
                <div className="text-xs text-muted-foreground">Ingresos del Mes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">$23,100</div>
                <div className="text-xs text-muted-foreground">Pagos Pendientes</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Estudiantes al Día</span>
                <span className="text-green-600">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
