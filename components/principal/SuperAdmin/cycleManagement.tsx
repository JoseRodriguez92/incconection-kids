"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Calendar, Plus, Edit } from "lucide-react";
import { CycleStore, Cycle } from "@/Stores/cycleStore";

export function CycleManagement() {
  const { cycles, fetchCycles, addCycle, updateCycle, loading } = CycleStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCycle, setNewCycle] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetchCycles();
  }, []);

  const filteredCycles = cycles
    .filter((c: Cycle) => {
      const matchesSearch =
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.description &&
          c.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleCreateCycle = async () => {
    if (!newCycle.name) {
      alert("Por favor ingresa el nombre del ciclo");
      return;
    }
    await addCycle({
      name: newCycle.name,
      description: newCycle.description || null,
      is_active: newCycle.is_active,
    });
    setNewCycle({
      name: "",
      description: "",
      is_active: true,
    });
    setIsCreateOpen(false);
  };

  const handleUpdateCycle = async () => {
    if (!selectedCycle) return;
    await updateCycle(selectedCycle.id, {
      name: selectedCycle.name,
      description: selectedCycle.description,
      is_active: selectedCycle.is_active,
    });
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          Gestión de Ciclos
        </h2>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 sm:shrink-0">
          <Plus className="w-4 h-4" />
          Nuevo Ciclo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 shrink-0" />
            <span>Lista de Ciclos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar ciclos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredCycles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No se encontraron ciclos
              </div>
            ) : (
              <>
                {/* Mobile: tarjetas */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {filteredCycles.map((cycle: Cycle) => (
                    <div
                      key={cycle.id}
                      className="border rounded-xl p-4 space-y-2 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground truncate min-w-0">
                          {cycle.name}
                        </span>
                        <Badge
                          variant={cycle.is_active ? "default" : "destructive"}
                          className={`shrink-0 text-xs ${cycle.is_active ? "bg-green-600 hover:bg-green-700" : ""}`}
                        >
                          {cycle.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      {cycle.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {cycle.description}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 mt-1"
                        onClick={() => { setSelectedCycle(cycle); setIsEditOpen(true); }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Desktop: tabla */}
                <div className="hidden sm:block rounded-md border overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-semibold text-sm">Nombre</th>
                        <th className="text-left p-4 font-semibold text-sm">Descripción</th>
                        <th className="text-left p-4 font-semibold text-sm">Estado</th>
                        <th className="text-right p-4 font-semibold text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCycles.map((cycle: Cycle) => (
                        <tr key={cycle.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium text-sm text-foreground">{cycle.name}</td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {cycle.description || "Sin descripción"}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={cycle.is_active ? "default" : "destructive"}
                              className={cycle.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {cycle.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelectedCycle(cycle); setIsEditOpen(true); }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Crear */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle>Nuevo Ciclo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del ciclo</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Primer Ciclo"
                  value={newCycle.name}
                  onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  placeholder="Descripción (opcional)"
                  value={newCycle.description}
                  onChange={(e) => setNewCycle({ ...newCycle, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={newCycle.is_active}
                  onCheckedChange={(checked) => setNewCycle({ ...newCycle, is_active: checked })}
                />
                <Label htmlFor="is_active">Ciclo activo</Label>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCycle} disabled={loading}>
                  {loading ? "Creando..." : "Crear"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Editar */}
      {isEditOpen && selectedCycle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle>Editar Ciclo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre del ciclo</Label>
                <Input
                  id="edit-nombre"
                  placeholder="Nombre del ciclo"
                  value={selectedCycle.name}
                  onChange={(e) => setSelectedCycle({ ...selectedCycle, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Input
                  id="edit-descripcion"
                  placeholder="Descripción"
                  value={selectedCycle.description || ""}
                  onChange={(e) => setSelectedCycle({ ...selectedCycle, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-is_active"
                  checked={selectedCycle.is_active ?? true}
                  onCheckedChange={(checked) => setSelectedCycle({ ...selectedCycle, is_active: checked })}
                />
                <Label htmlFor="edit-is_active">Ciclo activo</Label>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateCycle} disabled={loading}>
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
