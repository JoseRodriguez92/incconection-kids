"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, Award, Target, Calendar } from "lucide-react"
import { useState } from "react"

export default function RegistroNotas() {
  const [semestreSeleccionado, setSemestreSeleccionado] = useState("2024-1")

  const semestresCursados = [
    {
      id: "2023-1",
      nombre: "2023-1",
      promedio: 3.8,
      creditos: 18,
      materias: 6,
    },
    {
      id: "2023-2",
      nombre: "2023-2",
      promedio: 4.1,
      creditos: 20,
      materias: 6,
    },
    {
      id: "2024-1",
      nombre: "2024-1",
      promedio: 4.3,
      creditos: 19,
      materias: 5,
    },
  ]

  const notasPorSemestre = {
    "2023-1": [
      { materia: "Matemáticas I", nota: 3.5, creditos: 4 },
      { materia: "Programación I", nota: 4.2, creditos: 3 },
      { materia: "Física I", nota: 3.8, creditos: 4 },
      { materia: "Química General", nota: 3.6, creditos: 3 },
      { materia: "Inglés I", nota: 4.0, creditos: 2 },
      { materia: "Cátedra Universitaria", nota: 4.5, creditos: 2 },
    ],
    "2023-2": [
      { materia: "Matemáticas II", nota: 4.0, creditos: 4 },
      { materia: "Programación II", nota: 4.5, creditos: 3 },
      { materia: "Física II", nota: 4.2, creditos: 4 },
      { materia: "Estadística", nota: 3.8, creditos: 3 },
      { materia: "Inglés II", nota: 4.3, creditos: 2 },
      { materia: "Ética Profesional", nota: 4.8, creditos: 2 },
    ],
    "2024-1": [
      { materia: "Cálculo Diferencial", nota: 4.5, creditos: 4 },
      { materia: "Programación Web", nota: 4.2, creditos: 3 },
      { materia: "Base de Datos", nota: 4.6, creditos: 4 },
      { materia: "Estructuras de Datos", nota: 4.0, creditos: 4 },
      { materia: "Inglés III", nota: 4.1, creditos: 2 },
    ],
  }

  const estadisticasGenerales = {
    promedioAcumulado: 4.07,
    creditosAprobados: 57,
    creditosTotales: 160,
    semestresCursados: 3,
    materiasPerdidas: 0,
    tendencia: "ascendente",
  }

  const obtenerColorNota = (nota: number) => {
    if (nota >= 4.5) return "text-green-600 bg-green-50"
    if (nota >= 4.0) return "text-blue-600 bg-blue-50"
    if (nota >= 3.5) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const obtenerColorPromedio = (promedio: number) => {
    if (promedio >= 4.5) return "bg-green-500"
    if (promedio >= 4.0) return "bg-blue-500"
    if (promedio >= 3.5) return "bg-yellow-500"
    return "bg-red-500"
  }

  const notasActuales = notasPorSemestre[semestreSeleccionado as keyof typeof notasPorSemestre] || []
  const semestreActual = semestresCursados.find((s) => s.id === semestreSeleccionado)

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Registro de Notas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Estadísticas Generales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Acumulado</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticasGenerales.promedioAcumulado}</div>
              <p className="text-xs text-muted-foreground">
                {estadisticasGenerales.tendencia === "ascendente" ? (
                  <span className="flex items-center text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Tendencia positiva
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Tendencia negativa
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos Aprobados</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticasGenerales.creditosAprobados}</div>
              <p className="text-xs text-muted-foreground">
                de {estadisticasGenerales.creditosTotales} totales (
                {Math.round((estadisticasGenerales.creditosAprobados / estadisticasGenerales.creditosTotales) * 100)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Semestres Cursados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticasGenerales.semestresCursados}</div>
              <p className="text-xs text-muted-foreground">
                {estadisticasGenerales.materiasPerdidas} materias perdidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso Carrera</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">36%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "36%" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Gráfica de Evolución por Semestres */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Evolución de Promedios por Semestre
              </CardTitle>
              <CardDescription>Progreso académico a lo largo de los semestres cursados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {semestresCursados.map((semestre, index) => (
                  <div key={semestre.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">{semestre.nombre}</div>
                        <Badge variant="outline">{semestre.materias} materias</Badge>
                        <Badge variant="outline">{semestre.creditos} créditos</Badge>
                      </div>
                      <div className="text-lg font-bold">{semestre.promedio}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${obtenerColorPromedio(semestre.promedio)}`}
                          style={{ width: `${(semestre.promedio / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {((semestre.promedio / 5) * 100).toFixed(0)}%
                      </span>
                    </div>
                    {index < semestresCursados.length - 1 && (
                      <div className="flex items-center justify-center py-2">
                        {semestresCursados[index + 1].promedio > semestre.promedio ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selector de Semestre y Notas Detalladas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas por Semestre</CardTitle>
              <CardDescription>Selecciona un semestre para ver las notas detalladas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={semestreSeleccionado} onValueChange={setSemestreSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar semestre" />
                </SelectTrigger>
                <SelectContent>
                  {semestresCursados.map((semestre) => (
                    <SelectItem key={semestre.id} value={semestre.id}>
                      {semestre.nombre} - Promedio: {semestre.promedio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {semestreActual && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Resumen {semestreActual.nombre}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Promedio:</span>
                      <span className="font-bold">{semestreActual.promedio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Materias:</span>
                      <span>{semestreActual.materias}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Créditos:</span>
                      <span>{semestreActual.creditos}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {notasActuales.map((nota, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{nota.materia}</div>
                      <div className="text-xs text-muted-foreground">{nota.creditos} créditos</div>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-sm font-bold ${obtenerColorNota(nota.nota)}`}>
                      {nota.nota}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análisis y Recomendaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis y Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">Fortalezas Académicas</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Tendencia ascendente en el promedio general</li>
                  <li>• Excelente desempeño en materias técnicas</li>
                  <li>• Ninguna materia perdida hasta el momento</li>
                  <li>• Progreso constante semestre a semestre</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">Áreas de Mejora</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Mantener el ritmo de estudio actual</li>
                  <li>• Considerar materias electivas para mejorar promedio</li>
                  <li>• Participar en actividades extracurriculares</li>
                  <li>• Prepararse para materias de mayor complejidad</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
