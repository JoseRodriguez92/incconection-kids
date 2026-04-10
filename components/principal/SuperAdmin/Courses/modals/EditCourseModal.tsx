"use client";

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

interface EditCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
  onCourseChange: (course: any) => void;
}

export function EditCourseModal({
  open,
  onOpenChange,
  course,
  onCourseChange,
}: EditCourseModalProps) {
  const { updateCourse, loading } = CoursesStore();

  const handleUpdate = async () => {
    if (!course) {
      alert("No hay curso seleccionado para actualizar");
      return;
    }
    try {
      await updateCourse(course.id, {
        name: course.name,
        code: course.code,
        education_level: course.education_level,
        grade_number: course.grade_number,
        max_students: course.max_students,
        description: course.description,
        is_active: course.is_active,
        updated_at: new Date().toISOString(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error al actualizar curso:", error);
      alert("Hubo un error al actualizar el curso. Por favor intenta de nuevo.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
        </DialogHeader>
        {course && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre del Curso</Label>
                <Input
                  value={course.name}
                  onChange={(e) => onCourseChange({ ...course, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Código</Label>
                <Input
                  value={course.code || ""}
                  onChange={(e) => onCourseChange({ ...course, code: e.target.value })}
                />
              </div>
              <div>
                <Label>Nivel Educativo</Label>
                <Input
                  value={course.education_level || ""}
                  onChange={(e) =>
                    onCourseChange({ ...course, education_level: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Número de Grado</Label>
                <Input
                  type="number"
                  value={course.grade_number || 0}
                  onChange={(e) =>
                    onCourseChange({
                      ...course,
                      grade_number: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Máximo de Estudiantes</Label>
                <Input
                  type="number"
                  value={course.max_students}
                  onChange={(e) =>
                    onCourseChange({
                      ...course,
                      max_students: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input
                  value={course.description || ""}
                  onChange={(e) =>
                    onCourseChange({ ...course, description: e.target.value })
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
