"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Send, Search, Filter, MessageSquare, Bell, Pin, Archive } from "lucide-react"

export default function Comunicaciones() {
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<number | null>(null)

  const mensajes = [
    {
      id: 1,
      remitente: "Dr. Carlos Mendoza",
      asunto: "Cambio de fecha para el examen parcial",
      mensaje:
        "Estimados estudiantes, les informo que el examen parcial de Cálculo Diferencial ha sido reprogramado para el día 28 de enero a las 10:00 AM. Por favor, confirmen su asistencia.",
      fecha: "2024-01-15 14:30",
      leido: false,
      curso: "Cálculo Diferencial",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      remitente: "Ing. Ana López",
      asunto: "Recordatorio: Entrega del proyecto final",
      mensaje:
        "Hola María, te recuerdo que la fecha límite para la entrega del proyecto final de Programación Web es el 25 de enero. Si tienes alguna duda, no dudes en contactarme.",
      fecha: "2024-01-14 16:45",
      leido: false,
      curso: "Programación Web",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      remitente: "Secretaría Académica",
      asunto: "Proceso de matrícula semestre 2024-2",
      mensaje:
        "Cordial saludo. Les informamos que el proceso de matrícula para el semestre 2024-2 iniciará el 1 de febrero. Revisen los prerrequisitos y horarios disponibles.",
      fecha: "2024-01-13 09:15",
      leido: true,
      curso: "General",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      remitente: "Msc. Roberto Silva",
      asunto: "Material adicional - Normalización de BD",
      mensaje:
        "Estimados estudiantes, he subido material adicional sobre normalización de bases de datos al aula virtual. Les recomiendo revisarlo antes de la próxima clase.",
      fecha: "2024-01-12 11:20",
      leido: true,
      curso: "Base de Datos",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const anuncios = [
    {
      id: 1,
      titulo: "Suspensión de clases - Día de la Independencia",
      contenido:
        "Se informa a toda la comunidad académica que las clases del 20 de julio están suspendidas por celebración del Día de la Independencia.",
      fecha: "2024-01-10",
      tipo: "general",
      autor: "Rectoría",
    },
    {
      id: 2,
      titulo: "Nueva fecha para laboratorio de Programación",
      contenido:
        "El laboratorio de Programación Web del grupo B se realizará el viernes 19 de enero en el Lab 301 a las 2:00 PM.",
      fecha: "2024-01-12",
      tipo: "curso",
      autor: "Ing. Ana López",
      curso: "Programación Web",
    },
    {
      id: 3,
      titulo: "Convocatoria: Semillero de Investigación",
      contenido:
        "Abierta la convocatoria para participar en el semillero de investigación en Inteligencia Artificial. Inscripciones hasta el 30 de enero.",
      fecha: "2024-01-08",
      tipo: "general",
      autor: "Coordinación de Investigación",
    },
  ]

  const mensajeDetalle = mensajes.find((m) => m.id === mensajeSeleccionado)

  if (mensajeSeleccionado && mensajeDetalle) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Button variant="ghost" size="sm" onClick={() => setMensajeSeleccionado(null)} className="p-0 h-auto">
                    Comunicaciones
                  </Button>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>Mensaje</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setMensajeSeleccionado(null)}>
              ← Volver
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={mensajeDetalle.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {mensajeDetalle.remitente
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold">{mensajeDetalle.asunto}</h2>
                    <p className="text-muted-foreground">De: {mensajeDetalle.remitente}</p>
                    <p className="text-sm text-muted-foreground">{mensajeDetalle.fecha}</p>
                    <Badge variant="outline">{mensajeDetalle.curso}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archivar
                  </Button>
                  <Button variant="outline" size="sm">
                    Responder
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{mensajeDetalle.mensaje}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Asunto" defaultValue={`Re: ${mensajeDetalle.asunto}`} />
              <Textarea placeholder="Escribe tu respuesta aquí..." className="min-h-[120px]" />
              <div className="flex justify-end gap-2">
                <Button variant="outline">Guardar borrador</Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Comunicaciones</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Tabs defaultValue="mensajes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mensajes" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Mensajes
            </TabsTrigger>
            <TabsTrigger value="anuncios" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Anuncios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mensajes" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar mensajes..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Nuevo mensaje
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bandeja de entrada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${!mensaje.leido ? "bg-blue-50 border-blue-200" : ""}`}
                    onClick={() => setMensajeSeleccionado(mensaje.id)}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={mensaje.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {mensaje.remitente
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${!mensaje.leido ? "font-bold" : ""}`}>{mensaje.remitente}</h4>
                          <span className="text-sm text-muted-foreground">{mensaje.fecha}</span>
                        </div>
                        <h5 className={`text-sm ${!mensaje.leido ? "font-semibold" : ""}`}>{mensaje.asunto}</h5>
                        <p className="text-sm text-muted-foreground line-clamp-2">{mensaje.mensaje}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {mensaje.curso}
                          </Badge>
                          {!mensaje.leido && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anuncios" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar anuncios..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar por curso
              </Button>
            </div>

            <div className="grid gap-4">
              {anuncios.map((anuncio) => (
                <Card key={anuncio.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{anuncio.titulo}</h3>
                          {anuncio.tipo === "general" && (
                            <Badge variant="default">
                              <Bell className="h-3 w-3 mr-1" />
                              General
                            </Badge>
                          )}
                          {anuncio.tipo === "curso" && (
                            <Badge variant="secondary">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {anuncio.curso}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Por {anuncio.autor} • {anuncio.fecha}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Pin className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{anuncio.contenido}</p>
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
