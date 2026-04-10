"use client"

import { useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  Search,
  Monitor,
  Lightbulb,
  Gamepad2,
  Music,
  Armchair,
  Shirt,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

// Datos de ejemplo para el inventario
const inventario = [
  {
    id: 1,
    nombre: "Laptop Dell Inspiron 15",
    categoria: "Computadores",
    disponibles: 8,
    total: 12,
    estado: "disponible",
    descripcion: "Laptop con Intel i5, 8GB RAM, 256GB SSD",
    imagen: "/placeholder.svg?height=200&width=200&text=Laptop",
    icon: Monitor,
  },
  {
    id: 2,
    nombre: 'Ring Light LED 18"',
    categoria: "Iluminación",
    disponibles: 5,
    total: 8,
    estado: "disponible",
    descripcion: "Luz LED circular con trípode ajustable",
    imagen: "/placeholder.svg?height=200&width=200&text=Ring+Light",
    icon: Lightbulb,
  },
  {
    id: 3,
    nombre: "PlayStation 5",
    categoria: "Consolas",
    disponibles: 0,
    total: 3,
    estado: "agotado",
    descripcion: "Consola de videojuegos Sony PlayStation 5",
    imagen: "/placeholder.svg?height=200&width=200&text=PS5",
    icon: Gamepad2,
  },
  {
    id: 4,
    nombre: "Micrófono Blue Yeti",
    categoria: "Audio",
    disponibles: 3,
    total: 6,
    estado: "disponible",
    descripcion: "Micrófono USB profesional para grabación",
    imagen: "/placeholder.svg?height=200&width=200&text=Micrófono",
    icon: Music,
  },
  {
    id: 5,
    nombre: "Escritorio Ajustable",
    categoria: "Mobiliario",
    disponibles: 2,
    total: 10,
    estado: "pocos",
    descripcion: "Escritorio con altura ajustable eléctrica",
    imagen: "/placeholder.svg?height=200&width=200&text=Escritorio",
    icon: Armchair,
  },
  {
    id: 6,
    nombre: "Camiseta Universidad",
    categoria: "Ropa",
    disponibles: 15,
    total: 20,
    estado: "disponible",
    descripcion: "Camiseta oficial de la universidad, varias tallas",
    imagen: "/placeholder.svg?height=200&width=200&text=Camiseta",
    icon: Shirt,
  },
]

// Datos de préstamos activos
const prestamosActivos = [
  {
    id: 1,
    item: "Laptop Dell Inspiron 15",
    fechaPrestamo: "2024-01-10",
    fechaDevolucion: "2024-01-17",
    estado: "activo",
    diasRestantes: 3,
  },
  {
    id: 2,
    item: 'Ring Light LED 18"',
    fechaPrestamo: "2024-01-08",
    fechaDevolucion: "2024-01-15",
    estado: "vencido",
    diasRestantes: -1,
  },
]

export default function CREPPage() {
  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas")
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)

  const categorias = ["todas", "Computadores", "Iluminación", "Consolas", "Audio", "Mobiliario", "Ropa"]

  const inventarioFiltrado = inventario.filter((item) => {
    const coincideBusqueda =
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.categoria.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro === "todas" || item.categoria === categoriaFiltro
    return coincideBusqueda && coincideCategoria
  })

  const handleSolicitudPrestamo = (item: any) => {
    setItemSeleccionado(item)
    setDialogAbierto(true)
  }

  const getEstadoBadge = (estado: string, disponibles: number, total: number) => {
    switch (estado) {
      case "disponible":
        return (
          <Badge className="bg-green-100 text-green-800">
            Disponible ({disponibles}/{total})
          </Badge>
        )
      case "pocos":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Pocos ({disponibles}/{total})
          </Badge>
        )
      case "agotado":
        return <Badge className="bg-red-100 text-red-800">Agotado (0/{total})</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getEstadoPrestamo = (estado: string, diasRestantes: number) => {
    if (estado === "vencido") {
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Vencido
        </Badge>
      )
    } else if (diasRestantes <= 2) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Por vencer
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Activo
        </Badge>
      )
    }
  }

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
              <BreadcrumbPage>CREP - Préstamos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header del CREP */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67</div>
              <p className="text-xs text-muted-foreground">En inventario</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">33</div>
              <p className="text-xs text-muted-foreground">Listos para préstamo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Préstamos</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">2</div>
              <p className="text-xs text-muted-foreground">Activos actualmente</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Vencimiento</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">3</div>
              <p className="text-xs text-muted-foreground">Días restantes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventario" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
            <TabsTrigger value="mis-prestamos">Mis Préstamos</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="inventario" className="space-y-4">
            {/* Filtros y búsqueda */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria === "todas" ? "Todas las categorías" : categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid de inventario */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inventarioFiltrado.map((item) => {
                const IconComponent = item.icon
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{item.nombre}</CardTitle>
                        </div>
                        {getEstadoBadge(item.estado, item.disponibles, item.total)}
                      </div>
                      <CardDescription>{item.categoria}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <img
                        src={item.imagen || "/placeholder.svg"}
                        alt={item.nombre}
                        className="w-full h-32 object-cover rounded-md bg-gray-100"
                      />
                      <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                      <Button
                        className="w-full"
                        disabled={item.disponibles === 0}
                        onClick={() => handleSolicitudPrestamo(item)}
                      >
                        {item.disponibles === 0 ? "No Disponible" : "Solicitar Préstamo"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="mis-prestamos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Préstamos Activos</CardTitle>
                <CardDescription>Equipos que tienes actualmente en préstamo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prestamosActivos.map((prestamo) => (
                    <div key={prestamo.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{prestamo.item}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Prestado: {prestamo.fechaPrestamo}</span>
                          <span>Vence: {prestamo.fechaDevolucion}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEstadoPrestamo(prestamo.estado, prestamo.diasRestantes)}
                        <Button variant="outline" size="sm">
                          Renovar
                        </Button>
                        <Button variant="outline" size="sm">
                          Devolver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Préstamos</CardTitle>
                <CardDescription>Todos tus préstamos anteriores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">MacBook Pro 13"</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Prestado: 2023-12-01</span>
                        <span>Devuelto: 2023-12-08</span>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Cámara Canon EOS</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Prestado: 2023-11-15</span>
                        <span>Devuelto: 2023-11-22</span>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Completado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para solicitud de préstamo */}
        <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Solicitar Préstamo</DialogTitle>
              <DialogDescription>
                Completa la información para solicitar el préstamo de {itemSeleccionado?.nombre}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fecha-inicio" className="text-right">
                  Fecha Inicio
                </Label>
                <Input id="fecha-inicio" type="date" className="col-span-3" defaultValue="2024-01-15" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fecha-fin" className="text-right">
                  Fecha Fin
                </Label>
                <Input id="fecha-fin" type="date" className="col-span-3" defaultValue="2024-01-22" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="proposito" className="text-right">
                  Propósito
                </Label>
                <Textarea
                  id="proposito"
                  placeholder="Describe para qué necesitas el equipo..."
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setDialogAbierto(false)}>
                Enviar Solicitud
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarInset>
  )
}
