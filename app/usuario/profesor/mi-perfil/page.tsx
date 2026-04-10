"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Mail, Award, Construction, BookOpen } from "lucide-react"

export default function MiPerfilPage() {
  return (
    <div className="min-w-0 space-y-6 p-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Información personal y académica del profesor
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
            La página de perfil del profesor está en proceso de implementación.
            Próximamente podrás gestionar tu información personal, académica y profesional.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <User className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Información Personal</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Gestiona tus datos personales y de contacto
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <Mail className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Contacto</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Email, teléfono y ubicación de oficina
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <Award className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Formación Académica</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Títulos, certificaciones y especialidades
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <BookOpen className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Trayectoria</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Experiencia docente y proyectos académicos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
