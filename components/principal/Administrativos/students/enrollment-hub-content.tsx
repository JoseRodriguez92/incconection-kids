"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, FileSpreadsheet, School, Users, Clock, CheckCircle } from "lucide-react"
import { PreEnrolledContent } from "./pre-enrolled-content"
import { StudentRegistrationContent } from "./student-registration-content"
import { StudentCSVContent } from "./student-csv-content"

export function EnrollmentHubContent() {
  const [activeTab, setActiveTab] = useState("prematricula")

  // Datos simulados para las estadísticas
  const stats = {
    prematricula: {
      total: 245,
      pendientes: 32,
      completados: 213,
    },
    matricula: {
      total: 189,
      enProceso: 45,
      completados: 144,
    },
    listaMatricula: {
      total: 378,
      activos: 356,
      inactivos: 22,
    },
  }

  return (
    <div className="space-y-6">
      {/* Header con título y descripción */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Centro de Matrícula</h1>
        <p className="text-muted-foreground">
          Gestiona todos los procesos relacionados con la matrícula estudiantil desde un solo lugar
        </p>
      </div>

      {/* Cards de estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prematrículas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prematricula.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">{stats.prematricula.pendientes} pendientes</span> •
              <span className="text-green-600 ml-1">{stats.prematricula.completados} completadas</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matrículas</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.matricula.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{stats.matricula.enProceso} en proceso</span> •
              <span className="text-green-600 ml-1">{stats.matricula.completados} completadas</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lista General</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.listaMatricula.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.listaMatricula.activos} activos</span> •
              <span className="text-gray-600 ml-1">{stats.listaMatricula.inactivos} inactivos</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales con contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prematricula" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            Pre Matrícula
            <Badge variant="secondary" className="ml-1">
              {stats.prematricula.pendientes}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="matricula" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Matrícula
            <Badge variant="secondary" className="ml-1">
              {stats.matricula.enProceso}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista Matrícula
            <Badge variant="outline" className="ml-1">
              {stats.listaMatricula.total}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prematricula" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Gestión de Prematrículas</h3>
                  <p className="text-sm text-muted-foreground">
                    Administra el proceso de prematrícula para estudiantes existentes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {stats.prematricula.pendientes} Pendientes
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {stats.prematricula.completados} Completadas
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-6">
              <PreEnrolledContent />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matricula" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Proceso de Matrícula</h3>
                  <p className="text-sm text-muted-foreground">
                    Registro individual de nuevos estudiantes y matrícula masiva
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nueva Matrícula
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Matrícula Masiva
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Matrícula Individual
                    </CardTitle>
                    <CardDescription>Registro paso a paso de un nuevo estudiante</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StudentRegistrationContent />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      Matrícula Masiva
                    </CardTitle>
                    <CardDescription>Importación de múltiples estudiantes via CSV</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StudentCSVContent />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lista" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Lista de Matrículas</h3>
                  <p className="text-sm text-muted-foreground">Consulta y gestión de todos los procesos de matrícula</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {stats.listaMatricula.activos} Activos
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Aquí puedes poner el componente de lista de matrículas */}
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Lista de Matrículas</h3>
                <p className="text-muted-foreground mb-4">
                  Aquí se mostrará la lista completa de matrículas con filtros y opciones de gestión
                </p>
                <Button variant="outline">Ver Lista Completa</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
