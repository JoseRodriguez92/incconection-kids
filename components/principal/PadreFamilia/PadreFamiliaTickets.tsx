"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MessageSquare,
  Clock,
  Plus,
  Send,
  Loader2,
  Inbox,
  TicketCheck,
  Info,
  CalendarDays,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import "driver.js/dist/driver.css";
import { InstituteStore } from "@/Stores/InstituteStore";
import { toast } from "sonner";
import type { Database } from "@/src/types/database.types";

type AcademicPeriod = Database["public"]["Tables"]["academic_period"]["Row"];

type TicketStatus = Database["public"]["Tables"]["ticket_status"]["Row"];
type TicketPriority = Database["public"]["Tables"]["ticket_priority"]["Row"];
type TicketCategory = Database["public"]["Tables"]["ticket_category"]["Row"];

type TicketComment = Database["public"]["Tables"]["ticket_comment"]["Row"] & {
  author?: { full_name: string | null } | null;
};

type Ticket = Database["public"]["Tables"]["ticket"]["Row"] & {
  status?: TicketStatus | null;
  priority?: TicketPriority | null;
  category?: TicketCategory | null;
};

const supabase = createClient();

function formatDate(d: string) {
  return new Date(d).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function PadreFamiliaTickets() {
  const { institute } = InstituteStore();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category_id: "",
    priority_id: "",
  });
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    Promise.all([
      supabase.from("ticket_status").select("*").order("sort_order"),
      supabase.from("ticket_priority").select("*").order("sort_order"),
      supabase.from("ticket_category").select("*").order("name"),
    ]).then(([s, p, c]) => {
      if (s.data) setStatuses(s.data);
      if (p.data) setPriorities(p.data);
      if (c.data) setCategories(c.data);
    });
  }, []);

  // Períodos académicos — pre-selecciona el activo
  useEffect(() => {
    if (!institute?.id) return;
    supabase
      .from("academic_period")
      .select("*")
      .eq("institute_id", institute.id)
      .order("start_date", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setPeriods(data);
        const active = data.find((p) => p.is_active);
        if (active) setFilterPeriod(active.id);
      });
  }, [institute?.id]);

  const fetchTickets = useCallback(async () => {
    if (!currentUserId || !institute?.id) return;
    setLoading(true);
    try {
      let query = supabase
        .from("ticket")
        .select(
          `*,
          status:status_id(id, name, color, is_closed, sort_order, created_at),
          priority:priority_id(id, name, color, sort_order, created_at),
          category:category_id(id, name, description, created_at)`,
        )
        .eq("institute_id", institute.id)
        .eq("reported_by", currentUserId);

      if (filterPeriod !== "todos") {
        const period = periods.find((p) => p.id === filterPeriod);
        if (period) {
          query = query
            .gte("created_at", period.start_date)
            .lte("created_at", `${period.end_date}T23:59:59`);
        }
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      const rows = (data ?? []) as unknown as Ticket[];
      setTickets(rows);
      if (rows.length > 0)
        setSelected((prev) => rows.find((t) => t.id === prev?.id) ?? rows[0]);
      else setSelected(null);
    } catch {
      toast.error("Error al cargar tickets");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, institute?.id, filterPeriod, periods]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (!selected) return;
    setLoadingComments(true);
    supabase
      .from("ticket_comment")
      .select("*, author:author_id(full_name)")
      .eq("ticket_id", selected.id)
      .eq("is_internal", false)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setComments((data as TicketComment[]) ?? []);
        setLoadingComments(false);
      });
  }, [selected?.id]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !selected || !currentUserId) return;
    setSendingComment(true);
    try {
      const { error } = await supabase.from("ticket_comment").insert({
        ticket_id: selected.id,
        author_id: currentUserId,
        comment: newComment.trim(),
        is_internal: false,
      });
      if (error) throw error;
      setNewComment("");
      const { data } = await supabase
        .from("ticket_comment")
        .select("*, author:author_id(full_name)")
        .eq("ticket_id", selected.id)
        .eq("is_internal", false)
        .order("created_at", { ascending: true });
      setComments((data as TicketComment[]) ?? []);
      toast.success("Comentario enviado");
    } catch {
      toast.error("Error al enviar comentario");
    } finally {
      setSendingComment(false);
    }
  };

  const handleCreateTicket = async () => {
    if (
      !newTicket.title ||
      !newTicket.description ||
      !newTicket.category_id ||
      !newTicket.priority_id
    ) {
      toast.error("Completa todos los campos");
      return;
    }
    if (!institute?.id || !currentUserId) return;
    setCreating(true);
    const openStatus = statuses
      .filter((s) => !s.is_closed)
      .sort((a, b) => a.sort_order - b.sort_order)[0];
    if (!openStatus) {
      toast.error("Sin estados disponibles");
      setCreating(false);
      return;
    }
    try {
      const code = `TKT-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("ticket").insert({
        title: newTicket.title,
        description: newTicket.description,
        category_id: newTicket.category_id,
        priority_id: newTicket.priority_id,
        status_id: openStatus.id,
        institute_id: institute.id,
        reported_by: currentUserId,
        code,
      });
      if (error) throw error;
      toast.success("Ticket enviado al soporte");
      setNewTicket({
        title: "",
        description: "",
        category_id: "",
        priority_id: "",
      });
      setDialogOpen(false);
      await fetchTickets();
    } catch {
      toast.error("Error al crear ticket");
    } finally {
      setCreating(false);
    }
  };

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    const hasTickets = tickets.length > 0;

    const steps: any[] = [
      {
        element: "#tour-pf-tickets-header",
        popover: {
          title: "🎫 Mis Tickets de Soporte",
          description:
            "Aquí puedes reportar problemas o solicitudes a la institución y hacer seguimiento a su estado. Solo ves tus propios tickets.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-pf-tickets-nuevo",
        popover: {
          title: "➕ Nuevo Ticket",
          description:
            "Abre el formulario para crear una solicitud: elige categoría, prioridad y describe el problema. El equipo de soporte recibirá la solicitud y responderá a la brevedad.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-pf-tickets-filtros",
        popover: {
          title: "🔍 Filtros",
          description:
            "Busca por título, descripción o código; filtra por estado y por período académico para encontrar rápidamente la solicitud que necesitas.",
          side: "right",
        },
      },
    ];

    if (hasTickets) {
      steps.push({
        element: "#tour-pf-tickets-lista",
        popover: {
          title: "📋 Lista de solicitudes",
          description:
            "Cada tarjeta muestra el título, la categoría, la prioridad (barra de color superior) y el estado actual. Haz clic en una para ver el detalle completo.",
          side: "right",
        },
      });
    }

    steps.push(
      {
        element: "#tour-pf-tickets-detalle",
        popover: {
          title: "💬 Detalle y conversación",
          description:
            "Aquí ves la descripción completa del ticket y el hilo de mensajes con el soporte. Puedes agregar más información mientras el ticket esté abierto. El estado solo lo cambia el equipo de soporte.",
          side: "left",
        },
      },
      {
        element: "#tour-pf-tickets-boton",
        popover: {
          title: "❓ Tour de ayuda",
          description:
            "Puedes relanzar este recorrido en cualquier momento haciendo clic aquí.",
          side: "bottom",
          align: "end",
        },
      },
    );

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
  }, [tickets]);

  const filtered = tickets.filter((t) => {
    const s = searchTerm.toLowerCase();
    return (
      (t.title.toLowerCase().includes(s) ||
        (t.description ?? "").toLowerCase().includes(s) ||
        t.code.toLowerCase().includes(s)) &&
      (filterStatus === "todos" || t.status_id === filterStatus)
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div id="tour-pf-tickets-header" className="px-4 py-2.5 border-b flex items-center gap-3 min-h-[48px] shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <TicketCheck className="w-4 h-4 text-primary shrink-0" />
          {filterPeriod !== "todos" && periods.length > 0 ? (
            <span className="text-xs font-medium truncate">
              {periods.find((p) => p.id === filterPeriod)?.name}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground truncate">Todos los períodos</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Button
            id="tour-pf-tickets-boton"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={startTour}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button id="tour-pf-tickets-nuevo" size="sm" className="gap-1.5 h-8">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo ticket</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Ticket de Soporte</DialogTitle>
            </DialogHeader>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                El equipo de soporte revisará tu solicitud y responderá a la
                brevedad posible.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  value={newTicket.title}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, title: e.target.value })
                  }
                  placeholder="Describe brevemente el problema"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Categoría *</label>
                  <Select
                    value={newTicket.category_id}
                    onValueChange={(v) =>
                      setNewTicket({ ...newTicket, category_id: v })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Prioridad *</label>
                  <Select
                    value={newTicket.priority_id}
                    onValueChange={(v) =>
                      setNewTicket({ ...newTicket, priority_id: v })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descripción *</label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                  placeholder="Describe el problema con el mayor detalle posible..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={handleCreateTicket}
                disabled={creating}
                className="w-full gap-2"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar Solicitud
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-5">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">

          {/* ── Lista ── */}
          <div
            id="tour-pf-tickets-lista"
            className={`${mobileView === "detail" ? "hidden" : "flex"} lg:flex flex-col lg:col-span-1`}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Mis solicitudes
                  <span className="ml-auto text-xs font-normal bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                    {filtered.length}
                  </span>
                </CardTitle>
                <div id="tour-pf-tickets-filtros" className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-8 text-sm"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      {statuses.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {periods.length > 0 && (
                    <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                      <SelectTrigger className="h-8 text-xs">
                        <CalendarDays className="w-3 h-3 mr-1 text-muted-foreground" />
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los períodos</SelectItem>
                        {periods.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                            {p.is_active && (
                              <span className="ml-1.5 text-[10px] text-green-600 font-semibold">
                                ● activo
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                    <Inbox className="w-8 h-8 opacity-40" />
                    <p className="text-xs">Sin tickets aún</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-0.5">
                    {filtered.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => { setSelected(ticket); setMobileView("detail"); }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selected?.id === ticket.id
                            ? "bg-primary/5 border-primary/30 shadow-sm"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        {ticket.priority?.color && (
                          <div
                            className="h-0.5 w-full rounded-full mb-2"
                            style={{ backgroundColor: ticket.priority.color }}
                          />
                        )}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="font-medium text-sm line-clamp-1 flex-1">
                            {ticket.title}
                          </p>
                          {ticket.priority && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                              style={{
                                backgroundColor: ticket.priority.color
                                  ? `${ticket.priority.color}20`
                                  : undefined,
                                color: ticket.priority.color ?? undefined,
                              }}
                            >
                              {ticket.priority.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {ticket.category && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              {ticket.category.name}
                            </Badge>
                          )}
                          {ticket.status && (
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ml-auto"
                              style={{
                                backgroundColor: ticket.status.color
                                  ? `${ticket.status.color}20`
                                  : undefined,
                                color: ticket.status.color ?? undefined,
                              }}
                            >
                              {ticket.status.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(ticket.created_at)}
                          </span>
                          <span className="font-mono">{ticket.code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Detalle ── */}
          <div
            id="tour-pf-tickets-detalle"
            className={`${mobileView === "list" ? "hidden" : "flex"} lg:flex flex-col lg:col-span-2`}
          >
            {!selected ? (
              <Card className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center space-y-2">
                  <TicketCheck className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm">Selecciona un ticket para ver el detalle</p>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col">
                <CardHeader className="pb-3 border-b">
                  {/* Botón volver — solo móvil */}
                  <button
                    onClick={() => setMobileView("list")}
                    className="lg:hidden flex items-center gap-2 text-sm text-primary font-medium mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a tickets
                  </button>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">
                      {selected.code}
                    </span>
                    {selected.category && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        {selected.category.name}
                      </Badge>
                    )}
                    {selected.status && (
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full ml-auto"
                        style={{
                          backgroundColor: selected.status.color
                            ? `${selected.status.color}20`
                            : undefined,
                          color: selected.status.color ?? undefined,
                        }}
                      >
                        {selected.status.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base leading-tight">
                    {selected.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(selected.created_at)}
                    </span>
                    {selected.priority && (
                      <span
                        className="px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          backgroundColor: selected.priority.color
                            ? `${selected.priority.color}20`
                            : undefined,
                          color: selected.priority.color ?? undefined,
                        }}
                      >
                        {selected.priority.name}
                      </span>
                    )}
                    {selected.status?.is_closed && (
                      <span className="text-muted-foreground italic">· Cerrado</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  <div className="p-4 bg-muted/40 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.description ?? "Sin descripción"}
                  </div>

                  {selected.status?.is_closed && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border text-xs text-muted-foreground">
                      <Info className="w-4 h-4 shrink-0" />
                      Este ticket está cerrado. Crea uno nuevo si el problema persiste.
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      Conversación
                      {comments.length > 0 && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {comments.length}
                        </span>
                      )}
                    </h4>

                    {loadingComments ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6 bg-muted/30 rounded-lg">
                        Sin respuestas aún — el equipo de soporte responderá pronto
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {comments.map((c) => (
                          <div key={c.id} className="flex gap-3">
                            <Avatar className="w-7 h-7 shrink-0">
                              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                {initials(c.author?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="bg-background border rounded-xl px-3 py-2.5">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-medium text-xs">
                                    {c.author?.full_name ?? "Soporte"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground shrink-0">
                                    {formatDate(c.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed">{c.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {!selected.status?.is_closed && (
                    <div className="space-y-2 pt-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe un comentario o agrega más información..."
                        rows={3}
                        className="resize-none text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                            handleSendComment();
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground">
                          Ctrl + Enter para enviar
                        </p>
                        <Button
                          onClick={handleSendComment}
                          disabled={sendingComment || !newComment.trim()}
                          size="sm"
                          className="gap-2"
                        >
                          {sendingComment ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Enviar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
