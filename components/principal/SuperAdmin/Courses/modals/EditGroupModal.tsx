"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { GroupsStore } from "@/Stores/groupsStore";
import { ProfilesStore } from "@/Stores/profilesStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";

interface EditGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: any;
  onGroupChange: (group: any) => void;
}

export function EditGroupModal({
  open,
  onOpenChange,
  group,
  onGroupChange,
}: EditGroupModalProps) {
  const { updateGroup, loading } = GroupsStore();
  const { profiles } = ProfilesStore();
  const { periodos } = PeriodAcademicStore();
  const [isDirectorPopoverOpen, setIsDirectorPopoverOpen] = useState(false);

  const handleUpdate = async () => {
    if (!group) {
      alert("No hay grupo seleccionado para actualizar");
      return;
    }
    if (!group.name || !group.year) {
      alert("Por favor completa los campos requeridos (nombre y año).");
      return;
    }
    try {
      await updateGroup(group.id, {
        name: group.name,
        year: group.year,
        max_students: group.max_students || null,
        director_id: group.director_id || null,
        updated_at: new Date().toISOString(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error al actualizar grupo:", error);
      alert("Hubo un error al actualizar el grupo. Por favor intenta de nuevo.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
        </DialogHeader>
        {group && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Grupo</Label>
              <Input
                placeholder="Ej: A, B, C"
                value={group.name}
                onChange={(e) => onGroupChange({ ...group, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Periodo Académico</Label>
              <Select
                value={group.year as any}
                onValueChange={(periodId) => {
                  onGroupChange({ ...group, year: periodId as any });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione su periodo académico por favor" />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Director (opcional)</Label>
              <Popover
                open={isDirectorPopoverOpen}
                onOpenChange={setIsDirectorPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isDirectorPopoverOpen}
                    className="w-full justify-between"
                  >
                    {group.director_id
                      ? profiles.find((p) => p.id === group.director_id)?.full_name ||
                        profiles.find((p) => p.id === group.director_id)?.email ||
                        "Director seleccionado"
                      : "Seleccionar director"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar director..." />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>No se encontró ningún director.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            onGroupChange({ ...group, director_id: "" });
                            setIsDirectorPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              group.director_id === "" ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          Sin director
                        </CommandItem>
                        {profiles.map((profile) => (
                          <CommandItem
                            key={profile.id}
                            value={`${profile.full_name || ""} ${profile.email || ""} ${profile.id}`}
                            onSelect={() => {
                              onGroupChange({ ...group, director_id: profile.id });
                              setIsDirectorPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                group.director_id === profile.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {profile.full_name || "Sin nombre"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {profile.email || profile.id}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Capacidad Máxima de Estudiantes (opcional)</Label>
              <Input
                type="number"
                placeholder="Ej: 30"
                value={group.max_students || 0}
                onChange={(e) =>
                  onGroupChange({
                    ...group,
                    max_students: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
