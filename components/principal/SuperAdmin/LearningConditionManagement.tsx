"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  HeartHandshake,
  Loader2,
  Palette,
} from "lucide-react";

interface LearningCondition {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
}

const PRESET_COLORS = [
  "#7c3aed", // violet
  "#2563eb", // blue
  "#16a34a", // green
  "#ea580c", // orange
  "#dc2626", // red
  "#db2777", // pink
  "#0891b2", // cyan
  "#ca8a04", // yellow
];

const supabase = createClient();

export function LearningConditionManagement() {
  const [conditions, setConditions] = useState<LearningCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LearningCondition | null>(
    null,
  );
  const [editing, setEditing] = useState<LearningCondition | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    color: PRESET_COLORS[0],
  });

  const fetchConditions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("learning_condition")
      .select("*")
      .order("name");
    if (!error) setConditions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", color: PRESET_COLORS[0] });
    setIsModalOpen(true);
  };

  const openEdit = (condition: LearningCondition) => {
    setEditing(condition);
    setForm({
      name: condition.name,
      description: condition.description || "",
      color: condition.color || PRESET_COLORS[0],
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("learning_condition")
          .update({
            name: form.name.trim(),
            description: form.description.trim() || null,
            color: form.color,
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Condición actualizada");
      } else {
        const { error } = await supabase.from("learning_condition").insert({
          name: form.name.trim(),
          description: form.description.trim() || null,
          color: form.color,
        });
        if (error) throw error;
        toast.success("Condición creada");
      }
      setIsModalOpen(false);
      await fetchConditions();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase
        .from("learning_condition")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success("Condición eliminada");
      setDeleteTarget(null);
      await fetchConditions();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between relative z-1">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-violet-500" />
            Condiciones de Aprendizaje
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona el catálogo de condiciones de aprendizaje del colegio
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Condición
        </Button>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Condiciones registradas</CardTitle>
          <CardDescription>
            {conditions.length} condición{conditions.length !== 1 ? "es" : ""}{" "}
            en el catálogo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Cargando...
            </div>
          ) : conditions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HeartHandshake className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay condiciones registradas.</p>
              <p className="text-xs mt-1">Crea la primera para comenzar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conditions.map((cond) => (
                <div
                  key={cond.id}
                  className="flex items-start justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: cond.color || "#7c3aed",
                  }}
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cond.color || "#7c3aed" }}
                      />
                      <p className="font-semibold text-sm truncate">
                        {cond.name}
                      </p>
                    </div>
                    {cond.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {cond.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openEdit(cond)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                      onClick={() => setDeleteTarget(cond)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal crear / editar */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(v) => !saving && setIsModalOpen(v)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar condición" : "Nueva condición de aprendizaje"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cond-name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cond-name"
                placeholder="Ej: Síndrome de Down, TDAH, Dislexia..."
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cond-desc">Descripción</Label>
              <Textarea
                id="cond-desc"
                placeholder="Descripción pedagógica opcional..."
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                disabled={saving}
                className="resize-none min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color del badge
              </Label>
              <div className="flex items-center gap-3 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, color }))}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        form.color === color ? "#000" : "transparent",
                      transform:
                        form.color === color ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, color: e.target.value }))
                  }
                  className="w-8 h-8 rounded cursor-pointer border"
                  title="Color personalizado"
                />
              </div>
              {/* Preview */}
              <div className="mt-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 border"
                  style={{
                    backgroundColor: `${form.color}18`,
                    color: form.color,
                    borderColor: `${form.color}55`,
                  }}
                >
                  <HeartHandshake className="w-3 h-3" />
                  {form.name || "Vista previa"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editing ? "Guardar cambios" : "Crear condición"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminar */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar condición?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>"{deleteTarget?.name}"</strong> del catálogo.
              Los estudiantes que ya tienen esta condición asignada perderán el
              registro. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
