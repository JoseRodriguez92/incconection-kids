"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoursesStore } from "@/Stores/coursesStore";
import { InstituteStore } from "@/Stores/InstituteStore";

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCourseModal({ open, onOpenChange }: CreateCourseModalProps) {
  const { addCourse, loading } = CoursesStore();
  const { institute } = InstituteStore();

  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    education_level: "",
    grade_number: 0,
    max_students: 0,
    description: "",
    is_active: true,
  });

  const handleCreate = async () => {
    if (!newCourse.name || !newCourse.max_students) {
      alert("Por favor completa los campos requeridos.");
      return;
    }
    if (!institute?.id) {
      alert("No se encontró el ID del instituto. Por favor inicia sesión nuevamente.");
      return;
    }
    try {
      await addCourse({
        id: crypto.randomUUID(),
        institute_id: institute.id,
        name: newCourse.name,
        code: newCourse.code || null,
        education_level: newCourse.education_level || null,
        grade_number: newCourse.grade_number || null,
        max_students: newCourse.max_students,
        description: newCourse.description || null,
        is_active: newCourse.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setNewCourse({
        name: "",
        code: "",
        education_level: "",
        grade_number: 0,
        max_students: 0,
        description: "",
        is_active: true,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error al crear curso:", error);
      alert("Hubo un error al crear el curso. Por favor intenta de nuevo.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Curso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre del Curso</Label>
              <Input
                placeholder="Ej: Primero"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Código</Label>
              <Input
                placeholder="Ej: PRI-01"
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              />
            </div>
            <div>
              <Label>Nivel Educativo</Label>
              <Input
                placeholder="Ej: Primaria"
                value={newCourse.education_level}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, education_level: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Número de Grado</Label>
              <Input
                type="number"
                placeholder="Ej: 1"
                value={newCourse.grade_number}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    grade_number: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Máximo de Estudiantes</Label>
              <Input
                type="number"
                placeholder="Ej: 30"
                value={newCourse.max_students}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    max_students: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                placeholder="Descripción del curso"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Creando..." : "Crear Curso"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
