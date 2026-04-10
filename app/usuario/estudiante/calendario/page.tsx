"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen, FileText, Users } from "lucide-react"

export default function Calendario() {
  const [vistaActual, setVistaActual] = useState<"mensual" | "semanal">("mensual")
  const [fechaActual, setFechaActual] = useState(new Date(2024, 0, 15)) // 15 de enero 2024

  const eventos = [
    {
      id: 1,
      titulo: "Clase de Cálculo Diferencial",
      tipo: "clase",
      curso: "Cálculo Diferencial",
      fecha: "2024-01-15",
      hora: "08:00 - 10:00",
      aula: "Aula 201",
    },
    {
      id: 2,
      titulo: "Entrega Proyecto Web",
      tipo: "tarea",
      curso: "Programación Web",
      fecha: "2024-01-25",
      hora: "23:59",
      descripcion: "Sistema de gestión completo",
    },
    {
      id: 3,
      titulo: "Examen Parcial 2",
      tipo: "examen",
      curso: "Cálculo Diferencial",
      fecha: "2024-01-28",
      hora: "10:00 - 12:00",
      aula: "Aula 105",
    },
    {
      id: 4,
      titulo: "Asesoría Base de Datos",
      tipo: "asesoria",
      curso: "Base de Datos",
      fecha: "2024-01-18",
      hora: "14:00 - 15:00",
      profesor: "Msc. Roberto Silva",
    },
    {
      id: 5,
      titulo: "Clase Programación Web",
      tipo: "clase",
      curso: "Programación Web",
      fecha: "2024-01-16",
      hora: "14:00 - 16:00",
      aula: "Lab 301",
    },
  ]

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const obtenerEventosPorFecha = (fecha: string) => {
    return eventos.filter((evento) => evento.fecha === fecha)
  }

  const obtenerColorTipo = (tipo: string) => {
    switch (tipo) {
      case "clase":
        return "bg-blue-500"
      case "tarea":
        return "bg-red-500"
      case "examen":
        return "bg-orange-500"
      case "asesoria":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const obtenerIconoTipo = (tipo: string) => {
    switch (tipo) {
      case "clase":
        return <BookOpen className="h-4 w-4" />
      case "tarea":
        return <FileText className="h-4 w-4" />
      case "examen":
        return <Clock className="h-4 w-4" />
      case "asesoria":
        return <Users className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const generarCalendarioMensual = () => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    const diaSemanaInicio = primerDia.getDay()

    const dias = []

    // Días vacíos al inicio
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null)
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(dia)
    }

    return dias
  }

  const navegarMes = (direccion: "anterior" | "siguiente") => {
    const nuevaFecha = new Date(fechaActual)
    if (direccion === "anterior") {
      nuevaFecha.setMonth(nuevaFecha.getMonth() - 1)
    } else {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 1)
    }
    setFechaActual(nuevaFecha)
  }

  const formatearFecha = (dia: number) => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    return `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
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
                <BreadcrumbPage>Calendario Académico</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Controles del calendario */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navegarMes("anterior")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navegarMes("siguiente")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={vistaActual === "mensual" ? "default" : "outline"}
              size="sm"
              onClick={() => setVistaActual("mensual")}
            >
              Mensual
            </Button>
            <Button
              variant={vistaActual === "semanal" ? "default" : "outline"}
              size="sm"
              onClick={() => setVistaActual("semanal")}
            >
              Semanal
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {/* Calendario principal */}
          <Card className="lg:col-span-3">
            <CardContent className="p-4">
              {vistaActual === "mensual" && (
                <div className="space-y-4">
                  {/* Encabezados de días */}
                  <div className="grid grid-cols-7 gap-2">
                    {diasSemana.map((dia) => (
                      <div key={dia} className="p-2 text-center font-medium text-muted-foreground">
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Días del calendario */}
                  <div className="grid grid-cols-7 gap-2">
                    {generarCalendarioMensual().map((dia, index) => {
                      if (!dia) {
                        return <div key={index} className="p-2 h-24" />
                      }

                      const fechaCompleta = formatearFecha(dia)
                      const eventosDelDia = obtenerEventosPorFecha(fechaCompleta)
                      const esHoy = fechaCompleta === "2024-01-15" // Simular día actual

                      return (
                        <div
                          key={dia}
                          className={`p-2 h-24 border rounded-lg ${esHoy ? "bg-blue-50 border-blue-200" : "hover:bg-muted"}`}
                        >
                          <div className={`text-sm font-medium ${esHoy ? "text-blue-600" : ""}`}>{dia}</div>
                          <div className="space-y-1 mt-1">
                            {eventosDelDia.slice(0, 2).map((evento) => (
                              <div
                                key={evento.id}
                                className={`text-xs p-1 rounded text-white ${obtenerColorTipo(evento.tipo)}`}
                              >
                                {evento.titulo.length > 15 ? evento.titulo.substring(0, 15) + "..." : evento.titulo}
                              </div>
                            ))}
                            {eventosDelDia.length > 2 && (
                              <div className="text-xs text-muted-foreground">+{eventosDelDia.length - 2} más</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {vistaActual === "semanal" && (
                <div className="space-y-4">
                  {/* Encabezados de días de la semana */}
                  <div className="grid grid-cols-7 gap-2">
                    {diasSemana.map((dia) => (
                      <div key={dia} className="p-2 text-center font-medium text-muted-foreground border-b">
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Vista semanal con eventos */}
                  <div className="grid grid-cols-7 gap-2 min-h-[400px]">
                    {(() => {
                      // Calcular la semana actual (15-21 de enero 2024)
                      const inicioSemana = 14 // Domingo 14 de enero
                      const diasSemana = []

                      for (let i = 0; i < 7; i++) {
                        const dia = inicioSemana + i + 1
                        const fechaCompleta = formatearFecha(dia)
                        const eventosDelDia = obtenerEventosPorFecha(fechaCompleta)
                        const esHoy = fechaCompleta === "2024-01-15"

                        diasSemana.push(
                          <div key={dia} className="border rounded-lg p-2 min-h-[350px]">
                            <div
                              className={`text-sm font-medium mb-2 pb-2 border-b ${esHoy ? "text-blue-600 bg-blue-50 px-2 py-1 rounded" : ""}`}
                            >
                              {dia}
                            </div>
                            <div className="space-y-2">
                              {eventosDelDia.map((evento) => (
                                <div
                                  key={evento.id}
                                  className={`p-2 rounded text-white text-xs ${obtenerColorTipo(evento.tipo)}`}
                                >
                                  <div className="font-medium">{evento.hora}</div>
                                  <div className="mt-1">{evento.titulo}</div>
                                  <div className="mt-1 opacity-90">{evento.curso}</div>
                                  {evento.aula && <div className="mt-1 opacity-75">{evento.aula}</div>}
                                </div>
                              ))}
                            </div>
                          </div>,
                        )
                      }

                      return diasSemana
                    })()}
                  </div>

                  {/* Resumen de la semana */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Resumen de la Semana (15-21 Enero)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {
                              eventos.filter(
                                (e) =>
                                  e.tipo === "clase" &&
                                  new Date(e.fecha) >= new Date("2024-01-15") &&
                                  new Date(e.fecha) <= new Date("2024-01-21"),
                              ).length
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">Clases</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {
                              eventos.filter(
                                (e) =>
                                  e.tipo === "tarea" &&
                                  new Date(e.fecha) >= new Date("2024-01-15") &&
                                  new Date(e.fecha) <= new Date("2024-01-21"),
                              ).length
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">Tareas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {
                              eventos.filter(
                                (e) =>
                                  e.tipo === "examen" &&
                                  new Date(e.fecha) >= new Date("2024-01-15") &&
                                  new Date(e.fecha) <= new Date("2024-01-21"),
                              ).length
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">Exámenes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {
                              eventos.filter(
                                (e) =>
                                  e.tipo === "asesoria" &&
                                  new Date(e.fecha) >= new Date("2024-01-15") &&
                                  new Date(e.fecha) <= new Date("2024-01-21"),
                              ).length
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">Asesorías</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel lateral con eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventos
                .filter((evento) => new Date(evento.fecha) >= new Date("2024-01-15"))
                .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                .slice(0, 5)
                .map((evento) => (
                  <div key={evento.id} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className={`p-1 rounded text-white ${obtenerColorTipo(evento.tipo)}`}>
                        {obtenerIconoTipo(evento.tipo)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-medium">{evento.titulo}</h4>
                        <p className="text-xs text-muted-foreground">{evento.curso}</p>
                        <p className="text-xs">
                          {evento.fecha} • {evento.hora}
                        </p>
                        {evento.aula && <p className="text-xs text-muted-foreground">{evento.aula}</p>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Leyenda */}
        <Card>
          <CardHeader>
            <CardTitle>Leyenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm">Clases</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-sm">Tareas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded" />
                <span className="text-sm">Exámenes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-sm">Asesorías</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
