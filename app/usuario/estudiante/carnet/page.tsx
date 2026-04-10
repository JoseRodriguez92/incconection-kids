"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, QrCode, Shield, Calendar, MapPin, Phone, Mail } from "lucide-react"

export default function CarnetPage() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Panel Principal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Carnet Universitario</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Carnet Universitario Digital</h1>
          <p className="text-gray-600 mt-2">Tu identificación oficial como estudiante</p>
        </div>

        {/* Carnet Digital */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-2xl">
            <CardContent className="p-6">
              {/* Logo y Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
                <h2 className="text-lg font-bold tracking-wide">UNIVERSIDAD TECNOLÓGICA</h2>
                <p className="text-sm font-medium mt-1 opacity-90">CARNET ESTUDIANTIL</p>
              </div>

              {/* Foto del Estudiante */}
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24 border-4 border-white/30">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="María González" />
                  <AvatarFallback className="bg-blue-500 text-white text-xl">MG</AvatarFallback>
                </Avatar>
              </div>

              {/* Nombre del Estudiante */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold tracking-wide">MARÍA GONZÁLEZ</h3>
              </div>

              {/* Información Principal */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm font-medium opacity-90">Educación Física</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium opacity-90">6 semestre</p>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg">A+</p>
                  <p className="opacity-75">Tipo de Sangre</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">2021-0156789</p>
                  <p className="opacity-75">Código ID</p>
                </div>
              </div>

              {/* Año Lectivo */}
              <div className="text-center mb-4">
                <p className="text-lg font-bold">Año Lectivo 2024</p>
              </div>

              {/* Código QR */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-2 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <QrCode className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs opacity-75">
                <p>Válido hasta: Diciembre 2025</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información de Contacto */}
        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Contacto
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Email Institucional</p>
                      <p className="text-sm text-gray-600">maria.gonzalez@universidad.edu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Teléfono</p>
                      <p className="text-sm text-gray-600">+57 300 123 4567</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Dirección</p>
                      <p className="text-sm text-gray-600">Calle 123 #45-67, Bogotá</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Nacimiento</p>
                      <p className="text-sm text-gray-600">15 de Marzo, 2000</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones */}
        <div className="flex justify-center gap-4 mt-6">
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Descargar PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <QrCode className="h-4 w-4" />
            Mostrar QR
          </Button>
        </div>

        {/* Información Importante */}
        <Card className="mt-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-orange-800 mb-2">Información Importante</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• El carnet debe portarse en todo momento dentro del campus</li>
              <li>• En caso de pérdida, reportar inmediatamente a la oficina de registro</li>
              <li>• El carnet digital tiene la misma validez que el físico</li>
              <li>• Válido para acceso a biblioteca, laboratorios y servicios estudiantiles</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
