"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  BookOpen,
  Plus,
  Edit,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MateriasStore, type Materia } from "@/Stores/materiasStore";
import { InstituteStore } from "@/Stores/InstituteStore";

export function SubjectsManagement() {
  const {
    materias,
    fetchMaterias,
    addMateria,
    updateMateria,
    loading,
    fetchKnowAreas,
    knowledge_areas,
  } = MateriasStore();
  const { institute } = InstituteStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMateria, setNewMateria] = useState({
    name: "",
    description: "",
    code: "",
    knowledge_area_id: "",
    is_active: true,
  });
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    fetchMaterias();
    fetchKnowAreas();
  }, []);

  const filteredMaterias = materias.filter(
    (m: any) =>
      (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.description &&
        m.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const totalPages = Math.max(1, Math.ceil(filteredMaterias.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMaterias = filteredMaterias.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleCreateMateria = async () => {
    if (!newMateria.name) {
      alert("Por favor ingresa el nombre de la materia");
      return;
    }

    if (!institute?.id) {
      alert(
        "No se encontró el ID del instituto. Por favor inicia sesión nuevamente.",
      );
      return;
    }

    await addMateria({
      id: crypto.randomUUID(),
      institute_id: institute.id,
      code:
        newMateria.code || newMateria.name.toLowerCase().replace(/\s+/g, "-"),
      name: newMateria.name,
      description: newMateria.description || "",
      is_active: newMateria.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setNewMateria({
      name: "",
      description: "",
      code: "",
      knowledge_area_id: "",
      is_active: true,
    });
    setIsCreateOpen(false);
  };

  const handleUpdateMateria = async () => {
    if (!selectedMateria) return;
    await updateMateria(selectedMateria.id, {
      name: selectedMateria.name,
      description: selectedMateria.description,
      code: selectedMateria.code,
      is_active: selectedMateria.is_active,
      updated_at: new Date().toISOString(),
    });
    setIsEditOpen(false);
  };

  useEffect(() => {
    console.log("Knowledge areas loaded:", filteredMaterias);
  }, [filteredMaterias]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Gestión de Materias
        </h2>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Materia</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Lista de Materias</span>
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">
                {filteredMaterias.length}
              </span>
            </CardTitle>
            {/* Toggle vista */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar materias..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {filteredMaterias.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron materias
              </div>
            ) : viewMode === "cards" ? (
              /* ── Vista Cards ── */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedMaterias.map((materia: any) => (
                  <Card key={materia.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {materia.name}
                        </h3>
                        <Badge variant={materia.is_active ? "default" : "secondary"}>
                          {materia.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                      {materia.code && (
                        <p className="text-xs text-muted-foreground font-mono">
                          <b>Código:</b> {materia.code}
                        </p>
                      )}
                      {materia.knowledge_area?.name && (
                        <p className="text-sm text-muted-foreground">
                          <b>Área:</b> {materia.knowledge_area.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {materia.description || "Sin descripción"}
                      </p>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedMateria(materia); setIsEditOpen(true); }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* ── Vista Lista ── */
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nombre</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Código</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Área</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Descripción</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Estado</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedMaterias.map((materia: any) => (
                      <tr key={materia.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{materia.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                          {materia.code || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {materia.knowledge_area?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell max-w-[200px]">
                          <span className="line-clamp-1">{materia.description || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={materia.is_active ? "default" : "secondary"}>
                            {materia.is_active ? "Activa" : "Inactiva"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedMateria(materia); setIsEditOpen(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Paginador ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredMaterias.length)} de {filteredMaterias.length} materias
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === safePage ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={safePage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle>Nueva Materia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la materia</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Matemáticas"
                  value={newMateria.name}
                  onChange={(e) =>
                    setNewMateria({ ...newMateria, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="knowledge_area">Área de Conocimiento</Label>
                <Select
                  value={newMateria.knowledge_area_id}
                  onValueChange={(value) =>
                    setNewMateria({
                      ...newMateria,
                      knowledge_area_id: value,
                      code: value,
                    })
                  }
                >
                  <SelectTrigger id="knowledge_area">
                    <SelectValue placeholder="Selecciona un área de conocimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {knowledge_areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  placeholder="Descripción (opcional)"
                  value={newMateria.description}
                  onChange={(e) =>
                    setNewMateria({
                      ...newMateria,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newMateria.is_active}
                  onCheckedChange={(checked) =>
                    setNewMateria({ ...newMateria, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Materia activa</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateMateria} disabled={loading}>
                  {loading ? "Creando..." : "Crear"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isEditOpen && selectedMateria && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle>Editar Materia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre de la materia</Label>
                <Input
                  id="edit-nombre"
                  placeholder="Nombre de la materia"
                  value={selectedMateria.name}
                  onChange={(e) =>
                    setSelectedMateria({
                      ...selectedMateria,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-knowledge_area">
                  Área de Conocimiento
                </Label>
                <Select
                  value={selectedMateria.code || ""}
                  onValueChange={(value) =>
                    setSelectedMateria({
                      ...selectedMateria,
                      code: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-knowledge_area">
                    <SelectValue placeholder="Selecciona un área de conocimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {knowledge_areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Input
                  id="edit-descripcion"
                  placeholder="Descripción"
                  value={selectedMateria.description || ""}
                  onChange={(e) =>
                    setSelectedMateria({
                      ...selectedMateria,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={selectedMateria.is_active ?? true}
                  onCheckedChange={(checked) =>
                    setSelectedMateria({
                      ...selectedMateria,
                      is_active: checked,
                    })
                  }
                />
                <Label htmlFor="edit-is_active">Materia activa</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateMateria} disabled={loading}>
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
