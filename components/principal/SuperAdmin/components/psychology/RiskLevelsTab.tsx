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
import { Shield, Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface RiskLevelsTabProps {
  riskLevels: any[];
  riskLevelsLoading: boolean;
  isRiskDialogOpen: boolean;
  setIsRiskDialogOpen: (v: boolean) => void;
  editingRisk: any;
  riskForm: { name: string; description: string; sort_order: number };
  setRiskForm: (form: any) => void;
  deleteRiskId: string | null;
  setDeleteRiskId: (id: string | null) => void;
  instituteId: string | null;
  onCreateRisk: () => void;
  onEditRisk: (risk: any) => void;
  onUpdateRisk: () => void;
  onDeleteRisk: () => void;
  onCloseDialog: () => void;
}

export function RiskLevelsTab({
  riskLevels,
  riskLevelsLoading,
  isRiskDialogOpen,
  setIsRiskDialogOpen,
  editingRisk,
  riskForm,
  setRiskForm,
  deleteRiskId,
  setDeleteRiskId,
  instituteId,
  onCreateRisk,
  onEditRisk,
  onUpdateRisk,
  onDeleteRisk,
  onCloseDialog,
}: RiskLevelsTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Niveles de Riesgo
            </CardTitle>
            <Dialog open={isRiskDialogOpen} onOpenChange={setIsRiskDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => onEditRisk(null)}
                  disabled={!instituteId}
                >
                  {!instituteId ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Cargando...</>
                  ) : (
                    <><Plus className="w-4 h-4" />Nuevo Nivel</>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRisk ? "Editar Nivel de Riesgo" : "Crear Nuevo Nivel de Riesgo"}</DialogTitle>
                  <DialogDescription>
                    {editingRisk ? "Modifica los datos del nivel de riesgo." : "Completa los datos para crear un nuevo nivel de riesgo."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="risk-name">Nombre *</Label>
                    <Input
                      id="risk-name"
                      placeholder="Ej: Alto, Medio, Bajo..."
                      value={riskForm.name}
                      onChange={(e) => setRiskForm({ ...riskForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk-order">Orden de Prioridad *</Label>
                    <Input
                      id="risk-order"
                      type="number"
                      min="1"
                      placeholder="1 = Mayor prioridad"
                      value={riskForm.sort_order}
                      onChange={(e) => setRiskForm({ ...riskForm, sort_order: parseInt(e.target.value) || 1 })}
                    />
                    <p className="text-xs text-muted-foreground">Un número menor indica mayor prioridad (1 = máxima prioridad)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk-description">Descripción</Label>
                    <Textarea
                      id="risk-description"
                      placeholder="Describe el nivel de riesgo..."
                      value={riskForm.description}
                      onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={onCloseDialog}>Cancelar</Button>
                  <Button onClick={editingRisk ? onUpdateRisk : onCreateRisk}>
                    {editingRisk ? "Guardar Cambios" : "Crear Nivel"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {riskLevelsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : riskLevels.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay niveles de riesgo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea los niveles de riesgo para clasificar la gravedad de los casos psicológicos
              </p>
              <Button onClick={() => setIsRiskDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />Crear Primer Nivel
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {riskLevels.map((level) => {
                const levelColor =
                  level.name.toLowerCase() === "alto"
                    ? "#ef4444"
                    : level.name.toLowerCase() === "medio"
                      ? "#eab308"
                      : "#22c55e";
                return (
                  <div
                    key={level.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    style={{ borderLeftWidth: "4px", borderLeftColor: levelColor }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: levelColor }} />
                          <h3 className="font-semibold">{level.name}</h3>
                          <Badge variant="outline">Orden: {level.sort_order}</Badge>
                          {level.is_active && <Badge className="bg-green-100 text-green-800">Activo</Badge>}
                        </div>
                        {level.description && (
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEditRisk(level)}>
                          <Edit className="w-4 h-4 mr-1" />Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteRiskId(level.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteRiskId} onOpenChange={() => setDeleteRiskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este nivel de riesgo. Los casos y alertas que usen este nivel podrían verse afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteRisk} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
