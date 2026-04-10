"use client";


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { GroupHasMaterial } from "@/Stores/groupHasMaterialStore";
import type { CycleWithRelation } from "@/Stores/cycleStore";
import {
  Calendar,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Loader2,
} from "lucide-react";

interface TabContenidoEstudianteProps {
  materiales: GroupHasMaterial[];
  loading: boolean;
  cycles: CycleWithRelation[];
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateString: string | null) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getCycleName(cycleId: string, cycles: CycleWithRelation[]) {
  const cycle = cycles.find((c) => c.id === cycleId);
  return cycle ? cycle.name : "Trimestre";
}

function sortedCycleEntries<T>(
  map: Record<string, T[]>,
  cycles: CycleWithRelation[],
) {
  return Object.entries(map).sort(([idA], [idB]) => {
    const nameA = cycles.find((c) => c.id === idA)?.name ?? "";
    const nameB = cycles.find((c) => c.id === idB)?.name ?? "";
    return nameA.localeCompare(nameB, undefined, { numeric: true });
  });
}

function getFileUrl(material: GroupHasMaterial) {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(material.bucket)
    .getPublicUrl(material.storage_path);
  return data.publicUrl;
}

export function TabContenidoEstudiante({
  materiales,
  loading,
  cycles,
}: TabContenidoEstudianteProps) {
  const materialesPorCiclo = materiales.reduce(
    (acc, m) => {
      const key = m.cycle_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    },
    {} as Record<string, GroupHasMaterial[]>,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material del Curso</CardTitle>
        <CardDescription>
          Documentos y recursos de aprendizaje subidos por el docente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              Cargando materiales...
            </p>
          </div>
        ) : materiales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <FolderOpen className="h-14 w-14 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">
                No hay contenido disponible
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                El docente aún no ha subido materiales para esta clase.
              </p>
            </div>
          </div>
        ) : (
          <Accordion
            type="multiple"
            className="space-y-4"
            defaultValue={Object.keys(materialesPorCiclo)}
          >
            {sortedCycleEntries(materialesPorCiclo, cycles).map(
              ([cycleId, mats]) => (
                <AccordionItem
                  key={cycleId}
                  value={cycleId}
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-base">
                            Trimestre {getCycleName(cycleId, cycles)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {mats.length} material{mats.length !== 1 ? "es" : ""}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-auto mr-2">
                        {mats.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2">
                    <div className="space-y-3">
                      {mats.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-8 w-8 text-blue-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{material.title}</p>
                              {material.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {material.description}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {material.mime_type ?? "Archivo"}
                                {material.file_size && (
                                  <> • {formatFileSize(material.file_size)}</>
                                )}
                                {material.created_at && (
                                  <> • {formatDate(material.created_at)}</>
                                )}
                              </p>
                              {material.original_name && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  📎 {material.original_name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={getFileUrl(material)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={getFileUrl(material)}
                                download={
                                  material.original_name ?? material.title
                                }
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ),
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
