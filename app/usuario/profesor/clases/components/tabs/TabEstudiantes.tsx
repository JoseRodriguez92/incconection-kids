"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  FileText,
  UserCircle,
  Loader2,
  Download,
  ExternalLink,
  Brain,
  FolderOpen,
} from "lucide-react";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import { createClient } from "@/lib/supabase/client";
import type { Curso } from "../../types";

interface TabEstudiantesProps {
  curso: Curso;
}

interface ParentProfile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

interface StudentProfileModal {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  document_type: string | null;
  document_number: string | null;
  avatar_url: string | null;
  conditions?: { id: string; name: string; color: string | null }[];
}

interface PsychFileItem {
  id: string;
  title: string | null;
  original_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  bucket: string | null;
  created_at: string | null;
  period_cycle_label?: string | null;
}

interface PsychCaseWithFiles {
  id: string;
  status: string;
  summary: string | null;
  case_type_name: string | null;
  files: PsychFileItem[];
}

export function TabEstudiantes({ curso }: TabEstudiantesProps) {
  const [selectedStudent, setSelectedStudent] =
    useState<StudentProfileModal | null>(null);
  const [parents, setParents] = useState<ParentProfile[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  const [psychCases, setPsychCases] = useState<PsychCaseWithFiles[]>([]);
  const [loadingPsych, setLoadingPsych] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleVerPerfil = async (estudiante: any) => {
    setSelectedStudent(estudiante);
    setParents([]);
    setPsychCases([]);
    setLoadingParents(true);
    setLoadingPsych(true);

    const supabase = createClient();
    const profileId: string = estudiante.user_id;
    const studentEnrolledId: string = estudiante.id;

    try {
      const [profileResult, conditionsResult, parentsResult, psychResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("phone, document_type, document_number")
            .eq("id", profileId)
            .maybeSingle(),

          supabase
            .from("profile_has_learning_condition")
            .select(
              "learning_condition_id, learning_condition:learning_condition_id(id, name, color)",
            )
            .eq("profile_id", profileId),

          supabase
            .from("parent_has_student")
            .select(
              "parent_id, profiles!parent_has_student_parent_id_fkey(id, full_name, email, phone, avatar_url)",
            )
            .eq("student_id", profileId),

          supabase
            .from("psych_case")
            .select(`
              id,
              status,
              summary,
              psych_case_type!psych_case_case_type_id_fkey(name),
              psych_file!psych_file_psych_case_id_fkey(
                id,
                title,
                original_name,
                mime_type,
                file_size,
                storage_path,
                bucket,
                created_at,
                academic_period_has_cycle:academic_period_has_cycle_id(
                  academic_period:academic_period_id(name),
                  cycle:cycle_id(name)
                )
              )
            `)
            .eq("student_enrolled_id", studentEnrolledId),
        ]);

      const freshConditions = (conditionsResult.data || [])
        .map((row: any) => row.learning_condition)
        .filter(Boolean);

      setSelectedStudent((prev) => ({
        ...(prev as any),
        phone: profileResult.data?.phone ?? null,
        document_type: profileResult.data?.document_type ?? null,
        document_number: profileResult.data?.document_number ?? null,
        conditions: freshConditions,
      }));

      if (!parentsResult.error && parentsResult.data) {
        setParents(
          parentsResult.data
            .map((row: any) => row.profiles)
            .filter(Boolean) as ParentProfile[],
        );
      }

      if (!psychResult.error && psychResult.data) {
        const formatted: PsychCaseWithFiles[] = (psychResult.data as any[])
          .filter((c) => (c.psych_file?.length ?? 0) > 0)
          .map((c) => ({
            id: c.id,
            status: c.status,
            summary: c.summary,
            case_type_name: c.psych_case_type?.name ?? null,
            files: (c.psych_file || []).map((f: any) => {
              const ap = f.academic_period_has_cycle?.academic_period?.name;
              const cy = f.academic_period_has_cycle?.cycle?.name;
              return {
                ...f,
                period_cycle_label: ap && cy ? `${ap} · ${cy}` : null,
              };
            }),
          }));
        setPsychCases(formatted);
      }
    } catch {
      // silencioso
    } finally {
      setLoadingParents(false);
      setLoadingPsych(false);
    }
  };

  const handleDownload = async (file: PsychFileItem) => {
    if (!file.storage_path) return;
    setDownloadingId(file.id);
    const supabase = createClient();
    try {
      const { data, error } = await supabase.storage
        .from(file.bucket || "psychology-files")
        .download(file.storage_path);
      if (error) throw error;
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.original_name || file.title || "archivo";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // silencioso
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenInTab = (file: PsychFileItem) => {
    if (!file.storage_path) return;
    const supabase = createClient();
    const { data } = supabase.storage
      .from(file.bucket || "psychology-files")
      .getPublicUrl(file.storage_path);
    if (data?.publicUrl) window.open(data.publicUrl, "_blank");
  };

  const totalFiles = psychCases.reduce((acc, c) => acc + c.files.length, 0);

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
      case "abierto":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "closed":
      case "cerrado":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const translateStatus = (s: string) => {
    const map: Record<string, string> = { open: "Abierto", closed: "Cerrado" };
    return map[s?.toLowerCase()] ?? s;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            {curso?.cantidadEstudiantes || 0} estudiantes inscritos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Condición</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {curso?.estudiantes && curso.estudiantes.length > 0 ? (
                curso.estudiantes.map((estudiante: any) => (
                  <TableRow key={estudiante.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {estudiante.avatar_url || estudiante.avatar ? (
                          <img
                            src={estudiante.avatar_url || estudiante.avatar}
                            alt={estudiante.full_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {estudiante.full_name
                                ?.split(" ")
                                .map((n: any) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </span>
                          </div>
                        )}
                        <span>{estudiante.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{estudiante.email}</TableCell>
                    <TableCell>
                      {estudiante.conditions?.length > 0 ? (
                        <ConditionBadges conditions={estudiante.conditions} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerPerfil(estudiante)}
                      >
                        Ver Perfil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No hay estudiantes inscritos en este curso
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de perfil */}
      <Dialog
        open={!!selectedStudent}
        onOpenChange={(v) => !v && setSelectedStudent(null)}
      >
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Perfil del Estudiante</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <Tabs defaultValue="perfil" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="perfil">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="archivos" className="relative">
                  <Brain className="w-4 h-4 mr-2" />
                  Archivos Psicológicos
                  {!loadingPsych && totalFiles > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                      {totalFiles}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── Tab Perfil ── */}
              <TabsContent value="perfil" className="space-y-5 pt-2">
                {/* Avatar + nombre */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                    {selectedStudent.avatar_url ? (
                      <img
                        src={selectedStudent.avatar_url}
                        alt={selectedStudent.full_name || ""}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      (selectedStudent.full_name || "?")[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {selectedStudent.full_name || "Sin nombre"}
                    </p>
                    <ConditionBadges
                      conditions={selectedStudent.conditions}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Datos de contacto */}
                <div className="rounded-lg border divide-y">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Correo</p>
                      <p className="text-sm font-medium">
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>

                  {selectedStudent.document_number && (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Documento
                        </p>
                        <p className="text-sm font-medium">
                          {selectedStudent.document_type}{" "}
                          {selectedStudent.document_number}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Padres / Tutores */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-purple-500" />
                    Padres / Tutores
                  </p>

                  {loadingParents ? (
                    <div className="flex items-center justify-center py-4 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm">Cargando...</span>
                    </div>
                  ) : parents.length > 0 ? (
                    <div className="rounded-lg border divide-y">
                      {parents.map((parent) => (
                        <div
                          key={parent.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                            {parent.avatar_url ? (
                              <img
                                src={parent.avatar_url}
                                alt={parent.full_name || ""}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (parent.full_name || "?")[0].toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {parent.full_name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {parent.email}
                            </p>
                            {parent.phone && (
                              <p className="text-xs text-muted-foreground">
                                {parent.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground rounded-lg border border-dashed">
                      Sin padre/tutor asignado
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ── Tab Archivos Psicológicos ── */}
              <TabsContent value="archivos" className="pt-2">
                {loadingPsych ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Cargando archivos...</span>
                  </div>
                ) : psychCases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FolderOpen className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Sin archivos psicológicos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No se han subido archivos en ningún caso de este estudiante
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                    {psychCases.map((c) => (
                      <div key={c.id} className="rounded-lg border">
                        {/* Case header */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b rounded-t-lg">
                          <Brain className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground truncate flex-1">
                            {c.case_type_name ?? "Caso psicológico"}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${statusColor(c.status)}`}
                          >
                            {translateStatus(c.status)}
                          </Badge>
                        </div>

                        {/* Files list */}
                        <div className="divide-y">
                          {c.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-3 px-3 py-2.5"
                            >
                              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {file.title || file.original_name || "Archivo"}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {file.mime_type && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {file.mime_type.split("/")[1]?.toUpperCase()}
                                    </span>
                                  )}
                                  {file.file_size && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {(file.file_size / 1024).toFixed(0)} KB
                                    </span>
                                  )}
                                  {file.period_cycle_label && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                      {file.period_cycle_label}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                {(file.mime_type?.startsWith("image/") ||
                                  file.mime_type === "application/pdf") && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    title="Abrir en nueva pestaña"
                                    onClick={() => handleOpenInTab(file)}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Descargar"
                                  disabled={downloadingId === file.id}
                                  onClick={() => handleDownload(file)}
                                >
                                  {downloadingId === file.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
