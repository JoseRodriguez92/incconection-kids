"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Loader2, Edit, Trash2, Eye } from "lucide-react";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import {
  getStatusBadgeColor,
  getRiskLevelColor,
  getConfidentialityColor,
  translateStatus,
  translateConfidentiality,
  formatDate,
} from "./utils";

interface CasesTabProps {
  filteredCases: any[];
  casesLoading: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onEdit: (caseItem: any) => void;
  onDelete: (caseId: string) => void;
  onViewDetails: (caseItem: any) => void;
  activePeriodName: string | null;
}

export function CasesTab({
  filteredCases,
  casesLoading,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
  onViewDetails,
  activePeriodName,
}: CasesTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Casos Psicológicos
            {activePeriodName && (
              <span className="flex items-center gap-1.5 text-xs font-normal px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                {activePeriodName}
              </span>
            )}
          </CardTitle>
          <div className="relative w-64 bg-white border rounded-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar casos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {casesLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron casos psicológicos
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="font-semibold text-lg leading-tight">{caseItem.student_name}</h3>
                        <ConditionBadges conditions={caseItem.conditions} className="mt-0.5" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="font-normal">
                          <span className="font-medium">Curso:</span> {caseItem.grade}
                        </Badge>
                        <Badge className={getStatusBadgeColor(caseItem.status || "")}>
                          <span className="font-medium">Estado:</span> {translateStatus(caseItem.status)}
                        </Badge>
                        <Badge className={getRiskLevelColor(caseItem.risk_level_name || "")}>
                          <span className="font-medium">Riesgo:</span> {caseItem.risk_level_name || "N/A"}
                        </Badge>
                        <Badge className={getConfidentialityColor(caseItem.confidentiality_level || "")}>
                          <span className="font-medium">Confidencialidad:</span>{" "}
                          {translateConfidentiality(caseItem.confidentiality_level || "")}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Tipo de Caso:</span>{" "}
                        <span className="text-muted-foreground">{caseItem.case_type_name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Fecha de Apertura:</span>{" "}
                        <span className="text-muted-foreground">{formatDate(caseItem.opened_at)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Fecha de Creación:</span>{" "}
                        <span className="text-muted-foreground">{formatDate(caseItem.created_at)}</span>
                      </div>
                    </div>

                    {caseItem.summary && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium text-foreground mb-1">Detalle:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{caseItem.summary}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => onEdit(caseItem)} title="Editar caso">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(caseItem.id)} title="Eliminar caso">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => onViewDetails(caseItem)}
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
