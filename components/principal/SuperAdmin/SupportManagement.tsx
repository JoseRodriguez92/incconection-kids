"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  MessageSquare,
  Clock,
  AlertCircle,
  Plus,
  Send,
  Loader2,
  Inbox,
} from "lucide-react"
import { InstituteStore } from "@/Stores/InstituteStore"
import { toast } from "sonner"
import type { Database } from "@/src/types/database.types"

// ── Tipos ────────────────────────────────────────────────────────
type TicketStatus   = Database["public"]["Tables"]["ticket_status"]["Row"]
type TicketPriority = Database["public"]["Tables"]["ticket_priority"]["Row"]
type TicketCategory = Database["public"]["Tables"]["ticket_category"]["Row"]

type TicketComment = Database["public"]["Tables"]["ticket_comment"]["Row"] & {
  author?: { full_name: string | null; email: string | null } | null
}

type Ticket = Database["public"]["Tables"]["ticket"]["Row"] & {
  status?:   TicketStatus | null
  priority?: TicketPriority | null
  category?: TicketCategory | null
  reporter?: { full_name: string | null; email: string | null } | null
  assignee?: { full_name: string | null; email: string | null } | null
}

const supabase = createClient()

function initials(name?: string | null) {
  if (!name) return "?"
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ── Componente ───────────────────────────────────────────────────
export default function SupportManagement() {
  const { institute } = InstituteStore()

  const [tickets,         setTickets]         = useState<Ticket[]>([])
  const [selected,        setSelected]        = useState<Ticket | null>(null)
  const [comments,        setComments]        = useState<TicketComment[]>([])
  const [statuses,        setStatuses]        = useState<TicketStatus[]>([])
  const [priorities,      setPriorities]      = useState<TicketPriority[]>([])
  const [categories,      setCategories]      = useState<TicketCategory[]>([])
  const [loading,         setLoading]         = useState(true)
  const [loadingComments, setLoadingComments] = useState(false)
  const [sendingComment,  setSendingComment]  = useState(false)
  const [creating,        setCreating]        = useState(false)
  const [newComment,      setNewComment]      = useState("")
  const [searchTerm,      setSearchTerm]      = useState("")
  const [filterStatus,    setFilterStatus]    = useState("todos")
  const [filterCategory,  setFilterCategory]  = useState("todos")
  const [dialogOpen,      setDialogOpen]      = useState(false)
  const [currentUserId,   setCurrentUserId]   = useState<string | null>(null)
  const [newTicket, setNewTicket] = useState({
    title: "", description: "", category_id: "", priority_id: "",
  })

  // Usuario actual
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [])

  // Catálogos
  useEffect(() => {
    Promise.all([
      supabase.from("ticket_status").select("*").order("sort_order"),
      supabase.from("ticket_priority").select("*").order("sort_order"),
      supabase.from("ticket_category").select("*").order("name"),
    ]).then(([s, p, c]) => {
      if (s.data) setStatuses(s.data)
      if (p.data) setPriorities(p.data)
      if (c.data) setCategories(c.data)
    })
  }, [])

  // Tickets
  const fetchTickets = useCallback(async () => {
    if (!institute?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("ticket")
        .select(`
          *,
          status:status_id(id, name, color, is_closed, sort_order, created_at),
          priority:priority_id(id, name, color, sort_order, created_at),
          category:category_id(id, name, description, created_at),
          reporter:reported_by(full_name, email),
          assignee:assigned_to(full_name, email)
        `)
        .eq("institute_id", institute.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      const rows = (data ?? []) as unknown as Ticket[]
      setTickets(rows)
      if (rows.length > 0) setSelected(prev => prev ? (rows.find(t => t.id === prev.id) ?? rows[0]) : rows[0])
    } catch {
      toast.error("Error al cargar tickets")
    } finally {
      setLoading(false)
    }
  }, [institute?.id])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  // Comentarios
  useEffect(() => {
    if (!selected) return
    setLoadingComments(true)
    supabase
      .from("ticket_comment")
      .select("*, author:author_id(full_name, email)")
      .eq("ticket_id", selected.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setComments((data as TicketComment[]) ?? [])
        setLoadingComments(false)
      })
  }, [selected?.id])

  // ── Acciones ──────────────────────────────────────────────────
  const handleSendComment = async () => {
    if (!newComment.trim() || !selected || !currentUserId) return
    setSendingComment(true)
    try {
      const { error } = await supabase.from("ticket_comment").insert({
        ticket_id: selected.id,
        author_id: currentUserId,
        comment: newComment.trim(),
        is_internal: false,
      })
      if (error) throw error
      setNewComment("")
      const { data } = await supabase
        .from("ticket_comment")
        .select("*, author:author_id(full_name, email)")
        .eq("ticket_id", selected.id)
        .order("created_at", { ascending: true })
      setComments((data as TicketComment[]) ?? [])
      toast.success("Comentario enviado")
    } catch {
      toast.error("Error al enviar comentario")
    } finally {
      setSendingComment(false)
    }
  }

  const handleChangeStatus = async (statusId: string) => {
    if (!selected) return
    const status = statuses.find(s => s.id === statusId)
    try {
      const { error } = await supabase.from("ticket").update({
        status_id: statusId,
        closed_at: status?.is_closed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("id", selected.id)
      if (error) throw error
      const updated = { ...selected, status_id: statusId, status }
      setSelected(updated)
      setTickets(prev => prev.map(t => t.id === selected.id ? updated : t))
      toast.success("Estado actualizado")
    } catch {
      toast.error("Error al cambiar estado")
    }
  }

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description || !newTicket.category_id || !newTicket.priority_id) {
      toast.error("Completa todos los campos")
      return
    }
    if (!institute?.id || !currentUserId) return
    setCreating(true)
    const openStatus = statuses
      .filter(s => !s.is_closed)
      .sort((a, b) => a.sort_order - b.sort_order)[0]
    if (!openStatus) { toast.error("Sin estados disponibles"); setCreating(false); return }
    try {
      const code = `TKT-${Date.now().toString().slice(-6)}`
      const { error } = await supabase.from("ticket").insert({
        title:       newTicket.title,
        description: newTicket.description,
        category_id: newTicket.category_id,
        priority_id: newTicket.priority_id,
        status_id:   openStatus.id,
        institute_id: institute.id,
        reported_by:  currentUserId,
        code,
      })
      if (error) throw error
      toast.success("Ticket creado")
      setNewTicket({ title: "", description: "", category_id: "", priority_id: "" })
      setDialogOpen(false)
      await fetchTickets()
    } catch {
      toast.error("Error al crear ticket")
    } finally {
      setCreating(false)
    }
  }

  // Filtros
  const filtered = tickets.filter(t => {
    const s = searchTerm.toLowerCase()
    const matchSearch =
      t.title.toLowerCase().includes(s) ||
      (t.description ?? "").toLowerCase().includes(s) ||
      (t.reporter?.full_name ?? "").toLowerCase().includes(s) ||
      t.code.toLowerCase().includes(s)
    return matchSearch &&
      (filterStatus   === "todos" || t.status_id   === filterStatus) &&
      (filterCategory === "todos" || t.category_id === filterCategory)
  })

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Soporte y Ayuda</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  value={newTicket.title}
                  onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Describe brevemente el problema"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Categoría *</label>
                  <Select value={newTicket.category_id} onValueChange={v => setNewTicket({ ...newTicket, category_id: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Prioridad *</label>
                  <Select value={newTicket.priority_id} onValueChange={v => setNewTicket({ ...newTicket, priority_id: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {priorities.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descripción *</label>
                <Textarea
                  value={newTicket.description}
                  onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Describe el problema con detalle..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              <Button onClick={handleCreateTicket} disabled={creating} className="w-full gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Crear Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Lista ── */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Tickets
                <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {filtered.length}
                </span>
              </CardTitle>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Categoría" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-1">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                  <Inbox className="w-8 h-8 opacity-40" />
                  <p className="text-xs">Sin tickets</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-0.5">
                  {filtered.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelected(ticket)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selected?.id === ticket.id
                          ? "bg-primary/5 border-primary/30 shadow-sm"
                          : "hover:bg-muted/50 hover:border-border/80"
                      }`}
                    >
                      {/* Franja prioridad */}
                      {ticket.priority?.color && (
                        <div
                          className="h-0.5 w-full rounded-full mb-2 -mt-0.5"
                          style={{ backgroundColor: ticket.priority.color }}
                        />
                      )}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="font-medium text-sm line-clamp-1 flex-1">{ticket.title}</p>
                        {ticket.priority && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                            style={{
                              backgroundColor: ticket.priority.color ? `${ticket.priority.color}20` : undefined,
                              color: ticket.priority.color ?? undefined,
                            }}
                          >
                            {ticket.priority.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground truncate">
                          {ticket.reporter?.full_name ?? "—"}
                        </span>
                        {ticket.status && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: ticket.status.color ? `${ticket.status.color}20` : undefined,
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
        <div className="lg:col-span-2">
          {!selected ? (
            <Card className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm">Selecciona un ticket</p>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">{selected.code}</span>
                    {selected.category && (
                      <Badge variant="outline" className="text-[10px] h-5">{selected.category.name}</Badge>
                    )}
                  </div>
                  <Select value={selected.status_id} onValueChange={handleChangeStatus}>
                    <SelectTrigger className="w-36 h-8 text-xs shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <h3 className="font-semibold text-base leading-tight">{selected.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{selected.reporter?.full_name ?? "—"}</span>
                  <span>·</span>
                  <span className="truncate">{selected.reporter?.email ?? "—"}</span>
                  {selected.priority && (
                    <span
                      className="px-2 py-0.5 rounded-full font-semibold text-[10px]"
                      style={{
                        backgroundColor: selected.priority.color ? `${selected.priority.color}20` : undefined,
                        color: selected.priority.color ?? undefined,
                      }}
                    >
                      {selected.priority.name}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 overflow-y-auto pt-4">
                {/* Descripción */}
                <div className="p-4 bg-muted/40 rounded-xl border text-sm leading-relaxed">
                  <p className="whitespace-pre-wrap">{selected.description ?? "Sin descripción"}</p>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Creado el {formatDate(selected.created_at)}
                  </p>
                </div>

                {/* Comentarios */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    Comentarios
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
                      Sin comentarios aún
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                          <Avatar className="w-7 h-7 shrink-0">
                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                              {initials(c.author?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="bg-background border rounded-xl px-3 py-2.5">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-medium text-xs">{c.author?.full_name ?? "—"}</span>
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

                {/* Responder */}
                <div className="space-y-2 pt-1">
                  <Textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    rows={3}
                    className="resize-none text-sm"
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendComment()
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">Ctrl + Enter para enviar</p>
                    <Button
                      onClick={handleSendComment}
                      disabled={sendingComment || !newComment.trim()}
                      size="sm"
                      className="gap-2"
                    >
                      {sendingComment
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Send className="w-3.5 h-3.5" />}
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
