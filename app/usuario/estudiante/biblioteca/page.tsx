"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  BookOpen,
  Download,
  Eye,
  Star,
  Clock,
  User,
  Calendar,
  Tag,
  Heart,
  Bookmark,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Datos de ejemplo para la biblioteca
const librosDisponibles = [
  {
    id: 1,
    titulo: "Algoritmos y Estructuras de Datos",
    autor: "Thomas H. Cormen",
    categoria: "Programación",
    año: 2022,
    editorial: "MIT Press",
    isbn: "978-0262046305",
    disponible: true,
    formato: "PDF",
    paginas: 1312,
    idioma: "Español",
    rating: 4.8,
    descargas: 1250,
    fechaSubida: "2024-01-10",
    descripcion: "Guía completa sobre algoritmos fundamentales y estructuras de datos para ciencias de la computación.",
    tags: ["Algoritmos", "Estructuras", "Programación", "Ciencias de la Computación"],
    portada: "/placeholder.svg?height=200&width=150&text=Algoritmos",
  },
  {
    id: 2,
    titulo: "Ingeniería de Software Moderna",
    autor: "Ian Sommerville",
    categoria: "Ingeniería de Software",
    año: 2023,
    editorial: "Pearson",
    isbn: "978-0137943913",
    disponible: true,
    formato: "PDF",
    paginas: 816,
    idioma: "Español",
    rating: 4.6,
    descargas: 980,
    fechaSubida: "2024-01-08",
    descripcion: "Metodologías ágiles y prácticas modernas en el desarrollo de software empresarial.",
    tags: ["Ingeniería", "Software", "Metodologías", "Desarrollo"],
    portada: "/placeholder.svg?height=200&width=150&text=Ing+Software",
  },
  {
    id: 3,
    titulo: "Bases de Datos: Conceptos Fundamentales",
    autor: "Abraham Silberschatz",
    categoria: "Bases de Datos",
    año: 2021,
    editorial: "McGraw-Hill",
    isbn: "978-0078022159",
    disponible: false,
    formato: "PDF",
    paginas: 1376,
    idioma: "Español",
    rating: 4.7,
    descargas: 1450,
    fechaSubida: "2024-01-05",
    descripcion: "Fundamentos teóricos y prácticos de sistemas de gestión de bases de datos relacionales y NoSQL.",
    tags: ["Bases de Datos", "SQL", "NoSQL", "Sistemas"],
    portada: "/placeholder.svg?height=200&width=150&text=Bases+Datos",
  },
  {
    id: 4,
    titulo: "Inteligencia Artificial: Un Enfoque Moderno",
    autor: "Stuart Russell",
    categoria: "Inteligencia Artificial",
    año: 2023,
    editorial: "Prentice Hall",
    isbn: "978-0134610993",
    disponible: true,
    formato: "PDF",
    paginas: 1152,
    idioma: "Español",
    rating: 4.9,
    descargas: 2100,
    fechaSubida: "2024-01-12",
    descripcion: "Introducción completa a la inteligencia artificial, machine learning y deep learning.",
    tags: ["IA", "Machine Learning", "Deep Learning", "Algoritmos"],
    portada: "/placeholder.svg?height=200&width=150&text=IA+Moderna",
  },
  {
    id: 5,
    titulo: "Redes de Computadoras",
    autor: "Andrew S. Tanenbaum",
    categoria: "Redes",
    año: 2022,
    editorial: "Pearson",
    isbn: "978-0132126953",
    disponible: true,
    formato: "PDF",
    paginas: 960,
    idioma: "Español",
    rating: 4.5,
    descargas: 875,
    fechaSubida: "2024-01-07",
    descripcion: "Fundamentos de redes de computadoras, protocolos de comunicación y arquitecturas de red.",
    tags: ["Redes", "Protocolos", "TCP/IP", "Comunicaciones"],
    portada: "/placeholder.svg?height=200&width=150&text=Redes",
  },
  {
    id: 6,
    titulo: "Cálculo Diferencial e Integral",
    autor: "James Stewart",
    categoria: "Matemáticas",
    año: 2021,
    editorial: "Cengage Learning",
    isbn: "978-1285741550",
    disponible: true,
    formato: "PDF",
    paginas: 1368,
    idioma: "Español",
    rating: 4.4,
    descargas: 1680,
    fechaSubida: "2024-01-03",
    descripcion: "Texto fundamental para el estudio del cálculo diferencial e integral con aplicaciones.",
    tags: ["Cálculo", "Matemáticas", "Derivadas", "Integrales"],
    portada: "/placeholder.svg?height=200&width=150&text=Cálculo",
  },
]

const recursosRecientes = [
  {
    id: 1,
    titulo: "Guía de Programación en Python",
    tipo: "Documento",
    fechaAcceso: "2024-01-15",
    autor: "María García",
  },
  {
    id: 2,
    titulo: "Tutorial de React Avanzado",
    tipo: "Video",
    fechaAcceso: "2024-01-14",
    autor: "Carlos López",
  },
  {
    id: 3,
    titulo: "Ejercicios de Algoritmos",
    tipo: "Práctica",
    fechaAcceso: "2024-01-13",
    autor: "Ana Martínez",
  },
]

const estadisticasBiblioteca = {
  totalLibros: 1247,
  librosDisponibles: 1089,
  descargas: 15420,
  usuariosActivos: 342,
}

export default function BibliotecaPage() {
  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas")
  const [librosFiltrados, setLibrosFiltrados] = useState(librosDisponibles)

  const filtrarLibros = () => {
    let libros = librosDisponibles

    if (busqueda) {
      libros = libros.filter(
        (libro) =>
          libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          libro.autor.toLowerCase().includes(busqueda.toLowerCase()) ||
          libro.tags.some((tag) => tag.toLowerCase().includes(busqueda.toLowerCase())),
      )
    }

    if (categoriaFiltro !== "todas") {
      libros = libros.filter((libro) => libro.categoria === categoriaFiltro)
    }

    setLibrosFiltrados(libros)
  }

  const handleBusqueda = (valor: string) => {
    setBusqueda(valor)
    setTimeout(filtrarLibros, 300)
  }

  const handleFiltroCategoria = (categoria: string) => {
    setCategoriaFiltro(categoria)
    setTimeout(filtrarLibros, 100)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Panel Principal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Biblioteca Digital</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header de la Biblioteca */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Biblioteca Digital</h1>
              <p className="text-blue-100">Accede a miles de recursos académicos y libros especializados</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{estadisticasBiblioteca.totalLibros}</div>
                <div className="text-sm text-blue-100">Total Libros</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{estadisticasBiblioteca.librosDisponibles}</div>
                <div className="text-sm text-blue-100">Disponibles</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{estadisticasBiblioteca.descargas.toLocaleString()}</div>
                <div className="text-sm text-blue-100">Descargas</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{estadisticasBiblioteca.usuariosActivos}</div>
                <div className="text-sm text-blue-100">Usuarios Activos</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="catalogo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
            <TabsTrigger value="favoritos">Mis Favoritos</TabsTrigger>
            <TabsTrigger value="recientes">Recientes</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogo" className="space-y-4">
            {/* Barra de Búsqueda y Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar libros, autores, temas..."
                  value={busqueda}
                  onChange={(e) => handleBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoriaFiltro} onValueChange={handleFiltroCategoria}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  <SelectItem value="Programación">Programación</SelectItem>
                  <SelectItem value="Ingeniería de Software">Ingeniería de Software</SelectItem>
                  <SelectItem value="Bases de Datos">Bases de Datos</SelectItem>
                  <SelectItem value="Inteligencia Artificial">Inteligencia Artificial</SelectItem>
                  <SelectItem value="Redes">Redes</SelectItem>
                  <SelectItem value="Matemáticas">Matemáticas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grid de Libros */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {librosFiltrados.map((libro) => (
                <Card key={libro.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex gap-4">
                      <img
                        src={libro.portada || "/placeholder.svg"}
                        alt={libro.titulo}
                        className="w-16 h-20 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2 mb-1">{libro.titulo}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mb-2">
                          <User className="h-3 w-3" />
                          {libro.autor}
                        </CardDescription>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {libro.categoria}
                          </Badge>
                          <Badge variant={libro.disponible ? "default" : "destructive"} className="text-xs">
                            {libro.disponible ? "Disponible" : "No disponible"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{libro.descripcion}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {libro.año}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {libro.paginas} pág.
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {libro.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {libro.descargas}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {libro.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" disabled={!libro.disponible}>
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" disabled={!libro.disponible}>
                        <Download className="h-3 w-3 mr-1" />
                        Reservar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {librosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
                <p className="text-muted-foreground">Intenta con otros términos de búsqueda o cambia los filtros</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favoritos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Mis Libros Favoritos
                </CardTitle>
                <CardDescription>Libros que has marcado como favoritos para acceso rápido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes favoritos aún</h3>
                  <p className="text-muted-foreground mb-4">Marca libros como favoritos para encontrarlos fácilmente</p>
                  <Button variant="outline">Explorar Catálogo</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recientes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recursos Recientes
                </CardTitle>
                <CardDescription>Últimos libros y recursos que has consultado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recursosRecientes.map((recurso) => (
                    <div
                      key={recurso.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{recurso.titulo}</h4>
                          <p className="text-sm text-muted-foreground">
                            {recurso.tipo} • {recurso.autor}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{recurso.fechaAcceso}</p>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
