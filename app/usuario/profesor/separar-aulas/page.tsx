"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Users,
  Split,
  Plus,
  Search,
  MapPin,
  Clock,
  Settings,
  Eye,
  Loader2,
} from "lucide-react";
import { ClassroomsStore, type Classroom } from "@/Stores/ClassroomsStore";

export default function SepararAulasPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [modalSeparacion, setModalSeparacion] = useState(false);
  const [aulaSeleccionada, setAulaSeleccionada] = useState<Classroom | null>(
    null,
  );
  const [modalDetalles, setModalDetalles] = useState(false);

  // Conectar con el store de Classrooms
  const { classrooms, loading, fetchClassrooms } = ClassroomsStore();

  // Cargar las aulas al montar el componente
  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Función para obtener el texto del estado en español
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      available: "Disponible",
      occupied: "Ocupada",
      maintenance: "Mantenimiento",
      inactive: "Inactiva",
    };
    return statusMap[status] || status;
  };

  // Obtener tipos de aula únicos de los datos reales
  const tiposUnicos = Array.from(
    new Set(
      classrooms
        .map((aula: Classroom) => aula.room_type)
        .filter((tipo): tipo is string => tipo !== null && tipo !== undefined),
    ),
  ).sort();

  // Filtrar aulas
  const aulasFiltradas = classrooms.filter((aula: Classroom) => {
    const coincideBusqueda =
      aula.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      (aula.location &&
        aula.location.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideTipo =
      filtroTipo === "todos" || aula.room_type === filtroTipo;
    const coincideEstado =
      filtroEstado === "todos" || aula.status === filtroEstado;

    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  const abrirModalSeparacion = (aula: Classroom) => {
    setAulaSeleccionada(aula);
    setModalSeparacion(true);
  };

  const abrirModalDetalles = (aula: Classroom) => {
    setAulaSeleccionada(aula);
    setModalDetalles(true);
  };

  return (
    <div className="min-w-0 space-y-6 p-6  w-full ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Separar Aulas</h1>
          <p className="text-muted-foreground">
            Gestiona la separación y asignación de espacios académicos
          </p>
        </div>
        <Button onClick={() => setModalSeparacion(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Separación
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Aulas</p>
                <p className="text-2xl font-bold">{classrooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold">
                  {
                    classrooms.filter(
                      (a: Classroom) => a.status === "available",
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ocupadas</p>
                <p className="text-2xl font-bold">
                  {
                    classrooms.filter((a: Classroom) => a.status === "occupied")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mantenimiento</p>
                <p className="text-2xl font-bold">
                  {
                    classrooms.filter(
                      (a: Classroom) => a.status === "maintenance",
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o ubicación..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50"
                />
              </div>
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Tipo de aula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {tiposUnicos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="occupied">Ocupada</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="inactive">Inactiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de aulas */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Cargando aulas...</p>
          </div>
        </div>
      ) : aulasFiltradas.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px] col-span-full">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-muted/30 rounded-full">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                No hay aulas disponibles
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                No se encontraron aulas que coincidan con los criterios de
                búsqueda
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aulasFiltradas.map((aula) => (
            <Card
              key={aula.id}
              className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-900/70 transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    {aula.name}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      aula.status === "available"
                        ? "border-green-500/20 bg-green-500 text-white dark:bg-green-500 dark:text-white font-semibold shadow-sm shadow-green-500/50"
                        : aula.status === "occupied"
                          ? "border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-medium"
                          : aula.status === "maintenance"
                            ? "border-blue-200 bg-blue-50/80 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 font-medium"
                            : "border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300 font-medium"
                    }
                  >
                    {getStatusText(aula.status)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {aula.location || "Sin ubicación"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Capacidad</p>
                    <p className="font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {aula.capacity || "N/A"} personas
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-medium">{aula.room_type || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Equipamiento
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {aula.equipment && aula.equipment.length > 0 ? (
                      aula.equipment.map((equipo: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {equipo}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Sin equipamiento
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => abrirModalDetalles(aula)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => abrirModalSeparacion(aula)}
                    disabled={aula.status !== "available"}
                  >
                    <Split className="h-4 w-4 mr-1" />
                    Separar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para separar aula */}
      <Dialog open={modalSeparacion} onOpenChange={setModalSeparacion}>
        <DialogContent className="max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Split className="h-5 w-5 text-blue-500" />
              Separar Aula - {aulaSeleccionada?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Fecha de Separación
                </label>
                <Input
                  type="date"
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora de Inicio</label>
                <Input
                  type="time"
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora de Fin</label>
                <Input
                  type="time"
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Materia/Curso</label>
                <Select>
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                    <SelectValue placeholder="Seleccionar materia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matematicas">
                      Matemáticas Avanzadas
                    </SelectItem>
                    <SelectItem value="fisica">Física Cuántica</SelectItem>
                    <SelectItem value="quimica">Química Orgánica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Propósito de la Separación
              </label>
              <Textarea
                placeholder="Describe el motivo y actividades a realizar..."
                className="bg-white/50 dark:bg-gray-800/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Número de Estudiantes Esperados
              </label>
              <Input
                type="number"
                placeholder="ej: 25"
                className="bg-white/50 dark:bg-gray-800/50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalSeparacion(false)}
              >
                Cancelar
              </Button>
              <Button onClick={() => setModalSeparacion(false)}>
                Confirmar Separación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para ver detalles */}
      <Dialog open={modalDetalles} onOpenChange={setModalDetalles}>
        <DialogContent className="max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Detalles del Aula - {aulaSeleccionada?.name}
            </DialogTitle>
          </DialogHeader>

          {aulaSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-medium">
                    {aulaSeleccionada.location || "Sin ubicación"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacidad</p>
                  <p className="font-medium">
                    {aulaSeleccionada.capacity || "N/A"} personas
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tipo de Aula</p>
                <p className="font-medium">
                  {aulaSeleccionada.room_type || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Estado Actual</p>
                <Badge
                  variant="outline"
                  className={
                    aulaSeleccionada.status === "available"
                      ? "border-green-500/20 bg-green-500 text-white dark:bg-green-500 dark:text-white font-semibold shadow-sm shadow-green-500/50"
                      : aulaSeleccionada.status === "occupied"
                        ? "border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-medium"
                        : aulaSeleccionada.status === "maintenance"
                          ? "border-blue-200 bg-blue-50/80 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 font-medium"
                          : "border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300 font-medium"
                  }
                >
                  {getStatusText(aulaSeleccionada.status)}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Equipamiento Disponible
                </p>
                <div className="flex flex-wrap gap-2">
                  {aulaSeleccionada.equipment &&
                  aulaSeleccionada.equipment.length > 0 ? (
                    aulaSeleccionada.equipment.map(
                      (equipo: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {equipo}
                        </Badge>
                      ),
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sin equipamiento
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setModalDetalles(false)}
                >
                  Cerrar
                </Button>
                {aulaSeleccionada.status === "available" && (
                  <Button
                    onClick={() => {
                      setModalDetalles(false);
                      abrirModalSeparacion(aulaSeleccionada);
                    }}
                  >
                    Separar Aula
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
