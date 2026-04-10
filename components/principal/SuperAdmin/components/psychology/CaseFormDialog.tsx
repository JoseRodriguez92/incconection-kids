"use client";

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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Edit, Plus } from "lucide-react";

interface CaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCase: any;
  caseForm: {
    student_enrolled_id: string;
    status: string;
    summary: string;
    case_type_id: string;
    risk_level_id: string;
    confidentiality_level: string;
    opened_at: string;
  };
  setCaseForm: (form: any) => void;
  students: { id: string; name: string; grade: string }[];
  loadingStudents: boolean;
  currentPeriod: { id: string; name: string } | null;
  loadingPeriods: boolean;
  caseTypes: any[];
  riskLevels: any[];
  onSave: () => void;
  onClose: () => void;
}

export function CaseFormDialog({
  open,
  onOpenChange,
  editingCase,
  caseForm,
  setCaseForm,
  students,
  loadingStudents,
  currentPeriod,
  loadingPeriods,
  caseTypes,
  riskLevels,
  onSave,
  onClose,
}: CaseFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCase ? "Editar Caso Psicológico" : "Crear Nuevo Caso Psicológico"}
          </DialogTitle>
          <DialogDescription>
            {editingCase
              ? "Modifica la información del caso psicológico"
              : "Completa la información para registrar un nuevo caso psicológico"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Estudiante */}
          <div className="space-y-2">
            <Label htmlFor="student">Estudiante *</Label>
            {loadingStudents ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando estudiantes...
              </div>
            ) : (
              <Select
                value={caseForm.student_enrolled_id}
                onValueChange={(value) => setCaseForm({ ...caseForm, student_enrolled_id: value })}
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No hay estudiantes disponibles</div>
                  ) : (
                    students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} - {s.grade}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Tipo de Caso */}
          <div className="space-y-2">
            <Label htmlFor="case-type">Tipo de Caso *</Label>
            <Select
              value={caseForm.case_type_id}
              onValueChange={(value) => setCaseForm({ ...caseForm, case_type_id: value })}
            >
              <SelectTrigger id="case-type">
                <SelectValue placeholder="Selecciona un tipo de caso" />
              </SelectTrigger>
              <SelectContent>
                {caseTypes.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No hay tipos de casos. Créalos en la pestaña Tipos.</div>
                ) : (
                  caseTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Nivel de Riesgo */}
          <div className="space-y-2">
            <Label htmlFor="risk-level">Nivel de Riesgo *</Label>
            <Select
              value={caseForm.risk_level_id}
              onValueChange={(value) => setCaseForm({ ...caseForm, risk_level_id: value })}
            >
              <SelectTrigger id="risk-level">
                <SelectValue placeholder="Selecciona un nivel de riesgo" />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No hay niveles de riesgo. Créalos en la pestaña Niveles.</div>
                ) : (
                  riskLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Periodo Académico */}
          <div className="space-y-2">
            <Label htmlFor="academic-period">Periodo Académico *</Label>
            {loadingPeriods ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando periodos...
              </div>
            ) : (
              <>
                <Input
                  id="academic-period"
                  value={currentPeriod?.name || "No hay periodo actual"}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El caso se asigna automáticamente al periodo académico actual
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                value={caseForm.status}
                onValueChange={(value) => setCaseForm({ ...caseForm, status: value })}
              >
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Activo</SelectItem>
                  <SelectItem value="in_followup">En Seguimiento</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confidencialidad */}
            <div className="space-y-2">
              <Label htmlFor="confidentiality">Confidencialidad *</Label>
              <Select
                value={caseForm.confidentiality_level}
                onValueChange={(value) => setCaseForm({ ...caseForm, confidentiality_level: value })}
              >
                <SelectTrigger id="confidentiality"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="medium">Normal</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fecha de Apertura */}
          <div className="space-y-2">
            <Label htmlFor="opened-at">Fecha de Apertura *</Label>
            <Input
              id="opened-at"
              type="date"
              value={caseForm.opened_at}
              onChange={(e) => setCaseForm({ ...caseForm, opened_at: e.target.value })}
            />
          </div>

          {/* Resumen */}
          <div className="space-y-2">
            <Label htmlFor="summary">Resumen del Caso *</Label>
            <Textarea
              id="summary"
              placeholder="Describe el caso psicológico, motivos de consulta, situación actual..."
              value={caseForm.summary}
              onChange={(e) => setCaseForm({ ...caseForm, summary: e.target.value })}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Describe brevemente el motivo de apertura del caso y la situación actual del estudiante
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSave} disabled={loadingStudents || loadingPeriods}>
            {loadingStudents || loadingPeriods ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cargando...</>
            ) : editingCase ? (
              <><Edit className="w-4 h-4 mr-2" />Actualizar Caso</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" />Crear Caso</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
