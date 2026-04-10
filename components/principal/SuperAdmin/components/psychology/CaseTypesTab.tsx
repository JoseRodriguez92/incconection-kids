"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
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
import { Brain, Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface CaseTypesTabProps {
  caseTypes: any[];
  caseTypesLoading: boolean;
  isTypeDialogOpen: boolean;
  setIsTypeDialogOpen: (v: boolean) => void;
  editingType: any;
  typeForm: { name: string; description: string };
  setTypeForm: (form: any) => void;
  deleteTypeId: string | null;
  setDeleteTypeId: (id: string | null) => void;
  instituteId: string | null;
  onCreateType: () => void;
  onEditType: (type: any) => void;
  onUpdateType: () => void;
  onDeleteType: () => void;
  onCloseDialog: () => void;
}

export function CaseTypesTab({
  caseTypes,
  caseTypesLoading,
  isTypeDialogOpen,
  setIsTypeDialogOpen,
  editingType,
  typeForm,
  setTypeForm,
  deleteTypeId,
  setDeleteTypeId,
  instituteId,
  onCreateType,
  onEditType,
  onUpdateType,
  onDeleteType,
  onCloseDialog,
}: CaseTypesTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Tipos de Casos
            </CardTitle>
            <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => onEditType(null)}
                  disabled={!instituteId}
                >
                  {!instituteId ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Cargando...</>
                  ) : (
                    <><Plus className="w-4 h-4" />Nuevo Tipo</>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingType ? "Editar Tipo de Caso" : "Crear Nuevo Tipo de Caso"}</DialogTitle>
                  <DialogDescription>
                    {editingType ? "Modifica los datos del tipo de caso." : "Completa los datos para crear un nuevo tipo de caso."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type-name">Nombre *</Label>
                    <Input
                      id="type-name"
                      placeholder="Ej: Ansiedad, Conducta, Aprendizaje..."
                      value={typeForm.name}
                      onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type-description">Descripción</Label>
                    <Textarea
                      id="type-description"
                      placeholder="Describe el tipo de caso..."
                      value={typeForm.description}
                      onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={onCloseDialog}>Cancelar</Button>
                  <Button onClick={editingType ? onUpdateType : onCreateType}>
                    {editingType ? "Guardar Cambios" : "Crear Tipo"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {caseTypesLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : caseTypes.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay tipos de casos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea el primer tipo de caso para comenzar a clasificar los casos psicológicos
              </p>
              <Button onClick={() => setIsTypeDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Tipo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {caseTypes.map((type) => (
                <div key={type.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{type.name}</h3>
                        {type.is_active && <Badge className="bg-green-100 text-green-800">Activo</Badge>}
                      </div>
                      {type.description && (
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEditType(type)}>
                        <Edit className="w-4 h-4 mr-1" />Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteTypeId(type.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTypeId} onOpenChange={() => setDeleteTypeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este tipo de caso. Los casos existentes que usen este tipo podrían verse afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteType} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
