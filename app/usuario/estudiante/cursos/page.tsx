"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  MessageSquare,
  Play,
  ArrowLeft,
  BarChart3,
  Calendar,
  Award,
  Target,
  Download,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Cursos() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null)
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState<{
    tipo: string
    titulo: string
    url?: string
    duracion?: string
    tamaño?: string
  } | null>(null)

  const cursos = [
    {
      id: 1,
      nombre: "Anatomía Humana",
      profesor: "Dr. Carlos Mendoza",
      grupo: "Grupo A - Mañana",
      progreso: 75,
      estudiantes: 45,
      color: "bg-red-500",
      imagen: "/placeholder.svg?height=200&width=300&text=Anatomía+Humana",
    },
    {
      id: 2,
      nombre: "Fisiología del Ejercicio",
      profesor: "Lic. Ana López",
      grupo: "Grupo B - Tarde",
      progreso: 60,
      estudiantes: 38,
      color: "bg-green-500",
      imagen: "/placeholder.svg?height=200&width=300&text=Fisiología+Ejercicio",
    },
    {
      id: 3,
      nombre: "Biomecánica Deportiva",
      profesor: "Msc. Roberto Silva",
      grupo: "Grupo A - Mañana",
      progreso: 85,
      estudiantes: 42,
      color: "bg-purple-500",
      imagen: "/placeholder.svg?height=200&width=300&text=Biomecánica+Deportiva",
    },
  ]

  const contenidoCurso = {
    contenido: [
      {
        tipo: "video",
        titulo: "Introducción al Sistema Muscular",
        duracion: "45 min",
        completado: true,
      },
      {
        tipo: "documento",
        titulo: "Guía de Anatomía - Capítulo 3",
        tamaño: "2.5 MB",
        completado: true,
      },
      {
        tipo: "video",
        titulo: "Fisiología del Movimiento",
        duracion: "38 min",
        completado: false,
      },
    ],
    actividades: [
      {
        titulo: "Evaluación Práctica - Músculos",
        fechaEntrega: "2024-01-20",
        estado: "entregado",
        calificacion: 4.2,
      },
      {
        titulo: "Examen Parcial 2",
        fechaEntrega: "2024-01-28",
        estado: "pendiente",
        calificacion: null,
      },
      {
        titulo: "Proyecto Final - Plan de Entrenamiento",
        fechaEntrega: "2024-02-15",
        estado: "no_iniciado",
        calificacion: null,
      },
    ],
    calificaciones: [
      {
        actividad: "Quiz 1 - Anatomía Básica",
        nota: 4.5,
        fecha: "2024-01-05",
        peso: "10%",
      },
      {
        actividad: "Evaluación Práctica 1",
        nota: 4.2,
        fecha: "2024-01-12",
        peso: "15%",
      },
      {
        actividad: "Parcial 1 - Sistema Óseo",
        nota: 3.8,
        fecha: "2024-01-18",
        peso: "25%",
      },
    ],
    foros: [
      {
        titulo: "Dudas sobre el sistema cardiovascular",
        autor: "Carlos Ruiz",
        respuestas: 12,
        ultimaActividad: "Hace 2 horas",
      },
      {
        titulo: "Ejercicios adicionales - Capítulo 3",
        autor: "Dr. Carlos Mendoza",
        respuestas: 8,
        ultimaActividad: "Hace 1 día",
      },
    ],
  }

  if (cursoSeleccionado) {
    const curso = cursos.find((c) => c.id === cursoSeleccionado)

    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Button variant="ghost" size="sm" onClick={() => setCursoSeleccionado(null)} className="p-0 h-auto">
                    Mis Cursos
                  </Button>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>{curso?.nombre}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setCursoSeleccionado(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{curso?.nombre}</h1>
              <p className="text-muted-foreground">
                {curso?.profesor} • {curso?.grupo}
              </p>
            </div>
          </div>

          <Tabs defaultValue="primer-corte" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="primer-corte">1er Corte</TabsTrigger>
              <TabsTrigger value="segundo-corte">2do Corte</TabsTrigger>
              <TabsTrigger value="tercer-corte">3er Corte</TabsTrigger>
              <TabsTrigger value="evaluacion-final">Eval. Final</TabsTrigger>
              <TabsTrigger value="silabus">Silabus</TabsTrigger>
            </TabsList>

            <TabsContent value="primer-corte" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-blue-500" />
                      Contenido - Primer Corte
                    </CardTitle>
                    <CardDescription>Semanas 1-4 del semestre</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() =>
                        setContenidoSeleccionado({
                          tipo: "video",
                          titulo: "Introducción al Sistema Muscular",
                          duracion: "45 min",
                          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Play className="h-4 w-4 text-blue-500" />
                        <div>
                          <h4 className="text-sm font-medium">Introducción al Sistema Muscular</h4>
                          <p className="text-xs text-muted-foreground">45 min</p>
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>

                    <div
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() =>
                        setContenidoSeleccionado({
                          tipo: "documento",
                          titulo: "Guía de Anatomía - Cap. 1",
                          tamaño: "1.2 MB",
                          url: "/placeholder.svg?height=800&width=600&text=Guía+de+Anatomía+Cap.1",
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-green-500" />
                        <div>
                          <h4 className="text-sm font-medium">Guía de Anatomía - Cap. 1</h4>
                          <p className="text-xs text-muted-foreground">1.2 MB</p>
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>

                    <div
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() =>
                        setContenidoSeleccionado({
                          tipo: "video",
                          titulo: "Fisiología del Movimiento",
                          duracion: "52 min",
                          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Play className="h-4 w-4 text-blue-500" />
                        <div>
                          <h4 className="text-sm font-medium">Fisiología del Movimiento</h4>
                          <p className="text-xs text-muted-foreground">52 min</p>
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>

                    <div
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() =>
                        setContenidoSeleccionado({
                          tipo: "presentacion",
                          titulo: "Presentación - Conceptos Básicos de Anatomía",
                          tamaño: "3.8 MB • PowerPoint",
                          url: "/placeholder.svg?height=600&width=800&text=Presentación+Conceptos+Básicos+de+Anatomía",
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <div>
                          <h4 className="text-sm font-medium">Presentación - Conceptos Básicos de Anatomía</h4>
                          <p className="text-xs text-muted-foreground">3.8 MB • PowerPoint</p>
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>

                    <div
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() =>
                        setContenidoSeleccionado({
                          tipo: "video",
                          titulo: "Ejercicios Prácticos - Parte 1",
                          duracion: "28 min • Tutorial",
                          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Play className="h-4 w-4 text-red-500" />
                        <div>
                          <h4 className="text-sm font-medium">Ejercicios Prácticos - Parte 1</h4>
                          <p className="text-xs text-muted-foreground">28 min • Tutorial</p>
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>

                    <div
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() =>
                        setContenidoSeleccionado({
                          tipo: "documento",
                          titulo: "Manual de Primeros Auxilios",
                          tamaño: "0.8 MB • PDF",
                          url: "/placeholder.svg?height=1000&width=700&text=Manual+de+Primeros+Auxilios",
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-orange-500" />
                        <div>
                          <h4 className="text-sm font-medium">Manual de Primeros Auxilios</h4>
                          <p className="text-xs text-muted-foreground">0.8 MB • PDF</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() =>
                        setContenidoSeleccionado({
                          tipo: "interactivo",
                          titulo: "Simulador de Movimientos",
                          url: "/placeholder.svg?height=500&width=800&text=Simulador+Gráficas+de+Movimientos",
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-indigo-500" />
                        <div>
                          <h4 className="text-sm font-medium">Simulador de Movimientos</h4>
                          <p className="text-xs text-muted-foreground">Biomecánica interactiva</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() =>
                        setContenidoSeleccionado({
                          tipo: "documento",
                          titulo: "Lecturas Complementarias - Fisiología",
                          tamaño: "2.1 MB • Artículos",
                          url: "/placeholder.svg?height=900&width=700&text=Lecturas+Complementarias+-+Fisiología",
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-cyan-500" />
                        <div>
                          <h4 className="text-sm font-medium">Lecturas Complementarias - Fisiología</h4>
                          <p className="text-xs text-muted-foreground">2.1 MB • Artículos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Progreso del Corte</span>
                      </div>
                      <div className="flex justify-between text-sm text-blue-700 mb-1">
                        <span>7 de 8 contenidos completados</span>
                        <span>87.5%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "87.5%" }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Actividades - Primer Corte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Quiz 1 - Anatomía Básica</h4>
                        <p className="text-xs text-muted-foreground">Fecha: 2024-01-15</p>
                        <p className="text-xs">Calificación: 4.5/5.0</p>
                      </div>
                      <Badge variant="default">Completado</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Evaluación Práctica 1 - Sistema Muscular</h4>
                        <p className="text-xs text-muted-foreground">Fecha: 2024-01-20</p>
                        <p className="text-xs">Calificación: 4.2/5.0</p>
                      </div>
                      <Badge variant="default">Entregado</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="segundo-corte" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-blue-500" />
                      Contenido - Segundo Corte
                    </CardTitle>
                    <CardDescription>Semanas 5-8 del semestre</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Play className="h-4 w-4 text-blue-500" />
                        <div>
                          <h4 className="text-sm font-medium">Fisiología Cardiovascular</h4>
                          <p className="text-xs text-muted-foreground">38 min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-xs">En progreso</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-green-500" />
                        <div>
                          <h4 className="text-sm font-medium">Ejercicios Avanzados - Biomecánica</h4>
                          <p className="text-xs text-muted-foreground">2.1 MB</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Descargar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Actividades - Segundo Corte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Parcial 1 - Sistema Cardiovascular</h4>
                        <p className="text-xs text-muted-foreground">Fecha: 2024-01-28</p>
                        <p className="text-xs">Peso: 25%</p>
                      </div>
                      <Badge variant="destructive">Pendiente</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Evaluación Práctica 2 - Análisis de Movimiento</h4>
                        <p className="text-xs text-muted-foreground">Fecha: 2024-02-05</p>
                      </div>
                      <Badge variant="secondary">No iniciado</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tercer-corte" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-blue-500" />
                      Contenido - Tercer Corte
                    </CardTitle>
                    <CardDescription>Semanas 9-12 del semestre</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center">
                      <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Contenido disponible próximamente</p>
                      <p className="text-xs text-muted-foreground">Se habilitará en la semana 9</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Actividades - Tercer Corte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center">
                      <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Actividades programadas</p>
                      <p className="text-xs text-muted-foreground">Parcial 2 y Proyecto Integrador</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="evaluacion-final" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      Evaluación Final
                    </CardTitle>
                    <CardDescription>Semanas 13-16 del semestre</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">Examen Final</h4>
                      <p className="text-sm text-purple-700">Fecha: Por definir</p>
                      <p className="text-sm text-purple-700">Peso: 30% de la nota final</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Proyecto Final - Plan de Entrenamiento</h4>
                      <p className="text-sm text-blue-700">Entrega: Última semana</p>
                      <p className="text-sm text-blue-700">Peso: 20% de la nota final</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      Resumen de Calificaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Primer Corte (25%)</span>
                        <span className="font-bold text-green-600">4.35</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Segundo Corte (25%)</span>
                        <span className="font-bold text-blue-600">En progreso</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tercer Corte (20%)</span>
                        <span className="font-bold text-gray-400">Pendiente</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Evaluación Final (30%)</span>
                        <span className="font-bold text-gray-400">Pendiente</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-medium">Nota Proyectada:</span>
                        <span className="font-bold text-green-600">4.2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Foros de Discusión
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-4 w-4 mt-1 text-blue-500" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Dudas sobre el sistema cardiovascular</h4>
                        <p className="text-xs text-muted-foreground">Por Carlos Ruiz • 12 respuestas</p>
                        <p className="text-xs text-muted-foreground">Última actividad: Hace 2 horas</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Participar
                    </Button>
                  </div>
                  <div className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-4 w-4 mt-1 text-green-500" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Ejercicios adicionales - Capítulo 3</h4>
                        <p className="text-xs text-muted-foreground">Por Dr. Carlos Mendoza • 8 respuestas</p>
                        <p className="text-xs text-muted-foreground">Última actividad: Hace 1 día</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="silabus" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <img
                      src={curso.imagen || "/placeholder.svg"}
                      alt={curso.nombre}
                      className="w-full h-32 object-cover rounded-md mb-4"
                    />
                    <CardTitle className="text-lg">{curso.nombre}</CardTitle>
                    <CardDescription>{curso.profesor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">Silabus - {curso?.nombre}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Plan académico completo del semestre incluyendo objetivos, contenido temático, metodología,
                            evaluación y bibliografía.
                          </p>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Objetivos de aprendizaje</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Contenido temático</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Metodología de enseñanza</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Sistema de evaluación</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Bibliografía recomendada</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Horarios y cronograma</span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() =>
                                setContenidoSeleccionado({
                                  tipo: "documento",
                                  titulo: `Silabus - ${curso?.nombre}`,
                                  tamaño: "2.8 MB • PDF",
                                  url: "/placeholder.svg?height=1200&width=850&text=Silabus+del+Curso",
                                })
                              }
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Silabus
                            </Button>
                            <Button variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Descargar PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Información del Profesor</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {curso?.profesor
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-medium">{curso?.profesor}</p>
                              <p className="text-sm text-muted-foreground">Profesor Titular</p>
                            </div>
                          </div>
                          <Separator />
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-medium">profesor@universidad.edu</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Oficina:</span>
                              <span className="font-medium">Edificio A, Piso 3, Of. 301</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Horario de atención:</span>
                              <span className="font-medium">Lun-Vie 2:00-4:00 PM</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Información del Curso</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Código:</span>
                              <span className="font-medium">EDF-101</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Créditos:</span>
                              <span className="font-medium">4</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Horas semanales:</span>
                              <span className="font-medium">6 horas</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Modalidad:</span>
                              <span className="font-medium">Presencial</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Prerequisitos:</span>
                              <span className="font-medium">Ninguno</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Semestre:</span>
                              <span className="font-medium">2024-1</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* Dialog para mostrar contenido */}
        <Dialog open={!!contenidoSeleccionado} onOpenChange={() => setContenidoSeleccionado(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {contenidoSeleccionado?.tipo === "video" && <Play className="h-5 w-5 text-blue-500" />}
                {contenidoSeleccionado?.tipo === "documento" && <FileText className="h-5 w-5 text-green-500" />}
                {contenidoSeleccionado?.tipo === "presentacion" && <FileText className="h-5 w-5 text-purple-500" />}
                {contenidoSeleccionado?.tipo === "interactivo" && <Target className="h-5 w-5 text-indigo-500" />}
                {contenidoSeleccionado?.titulo}
              </DialogTitle>
              <DialogDescription>
                {contenidoSeleccionado?.duracion && `Duración: ${contenidoSeleccionado.duracion}`}
                {contenidoSeleccionado?.tamaño && `Tamaño: ${contenidoSeleccionado.tamaño}`}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              {contenidoSeleccionado?.tipo === "video" && (
                <div className="aspect-video">
                  <iframe
                    src={contenidoSeleccionado.url}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    title={contenidoSeleccionado.titulo}
                  />
                </div>
              )}

              {contenidoSeleccionado?.tipo === "documento" && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-medium mb-2">Documento PDF</h3>
                    <p className="text-sm text-muted-foreground mb-4">{contenidoSeleccionado.titulo}</p>
                    <div className="flex gap-2 justify-center">
                      <Button>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver PDF
                      </Button>
                      <Button variant="outline">Descargar</Button>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={contenidoSeleccionado.url || "/placeholder.svg"}
                      alt="Vista previa del documento"
                      className="w-full h-96 object-cover"
                    />
                  </div>
                </div>
              )}

              {contenidoSeleccionado?.tipo === "presentacion" && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <FileText className="h-12 w-12 mx-auto text-purple-500 mb-2" />
                    <h3 className="font-medium mb-2">Presentación PowerPoint</h3>
                    <p className="text-sm text-muted-foreground mb-4">{contenidoSeleccionado.titulo}</p>
                    <div className="flex gap-2 justify-center">
                      <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Reproducir
                      </Button>
                      <Button variant="outline">Descargar PPT</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <img
                        src="/placeholder.svg?height=200&width=300&text=Diapositiva+1"
                        alt="Diapositiva 1"
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-muted-foreground">Diapositiva 1</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <img
                        src="/placeholder.svg?height=200&width=300&text=Diapositiva+2"
                        alt="Diapositiva 2"
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-muted-foreground">Diapositiva 2</p>
                    </div>
                  </div>
                </div>
              )}

              {contenidoSeleccionado?.tipo === "interactivo" && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <Target className="h-12 w-12 mx-auto text-indigo-500 mb-2" />
                    <h3 className="font-medium mb-2">Herramienta Interactiva</h3>
                    <p className="text-sm text-muted-foreground mb-4">Simulador de gráficas de funciones matemáticas</p>
                    <Button>
                      <Target className="h-4 w-4 mr-2" />
                      Abrir Simulador
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={contenidoSeleccionado.url || "/placeholder.svg"}
                      alt="Vista previa del simulador"
                      className="w-full h-96 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
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
                <BreadcrumbPage>Mis Cursos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso) => (
            <Card
              key={curso.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCursoSeleccionado(curso.id)}
            >
              <CardHeader className="pb-2">
                <img
                  src={curso.imagen || "/placeholder.svg"}
                  alt={curso.nombre}
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
                <CardTitle className="text-lg">{curso.nombre}</CardTitle>
                <CardDescription>{curso.profesor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {curso.estudiantes} estudiantes
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {curso.grupo}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{curso.progreso}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${curso.color}`} style={{ width: `${curso.progreso}%` }} />
                  </div>
                </div>
                <Button className="w-full">Ingresar al curso</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarInset>
  )
}
