"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Bus, Plus, Search, MapPin, Clock, Users, User, Settings } from "lucide-react"
import { rutasList } from "./data"

export default function RoutesManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateRouteOpen, setIsCreateRouteOpen] = useState(false)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)
  const [routeForm, setRouteForm] = useState({
    nombre: "",
    conductor: { nombre: "", telefono: "", licencia: "" },
    vehiculo: { placa: "", modelo: "", capacidad: "", estado: "Activo" },
    horarios: { salida: "", llegada: "", salidaTarde: "", llegadaTarde: "" },
    paradas: "",
    estado: "Activa",
  })

  // Filtrar rutas por búsqueda
  const filteredRoutes = rutasList.filter(
    (ruta) =>
      ruta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruta.conductor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruta.vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Datos para gráfica de zonas más concurridas
  const zonasData = rutasList
    .reduce((acc: any[], ruta) => {
      ruta.paradas.forEach((parada) => {
        if (parada !== "Colegio") {
          const estudiantesEnParada = ruta.estudiantes.filter((est) => est.parada === parada).length
          const existingZona = acc.find((zona) => zona.name === parada)
          if (existingZona) {
            existingZona.estudiantes += estudiantesEnParada
          } else {
            acc.push({ name: parada, estudiantes: estudiantesEnParada })
          }
        }
      })
      return acc
    }, [])
    .sort((a, b) => b.estudiantes - a.estudiantes)
    .slice(0, 8)

  const handleCreateRoute = () => {
    console.log("Crear ruta:", routeForm)
    setIsCreateRouteOpen(false)
    setRouteForm({
      nombre: "",
      conductor: { nombre: "", telefono: "", licencia: "" },
      vehiculo: { placa: "", modelo: "", capacidad: "", estado: "Activo" },
      horarios: { salida: "", llegada: "", salidaTarde: "", llegadaTarde: "" },
      paradas: "",
      estado: "Activa",
    })
  }

  const handleAddStudent = () => {
    console.log("Agregar estudiante a ruta:", selectedRoute?.id)
    setIsAddStudentOpen(false)
    setSelectedRoute(null)
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "Activa":
        return "bg-green-100 text-green-800"
      case "Inactiva":
        return "bg-gray-100 text-gray-800"
      case "Mantenimiento":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Rutas</h2>
        <Button onClick={() => setIsCreateRouteOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nueva Ruta</span>
        </Button>
      </div>

      {/* Gráfica de zonas más concurridas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Zonas Más Concurridas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {/* <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zonasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="estudiantes" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer> */}
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Zona principal:</strong> {zonasData[0]?.name} con {zonasData[0]?.estudiantes} estudiantes
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Total de estudiantes transportados:</strong>{" "}
              {rutasList.reduce((acc, ruta) => acc + ruta.estudiantes.length, 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por nombre de ruta, conductor o placa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de rutas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoutes.map((ruta) => (
          <Card key={ruta.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Bus className="w-5 h-5" />
                  <span>{ruta.nombre}</span>
                </CardTitle>
                <Badge className={getEstadoBadgeColor(ruta.estado)}>{ruta.estado}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Información del conductor */}
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-medium">{ruta.conductor.nombre}</p>
                  <p className="text-sm text-muted-foreground">{ruta.conductor.telefono}</p>
                </div>
              </div>

              {/* Información del vehículo */}
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-green-500" />
                <div>
                  <p className="font-medium">
                    {ruta.vehiculo.placa} - {ruta.vehiculo.modelo}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Capacidad: {ruta.vehiculo.capacidad} - Estado: {ruta.vehiculo.estado}
                  </p>
                </div>
              </div>

              {/* Horarios */}
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm">
                    <strong>Mañana:</strong> {ruta.horarios.salida} - {ruta.horarios.llegada}
                  </p>
                  <p className="text-sm">
                    <strong>Tarde:</strong> {ruta.horarios.salidaTarde} - {ruta.horarios.llegadaTarde}
                  </p>
                </div>
              </div>

              {/* Estudiantes */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">{ruta.estudiantes.length} estudiantes</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRoute(ruta)
                    setIsAddStudentOpen(true)
                  }}
                >
                  Agregar Estudiante
                </Button>
              </div>

              {/* Lista de estudiantes */}
              <div className="max-h-32 overflow-y-auto space-y-1">
                {ruta.estudiantes.map((estudiante) => (
                  <div key={estudiante.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                    <span>
                      {estudiante.nombre} - {estudiante.grado}
                    </span>
                    <span className="text-muted-foreground">{estudiante.parada}</span>
                  </div>
                ))}
              </div>

              {/* Paradas */}
              <div>
                <p className="font-medium text-sm mb-2">Paradas:</p>
                <div className="flex flex-wrap gap-1">
                  {ruta.paradas.map((parada, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {parada}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo para crear nueva ruta */}
      <Dialog open={isCreateRouteOpen} onOpenChange={setIsCreateRouteOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Ruta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Ruta</Label>
              <Input
                id="nombre"
                value={routeForm.nombre}
                onChange={(e) => setRouteForm({ ...routeForm, nombre: e.target.value })}
                placeholder="Ej: Ruta Centro"
              />
            </div>

            <Separator />
            <h3 className="font-semibold">Información del Conductor</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="conductorNombre">Nombre del Conductor</Label>
                <Input
                  id="conductorNombre"
                  value={routeForm.conductor.nombre}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      conductor: { ...routeForm.conductor, nombre: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="conductorTelefono">Teléfono</Label>
                <Input
                  id="conductorTelefono"
                  value={routeForm.conductor.telefono}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      conductor: { ...routeForm.conductor, telefono: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="conductorLicencia">Número de Licencia</Label>
              <Input
                id="conductorLicencia"
                value={routeForm.conductor.licencia}
                onChange={(e) =>
                  setRouteForm({
                    ...routeForm,
                    conductor: { ...routeForm.conductor, licencia: e.target.value },
                  })
                }
              />
            </div>

            <Separator />
            <h3 className="font-semibold">Información del Vehículo</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehiculoPlaca">Placa</Label>
                <Input
                  id="vehiculoPlaca"
                  value={routeForm.vehiculo.placa}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      vehiculo: { ...routeForm.vehiculo, placa: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="vehiculoCapacidad">Capacidad</Label>
                <Input
                  id="vehiculoCapacidad"
                  type="number"
                  value={routeForm.vehiculo.capacidad}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      vehiculo: { ...routeForm.vehiculo, capacidad: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="vehiculoModelo">Modelo del Vehículo</Label>
              <Input
                id="vehiculoModelo"
                value={routeForm.vehiculo.modelo}
                onChange={(e) =>
                  setRouteForm({
                    ...routeForm,
                    vehiculo: { ...routeForm.vehiculo, modelo: e.target.value },
                  })
                }
              />
            </div>

            <Separator />
            <h3 className="font-semibold">Horarios</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="salida">Salida Mañana</Label>
                <Input
                  id="salida"
                  type="time"
                  value={routeForm.horarios.salida}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      horarios: { ...routeForm.horarios, salida: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="llegada">Llegada Mañana</Label>
                <Input
                  id="llegada"
                  type="time"
                  value={routeForm.horarios.llegada}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      horarios: { ...routeForm.horarios, llegada: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="salidaTarde">Salida Tarde</Label>
                <Input
                  id="salidaTarde"
                  type="time"
                  value={routeForm.horarios.salidaTarde}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      horarios: { ...routeForm.horarios, salidaTarde: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="llegadaTarde">Llegada Tarde</Label>
                <Input
                  id="llegadaTarde"
                  type="time"
                  value={routeForm.horarios.llegadaTarde}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      horarios: { ...routeForm.horarios, llegadaTarde: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paradas">Paradas (separadas por comas)</Label>
              <Textarea
                id="paradas"
                value={routeForm.paradas}
                onChange={(e) => setRouteForm({ ...routeForm, paradas: e.target.value })}
                placeholder="Ej: Centro Comercial, Barrio Los Rosales, Parque Principal"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateRouteOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRoute}>Crear Ruta</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para agregar estudiante a ruta */}
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Estudiante a {selectedRoute?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="estudiante">Seleccionar Estudiante</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Buscar estudiante..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">María Fernández - 4°A</SelectItem>
                  <SelectItem value="2">Carlos Mendoza - 7°B</SelectItem>
                  <SelectItem value="3">Ana Sofía Torres - 2°C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="parada">Parada de Recogida</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar parada..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedRoute?.paradas.map((parada: string, index: number) => (
                    <SelectItem key={index} value={parada}>
                      {parada}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddStudent}>Agregar Estudiante</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
