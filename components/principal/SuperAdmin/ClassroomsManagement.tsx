"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  School,
  Plus,
  Search,
  Upload,
  Edit,
  Users,
  MapPin,
} from "lucide-react";
import { ClassroomsStore, Classroom } from "@/Stores/ClassroomsStore";
import { InstituteStore } from "@/Stores/InstituteStore";

export function ClassroomsManagement() {
  const {
    classrooms,
    fetchClassrooms,
    addClassroom,
    updateClassroom,
    loading,
  } = ClassroomsStore();
  const { institute } = InstituteStore();
  const [searchAulas, setSearchAulas] = useState("");
  const [isCreateAulaOpen, setIsCreateAulaOpen] = useState(false);
  const [isEditAulaOpen, setIsEditAulaOpen] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Classroom | null>(null);
  const [newAula, setNewAula] = useState({
    name: "",
    status: "disponible",
    capacity: 0,
    location: "",
    room_type: "",
    equipment: [] as string[],
  });

  const filteredAulas = classrooms.filter(
    (aula) =>
      aula.name.toLowerCase().includes(searchAulas.toLowerCase()) ||
      (aula.location && aula.location.toLowerCase().includes(searchAulas.toLowerCase())) ||
      (aula.room_type && aula.room_type.toLowerCase().includes(searchAulas.toLowerCase()))
  );

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleCreateAula = async () => {
    if (!newAula.name || !newAula.status) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    if (!institute.id) {
      alert(
        "No se encontró el ID del instituto. Por favor inicia sesión nuevamente."
      );
      return;
    }

    try {
      const classroom = {
        institute_id: institute.id,
        name: newAula.name,
        status: newAula.status,
        capacity: newAula.capacity,
        location: newAula.location || null,
        room_type: newAula.room_type || null,
        equipment: newAula.equipment,
      };

      await addClassroom(classroom);
      setNewAula({
        name: "",
        status: "disponible",
        capacity: 0,
        location: "",
        room_type: "",
        equipment: [],
      });
      setIsCreateAulaOpen(false);
    } catch (error) {
      console.error("Error al crear aula:", error);
      alert("Hubo un error al crear el aula. Por favor intenta de nuevo.");
    }
  };

  const handleUpdateAula = async () => {
    if (!selectedAula) {
      alert("No hay aula seleccionada para actualizar");
      return;
    }

    if (!selectedAula.name || !selectedAula.status) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      const updates = {
        name: selectedAula.name,
        status: selectedAula.status,
        capacity: selectedAula.capacity,
        location: selectedAula.location || null,
        room_type: selectedAula.room_type || null,
        equipment: selectedAula.equipment,
      };

      await updateClassroom(selectedAula.id, updates);
      setIsEditAulaOpen(false);
    } catch (error) {
      console.error("Error al actualizar aula:", error);
      alert("Hubo un error al actualizar el aula. Por favor intenta de nuevo.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Aulas</h2>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-transparent"
              >
                <Upload className="w-4 h-4" />
                <span>Subir CSV</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir Aulas Masivamente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input type="file" accept=".csv" />
                <Button className="w-full">Subir Archivo</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateAulaOpen} onOpenChange={setIsCreateAulaOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nueva Aula</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl">Crear Nueva Aula</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Aula</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Aula 101"
                      value={newAula.name}
                      onChange={(e) =>
                        setNewAula({ ...newAula, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      value={newAula.status}
                      onChange={(e) =>
                        setNewAula({ ...newAula, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="ocupado">Ocupado</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="reservado">Reservado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidad</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="30"
                      value={newAula.capacity}
                      onChange={(e) =>
                        setNewAula({
                          ...newAula,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      placeholder="Ej: Primer piso, Bloque A"
                      value={newAula.location}
                      onChange={(e) =>
                        setNewAula({ ...newAula, location: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="room-type">Tipo de Aula</Label>
                    <Input
                      id="room-type"
                      placeholder="Ej: Aula estándar, Laboratorio, Biblioteca"
                      value={newAula.room_type}
                      onChange={(e) =>
                        setNewAula({ ...newAula, room_type: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="equipment">Equipamiento (separado por comas)</Label>
                    <Input
                      id="equipment"
                      placeholder="Ej: Proyector, Pizarra, Computadoras"
                      value={newAula.equipment.join(", ")}
                      onChange={(e) =>
                        setNewAula({
                          ...newAula,
                          equipment: e.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter((item) => item !== ""),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateAulaOpen(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAula} disabled={loading}>
                    {loading ? "Creando..." : "Crear Aula"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <School className="w-5 h-5" />
            <span>Lista de Aulas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar aulas..."
                value={searchAulas}
                onChange={(e) => setSearchAulas(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAulas.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No se encontraron aulas
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    No hay aulas que coincidan con tu búsqueda. Intenta ajustar
                    los filtros o crear una nueva aula.
                  </p>
                </div>
              ) : (
                filteredAulas.map((aula) => (
                  <Card key={aula.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">
                            {aula.name}
                          </h3>
                          <Badge
                            variant={
                              aula.status === "disponible"
                                ? "default"
                                : aula.status === "ocupado"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {aula.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span>Capacidad: {aula.capacity} estudiantes</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <span>
                              Ubicación: {aula.location || "Sin especificar"}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <strong>Tipo:</strong>{" "}
                            {aula.room_type || "Sin especificar"}
                          </div>
                          {aula.equipment && aula.equipment.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Equipamiento:</strong>{" "}
                              {aula.equipment.slice(0, 2).join(", ")}
                              {aula.equipment.length > 2 && "..."}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              setSelectedAula(aula);
                              setIsEditAulaOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditAulaOpen} onOpenChange={setIsEditAulaOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Editar Aula</DialogTitle>
          </DialogHeader>
          {selectedAula && (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre del Aula</Label>
                  <Input
                    id="edit-name"
                    placeholder="Ej: Aula 101"
                    value={selectedAula.name}
                    onChange={(e) =>
                      setSelectedAula({
                        ...selectedAula,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <select
                    id="edit-status"
                    value={selectedAula.status}
                    onChange={(e) =>
                      setSelectedAula({
                        ...selectedAula,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="reservado">Reservado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacidad</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    placeholder="30"
                    value={selectedAula.capacity}
                    onChange={(e) =>
                      setSelectedAula({
                        ...selectedAula,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Ubicación</Label>
                  <Input
                    id="edit-location"
                    placeholder="Ej: Primer piso, Bloque A"
                    value={selectedAula.location || ""}
                    onChange={(e) =>
                      setSelectedAula({
                        ...selectedAula,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-room-type">Tipo de Aula</Label>
                  <Input
                    id="edit-room-type"
                    placeholder="Ej: Aula estándar, Laboratorio, Biblioteca"
                    value={selectedAula.room_type || ""}
                    onChange={(e) =>
                      setSelectedAula({
                        ...selectedAula,
                        room_type: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-equipment">Equipamiento (separado por comas)</Label>
                  <Input
                    id="edit-equipment"
                    placeholder="Ej: Proyector, Pizarra, Computadoras"
                    value={selectedAula.equipment?.join(", ") || ""}
                    onChange={(e) =>
                      setSelectedAula({
                        ...selectedAula,
                        equipment: e.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter((item) => item !== ""),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditAulaOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateAula} disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
