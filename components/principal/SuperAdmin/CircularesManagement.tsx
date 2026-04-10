"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Newspaper,
  Send,
  Paperclip,
  X,
  Plus,
  Mail,
  Eye,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { sendEmail } from "@/app/actions/send-email";
import { RichTextEditor } from "./components/RichTextEditor";
import { RecipientGroupPicker } from "./components/RecipientGroupPicker";
import { UserInfoStore } from "@/Stores/UserInfoStore";

// ── Tipos locales ────────────────────────────────────────────────────────────
type AttachmentFile = {
  name: string;
  size: number;
  file: File;
};

type HistoryAttachment = {
  name: string;
  size: number;
  url: string;
  storage_path: string;
};

type AnnouncementHistoryItem = {
  id: string;
  subject: string;
  to_emails: string[];
  from_name: string | null;
  created_at: string;
  attachments: HistoryAttachment[] | null;
};

type AnnouncementDraft = {
  subject: string;
  fromName: string;
  html: string;
  toEmails: string[];
  attachments: AttachmentFile[];
};

const EMPTY_DRAFT: AnnouncementDraft = {
  subject: "",
  fromName: "",
  html: "",
  toEmails: [],
  attachments: [],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Devuelve la URL a cargar en el iframe según la extensión del archivo */
function getViewerUrl(filename: string, url: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const officeExts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
  if (officeExts.includes(ext)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }
  return url;
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function CircularesManagement() {
  const currentRole = UserInfoStore((s) => s.current_role);
  const canSeeHistory = currentRole === "super-admin";

  const [draft, setDraft] = useState<AnnouncementDraft>(EMPTY_DRAFT);
  const [emailInput, setEmailInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Historial ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("nueva");

  // Si el rol no puede ver el historial y el tab activo es historial, volver a nueva
  const safeTab = activeTab === "historial" && !canSeeHistory ? "nueva" : activeTab;
  const [previewAttachment, setPreviewAttachment] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [history, setHistory] = useState<AnnouncementHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PAGE_SIZE = 8;

  useEffect(() => {
    if (activeTab !== "historial" || historyLoaded) return;

    const load = async () => {
      setLoadingHistory(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("announcements")
          .select("id, subject, to_emails, from_name, created_at, attachments")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setHistory((data as AnnouncementHistoryItem[]) ?? []);
        setHistoryLoaded(true);
      } catch (err: unknown) {
        console.error("[historial]", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    load();
  }, [activeTab, historyLoaded]);

  // ── Destinatarios ──────────────────────────────────────────────────────────
  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (draft.toEmails.includes(email)) {
      setEmailInput("");
      return;
    }
    setDraft((d) => ({ ...d, toEmails: [...d.toEmails, email] }));
    setEmailInput("");
  };

  const removeEmail = (email: string) => {
    setDraft((d) => ({
      ...d,
      toEmails: d.toEmails.filter((e) => e !== email),
    }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail();
    }
  };

  // ── Agregar emails desde grupo ─────────────────────────────────────────────
  const handleAddGroup = (emails: string[], _label: string) => {
    setDraft((d) => ({
      ...d,
      toEmails: Array.from(new Set([...d.toEmails, ...emails])),
    }));
  };

  // ── Adjuntos ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newAttachments: AttachmentFile[] = files.map((f) => ({
      name: f.name,
      size: f.size,
      file: f,
    }));
    setDraft((d) => ({
      ...d,
      attachments: [...d.attachments, ...newAttachments],
    }));
    // Limpiar el input para permitir re-seleccionar el mismo archivo
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (name: string) => {
    setDraft((d) => ({
      ...d,
      attachments: d.attachments.filter((a) => a.name !== name),
    }));
  };

  // ── Validación básica ─────────────────────────────────────────────────────
  const isValid =
    draft.subject.trim() !== "" &&
    draft.html.trim() !== "" &&
    draft.toEmails.length > 0;

  // ── Enviar circular ───────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!isValid || sending) return;
    setSending(true);
    setSendError(null);

    try {
      const supabase = createClient();

      // 1. Subir adjuntos al bucket "announcements" → obtener URL pública (historial)
      //    y signed URL de 1 hora (para que Nodemailer descargue durante el envío)
      type StoredAttachment = {
        filename: string;
        publicUrl: string; // permanente — se guarda en BD para el historial
        signedUrl: string; // expira en 1 h — solo para que Nodemailer descargue ahora
        storagePath: string;
        size: number;
      };
      const storedAttachments: StoredAttachment[] = [];

      for (const att of draft.attachments) {
        const safeName = att.name.replace(/\s+/g, "_");
        const storagePath = `circulares/${Date.now()}-${safeName}`;

        const { error: uploadErr } = await supabase.storage
          .from("announcements")
          .upload(storagePath, att.file, {
            contentType: att.file.type || "application/octet-stream",
            upsert: false,
          });

        if (uploadErr)
          throw new Error(`Error subiendo "${att.name}": ${uploadErr.message}`);

        const { data: urlData } = supabase.storage
          .from("announcements")
          .getPublicUrl(storagePath);

        const { data: signed, error: signErr } = await supabase.storage
          .from("announcements")
          .createSignedUrl(storagePath, 60 * 60); // válida 1 hora

        if (signErr || !signed)
          throw new Error(`Error generando URL para "${att.name}"`);

        storedAttachments.push({
          filename: att.name,
          publicUrl: urlData.publicUrl,
          signedUrl: signed.signedUrl,
          storagePath,
          size: att.size,
        });
      }

      // 2. Enviar el correo vía Server Action
      //    BCC = destinatarios no se ven entre sí
      //    Nodemailer descarga cada adjunto usando la signed URL (válida 1 h)
      const result = await sendEmail({
        bcc: draft.toEmails,
        subject: draft.subject,
        html: draft.html,
        fromName: draft.fromName || undefined,
        attachments:
          storedAttachments.length > 0
            ? storedAttachments.map((a) => ({
                filename: a.filename,
                path: a.signedUrl,
              }))
            : undefined,
      });

      if (!result.success) throw new Error(result.error);

      // 3. Guardar registro en announcements
      //    Se guarda la publicUrl para que el historial pueda mostrar el link de descarga
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: period } = await supabase
        .from("academic_period")
        .select("id, institute_id")
        .eq("is_active", true)
        .single();

      if (user && period) {
        await supabase.from("announcements").insert({
          created_by: user.id,
          institute_id: period.institute_id,
          academic_period_id: period.id,
          subject: draft.subject,
          html: draft.html,
          to_emails: draft.toEmails,
          from_name: draft.fromName || null,
          attachments: storedAttachments.map((a) => ({
            name: a.filename,
            size: a.size,
            url: a.publicUrl,
            storage_path: a.storagePath,
          })),
        });
      }

      // 4. Éxito
      toast.success(
        `Circular enviada a ${draft.toEmails.length} destinatario${draft.toEmails.length !== 1 ? "s" : ""}`,
      );
      setDraft(EMPTY_DRAFT);
      setShowPreview(false);
      setHistoryLoaded(false); // fuerza recarga del historial al próximo cambio de tab
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al enviar la circular";
      setSendError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3 z-1 relative">
        <Newspaper className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Circulares</h1>
          <p className="text-sm text-muted-foreground">
            Redacta y envía comunicados a padres de familia
          </p>
        </div>
      </div>

      <Tabs
        value={safeTab}
        onValueChange={setActiveTab}
        className="relative z-1"
      >
        <TabsList>
          <TabsTrigger value="nueva">
            <Plus className="w-4 h-4 mr-2" />
            Nueva circular
          </TabsTrigger>
          {canSeeHistory && (
            <TabsTrigger value="historial">
              <Clock className="w-4 h-4 mr-2" />
              Historial
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── TAB: Nueva circular ─────────────────────────────────────────── */}
        <TabsContent value="nueva" className="mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Formulario — 2/3 del ancho */}
            <div className="xl:col-span-2 space-y-5">
              {/* Asunto */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Asunto del correo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Ej: Reunión de padres – Primer período 2025"
                    value={draft.subject}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, subject: e.target.value }))
                    }
                  />
                </CardContent>
              </Card>

              {/* Destinatarios */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Destinatarios
                  </CardTitle>
                  <CardDescription>
                    Escribe un correo y presiona Enter o coma para agregarlo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Tags de emails */}
                  {draft.toEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30 min-h-[44px]">
                      {draft.toEmails.map((email) => (
                        <Badge
                          key={email}
                          variant="secondary"
                          className="flex items-center gap-1.5 pr-1"
                        >
                          {email}
                          <button
                            onClick={() => removeEmail(email)}
                            className="rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Input de email */}
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={handleEmailKeyDown}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEmail}
                      disabled={!emailInput.trim()}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </Button>
                  </div>

                  {/* Agregar por grupo */}
                  <RecipientGroupPicker onAdd={handleAddGroup} />

                  {draft.toEmails.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {draft.toEmails.length} destinatario
                      {draft.toEmails.length !== 1 ? "s" : ""} agregado
                      {draft.toEmails.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Cuerpo del mensaje */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Cuerpo del mensaje
                  </CardTitle>
                  <CardDescription>
                    Usa la barra de herramientas para dar formato al texto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={draft.html}
                    onChange={(html) => setDraft((d) => ({ ...d, html }))}
                    placeholder="Estimados padres de familia, les informamos que..."
                    minHeight={260}
                  />
                </CardContent>
              </Card>

              {/* Adjuntos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Archivos adjuntos
                    {draft.attachments.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {draft.attachments.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Lista de archivos */}
                  {draft.attachments.length > 0 && (
                    <div className="space-y-2">
                      {draft.attachments.map((att) => (
                        <div
                          key={att.name}
                          className="flex items-center justify-between px-3 py-2 rounded-lg border bg-muted/30"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">{att.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatBytes(att.size)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => removeAttachment(att.name)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón de carga */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Seleccionar archivos
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    PDF, Word, Excel, imágenes — máx. 10 MB por archivo
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Panel derecho — Resumen + acciones */}
            <div className="space-y-4">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Validación */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {draft.subject.trim() ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span
                        className={
                          draft.subject.trim() ? "" : "text-muted-foreground"
                        }
                      >
                        Asunto
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {draft.toEmails.length > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span
                        className={
                          draft.toEmails.length > 0
                            ? ""
                            : "text-muted-foreground"
                        }
                      >
                        Destinatarios ({draft.toEmails.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {draft.html.trim() ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span
                        className={
                          draft.html.trim() ? "" : "text-muted-foreground"
                        }
                      >
                        Cuerpo del mensaje
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Adjuntos ({draft.attachments.length}) — opcional
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Acciones */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!draft.html.trim()}
                      onClick={() => setShowPreview((v) => !v)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {showPreview ? "Cerrar vista previa" : "Vista previa"}
                    </Button>

                    <Button
                      className="w-full"
                      disabled={!isValid || sending}
                      onClick={handleSend}
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {sending ? "Enviando..." : "Enviar circular"}
                    </Button>
                  </div>

                  {sendError && (
                    <p className="text-xs text-destructive text-center">
                      {sendError}
                    </p>
                  )}

                  {!isValid && !sendError && (
                    <p className="text-xs text-muted-foreground text-center">
                      Completa los campos marcados para habilitar el envío
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Vista previa del HTML */}
          {showPreview && draft.html.trim() && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Vista previa del correo
                </CardTitle>
                {draft.subject && (
                  <p className="text-sm text-muted-foreground">
                    Asunto:{" "}
                    <span className="font-medium text-foreground">
                      {draft.subject}
                    </span>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-white min-h-[120px]">
                  <div
                    dangerouslySetInnerHTML={{ __html: draft.html }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── TAB: Historial ──────────────────────────────────────────────── */}
        <TabsContent value="historial" className="mt-4">
          {(() => {
            const filtered = history.filter((item) =>
              item.subject.toLowerCase().includes(historySearch.toLowerCase()),
            );
            const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORY_PAGE_SIZE));
            const safePage = Math.min(historyPage, totalPages);
            const paginated = filtered.slice(
              (safePage - 1) * HISTORY_PAGE_SIZE,
              safePage * HISTORY_PAGE_SIZE,
            );

            return (
              <div className="space-y-4">
                {/* ── Header del historial ── */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-base font-semibold">Circulares enviadas</h2>
                    <p className="text-sm text-muted-foreground">
                      {history.length} circular{history.length !== 1 ? "es" : ""} en el registro
                    </p>
                  </div>
                  {/* Buscador */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por asunto..."
                      value={historySearch}
                      onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                </div>

                {/* ── Contenido ── */}
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Cargando historial...</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground border rounded-xl bg-muted/20">
                    <Newspaper className="w-12 h-12 opacity-20" />
                    <div className="text-center">
                      <p className="font-medium">Sin circulares enviadas</p>
                      <p className="text-sm mt-0.5">Las circulares que envíes aparecerán aquí.</p>
                    </div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground border rounded-xl bg-muted/20">
                    <Search className="w-10 h-10 opacity-20" />
                    <p className="text-sm">No hay resultados para &quot;{historySearch}&quot;</p>
                  </div>
                ) : (
                  <>
                    {/* Lista */}
                    <div className="grid gap-3">
                      {paginated.map((item, idx) => (
                        <div
                          key={item.id}
                          className="group flex gap-4 p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                        >
                          {/* Número */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mt-0.5">
                            {(safePage - 1) * HISTORY_PAGE_SIZE + idx + 1}
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-semibold text-sm leading-snug truncate">
                                {item.subject}
                              </p>
                              <Badge
                                variant="outline"
                                className="shrink-0 text-emerald-700 border-emerald-300 bg-emerald-50 text-[11px]"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Enviada
                              </Badge>
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {formatDate(item.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {item.to_emails.length} destinatario{item.to_emails.length !== 1 ? "s" : ""}
                              </span>
                              {item.from_name && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {item.from_name}
                                </span>
                              )}
                            </div>

                            {/* Adjuntos */}
                            {item.attachments && item.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {item.attachments.map((att) => (
                                  <button
                                    key={att.storage_path}
                                    onClick={() => setPreviewAttachment({ name: att.name, url: att.url })}
                                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-primary/25 bg-primary/5 text-primary hover:bg-primary/15 transition-colors"
                                  >
                                    <Paperclip className="w-3 h-3 shrink-0" />
                                    <span className="max-w-[140px] truncate">{att.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Paginador ── */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                          Mostrando {(safePage - 1) * HISTORY_PAGE_SIZE + 1}–{Math.min(safePage * HISTORY_PAGE_SIZE, filtered.length)} de {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                            .reduce<(number | "…")[]>((acc, p, i, arr) => {
                              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((p, i) =>
                              p === "…" ? (
                                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground">…</span>
                              ) : (
                                <button
                                  key={p}
                                  onClick={() => setHistoryPage(p as number)}
                                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                    safePage === p
                                      ? "bg-primary text-primary-foreground"
                                      : "border border-border hover:bg-muted"
                                  }`}
                                >
                                  {p}
                                </button>
                              ),
                            )}

                          <button
                            onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* ── Modal de vista previa de adjunto ──────────────────────────────── */}
      <Dialog
        open={!!previewAttachment}
        onOpenChange={(open) => !open && setPreviewAttachment(null)}
      >
        <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <DialogTitle className="flex items-center justify-between gap-2 text-sm font-medium">
              <span className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{previewAttachment?.name}</span>
              </span>
              <a
                href={previewAttachment?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 mr-15"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir en nueva pestaña
              </a>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 p-2 flex justify-center items-center">
            {previewAttachment && (
              <iframe
                src={getViewerUrl(
                  previewAttachment.name,
                  previewAttachment.url,
                )}
                title={previewAttachment.name}
                className="w-full h-full rounded border-0 flex justify-center items-center"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
