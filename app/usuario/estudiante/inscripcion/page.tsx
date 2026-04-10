"use client";

import { useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "../app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InscripcionPage() {
  const [materiasInscritas, setMateriasInscritas] = useState([
    "PRG301",
    "BD201",
    "MAT301",
  ]);

  const materiasDisponibles = [
    {
      codigo: "PRG301",
      nombre: "Programación Avanzada",
      creditos: 4,
      profesor: "Dr. Carlos Mendez",
      horario: "Lun-Mie 8:00-10:00",
      aula: "Lab 201",
      cupos: 25,
      inscritos: 18,
      prerrequisitos: ["PRG201", "PRG202"],
      estado: "disponible",
    },
    {
      codigo: "BD201",
      nombre: "Bases de Datos II",
      creditos: 3,
      profesor: "Dra. Ana Rodriguez",
      horario: "Mar-Jue 10:00-12:00",
      aula: "Aula 305",
      cupos: 30,
      inscritos: 22,
      prerrequisitos: ["BD101"],
      estado: "disponible",
    },
    {
      codigo: "MAT301",
      nombre: "Estadística Aplicada",
      creditos: 3,
      profesor: "Dr. Luis Garcia",
      horario: "Vie 14:00-17:00",
      aula: "Aula 102",
      cupos: 35,
      inscritos: 28,
      prerrequisitos: ["MAT201"],
      estado: "disponible",
    },
    {
      codigo: "IA101",
      nombre: "Inteligencia Artificial",
      creditos: 4,
      profesor: "Dr. Maria Santos",
      horario: "Lun-Mie 14:00-16:00",
      aula: "Lab 301",
      cupos: 20,
      inscritos: 20,
      prerrequisitos: ["PRG301", "MAT301"],
      estado: "lleno",
    },
    {
      codigo: "WEB201",
      nombre: "Desarrollo Web Avanzado",
      creditos: 3,
      profesor: "Ing. Pedro Ruiz",
      horario: "Mar-Jue 16:00-18:00",
      aula: "Lab 205",
      cupos: 25,
      inscritos: 15,
      prerrequisitos: ["WEB101"],
      estado: "conflicto",
    },
  ];

  const toggleInscripcion = (codigo: string) => {
    if (materiasInscritas.includes(codigo)) {
      setMateriasInscritas(materiasInscritas.filter((m) => m !== codigo));
    } else {
      setMateriasInscritas([...materiasInscritas, codigo]);
    }
  };

  const getTotalCreditos = () => {
    return materiasDisponibles
      .filter((m) => materiasInscritas.includes(m.codigo))
      .reduce((total, materia) => total + materia.creditos, 0);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "bg-green-100 text-green-800";
      case "lleno":
        return "bg-red-100 text-red-800";
      case "conflicto":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "disponible":
        return <CheckCircle className="h-4 w-4" />;
      case "lleno":
        return <XCircle className="h-4 w-4" />;
      case "conflicto":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
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
                <BreadcrumbPage>Inscripción de Materias</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Header de Inscripción */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Período Académico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2024-1</div>
                <p className="text-xs text-muted-foreground">Semestre Actual</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Materias Inscritas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {materiasInscritas.length}
                </div>
                <p className="text-xs text-muted-foreground">de 6 máximo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Créditos Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTotalCreditos()}</div>
                <p className="text-xs text-muted-foreground">de 18 máximo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Inscripción Abierta
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Hasta 15 Feb
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Recordatorio:</strong> La inscripción de materias cierra
              el 15 de febrero a las 11:59 PM. Asegúrate de completar tu
              inscripción antes de esta fecha.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="disponibles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="disponibles">
                Materias Disponibles
              </TabsTrigger>
              <TabsTrigger value="inscritas">
                Mis Materias Inscritas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="disponibles" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sección de Materias Disponibles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Materias Disponibles
                    </h3>
                    <Badge variant="outline">
                      {materiasDisponibles.length} materias
                    </Badge>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {materiasDisponibles.map((materia) => (
                      <Card
                        key={materia.codigo}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base">
                                {materia.codigo} - {materia.nombre}
                              </CardTitle>
                              <CardDescription className="text-xs space-y-1">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {materia.profesor}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {materia.horario}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {materia.aula}
                                </div>
                              </CardDescription>
                            </div>
                            <Badge
                              className={getEstadoColor(materia.estado)}
                              variant="outline"
                            >
                              {getEstadoIcon(materia.estado)}
                              {materia.estado === "disponible" && "Disponible"}
                              {materia.estado === "lleno" && "Lleno"}
                              {materia.estado === "conflicto" && "Conflicto"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs">
                              <span>
                                <strong>Créditos:</strong> {materia.creditos}
                              </span>
                              <span>
                                <strong>Cupos:</strong> {materia.inscritos}/
                                {materia.cupos}
                              </span>
                            </div>
                            <Button
                              onClick={() => toggleInscripcion(materia.codigo)}
                              disabled={materia.estado === "lleno"}
                              variant={
                                materiasInscritas.includes(materia.codigo)
                                  ? "destructive"
                                  : "default"
                              }
                              size="sm"
                            >
                              {materiasInscritas.includes(materia.codigo) ? (
                                <>
                                  <Minus className="h-3 w-3 mr-1" />
                                  Retirar
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Inscribir
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Sección de Materias Inscritas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Mis Materias Inscritas
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800"
                    >
                      {materiasInscritas.length} inscritas
                    </Badge>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {materiasDisponibles
                      .filter((materia) =>
                        materiasInscritas.includes(materia.codigo)
                      )
                      .map((materia) => (
                        <Card
                          key={materia.codigo}
                          className="border-green-200 bg-green-50"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-base text-green-800">
                                  {materia.codigo} - {materia.nombre}
                                </CardTitle>
                                <CardDescription className="text-xs text-green-600 space-y-1">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {materia.profesor}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {materia.horario}
                                  </div>
                                </CardDescription>
                              </div>
                              <Badge
                                className="bg-green-100 text-green-800"
                                variant="outline"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Inscrita
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-green-700">
                                <span>
                                  <strong>Créditos:</strong> {materia.creditos}
                                </span>
                                <span>
                                  <strong>Aula:</strong> {materia.aula}
                                </span>
                              </div>
                              <Button
                                onClick={() =>
                                  toggleInscripcion(materia.codigo)
                                }
                                variant="outline"
                                size="sm"
                                className="border-green-300 text-green-700 hover:bg-green-100"
                              >
                                <Minus className="h-3 w-3 mr-1" />
                                Retirar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                    {materiasInscritas.length === 0 && (
                      <Card className="text-center py-8 border-dashed">
                        <CardContent>
                          <div className="text-muted-foreground space-y-2">
                            <AlertCircle className="h-8 w-8 mx-auto opacity-50" />
                            <p>No tienes materias inscritas</p>
                            <p className="text-sm">
                              Selecciona materias de la lista de disponibles
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Resumen y Botón de Generar Inscripción */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-blue-800">
                        Resumen de Inscripción
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Materias:</span>
                          <div className="text-lg font-bold text-blue-600">
                            {materiasInscritas.length}/6
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Créditos:</span>
                          <div className="text-lg font-bold text-blue-600">
                            {getTotalCreditos()}/18
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progreso de Créditos</span>
                          <span>
                            {Math.round((getTotalCreditos() / 18) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                (getTotalCreditos() / 18) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={materiasInscritas.length === 0}
                        >
                          Guardar Borrador
                        </Button>
                        <Button
                          size="sm"
                          disabled={materiasInscritas.length === 0}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Generar Inscripción
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inscritas" className="space-y-4">
              <div className="grid gap-4">
                {materiasDisponibles
                  .filter((materia) =>
                    materiasInscritas.includes(materia.codigo)
                  )
                  .map((materia) => (
                    <Card
                      key={materia.codigo}
                      className="border-green-200 bg-green-50"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg text-green-800">
                              {materia.codigo} - {materia.nombre}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 text-green-600">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {materia.profesor}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {materia.horario}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {materia.aula}
                              </span>
                            </CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Inscrita
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="text-sm text-green-700">
                              <span className="font-medium">Créditos:</span>{" "}
                              {materia.creditos}
                            </div>
                            <div className="text-sm text-green-700">
                              <span className="font-medium">Cupos:</span>{" "}
                              {materia.inscritos}/{materia.cupos}
                            </div>
                          </div>
                          <Button
                            onClick={() => toggleInscripcion(materia.codigo)}
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Retirar Materia
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {materiasInscritas.length === 0 && (
                  <Card className="text-center py-8">
                    <CardContent>
                      <p className="text-muted-foreground">
                        No tienes materias inscritas aún.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ve a la pestaña "Materias Disponibles" para inscribir
                        materias.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {materiasInscritas.length > 0 && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Guardar Borrador</Button>
                  <Button>Confirmar Inscripción</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
