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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock, BookOpen, Users, Calculator } from "lucide-react"

const pensumData = {
  programa: "Licenciatura en Educación Física",
  totalCreditos: 160,
  creditosAprobados: 89,
  semestreActual: 6,
  totalSemestres: 10,
  semestres: [
    {
      numero: 1,
      estado: "completado",
      materias: [
        {
          codigo: "EDF101",
          nombre: "Fundamentos de la Educación Física",
          creditos: 4,
          estado: "aprobada",
          nota: 4.2,
          icono: Users,
        },
        { codigo: "ANA101", nombre: "Anatomía Humana", creditos: 4, estado: "aprobada", nota: 3.8, icono: BookOpen },
        {
          codigo: "HIS101",
          nombre: "Historia de la Educación Física",
          creditos: 2,
          estado: "aprobada",
          nota: 4.5,
          icono: BookOpen,
        },
        { codigo: "ESP101", nombre: "Español", creditos: 3, estado: "aprobada", nota: 4.0, icono: BookOpen },
        {
          codigo: "MAT101",
          nombre: "Matemáticas Básicas",
          creditos: 4,
          estado: "aprobada",
          nota: 4.3,
          icono: Calculator,
        },
      ],
    },
    {
      numero: 2,
      estado: "completado",
      materias: [
        {
          codigo: "FIS102",
          nombre: "Fisiología del Ejercicio",
          creditos: 4,
          estado: "aprobada",
          nota: 3.9,
          icono: BookOpen,
        },
        { codigo: "GIM102", nombre: "Gimnasia Básica", creditos: 4, estado: "aprobada", nota: 3.7, icono: Users },
        {
          codigo: "ATL102",
          nombre: "Atletismo I",
          creditos: 4,
          estado: "aprobada",
          nota: 4.4,
          icono: Users,
        },
        {
          codigo: "PSI103",
          nombre: "Psicología del Deporte",
          creditos: 3,
          estado: "aprobada",
          nota: 4.1,
          icono: BookOpen,
        },
        { codigo: "HUM101", nombre: "Humanidades I", creditos: 2, estado: "aprobada", nota: 4.2, icono: BookOpen },
      ],
    },
    {
      numero: 3,
      estado: "completado",
      materias: [
        {
          codigo: "BIO201",
          nombre: "Biomecánica",
          creditos: 4,
          estado: "aprobada",
          nota: 3.6,
          icono: BookOpen,
        },
        {
          codigo: "NAT201",
          nombre: "Natación I",
          creditos: 3,
          estado: "aprobada",
          nota: 4.0,
          icono: Users,
        },
        { codigo: "BAL201", nombre: "Baloncesto", creditos: 4, estado: "aprobada", nota: 4.5, icono: Users },
        { codigo: "VOL201", nombre: "Voleibol", creditos: 4, estado: "aprobada", nota: 3.8, icono: Users },
        {
          codigo: "INV201",
          nombre: "Metodología de la Investigación",
          creditos: 2,
          estado: "aprobada",
          nota: 4.3,
          icono: BookOpen,
        },
      ],
    },
    {
      numero: 4,
      estado: "completado",
      materias: [
        { codigo: "FUT301", nombre: "Fútbol", creditos: 4, estado: "aprobada", nota: 4.1, icono: Users },
        {
          codigo: "ENT301",
          nombre: "Entrenamiento Deportivo I",
          creditos: 4,
          estado: "aprobada",
          nota: 4.2,
          icono: Users,
        },
        {
          codigo: "DAN301",
          nombre: "Danza y Expresión Corporal",
          creditos: 4,
          estado: "aprobada",
          nota: 3.9,
          icono: Users,
        },
        {
          codigo: "PED301",
          nombre: "Pedagogía del Deporte",
          creditos: 4,
          estado: "aprobada",
          nota: 4.4,
          icono: BookOpen,
        },
        {
          codigo: "NUT301",
          nombre: "Nutrición Deportiva",
          creditos: 3,
          estado: "aprobada",
          nota: 3.7,
          icono: BookOpen,
        },
      ],
    },
    {
      numero: 5,
      estado: "completado",
      materias: [
        { codigo: "ATL401", nombre: "Atletismo II", creditos: 4, estado: "aprobada", nota: 4.0, icono: Users },
        { codigo: "NAT401", nombre: "Natación II", creditos: 4, estado: "aprobada", nota: 4.3, icono: Users },
        {
          codigo: "ENT401",
          nombre: "Entrenamiento Deportivo II",
          creditos: 4,
          estado: "aprobada",
          nota: 4.5,
          icono: Users,
        },
        {
          codigo: "REC401",
          nombre: "Recreación y Tiempo Libre",
          creditos: 4,
          estado: "aprobada",
          nota: 4.2,
          icono: Users,
        },
        {
          codigo: "ADM401",
          nombre: "Administración Deportiva",
          creditos: 3,
          estado: "aprobada",
          nota: 4.1,
          icono: BookOpen,
        },
      ],
    },
    {
      numero: 6,
      estado: "cursando",
      materias: [
        {
          codigo: "DEP501",
          nombre: "Deportes de Combate",
          creditos: 4,
          estado: "cursando",
          nota: null,
          icono: Users,
        },
        {
          codigo: "LES501",
          nombre: "Prevención de Lesiones",
          creditos: 4,
          estado: "cursando",
          nota: null,
          icono: BookOpen,
        },
        { codigo: "GIM501", nombre: "Gimnasia Artística", creditos: 4, estado: "cursando", nota: null, icono: Users },
        {
          codigo: "EVA501",
          nombre: "Evaluación en Educación Física",
          creditos: 3,
          estado: "cursando",
          nota: null,
          icono: BookOpen,
        },
        { codigo: "ELE501", nombre: "Electiva I", creditos: 3, estado: "cursando", nota: null, icono: BookOpen },
      ],
    },
    {
      numero: 7,
      estado: "pendiente",
      materias: [
        {
          codigo: "ADA601",
          nombre: "Actividad Física Adaptada",
          creditos: 4,
          estado: "pendiente",
          nota: null,
          icono: Users,
        },
        { codigo: "TEN601", nombre: "Tenis de Campo", creditos: 4, estado: "pendiente", nota: null, icono: Users },
        {
          codigo: "FIS601",
          nombre: "Fisioterapia Deportiva",
          creditos: 3,
          estado: "pendiente",
          nota: null,
          icono: BookOpen,
        },
        {
          codigo: "EMP601",
          nombre: "Emprendimiento Deportivo",
          creditos: 3,
          estado: "pendiente",
          nota: null,
          icono: BookOpen,
        },
        { codigo: "ELE601", nombre: "Electiva II", creditos: 3, estado: "pendiente", nota: null, icono: BookOpen },
      ],
    },
    {
      numero: 8,
      estado: "pendiente",
      materias: [
        {
          codigo: "ALT701",
          nombre: "Deportes Alternativos",
          creditos: 4,
          estado: "pendiente",
          nota: null,
          icono: Users,
        },
        {
          codigo: "GES701",
          nombre: "Gestión de Instalaciones Deportivas",
          creditos: 4,
          estado: "pendiente",
          nota: null,
          icono: BookOpen,
        },
        {
          codigo: "ETI701",
          nombre: "Ética Profesional",
          creditos: 2,
          estado: "pendiente",
          nota: null,
          icono: BookOpen,
        },
        {
          codigo: "PRA701",
          nombre: "Práctica Pedagógica",
          creditos: 6,
          estado: "pendiente",
          nota: null,
          icono: Users,
        },
      ],
    },
    {
      numero: 9,
      estado: "pendiente",
      materias: [
        {
          codigo: "TES801",
          nombre: "Trabajo de Grado I",
          creditos: 4,
          estado: "pendiente",
          nota: null,
          icono: BookOpen,
        },
        {
          codigo: "SEM801",
          nombre: "Seminario de Investigación",
          creditos: 3,
          estado: "pendiente",
          nota: null,
          icono: BookOpen,
        },
        { codigo: "ELE801", nombre: "Electiva III", creditos: 3, estado: "pendiente", nota: null, icono: BookOpen },
        {
          codigo: "CON801",
          nombre: "Constitución Política",
          creditos: 2,
          estado: "pendiente",
          nota: null,
          icono: BookOpen,
        },
      ],
    },
    {
      numero: 10,
      estado: "pendiente",
      materias: [
        {
          codigo: "TES901",
          nombre: "Trabajo de Grado II",
          creditos: 4,
          estado: "pendiente",
          nota: null,
          icono: BookOpen,
        },
        { codigo: "ELE901", nombre: "Electiva IV", creditos: 3, estado: "pendiente", nota: null, icono: BookOpen },
      ],
    },
  ],
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "aprobada":
      return "bg-green-100 text-green-800 border-green-200"
    case "cursando":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "pendiente":
      return "bg-gray-100 text-gray-600 border-gray-200"
    default:
      return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case "aprobada":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "cursando":
      return <Clock className="h-4 w-4 text-blue-600" />
    case "pendiente":
      return <Circle className="h-4 w-4 text-gray-400" />
    default:
      return <Circle className="h-4 w-4 text-gray-400" />
  }
}

export default function PensumPage() {
  const progresoCreditos = (pensumData.creditosAprobados / pensumData.totalCreditos) * 100
  const progresoSemestres = (pensumData.semestreActual / pensumData.totalSemestres) * 100

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
              <BreadcrumbPage>Pensum Académico</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header Mejorado */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{pensumData.programa}</h1>
              <p className="text-blue-100">Plan de Estudios 2024</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{pensumData.semestreActual}/10</div>
              <p className="text-blue-100">Semestre Actual</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{pensumData.creditosAprobados}</div>
              <p className="text-blue-100">Créditos Aprobados</p>
              <Progress value={progresoCreditos} className="h-2 bg-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{Math.round(progresoCreditos)}%</div>
              <p className="text-blue-100">Progreso Total</p>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded ${i < pensumData.semestreActual ? "bg-white" : "bg-blue-400"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vista de Timeline Mejorada */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline Principal */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Malla Curricular</h2>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completado
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Cursando
                </Badge>
                <Badge className="bg-gray-100 text-gray-600">
                  <Circle className="h-3 w-3 mr-1" />
                  Pendiente
                </Badge>
              </div>
            </div>

            <div className="relative">
              {/* Línea de Timeline */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-gray-300"></div>

              {pensumData.semestres.map((semestre, index) => (
                <div key={semestre.numero} className="relative mb-8">
                  {/* Indicador de Semestre */}
                  <div
                    className={`absolute left-6 w-4 h-4 rounded-full border-4 ${
                      semestre.estado === "completado"
                        ? "bg-green-500 border-green-200"
                        : semestre.estado === "cursando"
                          ? "bg-blue-500 border-blue-200"
                          : "bg-gray-300 border-gray-100"
                    }`}
                  ></div>

                  {/* Contenido del Semestre */}
                  <div className="ml-16">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold">Semestre {semestre.numero}</h3>
                      <Badge
                        variant="outline"
                        className={`${
                          semestre.estado === "completado"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : semestre.estado === "cursando"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {semestre.estado === "completado" && "Completado"}
                        {semestre.estado === "cursando" && "En Curso"}
                        {semestre.estado === "pendiente" && "Pendiente"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {semestre.materias.reduce((sum, materia) => sum + materia.creditos, 0)} créditos
                      </span>
                    </div>

                    {/* Grid de Materias Compacto */}
                    <div className="grid gap-2 sm:grid-cols-2">
                      {semestre.materias.map((materia) => (
                        <div
                          key={materia.codigo}
                          className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                            materia.estado === "aprobada"
                              ? "bg-green-50 border-green-200"
                              : materia.estado === "cursando"
                                ? "bg-blue-50 border-blue-200"
                                : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2 flex-1">
                              <materia.icono className="h-4 w-4 mt-0.5 text-gray-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{materia.codigo}</span>
                                  {materia.nota && (
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${
                                        materia.nota >= 4.0
                                          ? "bg-green-100 text-green-800"
                                          : materia.nota >= 3.5
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {materia.nota.toFixed(1)}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{materia.nombre}</p>
                                <span className="text-xs text-muted-foreground">{materia.creditos} créditos</span>
                              </div>
                            </div>
                            {getEstadoIcon(materia.estado)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel Lateral de Estadísticas */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen Académico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Materias Aprobadas</span>
                    <span className="font-medium">
                      {pensumData.semestres.flatMap((s) => s.materias).filter((m) => m.estado === "aprobada").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Materias Cursando</span>
                    <span className="font-medium">
                      {pensumData.semestres.flatMap((s) => s.materias).filter((m) => m.estado === "cursando").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Materias Pendientes</span>
                    <span className="font-medium">
                      {pensumData.semestres.flatMap((s) => s.materias).filter((m) => m.estado === "pendiente").length}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Promedio Acumulado</span>
                    <span className="font-medium text-green-600">4.1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Créditos Restantes</span>
                    <span className="font-medium">{pensumData.totalCreditos - pensumData.creditosAprobados}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Áreas de Conocimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Deportes Colectivos</span>
                    </div>
                    <Progress value={85} className="w-16 h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Fundamentos Teóricos</span>
                    </div>
                    <Progress value={78} className="w-16 h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Deportes Individuales</span>
                    </div>
                    <Progress value={92} className="w-16 h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Pedagogía</span>
                    </div>
                    <Progress value={75} className="w-16 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximos Hitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Finalizar Semestre 6</p>
                      <p className="text-xs text-muted-foreground">Diciembre 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Práctica Pedagógica</p>
                      <p className="text-xs text-muted-foreground">Semestre 8</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Trabajo de Grado</p>
                      <p className="text-xs text-muted-foreground">Semestres 9-10</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
