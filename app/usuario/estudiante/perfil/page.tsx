"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  FileText,
  Download,
  Eye,
  Edit,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Award as IdCard,
  Users,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function PerfilPage() {
  const [editMode, setEditMode] = useState(false)

  // Datos del estudiante
  const estudiante = {
    personal: {
      nombre: "María González Rodríguez",
      documento: "1.234.567.890",
      tipoDocumento: "Cédula de Ciudadanía",
      fechaNacimiento: "15 de marzo de 2002",
      edad: 22,
      genero: "Femenino",
      estadoCivil: "Soltero(a)",
      email: "maria.gonzalez@universidad.edu",
      emailPersonal: "maria.gonzalez@gmail.com",
      telefono: "+57 300 123 4567",
      direccion: "Calle 45 #12-34, Apartamento 501",
      ciudad: "Bogotá",
      departamento: "Cundinamarca",
      pais: "Colombia",
      foto: "/placeholder.svg?height=200&width=200",
    },
    academica: {
      programa: "Licenciatura en Educación Física",
      codigo: "EDF-2021-045",
      facultad: "Facultad de Educación",
      estado: "Activo",
      periodoIngreso: "2021-1",
      periodoActual: "2024-1",
      semestre: 6,
      creditosAprobados: 98,
      creditosTotales: 156,
      promedioAcumulado: 4.2,
      promedioSemestre: 4.3,
      materiasAprobadas: 32,
      materiasReprobadas: 2,
      tipoEstudiante: "Regular",
      modalidad: "Presencial",
      jornada: "Diurna",
    },
    novedades: [
      {
        tipo: "academica",
        titulo: "Nueva Calificación Registrada",
        descripcion: "Se ha registrado tu calificación final en Biomecánica Deportiva: 4.5",
        fecha: "2024-01-22",
        estado: "nueva",
        icono: BookOpen,
      },
      {
        tipo: "administrativa",
        titulo: "Actualización de Datos",
        descripcion: "Recuerda actualizar tus datos de contacto antes del 30 de enero",
        fecha: "2024-01-20",
        estado: "pendiente",
        icono: AlertCircle,
      },
      {
        tipo: "financiera",
        titulo: "Pago Registrado",
        descripcion: "Se ha registrado tu pago de matrícula del período 2024-1",
        fecha: "2024-01-18",
        estado: "completado",
        icono: CheckCircle,
      },
      {
        tipo: "academica",
        titulo: "Inscripción de Materias",
        descripcion: "Ya puedes inscribir materias para el próximo semestre",
        fecha: "2024-01-15",
        estado: "nueva",
        icono: Calendar,
      },
    ],
    certificados: [
      {
        nombre: "Certificado de Estudios",
        descripcion: "Certificado que acredita tu condición de estudiante activo",
        tipo: "Académico",
        disponible: true,
        ultimaEmision: "2024-01-10",
      },
      {
        nombre: "Certificado de Calificaciones",
        descripcion: "Historial completo de calificaciones por semestre",
        tipo: "Académico",
        disponible: true,
        ultimaEmision: "2023-12-15",
      },
      {
        nombre: "Certificado de Paz y Salvo",
        descripcion: "Certificado de no adeudar ningún compromiso con la universidad",
        tipo: "Financiero",
        disponible: true,
        ultimaEmision: "2024-01-05",
      },
      {
        nombre: "Certificado de Práctica Pedagógica",
        descripcion: "Certificado de horas de práctica pedagógica realizadas",
        tipo: "Académico",
        disponible: false,
        razon: "Aún no has completado las horas requeridas",
      },
    ],
    documentos: [
      {
        nombre: "Cédula de Ciudadanía",
        tipo: "Identificación",
        estado: "Aprobado",
        fechaCarga: "2021-02-15",
      },
      {
        nombre: "Diploma Bachiller",
        tipo: "Académico",
        estado: "Aprobado",
        fechaCarga: "2021-02-15",
      },
      {
        nombre: "Certificado ICFES",
        tipo: "Académico",
        estado: "Aprobado",
        fechaCarga: "2021-02-15",
      },
      {
        nombre: "Foto 3x4",
        tipo: "Personal",
        estado: "Aprobado",
        fechaCarga: "2021-02-15",
      },
      {
        nombre: "Certificado Afiliación EPS",
        tipo: "Salud",
        estado: "Pendiente Actualización",
        fechaCarga: "2021-02-15",
        observacion: "Documento próximo a vencer",
      },
    ],
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return "bg-green-100 text-green-800"
      case "Pendiente Actualización":
        return "bg-yellow-100 text-yellow-800"
      case "Rechazado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNovedadIcon = (tipo: string) => {
    switch (tipo) {
      case "academica":
        return "bg-blue-100 text-blue-600"
      case "administrativa":
        return "bg-purple-100 text-purple-600"
      case "financiera":
        return "bg-green-100 text-green-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
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
                <BreadcrumbPage>Mi Perfil</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header del Perfil */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={estudiante.personal.foto || "/placeholder.svg"} />
                <AvatarFallback className="text-4xl">MG</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{estudiante.personal.nombre}</h1>
                <p className="text-lg opacity-90 mb-1">{estudiante.academica.programa}</p>
                <p className="opacity-80">Código: {estudiante.academica.codigo}</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  <Badge className="bg-white text-blue-600">Semestre {estudiante.academica.semestre}</Badge>
                  <Badge className="bg-white text-purple-600">{estudiante.academica.estado}</Badge>
                  <Badge className="bg-white text-green-600">Promedio: {estudiante.academica.promedioAcumulado}</Badge>
                </div>
              </div>
              <Button variant="secondary" size="lg" onClick={() => setEditMode(!editMode)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Información */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="academica">Información Académica</TabsTrigger>
            <TabsTrigger value="novedades">Novedades</TabsTrigger>
            <TabsTrigger value="certificados">Certificados</TabsTrigger>
            <TabsTrigger value="documentos">Documentación</TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Datos Personales
                </CardTitle>
                <CardDescription>Información básica del estudiante</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <IdCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Documento</p>
                        <p className="font-medium">
                          {estudiante.personal.tipoDocumento}: {estudiante.personal.documento}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</p>
                        <p className="font-medium">
                          {estudiante.personal.fechaNacimiento} ({estudiante.personal.edad} años)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Género</p>
                        <p className="font-medium">{estudiante.personal.genero}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Estado Civil</p>
                        <p className="font-medium">{estudiante.personal.estadoCivil}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Institucional</p>
                        <p className="font-medium">{estudiante.personal.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Personal</p>
                        <p className="font-medium">{estudiante.personal.emailPersonal}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{estudiante.personal.telefono}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                        <p className="font-medium">{estudiante.personal.direccion}</p>
                        <p className="text-sm text-muted-foreground">
                          {estudiante.personal.ciudad}, {estudiante.personal.departamento}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información Académica */}
          <TabsContent value="academica" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Programa Académico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Programa</p>
                    <p className="font-semibold text-lg">{estudiante.academica.programa}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Facultad</p>
                    <p className="font-medium">{estudiante.academica.facultad}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Modalidad</p>
                      <p className="font-medium">{estudiante.academica.modalidad}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Jornada</p>
                      <p className="font-medium">{estudiante.academica.jornada}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                      {estudiante.academica.estado}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Rendimiento Académico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-600">Promedio Acumulado</p>
                      <p className="text-2xl font-bold text-blue-700">{estudiante.academica.promedioAcumulado}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-600">Promedio Semestre</p>
                      <p className="text-2xl font-bold text-purple-700">{estudiante.academica.promedioSemestre}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Progreso de Créditos</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                          style={{
                            width: `${(estudiante.academica.creditosAprobados / estudiante.academica.creditosTotales) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {estudiante.academica.creditosAprobados}/{estudiante.academica.creditosTotales}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Materias Aprobadas</p>
                      <p className="text-xl font-bold text-green-600">{estudiante.academica.materiasAprobadas}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Materias Reprobadas</p>
                      <p className="text-xl font-bold text-red-600">{estudiante.academica.materiasReprobadas}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Información de Ingreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Período de Ingreso</p>
                    <p className="font-semibold text-lg">{estudiante.academica.periodoIngreso}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Período Actual</p>
                    <p className="font-semibold text-lg">{estudiante.academica.periodoActual}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Semestre Actual</p>
                    <p className="font-semibold text-lg">{estudiante.academica.semestre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo de Estudiante</p>
                    <p className="font-semibold text-lg">{estudiante.academica.tipoEstudiante}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Novedades */}
          <TabsContent value="novedades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Novedades Recientes
                </CardTitle>
                <CardDescription>Mantente al día con las últimas actualizaciones y notificaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {estudiante.novedades.map((novedad, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getNovedadIcon(novedad.tipo)}`}>
                          <novedad.icono className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold">{novedad.titulo}</h4>
                            <Badge
                              variant={
                                novedad.estado === "nueva"
                                  ? "default"
                                  : novedad.estado === "pendiente"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {novedad.estado}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{novedad.descripcion}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {novedad.fecha}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificados */}
          <TabsContent value="certificados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificados Disponibles
                </CardTitle>
                <CardDescription>Descarga los certificados que necesites en cualquier momento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {estudiante.certificados.map((certificado, index) => (
                    <Card key={index} className={!certificado.disponible ? "opacity-60" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{certificado.nombre}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{certificado.descripcion}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{certificado.tipo}</Badge>
                              {certificado.disponible ? (
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline">
                                        <Eye className="h-4 w-4 mr-1" />
                                        Ver
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh]">
                                      <DialogHeader>
                                        <DialogTitle>{certificado.nombre}</DialogTitle>
                                      </DialogHeader>
                                      <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                                        <p className="text-muted-foreground">Vista previa del certificado</p>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button size="sm">
                                    <Download className="h-4 w-4 mr-1" />
                                    Descargar
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-xs text-red-600">{certificado.razon}</p>
                              )}
                            </div>
                            {certificado.disponible && certificado.ultimaEmision && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Última emisión: {certificado.ultimaEmision}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentación */}
          <TabsContent value="documentos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documentación Adjunta
                    </CardTitle>
                    <CardDescription>Documentos cargados en tu expediente académico</CardDescription>
                  </div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Cargar Documento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {estudiante.documentos.map((documento, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{documento.nombre}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {documento.tipo}
                              </Badge>
                              <p className="text-xs text-muted-foreground">Cargado: {documento.fechaCarga}</p>
                            </div>
                            {documento.observacion && (
                              <p className="text-xs text-orange-600 mt-1">{documento.observacion}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getEstadoColor(documento.estado)}>{documento.estado}</Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
