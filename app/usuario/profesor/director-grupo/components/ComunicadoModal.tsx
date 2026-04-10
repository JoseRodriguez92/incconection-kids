"use client";

import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  CheckCheck,
  FileText,
  Loader2,
  Megaphone,
  Paperclip,
  Plus,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { sendEmail } from "@/app/actions/send-email";
import { toast } from "sonner";
import type { GroupWithStudents } from "../types";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  groups: GroupWithStudents[];
};

export function ComunicadoModal({ open, onClose, groups }: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToStudents, setSendToStudents] = useState(true);
  const [sendToParents, setSendToParents] = useState(true);
  const [recipientSet, setRecipientSet] = useState<Set<string>>(new Set());
  const [customEmailInput, setCustomEmailInput] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recipientList = Array.from(recipientSet);

  // Inicializar destinatarios al abrir
  useEffect(() => {
    if (!open) return;
    const set = new Set<string>();
    for (const g of groups) {
      for (const s of g.students) {
        if (sendToStudents) set.add(s.email);
        if (sendToParents) for (const p of s.parents) set.add(p.email);
      }
    }
    setRecipientSet(set);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleToggleStudents = (checked: boolean) => {
    setSendToStudents(checked);
    setRecipientSet((prev) => {
      const next = new Set(prev);
      for (const g of groups)
        for (const s of g.students)
          checked ? next.add(s.email) : next.delete(s.email);
      return next;
    });
  };

  const handleToggleParents = (checked: boolean) => {
    setSendToParents(checked);
    setRecipientSet((prev) => {
      const next = new Set(prev);
      for (const g of groups)
        for (const s of g.students)
          for (const p of s.parents)
            checked ? next.add(p.email) : next.delete(p.email);
      return next;
    });
  };

  const removeRecipient = (email: string) =>
    setRecipientSet((prev) => {
      const next = new Set(prev);
      next.delete(email);
      return next;
    });

  const addCustomEmail = () => {
    const email = customEmailInput.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Introduce un correo válido.");
      return;
    }
    setRecipientSet((prev) => new Set(prev).add(email));
    setCustomEmailInput("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachmentFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...files.filter((f) => !names.has(f.name))];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (name: string) =>
    setAttachmentFiles((prev) => prev.filter((f) => f.name !== name));

  const reset = () => {
    setSubject("");
    setBody("");
    setSendToStudents(true);
    setSendToParents(true);
    setRecipientSet(new Set());
    setCustomEmailInput("");
    setAttachmentFiles([]);
  };

  const handleSend = async () => {
    const recipients = Array.from(recipientSet);
    if (!subject.trim() || !body.trim()) {
      toast.error("Completa el asunto y el mensaje antes de enviar.");
      return;
    }
    if (recipients.length === 0) {
      toast.error("No hay destinatarios. Añade al menos uno.");
      return;
    }
    setSending(true);
    try {
      const attachments = await Promise.all(
        attachmentFiles.map(async (file) => ({
          filename: file.name,
          content: await fileToBase64(file),
          encoding: "base64" as const,
          contentType: file.type || "application/octet-stream",
        })),
      );

      const result = await sendEmail({
        bcc: recipients,
        subject: subject.trim(),
        html: `<p style="white-space:pre-wrap;">${body.trim().replace(/\n/g, "<br/>")}</p>`,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (!result.success) throw new Error(result.error);
      toast.success(
        `Comunicado enviado a ${recipients.length} destinatario${recipients.length !== 1 ? "s" : ""}.`,
      );
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Error al enviar el comunicado.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="h-5 w-5 text-primary" />
            Crear comunicado
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-5">
            {/* ─ Selección masiva ─ */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Selección por grupo</Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={sendToStudents}
                    onCheckedChange={(v) => handleToggleStudents(!!v)}
                  />
                  <span className="text-sm">Estudiantes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={sendToParents}
                    onCheckedChange={(v) => handleToggleParents(!!v)}
                  />
                  <span className="text-sm">Padres de familia</span>
                </label>
              </div>
            </div>

            <Separator />

            {/* ─ Lista de destinatarios ─ */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Destinatarios</Label>
                {recipientList.length > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    {recipientList.length}{" "}
                    {recipientList.length !== 1 ? "destinatarios" : "destinatario"}
                  </span>
                )}
              </div>

              {recipientList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/30 max-h-36 overflow-y-auto">
                  {recipientList.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-background border border-border text-xs font-medium"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeRecipient(email)}
                        className="ml-0.5 p-0.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Sin destinatarios. Activa los checkboxes o añade uno manual.
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="correo@ejemplo.com"
                  value={customEmailInput}
                  onChange={(e) => setCustomEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomEmail();
                    }
                  }}
                  className="text-sm h-8"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addCustomEmail}
                  className="h-8 px-3 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Añadir
                </Button>
              </div>
            </div>

            <Separator />

            {/* ─ Asunto ─ */}
            <div className="space-y-1.5">
              <Label htmlFor="comunicado-subject" className="text-sm font-semibold">
                Asunto
              </Label>
              <Input
                id="comunicado-subject"
                placeholder="Ej: Reunión de padres — Viernes 28"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* ─ Mensaje ─ */}
            <div className="space-y-1.5">
              <Label htmlFor="comunicado-body" className="text-sm font-semibold">
                Mensaje
              </Label>
              <Textarea
                id="comunicado-body"
                placeholder="Escribe aquí el contenido del comunicado..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            {/* ─ Adjuntos ─ */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Archivos adjuntos{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-6 w-6 mx-auto text-muted-foreground mb-1.5" />
                <p className="text-xs text-muted-foreground">
                  Haz clic para adjuntar archivos
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {attachmentFiles.length > 0 && (
                <div className="space-y-1.5">
                  {attachmentFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm"
                    >
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="flex-1 min-w-0 truncate font-medium">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatBytes(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.name)}
                        className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          {recipientList.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mr-auto">
              <CheckCheck className="h-3.5 w-3.5" />
              {recipientList.length} destinatario
              {recipientList.length !== 1 ? "s" : ""}
              {attachmentFiles.length > 0 &&
                ` · ${attachmentFiles.length} archivo${attachmentFiles.length !== 1 ? "s" : ""}`}
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={sending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              sending ||
              recipientList.length === 0 ||
              !subject.trim() ||
              !body.trim()
            }
            className="flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? "Enviando..." : "Enviar comunicado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
