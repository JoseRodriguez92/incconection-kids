"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Newspaper,
  Paperclip,
  Search,
  Clock,
  Loader2,
  Inbox,
  ExternalLink,
  CalendarDays,
  Users,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "driver.js/dist/driver.css";
import type { Database } from "@/src/types/database.types";

interface DocumentsContentProps {
  language: string;
  activeStudent: any;
}

type AcademicPeriod = Database["public"]["Tables"]["academic_period"]["Row"];

type HistoryAttachment = {
  name: string;
  size: number;
  url: string;
  storage_path: string;
};

type Circular = {
  id: string;
  subject: string;
  html: string;
  from_name: string | null;
  created_at: string;
  academic_period_id: string | null;
  attachments: HistoryAttachment[] | null;
  to_emails: string[];
};

const supabase = createClient();

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
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

function getViewerUrl(filename: string, url: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const officeExts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
  if (officeExts.includes(ext)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }
  return url;
}

export function DocumentsContent({ language: _language, activeStudent: _activeStudent }: DocumentsContentProps) {
  const [circulars, setCirculars]   = useState<Circular[]>([]);
  const [periods, setPeriods]       = useState<AcademicPeriod[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<string>("todos");
  const [loading, setLoading]       = useState(true);
  const [userEmail, setUserEmail]   = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<Circular | null>(null);
  const [previewAtt, setPreviewAtt] = useState<{ name: string; url: string } | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // Email del usuario autenticado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  // Períodos académicos — pre-selecciona el activo
  useEffect(() => {
    supabase
      .from("academic_period")
      .select("*")
      .order("start_date", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setPeriods(data);
        const active = data.find((p) => p.is_active);
        if (active) setFilterPeriod(active.id);
      });
  }, []);

  // Cargar circulares filtradas por email + período
  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);

    let query = supabase
      .from("announcements")
      .select("id, subject, html, from_name, created_at, academic_period_id, attachments, to_emails")
      .contains("to_emails", [userEmail]);

    if (filterPeriod !== "todos") {
      query = query.eq("academic_period_id", filterPeriod);
    }

    query.order("created_at", { ascending: false }).then(({ data }) => {
      const rows = (data as Circular[]) ?? [];
      setCirculars(rows);
      setSelected((prev) => rows.find((c) => c.id === prev?.id) ?? (rows[0] ?? null));
      setLoading(false);
    });
  }, [userEmail, filterPeriod]);

  const filtered = circulars.filter((c) =>
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  const activePeriodName = filterPeriod !== "todos"
    ? periods.find((p) => p.id === filterPeriod)?.name
    : null;

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    const hasCirculars = circulars.length > 0;

    const steps: any[] = [
      {
        element: "#tour-docs-header",
        popover: {
          title: "📰 Circulares institucionales",
          description:
            "Aquí encuentras todos los comunicados que la institución te ha enviado directamente a tu correo. Solo ves los que van dirigidos a ti.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-docs-periodo",
        popover: {
          title: "📅 Filtrar por período",
          description:
            "Filtra los comunicados por período académico. Por defecto se muestra el período activo, pero puedes consultar períodos anteriores.",
          side: "bottom",
          align: "end",
        },
      },
    ];

    if (hasCirculars) {
      steps.push(
        {
          element: "#tour-docs-lista",
          popover: {
            title: "📋 Lista de circulares",
            description:
              "Aquí aparecen todos los comunicados del período. Usa el buscador para filtrar por título. El clip 📎 indica que la circular tiene archivos adjuntos. Haz clic en cualquier circular para leerla.",
            side: "right",
          },
        },
        {
          element: "#tour-docs-detalle",
          popover: {
            title: "📄 Contenido del comunicado",
            description:
              "Aquí se muestra el contenido completo de la circular seleccionada: remitente, fecha y el mensaje completo tal como fue enviado por la institución.",
            side: "left",
          },
        },
      );
    }

    steps.push({
      element: "#tour-docs-boton",
      popover: {
        title: "❓ Tour de ayuda",
        description:
          "Puedes relanzar este recorrido en cualquier momento haciendo clic aquí.",
        side: "bottom",
        align: "end",
      },
    });

    const driverObj = driver({
      animate: true,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "¡Entendido!",
      progressText: "{{current}} de {{total}}",
      steps,
    });
    driverObj.drive();
  }, [circulars]);

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Toolbar */}
      <div id="tour-docs-header" className="px-4 py-2.5 border-b flex items-center gap-3 min-h-[48px]">
        {/* Indicador de período activo */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Newspaper className="w-4 h-4 text-primary shrink-0" />
          {activePeriodName ? (
            <span className="text-xs font-medium truncate text-foreground">{activePeriodName}</span>
          ) : (
            <span className="text-xs text-muted-foreground truncate">Todos los períodos</span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {periods.length > 0 && (
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger id="tour-docs-periodo" className="h-8 text-xs w-36 sm:w-48">
                <CalendarDays className="w-3 h-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los períodos</SelectItem>
                {periods.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.is_active && (
                      <span className="ml-1.5 text-[10px] text-green-600 font-semibold">● activo</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            id="tour-docs-boton"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={startTour}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
          <Loader2 className="w-7 h-7 animate-spin" />
          <p className="text-sm">Cargando circulares...</p>
        </div>
      ) : circulars.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Inbox className="w-7 h-7 opacity-40" />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">Sin circulares en este período</p>
            <p className="text-xs mt-1">
              {filterPeriod !== "todos"
                ? "Prueba seleccionando otro período o \"Todos los períodos\""
                : "Aquí aparecerán los comunicados que la institución te envíe"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Lista — oculta en móvil cuando hay detalle abierto ── */}
          <div
            id="tour-docs-lista"
            className={`flex flex-col border-r
              ${mobileView === "detail" ? "hidden" : "flex"}
              md:flex w-full md:w-80 md:shrink-0`}
          >
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar circular..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
                {filtered.length} circular{filtered.length !== 1 ? "es" : ""}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground text-xs">
                  <Search className="w-5 h-5 opacity-40" />
                  Sin resultados
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelected(c); setMobileView("detail"); }}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${
                      selected?.id === c.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <p className={`text-sm font-medium line-clamp-2 leading-snug ${selected?.id === c.id ? "text-primary" : ""}`}>
                      {c.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(c.created_at)}
                      </span>
                      {c.attachments && c.attachments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Paperclip className="w-3 h-3" />
                          {c.attachments.length}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Detalle — oculto en móvil cuando estamos en lista ── */}
          <div
            id="tour-docs-detalle"
            className={`flex-1 overflow-y-auto flex-col
              ${mobileView === "list" ? "hidden" : "flex"}
              md:flex`}
          >
            {!selected ? (
              <div className="hidden md:flex items-center justify-center h-full text-muted-foreground text-sm">
                Selecciona una circular
              </div>
            ) : (
              <div className="p-4 md:p-6 space-y-5">
                {/* Botón volver — solo móvil */}
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden flex items-center gap-2 text-sm text-primary font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a circulares
                </button>

                <div className="space-y-2">
                  <h2 className="text-base md:text-lg font-bold leading-snug">{selected.subject}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {selected.from_name && (
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Users className="w-3.5 h-3.5" />
                        {selected.from_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(selected.created_at)}
                    </span>
                  </div>
                </div>

                {selected.attachments && selected.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selected.attachments.map((att) => (
                      <button
                        key={att.storage_path}
                        onClick={() => setPreviewAtt({ name: att.name, url: att.url })}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Paperclip className="w-3 h-3 shrink-0" />
                        <span className="max-w-[180px] truncate">{att.name}</span>
                        {att.size > 0 && (
                          <span className="text-muted-foreground ml-1">{formatBytes(att.size)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div
                      className="prose prose-sm max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: selected.html }}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal visor de adjunto ── */}
      <Dialog open={!!previewAtt} onOpenChange={(open) => !open && setPreviewAtt(null)}>
        <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <DialogTitle className="flex items-center justify-between gap-2 text-sm font-medium">
              <span className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{previewAtt?.name}</span>
              </span>
              <a
                href={previewAtt?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 mr-8"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir en nueva pestaña
              </a>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 p-2">
            {previewAtt && (
              <iframe
                src={getViewerUrl(previewAtt.name, previewAtt.url)}
                title={previewAtt.name}
                className="w-full h-full rounded border-0"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
