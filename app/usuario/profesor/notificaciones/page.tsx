"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, Calendar, BookOpen, Construction, AlertCircle } from "lucide-react"

export default function NotificacionesPage() {
  return (
    <div className="min-w-0 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground">
            Sistema de notificaciones del profesor
          </p>
        </div>
      </div>

      <Card className="border-2 border-dashed border-orange-200 dark:border-orange-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Construction className="h-16 w-16 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Funcionalidad en Desarrollo</CardTitle>
          <CardDescription className="text-base mt-2">
            El sistema de notificaciones está en proceso de implementación.
            Próximamente podrás recibir alertas sobre mensajes, entregas de estudiantes,
            recordatorios de exámenes y más.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <MessageSquare className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Mensajes</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Notificaciones de mensajes de estudiantes
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <BookOpen className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Entregas</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Alertas de tareas y actividades entregadas
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <Calendar className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Recordatorios</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Avisos de exámenes y eventos próximos
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Sistema</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Notificaciones del sistema y calificaciones pendientes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
