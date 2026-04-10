"use client";

import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  MapPin,
  Clock,
  Trophy,
  Heart,
  UserPlus,
  Search,
  Filter,
  Star,
  MessageCircle,
  Share2,
} from "lucide-react";

const gruposDeportivos = [
  {
    id: 1,
    nombre: "Fútbol Universitario",
    categoria: "Deportes",
    descripcion:
      "Equipo de fútbol masculino y femenino. Entrenamientos regulares y participación en torneos interuniversitarios.",
    miembros: 45,
    horario: "Lunes y Miércoles 4:00 PM - 6:00 PM",
    ubicacion: "Cancha Principal",
    coordinador: "Prof. Carlos Mendoza",
    imagen: "/placeholder.svg?height=200&width=300&text=Fútbol",
    estado: "Activo",
    nivel: "Intermedio",
    inscrito: true,
  },
  {
    id: 2,
    nombre: "Voleibol Mixto",
    categoria: "Deportes",
    descripcion:
      "Grupo de voleibol para todos los niveles. Ambiente inclusivo y divertido para aprender y competir.",
    miembros: 28,
    horario: "Martes y Jueves 5:00 PM - 7:00 PM",
    ubicacion: "Gimnasio Cubierto",
    coordinador: "Lic. Ana García",
    imagen: "/placeholder.svg?height=200&width=300&text=Voleibol",
    estado: "Activo",
    nivel: "Principiante",
    inscrito: false,
  },
  {
    id: 3,
    nombre: "Baloncesto Universitario",
    categoria: "Deportes",
    descripcion:
      "Equipo competitivo de baloncesto. Entrenamientos intensivos y participación en ligas estudiantiles.",
    miembros: 32,
    horario: "Lunes, Miércoles y Viernes 6:00 PM - 8:00 PM",
    ubicacion: "Cancha de Baloncesto",
    coordinador: "Coach Miguel Torres",
    imagen: "/placeholder.svg?height=200&width=300&text=Baloncesto",
    estado: "Activo",
    nivel: "Avanzado",
    inscrito: false,
  },
];

const gruposCulturales = [
  {
    id: 4,
    nombre: "Danza Urbana",
    categoria: "Cultural",
    descripcion:
      "Grupo de danza urbana y hip-hop. Coreografías modernas y presentaciones en eventos universitarios.",
    miembros: 22,
    horario: "Martes y Jueves 7:00 PM - 9:00 PM",
    ubicacion: "Salón de Danza",
    coordinador: "Inst. Laura Jiménez",
    imagen: "/placeholder.svg?height=200&width=300&text=Danza+Urbana",
    estado: "Activo",
    nivel: "Intermedio",
    inscrito: true,
  },
  {
    id: 5,
    nombre: "Teatro Universitario",
    categoria: "Cultural",
    descripcion:
      "Grupo de teatro para desarrollar habilidades actorales y presentar obras en el campus.",
    miembros: 18,
    horario: "Miércoles y Viernes 6:00 PM - 8:00 PM",
    ubicacion: "Auditorio Principal",
    coordinador: "Prof. Roberto Silva",
    imagen: "/placeholder.svg?height=200&width=300&text=Teatro",
    estado: "Activo",
    nivel: "Principiante",
    inscrito: false,
  },
  {
    id: 6,
    nombre: "Banda Musical",
    categoria: "Cultural",
    descripcion:
      "Banda universitaria para músicos de todos los instrumentos. Presentaciones en eventos especiales.",
    miembros: 35,
    horario: "Lunes y Viernes 5:00 PM - 7:00 PM",
    ubicacion: "Sala de Música",
    coordinador: "Mtro. Patricia López",
    imagen: "/placeholder.svg?height=200&width=300&text=Banda+Musical",
    estado: "Activo",
    nivel: "Intermedio",
    inscrito: false,
  },
];

const gruposAcademicos = [
  {
    id: 7,
    nombre: "Club de Programación",
    categoria: "Académico",
    descripcion:
      "Grupo para desarrolladores. Hackathons, workshops y proyectos colaborativos de programación.",
    miembros: 67,
    horario: "Sábados 2:00 PM - 5:00 PM",
    ubicacion: "Laboratorio de Sistemas",
    coordinador: "Ing. David Ramírez",
    imagen: "/placeholder.svg?height=200&width=300&text=Programación",
    estado: "Activo",
    nivel: "Intermedio",
    inscrito: true,
  },
  {
    id: 8,
    nombre: "Robótica y IA",
    categoria: "Académico",
    descripcion:
      "Investigación y desarrollo en robótica e inteligencia artificial. Competencias nacionales.",
    miembros: 24,
    horario: "Martes y Jueves 3:00 PM - 6:00 PM",
    ubicacion: "Lab. de Robótica",
    coordinador: "Dr. Elena Vargas",
    imagen: "/placeholder.svg?height=200&width=300&text=Robótica",
    estado: "Activo",
    nivel: "Avanzado",
    inscrito: false,
  },
];

const misGrupos = [
  gruposDeportivos[0], // Fútbol
  gruposCulturales[0], // Danza Urbana
  gruposAcademicos[0], // Club de Programación
];

export default function GruposInteresPage() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  const todosLosGrupos = [
    ...gruposDeportivos,
    ...gruposCulturales,
    ...gruposAcademicos,
  ];

  const gruposFiltrados = todosLosGrupos.filter((grupo) => {
    const coincideBusqueda =
      grupo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      grupo.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoriaFiltro === "todos" ||
      grupo.categoria.toLowerCase() === categoriaFiltro.toLowerCase();
    return coincideBusqueda && coincideCategoria;
  });

  const handleInscribirse = (grupoId: any) => {
    console.log(`Inscribirse al grupo ${grupoId}`);
    // Aquí iría la lógica de inscripción
  };

  const handleDesinscribirse = (grupoId: any) => {
    console.log(`Desinscribirse del grupo ${grupoId}`);
    // Aquí iría la lógica de desinscripción
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
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
              <BreadcrumbPage>Grupos de Interés</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header con estadísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Grupos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todosLosGrupos.length}</div>
              <p className="text-xs text-muted-foreground">
                Disponibles para unirse
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Grupos</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{misGrupos.length}</div>
              <p className="text-xs text-muted-foreground">Grupos inscritos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deportivos</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gruposDeportivos.length}
              </div>
              <p className="text-xs text-muted-foreground">Equipos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Culturales</CardTitle>
              <Star className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gruposCulturales.length}
              </div>
              <p className="text-xs text-muted-foreground">Grupos artísticos</p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar grupos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="todos">Todas las categorías</option>
                <option value="deportes">Deportes</option>
                <option value="cultural">Cultural</option>
                <option value="académico">Académico</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenido principal con tabs */}
        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todos">Todos los Grupos</TabsTrigger>
            <TabsTrigger value="mis-grupos">Mis Grupos</TabsTrigger>
            <TabsTrigger value="deportivos">Deportivos</TabsTrigger>
            <TabsTrigger value="culturales">Culturales</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gruposFiltrados.map((grupo) => (
                <Card
                  key={grupo.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {grupo.nombre}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              grupo.categoria === "Deportes"
                                ? "default"
                                : grupo.categoria === "Cultural"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {grupo.categoria}
                          </Badge>
                          <Badge variant="outline">{grupo.nivel}</Badge>
                        </div>
                      </div>
                      {grupo.inscrito && (
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={grupo.imagen || "/placeholder.svg"}
                      alt={grupo.nombre}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {grupo.descripcion}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.miembros} miembros</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.horario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.ubicacion}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {grupo.inscrito ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleDesinscribirse(grupo.id)}
                        >
                          Desinscribirse
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleInscribirse(grupo.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Unirse
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Ver más
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{grupo.nombre}</DialogTitle>
                            <DialogDescription>
                              Información detallada del grupo
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img
                              src={grupo.imagen || "/placeholder.svg"}
                              alt={grupo.nombre}
                              className="w-full h-48 object-cover rounded-md"
                            />
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-semibold">
                                  Información General
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <strong>Coordinador:</strong>{" "}
                                    {grupo.coordinador}
                                  </p>
                                  <p>
                                    <strong>Miembros:</strong> {grupo.miembros}
                                  </p>
                                  <p>
                                    <strong>Nivel:</strong> {grupo.nivel}
                                  </p>
                                  <p>
                                    <strong>Estado:</strong> {grupo.estado}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold">
                                  Horarios y Ubicación
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <strong>Horario:</strong> {grupo.horario}
                                  </p>
                                  <p>
                                    <strong>Ubicación:</strong>{" "}
                                    {grupo.ubicacion}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold">Descripción</h4>
                              <p className="text-sm text-muted-foreground">
                                {grupo.descripcion}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {grupo.inscrito ? (
                                <Button
                                  variant="outline"
                                  onClick={() => handleDesinscribirse(grupo.id)}
                                >
                                  Desinscribirse
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleInscribirse(grupo.id)}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Unirse al Grupo
                                </Button>
                              )}
                              <Button variant="outline">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contactar
                              </Button>
                              <Button variant="outline">
                                <Share2 className="h-4 w-4 mr-2" />
                                Compartir
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mis-grupos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {misGrupos.map((grupo) => (
                <Card key={grupo.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {grupo.nombre}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{grupo.categoria}</Badge>
                          <Badge variant="outline">{grupo.nivel}</Badge>
                        </div>
                      </div>
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={grupo.imagen || "/placeholder.svg"}
                      alt={grupo.nombre}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {grupo.descripcion}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.miembros} miembros</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.horario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.ubicacion}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                      >
                        Ver Actividades
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deportivos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gruposDeportivos.map((grupo) => (
                <Card
                  key={grupo.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {grupo.nombre}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Deportes</Badge>
                          <Badge variant="outline">{grupo.nivel}</Badge>
                        </div>
                      </div>
                      {grupo.inscrito && (
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={grupo.imagen || "/placeholder.svg"}
                      alt={grupo.nombre}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {grupo.descripcion}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.miembros} miembros</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.horario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.ubicacion}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {grupo.inscrito ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                        >
                          Desinscribirse
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Unirse
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Ver más
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="culturales" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gruposCulturales.map((grupo) => (
                <Card
                  key={grupo.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {grupo.nombre}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Cultural</Badge>
                          <Badge variant="outline">{grupo.nivel}</Badge>
                        </div>
                      </div>
                      {grupo.inscrito && (
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={grupo.imagen || "/placeholder.svg"}
                      alt={grupo.nombre}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {grupo.descripcion}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.miembros} miembros</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.horario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{grupo.ubicacion}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {grupo.inscrito ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                        >
                          Desinscribirse
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Unirse
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Ver más
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
