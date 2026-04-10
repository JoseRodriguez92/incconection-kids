"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDate } from "./utils";

interface CaseDetailsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedCase: any;
  // Sessions
  sessions: any[];
  sessionsLoading: boolean;
  onOpenSessionDialog: (session?: any) => void;
  onDeleteSession: (id: string) => void;
  // Followups
  followups: any[];
  followupsLoading: boolean;
  onOpenFollowupDialog: (followup?: any) => void;
  onDeleteFollowup: (id: string) => void;
  // Meetings
  meetings: any[];
  meetingsLoading: boolean;
  onOpenMeetingDialog: (meeting?: any) => void;
  onDeleteMeeting: (id: string) => void;
  // Files
  files: any[];
  filesLoading: boolean;
  onOpenFileDialog: () => void;
  onPreviewFile: (file: any) => void;
  onDownloadFile: (file: any) => void;
  onDeleteFile: (id: string, storagePath: string, bucket: string) => void;
}

export function CaseDetailsDialog({
  open,
  onOpenChange,
  selectedCase,
  sessions,
  sessionsLoading,
  onOpenSessionDialog,
  onDeleteSession,
  followups,
  followupsLoading,
  onOpenFollowupDialog,
  onDeleteFollowup,
  meetings,
  meetingsLoading,
  onOpenMeetingDialog,
  onDeleteMeeting,
  files,
  filesLoading,
  onOpenFileDialog,
  onPreviewFile,
  onDownloadFile,
  onDeleteFile,
}: CaseDetailsDialogProps) {
  const caseSessions = sessions.filter((s) => s.psych_case_id === selectedCase?.id);
  const caseFollowups = followups.filter((f) => f.psych_case_id === selectedCase?.id);
  const caseMeetings = meetings.filter((m) => m.psych_case_id === selectedCase?.id);
  const caseFiles = files.filter((f) => f.psych_case_id === selectedCase?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Detalles del Caso: {selectedCase?.student_name}
          </DialogTitle>
          <DialogDescription>
            {selectedCase?.case_type_name} - {selectedCase?.status}
          </DialogDescription>
        </DialogHeader>

        {selectedCase && (
          <Tabs defaultValue="sessions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="meetings">
                <Users className="w-4 h-4 mr-1" />Citas con Padres
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <Calendar className="w-4 h-4 mr-1" />Sesiones
              </TabsTrigger>
              <TabsTrigger value="followups">
                <CheckCircle className="w-4 h-4 mr-1" />Pendientes - Tareas
              </TabsTrigger>
              <TabsTrigger value="files">
                <FileText className="w-4 h-4 mr-1" />Archivos
              </TabsTrigger>
            </TabsList>

            {/* ── Sesiones ── */}
            <TabsContent value="sessions" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sesiones</h3>
                <Button onClick={() => onOpenSessionDialog()} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />Nueva Sesión
                </Button>
              </div>
              {sessionsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : caseSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay sesiones registradas para este caso</div>
              ) : (
                <div className="space-y-3">
                  {caseSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(session.session_at)}</span>
                            {session.modality && <Badge variant="outline">{session.modality}</Badge>}
                            {session.is_internal !== null && (
                              <Badge variant="outline">{session.is_internal ? "Interna" : "Externa"}</Badge>
                            )}
                          </div>
                          {session.reason && <p className="text-sm mb-2"><span className="font-medium">Motivo:</span> {session.reason}</p>}
                          {session.assessment && <p className="text-sm mb-2"><span className="font-medium">Evaluación:</span> {session.assessment}</p>}
                          {session.intervention && <p className="text-sm mb-2"><span className="font-medium">Intervención:</span> {session.intervention}</p>}
                          {session.plan && <p className="text-sm mb-2"><span className="font-medium">Plan:</span> {session.plan}</p>}
                          {session.observations && <p className="text-sm text-muted-foreground"><span className="font-medium">Observaciones:</span> {session.observations}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => onOpenSessionDialog(session)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onDeleteSession(session.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Seguimientos ── */}
            <TabsContent value="followups" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Seguimientos</h3>
                <Button onClick={() => onOpenFollowupDialog()} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />Nuevo Seguimiento
                </Button>
              </div>
              {followupsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : caseFollowups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay seguimientos registrados para este caso</div>
              ) : (
                <div className="space-y-3">
                  {caseFollowups.map((followup) => (
                    <div key={followup.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                            <Badge>{followup.status}</Badge>
                          </div>
                          <p className="font-medium text-sm mb-2">{followup.action}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            {followup.due_at && <div><span className="font-medium">Vencimiento:</span> {formatDate(followup.due_at)}</div>}
                            {followup.responsible && <div><span className="font-medium">Responsable:</span> {followup.responsible}</div>}
                          </div>
                          {followup.completion_notes && (
                            <p className="text-sm text-muted-foreground mt-2"><span className="font-medium">Notas:</span> {followup.completion_notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => onOpenFollowupDialog(followup)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onDeleteFollowup(followup.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Reuniones ── */}
            <TabsContent value="meetings" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reuniones con Padres</h3>
                <Button onClick={() => onOpenMeetingDialog()} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />Nueva Reunión
                </Button>
              </div>
              {meetingsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : caseMeetings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay reuniones registradas para este caso</div>
              ) : (
                <div className="space-y-3">
                  {caseMeetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(meeting.meeting_at)}</span>
                          </div>
                          {meeting.attendees && <p className="text-sm mb-2"><span className="font-medium">Asistentes:</span> {meeting.attendees}</p>}
                          {meeting.url_link && (
                            <p className="text-sm mb-2">
                              <span className="font-medium">Enlace:</span>{" "}
                              <a href={meeting.url_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {meeting.url_link}
                              </a>
                            </p>
                          )}
                          {meeting.notes && <p className="text-sm mb-2"><span className="font-medium">Notas:</span> {meeting.notes}</p>}
                          {meeting.agreements && <p className="text-sm text-muted-foreground"><span className="font-medium">Acuerdos:</span> {meeting.agreements}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => onOpenMeetingDialog(meeting)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onDeleteMeeting(meeting.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Archivos ── */}
            <TabsContent value="files" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Archivos del Caso</h3>
                <Button onClick={onOpenFileDialog} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />Subir Archivo
                </Button>
              </div>
              {filesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : caseFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay archivos adjuntos para este caso</div>
              ) : (
                <div className="space-y-3">
                  {caseFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{file.title || "Sin título"}</h3>
                          <div className="text-sm text-muted-foreground">
                            {file.original_name} • {file.file_size ? (file.file_size / 1024).toFixed(0) : 0} KB • {formatDate(file.created_at)}
                          </div>
                          {file.period_cycle_label && (
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                                {file.period_cycle_label}
                              </span>
                            </div>
                          )}
                          {file.mime_type && <div className="text-xs text-muted-foreground">{file.mime_type}</div>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onPreviewFile(file)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDownloadFile(file)}>Descargar</Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteFile(file.id, file.storage_path || "", file.bucket || "psychology-files")}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
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
  );
}
